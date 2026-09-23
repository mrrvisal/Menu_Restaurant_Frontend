<template>
  <div v-if="clientId" ref="btnWrap" class="gsi-wrap"></div>
</template>

<script setup>
// GoogleSignInButton.vue
// Renders the official "Sign in with Google" button (Google Identity Services)
// and emits the returned Google ID token via @credential.
// If VITE_GOOGLE_CLIENT_ID is not configured the button simply stays hidden.
//
// ── CUSTOMISATION (all props optional — defaults keep the original look) ──
//  type          'standard' | 'icon'                 (icon = Google logo only)
//  theme         'outline' | 'filled_blue' | 'filled_black'
//  size          'small' (20px) | 'medium' (32px) | 'large' (40px)
//  text          'signin_with' | 'signup_with' | 'continue_with' | 'signin'
//  shape         'rectangular' | 'pill' | 'circle' | 'square'
//  logoAlignment 'left' | 'center'
//  width         fixed px (200–400) — default: fill the container (capped 400)
//  locale        'km' | 'en' | …  — default: follow the app language (i18n store)
// Emits: @credential (ID token), @error, @click (official button was clicked)
//
// NOTE: Google draws the button inside an <iframe>, so only the options above
// (plus CSS on the wrapper) can be customised — the button's internals cannot.
//
// ABOUT THE "PERSONALIZED BUTTON" (avatar + name + email + account caret):
// Google itself replaces the button content when BOTH are true:
//   1. the browser has an active Google session, and
//   2. that Google account has already signed in here with Google before
//      ("approved session" — the account exists on our side via google_id).
// Google calls this the personalized button:
// https://developers.google.com/identity/gsi/web/guides/personalized-button
// It is session-driven, rendered by Google inside the iframe, and there is NO
// option (type/theme/text/…) that forces the plain "Continue with Google"
// rendering — that rendering is what first-time visitors (no Google session, or
// an account that never used the button) get. The name/photo shown come from the
// user's Google Account profile, so they can be changed only on myaccount.google.com.
import { ref, watch, onMounted } from "vue";
import { useI18nStore } from "@/stores/i18n";

const props = defineProps({
  type: { type: String, default: "standard" },
  theme: { type: String, default: "outline" },
  size: { type: String, default: "large" },
  text: { type: String, default: "continue_with" },
  shape: { type: String, default: "pill" },
  logoAlignment: { type: String, default: "center" },
  width: { type: Number, default: null },
  locale: { type: String, default: null },
});

const emit = defineEmits(["credential", "error", "click"]);

const i18n = useI18nStore();
const clientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();
const btnWrap = ref(null);

// Load the Google Identity Services script once for the whole app
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
      reject(new Error("Failed to load Google Sign-In script"));
    };
    document.head.appendChild(script);
  });
  return gsiPromise;
}

async function renderButton() {
  await loadGsi();
  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: (response) => {
      if (response && response.credential)
        emit("credential", response.credential);
    },
    use_fedcm_for_prompt: true,
  });
  if (!btnWrap.value) return;
  btnWrap.value.innerHTML = ""; // drop the previous iframe before re-rendering
  window.google.accounts.id.renderButton(btnWrap.value, {
    type: props.type,
    theme: props.theme,
    size: props.size,
    text: props.text,
    shape: props.shape,
    logo_alignment: props.logoAlignment,
    locale: props.locale || i18n.locale,
    width: props.width || Math.round(Math.min(btnWrap.value.offsetWidth || 320, 400)),
    click_listener: () => emit("click"),
  });
}

onMounted(async () => {
  if (!clientId) {
    console.warn(
      "[GoogleSignIn] VITE_GOOGLE_CLIENT_ID is not set — Google button hidden."
    );
    return;
  }
  try {
    await renderButton();
  } catch (err) {
    console.error("[GoogleSignIn]", err);
    emit("error", err);
  }
});

// The button text/logo is rendered by Google, so re-render when the app
// language (or the locale prop) changes.
watch(
  () => props.locale || i18n.locale,
  () => {
    if (clientId) renderButton().catch(() => {});
  }
);
</script>

<style scoped>
.gsi-wrap {
  width: 100%;
  min-height: 44px;
  display: flex;
  justify-content: center;
}
.gsi-wrap :deep(iframe) {
  max-width: 100%;
}
</style>


