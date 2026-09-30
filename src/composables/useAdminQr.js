// Table QR codes — generation, the saved-QR list ("made done" tables),
// preview / download / delete and the QR modal state. Moved verbatim out of
// AdminView.vue. Module-level refs = ONE shared source (singleton pattern,
// same as useAdminOrders/useAdminFoods) so a future AdminQrModal component
// and AdminView's Esc handler read the exact same state.
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useI18nStore } from "@/stores/i18n";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;
const auth = useAuthStore();
const i18n = useI18nStore();

// ─── QR MODAL STATE ────────────────────────────────────────
const showQR = ref(false);
const qrTableNumber = ref("");
const qrCodeDataUrl = ref("");
const qrLoading = ref(false);
const qrError = ref("");
const qrInfo = ref("");

// ─── SAVED TABLE QRs ("made done") ─────────────────────────
// Every generated table QR is stored server-side (qr_codes table). A table
// number already in this list can NOT be generated again — the stored QR is
// reused, and the owner can search / preview / download it below.
const savedQrs = ref([]);
const qrSearch = ref("");
const qrListLoading = ref(false);
const qrListError = ref("");
const selectedSavedNo = ref(null);
const deletingQr = ref(null);
const filteredSavedQrs = computed(() => {
  const q = qrSearch.value.trim();
  if (!q) return savedQrs.value;
  return savedQrs.value.filter((qr) => String(qr.table_no).includes(q));
});

function openQR() {
  qrError.value = "";
  qrInfo.value = "";
  qrCodeDataUrl.value = "";
  qrTableNumber.value = "";
  qrSearch.value = "";
  selectedSavedNo.value = null;
  savedQrs.value = [];
  showQR.value = true;
  fetchSavedQrs();
}
async function generateQR() {
  const num = parseInt(qrTableNumber.value);
  if (!num || num < 1) {
    qrError.value = i18n.t.table_number_invalid;
    return;
  }
  qrLoading.value = true;
  qrError.value = "";
  qrInfo.value = "";
  try {
    let url = `${API_BASE}/api/qr/table/${num}`;
    if (auth.restaurantId) url += `?restaurant_id=${auth.restaurantId}`;
    // NOTE: deliberately NO force=1 — a table number whose QR was already
    // "made done" can not be made again. The server returns the stored QR
    // and this UI simply shows it (also searchable in the saved list below).
    const res = await axios.get(url);
    qrCodeDataUrl.value = res.data.qrCode;
    selectedSavedNo.value = res.data.tableNumber;
    upsertSavedQr({
      id: `table-${res.data.tableNumber}`,
      table_no: res.data.tableNumber,
      created_at: res.data.createdAt || new Date().toISOString(),
      _dataUrl: res.data.qrCode,
    });
    qrInfo.value = res.data.alreadyExists
      ? (
          i18n.t.qr_already_saved ||
          "តុលេខ {n} ត្រូវបានធ្វើរួចហើយ — បង្ហាញ QR ដែលបានរក្សាទុក"
        ).replace("{n}", res.data.tableNumber)
      : i18n.t.qr_created_success || "បង្កើត QR បានជោគជ័យ!";
  } catch (e) {
    qrError.value = `${i18n.t.qr_generation_failed}: ${e.response?.data?.error || i18n.t.generic_error}`;
  } finally {
    qrLoading.value = false;
  }
}
async function fetchSavedQrs() {
  qrListLoading.value = true;
  qrListError.value = "";
  try {
    let url = `${API_BASE}/api/qr/codes`;
    if (auth.restaurantId) url += `?restaurant_id=${auth.restaurantId}`;
    const res = await axios.get(url);
    savedQrs.value = (res.data || []).map((r) => ({ ...r, _dataUrl: "" }));
  } catch (err) {
    qrListError.value = err.response?.data?.error || i18n.t.qr_list_load_error;
  } finally {
    qrListLoading.value = false;
  }
}
function upsertSavedQr(item) {
  const rest = savedQrs.value.filter((q) => q.table_no !== item.table_no);
  const idx = rest.findIndex((q) => q.table_no > item.table_no);
  if (idx === -1) rest.push(item);
  else rest.splice(idx, 0, item);
  savedQrs.value = rest;
}
async function loadSavedQrImage(qr) {
  if (qr._dataUrl) return qr._dataUrl;
  let url = `${API_BASE}/api/qr/codes/${qr.table_no}`;
  if (auth.restaurantId) url += `?restaurant_id=${auth.restaurantId}`;
  const res = await axios.get(url);
  qr._dataUrl = res.data.qr_data_url;
  return qr._dataUrl;
}
async function previewSavedQr(qr) {
  qrError.value = "";
  qrInfo.value = "";
  qrTableNumber.value = String(qr.table_no);
  selectedSavedNo.value = qr.table_no;
  try {
    qrCodeDataUrl.value = await loadSavedQrImage(qr);
  } catch (err) {
    qrError.value = err.response?.data?.error || i18n.t.qr_load_error;
  }
}
async function downloadSavedQr(qr) {
  try {
    const dataUrl = await loadSavedQrImage(qr);
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `table-${qr.table_no}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    qrError.value = err.response?.data?.error || i18n.t.qr_download_error;
  }
}
function formatQrDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString(
    i18n.locale === "km" ? "km-KH" : "en-US",
    {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
function confirmDelQr(qr) {
  deletingQr.value = qr;
}
async function doDeleteQr() {
  const qr = deletingQr.value;
  if (!qr) return;
  try {
    let url = `${API_BASE}/api/qr/codes/${qr.table_no}`;
    if (auth.restaurantId) url += `?restaurant_id=${auth.restaurantId}`;
    await axios.delete(url);
    // Remove from the saved list; that table number can be generated again
    savedQrs.value = savedQrs.value.filter((q) => q.table_no !== qr.table_no);
    // If the deleted QR was shown in the preview area, clear it
    if (selectedSavedNo.value === qr.table_no) {
      selectedSavedNo.value = null;
      qrCodeDataUrl.value = "";
      qrTableNumber.value = "";
    }
    qrError.value = "";
    qrInfo.value = i18n.t.qr_deleted || "លុប QR រួចរាល់!";
  } catch (err) {
    qrError.value = err.response?.data?.error || i18n.t.qr_delete_error;
  } finally {
    deletingQr.value = null;
  }
}
function downloadQR() {
  if (!qrCodeDataUrl.value) return;
  const link = document.createElement("a");
  link.href = qrCodeDataUrl.value;
  link.download = `table-${qrTableNumber.value}-qr.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function useAdminQr() {
  return {
    showQR,
    qrTableNumber,
    qrCodeDataUrl,
    qrLoading,
    qrError,
    qrInfo,
    savedQrs,
    qrSearch,
    qrListLoading,
    qrListError,
    selectedSavedNo,
    deletingQr,
    filteredSavedQrs,
    openQR,
    generateQR,
    fetchSavedQrs,
    previewSavedQr,
    downloadSavedQr,
    formatQrDate,
    confirmDelQr,
    doDeleteQr,
    downloadQR,
  };
}
