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
          <div class="icon-circle success"><svg width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg></div>
          <div class="title">{{ i18n.t.verify_success }}</div>
          <div class="msg success-msg">{{ successMsg }}</div>
          <router-link to="/login" class="btn btn-primary">{{ i18n.t.login }}</router-link>
        </div>

        <div v-else class="state error-state">
          <div class="icon-circle error"><svg width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg></div>
          <div class="title">{{ i18n.t.verify_error }}</div>
          <div class="msg error-msg">{{ errorMsg }}</div>
          <router-link to="/login" class="btn btn-primary">{{ i18n.t.login }}</router-link>
        </div>
      </template>

      <!-- Notice mode (after registration) -->
      <template v-else>
        <VerificationNotice
          :user-email="userEmail"
          :resend-success="resendSuccess"
          :resend-error="resendError"
          :resending="resending"
          :i18n="i18n"
          @open-mail-app="openMailApp"
          @resend-verification="resendVerification"
        />
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { useI18nStore } from "@/stores/i18n";
import VerificationNotice from "@/components/VerificationNotice.vue";

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
    resendError.value = i18n.t.email_not_found;
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
  max-width: 440px;
  padding: 40px 28px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5f0e8;
}

@media (max-width: 480px) {
  .card {
    padding: 28px 20px;
  }
}

.icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
}

.icon-circle.success {
  background: #dcfce7;
  color: #16a34a;
}

.icon-circle.error {
  background: #fee2e2;
  color: #dc2626;
}

.icon-circle svg {
  display: block;
}

.title {
  font-family: "Hanuman", serif;
  font-size: 20px;
  font-weight: 700;
  color: #14532d;
  margin-bottom: 12px;
}

@media (max-width: 480px) {
  .title {
    font-size: 17px;
  }
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 13px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  border: none;
  font-family: inherit;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #0f766e, #22c55e);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(15, 118, 110, 0.3);
}

.btn-ghost {
  background: #f0fdf4;
  color: #0f766e;
  border: 1px solid #bbf7d0;
}

.btn-ghost:hover {
  background: #dcfce7;
  transform: translateY(-1px);
}

.btn-ghost:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn svg {
  flex-shrink: 0;
}

.error-msg {
  background: #fbe9e7;
  border: 1.5px solid #ffccbc;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  color: #c62828;
}

.success-msg {
  background: #e8f5e9;
  border: 1.5px solid #a5d6a7;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  color: #2d7a2d;
}

.msg {
  margin-bottom: 12px;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2.5px solid #e2e8f0;
  border-top-color: #0f766e;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  display: inline-block;
  margin-bottom: 8px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.state .btn {
  margin-top: 8px;
}

.loading-state p {
  font-size: 13px;
  color: #6b7280;
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