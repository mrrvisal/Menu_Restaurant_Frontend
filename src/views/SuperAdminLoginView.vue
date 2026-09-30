<template>
  <div class="page">
    <div class="card pop-in">
      <div class="badge">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
        {{ i18n.t.restricted_area }}
      </div>
      <div class="icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      </div>
      <div class="title">{{ i18n.t.super_admin_login }}</div>

      <SuperAdminLoginForm
        :form="form"
        :error-msg="errorMsg"
        v-model:show-password="showPassword"
        :submitting="submitting"
        :i18n="i18n"
        @submit="submit"
      />

      <button class="lang-toggle" @click="i18n.toggleLocale">
        {{ i18n.locale === "km" ? "English" : "ភាសាខ្មែរ" }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useI18nStore } from "@/stores/i18n";
import SuperAdminLoginForm from "@/components/SuperAdminLoginForm.vue";

const router = useRouter();
const auth = useAuthStore();
const i18n = useI18nStore();

const form = reactive({ email: "", password: "" });
const errorMsg = ref("");
const submitting = ref(false);
const showPassword = ref(false);

async function submit() {
  errorMsg.value = "";
  submitting.value = true;
  try {
    await auth.superAdminLogin(form.email, form.password);
    router.push("/super-admin");
  } catch (err) {
    errorMsg.value = err.response?.data?.error || i18n.t.error;
  } finally {
    submitting.value = false;
  }
}

async function onGoogleCredential(credential) {
  errorMsg.value = "";
  submitting.value = true;
  try {
    await auth.loginWithGoogle(credential, { superAdminOnly: true });
    router.push("/super-admin");
  } catch (err) {
    const code = err.response?.data?.code;
    const msg = err.response?.data?.error || i18n.t.error;
    errorMsg.value = code === "not_super_admin" ? i18n.t.not_super_admin : msg;
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: rgb(255, 171, 67);
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
  box-shadow: 0 24px 60px rgba(255, 132, 1, 0.45);
}

@media (max-width: 480px) {
  .card {
    padding: 28px 20px;
  }
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fcd34d;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border-radius: 999px;
  padding: 6px 14px;
  margin-bottom: 16px;
}

.icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 12px;
  border-radius: 18px;
  background: linear-gradient(135deg, #b45309, #f59e0b);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 22px rgba(245, 158, 11, 0.35);
}

.title {
  font-size: 20px;
  font-weight: 800;
  color: #1c1917;
  margin-bottom: 4px;
}

.subtitle {
  font-size: 13px;
  color: #78716c;
  margin: 0 0 18px;
  line-height: 1.5;
}

.or-divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 18px 0 14px;
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

.links-register {
  margin-top: 16px;
  font-size: 13px;
  color: #6b7280;
}

.owner-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #b45309;
  font-weight: 600;
  text-decoration: none;
}

.owner-link:hover {
  text-decoration: underline;
}

.lang-toggle {
  margin-top: 14px;
  background: none;
  border: 1.5px solid #fcd34d;
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 12px;
  font-family: inherit;
  color: #92400e;
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