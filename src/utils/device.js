// frontend/src/utils/device.js
// ─── DEVICE IDENTITY (client side) ─────────────────────────
// Generates a stable UUID per browser (persisted in localStorage) and
// collects display/environment info so the backend can record exactly
// which device accessed the account, from where, and when.

const DEVICE_KEY = "device_uuid";

function generateUuid() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  // Fallback for older browsers
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    },
  );
}

export function getDeviceId() {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = generateUuid();
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    // localStorage can throw in private mode — generate per-session id
    return generateUuid();
  }
}

function detectDeviceType() {
  const ua = navigator.userAgent || "";
  if (/iPad|Tablet|PlayBook|Silk/.test(ua)) return "tablet";
  if (/Mobi|iPhone|iPod|Android.*Mobile|Windows Phone/.test(ua))
    return "mobile";
  return "desktop";
}

// Everything the backend expects in `deviceInfo` (login body)
export function getDeviceInfo() {
  return {
    deviceId: getDeviceId(),
    deviceType: detectDeviceType(),
    screen:
      window.screen ? `${window.screen.width}x${window.screen.height}` : "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    language: navigator.language || "",
    // ── extra environment info the owner can review later ──
    platform:
      navigator.userAgentData?.platform || navigator.platform || "",
    hardware: [
      navigator.hardwareConcurrency
        ? `${navigator.hardwareConcurrency} cores`
        : "",
      navigator.deviceMemory ? `${navigator.deviceMemory}GB RAM` : "",
    ]
      .filter(Boolean)
      .join(" · "),
  };
}

// Attach the device id to EVERY axios request so the backend can keep
// the "last active" timestamp and current IP fresh for this device.
export function attachDeviceHeader(axios) {
  axios.defaults.headers.common["X-Device-Id"] = getDeviceId();
}
