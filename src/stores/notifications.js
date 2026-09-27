import { defineStore } from "pinia";
import { ref, computed } from "vue";

const STORAGE_PREFIX = "mr_notifications_v1_";
const MAX_NOTIFICATIONS = 50;

export const useNotificationsStore = defineStore("notifications", () => {
  const notifications = ref([]);
  const userId = ref(null);

  // Timestamp bumped on every incoming notification to trigger bell animations
  const lastAddedAt = ref(0);

  const unreadCount = computed(
    () => notifications.value.filter((n) => !n.read).length,
  );

  function storageKey() {
    return `${STORAGE_PREFIX}${userId.value ?? "guest"}`;
  }

  function persist() {
    try {
      localStorage.setItem(storageKey(), JSON.stringify(notifications.value));
    } catch {
      // Ignore quota exceeded / private mode errors
    }
  }

  // Load the notification list for a user (called after auth is ready)
  function load(id = null) {
    userId.value = id;
    try {
      const raw = localStorage.getItem(storageKey());
      notifications.value = raw ? JSON.parse(raw) : [];
    } catch {
      notifications.value = [];
    }
  }

  // Add a notification (newest first, deduped by id)
  function push(notif) {
    if (!notif || !notif.id) return;
    if (notifications.value.some((n) => n.id === notif.id)) return;
    notifications.value.unshift({
      read: false,
      createdAt: new Date().toISOString(),
      ...notif,
    });
    if (notifications.value.length > MAX_NOTIFICATIONS) {
      notifications.value.length = MAX_NOTIFICATIONS;
    }
    lastAddedAt.value = Date.now();
    persist();
  }

  function markRead(id) {
    const n = notifications.value.find((item) => item.id === id);
    if (n && !n.read) {
      n.read = true;
      persist();
    }
  }

  function markAllRead() {
    if (!unreadCount.value) return;
    notifications.value.forEach((n) => (n.read = true));
    persist();
  }

  function remove(id) {
    notifications.value = notifications.value.filter((n) => n.id !== id);
    persist();
  }

  function clearAll() {
    notifications.value = [];
    persist();
  }

  return {
    notifications,
    unreadCount,
    lastAddedAt,
    load,
    push,
    markRead,
    markAllRead,
    remove,
    clearAll,
  };
});
