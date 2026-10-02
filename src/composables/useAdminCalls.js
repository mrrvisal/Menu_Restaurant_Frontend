// Guest "call the owner" requests — list + resolve actions for the Orders
// tab. Same singleton pattern as useAdminOrders: module-level refs so the
// sidebar, the SSE stream and the Orders panel all share ONE source.
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;
const auth = useAuthStore();

// ─── CALLS STATE ──────────────────────────────────────────
export const calls = ref([]);
const callsLoading = ref(false);

// Pending = still waiting for the owner; that's what the panel leads with.
export const pendingCalls = computed(() =>
  calls.value.filter((c) => c.status === "pending"),
);

export async function fetchCalls() {
  // An account without a restaurant has no calls — skip the request (the
  // backend would answer 404 "Restaurant not found").
  if (!auth.restaurantId) {
    calls.value = [];
    return;
  }
  callsLoading.value = true;
  try {
    const res = await axios.get(`${API_BASE}/api/calls`, {
      params: { restaurant_id: auth.restaurantId, limit: 50 },
    });
    calls.value = res.data;
  } catch (err) {
    console.error(
      "Failed to fetch table calls:",
      err?.response?.data?.error || err.message,
    );
  } finally {
    callsLoading.value = false;
  }
}

// Mark one call as handled (or back to pending) from the dashboard.
export async function updateCallStatus(callId, status) {
  try {
    await axios.patch(`${API_BASE}/api/calls/${callId}/status`, { status });
    const idx = calls.value.findIndex((c) => c.id === callId);
    if (idx !== -1) {
      calls.value[idx].status = status;
      calls.value[idx].handled_at = status === "handled" ? new Date().toISOString() : null;
    }
  } catch (err) {
    console.error(
      "Failed to update table call:",
      err?.response?.data?.error || err.message,
    );
    throw err;
  }
}

export function useAdminCalls() {
  return {
    calls,
    callsLoading,
    pendingCalls,
    fetchCalls,
    updateCallStatus,
  };
}
