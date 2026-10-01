import { onMounted, ref } from "vue";
import {
  parkPendingGoogleCredential,
  relayPopupResult,
  safeReturnPath,
  takeStoredNonce,
  verifyGoogleNonce,
  POPUP_WINDOW_NAME,
} from "@/utils/googleAuth";

export function useGoogleAuthCallback() {
  const message = ref("Signing in with Google…");

  function hasOpenOpener() {
    try {
      return Boolean(window.opener) && !window.opener.closed;
    } catch (e) {
      return false;
    }
  }

  function closeSoon() {
    setTimeout(() => {
      try {
        window.close();
      } catch (e) {
        /* browser may keep it open — the result is already delivered */
      }
    }, 400);
  }

  function toldUser(payload) {
    message.value = payload.token
      ? "Signed in! You can close this window."
      : "Sign-in cancelled. You can close this window.";
    closeSoon();
  }

  function finishInPopup(payload) {
    window.opener.postMessage(
      { type: "google_oauth_credential", ...payload },
      window.location.origin,
    );
    toldUser(payload);
  }

  // COOP can strip the popup of `window.opener` entirely (Chrome then also
  // refuses `opener.closed` — "Cross-Origin-Opener-Policy policy would block
  // the window.closed call."). postMessage is impossible; relay through
  // localStorage instead — the app listens for the `storage` event.
  function finishViaRelay(payload) {
    relayPopupResult(payload);
    toldUser(payload);
  }

  onMounted(() => {
    // Implicit flow returns results in the fragment; be lenient and also check
    // the query string (some error paths use it).
    const params = new URLSearchParams(window.location.hash.slice(1));
    for (const [key, value] of new URLSearchParams(window.location.search))
      params.set(key, value);

    const token = params.get("id_token");
    const error = params.get("error");
    const returnPath = safeReturnPath(params.get("state"));

    // Popup tabs keep the window.name given to them at window.open() across
    // the cross-origin round trip; a full-page redirect never has it. Never
    // navigate the popup to the app — deliver the result and let it close.
    if (window.name === POPUP_WINDOW_NAME) {
      const payload = token ? { token } : { error: error || "access_denied" };
      if (hasOpenOpener()) finishInPopup(payload);
      else finishViaRelay(payload);
      return;
    }

    // Full-page redirect mode: park the token in sessionStorage so the login
    // view can consume it after we redirect back to the app.
    if (token) {
      if (verifyGoogleNonce(token, takeStoredNonce())) {
        parkPendingGoogleCredential(token);
      } else {
        console.error("[GoogleSignIn] nonce mismatch — token ignored");
      }
    }
    window.location.replace(returnPath);
  });

  return message;
}
