<!-- ═══════════════════════════════════════════════════════════
   NotificationBell — real-time notification centre button.
   Sits right next to the profile avatar in the admin header.
   Receives live events over the SSE order stream (new order /
   order status change) via the notifications Pinia store.
   ═══════════════════════════════════════════════════════════ -->
<template>
  <div class="nb-wrap" ref="wrapEl">
    <button
      class="nb-btn"
      :class="{ 'nb-ring': ringing }"
      @click.stop="open = !open"
      :title="t.notifications || 'Notifications'"
      :aria-label="t.notifications || 'Notifications'"
      :aria-haspopup="true"
      :aria-expanded="open"
    >
      <AppIcon name="bell" :size="16" />
      <span v-if="store.unreadCount" class="nb-badge">{{
        store.unreadCount > 9 ? "9+" : store.unreadCount
      }}</span>
    </button>

    <Transition name="fade">
      <div v-if="open" class="nb-panel">
        <div class="nb-head">
          <span class="nb-title">{{ t.notifications || "Notifications" }}</span>
          <div class="nb-head-acts">
            <button
              v-if="store.unreadCount"
              class="nb-act"
              @click="store.markAllRead()"
            >
              {{ t.mark_all_read || "Mark all read" }}
            </button>
            <button
              v-if="store.notifications.length"
              class="nb-act nb-act-danger"
              @click="store.clearAll()"
            >
              {{ t.clear_all || "Clear" }}
            </button>
          </div>
        </div>

        <div v-if="filterTabs.length" class="nb-filters">
          <button
            v-for="tab in filterTabs"
            :key="tab.id"
            type="button"
            class="nb-filter"
            :class="{ active: filterId === tab.id }"
            @click="filterId = tab.id"
          >
            {{ tab.name }}
            <span
              v-if="
                tab.id
                  ? store.notifications.filter(
                      (n) =>
                        !n.read && Number(n.restaurantId) === Number(tab.id),
                    ).length
                  : store.unreadCount
              "
              class="nb-filter-badge"
              >{{
                tab.id
                  ? store.notifications.filter(
                      (n) =>
                        !n.read && Number(n.restaurantId) === Number(tab.id),
                    ).length
                  : store.unreadCount
              }}</span
            >
          </button>
        </div>

        <div v-if="filteredNotifications.length" class="nb-list">
          <button
            v-for="n in filteredNotifications"
            :key="n.id"
            class="nb-item"
            :class="{ 'nb-item-unread': !n.read }"
            @click="onSelect(n)"
          >
            <span class="nb-ico" :class="iconClass(n)">
              <AppIcon :name="iconName(n)" :size="15" />
            </span>
            <span class="nb-txt">
              <span class="nb-item-title">{{ n.title }}</span>
              <span class="nb-item-msg">{{ n.message }}</span>
              <span class="nb-item-meta">
                <span
                  v-if="showRestaurantChip && n.restaurantName"
                  class="nb-rest"
                  >{{ n.restaurantName }}</span
                >
                <span class="nb-item-time">{{ timeAgo(n.createdAt) }}</span>
              </span>
            </span>
            <span v-if="!n.read" class="nb-unread-dot"></span>
          </button>
        </div>

        <div v-else class="nb-empty">
          <AppIcon name="bell" :size="30" />
          <p>{{ t.no_notifications || "No notifications yet" }}</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import AppIcon from "@/components/AppIcon.vue";
import { useNotificationsStore } from "@/stores/notifications";
import { useI18nStore } from "@/stores/i18n";
import { useAuthStore } from "@/stores/auth";

const emit = defineEmits(["select"]);

const store = useNotificationsStore();
const i18n = useI18nStore();
const auth = useAuthStore();
// Computed so the labels follow locale switches; `t.value` in script,
// auto-unwrapped `t.xxx` in the template.
const t = computed(() => i18n.t);

// ─── Per-restaurant filtering ───────────────────────────────
// Owners with several restaurants can scope the bell to one place.
// 0 = "All restaurants". Only offered when the account has 2+ restaurants.
const filterId = ref(0);
const multiRestaurant = computed(() => auth.restaurants.length > 1);
const filterTabs = computed(() =>
  multiRestaurant.value
    ? [{ id: 0, name: i18n.t.all || "All" }, ...auth.restaurants]
    : [],
);
const filteredNotifications = computed(() => {
  if (!filterId.value) return store.notifications;
  return store.notifications.filter(
    (n) => Number(n.restaurantId) === Number(filterId.value),
  );
});
// Show the restaurant chip on items only when it adds information.
const showRestaurantChip = computed(
  () => multiRestaurant.value || store.notifications.some((n) => n.restaurantName),
);

const wrapEl = ref(null);
const open = ref(false);
const ringing = ref(false);
let ringTimer = null;

// Ticker so relative timestamps ("5 min ago") stay fresh while open.
const now = ref(Date.now());
let tickTimer = null;

onMounted(() => {
  tickTimer = setInterval(() => (now.value = Date.now()), 30000);

  // Close on outside click / Escape (same pattern as the profile dropdown).
  document.addEventListener("click", onDocClick);
  document.addEventListener("keydown", onDocKey);
});
onUnmounted(() => {
  clearInterval(tickTimer);
  clearTimeout(ringTimer);
  document.removeEventListener("click", onDocClick);
  document.removeEventListener("keydown", onDocKey);
});

function onDocClick(e) {
  if (open.value && wrapEl.value && !wrapEl.value.contains(e.target)) {
    open.value = false;
  }
}
function onDocKey(e) {
  if (e.key === "Escape" && open.value) open.value = false;
}

// Ring the bell whenever a notification arrives — a visual cue that
// something new came in, even when the panel is already open.
watch(
  () => store.lastAddedAt,
  (ts) => {
    if (!ts) return;
    ringing.value = false;
    // restart the CSS animation on back-to-back events
    requestAnimationFrame(() => {
      ringing.value = true;
      clearTimeout(ringTimer);
      ringTimer = setTimeout(() => (ringing.value = false), 1200);
    });
  },
);

function onSelect(n) {
  store.markRead(n.id);
  open.value = false;
  emit("select", n);
}

function iconName(n) {
  if (n.type === "order-status")
    return n.status === "cancelled" ? "x-circle" : "check-circle";
  return "clipboard";
}
function iconClass(n) {
  if (n.type === "order-status") {
    return n.status === "cancelled" ? "nb-ico-red" : "nb-ico-green";
  }
  return "nb-ico-amber";
}

function timeAgo(iso) {
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return "";
  const diff = Math.max(0, now.value - ts);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t.value.just_now || "Just now";
  if (mins < 60)
    return (t.value.minutes_ago || "{n} min ago").replace("{n}", mins);
  const hours = Math.floor(mins / 60);
  if (hours < 24) return (t.value.hours_ago || "{n} h ago").replace("{n}", hours);
  const days = Math.floor(hours / 24);
  return (t.value.days_ago || "{n} d ago").replace("{n}", days);
}
</script>

<style scoped>
/* ═══ Wrapper / button — matches the round .ac-avatar header buttons ═══ */
.nb-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
}
.nb-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  min-width: 36px;
  padding: 8px;
  border-radius: 50%;
  border: 1px solid var(--border, #e2e8e2);
  background: var(--surface, #fff);
  color: var(--text, #1b2e1b);
  cursor: pointer;
  transition: all 0.2s ease;
}
.nb-btn:hover {
  border-color: var(--primary-strong, var(--primary, #2d7a2d));
  color: var(--primary-strong, var(--primary, #2d7a2d));
  background: var(--surface-green, var(--green-pale, #e8f5e9));
}

/* Unread badge */
.nb-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 17px;
  height: 17px;
  padding: 0 4px;
  border-radius: 9px;
  background: var(--red, #ef4444);
  border: 2px solid var(--surface, #fff);
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  line-height: 13px;
  text-align: center;
  pointer-events: none;
}

/* Ring animation on new notification */
.nb-ring {
  animation: nb-shake 0.6s ease;
}
@keyframes nb-shake {
  0%,
  100% {
    transform: rotate(0);
  }
  15% {
    transform: rotate(12deg);
  }
  30% {
    transform: rotate(-10deg);
  }
  45% {
    transform: rotate(8deg);
  }
  60% {
    transform: rotate(-6deg);
  }
  75% {
    transform: rotate(3deg);
  }
}

/* ═══ Dropdown panel — mirrors .profile-menu look & z-index ═══ */
.nb-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: min(330px, calc(100vw - 32px));
  background: var(--surface, #fff);
  border: 1px solid var(--border, #e2e8e2);
  border-radius: 14px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
  z-index: 120; /* above sidebar (90-100), below modals (200+) */
  overflow: hidden;
  animation: pm-pop 0.16s ease;
}
@keyframes pm-pop {
  from {
    opacity: 0;
    transform: translateY(-4px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.nb-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 11px 12px;
  border-bottom: 1px solid var(--border, #e2e8e2);
  background: var(--surface-green, var(--green-pale, #e8f5e9));
}
.nb-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--text, #1b2e1b);
  white-space: nowrap;
}
.nb-head-acts {
  display: flex;
  gap: 6px;
}
.nb-act {
  border: none;
  background: transparent;
  padding: 2px 4px;
  font-size: 10.5px;
  font-weight: 600;
  font-family: inherit;
  color: var(--primary-strong, var(--primary, #2d7a2d));
  cursor: pointer;
  white-space: nowrap;
}
.nb-act:hover {
  text-decoration: underline;
}
.nb-act-danger {
  color: var(--red, #ef4444);
}

/* ═══ Per-restaurant filter tabs ═══ */
.nb-filters {
  display: flex;
  gap: 4px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--border, #e2e8e2);
  overflow-x: auto;
  scrollbar-width: none;
}
.nb-filters::-webkit-scrollbar {
  display: none;
}
.nb-filter {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: 1px solid var(--border, #e2e8e2);
  background: var(--surface, #fff);
  color: var(--text-mid, #3a5a3a);
  font-family: inherit;
  font-size: 10.5px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.nb-filter:hover {
  border-color: var(--primary-strong, var(--primary, #2d7a2d));
}
.nb-filter.active {
  background: var(--primary-strong, var(--primary, #2d7a2d));
  border-color: var(--primary-strong, var(--primary, #2d7a2d));
  color: #fff;
}
.nb-filter-badge {
  min-width: 15px;
  height: 15px;
  padding: 0 4px;
  border-radius: 8px;
  background: var(--red, #ef4444);
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  line-height: 15px;
  text-align: center;
}
.nb-filter.active .nb-filter-badge {
  background: rgba(255, 255, 255, 0.25);
}

/* Restaurant chip on each notification */
.nb-item-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  flex-wrap: wrap;
}
.nb-rest {
  display: inline-block;
  max-width: 110px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 9.5px;
  font-weight: 600;
  color: var(--primary-strong, var(--primary, #2d7a2d));
  background: var(--green-pale, #e8f5e9);
  border-radius: 5px;
  padding: 1px 6px;
}

/* ═══ List ═══ */
.nb-list {
  max-height: min(420px, 62vh);
  overflow-y: auto;
  overscroll-behavior: contain;
}
.nb-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-bottom: 1px solid var(--border, #e2e8e2);
  background: transparent;
  text-align: start;
  cursor: pointer;
  transition: background 0.15s ease;
}
.nb-item:last-child {
  border-bottom: none;
}
.nb-item:hover {
  background: var(--surface-green, var(--green-pale, #e8f5e9));
}
.nb-item-unread {
  background: var(--surface-green, var(--green-pale, #e8f5e9));
}
.nb-item-unread:hover {
  background: var(--green-soft, #c8e6c9);
}
.nb-ico {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}
.nb-ico-amber {
  background: #fef3c7;
  color: #b45309;
}
.nb-ico-green {
  background: var(--green-pale, #e8f5e9);
  color: var(--green-mid, #2d7a2d);
}
.nb-ico-red {
  background: #fef2f2;
  color: var(--red, #ef4444);
}
.nb-txt {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}
.nb-item-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--text, #1b2e1b);
}
.nb-item-msg {
  font-size: 11px;
  color: var(--text-mid, #3a5a3a);
  line-height: 1.4;
  word-break: break-word;
}
.nb-item-time {
  font-size: 10px;
  color: var(--text-light, #6a8f6a);
}
.nb-unread-dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  margin-top: 6px;
  border-radius: 50%;
  background: var(--primary-strong, var(--primary, #2d7a2d));
}

/* Empty state */
.nb-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 26px 16px;
  color: var(--text-light, #6a8f6a);
}
.nb-empty p {
  font-size: 12px;
}

/* Slightly smaller inside the mobile top bar */
@media (max-width: 900px) {
  .nb-btn {
    width: 32px;
    height: 32px;
    min-width: 32px;
    padding: 6px;
  }
}
@media (max-width: 380px) {
  .nb-panel {
    width: calc(100vw - 24px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .nb-ring {
    animation: none;
  }
}
</style>
