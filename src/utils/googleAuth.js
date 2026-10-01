// Google sign-in helper using custom popup flow with redirect fallback and One Tap support

const OAUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const CALLBACK_PATH = "/auth/google/callback";
const MSG_TYPE = "google_oauth_credential";

// `window.name` survives cross-origin navigations (and COOP), so it is the
// only reliable way for the callback page to know it is running inside the
// sign-in popup and not in a full-page redirect (where it must redirect back).
export const POPUP_WINDOW_NAME = "google_oauth_signin";
// Storage channel used to hand the result back when Chrome's Cross-Origin-
// Opener-Policy has severed the popup↔opener link (`window.opener` is null, so
// postMessage can never reach the app). localStorage + its `storage` event
// still work between same-origin tabs.
const POPUP_RESULT_KEY = "google_popup_result";

// Writes the popup's result where the app (opener tab) can pick it up.
export function relayPopupResult(payload) {
  try {
    localStorage.setItem(
      POPUP_RESULT_KEY,
      JSON.stringify({ type: MSG_TYPE, ...payload, ts: Date.now() }),
    );
  } catch (e) {
    // Storage disabled — the popup can only show its own status message
  }
}

export const PENDING_CREDENTIAL_KEY = "google_pending_credential";
const NONCE_KEY = "google_oauth_nonce";

function clientId() {
  return (import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();
}

// Generates a cryptographically random nonce required by Google for response_type=id_token
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

// Verifies that the returned ID token contains the expected nonce
export function verifyGoogleNonce(token, expectedNonce) {
  if (!expectedNonce) return true;
  const payload = decodeJwtPayload(token);
  return !!payload && payload.nonce === expectedNonce;
}

// Retrieves and removes the stored nonce for redirect fallback in the same tab
export function takeStoredNonce() {
  try {
    const n = sessionStorage.getItem(NONCE_KEY);
    if (n) sessionStorage.removeItem(NONCE_KEY);
    return n || null;
  } catch (e) {
    return null;
  }
}

// Restricts post-sign-in redirect targets to safe same-site paths
export function safeReturnPath(path) {
  const p = String(path || "");
  if (!p.startsWith("/") || p.startsWith("//") || p.includes("\\"))
    return "/login";
  return p;
}

export function buildAuthUrl(returnPath = "/login", nonce = randomNonce()) {
  try {
    sessionStorage.setItem(NONCE_KEY, nonce);
  } catch (e) {
    // Nonce verification will be skipped if storage is unavailable
  }
  const params = new URLSearchParams({
    client_id: clientId(),
    redirect_uri: getRedirectUri(),
    response_type: "id_token",
    scope: "openid email profile",
    // Two-step sign-in: 1) Google first asks WHICH account (select_account),
    // 2) then shows its confirmation/consent screen (consent) that spells out
    // what is shared with the app — the "policy"-style page. `consent` is
    // forced on EVERY sign-in; drop the word to only show it the first time
    // an account authorises the app.
    prompt: "select_account consent",
    nonce,
    state: safeReturnPath(returnPath),
  });
  return `${OAUTH_ENDPOINT}?${params.toString()}`;
}

export function getRedirectUri() {
  return `${window.location.origin}${CALLBACK_PATH}`;
}

// Stores token in sessionStorage when popup fails and full-page redirect is used
export function parkPendingGoogleCredential(token) {
  try {
    sessionStorage.setItem(PENDING_CREDENTIAL_KEY, token);
  } catch (e) {
    // Silent fail if storage is full or disabled
  }
}

// Consumes and clears the pending token on view mount
export function takePendingGoogleCredential() {
  try {
    const token = sessionStorage.getItem(PENDING_CREDENTIAL_KEY);
    if (token) sessionStorage.removeItem(PENDING_CREDENTIAL_KEY);
    return token || null;
  } catch (e) {
    return null;
  }
}

// Google One Tap fallback (FedCM enabled)
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
          use_fedcm_for_prompt: true,
        });
        window.google.accounts.id.prompt((notification) => {
          if (notification?.isNotDisplayed?.()) {
            done(
              reject,
              new Error(
                notification.getNotDisplayedReason?.() || "not_displayed",
              ),
            );
          } else if (notification?.isSkippedMoment?.()) {
            done(
              reject,
              new Error(notification.getSkippedReason?.() || "skipped"),
            );
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

// Opens Google consent page in a popup and resolves with the ID token.
//
// Closure detection never polls `popup.closed`: Chrome logs
// "Cross-Origin-Opener-Policy policy would block the window.closed call."
// on every read of a COOP-separated popup, and the value can't be trusted
// there anyway (same root cause as auth0-spa-js#1418). Instead the flow
// watches the opener window: once it regains focus after the popup took it,
// a short grace timer runs so an in-flight result can still land; focusing
// the popup again (opener blurs) cancels that verdict.
export function signInWithGoogle({ returnPath } = {}) {
  if (!clientId()) return Promise.reject(new Error("missing_client_id"));

  const nonce = randomNonce();
  const url = buildAuthUrl(returnPath, nonce);
  const CLOSE_GRACE_MS = 3000;

  return new Promise((resolve, reject) => {
    let settled = false;
    let win = null;
    let closeTimer = null;
    let maxTimer = null;
    let sawBlur = false;

    function cleanup() {
      window.removeEventListener("message", onMessage);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
      if (closeTimer) clearTimeout(closeTimer);
      if (maxTimer) clearTimeout(maxTimer);
      // `win.close()` is deliberately NOT called here: once the popup has been
      // through Google's COOP-separated pages, Chrome blocks (and logs) a
      // close() issued by the opener — "Cross-Origin-Opener-Policy policy
      // would block the window.close call." The callback page closes itself
      // (closeSoon) right after delivering the result, so the opener has
      // nothing to clean up.
    }

    function finish(fn, value) {
      if (settled) return;
      settled = true;
      cleanup();
      fn(value);
    }

    function handleResult(data, fromStorage) {
      if (data.token) {
        if (!verifyGoogleNonce(data.token, nonce)) {
          // A stale relay from an earlier flow must not fail THIS one
          if (fromStorage) return;
          finish(reject, new Error("nonce_mismatch"));
          return;
        }
        finish(resolve, data.token);
      } else {
        finish(reject, new Error(data.error || "google_signin_failed"));
      }
    }

    // Primary channel: the callback page posts to its `window.opener`.
    function onMessage(event) {
      if (event.origin !== window.location.origin) return;
      const data = event.data || {};
      if (data.type !== MSG_TYPE) return;
      handleResult(data, false);
    }

    // Fallback channel: the callback page relays through localStorage when
    // COOP left the popup without an opener.
    function onStorage(event) {
      if (settled || event.key !== POPUP_RESULT_KEY || !event.newValue) return;
      let data = null;
      try {
        localStorage.removeItem(POPUP_RESULT_KEY);
        data = JSON.parse(event.newValue);
      } catch (e) {
        return;
      }
      if (!data || data.type !== MSG_TYPE) return;
      if (data.ts && Date.now() - data.ts > 5 * 60 * 1000) return;
      handleResult(data, true);
    }

    function onBlur() {
      sawBlur = true;
      if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }
    }

    function onFocus() {
      if (settled || !sawBlur) return;
      if (closeTimer) clearTimeout(closeTimer);
      closeTimer = setTimeout(
        () => finish(reject, new Error("popup_closed")),
        CLOSE_GRACE_MS,
      );
    }

    window.addEventListener("message", onMessage);
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);

    win = window.open(
      url,
      POPUP_WINDOW_NAME,
      "width=520,height=640,menubar=no,toolbar=no,location=no,status=no",
    );

    if (!win) {
      finish(reject, new Error("popup_blocked"));
      return;
    }

    // Safety net: if the opener never regains focus (popup closed while
    // another app was in the foreground) don't leave the caller hanging.
    maxTimer = setTimeout(
      () => finish(reject, new Error("popup_closed")),
      3 * 60 * 1000,
    );
  });
}
