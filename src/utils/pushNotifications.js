// Web Push (VAPID) helper — registers service worker, manages notifications, and syncs push subscriptions
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;
const SW_PATH = "/sw.js";

// Feature detection: requires Service Worker, PushManager, and Notification
export function pushSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

// Convert VAPID base64 string to Uint8Array for PushManager subscribe()
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

async function getRegistration() {
  if (!pushSupported()) return null;
  return navigator.serviceWorker.getRegistration();
}

async function getExistingSubscription() {
  const reg = await getRegistration();
  return reg ? reg.pushManager.getSubscription() : null;
}

// Current push status: enabled | disabled | blocked | unsupported | not_configured
export async function getPushState(token) {
  if (!pushSupported()) return { state: "unsupported" };
  if (Notification.permission === "denied") return { state: "blocked" };

  let key = null;
  try {
    const res = await axios.get(`${API_BASE}/api/push/public-key`, {
      headers: authHeaders(token),
    });
    key = res.data?.key || null;
  } catch {
    key = null;
  }
  if (!key) return { state: "not_configured" };

  const sub = await getExistingSubscription();
  if (Notification.permission === "granted" && sub) {
    return { state: "enabled" };
  }
  return { state: "disabled" };
}

// Request permission, subscribe with VAPID key, and sync to backend
export async function enablePush(token) {
  if (!pushSupported()) return { ok: false, reason: "unsupported" };

  // 1. Fetch VAPID public key
  let key = null;
  try {
    const res = await axios.get(`${API_BASE}/api/push/public-key`, {
      headers: authHeaders(token),
    });
    key = res.data?.key || null;
  } catch {
    key = null;
  }
  if (!key) return { ok: false, reason: "not_configured" };

  // 2. Request notification permission
  let permission = Notification.permission;
  if (permission === "default") {
    try {
      permission = await Notification.requestPermission();
    } catch {
      permission = "denied";
    }
  }
  if (permission !== "granted") return { ok: false, reason: "denied" };

  // 3. Register service worker and subscribe
  let subscription;
  try {
    const reg = await navigator.serviceWorker.register(SW_PATH);
    await navigator.serviceWorker.ready;
    subscription =
      (await reg.pushManager.getSubscription()) ||
      (await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      }));
  } catch (err) {
    console.error("Push subscribe error:", err);
    return { ok: false, reason: "subscribe_failed" };
  }

  // 4. Send subscription to backend
  try {
    await axios.post(
      `${API_BASE}/api/push/subscribe`,
      { subscription: subscription.toJSON() },
      { headers: authHeaders(token) },
    );
  } catch (err) {
    console.error("Push save error:", err);
    return { ok: false, reason: "save_failed" };
  }

  return { ok: true };
}

// Unsubscribe locally and remove subscription from backend
export async function disablePush(token) {
  try {
    const sub = await getExistingSubscription();
    if (sub) {
      await axios
        .post(
          `${API_BASE}/api/push/unsubscribe`,
          { endpoint: sub.endpoint },
          { headers: authHeaders(token) },
        )
        .catch(() => {});
      await sub.unsubscribe();
    }
    return { ok: true };
  } catch (err) {
    console.error("Push disable error:", err);
    return { ok: false, reason: "unsubscribe_failed" };
  }
}
