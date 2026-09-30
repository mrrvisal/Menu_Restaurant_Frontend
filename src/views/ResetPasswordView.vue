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