// Google sign-in helper using custom popup flow with redirect fallback and One Tap support

const OAUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const CALLBACK_PATH = "/auth/google/callback";
const MSG_TYPE = "google_oauth_credential";

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
    prompt: "select_account",
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

// Opens Google consent page in a popup and resolves with the ID token
export function signInWithGoogle({ returnPath } = {}) {
  if (!clientId()) return Promise.reject(new Error("missing_client_id"));

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
        // Window already closed
      }
    }

    function finish(fn, value) {
      if (settled) return;
      settled = true;
      cleanup();
      fn(value);
    }

    function onMessage(event) {
      if (event.origin !== window.location.origin) return;
      const data = event.data || {};
      if (data.type !== MSG_TYPE) return;
      if (data.token) {
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
      "width=520,height=640,menubar=no,toolbar=no,location=no,status=no",
    );

    if (!win || win.closed) {
      finish(reject, new Error("popup_blocked"));
      return;
    }

    poll = setInterval(() => {
      if (win.closed) finish(reject, new Error("popup_closed"));
    }, 400);
  });
}
