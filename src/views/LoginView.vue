<template>
  <div class="page">
    <div class="card pop-in">
      <div class="icon">🔐</div>
      <div class="title">{{ i18n.t.login_title }}</div>

      <form @submit.prevent="submit">
        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
        <div v-if="verifyRequired" class="verify-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <div class="verify-banner-text">
            <strong>{{ i18n.t.please_verify }}</strong>
            <p>{{ i18n.t.please_verify_desc }}</p>
          </div>
          <div class="verify-banner-actions">
            <button class="btn-verify" @click="openMailApp"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg> {{ i18n.t.open_email }}</button>
            <button class="btn-verify" :disabled="resending" @click="resendVerification"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg> {{ resending ? i18n.t.loading : i18n.t.resend_email }}</button>
          </div>
        </div>

        <div class="form-group">
          <label>{{ i18n.t.email }}</label>
          <input v-model="form.email" type="email" class="input" placeholder="your@email.com" required />
        </div>

        <div class="form-group">
          <label>{{ i18n.t.password }}</label>
          <div class="password-wrap">
            <input v-model="form.password" :type="showPassword ? 'text' : 'password'" class="input" :placeholder="i18n.t.password" required />
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
        </div>

        <button type="submit" class="btn" :disabled="submitting">
          {{ submitting ? i18n.t.loading : i18n.t.login }}
        </button>
      </form>

      <div class="links">
        <router-link to="/forgot-password">{{ i18n.t.forgot_password }}</router-link>
      </div>
      <div class="links">
        {{ i18n.t.no_account }} <router-link to="/register">{{ i18n.t.register }}</router-link>
      </div>

      <button class="lang-toggle" @click="i18n.toggleLocale">{{ i18n.locale === 'km' ? 'English' : 'ភាសាខ្មែរ' }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { useI18nStore } from "@/stores/i18n";

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

async function submit() {
  errorMsg.value = "";
  verifyRequired.value = false;
  submitting.value = true;
  try {
    await auth.login(form.email, form.password);
    if (auth.isSuperAdmin) router.push("/super-admin");
    else router.push("/dashboard");
  } catch (err) {
    const errMsg = err.response?.data?.error || "";
    errorMsg.value = errMsg || i18n.t.error;
    if (errMsg.toLowerCase().includes("verify")) {
      verifyRequired.value = true;
    }
  } finally {
    submitting.value = false;
  }
}

function openMailApp() {
  window.open("https://mail.google.com/mail/u/0/#inbox", "_blank");
}

async function resendVerification() {
  if (!form.email) return;
  resending.value = true;
  try {
    await axios.post(`${API_BASE}/api/auth/resend-verification`, { email: form.email });
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
.page { min-height: 100vh; background: linear-gradient(135deg, #f0fdf4, #dcfce7); display: flex; align-items: center; justify-content: center; padding: 20px; }
.card { background: white; border-radius: 22px; width: 100%; max-width: 400px; padding: 36px 28px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.08); }
@media (max-width: 480px) { .card { padding: 28px 20px; } }
.icon { font-size: 48px; margin-bottom: 8px; }
.title { font-family: "Hanuman", serif; font-size: 20px; font-weight: 700; color: #14532d; margin-bottom: 20px; }
@media (max-width: 480px) { .title { font-size: 17px; } }
.form-group { margin-bottom: 14px; text-align: left; }
.form-group label { font-size: 12px; font-weight: 600; color: #6b7280; margin-bottom: 5px; display: block; }
.input { width: 100%; padding: 10px 12px; border: 1.5px solid #bbf7d0; border-radius: 10px; font-size: 13px; font-family: inherit; outline: none; box-sizing: border-box; }
.input:focus { border-color: #4ade80; }
.password-wrap { position: relative; }
.password-wrap .input { padding-right: 40px; }
.toggle-password { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #9ca3af; padding: 4px; display: flex; align-items: center; }
.toggle-password:hover { color: #374151; }
.btn { width: 100%; padding: 13px; background: linear-gradient(135deg, #0f766e, #22c55e); color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; margin-top: 8px; }
@media (max-width: 480px) { .btn { padding: 11px; font-size: 14px; } }
.btn:disabled { background: #9e9e9e; cursor: not-allowed; }
.error-msg { background: #fbe9e7; border: 1.5px solid #ffccbc; border-radius: 8px; padding: 8px 12px; font-size: 13px; color: #c62828; margin-bottom: 12px; }
.links { margin-top: 12px; font-size: 13px; color: #6b7280; }
.links a { color: #16a34a; font-weight: 600; text-decoration: none; }
.links a:hover { text-decoration: underline; }
.lang-toggle { margin-top: 14px; background: none; border: 1.5px solid #bbf7d0; border-radius: 20px; padding: 6px 16px; font-size: 12px; font-family: inherit; color: #16a34a; cursor: pointer; }
.pop-in { animation: popIn 0.22s cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes popIn { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.verify-banner { background: #fefce8; border: 1.5px solid #fde68a; border-radius: 12px; padding: 14px; margin-bottom: 14px; text-align: left; display: flex; flex-direction: column; gap: 8px; }
.verify-banner svg { flex-shrink: 0; color: #92400e; }
.verify-banner-text strong { font-size: 13px; color: #92400e; display: block; }
.verify-banner-text p { font-size: 12px; color: #92400e; margin: 4px 0 0; line-height: 1.5; }
.verify-banner-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px; }
.btn-verify { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.2s ease; border: 1px solid #fde68a; background: white; color: #92400e; text-decoration: none; }
.btn-verify:hover { background: #fef3c7; transform: translateY(-1px); }
.btn-verify:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
