<!-- Guest order live status tracking view (/track) -->
<template>
  <div class="track" :style="themeVars">
    <header class="trk-top">
      <div class="trk-brand">
        <img
          v-if="logoSrc"
          :src="logoSrc"
          class="trk-logo"
          alt=""
          @error="onLogoError"
        />
        <span v-else class="trk-logo trk-logo-empty" aria-hidden="true">
          <AppIcon name="store" :size="19" />
        </span>
        <div class="trk-brand-txt">
          <strong>{{ order?.restaurantName || i18n.t.track_title }}</strong>
          <small v-if="order?.restaurantName">{{ i18n.t.track_title }}</small>
        </div>
      </div>
      <div class="trk-top-acts">
        <button
          class="trk-lang"
          type="button"
          :title="langTitle"
          :aria-label="langTitle"
          @click="i18n.toggleLocale"
        >
          <AppIcon name="globe" :size="14" />
          {{ i18n.locale === "km" ? "EN" : "ខ្មែរ" }}
        </button>
        <span class="trk-live" :class="{ off: state !== 'live' }" role="status" aria-live="polite">
          <i aria-hidden="true"></i>
          {{ state === "live" ? i18n.t.kds_live : i18n.t.track_connecting }}
        </span>
      </div>
    </header>

    <main class="trk-body">
      <!-- Wrong / expired tracking link -->
      <section v-if="state === 'invalid' || state === 'notfound'" class="trk-blank is-error">
        <span class="trk-blank-ic"><AppIcon name="x-octagon" :size="30" /></span>
        <h1>{{ i18n.t.track_not_found }}</h1>
        <p>{{ i18n.t.track_not_found_hint }}</p>
      </section>

      <!-- Waiting for the first snapshot -->
      <section v-else-if="!order" class="trk-blank">
        <span class="trk-spinner" aria-hidden="true"></span>
        <h1>{{ i18n.t.track_title }}</h1>
        <p>{{ i18n.t.track_connecting }}</p>
      </section>

      <!-- Live order — card stays on screen even if the stream blips -->
      <div v-else class="trk-stack">
        <TrackOrderCard
          :order="order"
          :steps="steps"
          :current-step="currentStep"
          :is-cancelled="isCancelled"
          :format-time="formatTime"
          :parse-items="parseItems"
          :currency-store="currencyStore"
          :i18n="i18n"
        />
        <p class="trk-foot">
          {{ i18n.t.track_auto }}
        </p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { useI18nStore } from "@/stores/i18n";
import { useCurrencyStore } from "@/stores/currency";
import AppIcon from "@/components/AppIcon.vue";
import TrackOrderCard from "@/components/TrackOrderCard.vue";
import {
  normalizeHex,
  lighten,
  darken,
  strongColor,
} from "@/utils/color.mjs";
import { buildThemePalette } from "@/utils/themePalette.mjs";
import { getCurrentLocale } from "@/utils/apiErrors";

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

// Same wording convention as SiteNav's language switcher
const langTitle = computed(() =>
  i18n.locale === "km" ? "Switch to English" : "ប្តូរទៅភាសាខ្មែរ",
);

// ─── LOGO ──────────────────────────────────────────────────
// Header image: the owner's restaurant photo → the shared default logo
// (same one MenuView uses when a restaurant hasn't uploaded one) → the
// store-icon chip, only if even that image fails to load.
const DEFAULT_LOGO =
  "https://res.cloudinary.com/daji2ml3y/image/upload/v1783262055/ChatGPT_Image_Jul_5_2026_09_32_32_PM_c6ziic.png";

const ownerLogoFailed = ref(false);
const defaultLogoFailed = ref(false);
watch(
  () => order.value?.logoUrl,
  () => {
    ownerLogoFailed.value = false; // URL changed — give the new one a chance
    defaultLogoFailed.value = false;
  },
);
const ownerLogo = computed(
  () => order.value?.logoUrl || order.value?.logo_url || "",
);
const logoSrc = computed(() => {
  if (ownerLogo.value && !ownerLogoFailed.value) return ownerLogo.value;
  if (!defaultLogoFailed.value) return DEFAULT_LOGO;
  return ""; // both images failed → store-icon chip
});
function onLogoError() {
  // The failed <img> is still the current src when the error event fires
  if (ownerLogo.value && logoSrc.value === ownerLogo.value) {
    ownerLogoFailed.value = true;
  } else {
    defaultLogoFailed.value = true;
  }
}

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
  return `${API_BASE}/api/orders/track?order_id=${orderId.value}&token=${encodeURIComponent(token.value)}&lang=${getCurrentLocale()}`;
}

async function onStatus(event) {
  try {
    const update = JSON.parse(event.data);
    // The first frame (and every reconnect) is a full snapshot; later frames
    // only carry status changes — for those, reload the complete order so
    // items/total/theme stay intact.
    if (update.items) {
      order.value = update;
    } else if (orderId.value && token.value) {
      const full = await fetchFullOrder();
      order.value = full || { ...order.value, ...update };
    } else {
      order.value = { ...order.value, ...update };
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
      {
        cache: "no-store",
        headers: { "Accept-Language": getCurrentLocale() },
      },
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

  // No REST pre-fetch here: the stream delivers a full snapshot (items,
  // theme, total) the moment it connects, which paints the card right away.
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(streamUrl(), {
      signal: ctrl.signal,
      cache: "no-store",
      headers: { "Accept-Language": getCurrentLocale() },
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
  min-height: 100dvh;
  color: var(--text-dark, #111827);
  background:
    radial-gradient(760px 300px at 50% -120px, var(--glow-soft, rgba(74, 222, 128, 0.16)), transparent 70%),
    var(--green-pale, #f4faf6);
  font-family: "Hanuman", "Noto Sans Khmer", system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  display: flex;
  flex-direction: column;
}

/* ─── Top bar ─── */
.trk-top {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px 12px;
  flex-wrap: wrap;
  padding: calc(10px + env(safe-area-inset-top, 0px)) 16px 10px;
  background: linear-gradient(120deg, var(--primary-dark, #12813c), var(--primary) 62%);
  color: var(--on-primary, #fff);
  box-shadow: 0 12px 26px -18px var(--shadow-tint, rgba(16, 24, 20, 0.55));
}

.trk-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1 1 auto;
}

.trk-logo {
  width: 36px;
  height: 36px;
  border-radius: 11px;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.45);
  background: rgba(255, 255, 255, 0.16);
  flex-shrink: 0;
}

.trk-logo-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--on-primary, #fff);
}

.trk-brand-txt {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.25;
}

.trk-brand-txt strong {
  font-size: 15px;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trk-brand-txt small {
  font-size: 10.5px;
  font-weight: 600;
  opacity: 0.85;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.trk-top-acts {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* Language pill — KH ⇄ EN */
.trk-lang {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.12);
  color: inherit;
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.trk-lang:hover {
  background: rgba(255, 255, 255, 0.24);
  border-color: rgba(255, 255, 255, 0.6);
}

.trk-lang:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.85);
  outline-offset: 2px;
}

/* Live badge — dot blinks while the SSE stream is open */
.trk-live {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.28);
  font-size: 11.5px;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
}

.trk-live i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.25);
  animation: trk-blink 1.5s ease-in-out infinite;
}

.trk-live.off {
  background: rgba(0, 0, 0, 0.16);
  border-color: rgba(255, 255, 255, 0.16);
}

.trk-live.off i {
  background: #fbbf24;
  box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.22);
}

@keyframes trk-blink {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.35;
  }
}

/* ─── Body ─── */
.trk-body {
  flex: 1;
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
  padding: 22px 16px calc(34px + env(safe-area-inset-bottom, 0px));
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Auto margins vertically center the card on tall screens, and collapse
   to 0 when it's taller than the viewport — so nothing gets cut off. */
.trk-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: auto 0;
}

/* ─── Blank / loading states ─── */
.trk-blank {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 40px 12px 60px;
  text-align: center;
}

.trk-blank h1 {
  font-size: 16px;
  font-weight: 800;
}

.trk-blank p {
  max-width: 300px;
  font-size: 13px;
  line-height: 1.55;
  color: var(--text-light, #6b7280);
}

.trk-blank-ic {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #fff;
  color: var(--primary-strong, var(--primary));
  border: 1px solid var(--green-soft, #e5efe9);
  box-shadow: 0 16px 34px -20px var(--shadow-tint, rgba(16, 24, 20, 0.5));
}

.trk-blank.is-error .trk-blank-ic {
  color: #dc2626;
  border-color: #fecaca;
}

.trk-spinner {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 4px solid var(--green-soft, #e5efe9);
  border-top-color: var(--primary);
  animation: trk-spin 0.8s linear infinite;
}

@keyframes trk-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ─── Footer hint ─── */
.trk-foot {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--text-light, #6b7280);
  text-align: center;
}

/* ─── Small screens ─── */
@media (max-width: 380px) {
  .trk-top {
    padding-inline: 12px;
  }

  .trk-brand-txt small {
    display: none;
  }

  .trk-lang {
    padding: 0 10px;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
</style>
