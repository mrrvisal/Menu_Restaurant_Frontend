<template>
  <div class="page">
    <div class="card pop-in">
      <div class="icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      <div class="title">{{ i18n.t.login_title }}</div>

      <LoginForm
        :form="form"
        :error-msg="errorMsg"
        :session-expired="auth.sessionExpired"
        :super-admin-hint="superAdminHint"
        :verify-required="verifyRequired"
        :resending="resending"
        :submitting="submitting"
        v-model:show-password="showPassword"
        :i18n="i18n"
        @submit="submit"
        @open-mail-app="openMailApp"
        @resend-verification="resendVerification"
      />

      <div class="or-divider">
        <span>{{ i18n.t.or }}</span>
      </div>

      <GoogleSignInButton @credential="onGoogleCredential" />

      <div class="links-register">
        {{ i18n.t.no_account }}
        <router-link to="/register">{{ i18n.t.register }}</router-link>
      </div>

      <button class="lang-toggle" @click="i18n.toggleLocale">
        {{ i18n.locale === "km" ? "English" : "ភាសាខ្មែរ" }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { useI18nStore } from "@/stores/i18n";
import GoogleSignInButton from "@/components/GoogleSignInButton.vue";
import LoginForm from "@/components/LoginForm.vue";
import { takePendingGoogleCredential } from "@/utils/googleAuth";

const API_BASE = import.meta.env.VITE_API_URL;

const router = useRouter();
const auth = useAuthStore();
const i18n = useI18nStore();

const form = reactive({ email: "", password: "" });
const errorMsg = ref("");
const submitting = ref(false);
const showPassword = ref(false);
const verifyRequired = ref(false);
const resending = ref(false);
const superAdminHint = ref(false);

async function submit() {
  errorMsg.value = "";
  verifyRequired.value = false;
  superAdminHint.value = false;
  submitting.value = true;
  try {
    await auth.login(form.email, form.password);
    if (auth.isSuperAdmin) router.push("/super-admin");
    else router.push("/dashboard");
  } catch (err) {
    const errMsg = err.response?.data?.error || "";
    errorMsg.value = errMsg || i18n.t.error;
    if (err.response?.data?.code === "super_admin_use_dedicated_route") {
      superAdminHint.value = true;
      errorMsg.value = "";
    } else if (
      err.response?.data?.code === "AUTH_EMAIL_UNVERIFIED" ||
      err.response?.data?.errorDetails?.message?.en?.toLowerCase().includes("verify")
    ) {
      verifyRequired.value = true;
    }
  } finally {
    submitting.value = false;
  }
}

async function onGoogleCredential(credential) {
  errorMsg.value = "";
  verifyRequired.value = false;
  superAdminHint.value = false;
  submitting.value = true;
  try {
    await auth.loginWithGoogle(credential);
    if (auth.isSuperAdmin) router.push("/super-admin");
    else router.push("/dashboard");
  } catch (err) {
    errorMsg.value = err.response?.data?.error || i18n.t.error;
    if (err.response?.data?.code === "super_admin_use_dedicated_route") {
      superAdminHint.value = true;
      errorMsg.value = "";
    }
  } finally {
    submitting.value = false;
  }
}

// Popup-blocked fallback: /auth/google/callback couldn't reach the opener,
// so it parked the ID token in sessionStorage and redirected back here.
onMounted(() => {
  const pending = takePendingGoogleCredential();
  if (pending) onGoogleCredential(pending);
});

function openMailApp() {
  window.open("https://mail.google.com/mail/u/0/#inbox", "_blank");
}

async function resendVerification() {
  if (!form.email) return;
  resending.value = true;
  try {
    await axios.post(`${API_BASE}/api/auth/resend-verification`, {
      email: form.email,
    });
    errorMsg.value = i18n.t.email_sent;
    verifyRequired.value = false;
  } catch (err) {
    errorMsg.value = err.response?.data?.error || i18n.t.error;
  } finally {
    resending.value = false;
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.card {
  background: white;
  border-radius: 22px;
  width: 100%;
  max-width: 450px;
  padding: 36px 28px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
}

@media (max-width: 480px) {
  .card {
    padding: 28px 20px;
  }
}

.icon {
  width: 68px;
  height: 68px;
  margin: 0 auto 14px;
  border-radius: 20px;
  background: linear-gradient(135deg, #0f766e, #22c55e);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 20px rgba(15, 118, 110, 0.28);
}

.icon svg {
  display: block;
}

.title {
  font-family: "Hanuman", serif;
  font-size: 20px;
  font-weight: 700;
  color: #14532d;
  margin-bottom: 20px;
}

@media (max-width: 480px) {
  .title {
    font-size: 17px;
  }
}

.or-divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 18px 0 14px;
  color: #9ca3af;
  font-size: 12px;
}

.or-divider::before,
.or-divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}

.links-register {
  margin-top: 12px;
  font-size: 13px;
  color: #6b7280;
}

.links-register a {
  color: #16a34a;
  font-weight: 600;
  text-decoration: none;
}

.links-register a:hover {
  text-decoration: underline;
}

.sa-entry {
  margin-top: 6px;
}

.sa-entry-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #b45309 !important;
  font-size: 12px;
}

.sa-entry-link svg {
  flex-shrink: 0;
}

.lang-toggle {
  margin-top: 14px;
  background: none;
  border: 1.5px solid #bbf7d0;
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 12px;
  font-family: inherit;
  color: #16a34a;
  cursor: pointer;
}

.pop-in {
  animation: popIn 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes popIn {
  from {
    transform: scale(0.85);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

</style>
