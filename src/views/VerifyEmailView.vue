<template>
  <div class="page">
    <div class="card pop-in">
      <!-- Token verification mode (from email link) -->
      <template v-if="route.query.token">
        <div v-if="loading" class="state loading-state">
          <div class="spinner"></div>
          <p>{{ i18n.t.loading }}</p>
        </div>

        <div v-else-if="successMsg" class="state success-state">
          <div class="icon-circle success"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
          <div class="title">{{ i18n.t.verify_success }}</div>
          <div class="msg success-msg">{{ successMsg }}</div>
          <router-link to="/login" class="btn btn-primary">{{ i18n.t.login }}</router-link>
        </div>

        <div v-else class="state error-state">
          <div class="icon-circle error"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
          <div class="title">{{ i18n.t.verify_error }}</div>
          <div class="msg error-msg">{{ errorMsg }}</div>
          <router-link to="/login" class="btn btn-primary">{{ i18n.t.login }}</router-link>
        </div>
      </template>

      <!-- Notice mode (after registration) -->
      <template v-else>
        <div class="icon-circle mail"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg></div>
        <div class="title">{{ i18n.t.check_email }}</div>
        <p class="desc">{{ i18n.t.check_email_desc }}</p>

        <!-- Email chip -->
        <div v-if="userEmail" class="email-chip">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 8v8m0-8h0"/></svg>
          {{ userEmail }}
        </div>

        <!-- Steps -->
        <div class="steps">
          <div class="step"><span class="step-n">1</span><span class="step-l">{{ i18n.t.step_open || "Open your inbox" }}</span></div>
          <div class="step"><span class="step-n">2</span><span class="step-l">{{ i18n.t.step_click || "Click the verification link" }}</span></div>
          <div class="step"><span class="step-n">3</span><span class="step-l">{{ i18n.t.step_done || "Start building your menu" }}</span></div>
        </div>

        <div v-if="resendSuccess" class="msg success-msg">{{ i18n.t.email_sent }}</div>
        <div v-if="resendError" class="msg error-msg">{{ resendError }}</div>

        <div class="actions">
          <button class="btn btn-primary" @click="openMailApp">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            {{ i18n.t.open_email }}
          </button>
          <button class="btn btn-ghost" :disabled="resending" @click="resendVerification">
            <svg v-if="!resending" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
            <span v-if="resending" class="btn-spinner"></span>
            {{ resending ? i18n.t.loading : i18n.t.resend_email }}
          </button>
        </div>

        <div class="links">
          <router-link to="/login">{{ i18n.t.login }}</router-link>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { useI18nStore } from "@/stores/i18n";

const i18n = useI18nStore();
const API_BASE = import.meta.env.VITE_API_URL;
const route = useRoute();
const router = useRouter();

const loading = ref(true);
const successMsg = ref("");
const errorMsg = ref("");
const resendSuccess = ref(false);
const resendError = ref("");
const resending = ref(false);
const userEmail = ref(route.query.email || "");

onMounted(async () => {
  if (route.query.token) {
    try {
      const res = await axios.get(`${API_BASE}/api/auth/verify-email?token=${route.query.token}`);
      successMsg.value = res.data.message;
    } catch (err) {
      errorMsg.value = err.response?.data?.error || i18n.t.verify_error;
    } finally {
      loading.value = false;
    }
  } else {
    loading.value = false;
  }
});

function openMailApp() {
  window.open("https://mail.google.com/mail/u/0/#inbox", "_blank");
}

async function resendVerification() {
  if (!userEmail.value) {
    resendError.value = "Email not found. Please go back to login.";
    return;
  }
  resending.value = true;
  resendSuccess.value = false;
  resendError.value = "";
  try {
    await axios.post(`${API_BASE}/api/auth/resend-verification`, { email: userEmail.value });
    resendSuccess.value = true;
  } catch (err) {
    resendError.value = err.response?.data?.error || i18n.t.error;
  } finally {
    resending.value = false;
  }
}
</script>

<style scoped>
.page { min-height: 100vh; background: linear-gradient(135deg, #f0fdf4, #dcfce7); display: flex; align-items: center; justify-content: center; padding: 20px; }
.card { background: white; border-radius: 22px; width: 100%; max-width: 440px; padding: 40px 28px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.08); border: 1px solid #e5f0e8; }
@media (max-width: 480px) { .card { padding: 28px 20px; } }
.icon-circle { width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; box-shadow: 0 6px 20px rgba(0,0,0,0.06); }
.icon-circle.success { background: #dcfce7; color: #16a34a; }
.icon-circle.error { background: #fee2e2; color: #dc2626; }
.icon-circle.mail { background: #e0f2fe; color: #0369a1; }
.icon-circle svg { display: block; }
.title { font-family: "Hanuman", serif; font-size: 20px; font-weight: 700; color: #14532d; margin-bottom: 12px; }
@media (max-width: 480px) { .title { font-size: 17px; } }
.desc { font-size: 13px; color: #6b7280; line-height: 1.6; margin-bottom: 20px; }
.email-chip { display: inline-flex; align-items: center; gap: 6px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 999px; padding: 6px 14px; font-size: 12px; font-weight: 600; color: #0f766e; margin-bottom: 18px; word-break: break-all; max-width: 100%; }
.email-chip svg { flex-shrink: 0; color: #16a34a; }
.steps { display: flex; flex-direction: column; gap: 8px; text-align: left; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; margin-bottom: 18px; }
.step { display: flex; align-items: center; gap: 10px; font-size: 12.5px; color: #374151; }
.step-n { width: 22px; height: 22px; border-radius: 50%; background: linear-gradient(135deg, #0f766e, #22c55e); color: white; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.step-l { line-height: 1.4; }
.actions { display: flex; flex-direction: column; gap: 10px; margin-bottom: 10px; }
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 13px; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; text-decoration: none; border: none; font-family: inherit; transition: all 0.2s ease; }
.btn-primary { background: linear-gradient(135deg, #0f766e, #22c55e); color: white; }
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(15, 118, 110, 0.3); }
.btn-ghost { background: #f0fdf4; color: #0f766e; border: 1px solid #bbf7d0; }
.btn-ghost:hover { background: #dcfce7; transform: translateY(-1px); }
.btn-ghost:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }
.btn svg { flex-shrink: 0; }
.btn-spinner { width: 15px; height: 15px; border: 2px solid rgba(15,118,110,0.25); border-top-color: #0f766e; border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block; flex-shrink: 0; }
.error-msg { background: #fbe9e7; border: 1.5px solid #ffccbc; border-radius: 8px; padding: 8px 12px; font-size: 13px; color: #c62828; }
.success-msg { background: #e8f5e9; border: 1.5px solid #a5d6a7; border-radius: 8px; padding: 8px 12px; font-size: 13px; color: #2d7a2d; }
.msg { margin-bottom: 12px; }
.links { margin-top: 16px; font-size: 13px; }
.links a { color: #16a34a; font-weight: 600; text-decoration: none; }
.links a:hover { text-decoration: underline; }
.spinner { width: 24px; height: 24px; border: 2.5px solid #e2e8f0; border-top-color: #0f766e; border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block; margin-bottom: 8px; }
@keyframes spin { to { transform: rotate(360deg); } }
.state { display: flex; flex-direction: column; align-items: center; gap: 10px; }
.state .btn { margin-top: 8px; }
.loading-state p { font-size: 13px; color: #6b7280; }
.pop-in { animation: popIn 0.22s cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes popIn { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
</style>