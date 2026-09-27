// PWA installation helper — captures beforeinstallprompt and detects platform install status
import { ref, computed } from "vue";

const DISMISS_KEY = "dm_install_dismissed";
const INSTALLED_KEY = "dm_app_installed";

const deferredInstallEvent = ref(null);
const installDismissed = ref(readFlag(DISMISS_KEY));
const installedOnDevice = ref(readFlag(INSTALLED_KEY));
const installedThisSession = ref(false);

function readFlag(key) {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeFlag(key, value) {
  try {
    if (value) localStorage.setItem(key, "1");
    else localStorage.removeItem(key);
  } catch {
    // In-memory fallback if storage is disabled
  }
}

function writeDismissedFlag(value) {
  installDismissed.value = value;
  writeFlag(DISMISS_KEY, value);
}

function writeInstalledFlag(value) {
  installedOnDevice.value = value;
  writeFlag(INSTALLED_KEY, value);
}

function onStorage(e) {
  if (!e || e.key !== INSTALLED_KEY) return;
  installedOnDevice.value = e.newValue === "1";
}

async function installedRelatedAppFound() {
  if (typeof navigator === "undefined" || !navigator.getInstalledRelatedApps) {
    return false;
  }
  try {
    const apps = await navigator.getInstalledRelatedApps();
    return Array.isArray(apps) && apps.length > 0;
  } catch {
    return false;
  }
}

function onBeforeInstallPrompt(e) {
  e.preventDefault();
  deferredInstallEvent.value = e;
  writeDismissedFlag(false);
  writeInstalledFlag(false);
}

function onAppInstalled() {
  deferredInstallEvent.value = null;
  installedThisSession.value = true;
  writeInstalledFlag(true);
}

let attached = false;

// Attach global listeners early before app mounts to ensure beforeinstallprompt is captured
export function initPwaInstall() {
  if (attached || typeof window === "undefined") return;
  attached = true;
  window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  window.addEventListener("appinstalled", onAppInstalled);
  window.addEventListener("storage", onStorage);
  if (!installedOnDevice.value) {
    installedRelatedAppFound().then((found) => {
      if (found) writeInstalledFlag(true);
    });
  }
}

// Composable providing reactive PWA installation state and prompt methods
export function usePwaInstall() {
  const canNativeInstall = computed(() => !!deferredInstallEvent.value);

  const isStandalone = computed(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  });

  const isInstalled = computed(
    () =>
      isStandalone.value ||
      installedThisSession.value ||
      installedOnDevice.value,
  );

  const isIos = computed(() => {
    if (typeof window === "undefined") return false;
    return (
      /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
      (window.navigator.platform === "MacIntel" &&
        window.navigator.maxTouchPoints > 1)
    );
  });

  const userAgent = computed(() =>
    typeof window === "undefined" ? "" : window.navigator.userAgent || "",
  );
  const isSafari = computed(
    () =>
      /safari/i.test(userAgent.value) &&
      /macintosh|mac os x/i.test(userAgent.value) &&
      !/chrome|chromium|crios|edg|opr|firefox|fxios|android/i.test(
        userAgent.value,
      ),
  );
  const isFirefox = computed(() => /firefox|fxios/i.test(userAgent.value));
  const needsManualInstall = computed(
    () => isIos.value || isSafari.value || isFirefox.value,
  );

  const insecureContext = computed(
    () => typeof window !== "undefined" && !window.isSecureContext,
  );

  const installAvailable = computed(() => !isStandalone.value);

  async function promptInstall() {
    const event = deferredInstallEvent.value;
    if (!event) return { ok: false, reason: "unavailable" };
    deferredInstallEvent.value = null;
    try {
      event.prompt();
      const { outcome } = await event.userChoice;
      if (outcome === "accepted") {
        installedThisSession.value = true;
        writeInstalledFlag(true);
      } else {
        writeDismissedFlag(true);
      }
      return { ok: true, outcome };
    } catch (err) {
      console.warn("Install prompt failed:", err);
      writeDismissedFlag(true);
      return { ok: false, reason: "error" };
    }
  }

  return {
    canNativeInstall,
    isStandalone,
    isInstalled,
    isIos,
    isSafari,
    isFirefox,
    needsManualInstall,
    insecureContext,
    installDismissed,
    installAvailable,
    promptInstall,
  };
}
