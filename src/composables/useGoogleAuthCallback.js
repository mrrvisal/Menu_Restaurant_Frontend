import { onMounted, ref } from "vue";
import {
  parkPendingGoogleCredential,
  safeReturnPath,
  takeStoredNonce,
  verifyGoogleNonce,
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

  function finishInPopup(payload) {
    window.opener.postMessage(
      { type: "google_oauth_credential", ...payload },
      window.location.origin,
    );
    message.value = payload.token
      ? "Signed in! You can close this window."
      : "Sign-in cancelled. You can close this window.";
    setTimeout(() => {
      try {
        window.close();
      } catch (e) {
        /* browser may keep it open — the message is already delivered */
      }
    }, 400);
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

    if (hasOpenOpener()) {
      if (token) finishInPopup({ token });
      else finishInPopup({ error: error || "access_denied" });
      return;
    }

    if (token) {
      if (verifyGoogleNonce(token, takeStoredNonce())) {
        parkPendingGoogleCredential(token);
      } else {
        console.error("[GoogleSignIn] nonce mismatch — token ignored");
      }
      window.location.replace(returnPath);
      return;
    }
    window.location.replace(returnPath);
  });

  return message;
}
