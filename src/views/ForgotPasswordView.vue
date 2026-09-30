<template>
  <div class="page">
    <div class="card pop-in">
      <div class="icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <path
            d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
        </svg>
      </div>
      <div class="title">{{ i18n.t.reset_password }}</div>
      <ForgotPasswordForm
        v-model:email="email"
        :error-msg="errorMsg"
        :success-msg="successMsg"
        :submitting="submitting"
        :i18n="i18n"
        @submit="submit"
      />
      <div class="links"><router-link to="/login">{{ i18n.t.back }} {{ i18n.t.login }}</router-link></div>
      <button class="lang-toggle" @click="i18n.toggleLocale">{{ i18n.locale === 'km' ? 'English' : 'ភាសាខ្មែរ'
        }}</button>
    </div>
  </div>
</template>
<script setup>
import { ref } from "vue";
import axios from "axios";
import { useI18nStore } from "@/stores/i18n";
import ForgotPasswordForm from "@/components/ForgotPasswordForm.vue";
const i18n = useI18nStore();
const API_BASE = import.meta.env.VITE_API_URL;
const email = ref("");
const errorMsg = ref("");
const successMsg = ref("");
const submitting = ref(false);
async function submit() {
  errorMsg.value = ""; successMsg.value = ""; submitting.value = true;
  try {
    const res = await axios.post(`${API_BASE}/api/auth/forgot-password`, { email: email.value });
    successMsg.value = res.data.message;
  } catch (err) {
    errorMsg.value = err.response?.data?.error || i18n.t.error;
  } finally { submitting.value = false; }
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