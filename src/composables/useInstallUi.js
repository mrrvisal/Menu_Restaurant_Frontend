// PWA install UI for the admin screens — same singleton pattern as
// @/utils/pwaInstall: the mobile bar, the profile menu and the install modal
// all share ONE state, so opening the modal from any entry point works the
// same. The browser event itself is captured by @/utils/pwaInstall (attached
// from main.js BEFORE the app mounts).
import { ref, computed, watch } from "vue";
import { useI18nStore } from "@/stores/i18n";
import { usePwaInstall } from "@/utils/pwaInstall";

const showInstallModal = ref(false);
const installWaitExpired = ref(false);
let installWaitTimer = null;

// The browser may need a moment before it fires `beforeinstallprompt` — on a
// first visit the service worker has only just been installed. Keep the
// spinner for this short grace period only, then fall back to the manual
// menu steps, so the button can never spin forever.
const INSTALL_WAIT_MS = 2500;

// Registered ONCE at module load — NOT from inside a component's setup.
// Component-scoped watchers are auto-stopped when that component unmounts,
// which would leave the shared modal without its wait-timer / auto-close
// logic on the next mount. Module scope lives for the whole app.
const pwa = usePwaInstall();

function ensureWatchers() {
  // A successful install hides the entry point immediately (no page reload).
  watch(pwa.isInstalled, (done) => {
    if (done) showInstallModal.value = false;
  });

  watch(showInstallModal, (open) => {
    clearTimeout(installWaitTimer);
    installWaitTimer = null;
    if (!open) return;
    installWaitExpired.value = false;
    // Nothing to wait for: the app is installed, the browser has no install
    // event at all (Safari / iOS / Firefox), or the page runs as the app.
    if (
      pwa.canNativeInstall.value ||
      pwa.isInstalled.value ||
      pwa.needsManualInstall.value ||
      pwa.isStandalone.value
    )
      return;
    installWaitTimer = setTimeout(() => {
      if (!pwa.canNativeInstall.value) installWaitExpired.value = true;
    }, INSTALL_WAIT_MS);
  });

  // The event can still arrive while the modal is open → drop the fallback
  watch(pwa.canNativeInstall, (ready) => {
    if (ready) installWaitExpired.value = false;
  });
}

ensureWatchers();

export function useInstallUi() {
  const i18n = useI18nStore();

  // Label/tooltip for the install entry points: plain "Install app" normally,
  // and "already installed · install again" once the app is on this device —
  // the entry STAYS clickable because the owner may want to install it again.
  const installEntryLabel = computed(() =>
    pwa.isInstalled.value
      ? `${i18n.t.install_installed} · ${i18n.t.install_again}`
      : i18n.t.install_app,
  );

  // Manual install steps per browser (only Chromium fires
  // beforeinstallprompt; Firefox cannot install web apps at all).
  const manualInstallSteps = computed(() => {
    if (pwa.isIos.value)
      return [i18n.t.install_ios_1, i18n.t.install_ios_2, i18n.t.install_ios_3];
    if (pwa.isSafari.value)
      return [
        i18n.t.install_safari_1,
        i18n.t.install_safari_2,
        i18n.t.install_safari_3,
      ];
    if (pwa.isFirefox.value) return [];
    return [i18n.t.install_chrome_1, i18n.t.install_chrome_2];
  });

  // Short line above those steps (empty when the steps explain themselves).
  // NOTE: iOS is checked first — the iOS UA also contains "Mac OS X", so it
  // would otherwise match the desktop-Safari hint (which mentions macOS).
  const manualInstallHint = computed(() => {
    if (pwa.isIos.value) return "";
    if (pwa.isSafari.value) return i18n.t.install_safari_hint;
    if (pwa.isFirefox.value) return i18n.t.install_firefox_hint;
    return "";
  });

  // Chromium, still waiting for beforeinstallprompt — the only state that
  // should not show the manual steps yet (the one-tap dialog may still arrive).
  const installWaiting = computed(
    () =>
      !pwa.canNativeInstall.value &&
      !pwa.isInstalled.value &&
      !pwa.needsManualInstall.value &&
      !pwa.installDismissed.value &&
      !installWaitExpired.value,
  );
  const showInstallSteps = computed(
    () => manualInstallSteps.value.length > 0 && !installWaiting.value,
  );

  // Always open the modal first — the actual download only happens when the
  // user clicks the install button inside (no auto-download). The modal also
  // opens when the app is already installed: it tells the owner, and offers
  // "Install again" (another browser/device, or after removing the app).
  function openInstall() {
    showInstallModal.value = true;
  }

  // Fire the browser's native install dialog (needs the captured event and a
  // user gesture, hence the button). promptInstall() drops the event right
  // away — a BeforeInstallPromptEvent can only be used once.
  async function installApp() {
    const res = await pwa.promptInstall();
    if (res.ok && res.outcome === "accepted") showInstallModal.value = false;
  }

  // Reload helper for the "browser not ready" state — a reload lets Chrome
  // finish service-worker setup, after which beforeinstallprompt fires.
  function reloadPage() {
    window.location.reload();
  }

  return {
    showInstallModal,
    installWaitExpired,
    installEntryLabel,
    manualInstallSteps,
    manualInstallHint,
    installWaiting,
    showInstallSteps,
    openInstall,
    installApp,
    reloadPage,
  };
}
