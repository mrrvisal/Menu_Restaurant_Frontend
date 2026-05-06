// frontend/src/stores/auth.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const useAuthStore = defineStore('auth', () => {
  const token    = ref(localStorage.getItem('admin_token') || null);
  const username = ref(localStorage.getItem('admin_user')  || null);

  const isLoggedIn = computed(() => !!token.value);

  async function login(u, p) {
    const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { username: u, password: p });
    token.value    = res.data.token;
    username.value = res.data.username;
    localStorage.setItem('admin_token', token.value);
    localStorage.setItem('admin_user',  username.value);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
  }

  function logout() {
    token.value    = null;
    username.value = null;
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    delete axios.defaults.headers.common['Authorization'];
  }

  function restoreToken() {
    if (token.value) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
    }
  }

  return { token, username, isLoggedIn, login, logout, restoreToken };
});
