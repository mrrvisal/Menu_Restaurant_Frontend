// Device sessions + login history (the "access log" modal) — moved verbatim
// out of AdminView.vue. Singleton refs so AdminView (Esc handler) and a
// future AdminDevicesModal share the exact same state (useInstallUi pattern).
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useI18nStore } from "@/stores/i18n";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;
const auth = useAuthStore();
const i18n = useI18nStore();

// ─── DEVICE SESSIONS (access log for the account) ──────────
// Every device that logs in is recorded server-side (device_sessions
// table): device id/name/type, browser, OS, screen, timezone, language,
// IP + best-effort city/country, first seen, last login, last active.
// The owner can review ALL of them here and sign out any device (or all
// others at once) — the auth middleware then rejects that device's token.
const showDevices = ref(false);
const devicesList = ref([]);
const devicesLoading = ref(false);
const devicesError = ref("");
const devicesMsg = ref("");
const deletingDevice = ref(null);
const revokingDeviceId = ref(null);
const expandedDeviceId = ref(null);
const loginHistory = ref([]);
const historyLoading = ref(false);
const historyError = ref("");
const activeDevicesCount = computed(
  () => devicesList.value.filter((d) => !d.revoked).length,
);
function openDevices() {
  devicesError.value = "";
  devicesMsg.value = "";
  showDevices.value = true;
  fetchDevices();
  fetchLoginHistory();
}
async function fetchDevices() {
  devicesLoading.value = true;
  devicesError.value = "";
  try {
    const res = await axios.get(`${API_BASE}/api/auth/devices`);
    devicesList.value = res.data || [];
  } catch (err) {
    devicesError.value = err.response?.data?.error || i18n.t.devices_load_error;
  } finally {
    devicesLoading.value = false;
  }
}
function confirmRevokeDevice(device) {
  deletingDevice.value = device;
}
async function doRevokeDevice() {
  const device = deletingDevice.value;
  if (!device || revokingDeviceId.value) return;
  revokingDeviceId.value = device.id;
  try {
    await axios.delete(`${API_BASE}/api/auth/devices/${device.id}`);
    deletingDevice.value = null;
    if (device.isCurrent) {
      // Revoking THIS device → sign out immediately
      auth.logout();
      window.location.href = "/login";
      return;
    }
    devicesMsg.value =
      i18n.t.device_signed_out_ok || "ឧបករណ៍ត្រូវបានចេញរួចរាល់!";
    setTimeout(() => {
      devicesMsg.value = "";
    }, 2500);
    await fetchDevices();
    await fetchLoginHistory();
  } catch (err) {
    devicesError.value =
      err.response?.data?.error || i18n.t.device_revoke_error;
  } finally {
    revokingDeviceId.value = null;
  }
}
async function revokeAllOthers() {
  devicesError.value = "";
  try {
    const res = await axios.delete(`${API_BASE}/api/auth/devices`);
    devicesMsg.value =
      (i18n.t.sign_out_others_ok || "ឧបករណ៍ផ្សេងទាំងអស់ត្រូវបានចេញរួចរាល់!") +
      (res.data?.count ? ` (${res.data.count})` : "");
    setTimeout(() => {
      devicesMsg.value = "";
    }, 2500);
    await fetchDevices();
    await fetchLoginHistory();
  } catch (err) {
    devicesError.value =
      err.response?.data?.error || i18n.t.devices_revoke_error;
  }
}
async function fetchLoginHistory() {
  historyLoading.value = true;
  historyError.value = "";
  try {
    const res = await axios.get(`${API_BASE}/api/auth/devices/history`);
    loginHistory.value = res.data || [];
  } catch (err) {
    historyError.value =
      err.response?.data?.error || i18n.t.login_history_load_error;
  } finally {
    historyLoading.value = false;
  }
}
function toggleDeviceDetails(id) {
  expandedDeviceId.value = expandedDeviceId.value === id ? null : id;
}
function deviceMethodLabel(method) {
  const labels = {
    password: i18n.t.method_password || "Password",
    google: "Google",
  };
  return labels[method] || method || i18n.t.device_unknown;
}

export function useAdminDevices() {
  return {
    showDevices,
    devicesList,
    devicesLoading,
    devicesError,
    devicesMsg,
    deletingDevice,
    revokingDeviceId,
    expandedDeviceId,
    loginHistory,
    historyLoading,
    historyError,
    activeDevicesCount,
    openDevices,
    fetchDevices,
    confirmRevokeDevice,
    doRevokeDevice,
    revokeAllOthers,
    fetchLoginHistory,
    toggleDeviceDetails,
    deviceMethodLabel,
  };
}
