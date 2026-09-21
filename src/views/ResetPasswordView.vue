<template>
  <div class="page">
    <div class="card pop-in">
      <div class="icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63a.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63a.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63a.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63a.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"/></svg>
      </div>
      <div class="title">{{ i18n.t.reset_password }}</div>
      <form @submit.prevent="submit">
        <div v-if="tokenMissing" class="error-msg">{{ i18n.t.verify_error }}</div>
        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
        <div v-if="successMsg" class="success-msg">{{ successMsg }}</div>
        <div class="form-group">
          <label>{{ i18n.t.password }}</label>
          <div class="password-wrap">
            <input v-model="password" :type="showPassword ? 'text' : 'password'" class="input" :placeholder="i18n.t.password" minlength="8" required @focus="pwFocused = true" @blur="pwFocused = false" />
            <button type="button" class="toggle-password" @click="showPassword = !showPassword" tabindex="-1">
              <svg v-if="showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
          <div v-if="password" class="pw-meter">
            <div class="pw-bars">
              <span v-for="i in 5" :key="i" class="pw-bar" :style="pwScore >= i ? { background: strengthColor } : {}"></span>
            </div>
            <span class="pw-label" :style="{ color: strengthColor }">{{ strengthLabel }}</span>
          </div>
          <transition name="pw-slide">
            <ul v-if="showPwRules" class="pw-rules">
              <li :class="{ ok: pwRules.length }">{{ i18n.t.pw_rule_length }}</li>
              <li :class="{ ok: pwRules.upper }">{{ i18n.t.pw_rule_upper }}</li>
              <li :class="{ ok: pwRules.lower }">{{ i18n.t.pw_rule_lower }}</li>
              <li :class="{ ok: pwRules.digit }">{{ i18n.t.pw_rule_digit }}</li>
              <li :class="{ ok: pwRules.special }">{{ i18n.t.pw_rule_special }}</li>
            </ul>
          </transition>
        </div>
        <button type="submit" class="btn" :disabled="submitting || tokenMissing">
          {{ submitting ? i18n.t.loading : i18n.t.reset_password }}
        </button>
      </form>
      <div class="links">
        <router-link to="/forgot-password">{{ i18n.t.forgot_password }}</router-link>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";
import { useI18nStore } from "@/stores/i18n";

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
.page { min-height: 100vh; background: linear-gradient(135deg, #f0fdf4, #dcfce7); display: flex; align-items: center; justify-content: center; padding: 20px; }
.card { background: white; border-radius: 22px; width: 100%; max-width: 400px; padding: 36px 28px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.08); }
.icon { width: 68px; height: 68px; margin: 0 auto 14px; border-radius: 20px; background: linear-gradient(135deg, #0f766e, #22c55e); display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 8px 20px rgba(15, 118, 110, 0.28); }
.icon svg { display: block; }
.title { font-family: "Hanuman", serif; font-size: 20px; font-weight: 700; color: #14532d; margin-bottom: 20px; }
.form-group { margin-bottom: 14px; text-align: left; }
.form-group label { font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 5px; display: block; }
.input { width: 100%; padding: 10px 12px; border: 1.5px solid #bbf7d0; border-radius: 10px; font-size: 13px; font-family: inherit; outline: none; box-sizing: border-box; }
.input:focus { border-color: #4ade80; }
.password-wrap { position: relative; }
.password-wrap .input { padding-right: 40px; }
.toggle-password { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #9ca3af; padding: 4px; display: flex; align-items: center; }
.toggle-password:hover { color: #374151; }
.pw-meter { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
.pw-bars { display: flex; gap: 4px; flex: 1; }
.pw-bar { height: 5px; flex: 1; border-radius: 3px; background: #e5e7eb; transition: background 0.2s ease; }
.pw-label { font-size: 11px; font-weight: 700; white-space: nowrap; }
.pw-rules { list-style: none; margin: 8px 0 0; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 3px 10px; text-align: left; }
.pw-rules li { font-size: 11px; color: #9ca3af; display: flex; align-items: center; gap: 5px; transition: color 0.2s ease; }
.pw-rules li::before { content: "○"; font-size: 10px; }
.pw-rules li.ok { color: #16a34a; }
.pw-rules li.ok::before { content: "●"; }
.pw-slide-enter-active, .pw-slide-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.pw-slide-enter-from, .pw-slide-leave-to { opacity: 0; transform: translateY(-4px); }
.btn { width: 100%; padding: 13px; background: linear-gradient(135deg, #0f766e, #22c55e); color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; margin-top: 8px; }
.btn:disabled { background: #9e9e9e; cursor: not-allowed; }
.error-msg { background: #fbe9e7; border: 1.5px solid #ffccbc; border-radius: 8px; padding: 8px 12px; font-size: 13px; color: #c62828; margin-bottom: 12px; }
.success-msg { background: #e8f5e9; border: 1.5px solid #a5d6a7; border-radius: 8px; padding: 8px 12px; font-size: 13px; color: #2d7a2d; margin-bottom: 12px; }
.links { margin-top: 12px; font-size: 13px; color: #6b7280; }
.links a { color: #16a34a; font-weight: 600; text-decoration: none; }
.pop-in { animation: popIn 0.22s cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes popIn { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
</style>