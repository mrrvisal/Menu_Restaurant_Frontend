// Dashboard metric cards (7-day chart + today/week/month/live counters) —
// state + fetch moved verbatim out of AdminView.vue. Singleton so the SSE
// stream (useAdminStream) can refresh the cards on live order events
// without importing back into the view.
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useI18nStore } from "@/stores/i18n";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;
const auth = useAuthStore();
const i18n = useI18nStore();

const stats = ref({ totalRevenue: 0, totalOrders: 0, daily: [] });
const statsLoading = ref(false);
const statsError = ref("");
const statsStartDate = ref(
  new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
);
const statsEndDate = ref(new Date().toISOString().slice(0, 10));

export async function fetchStats() {
  if (!auth.restaurantId) return;
  statsLoading.value = true;
  statsError.value = "";
  try {
    const res = await axios.get(`${API_BASE}/api/orders/stats`, {
      params: {
        // Revenue / order metrics must belong to the SELECTED restaurant —
        // without restaurant_id the backend reports the account's first one.
        restaurant_id: auth.restaurantId,
        start_date: statsStartDate.value,
        end_date: statsEndDate.value,
      },
    });
    stats.value = res.data;
  } catch (err) {
    statsError.value = err.response?.data?.error || i18n.t.stats_load_error;
  } finally {
    statsLoading.value = false;
  }
}

export function useAdminStats() {
  return {
    stats,
    statsLoading,
    statsError,
    statsStartDate,
    statsEndDate,
    fetchStats,
  };
}
