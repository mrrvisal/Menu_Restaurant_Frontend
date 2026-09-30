// Restaurant switching / creation, the one-menu-per-restaurant bootstrap and
// the full "reload everything for the selected restaurant" sequence — moved
// verbatim out of AdminView.vue. Singleton refs (same pattern as the other
// useAdmin* composables) so the sidebar and the menu strip share one state.
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useFoodsStore } from "@/stores/foods";
import { useI18nStore } from "@/stores/i18n";
import { useThemeStore } from "@/stores/theme";
import { useCurrencyStore } from "@/stores/currency";
import { adminTab } from "@/composables/useAdminTab";
import {
  curCat,
  searchQ,
  menuCreating,
  load,
} from "@/composables/useAdminFoods";
import { fetchOrders } from "@/composables/useAdminOrders";
import { fetchStats } from "@/composables/useAdminStats";
import { fetchReport } from "@/composables/useAdminReports";
import {
  connectOrderStream,
  disconnectOrderStream,
} from "@/composables/useAdminStream";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;
const auth = useAuthStore();
const foods = useFoodsStore();
const i18n = useI18nStore();
const theme = useThemeStore();
const currencyStore = useCurrencyStore();

// ─── RESTAURANT SWITCHING / CREATION ───────────────────────
async function onSwitchRestaurant(value) {
  const id = Number(value);
  auth.setCurrentRestaurant(id);
  syncRestaurantTheme();
  currencyStore.setFrom(auth.restaurant);
  curCat.value = "";
  searchQ.value = "";
  await initForRestaurant();
}

const showAddRestaurant = ref(false);
const addRestaurantName = ref("");
const addRestaurantSubmitting = ref(false);
const addRestaurantMsg = ref("");
const addRestaurantError = ref("");

function openAddRestaurant() {
  addRestaurantName.value = "";
  addRestaurantMsg.value = "";
  addRestaurantError.value = "";
  showAddRestaurant.value = true;
}

async function submitAddRestaurant() {
  addRestaurantError.value = "";
  addRestaurantMsg.value = "";
  if (!addRestaurantName.value.trim()) {
    addRestaurantError.value = i18n.t.restaurant_name_required;
    return;
  }
  addRestaurantSubmitting.value = true;
  try {
    const res = await axios.post(`${API_BASE}/api/auth/restaurants`, {
      name: addRestaurantName.value.trim(),
    });
    // Refresh the restaurants list
    await auth.fetchMe();
    if (res.data.restaurant) auth.setCurrentRestaurant(res.data.restaurant.id);
    await initForRestaurant();
    addRestaurantMsg.value = i18n.t.restaurant_created;
    setTimeout(() => {
      showAddRestaurant.value = false;
    }, 1100);
  } catch (err) {
    addRestaurantError.value =
      err.response?.data?.code === "DUPLICATE_RESTAURANT"
        ? i18n.t.dup_restaurant ||
          "You already have a restaurant with this name"
        : err.response?.data?.error || i18n.t.generic_error;
  } finally {
    addRestaurantSubmitting.value = false;
  }
}

// ─── MENU HANDLING (one menu per restaurant) ───────────────
async function ensureDefaultMenu() {
  if (!auth.restaurantId) return;
  if (menuCreating.value) return;
  menuCreating.value = true;
  try {
    const created = await foods.addMenu("Default Menu");
    auth.setCurrentMenu(created.id);
    await foods.fetchMenus();
    await refreshCurrentMenuSelection();
    await initForRestaurant();
  } catch (err) {
    console.error("Could not create menu:", err);
  } finally {
    menuCreating.value = false;
  }
}

// Ensure currentMenuId points to an existing menu; default to first.

function refreshCurrentMenuSelection() {
  if (
    !auth.currentMenuId ||
    !foods.menus.some((m) => m.id === auth.currentMenuId)
  ) {
    auth.setCurrentMenu(foods.menus.length ? foods.menus[0].id : null);
  }
}

async function loadCategories() {
  const params = {};
  if (auth.currentMenuId) params.menu_id = auth.currentMenuId;
  await foods.fetchCategories(params);
}

async function initForRestaurant() {
  // Load menus for the (new) current restaurant
  await foods.fetchMenus();
  refreshCurrentMenuSelection();
  // When switching restaurants, drop the previous menu's category selection
  curCat.value = "";
  searchQ.value = "";
  await loadCategories();
  await load();
  // Refresh orders for the selected restaurant — also re-seeds the
  // notification bell via the watch(orders) → seedNotificationsFromOrders.
  await fetchOrders();
  fetchStats();
  // The Reports tab is restaurant-scoped too — refresh it when it is open
  if (adminTab.value === "reports") fetchReport();
  // Reconnect the order stream to the selected restaurant
  disconnectOrderStream();
  connectOrderStream();
}

// The owner sees the color that their customers see (the restaurant's saved color)
function syncRestaurantTheme() {
  const c = auth.restaurant?.themeColor;
  if (c) theme.setPrimary(c, { persist: false });
}

export function useAdminRestaurant() {
  return {
    showAddRestaurant,
    addRestaurantName,
    addRestaurantSubmitting,
    addRestaurantMsg,
    addRestaurantError,
    openAddRestaurant,
    submitAddRestaurant,
    onSwitchRestaurant,
    initForRestaurant,
    ensureDefaultMenu,
    refreshCurrentMenuSelection,
    loadCategories,
    syncRestaurantTheme,
  };
}
