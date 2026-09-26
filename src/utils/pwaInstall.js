// frontend/src/utils/pwaInstall.js
// PWA install ("download the web as an app") — one shared capture point.
//
// Chrome/Edge fire `beforeinstallprompt` ONCE per page load, and usually very
// early: right after the service worker is active and the manifest checks out.
// A listener registered inside a lazily-loaded view (AdminView) mounts too
// late and misses the event — the install button then waits (spins) forever.
// Attaching it here, from main.js, guarantees the event is caught no matter
// which route the owner happens to be on.
import { ref, computed } from "vue";

const DISMISS_KEY = "dm_install_dismissed";
const INSTALLED_KEY = "dm_app_installed";

/** The captured, not-yet-used BeforeInstallPromptEvent. */
const deferredInstallEvent = ref(null);
/** The user dismissed the native dialog → teach the manual menu steps. */
const installDismissed = ref(readFlag(DISMISS_KEY));
/** The app is already installed ON THIS DEVICE (survives reloads). */
const installedOnDevice = ref(readFlag(INSTALLED_KEY));
/** `appinstalled` fired in this browser session. */
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
    /* private mode / storage disabled — the in-memory flag still works */
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

// Installed in another tab (or uninstalled) → keep this tab's button in sync.
function onStorage(e) {
  if (!e || e.key !== INSTALLED_KEY) return;
  installedOnDevice.value = e.newValue === "1";
}

// Chrome/Edge only (Android + Windows): asks the browser whether the app is
// already installed for THIS browser profile — this also catches installs that
// happened before the localStorage flag existed. Skipped when unsupported.
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
  // Prevent Chrome's own mini-infobar; the dashboard owns the UX.
  e.preventDefault();
  deferredInstallEvent.value = e;
  // A fresh event clears any earlier "dismissed" backoff marker.
  writeDismissedFlag(false);
  // Chrome never offers to install an app that is already installed, so this
  // event also proves a persisted "installed" flag went stale (the owner
  // uninstalled the app) → re-enable the button.
  writeInstalledFlag(false);
  console.log("✅ Install ready — browser fired beforeinstallprompt");
}

function onAppInstalled() {
  deferredInstallEvent.value = null;
  installedThisSession.value = true;
  writeInstalledFlag(true);
}

let attached = false;

/**
 * Attach the install listeners. Call ONCE from the app entry (main.js)
 * BEFORE the app mounts, so no event can slip through.
 */
export function initPwaInstall() {
  if (attached || typeof window === "undefined") return;
  attached = true;
  window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  window.addEventListener("appinstalled", onAppInstalled);
  window.addEventListener("storage", onStorage);
  // Best-effort: recover an install that happened before this flag existed.
  if (!installedOnDevice.value) {
    installedRelatedAppFound().then((found) => {
      if (found) writeInstalledFlag(true);
    });
  }
}

/** Everything the install UI needs (AdminView profile dropdown + modal). */
export function usePwaInstall() {
  const canNativeInstall = computed(() => !!deferredInstallEvent.value);

  // Already launched as an installed app (Android/desktop standalone, iOS
  // "Add to Home Screen" → navigator.standalone).
  const isStandalone = computed(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    );
  });

  // The app is already installed on this device: it is running standalone
  // right now, was installed from this browser during this session, or a
  // previous visit remembered the install (dm_app_installed). The install
  // button is DISABLED in that state and the UI states the app is installed.
  const isInstalled = computed(
    () =>
      isStandalone.value || installedThisSession.value || installedOnDevice.value,
  );

  // iOS/iPadOS Safari has no beforeinstallprompt → manual steps.
  const isIos = computed(() => {
    if (typeof window === "undefined") return false;
    return (
      /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
      // iPadOS 13+ identifies as Mac with touch support
      (window.navigator.platform === "MacIntel" &&
        window.navigator.maxTouchPoints > 1)
    );
  });

  // ─── Browsers with NO one-tap install dialog ────────────────
  // Only Chromium-based browsers (Chrome, Edge, Opera, Brave…) fire
  // beforeinstallprompt. macOS Safari installs through File → “Add to Dock…”
  // (Sonoma+), and Firefox cannot install web apps at all — those browsers get
  // their own instructions instead of a spinner/Refresh that can never work.
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

  // Installability needs a secure context — plain HTTP / a LAN IP can never
  // trigger the dialog. Say so instead of waiting for an event that can't come.
  const insecureContext = computed(
    () => typeof window !== "undefined" && !window.isSecureContext,
  );

  // "Install app" entry point: visible while browsing in a normal tab (hidden
  // inside the installed app itself). The UI disables it and shows the
  // "already installed" text as soon as `isInstalled` is true.
  const installAvailable = computed(() => !isStandalone.value);

  /**
   * Fire the browser's native install dialog. Requires the captured event and
   * a user gesture, hence the button. The event is single-use: once the user
   * answered (accepted OR dismissed) `prompt()` must never be called again, so
   * the reference is dropped immediately.
   */
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
      }
      // Dismissed → Chrome backs off firing the event for a while, so the UI
      // switches to the always-working manual menu steps.
      else writeDismissedFlag(true);
      return { ok: true, outcome };
    } catch (err) {
      // e.g. the event was already used, or the gesture was not trusted
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
