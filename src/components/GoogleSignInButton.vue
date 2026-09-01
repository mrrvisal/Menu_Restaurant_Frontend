<template>
  <div v-if="clientId" ref="btnWrap" class="gsi-wrap"></div>
</template>

<script setup>
// GoogleSignInButton.vue
// Renders the official "Sign in with Google" button (Google Identity Services)
// and emits the returned Google ID token via @credential.
// If VITE_GOOGLE_CLIENT_ID is not configured the button simply stays hidden.
import { ref, onMounted } from "vue";

const emit = defineEmits(["credential", "error"]);

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

onMounted(async () => {
  if (!clientId) {
    console.warn(
      "[GoogleSignIn] VITE_GOOGLE_CLIENT_ID is not set — Google button hidden."
    );
    return;
  }
  try {
    await loadGsi();
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (response && response.credential)
          emit("credential", response.credential);
      },
      use_fedcm_for_prompt: true,
    });
    if (btnWrap.value) {
      window.google.accounts.id.renderButton(btnWrap.value, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "pill",
        logo_alignment: "center",
        width: Math.round(Math.min(btnWrap.value.offsetWidth || 320, 400)),
      });
    }
  } catch (err) {
    console.error("[GoogleSignIn]", err);
    emit("error", err);
  }
});
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


