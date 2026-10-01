// Real-time order pipeline — SSE connection (probe + EventSource + backoff
// retry), the Khmer TTS "new order" voice alert, and the notification-bell
// seeding/backfill. Moved verbatim out of AdminView.vue. Singleton refs so
// AdminView (mount/unmount + Esc) and the Orders tab share one stream.
// Depends only on leaf singletons (orders / reports / stats / tab) — never
// imports back into the view, so there is no import cycle.
import { ref, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useI18nStore } from "@/stores/i18n";
import { useNotificationsStore } from "@/stores/notifications";
import { useCurrencyStore } from "@/stores/currency";
import { getApiErrorMessage, getCurrentLocale } from "@/utils/apiErrors";
import { orders, fetchOrders } from "@/composables/useAdminOrders";
import { fetchReport } from "@/composables/useAdminReports";
import { fetchStats } from "@/composables/useAdminStats";
import { adminTab } from "@/composables/useAdminTab";

const API_BASE = import.meta.env.VITE_API_URL;
const auth = useAuthStore();
const i18n = useI18nStore();
const notifications = useNotificationsStore();
const currencyStore = useCurrencyStore();

// ─── STREAM STATE ──────────────────────────────────────────
const orderStream = ref(null);
const orderStreamError = ref("");
let streamRetryTimer = null;
let streamAttempts = 0;
const lastAlertedOrderId = ref(null);
const isSpeaking = ref(false);

// Shared message builder for order notifications. The SSE payload uses
// camelCase (tableNo); DB rows fetched from /api/orders use snake_case
// (table_no) — accept both.
function buildOrderNotifMessage(order) {
  const tableNo = order.tableNo ?? order.table_no ?? "-";
  let msg = (i18n.t.new_order_notif || "New order from table {table}").replace(
    "{table}",
    tableNo,
  );
  if (order.total != null && order.total !== "") {
    msg += ` · ${currencyStore.fmt(order.total)}`;
  }
  return msg;
}

// Resolve a restaurant id → display name from the account's restaurant list
// (SSE events carry restaurantName since backend v15; seeds / older events
// fall back to this mapping).
function restaurantNameFor(restaurantId) {
  if (restaurantId == null) return "";
  const r = auth.restaurants.find((x) => Number(x.id) === Number(restaurantId));
  return r?.name || "";
}

// Backfill: the bell only receives LIVE events while the dashboard is open,
// so after a reload it would show an empty list even though orders exist.
// Seed the most recent orders as notifications (dedupe by id keeps this
// idempotent). Only pending orders count as unread → the badge reflects the
// pending orders; handled ones are marked read.
const MAX_SEEDED_ORDERS = 15;
function seedNotificationsFromOrders() {
  const recent = orders.value.slice(0, MAX_SEEDED_ORDERS);
  for (const o of recent) {
    if (!o || !o.id) continue;
    const id = `new-order-${o.id}`;
    notifications.push({
      id,
      type: "new-order",
      title: i18n.t.new_order || "New order",
      message: buildOrderNotifMessage(o),
      orderId: o.id,
      restaurantId: o.restaurant_id ?? o.restaurantId ?? null,
      restaurantName:
        o.restaurant_name ||
        restaurantNameFor(o.restaurant_id ?? o.restaurantId),
      tableNo: o.table_no ?? o.tableNo,
      createdAt: o.created_at || undefined,
      read: o.status !== "pending",
    });
    // An order that was pending (unread) and has since been handled
    // should not keep the badge lit after the list refreshes.
    if (o.status !== "pending") notifications.markRead(id);
  }
}

// Chrome loads speech voices asynchronously — cache the list and refresh it
// when ready so playOrderAlert() always has the full voice list to pick from.
const ttsVoices = ref(
  "speechSynthesis" in window ? window.speechSynthesis.getVoices() : [],
);
if ("speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    ttsVoices.value = window.speechSynthesis.getVoices();
  };
}

// Chrome blocks speechSynthesis until the page has had some user interaction
// (autoplay policy). Unlock it silently on the first click / keypress so the
// SSE-triggered announcement is allowed later.
let ttsUnlocked = false;
function unlockTTS() {
  if (ttsUnlocked) return;
  ttsUnlocked = true;
  try {
    const u = new SpeechSynthesisUtterance(" ");
    u.volume = 0;
    window.speechSynthesis.speak(u);
  } catch {
    /* unlock attempt only — never break the dashboard */
  }
}
if ("speechSynthesis" in window) {
  window.addEventListener("pointerdown", unlockTTS, { once: true });
  window.addEventListener("keydown", unlockTTS, { once: true });
}

function playOrderAlert(order) {
  // Voice alerts are best-effort: silently skip browsers without TTS.
  if (!("speechSynthesis" in window)) return;

  const tableNo = order.tableNo || "1";
  const voices = ttsVoices.value;
  const kmVoice = voices.find(
    (v) => v.lang && v.lang.toLowerCase().startsWith("km"),
  );

  // Announcement = table number only (no dishes, no money).
  // If the device has no Khmer voice, the engine silently skips the Khmer
  // script and reads just the digits — so fall back to an English sentence
  // to make sure the full announcement is actually heard.
  const text = kmVoice
    ? `ទទួលបានការកម្មង់ពីតុលេខ ${tableNo}`
    : `Received order from table number ${tableNo}`;

  const utterance = new SpeechSynthesisUtterance(text);
  if (kmVoice) {
    utterance.lang = "km-KH";
    utterance.voice = kmVoice;
  } else {
    // Fallback: set only the language, let the engine choose its own
    // default voice — assigning a picked voice can silently fail in Chrome.
    utterance.lang = "en-US";
  }
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;

  utterance.onstart = () => {
    isSpeaking.value = true;
  };
  utterance.onend = () => {
    isSpeaking.value = false;
  };
  utterance.onerror = () => {
    isSpeaking.value = false;
  };

  // Chrome bug: speak() right after cancel() gets silently dropped.
  // Delay the speak slightly and make sure the engine isn't paused.
  window.speechSynthesis.cancel();
  setTimeout(() => {
    try {
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(utterance);
    } catch {
      /* voice alert is best-effort — never break the dashboard */
    }
  }, 150);
}

// Probe the stream endpoint once so the real HTTP status/error can be
// reported — EventSource hides response codes, which made production 404s
// (e.g. "Restaurant not found") impossible to diagnose. The SSE handler
// sends headers immediately on both success and error, so a short probe is
// enough; the probe connection is then aborted and EventSource takes over.
async function probeOrderStream(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      cache: "no-store",
      headers: { "Accept-Language": getCurrentLocale() },
    });
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        msg = getApiErrorMessage(await res.json(), msg);
      } catch {
        /* non-JSON body — keep the generic message */
      }
      return { ok: false, status: res.status, msg };
    }
    return { ok: true };
  } finally {
    clearTimeout(timer);
    ctrl.abort(); // close the probe connection; EventSource opens its own
  }
}

function scheduleStreamRetry(delayMs) {
  clearTimeout(streamRetryTimer);
  streamRetryTimer = setTimeout(() => {
    streamRetryTimer = null;
    connectOrderStream();
  }, delayMs);
}

export async function connectOrderStream() {
  if (!auth.token) return;
  // An account without a restaurant can't have an order stream — the server
  // would answer 404 and the retry loop would spam it every 60s. The stream
  // is (re)connected from initForRestaurant() once a restaurant exists.
  if (!auth.restaurantId) {
    orderStreamError.value = "";
    return;
  }
  if (orderStream.value) return; // Already connected
  clearTimeout(streamRetryTimer);
  streamRetryTimer = null;

  // Renew the access token first when it's close to expiring — EventSource
  // bakes the token into its URL and can't swap it without a reconnect.
  await auth.ensureFreshToken();
  if (!auth.token) return; // session ended while renewing

  const params = new URLSearchParams({ token: auth.token });
  // Stream the restaurant the owner selected in the dashboard; when omitted,
  // the server streams every restaurant the account owns.
  if (auth.restaurant?.id) {
    params.set("restaurant_id", String(auth.restaurant.id));
  }
  params.set("lang", getCurrentLocale());
  const url = `${API_BASE}/api/orders/stream?${params.toString()}`;

  try {
    const probe = await probeOrderStream(url);
    if (!probe.ok) {
      // A 404 here means the account has no (matching) restaurant in the
      // server's database — retry slowly in case one is created later. The
      // reason is kept in orderStreamError; no console noise on every retry.
      orderStreamError.value = probe.msg;
      streamAttempts += 1;
      scheduleStreamRetry(60000);
      return;
    }
  } catch {
    /* probe couldn't finish (offline / server waking up) — let EventSource try */
  }

  const es = new EventSource(url);

  es.addEventListener("connected", () => {
    orderStreamError.value = "";
    streamAttempts = 0;
  });

  es.addEventListener("new-order", (event) => {
    try {
      const data = JSON.parse(event.data);
      if (!data.orderId || data.orderId === lastAlertedOrderId.value) return;
      lastAlertedOrderId.value = data.orderId;

      // 🔔 Push to the notification bell (near the profile avatar)
      notifications.push({
        id: `new-order-${data.orderId}`,
        type: "new-order",
        title: i18n.t.new_order || "New order",
        message: buildOrderNotifMessage(data),
        orderId: data.orderId,
        restaurantId: data.restaurantId ?? auth.restaurantId ?? null,
        restaurantName:
          data.restaurantName ||
          restaurantNameFor(data.restaurantId ?? auth.restaurantId),
        tableNo: data.tableNo,
        createdAt: data.createdAt || new Date().toISOString(),
      });

      // 🔊 Play Khmer voice alert: "ទទួលបានការកម្មង់ពីតុលេខ X"
      playOrderAlert(data);

      // Auto-refresh orders list if on orders tab
      if (adminTab.value === "orders") {
        fetchOrders();
      }

      // Refresh stats so dashboard numbers stay current
      fetchStats();
      // A live order changes the report too (when the tab is open)
      if (adminTab.value === "reports") fetchReport();

      // Also refresh foods badge if pending orders exist
      const badgeEl = document.querySelector(".nav-badge");
      if (badgeEl) badgeEl.classList.add("pulse-fast");
    } catch (err) {
      console.error("Failed to parse new-order event:", err);
    }
  });

  es.addEventListener("order-status", (event) => {
    try {
      const data = JSON.parse(event.data);
      // 🔔 Push to the notification bell (near the profile avatar)
      notifications.push({
        id: `order-status-${data.orderId}-${data.status}`,
        type: "order-status",
        status: data.status,
        title: i18n.t.status_updated || "Status updated",
        message: (
          i18n.t.order_status_notif || "Order #{id} (table {table}) → {status}"
        )
          .replace("{id}", data.orderId)
          .replace("{table}", data.tableNo ?? "-")
          .replace("{status}", i18n.t[data.status] || data.status),
        orderId: data.orderId,
        restaurantId: data.restaurantId ?? auth.restaurantId ?? null,
        restaurantName:
          data.restaurantName ||
          restaurantNameFor(data.restaurantId ?? auth.restaurantId),
        tableNo: data.tableNo,
      });

      // Update order status in the local list in real-time
      const idx = orders.value.findIndex((o) => o.id === data.orderId);
      if (idx !== -1) {
        orders.value[idx].status = data.status;
      }

      // Refresh stats so dashboard numbers stay current
      fetchStats();
    } catch (err) {
      console.error("Failed to parse order-status event:", err);
    }
  });

  es.onerror = () => {
    es.close();
    orderStream.value = null;
    streamAttempts += 1;
    // Backoff: 5s, 10s, 15s … capped at 60s. Render's free tier can sleep
    // the service, so keep retrying — just not every 5s forever.
    const delay = Math.min(60000, 5000 * streamAttempts);
    scheduleStreamRetry(delay);
  };

  orderStream.value = es;
}

export function disconnectOrderStream() {
  clearTimeout(streamRetryTimer);
  streamRetryTimer = null;
  if (orderStream.value) {
    orderStream.value.close();
    orderStream.value = null;
  }
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

// The bell backfill follows every orders refresh — the same watch(orders)
// the view had. Re-bound on every call so each dashboard mount gets a fresh
// watcher (auto-disposed with the component), exactly like before the split.
export function useAdminStream() {
  watch(orders, () => seedNotificationsFromOrders());
  return {
    orderStream,
    orderStreamError,
    lastAlertedOrderId,
    isSpeaking,
    buildOrderNotifMessage,
    restaurantNameFor,
    seedNotificationsFromOrders,
    playOrderAlert,
    connectOrderStream,
    disconnectOrderStream,
  };
}
