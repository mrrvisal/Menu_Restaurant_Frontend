<!-- frontend/src/views/LoginView.vue -->
<template>
  <div class="login-page">
    <div class="login-card pop-in">
      <div class="login-icon">🔐</div>
      <div class="login-title">Admin Login</div>

      <div class="form-group">
        <input v-model="username" class="form-input" placeholder="Username"
          @keyup.enter="submit" />
      </div>
      <div class="form-group">
        <input v-model="password" type="password" class="form-input" placeholder="Password"
          @keyup.enter="submit" />
      </div>

      <div v-if="errorMsg" class="error-msg">⚠️ {{ errorMsg }}</div>

      <button class="login-btn" :disabled="loading" @click="submit">
        {{ loading ? '⏳ ...' : '🔓 ចូល' }}
      </button>
      <button class="back-btn" @click="router.push('/')">← ត្រឡប់មកមើលមីនុយ</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const route  = useRoute();
const auth   = useAuthStore();

const username = ref('');
const password = ref('');
const loading  = ref(false);
const errorMsg = ref('');

async function submit() {
  errorMsg.value = '';
  if (!username.value || !password.value) { errorMsg.value = 'សូមបញ្ចូល Username និង Password'; return; }
  loading.value = true;
  try {
    await auth.login(username.value, password.value);
    const redirect = route.query.redirect || '/admin';
    router.push(redirect);
  } catch (e) {
    errorMsg.value = e.response?.data?.error || 'Login failed';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh; background: var(--green-pale);
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.login-card {
  background: white; border-radius: 22px; width: 100%; max-width: 320px;
  padding: 36px 28px; text-align: center; box-shadow: 0 10px 40px var(--shadow);
}
.login-icon  { font-size: 48px; margin-bottom: 10px; }
.login-title { font-family: 'Hanuman', serif; font-size: 22px; font-weight: 700; color: var(--green-dark); margin-bottom: 15px; }
.login-sub   { font-size: 12px; color: var(--text-light); margin-bottom: 24px; }
.form-group  { margin-bottom: 12px; text-align: left; }
.form-input {
  width: 100%; padding: 11px 14px; border: 1.5px solid var(--green-soft);
  border-radius: 10px; font-size: 14px; font-family: inherit;
  outline: none; color: var(--text-dark); transition: border .2s;
}
.form-input:focus { border-color: var(--green-mid); }
.error-msg { background: #fbe9e7; border: 1.5px solid #ffccbc; border-radius: 8px; padding: 8px 12px; font-size: 13px; color: #c62828; margin-bottom: 12px; }
.login-btn {
  width: 100%; padding: 13px; background: var(--green-mid); color: white;
  border: none; border-radius: 12px; font-size: 15px; font-family: inherit;
  font-weight: 700; cursor: pointer; transition: background .2s; margin-bottom: 10px;
}
.login-btn:hover    { background: var(--green-dark); }
.login-btn:disabled { background: #9e9e9e; cursor: not-allowed; }
.back-btn {
  width: 100%; padding: 10px; background: transparent; color: var(--text-mid);
  border: 1.5px solid var(--green-soft); border-radius: 10px; font-size: 13px;
  font-family: inherit; cursor: pointer; transition: all .2s;
}
.back-btn:hover { background: var(--green-pale); }
</style>
