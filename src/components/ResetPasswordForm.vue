<template>
  <form @submit.prevent="emit('submit')">
    <div v-if="tokenMissing" class="error-msg">{{ i18n.t.verify_error }}</div>
    <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
    <div v-if="successMsg" class="success-msg">{{ successMsg }}</div>
    <div class="form-group">
      <label>{{ i18n.t.password }}</label>
      <div class="password-wrap">
        <input v-model="passwordModel" :type="showPassword ? 'text' : 'password'" class="input"
          :placeholder="i18n.t.password" minlength="8" required @focus="emit('password-focus')"
          @blur="emit('password-blur')" />
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
      <div v-if="password" class="pw-meter">
        <div class="pw-bars">
          <span v-for="i in 5" :key="i" class="pw-bar"
            :style="pwScore >= i ? { background: strengthColor } : {}"></span>
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
</template>

<script setup>
import { computed } from "vue";

const props = defineProps([
  "password",
  "showPassword",
  "tokenMissing",
  "errorMsg",
  "successMsg",
  "pwScore",
  "strengthColor",
  "strengthLabel",
  "pwRules",
  "showPwRules",
  "submitting",
  "i18n",
]);
const emit = defineEmits([
  "submit",
  "update:password",
  "update:showPassword",
  "password-focus",
  "password-blur",
]);

const passwordModel = computed({
  get: () => props.password,
  set: (value) => emit("update:password", value),
});

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

.pw-meter {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.pw-bars {
  display: flex;
  gap: 4px;
  flex: 1;
}

.pw-bar {
  height: 5px;
  flex: 1;
  border-radius: 3px;
  background: #e5e7eb;
  transition: background 0.2s ease;
}

.pw-label {
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.pw-rules {
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3px 10px;
  text-align: left;
}

.pw-rules li {
  font-size: 11px;
  color: #9ca3af;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: color 0.2s ease;
}

.pw-rules li::before {
  content: "○";
  font-size: 10px;
}

.pw-rules li.ok {
  color: #16a34a;
}

.pw-rules li.ok::before {
  content: "●";
}

.pw-slide-enter-active,
.pw-slide-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.pw-slide-enter-from,
.pw-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
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

.success-msg {
  background: #e8f5e9;
  border: 1.5px solid #a5d6a7;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  color: #2d7a2d;
  margin-bottom: 12px;
}
</style>
