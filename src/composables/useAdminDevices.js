// Compact device-session controls for the signed-in account.
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useI18nStore } from "@/stores/i18n";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;
const auth = useAuthStore();
const i18n = useI18nStore();

// ─── DEVICE SESSIONS (access log for the account) ──────────
// The account owner can review their own active devices and sign out any
// device; the auth middleware then rejects that device's token.
const showDevices = ref(false);
const devicesList = ref([]);
const devicesLoading = ref(false);
const devicesError = ref("");
const devicesMsg = ref("");
const deletingDevice = ref(null);
const revokingDeviceId = ref(null);
const inactiveSessionDays = ref(180);
const deviceSettingsLoading = ref(false);
const deviceSettingsSaving = ref(false);
const activeDevicesCount = computed(
  () => devicesList.value.filter((d) => !d.revoked).length,
);
function openDevices() {
  devicesError.value = "";
  devicesMsg.value = "";
  showDevices.value = true;
  fetchDevices();
  fetchDeviceSettings();
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
async function fetchDeviceSettings() {
  deviceSettingsLoading.value = true;
  try {
    const res = await axios.get(`${API_BASE}/api/auth/devices/settings`);
    inactiveSessionDays.value = res.data?.inactiveDays || 180;
  } catch (err) {
    devicesError.value =
      err.response?.data?.error || i18n.t.device_settings_load_error;
  } finally {
    deviceSettingsLoading.value = false;
  }
}
async function updateInactiveSessionDays(value) {
  const days = Number(value);
  if (![7, 30, 90, 180].includes(days) || deviceSettingsSaving.value) return;
  const previousDays = inactiveSessionDays.value;
  inactiveSessionDays.value = days;
  deviceSettingsSaving.value = true;
  devicesError.value = "";
  try {
    const res = await axios.patch(`${API_BASE}/api/auth/devices/settings`, {
      inactiveDays: days,
    });
    inactiveSessionDays.value = res.data.inactiveDays;
    devicesMsg.value = i18n.t.device_settings_saved;
    setTimeout(() => {
      devicesMsg.value = "";
    }, 2500);
  } catch (err) {
    inactiveSessionDays.value = previousDays;
    devicesError.value =
      err.response?.data?.error || i18n.t.device_settings_save_error;
  } finally {
    deviceSettingsSaving.value = false;
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
  } catch (err) {
    devicesError.value =
      err.response?.data?.error || i18n.t.devices_revoke_error;
  }
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
    inactiveSessionDays,
    deviceSettingsLoading,
    deviceSettingsSaving,
    activeDevicesCount,
    openDevices,
    fetchDevices,
    updateInactiveSessionDays,
    confirmRevokeDevice,
    doRevokeDevice,
    revokeAllOthers,
  };
}
