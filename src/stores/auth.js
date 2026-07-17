// frontend/src/stores/auth.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const useAuthStore = defineStore("auth", () => {
  const token = ref(localStorage.getItem("admin_token") || null);
  if (token.value) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token.value}`;
  }

  let savedUser = null;
  let savedRestaurant = null;
  try {
    savedUser = JSON.parse(localStorage.getItem("admin_user"));
    savedRestaurant = JSON.parse(localStorage.getItem("admin_restaurant"));
  } catch (e) {
    localStorage.removeItem("admin_user");
    localStorage.removeItem("admin_restaurant");
  }
  const user = ref(savedUser);
  const restaurant = ref(savedRestaurant);

  const isLoggedIn = computed(() => !!token.value);
  const isEmailVerified = computed(() => user.value?.emailVerified === true);
  const isOwner = computed(() => user.value?.role === "owner");
  const isSuperAdmin = computed(() => user.value?.role === "super_admin");
  const restaurantId = computed(() => restaurant.value?.id || null);
  const restaurantSlug = computed(() => restaurant.value?.slug || null);
  const linkCode = computed(() => restaurant.value?.telegramLinkCode || null);
  const telegramChatId = computed(() => restaurant.value?.telegramChatId || null);
  const isTelegramLinked = computed(() => !!restaurant.value?.telegramChatId);
  const defaultLanguage = computed(() => restaurant.value?.defaultLanguage || "km");

  async function login(email, password) {
    const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
    token.value = res.data.token;
    user.value = res.data.user;
    restaurant.value = res.data.restaurant;
    saveToStorage();
    axios.defaults.headers.common["Authorization"] = `Bearer ${token.value}`;
  }

  async function register(formData) {
    const res = await axios.post(`${API_BASE_URL}/api/auth/register`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    // Don't auto-login after registration — user must verify email first
    // Only save token if the backend explicitly returns one (for direct activation flows)
    if (res.data.token) {
      token.value = res.data.token;
      user.value = res.data.user;
      restaurant.value = res.data.restaurant || null;
      saveToStorage();
      axios.defaults.headers.common["Authorization"] = `Bearer ${token.value}`;
    }
    return res.data;
  }

  function saveToStorage() {
    localStorage.setItem("admin_token", token.value);
    localStorage.setItem("admin_user", JSON.stringify(user.value));
    localStorage.setItem("admin_restaurant", JSON.stringify(restaurant.value));
  }

  function logout() {
    token.value = null;
    user.value = null;
    restaurant.value = null;
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    localStorage.removeItem("admin_restaurant");
    delete axios.defaults.headers.common["Authorization"];
  }

  function restoreToken() {
    if (token.value) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token.value}`;
    }
  }

  return {
    token, user, restaurant,
    isLoggedIn, isEmailVerified, isOwner, isSuperAdmin,
    restaurantId, restaurantSlug,
    linkCode, telegramChatId, isTelegramLinked, defaultLanguage,
    login, register, logout, restoreToken, saveToStorage,
  };
});
