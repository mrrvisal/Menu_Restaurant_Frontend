<template>
  <div v-if="clientId" class="gsi-wrap">
    <!--
      Custom "Continue with Google" circle button (matches the design mock:
      a plain circle with the Google G logo). We render the button ourselves
      instead of using google.accounts.id.renderButton(), because that widget
      is drawn inside Google's <iframe> and gets replaced by the
      "personalized button" (avatar + name + email) whenever the browser has
      an approved Google session — with no way to force the plain look.
      The click opens the Google consent page in a popup; the returned ID
      token is emitted as @credential (same contract as before, so all views
      and the backend work unchanged).
    -->
    <button
      type="button"
      class="google-btn"
      :disabled="busy"
      aria-label="Continue with Google"
      title="Continue with Google"
      @click="signIn"
    >
      <svg class="g-logo" viewBox="0 0 48 48" aria-hidden="true">
        <path
          fill="#EA4335"
          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
        />
        <path
          fill="#4285F4"
          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
        />
        <path
          fill="#FBBC05"
          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
        />
        <path
          fill="#34A853"
          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
        />
      </svg>
    </button>
    <p v-if="hint" class="gsi-hint">{{ hint }}</p>
  </div>
</template>

<script setup>
// GoogleSignInButton.vue — custom circular "Continue with Google" button.
// If VITE_GOOGLE_CLIENT_ID is not configured the button stays hidden.
//
// Emits: @credential (Google ID token) — exactly as before, so the backend
// endpoint /api/auth/google needs no change.
//       @error — real failures only (closing the popup yourself is silent).
import { ref } from "vue";
import { useI18nStore } from "@/stores/i18n";
import {
  signInWithGoogle,
  signInWithOneTap,
  buildAuthUrl,
  getRedirectUri,
} from "@/utils/googleAuth";

const i18n = useI18nStore();
const emit = defineEmits(["credential", "error"]);

const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();
const busy = ref(false);
const hint = ref("");

// Fallback used when the popup flow is refused by Google (in practice:
// redirect_uri_mismatch, because the callback URL isn't whitelisted yet in
// Google Cloud Console). One Tap only needs the JavaScript origin — which is
// already authorized — so sign-in still works.
async function fallbackToOneTap() {
  console.warn(
    `[GoogleSignIn] Popup flow refused — make sure this URL is listed under ` +
      `"Authorized redirect URIs" in Google Cloud Console:\n  ${getRedirectUri()}`
  );
  try {
    const token = await signInWithOneTap();
    emit("credential", token);
  } catch (err) {
    console.warn("[GoogleSignIn] One Tap unavailable:", err?.message);
    hint.value = import.meta.env.DEV
      ? `Google sign-in blocked. Add this URL in Google Cloud Console → Authorized redirect URIs: ${getRedirectUri()}`
      : i18n.t.google_unavailable;
  }
}

async function signIn() {
  if (busy.value) return;
  busy.value = true;
  hint.value = "";
  const startedAt = Date.now();
  // Come back to the exact page we're on (/login, /register, …).
  const returnPath = window.location.pathname + window.location.search;
  // Tell the developer exactly which redirect_uri is being sent — if Google
  // answers "redirect_uri_mismatch", the two strings don't match.
  console.log(
    `[GoogleSignIn] opening Google consent (client_id=${clientId.slice(0, 12)}…, redirect_uri=${getRedirectUri()})`
  );
  try {
    const token = await signInWithGoogle({ returnPath });
    emit("credential", token);
  } catch (err) {
    const code = err?.message;
    if (code === "popup_blocked") {
      // Popup blocked by the browser → full-page redirect fallback. The
      // callback view parks the token in sessionStorage and returns here,
      // where this page picks it up on mount.
      window.location.href = buildAuthUrl(returnPath);
      return; // page is navigating away
    }
    if (code === "popup_closed" && Date.now() - startedAt < 5000) {
      // Google refused the request (e.g. "Error 400: redirect_uri_mismatch")
      // and the user closed the error page → try One Tap instead.
      await fallbackToOneTap();
    } else if (code === "popup_closed" || code === "access_denied") {
      // User closed the popup / cancelled at Google — not an error.
      console.warn("[GoogleSignIn] sign-in cancelled:", code);
    } else {
      console.error("[GoogleSignIn]", err);
      emit("error", err);
    }
  } finally {
    busy.value = false;
  }
}
</script>

<style scoped>
.gsi-wrap {
  width: 100%;
  min-height: 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.gsi-hint {
  margin: 0;
  max-width: 320px;
  font-size: 12px;
  line-height: 1.45;
  color: #b91c1c;
  text-align: center;
  word-break: break-word;
}
.google-btn {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: #fff;
  border: 1px solid #dadce0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition:
    box-shadow 0.15s ease,
    border-color 0.15s ease,
    transform 0.1s ease;
}
.google-btn:hover {
  border-color: #c6c6c6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}
.google-btn:active {
  transform: scale(0.96);
}
.google-btn:disabled {
  opacity: 0.6;
  cursor: default;
  box-shadow: none;
}
.g-logo {
  width: 26px;
  height: 26px;
  display: block;
}
</style>

