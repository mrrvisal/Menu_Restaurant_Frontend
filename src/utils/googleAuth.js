// frontend/src/utils/googleAuth.js
// Google sign-in WITHOUT the Google Identity Services button widget.
//
// Why not google.accounts.id.renderButton()? Google draws that button inside
// its own <iframe> and silently swaps it for the "personalized button"
// (avatar + name + email) as soon as the browser has an approved Google
// session — there is NO option to force the plain rendering. Building the
// consent URL ourselves keeps the button's look100% ours and always shows
// the account chooser (prompt=select_account).
//
// Flow: custom button → popup → Google consent → /auth/google/callback
// (our SPA) → postMessage(id_token) back to the opener window.
// If the popup is blocked we fall back to a full-page redirect; the callback
// then parks the token in sessionStorage and the login/register page picks it
// up on mount (takePendingGoogleCredential()).
//
// The ID token is still a normal Google ID token, so the backend endpoint
// POST /api/auth/google verifies it unchanged.

const OAUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const CALLBACK_PATH = "/auth/google/callback";
const MSG_TYPE = "google_oauth_credential";

// sessionStorage key used ONLY by the popup-blocked redirect fallback
export const PENDING_CREDENTIAL_KEY = "google_pending_credential";
// sessionStorage key holding the nonce of the CURRENT consent request (used by
// the redirect fallback, where the callback runs in the same tab)
const NONCE_KEY = "google_oauth_nonce";

function clientId() {
  return (import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();
}

// Google REQUIRES a nonce for response_type=id_token ("Error 400: invalid_request
// — Nonce required for response_type id_token"). It comes back inside the ID
// token as the `nonce` claim, which lets us detect an injected/replayed token.
function randomNonce() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function decodeJwtPayload(jwt) {
  try {
    const part = String(jwt).split(".")[1] || "";
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

// True when the ID token carries the nonce we sent. Returns true when no
// nonce is expected (older tokens / One Tap, which Google handles itself).
export function verifyGoogleNonce(token, expectedNonce) {
  if (!expectedNonce) return true;
  const payload = decodeJwtPayload(token);
  return !!payload && payload.nonce === expectedNonce;
}

// Same check for the redirect fallback (same tab → nonce is in sessionStorage)
export function takeStoredNonce() {
  try {
    const n = sessionStorage.getItem(NONCE_KEY);
    if (n) sessionStorage.removeItem(NONCE_KEY);
    return n || null;
  } catch (e) {
    return null;
  }
}

// Only same-site paths may be used as the post-sign-in return target
// (state comes back from Google unmodified — never allow an open redirect).
export function safeReturnPath(path) {
  const p = String(path || "");
  if (!p.startsWith("/") || p.startsWith("//") || p.includes("\\")) return "/login";
  return p;
}

export function buildAuthUrl(returnPath = "/login", nonce = randomNonce()) {
  // The redirect fallback comes back to THIS tab, so remember the nonce there
  // (the popup flow keeps it in memory instead and checks the token itself).
  try {
    sessionStorage.setItem(NONCE_KEY, nonce);
  } catch (e) {
    /* storage disabled — nonce check will be skipped for the redirect flow */
  }
  const params = new URLSearchParams({
    client_id: clientId(),
    redirect_uri: getRedirectUri(),
    response_type: "id_token", // OpenID Connect implicit flow → JWT id_token
    scope: "openid email profile",
    prompt: "select_account", // always show the account chooser
    nonce, // REQUIRED by Google for id_token responses
    state: safeReturnPath(returnPath),
  });
  return `${OAUTH_ENDPOINT}?${params.toString()}`;
}

// The single URL that MUST be listed under "Authorized redirect URIs" in the
// Google Cloud Console OAuth client — otherwise Google answers with
// "Error 400: redirect_uri_mismatch" and sign-in can never complete.
export function getRedirectUri() {
  return `${window.location.origin}${CALLBACK_PATH}`;
}

// Called by /auth/google/callback when it could NOT reach the opener window
// (popup blocked → full-page redirect fallback).
export function parkPendingGoogleCredential(token) {
  try {
    sessionStorage.setItem(PENDING_CREDENTIAL_KEY, token);
  } catch (e) {
    /* storage full/disabled — sign-in will just silently not continue */
  }
}

// Called by the login/register view on mount. Returns the parked token once,
// then clears it so it can never be replayed on a later visit.
export function takePendingGoogleCredential() {
  try {
    const token = sessionStorage.getItem(PENDING_CREDENTIAL_KEY);
    if (token) sessionStorage.removeItem(PENDING_CREDENTIAL_KEY);
    return token || null;
  } catch (e) {
    return null;
  }
}

// ─── Fallback: Google One Tap (needs only the JavaScript origin) ───────────
// The popup flow above also needs the callback URL to be listed under
// "Authorized redirect URIs". Google One Tap uses the GIS library and only
// requires the *origin* (which is already authorized, since the old button
// worked), so it keeps Google sign-in usable while the redirect URI is missing.
export function signInWithOneTap() {
  if (!clientId()) return Promise.reject(new Error("missing_client_id"));

  return new Promise((resolve, reject) => {
    let settled = false;

    function done(fn, value) {
      if (settled) return;
      settled = true;
      fn(value);
    }

    loadGsi()
      .then(() => {
        if (!window.google?.accounts?.id) {
          done(reject, new Error("gsi_unavailable"));
          return;
        }
        window.google.accounts.id.initialize({
          client_id: clientId(),
          callback: (response) => {
            if (response?.credential) done(resolve, response.credential);
            else done(reject, new Error("no_credential"));
          },
          // FedCM keeps One Tap working when third-party cookies are blocked
          use_fedcm_for_prompt: true,
        });
        window.google.accounts.id.prompt((notification) => {
          // Only react to "could not be shown" moments — a dismissal is the
          // user's own choice and must stay silent.
          if (notification?.isNotDisplayed?.()) {
            done(reject, new Error(notification.getNotDisplayedReason?.() || "not_displayed"));
          } else if (notification?.isSkippedMoment?.()) {
            done(reject, new Error(notification.getSkippedReason?.() || "skipped"));
          }
        });
      })
      .catch((err) => done(reject, err));
  });
}

let gsiPromise = null;
function loadGsi() {
  if (window.google && window.google.accounts && window.google.accounts.id)
    return Promise.resolve();
  if (gsiPromise) return gsiPromise;
  gsiPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = () => {
      gsiPromise = null;
      reject(new Error("gsi_script_failed"));
    };
    document.head.appendChild(script);
  });
  return gsiPromise;
}

// Opens the Google consent page in a popup and resolves with the ID token.
// Rejects with:
//   "missing_client_id" — VITE_GOOGLE_CLIENT_ID not configured
//   "popup_blocked"     — caller should fall back to buildAuthUrl() redirect
//   "popup_closed"      — user closed the popup (not an error)
//   anything else       — Google returned an error (e.g. access_denied)
export function signInWithGoogle({ returnPath } = {}) {
  if (!clientId()) return Promise.reject(new Error("missing_client_id"));

  // Google requires a nonce for id_token; remember it to verify the token
  // that comes back (see verifyGoogleNonce).
  const nonce = randomNonce();
  const url = buildAuthUrl(returnPath, nonce);

  return new Promise((resolve, reject) => {
    let settled = false;
    let poll = null;
    let win = null;

    function cleanup() {
      window.removeEventListener("message", onMessage);
      if (poll) clearInterval(poll);
      try {
        if (win && !win.closed) win.close();
      } catch (e) {
        /* already gone */
      }
    }

    function finish(fn, value) {
      if (settled) return;
      settled = true;
      cleanup();
      fn(value);
    }

    function onMessage(event) {
      // Only accept same-origin messages carrying our type tag.
      if (event.origin !== window.location.origin) return;
      const data = event.data || {};
      if (data.type !== MSG_TYPE) return;
      if (data.token) {
        // The nonce we sent must be inside the token we got back.
        if (!verifyGoogleNonce(data.token, nonce)) {
          finish(reject, new Error("nonce_mismatch"));
          return;
        }
        finish(resolve, data.token);
      } else {
        finish(reject, new Error(data.error || "google_signin_failed"));
      }
    }

    window.addEventListener("message", onMessage);

    win = window.open(
      url,
      "google_oauth_signin",
      "width=520,height=640,menubar=no,toolbar=no,location=no,status=no"
    );

    if (!win || win.closed) {
      // Popup blocked — hand the redirect fallback to the caller.
      finish(reject, new Error("popup_blocked"));
      return;
    }

    // Detect "user closed the popup without finishing".
    poll = setInterval(() => {
      if (win.closed) finish(reject, new Error("popup_closed"));
    }, 400);
  });
}
