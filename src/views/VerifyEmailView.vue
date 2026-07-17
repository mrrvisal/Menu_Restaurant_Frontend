<template>
  <div class="page">
    <div class="card pop-in">
      <!-- Token verification mode (from email link) -->
      <template v-if="route.query.token">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>{{ i18n.t.loading }}</p>
        </div>
        <div v-else-if="successMsg" class="success-state">
          <div class="icon">✅</div>
          <div class="title">{{ i18n.t.verify_success }}</div>
          <div class="success-msg">{{ successMsg }}</div>
          <router-link to="/login" class="btn">{{ i18n.t.login }}</router-link>
        </div>
        <div v-else class="error-state">
          <div class="icon">❌</div>
          <div class="title">{{ i18n.t.verify_error }}</div>
          <div class="error-msg">{{ errorMsg }}</div>
          <router-link to="/login" class="btn">{{ i18n.t.login }}</router-link>
        </div>
      </template>

      <!-- Notice mode (after registration) -->
      <template v-else>
        <div class="icon">📧</div>
        <div class="title">{{ i18n.t.check_email }}</div>
        <p class="desc">{{ i18n.t.check_email_desc }}</p>

        <div v-if="resendSuccess" class="success-msg">{{ i18n.t.email_sent }}</div>
        <div v-if="resendError" class="error-msg">{{ resendError }}</div>

        <div class="actions">
          <button class="btn btn-primary" @click="openMailApp">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            {{ i18n.t.open_email }}
          </button>
          <button class="btn btn-ghost" :disabled="resending" @click="resendVerification">
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
.card { background: white; border-radius: 22px; width: 100%; max-width: 420px; padding: 40px 28px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.08); }
.icon { font-size: 48px; margin-bottom: 12px; }
.title { font-family: "Hanuman", serif; font-size: 20px; font-weight: 700; color: #14532d; margin-bottom: 12px; }
.desc { font-size: 13px; color: #6b7280; line-height: 1.6; margin-bottom: 24px; }
.actions { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 13px; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; text-decoration: none; border: none; font-family: inherit; transition: all 0.2s ease; }
.btn-primary { background: linear-gradient(135deg, #0f766e, #22c55e); color: white; }
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(15, 118, 110, 0.3); }
.btn-ghost { background: #f0fdf4; color: #0f766e; border: 1px solid #bbf7d0; }
.btn-ghost:hover { background: #dcfce7; }
.btn-ghost:disabled { opacity: 0.5; cursor: not-allowed; }
.error-msg { background: #fbe9e7; border: 1.5px solid #ffccbc; border-radius: 8px; padding: 8px 12px; font-size: 13px; color: #c62828; margin-bottom: 12px; }
.success-msg { background: #e8f5e9; border: 1.5px solid #a5d6a7; border-radius: 8px; padding: 8px 12px; font-size: 13px; color: #2d7a2d; margin-bottom: 12px; }
.links { margin-top: 8px; font-size: 13px; }
.links a { color: #16a34a; font-weight: 600; text-decoration: none; }
.spinner { width: 24px; height: 24px; border: 2.5px solid #e2e8f0; border-top-color: #0f766e; border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block; margin-bottom: 8px; }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-state, .success-state, .error-state { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.pop-in { animation: popIn 0.22s cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes popIn { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
</style>