<template>
    <div class="icon-circle mail"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg></div>
    <div class="title">{{ i18n.t.check_email }}</div>
    <p class="desc">{{ i18n.t.check_email_desc }}</p>

    <div v-if="userEmail" class="email-chip">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 8v8m0-8h0" />
      </svg>
      {{ userEmail }}
    </div>

    <div class="steps">
      <div class="step"><span class="step-n">1</span><span class="step-l">{{ i18n.t.step_open || "Open your inbox"
          }}</span></div>
      <div class="step"><span class="step-n">2</span><span class="step-l">{{ i18n.t.step_click || "Click theverification link" }}</span></div>
      <div class="step"><span class="step-n">3</span><span class="step-l">{{ i18n.t.step_done || "Start buildingyour menu" }}</span></div>
    </div>

    <div v-if="resendSuccess" class="msg success-msg">{{ i18n.t.email_sent }}</div>
    <div v-if="resendError" class="msg error-msg">{{ resendError }}</div>

    <div class="actions">
      <button class="btn btn-primary" @click="emit('open-mail-app')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
        {{ i18n.t.open_email }}
      </button>
      <button class="btn btn-ghost" :disabled="resending" @click="emit('resend-verification')">
        <svg v-if="!resending" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
        <span v-if="resending" class="btn-spinner"></span>
        {{ resending ? i18n.t.loading : i18n.t.resend_email }}
      </button>
    </div>

    <div class="links">
      <router-link to="/login">{{ i18n.t.login }}</router-link>
    </div>
</template>

<script setup>
const props = defineProps(["userEmail", "resendSuccess", "resendError", "resending", "i18n"]);
const emit = defineEmits(["open-mail-app", "resend-verification"]);
</script>

<style scoped>
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

.icon-circle.mail {
  background: #e0f2fe;
  color: #0369a1;
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

.desc {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 20px;
}

.email-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  color: #0f766e;
  margin-bottom: 18px;
  word-break: break-all;
  max-width: 100%;
}

.email-chip svg {
  flex-shrink: 0;
  color: #16a34a;
}

.steps {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 18px;
}

.step {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12.5px;
  color: #374151;
}

.step-n {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0f766e, #22c55e);
  color: white;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-l {
  line-height: 1.4;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 10px;
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

.btn-spinner {
  width: 15px;
  height: 15px;
  border: 2px solid rgba(15, 118, 110, 0.25);
  border-top-color: #0f766e;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  display: inline-block;
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

.links {
  margin-top: 16px;
  font-size: 13px;
}

.links a {
  color: #16a34a;
  font-weight: 600;
  text-decoration: none;
}

.links a:hover {
  text-decoration: underline;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
