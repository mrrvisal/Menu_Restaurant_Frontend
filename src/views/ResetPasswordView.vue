<template>
  <div class="page">
    <button class="lang-toggle" @click="i18n.toggleLocale">
      {{ i18n.locale === "km" ? "English" : "ភាសាខ្មែរ" }}
    </button>
    <div class="card pop-in">
      <div class="icon">
        <img
              src="https://res.cloudinary.com/daji2ml3y/image/upload/v1783262055/ChatGPT_Image_Jul_5_2026_09_32_32_PM_c6ziic.png"
              width="60" alt="">
      </div>
      <div class="title">{{ i18n.t.reset_password }}</div>
      <ResetPasswordForm
        v-model:password="password"
        v-model:show-password="showPassword"
        :token-missing="tokenMissing"
        :error-msg="errorMsg"
        :success-msg="successMsg"
        :pw-score="pwScore"
        :strength-color="strengthColor"
        :strength-label="strengthLabel"
        :pw-rules="pwRules"
        :show-pw-rules="showPwRules"
        :submitting="submitting"
        :i18n="i18n"
        @submit="submit"
        @password-focus="pwFocused = true"
        @password-blur="pwFocused = false"
      />
    </div>
  </div>
</template>
<script setup>
import { computed, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";
import { useI18nStore } from "@/stores/i18n";
import ResetPasswordForm from "@/components/ResetPasswordForm.vue";

const router = useRouter();
const route = useRoute();
const i18n = useI18nStore();
const API_BASE = import.meta.env.VITE_API_URL;

// The one-time token from the emailed link: /reset-password?token=…
const token = computed(() =>
  typeof route.query.token === "string" ? route.query.token : ""
);
const tokenMissing = computed(() => !token.value);

const password = ref("");
const showPassword = ref(false);
const errorMsg = ref("");
const successMsg = ref("");
const submitting = ref(false);

// Password policy — must mirror backend helpers/passwordPolicy.js
const PW_MIN_LENGTH = 8;
const pwRules = computed(() => ({
  length: password.value.length >= PW_MIN_LENGTH,
  upper: /[A-Z]/.test(password.value),
  lower: /[a-z]/.test(password.value),
  digit: /[0-9]/.test(password.value),
  special: /[^A-Za-z0-9\s]/.test(password.value),
}));
const pwScore = computed(
  () => Object.values(pwRules.value).filter(Boolean).length
); // 0..5
const strengthMeta = [
  { label: "pw_weak", color: "#ef4444" },
  { label: "pw_weak", color: "#ef4444" },
  { label: "pw_fair", color: "#f97316" },
  { label: "pw_fair", color: "#f59e0b" },
  { label: "pw_good", color: "#84cc16" },
  { label: "pw_strong", color: "#22c55e" },
];
const strengthLabel = computed(() => i18n.t[strengthMeta[pwScore.value].label]);
const strengthColor = computed(() => strengthMeta[pwScore.value].color);

// The rules checklist stays hidden until the user clicks into / starts typing
const pwFocused = ref(false);
const showPwRules = computed(
  () => pwFocused.value || password.value.length > 0
);

async function submit() {
  errorMsg.value = "";
  successMsg.value = "";

  if (tokenMissing.value) {
    errorMsg.value = i18n.t.verify_error;
    return;
  }

  // Client-side policy check (the backend enforces the same rules)
  const r = pwRules.value;
  if (!(r.length && r.upper && r.lower && r.digit && r.special)) {
    errorMsg.value = i18n.t.pw_invalid;
    return;
  }

  submitting.value = true;
  try {
    const res = await axios.post(`${API_BASE}/api/auth/reset-password`, {
      token: token.value,
      password: password.value,
    });
    successMsg.value = res.data.message;
    // Show the confirmation before sending the user to the login page
    // (submitting stays true so the form can't be submitted twice)
    setTimeout(() => router.push("/login"), 1800);
  } catch (err) {
    errorMsg.value = err.response?.data?.error || i18n.t.error;
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

.lang-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10;
  background: none;
  border: 1.5px solid #bbf7d0;
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 12px;
  font-family: inherit;
  color: #16a34a;
  cursor: pointer;
}

.card {
  background: white;
  border-radius: 22px;
  width: 100%;
  max-width: 400px;
  padding: 36px 28px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
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

.links {
  margin-top: 12px;
  font-size: 13px;
  color: #6b7280;
}

.links a {
  color: #16a34a;
  font-weight: 600;
  text-decoration: none;
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