// frontend/src/stores/auth.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "axios";
import { useThemeStore } from "@/stores/theme";
import { getDeviceInfo, attachDeviceHeader } from "@/utils/device";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const useAuthStore = defineStore("auth", () => {
  const token = ref(localStorage.getItem("admin_token") || null);
  if (token.value) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token.value}`;
  }
  // Identify THIS device on every request so the backend can track
  // where/when the account is accessed (device sessions feature).
  attachDeviceHeader(axios);

  // Set when the backend answers 401 device_revoked (the owner removed
  // this device from the account) — forces a clean local logout.
  const sessionRevoked = ref(false);
  axios.interceptors.response.use(
    (res) => res,
    (err) => {
      if (
        err?.response?.status === 401 &&
        err?.response?.data?.code === "device_revoked" &&
        token.value
      ) {
        sessionRevoked.value = true;
        logout();
        window.location.href = "/login";
      }
      return Promise.reject(err);
    },
  );

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
    const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email,
      password,
      deviceInfo: getDeviceInfo(),
    });
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
    // Load this account's own theme color (defaults to brand teal)
    useThemeStore().load();
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

  // Sign in with Google (credential = Google ID token from Google Identity Services)
  async function loginWithGoogle(credential) {
    const res = await axios.post(`${API_BASE_URL}/api/auth/google`, {
      credential,
      deviceInfo: getDeviceInfo(),
    });
    token.value = res.data.token;
    user.value = res.data.user;
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
    useThemeStore().load();
  }

  // Fetch latest user + restaurants from the backend
  async function fetchMe() {
    const res = await axios.get(`${API_BASE_URL}/api/auth/me`);
    user.value = res.data.user;
    restaurants.value = Array.isArray(res.data.restaurants)
      ? res.data.restaurants
      : [];
    saveToStorage();
    useThemeStore().load();
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
    // Reset the UI to the brand color WITHOUT overwriting this user's saved
    // choice (persist=false) — so the next account on this device starts clean
    useThemeStore().reset({ persist: false });
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
    isLoggedIn, isEmailVerified, isOwner, isSuperAdmin, sessionRevoked,
    restaurantId, restaurantSlug,
    linkCode, telegramChatId, isTelegramLinked, defaultLanguage,
    login, register, loginWithGoogle, fetchMe, logout, restoreToken, saveToStorage,
    setCurrentRestaurant, updateCurrentRestaurant, setCurrentMenu, currentMenuId,
  };
});
