import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "axios";
import { useThemeStore } from "@/stores/theme";
import { getDeviceInfo, attachDeviceHeader } from "@/utils/device";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const useAuthStore = defineStore("auth", () => {
  // ─── AUTH TOKENS & SESSION STATE ──────────────────────────
  const token = ref(localStorage.getItem("admin_token") || null);
  if (token.value) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token.value}`;
  }
  attachDeviceHeader(axios);

  const sessionRevoked = ref(false);
  const sessionExpired = ref(
    localStorage.getItem("admin_session_expired") === "1",
  );
  const refreshToken = ref(localStorage.getItem("admin_refresh_token") || null);

  function markSessionExpired() {
    sessionExpired.value = true;
    localStorage.setItem("admin_session_expired", "1");
  }

  function clearSessionExpired() {
    sessionExpired.value = false;
    localStorage.removeItem("admin_session_expired");
  }

  // ─── TOKEN REFRESH LOGIC ──────────────────────────────────
  let refreshPromise = null;
  function refreshSession() {
    if (!refreshPromise) {
      refreshPromise = doRefresh().finally(() => {
        refreshPromise = null;
      });
    }
    return refreshPromise;
  }

  async function doRefresh() {
    const rt =
      localStorage.getItem("admin_refresh_token") || refreshToken.value;
    if (!rt) {
      const err = new Error("no refresh token");
      err.noRefreshToken = true;
      throw err;
    }
    const res = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
      refreshToken: rt,
    });
    token.value = res.data.token;
    refreshToken.value = res.data.refreshToken || rt;
    if (res.data.user) user.value = res.data.user;
    axios.defaults.headers.common["Authorization"] = `Bearer ${token.value}`;
    saveToStorage();
    return res.data;
  }

  function endExpiredSession() {
    if (!token.value && !refreshToken.value) return;
    markSessionExpired();
    logout();
    if (!window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
  }

  // ─── AXIOS RESPONSE INTERCEPTOR ───────────────────────────
  axios.interceptors.response.use(
    (res) => res,
    async (err) => {
      const original = err.config;
      const status = err?.response?.status;
      const code = err?.response?.data?.code;

      if (status === 401 && code === "device_revoked" && token.value) {
        sessionRevoked.value = true;
        logout();
        window.location.href = "/login";
        return Promise.reject(err);
      }

      // Renew expired token and retry request once
      if (
        status === 401 &&
        code === "token_expired" &&
        original &&
        !original._retry
      ) {
        original._retry = true;
        try {
          await refreshSession();
          original.headers = {
            ...original.headers,
            Authorization: `Bearer ${token.value}`,
          };
          return axios(original);
        } catch (e) {
          if (e?.response || e?.noRefreshToken) endExpiredSession();
          return Promise.reject(err);
        }
      }

      if (status === 401 && code === "token_invalid" && token.value) {
        endExpiredSession();
      }
      return Promise.reject(err);
    },
  );

  // ─── USER & RESTAURANT STATE ──────────────────────────────
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
  const restaurants = ref(
    Array.isArray(savedRestaurants) ? savedRestaurants : [],
  );
  const currentRestaurantId = ref(
    Number(localStorage.getItem("current_restaurant_id")) || null,
  );
  const currentMenuId = ref(
    Number(localStorage.getItem("current_menu_id")) || null,
  );

  function setCurrentMenu(id) {
    const num = Number(id);
    currentMenuId.value = num || null;
    if (num) localStorage.setItem("current_menu_id", String(num));
    else localStorage.removeItem("current_menu_id");
  }

  // Derive current restaurant with fallback to first owned
  const restaurant = computed(() => {
    if (currentRestaurantId.value) {
      const found = restaurants.value.find(
        (r) => r.id === currentRestaurantId.value,
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
  const telegramChatId = computed(
    () => restaurant.value?.telegramChatId || null,
  );
  const isTelegramLinked = computed(() => !!restaurant.value?.telegramChatId);
  const defaultLanguage = computed(
    () => restaurant.value?.defaultLanguage || "km",
  );

  function setCurrentRestaurant(id) {
    const num = Number(id);
    if (restaurants.value.some((r) => r.id === num)) {
      currentRestaurantId.value = num;
      localStorage.setItem("current_restaurant_id", String(num));
    }
  }

  // ─── AUTH ACTIONS ─────────────────────────────────────────
  function applySession(data) {
    token.value = data.token;
    if (data.refreshToken) refreshToken.value = data.refreshToken;
    clearSessionExpired();
    user.value = data.user;
    restaurants.value = Array.isArray(data.restaurants)
      ? data.restaurants
      : data.restaurant
        ? [data.restaurant]
        : [];

    // Avoid carrying over previous account's selected IDs
    const first = restaurants.value[0]?.id || null;
    currentRestaurantId.value = first;
    currentMenuId.value = null;
    if (first) {
      localStorage.setItem("current_restaurant_id", String(first));
      localStorage.removeItem("current_menu_id");
    } else {
      localStorage.removeItem("current_restaurant_id");
      localStorage.removeItem("current_menu_id");
    }

    saveToStorage();
    axios.defaults.headers.common["Authorization"] = `Bearer ${token.value}`;
    useThemeStore().load();
  }

  async function login(email, password) {
    const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email,
      password,
      deviceInfo: getDeviceInfo(),
    });
    applySession(res.data);
  }

  async function superAdminLogin(email, password) {
    const res = await axios.post(`${API_BASE_URL}/api/auth/login/super-admin`, {
      email,
      password,
      deviceInfo: getDeviceInfo(),
    });
    applySession(res.data);
  }

  async function register(payload) {
    const res = await axios.post(`${API_BASE_URL}/api/auth/register`, payload);
    if (res.data.token) {
      token.value = res.data.token;
      if (res.data.refreshToken) refreshToken.value = res.data.refreshToken;
      user.value = res.data.user;
      restaurants.value = Array.isArray(res.data.restaurants)
        ? res.data.restaurants
        : res.data.restaurant
          ? [res.data.restaurant]
          : [];
      if (restaurants.value.length)
        currentRestaurantId.value = restaurants.value[0].id;
      saveToStorage();
      axios.defaults.headers.common["Authorization"] = `Bearer ${token.value}`;
    }
    return res.data;
  }

  async function loginWithGoogle(credential, options = {}) {
    const res = await axios.post(`${API_BASE_URL}/api/auth/google`, {
      credential,
      deviceInfo: getDeviceInfo(),
      superAdminOnly: options.superAdminOnly === true,
    });
    applySession(res.data);
  }

  // Fetch latest user and restaurant profiles
  async function fetchMe() {
    const res = await axios.get(`${API_BASE_URL}/api/auth/me`);
    user.value = res.data.user;
    restaurants.value = Array.isArray(res.data.restaurants)
      ? res.data.restaurants
      : [];

    if (
      currentRestaurantId.value &&
      !restaurants.value.some((r) => r.id === currentRestaurantId.value)
    ) {
      currentRestaurantId.value = restaurants.value[0]?.id || null;
      if (currentRestaurantId.value) {
        localStorage.setItem(
          "current_restaurant_id",
          String(currentRestaurantId.value),
        );
      } else {
        localStorage.removeItem("current_restaurant_id");
      }
    }
    saveToStorage();
    useThemeStore().load();
    return res.data;
  }

  // Update own email or password
  async function updateAccount(payload) {
    const res = await axios.patch(`${API_BASE_URL}/api/auth/account`, payload);
    if (res.data.token) {
      token.value = res.data.token;
      if (res.data.refreshToken) refreshToken.value = res.data.refreshToken;
      axios.defaults.headers.common["Authorization"] = `Bearer ${token.value}`;
    }
    if (res.data.user) user.value = res.data.user;
    saveToStorage();
    return res.data;
  }

  function updateCurrentRestaurant(patch) {
    const idx = restaurants.value.findIndex((r) => r.id === restaurantId.value);
    if (idx !== -1) {
      restaurants.value[idx] = { ...restaurants.value[idx], ...patch };
    }
    saveToStorage();
  }

  function saveToStorage() {
    localStorage.setItem("admin_token", token.value);
    if (refreshToken.value) {
      localStorage.setItem("admin_refresh_token", refreshToken.value);
    } else {
      localStorage.removeItem("admin_refresh_token");
    }
    localStorage.setItem("admin_user", JSON.stringify(user.value));
    localStorage.setItem(
      "admin_restaurants",
      JSON.stringify(restaurants.value),
    );
  }

  function logout() {
    token.value = null;
    refreshToken.value = null;
    user.value = null;
    restaurants.value = [];
    currentRestaurantId.value = null;
    useThemeStore().reset({ persist: false });
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_refresh_token");
    localStorage.removeItem("admin_user");
    localStorage.removeItem("admin_restaurants");
    localStorage.removeItem("current_restaurant_id");
    delete axios.defaults.headers.common["Authorization"];

    if (typeof window !== "undefined" && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.disableAutoSelect();
      } catch (e) {
        // GSI not initialized
      }
    }
  }

  function restoreToken() {
    if (token.value) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token.value}`;
    }
  }

  // ─── JWT HELPER ───────────────────────────────────────────
  function tokenExpiresAt(jwt) {
    try {
      const payload = JSON.parse(
        atob(jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
      );
      return payload.exp ? payload.exp * 1000 : null;
    } catch (e) {
      return null;
    }
  }

  // Renew token if nearing expiration (within skewMs)
  async function ensureFreshToken(skewMs = 5 * 60 * 1000) {
    if (!token.value) return;
    const exp = tokenExpiresAt(token.value);
    if (exp && exp - Date.now() > skewMs) return;
    try {
      await refreshSession();
    } catch (e) {
      if (e?.response || e?.noRefreshToken) endExpiredSession();
    }
  }

  return {
    token,
    user,
    restaurant,
    restaurants,
    currentRestaurantId,
    isLoggedIn,
    isEmailVerified,
    isOwner,
    isSuperAdmin,
    sessionRevoked,
    sessionExpired,
    clearSessionExpired,
    restaurantId,
    restaurantSlug,
    linkCode,
    telegramChatId,
    isTelegramLinked,
    defaultLanguage,
    login,
    superAdminLogin,
    register,
    loginWithGoogle,
    fetchMe,
    updateAccount,
    logout,
    restoreToken,
    saveToStorage,
    ensureFreshToken,
    setCurrentRestaurant,
    updateCurrentRestaurant,
    setCurrentMenu,
    currentMenuId,
  };
});
