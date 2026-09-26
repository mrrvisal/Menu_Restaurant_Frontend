<template>
  <div class="page">
    <div class="box">
      <span class="spinner" aria-hidden="true"></span>
      <p>{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
// GoogleAuthCallback.vue — the OAuth redirect target (/auth/google/callback).
//
// It never renders real UI for long. Two cases:
//  1. Opened as a POPUP by GoogleSignInButton → postMessage the ID token to
//     the opener window (same origin) and close this window.
//  2. Full-page redirect (popup was blocked) → park the token in
//     sessionStorage and go back to `state`, where the login/register view
//     picks it up on mount.
//
// The token itself is verified by the backend (POST /api/auth/google) —
// never trusted on the client.
import { ref, onMounted } from "vue";
import {
  parkPendingGoogleCredential,
  safeReturnPath,
  takeStoredNonce,
  verifyGoogleNonce,
} from "@/utils/googleAuth";

const message = ref("Signing in with Google…");

function hasOpenOpener() {
  try {
    return Boolean(window.opener) && !window.opener.closed;
  } catch (e) {
    return false; // cross-origin opener can throw — treat as no opener
  }
}

function finishInPopup(payload) {
  window.opener.postMessage(
    { type: "google_oauth_credential", ...payload },
    window.location.origin
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
  for (const [k, v] of new URLSearchParams(window.location.search))
    params.set(k, v);

  const token = params.get("id_token");
  const error = params.get("error");
  const returnPath = safeReturnPath(params.get("state"));

  if (hasOpenOpener()) {
    if (token) finishInPopup({ token });
    else finishInPopup({ error: error || "access_denied" });
    return;
  }

  // No opener → redirect fallback flow.
  if (token) {
    // Verify the nonce we stored in THIS tab before navigating to Google.
    if (verifyGoogleNonce(token, takeStoredNonce())) {
      parkPendingGoogleCredential(token);
    } else {
      console.error("[GoogleSignIn] nonce mismatch — token ignored");
    }
    window.location.replace(returnPath);
    return;
  }
  // Cancelled / errored — go back quietly, the view shows its normal form.
  window.location.replace(returnPath);
});
</script>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0fdf4;
  font-family: system-ui, -apple-system, sans-serif;
}
.box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  color: #14532d;
  text-align: center;
  padding: 20px;
}
.spinner {
  width: 34px;
  height: 34px;
  border: 3px solid #bbf7d0;
  border-top-color: #16a34a;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
p {
  margin: 0;
  font-size: 15px;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
