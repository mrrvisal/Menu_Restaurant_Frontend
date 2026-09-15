// frontend/src/utils/pushNotifications.js
// Web Push (VAPID) helper — registers the service worker, asks for the
// browser notification permission, subscribes to push messages and syncs
// the subscription with the backend (/api/push/*).
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;
const SW_PATH = "/sw.js";

/** Feature detection — push needs SW + PushManager + Notification. */
export function pushSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/** Standard VAPID base64 → Uint8Array conversion for subscribe(). */
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

/**
 * Current state of push on this device/browser:
 *   enabled | disabled | blocked | unsupported | not_configured
 * `not_configured` = the backend has no VAPID keys set.
 */
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

/**
 * Enable push on this device:
 * 1. fetch VAPID public key from the backend
 * 2. request the browser notification permission
 * 3. register /sw.js and create a push subscription
 * 4. POST the subscription to the backend
 * Returns { ok: true } or { ok: false, reason }.
 */
export async function enablePush(token) {
  if (!pushSupported()) return { ok: false, reason: "unsupported" };

  // 1. VAPID public key
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

  // 2. Notification permission (must come from a user gesture)
  let permission = Notification.permission;
  if (permission === "default") {
    try {
      permission = await Notification.requestPermission();
    } catch {
      permission = "denied";
    }
  }
  if (permission !== "granted") return { ok: false, reason: "denied" };

  // 3. Service worker + push subscription (reuse the existing one if any)
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

  // 4. Sync the subscription to the backend
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

/** Disable push on this device (browser unsubscribe + backend removal). */
export async function disablePush(token) {
  try {
    const sub = await getExistingSubscription();
    if (sub) {
      await axios.post(
        `${API_BASE}/api/push/unsubscribe`,
        { endpoint: sub.endpoint },
        { headers: authHeaders(token) },
      ).catch(() => {/* best effort */});
      await sub.unsubscribe();
    }
    return { ok: true };
  } catch (err) {
    console.error("Push disable error:", err);
    return { ok: false, reason: "unsubscribe_failed" };
  }
}
