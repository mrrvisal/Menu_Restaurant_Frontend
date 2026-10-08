<!-- Kitchen Display System (KDS) board for kitchen screens -->
<template>
  <div class="kds" :class="{ light: lightMode }">
    <!-- ─── LOADING STATE ─── -->
    <div v-if="loading" class="kds-loading">
      <div class="spinner"></div>
      <p>{{ i18n.t.loading }}</p>
    </div>

    <!-- ─── NO RESTAURANT / NOT READY ─── -->
    <KdsBlank v-else-if="!ready" :text="i18n.t.kds_not_ready" />

    <!-- ─── TOP BAR ─── -->
    <KdsTopBar v-else :connected="connected" :light-mode="lightMode" :show-done="showDone"
      :is-fullscreen="isFullscreen" @toggle-mode="toggleMode" @toggle-show-done="showDone = !showDone"
      @toggle-fullscreen="toggleFullscreen" @switch-restaurant="onSwitchRestaurant" />

    <!-- ─── NO RESTAURANT ─── -->
    <KdsBlank v-if="!auth.restaurantId" :text="i18n.t.kds_no_restaurant" />
    <!-- ─── BOARD ─── -->
    <KdsBoard v-else :orders="orders" :show-done="showDone" :busy-id="busyId" :is-today="isToday"
      @set-status="setStatus" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { useI18nStore } from "@/stores/i18n";
import { useThemeStore } from "@/stores/theme";
import { useCurrencyStore } from "@/stores/currency";
import KdsBlank from "@/components/kds/KdsBlank.vue";
import KdsTopBar from "@/components/kds/KdsTopBar.vue";
import KdsBoard from "@/components/kds/KdsBoard.vue";

const API_BASE = import.meta.env.VITE_API_URL;
const auth = useAuthStore();
const i18n = useI18nStore();
const currencyStore = useCurrencyStore();

const orders = ref([]);
const loading = ref(true);
const connected = ref(false);
const showDone = ref(true);
const busyId = ref(null);
const ready = ref(false);

let es = null;
let retryTimer = null;
let retryAttempts = 0;
let titleTimer = null;
let audioCtx = null;

// ─── NEW DAY RESET (frontend only — DB data is never touched) ──
// The board only shows TODAY's orders. When the clock passes midnight the
// reactive `todayKey` changes, every column re-evaluates and yesterday's
// history simply disappears from the screen. Orders stay in the database
// (reports / dashboard still see them); only this display is cleared.
function dayKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
const todayKey = ref(dayKey(new Date()));

function isToday(raw) {
  if (!raw) return true; // missing timestamp → keep visible, never hide live orders
  try {
    return dayKey(new Date(raw)) === todayKey.value;
  } catch {
    return true;
  }
}

// ─── DATA ──────────────────────────────────────────────────
async function fetchOrders() {
  if (!auth.restaurantId) {
    return;
  }
  try {
    const res = await axios.get(`${API_BASE}/api/orders`, {
      params: { restaurant_id: auth.restaurantId },
    });
    orders.value = res.data || [];
  } catch (err) {
    console.error("KDS fetchOrders failed:", err);
  }
}

async function setStatus(order, status) {
  if (busyId.value) return;
  busyId.value = order.id;
  try {
    await axios.patch(`${API_BASE}/api/orders/${order.id}/status`, { status });
    // Optimistic update; the SSE order-status event confirms it too
    const idx = orders.value.findIndex((o) => o.id === order.id);
    if (idx !== -1) orders.value[idx].status = status;

    // Refresh the order from server to get latest data (total, etc.)
    // This ensures currency formatting is correct after status change
    try {
      const res = await axios.get(`${API_BASE}/api/orders/${order.id}`, {
        params: { restaurant_id: auth.restaurantId },
      });
      if (res.data && idx !== -1) {
        orders.value[idx] = { ...orders.value[idx], ...res.data };
      }
    } catch (refreshErr) {
      console.error("KDS: Failed to refresh order after status update:", refreshErr);
    }
  } catch (err) {
    console.error("KDS setStatus failed:", err);
    alert(err.response?.data?.error || i18n.t.error || "Error");
  } finally {
    busyId.value = null;
  }
}

function onSwitchRestaurant(value) {
  auth.setCurrentRestaurant(Number(value));
  currencyStore.setFrom(auth.restaurant);
  loading.value = true;
  ready.value = false;
  orders.value = [];
  reconnect();
  // Re-initialize after reconnection
  fetchOrders().then(() => {
    ready.value = true;
    loading.value = false;
  });
}

// ─── LIVE STREAM (same SSE endpoint as the dashboard) ──────
async function connect() {
  if (!auth.token || !auth.restaurantId) return;
  if (es) return;
  // Renew the access token first when it's close to expiring — EventSource
  // bakes the token into its URL and can't swap it without a reconnect.
  await auth.ensureFreshToken();
  if (!auth.token || es) return; // session ended (or reconnected) while waiting
  const params = new URLSearchParams({
    token: auth.token,
    restaurant_id: String(auth.restaurantId),
  });
  es = new EventSource(`${API_BASE}/api/orders/stream?${params.toString()}`);

  es.addEventListener("connected", () => {
    connected.value = true;
    retryAttempts = 0;
    stopTitleFlash();
  });

  es.addEventListener("new-order", () => {
    chime();
    startTitleFlash();
    fetchOrders();
  });

  es.addEventListener("order-status", async (event) => {
    try {
      const data = JSON.parse(event.data);
      const idx = orders.value.findIndex((o) => o.id === data.orderId);
      if (idx !== -1 && data.status) {
        orders.value[idx].status = data.status;

        // Refresh full order data from server to ensure money/total is correct
        try {
          const res = await axios.get(`${API_BASE}/api/orders/${data.orderId}`, {
            params: { restaurant_id: auth.restaurantId },
          });
          if (res.data) {
            orders.value[idx] = { ...orders.value[idx], ...res.data };
          }
        } catch (refreshErr) {
          console.error("KDS: Failed to refresh order from SSE event:", refreshErr);
        }
      }
    } catch {
      /* ignore malformed frames */
    }
  });

  es.onerror = () => {
    es.close();
    es = null;
    connected.value = false;
    // Backoff: 3s, 6s, 9s … capped at 30s (kitchen screens stay open all day)
    const delay = Math.min(30000, 3000 * ++retryAttempts);
    retryTimer = setTimeout(connect, delay);
  };
}

function disconnect() {
  clearTimeout(retryTimer);
  retryTimer = null;
  retryAttempts = 0;
  if (es) {
    es.close();
    es = null;
  }
  connected.value = false;
}

function reconnect() {
  disconnect();
  fetchOrders();
  connect();
}

// ─── ALERTS: chime + tab-title flash ───────────────────────
function chime() {
  try {
    audioCtx =
      audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    const t0 = audioCtx.currentTime;
    [880, 1320].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t0 + i * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.25, t0 + i * 0.18 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + i * 0.18 + 0.5);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t0 + i * 0.18);
      osc.stop(t0 + i * 0.18 + 0.55);
    });
  } catch {
    /* audio unavailable — silent fallback */
  }
}

const baseTitle = "Digital Menu — KDS";
function startTitleFlash() {
  if (titleTimer) return;
  let on = false;
  titleTimer = setInterval(() => {
    document.title = (on = !on) ? "🔔 NEW ORDER" : baseTitle;
  }, 900);
}
function stopTitleFlash() {
  clearInterval(titleTimer);
  titleTimer = null;
  document.title = baseTitle;
}

// Autoplay policies block audio before user interaction — unlock silently
function unlockAudio() {
  try {
    audioCtx =
      audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
  } catch {
    /* ignore */
  }
}

// ─── FULLSCREEN ────────────────────────────────────────────
// Track the state so the button can swap expand/minimize icons
const isFullscreen = ref(false);
function onFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement;
}
function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen().catch(() => { });
  else document.documentElement.requestFullscreen().catch(() => { });
}

// ─── THEME ─────────────────────────────────────────────────
// KDS reuses the account's chosen brand color for column accents
function syncTheme() {
  const theme = useThemeStore();
  theme.load();
  const c = auth.restaurant?.themeColor;
  if (c) theme.setPrimary(c, { persist: false });
}

// ─── DARK / LIGHT MODE ─────────────────────────────────────
// Kitchen screens live in very different lighting (bright hall vs.
// dim prep corner), so the board can be flipped with the sun/moon button.
// The choice is stored per account — same pattern as the theme color.
const lightMode = ref(true);

function kdsModeKey() {
  try {
    const user = JSON.parse(localStorage.getItem("admin_user") || "null");
    return user && user.id ? `kds_mode_user_${user.id}` : "kds_mode";
  } catch {
    return "kds_mode";
  }
}

function loadMode() {
  try {
    const savedMode = localStorage.getItem(kdsModeKey());
    lightMode.value = savedMode === null || savedMode === "light";
  } catch {
    lightMode.value = true;
  }
}

function toggleMode() {
  lightMode.value = !lightMode.value;
  try {
    localStorage.setItem(kdsModeKey(), lightMode.value ? "light" : "dark");
  } catch {
    /* storage unavailable — mode still applies for this session */
  }
}

// ─── NEW-DAY TIMER ─────────────────────────────────────────
// Fires just after midnight to flip todayKey → all columns instantly clear
// yesterday's history (display only). Also refreshes from the server so any
// overnight orders placed while the screen was open are picked up.
let newDayTimer = null;

function scheduleNewDayCheck() {
  clearTimeout(newDayTimer);
  const now = new Date();
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);
  // wake up 1s after midnight, then re-check every minute for safety
  // (covers devices that sleep through the exact tick)
  newDayTimer = setTimeout(() => {
    if (todayKey.value !== dayKey(new Date())) {
      todayKey.value = dayKey(new Date());
      fetchOrders();
    }
    scheduleNewDayCheck();
  }, Math.max(1000, nextMidnight - now) + 1000);
}

// ─── LIFECYCLE ─────────────────────────────────────────────
watch(
  () => auth.restaurantId,
  (id, old) => {
    if (id !== old && old != null) reconnect();
  },
);

onMounted(async () => {
  loadMode();
  // Fetch fresh auth data FIRST to ensure restaurant info is current
  try {
    await auth.fetchMe();
  } catch (err) {
    console.error("KDS: Failed to fetch auth data:", err);
  }

  // Initialize currency and theme from restaurant data (now available)
  currencyStore.setFrom(auth.restaurant);
  syncTheme();

  // Show orders and connect to live stream
  await fetchOrders();
  connect();

  // Mark as ready once all initialization is complete
  ready.value = true;
  loading.value = false;

  document.addEventListener("fullscreenchange", onFullscreenChange);
  window.addEventListener("pointerdown", unlockAudio, { once: true });
  window.addEventListener("keydown", unlockAudio, { once: true });
  scheduleNewDayCheck();
});

onUnmounted(() => {
  disconnect();
  stopTitleFlash();
  clearTimeout(newDayTimer);
  document.removeEventListener("fullscreenchange", onFullscreenChange);
  window.removeEventListener("pointerdown", unlockAudio);
  window.removeEventListener("keydown", unlockAudio);
});
</script>

<style scoped>
/* ═══ KDS — wall-board theme, light by default + dark variant ═══ */
.kds {
  /* Palette — flipped by .kds.light below */
  --bg: #0d1526;
  --bg-soft: #111c33;
  --bg-card: #16233d;
  --border: #1e2c4a;
  --border-strong: #24355c;
  --border-line: #2a3a5f;
  --text: #e8eefc;
  --text-strong: #ffffff;
  --text-dim: #8ea3c8;
  --text-faint: #55688f;

  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
}

.kds.light {
  --bg: #eef2f7;
  --bg-soft: #ffffff;
  --bg-card: #ffffff;
  --border: #e2e8f0;
  --border-strong: #cbd5e1;
  --border-line: #cbd5e1;
  --text: #1e293b;
  --text-strong: #0f172a;
  --text-dim: #475569;
  --text-faint: #94a3b8;
}

/* SHARED BUTTONS — used by the top bar AND both blank states:
   kept here and reached via :deep() (anchor = the .kds root itself). */
:deep(.kds-btn) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid var(--border-line);
  background: var(--bg-card);
  color: var(--text);
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.15s ease;
  white-space: nowrap;
}

:deep(.kds-btn:hover) {
  border-color: var(--primary-light, #5eead4);
  color: var(--primary-light, #5eead4);
}

:deep(.kds-back) {
  background: var(--primary, #0f766e);
  border-color: var(--primary, #0f766e);
  color: var(--on-primary, #fff);
}

:deep(.kds-back:hover) {
  background: var(--primary-dark, #0d5e57);
  color: var(--on-primary, #fff);
}

/* LOADING stays with the view (inline template block). */
/* ─── Loading state ─── */
.kds-loading {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--text-dim);
  font-size: 14px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* LIGHT-MODE ACCENTS cross into every child → :deep() keeps the
   original specificity, so the winners vs. child rules don't change. */
/* ─── Light-mode accent tuning (readability on white) ───
   Status tints / colored text stay bold enough on light surfaces. */
.kds.light :deep(.kds-brand) {
  color: var(--primary, #0f766e);
}

.kds.light :deep(.kds-live) {
  color: #16a34a;
}

.kds.light :deep(.kds-live.off) {
  color: #dc2626;
}

.kds.light :deep(.col-new .col-head) {
  color: #b45309;
}

.kds.light :deep(.col-preparing .col-head) {
  color: #1d4ed8;
}

.kds.light :deep(.col-ready .col-head) {
  color: #15803d;
}

.kds.light :deep(.col-done .col-head) {
  color: #475569;
}

.kds.light :deep(.card-items .qty) {
  color: var(--primary, #0f766e);
}

.kds.light :deep(.card-note) {
  color: #92400e;
}

.kds.light :deep(.act-cancelled) {
  color: #dc2626;
}

/* Reduced motion must disable animations INSIDE the child components too */
/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .kds :deep(*) {
    animation: none !important;
    transition: none !important;
  }
}
</style>
