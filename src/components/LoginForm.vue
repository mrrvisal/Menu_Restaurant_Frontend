<template>
  <form @submit.prevent="emit('submit')">
    <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
    <div v-else-if="sessionExpired" class="expired-banner">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <span>{{ i18n.t.session_expired }}</span>
    </div>
    <div v-if="superAdminHint" class="super-admin-hint">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round" class="hint-shield">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
      <div class="hint-text">
        <strong>{{ i18n.t.super_admin_hint_title }}</strong>
        <p>{{ i18n.t.super_admin_hint_desc }}</p>
      </div>
      <router-link to="/login/super-admin" class="hint-link">
        {{ i18n.t.super_admin_portal }}
      </router-link>
    </div>
    <div v-if="verifyRequired" class="verify-banner">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
      <div class="verify-banner-text">
        <strong>{{ i18n.t.please_verify }}</strong>
        <p>{{ i18n.t.please_verify_desc }}</p>
      </div>
      <div class="verify-banner-actions">
        <button class="btn-verify" @click="emit('open-mail-app')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
          {{ i18n.t.open_email }}
        </button>
        <button class="btn-verify" :disabled="resending" @click="emit('resend-verification')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          {{ resending ? i18n.t.loading : i18n.t.resend_email }}
        </button>
      </div>
    </div>

    <div class="form-group">
      <label>{{ i18n.t.email }}</label>
      <input v-model="form.email" type="email" class="input" placeholder="your@email.com" autocomplete="username"
        required />
    </div>

    <div class="form-group">
      <div class="links">
        <label>{{ i18n.t.password }}</label>
        <router-link to="/forgot-password">{{ i18n.t.forgot_password }}</router-link>
      </div>
      <div class="password-wrap">
        <input v-model="form.password" :type="showPassword ? 'text' : 'password'" class="input"
          :placeholder="i18n.t.password" autocomplete="current-password" required />
        <button type="button" class="toggle-password" @click="togglePassword" tabindex="-1">
          <svg v-if="showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path
              d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </div>
    </div>

    <button type="submit" class="btn" :disabled="submitting">
      {{ submitting ? i18n.t.loading : i18n.t.login }}
    </button>
  </form>
</template>

<script setup>
const props = defineProps([
  "form",
  "errorMsg",
  "sessionExpired",
  "superAdminHint",
  "verifyRequired",
  "resending",
  "submitting",
  "showPassword",
  "i18n",
]);
const emit = defineEmits(["submit", "open-mail-app", "resend-verification", "update:showPassword"]);

function togglePassword() {
  emit("update:showPassword", !props.showPassword);
}
</script>

<style scoped>
.form-group {
  margin-bottom: 14px;
  text-align: left;
}

.form-group label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 5px;
  display: block;
}

.input {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid #bbf7d0;
  border-radius: 10px;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  box-sizing: border-box;
}

.input:focus {
  border-color: #4ade80;
}

.password-wrap {
  position: relative;
}

.password-wrap .input {
  padding-right: 40px;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  padding: 4px;
  display: flex;
  align-items: center;
}

.toggle-password:hover {
  color: #374151;
}

.btn {
  width: 100%;
  padding: 13px;
  background: linear-gradient(135deg, #0f766e, #22c55e);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 8px;
}

@media (max-width: 480px) {
  .btn {
    padding: 11px;
    font-size: 14px;
  }
}

.btn:disabled {
  background: #9e9e9e;
  cursor: not-allowed;
}

.error-msg {
  background: #fbe9e7;
  border: 1.5px solid #ffccbc;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  color: #c62828;
  margin-bottom: 12px;
}

.super-admin-hint {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #fef3c7;
  border: 1.5px solid #fcd34d;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 12px;
  text-align: left;
}

.super-admin-hint .hint-shield {
  flex-shrink: 0;
  color: #b45309;
  margin-top: 2px;
}

.super-admin-hint .hint-text {
  flex: 1;
  min-width: 0;
}

.super-admin-hint .hint-text strong {
  display: block;
  font-size: 13px;
  color: #92400e;
}

.super-admin-hint .hint-text p {
  font-size: 12px;
  color: #92400e;
  margin: 4px 0 0;
  line-height: 1.5;
}

.super-admin-hint .hint-link {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  align-self: center;
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  font-family: inherit;
  background: #b45309;
  color: white;
  text-decoration: none;
  white-space: nowrap;
}

.super-admin-hint .hint-link:hover {
  background: #92400e;
}

.links {
  margin-top: 12px;
  font-size: 13px;
  color: #6b7280;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.links a {
  color: #16a34a;
  font-weight: 600;
  text-decoration: none;
}

.links a:hover {
  text-decoration: underline;
}

.verify-banner {
  background: #fefce8;
  border: 1.5px solid #fde68a;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 14px;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.verify-banner svg {
  flex-shrink: 0;
  color: #92400e;
}

.verify-banner-text strong {
  font-size: 13px;
  color: #92400e;
  display: block;
}

.verify-banner-text p {
  font-size: 12px;
  color: #92400e;
  margin: 4px 0 0;
  line-height: 1.5;
}

.verify-banner-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.btn-verify {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #fde68a;
  background: white;
  color: #92400e;
  text-decoration: none;
}

.btn-verify:hover {
  background: #fef3c7;
  transform: translateY(-1px);
}

.btn-verify:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.expired-banner {
  background: #eff6ff;
  border: 1.5px solid #bfdbfe;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  color: #1d4ed8;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;
}

.expired-banner svg {
  flex-shrink: 0;
}
</style>
