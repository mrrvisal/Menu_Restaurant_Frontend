// Client-side device identity and environment detection

const DEVICE_KEY = "device_uuid";

function generateUuid() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  // Fallback for older browsers
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
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
    // Fallback in private browsing modes where storage access throws
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

// Full device and environment metadata for login logging
export function getDeviceInfo() {
  return {
    deviceId: getDeviceId(),
    deviceType: detectDeviceType(),
    screen: window.screen
      ? `${window.screen.width}x${window.screen.height}`
      : "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    language: navigator.language || "",
    platform: navigator.userAgentData?.platform || navigator.platform || "",
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

// Attach stable device ID to all outgoing axios requests
export function attachDeviceHeader(axios) {
  axios.defaults.headers.common["X-Device-Id"] = getDeviceId();
}
