<template>
  <div class="page">
    <div class="card pop-in">
      <div class="icon">📧</div>
      <div class="title">{{ t.verify_email }}</div>
      <div v-if="loading" class="loading">{{ t.loading }}</div>
      <div v-if="successMsg" class="success-msg">{{ successMsg }}</div>
      <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
      <div class="links"><router-link to="/login">{{ t.login }}</router-link></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import { useI18nStore } from "@/stores/i18n";

const { t } = useI18nStore();
const API_BASE = import.meta.env.VITE_API_URL;
const route = useRoute();

const loading = ref(true);
const successMsg = ref("");
const errorMsg = ref("");

onMounted(async () => {
  try {
    const res = await axios.get(`${API_BASE}/api/auth/verify-email?token=${route.query.token}`);
    successMsg.value = res.data.message;
  } catch (err) {
    errorMsg.value = err.response?.data?.error || t.error;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.page { min-height: 100vh; background: linear-gradient(135deg, #f0fdf4, #dcfce7); display: flex; align-items: center; justify-content: center; padding: 20px; }
.card { background: white; border-radius: 22px; width: 100%; max-width: 400px; padding: 36px 28px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.08); }
.icon { font-size: 48px; margin-bottom: 8px; }
.title { font-family: "Hanuman", serif; font-size: 20px; font-weight: 700; color: #14532d; margin-bottom: 20px; }
.loading { color: #6b7280; margin-bottom: 12px; }
.error-msg { background: #fbe9e7; border: 1.5px solid #ffccbc; border-radius: 8px; padding: 8px 12px; font-size: 13px; color: #c62828; margin-bottom: 12px; }
.success-msg { background: #e8f5e9; border: 1.5px solid #a5d6a7; border-radius: 8px; padding: 8px 12px; font-size: 13px; color: #2d7a2d; margin-bottom: 12px; }
.links { margin-top: 12px; font-size: 13px; }
.links a { color: #16a34a; font-weight: 600; text-decoration: none; }
.pop-in { animation: popIn 0.22s cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes popIn { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
</style>