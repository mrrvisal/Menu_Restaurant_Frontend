<!-- ═══════════════════════════════════════════════════════════
   KdsView — Kitchen Display System (KDS)
   A chrome-free wall board for the kitchen screen:
   · 4 status columns: New → Preparing → Ready → Done
   · Live updates over the same SSE stream as the dashboard
   · Dark / light mode toggle (remembered per account)
   · One-tap status transitions + optional "Done" column
   · Chime + tab-title flash on every new order
   Route: /kds (requiresAuth) — link lives in the admin sidebar.
   ═══════════════════════════════════════════════════════════ -->
<template>
  <div class="kds" :class="{ light: lightMode }">
    <!-- ─── TOP BAR ─── -->
    <header class="kds-top">
      <div class="kds-brand">
        <AppIcon name="chef" :size="22" />
        <strong class="kds-name">{{
          auth.restaurant?.name || i18n.t.kds_title
        }}</strong>
        <span class="kds-live" :class="{ off: !connected }">
          <i></i>{{ connected ? i18n.t.kds_live : i18n.t.kds_offline }}
        </span>
      </div>
      <div class="kds-acts">
        <button
          class="kds-btn kds-icon-btn"
          :title="lightMode ? 'Dark mode' : 'Light mode'"
          :aria-label="lightMode ? 'Dark mode' : 'Light mode'"
          @click="toggleMode"
        >
          <AppIcon :name="lightMode ? 'moon' : 'sun'" :size="16" />
        </button>
        <!-- KH / EN switcher — the kitchen board speaks both languages -->
        <button
          class="kds-btn kds-lang"
          :title="i18n.locale === 'km' ? 'English' : 'ភាសាខ្មែរ'"
          @click="i18n.toggleLocale"
        >
          {{ i18n.locale === "km" ? "EN" : "ខ្មែរ" }}
        </button>
        <select
          v-if="auth.restaurants.length > 1"
          class="kds-rest"
          :value="auth.restaurantId"
          @change="onSwitchRestaurant($event.target.value)"
        >
          <option v-for="r in auth.restaurants" :key="r.id" :value="r.id">
            {{ r.name }}
          </option>
        </select>
        <button class="kds-btn" @click="showDone = !showDone">
          {{ showDone ? i18n.t.kds_hide_done : i18n.t.kds_show_done }}
        </button>
        <button class="kds-btn" @click="toggleFullscreen">
          <AppIcon :name="isFullscreen ? 'minimize' : 'expand'" :size="14" />
          {{ i18n.t.kds_fullscreen }}
        </button>
        <RouterLink class="kds-btn kds-back" to="/dashboard">
          {{ i18n.t.kds_back }}
        </RouterLink>
      </div>
    </header>

    <!-- ─── NO RESTAURANT ─── -->
    <div v-if="!auth.restaurantId" class="kds-blank">
      <AppIcon name="chef" :size="42" />
      <p>{{ i18n.t.kds_no_restaurant }}</p>
      <RouterLink class="kds-btn kds-back" to="/dashboard">
        {{ i18n.t.kds_back }}
      </RouterLink>
    </div>
    <!-- ─── BOARD ─── -->
    <div v-else class="kds-board">
      <section
        v-for="col in columns"
        :key="col.key"
        class="kds-col"
        :class="'col-' + col.key"
      >
        <header class="col-head">
          <span class="col-title">{{ col.label }}</span>
          <span class="col-count">{{ visibleOrders(col.key).length }}</span>
        </header>

        <div class="col-body">
          <TransitionGroup name="card" tag="div" class="col-cards">
            <article
              v-for="o in visibleOrders(col.key)"
              :key="o.id"
              class="kds-card"
              :class="'st-' + o.status"
            >
              <div class="card-head">
                <span class="card-table">
                  {{ i18n.t.table }} {{ o.table_no }}
                </span>
              </div>

              <ul class="card-items">
                <li v-for="(it, idx) in parseItems(o.items)" :key="idx">
                  <strong class="qty">{{ it.qty }}×</strong>
                  <span class="iname">{{ it.name }}</span>
                </li>
              </ul>

              <div v-if="o.note" class="card-note">
                <AppIcon name="note" :size="13" />
                {{ o.note }}
              </div>

              <footer class="card-foot">
                <span class="card-total">
                  {{ i18n.t.kds_total }}
                  {{ currencyStore.fmt(o.total) }}
                </span>
                <div v-if="actionsFor(o).length" class="card-acts">
                  <button
                    v-for="a in actionsFor(o)"
                    :key="a.to"
                    class="act"
                    :class="'act-' + a.to"
                    :disabled="busyId === o.id"
                    @click="setStatus(o, a.to)"
                  >
                    <AppIcon :name="a.icon" :size="13" />
                    {{ a.label }}
                  </button>
                </div>
              </footer>
            </article>
          </TransitionGroup>

          <div v-if="!visibleOrders(col.key).length" class="col-empty">
            {{ i18n.t.kds_empty_col }}
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { RouterLink } from "vue-router";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { useI18nStore } from "@/stores/i18n";
import { useThemeStore } from "@/stores/theme";
import { useCurrencyStore } from "@/stores/currency";
import AppIcon from "@/components/AppIcon.vue";

const API_BASE = import.meta.env.VITE_API_URL;
const auth = useAuthStore();
const i18n = useI18nStore();
const currencyStore = useCurrencyStore();

const orders = ref([]);
const loading = ref(true);
const connected = ref(false);
const showDone = ref(true);
const busyId = ref(null);

let es = null;
let retryTimer = null;
let retryAttempts = 0;
let titleTimer = null;
let audioCtx = null;

// Column definitions — status → column mapping lives in statusColumn()
const columns = computed(() => [
  { key: "new", label: i18n.t.kds_col_new },
  { key: "preparing", label: i18n.t.kds_col_preparing },
  { key: "ready", label: i18n.t.kds_col_ready },
  { key: "done", label: i18n.t.kds_col_done },
]);

function statusColumn(status) {
  switch (status) {
    case "pending":
      return "new";
    case "preparing":
      return "preparing";
    case "ready":
      return "ready";
    default:
      return "done"; // served + cancelled
  }
}

function columnOrders(key) {
  return orders.value
    .filter((o) => statusColumn(o.status) === key)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); // oldest first → cook first
}

// Done column only shows when toggled on; keep it short (latest 12)
function visibleOrders(key) {
  if (key === "done") {
    if (!showDone.value) return [];
    return columnOrders(key).slice(0, 12);
  }
  return columnOrders(key);
}

// ─── HELPERS ───────────────────────────────────────────────
function parseItems(raw) {
  try {
    const arr = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function actionsFor(o) {
  switch (o.status) {
    case "pending":
      return [
        { to: "preparing", label: i18n.t.kds_start, icon: "chef" },
        { to: "cancelled", label: i18n.t.kds_cancel, icon: "x" },
      ];
    case "preparing":
      return [
        { to: "ready", label: i18n.t.kds_ready, icon: "check" },
        { to: "cancelled", label: i18n.t.kds_cancel, icon: "x" },
      ];
    case "ready":
      return [{ to: "served", label: i18n.t.kds_served, icon: "check-circle" }];
    default:
      return [];
  }
}

// ─── DATA ──────────────────────────────────────────────────
async function fetchOrders() {
  if (!auth.restaurantId) {
    loading.value = false;
    return;
  }
  try {
    const res = await axios.get(`${API_BASE}/api/orders`, {
      params: { restaurant_id: auth.restaurantId },
    });
    orders.value = res.data || [];
  } catch (err) {
    console.error("KDS fetchOrders failed:", err);
  } finally {
    loading.value = false;
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
  orders.value = [];
  reconnect();
}

// ─── LIVE STREAM (same SSE endpoint as the dashboard) ──────
function connect() {
  if (!auth.token || !auth.restaurantId) return;
  if (es) return;
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

  es.addEventListener("order-status", (event) => {
    try {
      const data = JSON.parse(event.data);
      const idx = orders.value.findIndex((o) => o.id === data.orderId);
      if (idx !== -1 && data.status) orders.value[idx].status = data.status;
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
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  else document.documentElement.requestFullscreen().catch(() => {});
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
const lightMode = ref(false);

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
    lightMode.value = localStorage.getItem(kdsModeKey()) === "light";
  } catch {
    lightMode.value = false;
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

// ─── LIFECYCLE ─────────────────────────────────────────────
watch(
  () => auth.restaurantId,
  (id, old) => {
    if (id !== old && old != null) reconnect();
  },
);

onMounted(() => {
  loadMode();
  currencyStore.setFrom(auth.restaurant);
  syncTheme();
  fetchOrders();
  connect();
  document.addEventListener("fullscreenchange", onFullscreenChange);
  window.addEventListener("pointerdown", unlockAudio, { once: true });
  window.addEventListener("keydown", unlockAudio, { once: true });
});

onUnmounted(() => {
  disconnect();
  stopTitleFlash();
  document.removeEventListener("fullscreenchange", onFullscreenChange);
  window.removeEventListener("pointerdown", unlockAudio);
  window.removeEventListener("keydown", unlockAudio);
});
</script>

<style scoped>
/* ═══ KDS — wall-board theme, dark by default + light variant ═══ */
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

/* ─── Top bar ─── */
.kds-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 16px;
  background: var(--bg-soft);
  border-bottom: 1px solid var(--border);
  flex-wrap: wrap;
}
.kds-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  color: var(--primary-light, #5eead4);
}
.kds-name {
  font-size: 16px;
  color: var(--text-strong);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.kds-live {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.15);
  color: #4ade80;
}
.kds-live i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4ade80;
  animation: kds-blink 1.5s ease-in-out infinite;
}
.kds-live.off {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}
.kds-live.off i {
  background: #f87171;
}
@keyframes kds-blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}
.kds-acts {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.kds-rest {
  max-width: 200px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--border-line);
  background: var(--bg-card);
  color: var(--text);
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
}
.kds-btn {
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
.kds-btn:hover {
  border-color: var(--primary-light, #5eead4);
  color: var(--primary-light, #5eead4);
}
.kds-back {
  background: var(--primary, #0f766e);
  border-color: var(--primary, #0f766e);
  color: var(--on-primary, #fff);
}
.kds-back:hover {
  background: var(--primary-dark, #0d5e57);
  color: var(--on-primary, #fff);
}
/* ── Top-bar controls: uniform size ──────────────────────────
   Fixed height + centered flex so every control (sun/moon,
   KH/EN, restaurant select, Hide done, Fullscreen, Back) is
   exactly the same height and radius — Khmer text has a taller
   line box and bare icons are shorter, which made them uneven. */
.kds-acts .kds-btn,
.kds-acts .kds-rest {
  height: 38px;
  min-height: 38px;
  box-sizing: border-box;
  padding: 0 14px;
  border-radius: 10px;
}
/* Icon-only button (dark/light toggle) — narrower, same height */
.kds-acts .kds-icon-btn {
  padding: 0 12px;
}
/* Language pill — KH/EN */
.kds-acts .kds-lang {
  min-width: 54px;
  padding: 0 12px;
  font-weight: 800;
  letter-spacing: 0.3px;
}
/* Restaurant select — same height, slightly tighter padding */
.kds-acts .kds-rest {
  padding: 0 12px;
}

/* ─── Blank (no restaurant) ─── */
.kds-blank p {
  margin: 0;
  font-size: 15px;
}
.kds-blank {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  color: var(--text-dim);
}
.kds-blank p {
  margin: 0;
  font-size: 15px;
}

/* ─── Board ─── */
.kds-board {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding: 12px;
  min-height: 0;
}
.kds-col {
  display: flex;
  flex-direction: column;
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  min-height: 0;
}
.col-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  border-bottom: 3px solid transparent;
}
.col-new .col-head {
  color: #fbbf24;
  border-bottom-color: #f59e0b;
  background: rgba(245, 158, 11, 0.08);
}
.col-preparing .col-head {
  color: #60a5fa;
  border-bottom-color: #3b82f6;
  background: rgba(59, 130, 246, 0.08);
}
.col-ready .col-head {
  color: #4ade80;
  border-bottom-color: #22c55e;
  background: rgba(34, 197, 94, 0.08);
}
.col-done .col-head {
  color: #94a3b8;
  border-bottom-color: #64748b;
  background: rgba(100, 116, 139, 0.08);
}
.col-count {
  min-width: 26px;
  text-align: center;
  padding: 1px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  font-size: 12px;
}
.col-body {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  min-height: 0;
}
.col-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.col-empty {
  text-align: center;
  padding: 26px 8px;
  color: var(--text-faint);
  font-size: 12px;
  border: 1px dashed var(--border-line);
  border-radius: 10px;
}

/* ─── Cards ─── */
.kds-card {
  background: var(--bg-card);
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  padding: 10px 12px;
  transition: transform 0.15s ease, border-color 0.15s ease;
}
.kds-card.st-pending {
  border-left: 4px solid #f59e0b;
}
.kds-card.st-preparing {
  border-left: 4px solid #3b82f6;
}
.kds-card.st-ready {
  border-left: 4px solid #22c55e;
}
.kds-card.st-served,
.kds-card.st-cancelled {
  opacity: 0.55;
}
.kds-card.st-cancelled .card-table {
  text-decoration: line-through;
}
.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}
.card-table {
  font-size: 17px;
  font-weight: 800;
  color: var(--text-strong);
}
.card-items {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.card-items li {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 14px;
  color: var(--text);
}
.card-items .qty {
  color: var(--primary-light, #5eead4);
  min-width: 30px;
  text-align: right;
  font-size: 15px;
}
.card-note {
  margin-top: 7px;
  font-size: 12px;
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.08);
  border: 1px dashed rgba(245, 158, 11, 0.35);
  border-radius: 8px;
  padding: 5px 9px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.card-foot {
  margin-top: 9px;
  padding-top: 9px;
  border-top: 1px dashed var(--border-line);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}
.card-total {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-dim);
}
.card-acts {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.act {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.15s ease;
  color: #fff;
}
.act:hover {
  transform: translateY(-1px);
  filter: brightness(1.12);
}
.act:disabled {
  opacity: 0.5;
  cursor: wait;
}
.act-preparing {
  background: #3b82f6;
}
.act-ready {
  background: #22c55e;
}
.act-served {
  background: #16a34a;
}
.act-cancelled {
  background: transparent;
  border: 1px solid #ef4444;
  color: #f87171;
}

/* Card enter/leave animation */
.card-enter-active {
  transition: all 0.25s ease;
}
.card-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}
.card-leave-active {
  transition: all 0.15s ease;
  opacity: 0;
}

/* ─── Light-mode accent tuning (readability on white) ───
   Status tints / colored text stay bold enough on light surfaces. */
.kds.light .kds-brand {
  color: var(--primary, #0f766e);
}
.kds.light .kds-live {
  color: #16a34a;
}
.kds.light .kds-live.off {
  color: #dc2626;
}
.kds.light .col-new .col-head {
  color: #b45309;
}
.kds.light .col-preparing .col-head {
  color: #1d4ed8;
}
.kds.light .col-ready .col-head {
  color: #15803d;
}
.kds.light .col-done .col-head {
  color: #475569;
}
.kds.light .card-items .qty {
  color: var(--primary, #0f766e);
}
.kds.light .card-note {
  color: #92400e;
}
.kds.light .act-cancelled {
  color: #dc2626;
}

/* ─── Responsive ─── */
@media (max-width: 1100px) {
  .kds-board {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 640px) {
  .kds-board {
    grid-template-columns: 1fr;
  }
  .card-table {
    font-size: 16px;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
</style>

