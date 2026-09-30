<template>
  <div class="page">
    <div class="card pop-in">
      <div class="icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
          <path d="M2 7h20" />
          <path
            d="M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63a.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63a.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63a.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63a.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7" />
        </svg>
      </div>
      <div class="title">{{ i18n.t.register_title }}</div>

      <RegisterForm
        :form="form"
        :error-msg="errorMsg"
        :success-msg="successMsg"
        v-model:show-password="showPassword"
        :pw-rules="pwRules"
        :pw-score="pwScore"
        :strength-color="strengthColor"
        :strength-label="strengthLabel"
        :show-pw-rules="showPwRules"
        :submitting="submitting"
        :i18n="i18n"
        @submit="submit"
        @password-focus="pwFocused = true"
        @password-blur="pwFocused = false"
      />

      <div class="or-divider"><span>{{ i18n.t.or }}</span></div>

      <GoogleSignInButton @credential="onGoogleCredential" />

      <div class="links">{{ i18n.t.have_account }} <router-link to="/login">{{ i18n.t.login }}</router-link></div>
      <button class="lang-toggle" @click="i18n.toggleLocale">{{ i18n.locale === 'km' ? 'English' : 'ភាសាខ្មែរ'
      }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useI18nStore } from "@/stores/i18n";
import GoogleSignInButton from "@/components/GoogleSignInButton.vue";
import RegisterForm from "@/components/RegisterForm.vue";
import { takePendingGoogleCredential } from "@/utils/googleAuth";

const router = useRouter();
const auth = useAuthStore();
const i18n = useI18nStore();

const form = reactive({
  email: "",
  password: "",
});
const errorMsg = ref("");
const successMsg = ref("");
const submitting = ref(false);
const showPassword = ref(false);

// Password policy — must mirror backend helpers/passwordPolicy.js
const PW_MIN_LENGTH = 8;
const pwRules = computed(() => ({
  length: form.password.length >= PW_MIN_LENGTH,
  upper: /[A-Z]/.test(form.password),
  lower: /[a-z]/.test(form.password),
  digit: /[0-9]/.test(form.password),
  special: /[^A-Za-z0-9\s]/.test(form.password),
}));
const pwScore = computed(() =>
  Object.values(pwRules.value).filter(Boolean).length
); // 0..5
const strengthMeta = [
  { label: "pw_weak", color: "#ef4444" },
  { label: "pw_weak", color: "#ef4444" },
  { label: "pw_fair", color: "#f97316" },
  { label: "pw_fair", color: "#f59e0b" },
  { label: "pw_good", color: "#84cc16" },
  { label: "pw_strong", color: "#22c55e" },
];
const strengthLabel = computed(
  () => i18n.t[strengthMeta[pwScore.value].label]
);
const strengthColor = computed(() => strengthMeta[pwScore.value].color);

// The rules checklist stays hidden until the user clicks into / starts
// typing the password field
const pwFocused = ref(false);
const showPwRules = computed(
  () => pwFocused.value || form.password.length > 0
);

async function submit() {
  errorMsg.value = "";
  successMsg.value = "";

  // Client-side policy check (the backend enforces the same rules)
  const r = pwRules.value;
  if (!(r.length && r.upper && r.lower && r.digit && r.special)) {
    errorMsg.value = i18n.t.pw_invalid;
    return;
  }

  submitting.value = true;
  try {
    const data = await auth.register({
      email: form.email.trim(),
      password: form.password,
    });
    successMsg.value = data.message || i18n.t.success;
    setTimeout(() => router.push(`/verify-email?email=${encodeURIComponent(form.email.trim())}`), 2000);
  } catch (err) {
    errorMsg.value = err.response?.data?.error || i18n.t.generic_error;
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

async function onGoogleCredential(credential) {
  errorMsg.value = "";
  successMsg.value = "";
  submitting.value = true;
  try {
    // Google accounts are created & verified instantly, so go straight to the app
    await auth.loginWithGoogle(credential);
    if (auth.isSuperAdmin) router.push("/super-admin");
    else router.push("/dashboard");
  } catch (err) {
    errorMsg.value = err.response?.data?.error || i18n.t.generic_error;
  } finally {
    submitting.value = false;
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

.section-title {
  font-family: "Hanuman", serif;
  font-size: 13px;
  font-weight: 700;
  color: #0f766e;
  text-align: left;
  margin: 16px 0 10px;
  padding-bottom: 6px;
  border-bottom: 1.5px solid #e8f5e9;
}

.links {
  margin-top: 12px;
  font-size: 13px;
  color: #6b7280;
}

.or-divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 16px 0 12px;
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

.links a {
  color: #16a34a;
  font-weight: 600;
  text-decoration: none;
}

.logo-preview {
  margin-top: 6px;
}

.logo-preview img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 10px;
  border: 2px solid #bbf7d0;
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