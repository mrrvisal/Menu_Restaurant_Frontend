// Orders list, date grouping (Today / history), date search and the
// midnight re-group timer — moved verbatim out of AdminView.vue.
// Module-level state = ONE shared source (sidebar badge, SSE stream and the
// Orders tab all read the same refs — same singleton pattern as useInstallUi).
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useI18nStore } from "@/stores/i18n";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;
const auth = useAuthStore();
const i18n = useI18nStore();

// ─── ORDERS STATE ──────────────────────────────────────────
export const orders = ref([]);
const ordersLoading = ref(false);

export async function fetchOrders() {
  // An account without a restaurant has no orders — skip the call (the
  // backend would answer 404 "No restaurant found for this account").
  if (!auth.restaurantId) {
    orders.value = [];
    return;
  }
  ordersLoading.value = true;
  try {
    // Scope the list to the restaurant selected in the dashboard. Without
    // restaurant_id the backend falls back to the account's FIRST restaurant,
    // so switching restaurants kept showing the other one's orders.
    const res = await axios.get(`${API_BASE}/api/orders`, {
      params: auth.restaurantId ? { restaurant_id: auth.restaurantId } : {},
    });
    orders.value = res.data;
  } catch (err) {
    console.error(err);
  } finally {
    ordersLoading.value = false;
  }
}

async function updateOrderStatus(orderId, status) {
  try {
    await axios.patch(`${API_BASE}/api/orders/${orderId}/status`, { status });
    const idx = orders.value.findIndex((o) => o.id === orderId);
    if (idx !== -1) orders.value[idx].status = status;
  } catch (err) {
    alert(err.response?.data?.error || i18n.t.order_status_update_failed);
  }
}

// ─── NEW-DAY ORDER GROUPING (frontend only — DB data is never touched) ───
// Orders are grouped by their order date. While the day is running, ALL of
// today's orders sit together in one active list. When the clock passes
// midnight the reactive `todayKey` flips, so yesterday's orders MOVE out of
// the active list into their own collapsible date sections (order history).
// Nothing is deleted — reports / CSV export still see every order.
function dayKeyOf(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
const todayKey = ref(dayKeyOf(new Date()));
const expandedDays = ref({});
function toggleDay(day) {
  expandedDays.value = {
    ...expandedDays.value,
    [day]: !expandedDays.value[day],
  };
}
const todayOrders = computed(() =>
  orders.value.filter(
    (o) => o.created_at && dayKeyOf(new Date(o.created_at)) === todayKey.value,
  ),
);
const pastDayGroups = computed(() => {
  const map = new Map();
  for (const o of orders.value) {
    if (!o.created_at) continue;
    const k = dayKeyOf(new Date(o.created_at));
    if (k === todayKey.value) continue;
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(o);
  }
  return [...map.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1)) // newest day first
    .map(([day, list]) => ({ day, list }));
});
// Sections rendered by the Orders tab: today first (always open), then one
// collapsible section per previous day (collapsed by default).
const orderSections = computed(() => {
  const sections = [
    {
      key: "today",
      today: true,
      orders: todayOrders.value,
      collapsible: false,
    },
  ];
  for (const g of pastDayGroups.value) {
    sections.push({
      key: g.day,
      today: false,
      day: g.day,
      orders: g.list,
      collapsible: true,
    });
  }
  return sections;
});
function dayLabel(dayStr) {
  const [y, m, d] = dayStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(
    i18n.locale === "km" ? "km-KH" : "en-US",
    {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ─── DATE SEARCH (frontend only) ───────────────────────────
// Lets the owner jump to any specific date and see that day's orders.
// AppDatePicker uses "YYYY-MM-DD" — the exact same shape as dayKeyOf(),
// so picking a date filters orders by simple string equality.
const searchDate = ref(""); // "" = no date filter (normal today/history view)

const searchActive = computed(() => !!searchDate.value);

// All orders whose order date matches the picked date, newest first
const searchDateOrders = computed(() => {
  if (!searchActive.value) return [];
  return orders.value
    .filter(
      (o) =>
        o.created_at && dayKeyOf(new Date(o.created_at)) === searchDate.value,
    )
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
});

function clearDateSearch() {
  searchDate.value = "";
}

// Midnight timer — flips todayKey just after midnight so yesterday's orders
// are moved into history automatically, then re-arms (covers devices that
// sleep through the exact tick).
let newDayTimer = null;
function scheduleNewDayCheck() {
  clearTimeout(newDayTimer);
  const now = new Date();
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);
  newDayTimer = setTimeout(
    () => {
      if (todayKey.value !== dayKeyOf(new Date())) {
        todayKey.value = dayKeyOf(new Date());
        fetchOrders();
      }
      scheduleNewDayCheck();
    },
    Math.max(1000, nextMidnight - now) + 1000,
  );
}

// Cleanup for AdminView's onUnmounted (same clearTimeout as before).
function stopNewDayCheck() {
  clearTimeout(newDayTimer);
  newDayTimer = null;
}

export function useAdminOrders() {
  return {
    orders,
    ordersLoading,
    fetchOrders,
    updateOrderStatus,
    todayKey,
    expandedDays,
    toggleDay,
    todayOrders,
    pastDayGroups,
    orderSections,
    dayLabel,
    searchDate,
    searchActive,
    searchDateOrders,
    clearDateSearch,
    scheduleNewDayCheck,
    stopNewDayCheck,
  };
}
