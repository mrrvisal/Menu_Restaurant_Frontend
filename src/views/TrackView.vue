<!-- ═══════════════════════════════════════════════════════════
   TrackView — Guest order tracking (/track)
   After placing an order from the QR menu the guest is redirected
   here with a one-time token. The page streams live status over
   SSE:  ✅ Received → 👨‍🍳 Preparing → 🍽️ Ready → ✔️ Served
   Public route — protected by the per-order track token.
   ═══════════════════════════════════════════════════════════ -->
<template>
  <div class="track" :style="themeVars">
    <!-- ─── TOP BAR ─── -->
    <header class="trk-top">
      <div class="trk-brand">
        <img
          v-if="order?.logoUrl"
          :src="order.logoUrl"
          class="trk-logo"
          alt=""
        />
        <AppIcon v-else name="store" :size="22" />
        <strong>{{ order?.restaurantName || i18n.t.track_title }}</strong>
      </div>
      <div class="trk-top-acts">
        <button class="trk-lang" @click="i18n.toggleLocale">
          {{ i18n.locale === "km" ? "EN" : "ខ្មែរ" }}
        </button>
        <span class="trk-live" :class="{ off: state !== 'live' }">
          <i></i>{{ state === "live" ? i18n.t.kds_live : i18n.t.track_connecting }}
        </span>
      </div>
    </header>

    <main class="trk-body">
      <!-- ─── NOT FOUND / INVALID LINK ─── -->
      <div v-if="state === 'invalid' || state === 'notfound'" class="trk-blank">
        <AppIcon name="x-octagon" :size="40" />
        <p>{{ i18n.t.track_not_found }}</p>
      </div>

      <!-- ─── CONNECTING ─── -->
      <div v-else-if="state === 'loading'" class="trk-blank">
        <div class="trk-spinner"></div>
        <p>{{ i18n.t.track_connecting }}</p>
      </div>

      <!-- ─── TRACKER ─── -->
      <div v-else class="trk-card">
        <div class="trk-head">
          <span class="trk-oid">#{{ order.orderId }}</span>
          <span class="trk-table">
            <AppIcon name="qr" :size="13" /> {{ i18n.t.table }}
            {{ order.tableNo }}
          </span>
          <span class="trk-time">{{ formatTime(order.createdAt) }}</span>
        </div>

        <!-- Cancelled banner replaces the stepper -->
        <div v-if="isCancelled" class="trk-cancelled">
          <AppIcon name="x-circle" :size="18" />
          {{ i18n.t.track_cancelled }}
        </div>

        <!-- ─── LIVE STEPPER ─── -->
        <div v-else class="trk-steps">
          <template v-for="(s, i) in steps" :key="s.key">
            <div
              class="trk-step"
              :class="{ done: currentStep >= i, now: currentStep === i }"
            >
              <div class="step-dot">
                <AppIcon :name="s.icon" :size="16" />
              </div>
              <span class="step-label">{{ s.label }}</span>
            </div>
            <div
              v-if="i < steps.length - 1"
              class="step-line"
              :class="{ filled: currentStep > i }"
            ></div>
          </template>
        </div>

        <!-- ─── ITEMS ─── -->
        <div class="trk-items">
          <div class="trk-items-h">{{ i18n.t.kds_items }}</div>
          <div
            v-for="(it, idx) in parseItems(order.items)"
            :key="idx"
            class="trk-item"
          >
            <span class="qty">{{ it.qty }}×</span>
            <span class="name">{{ it.name }}</span>
            <span class="price">
              {{ currencyStore.fmt(Number(it.price) * Number(it.qty || 1)) }}
            </span>
          </div>
          <div v-if="order.note" class="trk-note">
            <AppIcon name="note" :size="13" />
            {{ order.note }}
          </div>
        </div>

        <!-- ─── TOTAL ─── -->
        <div class="trk-total">
          <span>{{ i18n.t.kds_total }}</span>
          <strong>{{ currencyStore.fmt(order.total) }}</strong>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { useI18nStore } from "@/stores/i18n";
import { useCurrencyStore } from "@/stores/currency";
import AppIcon from "@/components/AppIcon.vue";
import {
  normalizeHex,
  lighten,
  darken,
  strongColor,
} from "@/utils/color.mjs";
import { buildThemePalette } from "@/utils/themePalette.mjs";

const API_BASE = import.meta.env.VITE_API_URL;
const route = useRoute();
const i18n = useI18nStore();
const currencyStore = useCurrencyStore();

const orderId = computed(() => parseInt(route.query.order_id || 0));
const token = computed(() => String(route.query.token || ""));

// state: loading | live | notfound | invalid
const state = ref("loading");
const order = ref(null);

let es = null;
let retryTimer = null;
let attempts = 0;

// ─── STATUS → STEP ─────────────────────────────────────────
const steps = computed(() => [
  { label: i18n.t.track_received, icon: "clipboard" },
  { label: i18n.t.track_preparing, icon: "chef" },
  { label: i18n.t.track_ready, icon: "food" },
  { label: i18n.t.track_served, icon: "check" },
]);

function statusStep(s) {
  switch (s) {
    case "preparing":
      return 1;
    case "ready":
      return 2;
    case "served":
      return 3;
    case "cancelled":
      return -1;
    default:
      return 0; // pending / confirmed
  }
}

const currentStep = computed(() => statusStep(order.value?.status));
const isCancelled = computed(() => order.value?.status === "cancelled");

// ─── THEME (restaurant's saved color drives the page) ──────
const themeVars = computed(() => {
  const input = order.value?.themeColor;
  const vars = buildThemePalette(input);
  if (!vars || !input) return {};
  const hex = normalizeHex(input);
  const strong = vars["--green-strong"] || strongColor(hex);
  return {
    ...vars,
    "--primary": hex,
    "--primary-dark": darken(hex, 0.18),
    "--primary-light": lighten(hex, 0.28),
    "--primary-strong": strong,
    "--on-primary": "#fff",
  };
});

// ─── HELPERS ───────────────────────────────────────────────
function parseItems(raw) {
  try {
    const arr = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function formatTime(t) {
  if (!t) return "";
  return new Date(t).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── LIVE STREAM ───────────────────────────────────────────
// EventSource hides HTTP status codes, so the endpoint is probed once
// with fetch first — a 404 means the order/token is wrong → not-found
// state instead of an endless reconnect loop. The probe connection is
// aborted and EventSource opens its own.
function streamUrl() {
  return `${API_BASE}/api/orders/track?order_id=${orderId.value}&token=${encodeURIComponent(token.value)}`;
}

async function onStatus(event) {
  try {
    const update = JSON.parse(event.data);
    // SSE may send only status changes — ensure full order data is loaded
    if (orderId.value && token.value) {
      const full = await fetchFullOrder();
      if (full) {
        order.value = full;
      } else {
        // fallback: merge whatever SSE sent
        order.value = { ...order.value, ...update };
      }
    } else {
      order.value = update;
    }
    currencyStore.setFrom(order.value);
    state.value = "live";
    attempts = 0;
  } catch {
    /* ignore malformed frames */
  }
}

async function fetchFullOrder() {
  if (!orderId.value || !token.value) return null;
  try {
    const res = await fetch(
      `${API_BASE}/api/orders/${orderId.value}?token=${encodeURIComponent(token.value)}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function scheduleRetry() {
  clearTimeout(retryTimer);
  retryTimer = setTimeout(connect, Math.min(15000, 2000 * ++attempts));
}

async function connect() {
  if (state.value === "invalid") return;
  if (!orderId.value || !token.value) {
    state.value = "invalid";
    return;
  }
  if (es) return;

  // Fetch full order first so items/theme/total render immediately
  // (SSE only streams status changes, not the complete payload)
  const full = await fetchFullOrder();
  if (full) {
    order.value = full;
    currencyStore.setFrom(order.value);
  }

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(streamUrl(), {
      signal: ctrl.signal,
      cache: "no-store",
    });
    clearTimeout(timer);
    if (res.status === 404) {
      state.value = "notfound";
      return;
    }
    ctrl.abort(); // close the probe; EventSource opens its own connection
  } catch {
    /* probe couldn't finish (offline) — let EventSource try */
  }

  es = new EventSource(streamUrl());
  es.addEventListener("status", onStatus);
  es.onerror = () => {
    es.close();
    es = null;
    if (state.value === "live") state.value = "loading";
    scheduleRetry();
  };

  // Mark live if we already have order data
  if (order.value) state.value = "live";
}

onMounted(connect);
onUnmounted(() => {
  clearTimeout(retryTimer);
  if (es) {
    es.close();
    es = null;
  }
});
</script>

<style scoped>
/* ═══ Guest order tracker — light, theme-colored, mobile-first ═══ */
.track {
  --primary: #16a34a;
  --primary-dark: #12813c;
  --on-primary: #fff;
  min-height: 100vh;
  background: var(--green-pale, #f4faf6);
  color: var(--text-dark, #111827);
  font-family: "Hanuman", "Noto Sans Khmer", system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  display: flex;
  flex-direction: column;
}

/* ─── Top bar ─── */
.trk-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 16px;
  background: var(--primary);
  color: var(--on-primary, #fff);
  flex-wrap: wrap;
}
.trk-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.trk-logo {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
}
.trk-brand strong {
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.trk-top-acts {
  display: flex;
  align-items: center;
  gap: 8px;
}
.trk-lang {
  height: 30px;
  min-width: 48px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.45);
  background: rgba(255, 255, 255, 0.12);
  color: var(--on-primary, #fff);
  font-family: inherit;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
}
.trk-lang:hover {
  background: rgba(255, 255, 255, 0.22);
}
.trk-live {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 11px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}
.trk-live i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #a7f3d0;
  animation: trk-blink 1.4s ease-in-out infinite;
}
.trk-live.off i {
  background: #fecaca;
  animation: none;
}
@keyframes trk-blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.25;
  }
}

/* ─── Body ─── */
.trk-body {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 26px 14px 60px;
}
.trk-blank {
  text-align: center;
  color: var(--text-light, #6b7280);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 10px;
}
.trk-blank p {
  margin: 0;
  font-size: 14px;
}
.trk-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid var(--green-soft, #d3ecdc);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: trk-spin 0.7s linear infinite;
}
@keyframes trk-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ─── Card ─── */
.trk-card {
  width: 100%;
  max-width: 460px;
  background: #fff;
  border-radius: 22px;
  border: 1px solid var(--green-soft, #e8f5e9);
  box-shadow: 0 20px 50px var(--shadow-tint, rgba(16, 24, 20, 0.12));
  padding: 18px 18px 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.trk-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}
.trk-oid {
  font-size: 17px;
  font-weight: 800;
  color: var(--primary-strong, var(--primary));
}
.trk-table {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 11px;
  border-radius: 999px;
  background: var(--green-pale, #f0fdf4);
  color: var(--green-dark, #14532d);
}
.trk-time {
  font-size: 11px;
  color: var(--text-light, #6b7280);
  white-space: nowrap;
}

/* ─── Cancelled ─── */
.trk-cancelled {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  border-radius: 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  font-size: 14px;
  font-weight: 700;
}

/* ─── Stepper ─── */
.trk-steps {
  display: flex;
  align-items: flex-start;
}
.trk-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
  min-width: 58px;
}
.step-dot {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--green-pale, #f0fdf4);
  color: var(--text-light, #9ca3af);
  border: 2px solid var(--green-soft, #e5efe9);
  transition: all 0.3s ease;
}
.step-label {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--text-light, #9ca3af);
  text-align: center;
  line-height: 1.25;
  white-space: nowrap;
}
.trk-step.done .step-dot {
  background: var(--primary);
  border-color: var(--primary);
  color: var(--on-primary, #fff);
}
.trk-step.done .step-label {
  color: var(--primary-strong, var(--primary));
}
.trk-step.now .step-dot {
  animation: trk-pulse 1.8s ease-in-out infinite;
}
@keyframes trk-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 4px var(--glow-soft, rgba(74, 222, 128, 0.2));
  }
  50% {
    box-shadow: 0 0 0 8px var(--glow-soft, rgba(74, 222, 128, 0.08));
  }
}
.step-line {
  flex: 1;
  height: 3px;
  border-radius: 3px;
  background: var(--green-soft, #e5efe9);
  margin-top: 18px;
  min-width: 12px;
  transition: background 0.3s ease;
}
.step-line.filled {
  background: var(--primary);
}

/* ─── Items ─── */
.trk-items {
  border-top: 1px dashed var(--green-soft, #e5efe9);
  padding-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.trk-items-h {
  font-size: 10.5px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--text-light, #9ca3af);
}
.trk-item {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 14px;
}
.trk-item .qty {
  color: var(--primary-strong, var(--primary));
  font-weight: 800;
  min-width: 28px;
  text-align: right;
}
.trk-item .name {
  flex: 1;
  min-width: 0;
}
.trk-item .price {
  font-weight: 600;
  color: var(--text-light, #4b5563);
  font-size: 12.5px;
  white-space: nowrap;
}
.trk-note {
  margin-top: 4px;
  font-size: 12px;
  color: #92400e;
  background: rgba(245, 158, 11, 0.08);
  border: 1px dashed rgba(245, 158, 11, 0.35);
  border-radius: 10px;
  padding: 7px 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* ─── Total ─── */
.trk-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 2px solid var(--green-soft, #e5efe9);
  padding-top: 12px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-light, #6b7280);
}
.trk-total strong {
  font-size: 20px;
  font-weight: 800;
  color: var(--primary-strong, var(--primary));
}

/* ─── Responsive ─── */
@media (max-width: 420px) {
  .step-label {
    font-size: 9.5px;
  }
  .trk-card {
    padding: 15px 14px 18px;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
</style>

