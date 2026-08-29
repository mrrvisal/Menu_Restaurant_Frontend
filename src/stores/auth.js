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
  let savedRestaurants = null;
  try {
    savedUser = JSON.parse(localStorage.getItem("admin_user"));
    savedRestaurants = JSON.parse(localStorage.getItem("admin_restaurants"));
  } catch (e) {
    localStorage.removeItem("admin_user");
    localStorage.removeItem("admin_restaurants");
  }
  const user = ref(savedUser);
  // ALL restaurants owned by this account
  const restaurants = ref(Array.isArray(savedRestaurants) ? savedRestaurants : []);
  // Currently selected restaurant id (persisted so refresh keeps your selection)
  const currentRestaurantId = ref(
    Number(localStorage.getItem("current_restaurant_id")) || null
  );
  // Currently selected menu id (per session UI selection)
  const currentMenuId = ref(Number(localStorage.getItem("current_menu_id")) || null);

  function setCurrentMenu(id) {
    const num = Number(id);
    currentMenuId.value = num || null;
    if (num) localStorage.setItem("current_menu_id", String(num));
    else localStorage.removeItem("current_menu_id");
  }

  // Keep the legacy singular `restaurant` getter working by deriving it from
  // the current selection (falls back to the first owned restaurant).
  const restaurant = computed(() => {
    if (currentRestaurantId.value) {
      const found = restaurants.value.find(
        (r) => r.id === currentRestaurantId.value
      );
      if (found) return found;
    }
    return restaurants.value[0] || null;
  });

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

  function setCurrentRestaurant(id) {
    const num = Number(id);
    if (restaurants.value.some((r) => r.id === num)) {
      currentRestaurantId.value = num;
      localStorage.setItem("current_restaurant_id", String(num));
    }
  }

  async function login(email, password) {
    const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
    token.value = res.data.token;
    user.value = res.data.user;
    // Backend now returns `restaurants` array; keep old `restaurant` fallback
    restaurants.value = Array.isArray(res.data.restaurants)
      ? res.data.restaurants
      : res.data.restaurant
        ? [res.data.restaurant]
        : [];
    if (!currentRestaurantId.value && restaurants.value.length) {
      currentRestaurantId.value = restaurants.value[0].id;
    }
    saveToStorage();
    axios.defaults.headers.common["Authorization"] = `Bearer ${token.value}`;
  }

  async function register(payload) {
    const res = await axios.post(`${API_BASE_URL}/api/auth/register`, payload);
    // Don't auto-login after registration — user must verify email first
    if (res.data.token) {
      token.value = res.data.token;
      user.value = res.data.user;
      restaurants.value = Array.isArray(res.data.restaurants)
        ? res.data.restaurants
        : res.data.restaurant
          ? [res.data.restaurant]
          : [];
      if (restaurants.value.length) currentRestaurantId.value = restaurants.value[0].id;
      saveToStorage();
      axios.defaults.headers.common["Authorization"] = `Bearer ${token.value}`;
    }
    return res.data;
  }

  // Fetch latest user + restaurants from the backend
  async function fetchMe() {
    const res = await axios.get(`${API_BASE_URL}/api/auth/me`);
    user.value = res.data.user;
    restaurants.value = Array.isArray(res.data.restaurants)
      ? res.data.restaurants
      : [];
    saveToStorage();
    return res.data;
  }

  // Update the current restaurant's cached fields after edits
  function updateCurrentRestaurant(patch) {
    const idx = restaurants.value.findIndex((r) => r.id === restaurantId.value);
    if (idx !== -1) {
      restaurants.value[idx] = { ...restaurants.value[idx], ...patch };
    }
    saveToStorage();
  }

  function saveToStorage() {
    localStorage.setItem("admin_token", token.value);
    localStorage.setItem("admin_user", JSON.stringify(user.value));
    localStorage.setItem("admin_restaurants", JSON.stringify(restaurants.value));
  }

  function logout() {
    token.value = null;
    user.value = null;
    restaurants.value = [];
    currentRestaurantId.value = null;
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    localStorage.removeItem("admin_restaurants");
    localStorage.removeItem("current_restaurant_id");
    delete axios.defaults.headers.common["Authorization"];
  }

  function restoreToken() {
    if (token.value) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token.value}`;
    }
  }

  return {
    token, user, restaurant, restaurants, currentRestaurantId,
    isLoggedIn, isEmailVerified, isOwner, isSuperAdmin,
    restaurantId, restaurantSlug,
    linkCode, telegramChatId, isTelegramLinked, defaultLanguage,
    login, register, fetchMe, logout, restoreToken, saveToStorage,
    setCurrentRestaurant, updateCurrentRestaurant, setCurrentMenu, currentMenuId,
  };
});
