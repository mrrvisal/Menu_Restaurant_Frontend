<template>
  <form @submit.prevent="emit('submit')">
    <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

    <div class="form-group">
      <label>{{ i18n.t.email }}</label>
      <input v-model="form.email" type="email" class="input" placeholder="admin@menu.com" autocomplete="username"
        required />
    </div>

    <div class="form-group">
      <label>{{ i18n.t.password }}</label>
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
      {{ submitting ? i18n.t.loading : i18n.t.super_admin_login }}
    </button>
  </form>
</template>

<script setup>
const props = defineProps(["form", "errorMsg", "showPassword", "submitting", "i18n"]);
const emit = defineEmits(["submit", "update:showPassword"]);

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
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #44403c;
  margin-bottom: 6px;
}

.input {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #e7e5e4;
  border-radius: 12px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.input:focus {
  border-color: #f59e0b;
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
  background: linear-gradient(135deg, #b45309, #f59e0b);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 8px;
  box-shadow: 0 6px 18px rgba(245, 158, 11, 0.3);
}

.btn:hover {
  filter: brightness(1.05);
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
  box-shadow: none;
}

.error-msg {
  background: #fbe9e7;
  border: 1.5px solid #ffccbc;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  color: #c62828;
  margin-bottom: 12px;
  text-align: left;
}
</style>
