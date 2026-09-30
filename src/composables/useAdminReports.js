// ─── SALES REPORTS (Reports tab) ─────────────────────────────
// Backed by the same /orders/stats endpoint as the metric cards, but with a
// selectable range + day/week/month grouping and CSV export. `summary`
// numbers exclude cancelled orders; cancelled totals are shown apart.
//
// Moved verbatim out of AdminView.vue — singleton state (same pattern as
// useInstallUi): AdminView, the SSE stream and AdminReportsTab share it.
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useI18nStore } from "@/stores/i18n";
import { useThemeStore } from "@/stores/theme";
import { adminTab } from "@/composables/useAdminTab";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;
const auth = useAuthStore();
const i18n = useI18nStore();
const theme = useThemeStore();

const report = ref({});
const reportLoading = ref(false);
const reportError = ref("");
const reportGroup = ref("day");
const reportPreset = ref("7d");
const reportStartDate = ref("");
const reportEndDate = ref("");
const reportDataset = ref("series");
const reportFormat = ref("csv");
const reportExporting = ref(false);
const reportExportMsg = ref("");
const reportExportError = ref(false);

// Preset ranges, each with the period grouping it defaults to
const REPORT_PRESETS = [
  { key: "today", group: "day" },
  { key: "7d", group: "day" },
  { key: "30d", group: "day" },
  { key: "month", group: "day" },
  { key: "last_month", group: "month" },
  { key: "year", group: "month" },
];

const reportPresets = computed(() =>
  REPORT_PRESETS.map((p) => ({
    key: p.key,
    label:
      {
        today: i18n.t.report_today,
        "7d": i18n.t.report_7d,
        "30d": i18n.t.report_30d,
        month: i18n.t.report_this_month,
        last_month: i18n.t.report_last_month,
        year: i18n.t.report_this_year,
      }[p.key] || p.key,
  })),
);

const reportGroups = computed(() => [
  { key: "day", label: i18n.t.report_group_day },
  { key: "week", label: i18n.t.report_group_week },
  { key: "month", label: i18n.t.report_group_month },
]);

const reportDatasets = computed(() => [
  { value: "series", label: i18n.t.report_ds_series },
  { value: "summary", label: i18n.t.report_ds_summary },
  { value: "orders", label: i18n.t.report_ds_orders },
  { value: "items", label: i18n.t.report_ds_items },
  { value: "tables", label: i18n.t.report_ds_tables },
  { value: "hours", label: i18n.t.report_ds_hours },
  { value: "status", label: i18n.t.report_ds_status },
]);

const reportFormats = computed(() => [
  { value: "csv", label: i18n.t.report_format_csv },
  { value: "xlsx", label: i18n.t.report_format_excel },
]);

// Local-time YYYY-MM-DD (toISOString() would shift by the UTC offset)
function reportDateStr(d) {
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

function applyReportPreset(key) {
  reportPreset.value = key;
  const preset = REPORT_PRESETS.find((p) => p.key === key);
  const now = new Date();
  let start = reportDateStr(now);
  let end = start;

  if (key === "7d")
    start = reportDateStr(new Date(now.getTime() - 6 * 86400000));
  else if (key === "30d")
    start = reportDateStr(new Date(now.getTime() - 29 * 86400000));
  else if (key === "month")
    start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  else if (key === "last_month") {
    start = reportDateStr(new Date(now.getFullYear(), now.getMonth() - 1, 1));
    end = reportDateStr(new Date(now.getFullYear(), now.getMonth(), 0));
  } else if (key === "year") start = `${now.getFullYear()}-01-01`;

  reportStartDate.value = start;
  reportEndDate.value = end;
  if (preset?.group) reportGroup.value = preset.group;
  fetchReport();
}

export async function fetchReport() {
  if (!auth.restaurantId) return;
  reportLoading.value = true;
  reportError.value = "";
  try {
    const res = await axios.get(`${API_BASE}/api/orders/stats`, {
      params: {
        restaurant_id: auth.restaurantId,
        start_date: reportStartDate.value,
        end_date: reportEndDate.value,
        group: reportGroup.value,
      },
    });
    report.value = res.data;
  } catch (err) {
    reportError.value = err.response?.data?.error || i18n.t.report_load_error;
  } finally {
    reportLoading.value = false;
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function localizedExportError(err) {
  let payload = err?.response?.data;
  if (payload instanceof Blob) {
    try {
      payload = JSON.parse(await payload.text());
    } catch {
      return "";
    }
  }

  const apiError = payload?.error;
  if (typeof apiError === "string") return apiError;
  const message = apiError?.message;
  if (message && typeof message === "object") {
    return message[i18n.locale] || message.en || message.km || "";
  }
  return typeof payload?.message === "string" ? payload.message : "";
}

// The authenticated CSV endpoint supplies the selected, filtered dataset.
async function exportReport() {
  if (reportExporting.value) return;
  reportExporting.value = true;
  reportExportMsg.value = "";
  reportExportError.value = false;
  try {
    const res = await axios.get(`${API_BASE}/api/orders/export`, {
      params: {
        restaurant_id: auth.restaurantId,
        start_date: reportStartDate.value,
        end_date: reportEndDate.value,
        group: reportGroup.value,
        type: reportDataset.value,
        lang: i18n.locale,
      },
      responseType: "blob",
    });
    const match = /filename="?([^";]+)"?/.exec(
      res.headers["content-disposition"] || "",
    );
    const csvFilename = match ? match[1] : `sales-${reportDataset.value}.csv`;

    if (reportFormat.value === "xlsx") {
      const { buildXlsx } = await import("@/utils/reportExport");
      downloadBlob(
        buildXlsx(await res.data.text()),
        csvFilename.replace(/\.csv$/i, ".xlsx"),
      );
    } else {
      downloadBlob(res.data, csvFilename);
    }
    reportExportMsg.value = i18n.t.report_export_ok || "Export ready!";
    setTimeout(() => {
      reportExportMsg.value = "";
    }, 2500);
  } catch (err) {
    console.error("Sales export error:", err);
    reportExportMsg.value =
      (await localizedExportError(err)) || i18n.t.report_export_err;
    reportExportError.value = true;
  } finally {
    reportExporting.value = false;
  }
}

// Chart inputs
const reportSeriesPoints = computed(() =>
  (report.value.series || []).map((r) => ({
    label: r.label,
    value: r.revenue,
  })),
);
const reportHourPoints = computed(() =>
  (report.value.byHour || []).map((r) => ({
    label: `${String(r.hour).padStart(2, "0")}:00`,
    value: r.orders,
  })),
);
// The chart picks up the restaurant's theme color
const chartColor = computed(() => theme.primary || "#0f766e");

// Compact axis labels — full currency strings overflow the small axis area
function fmtAxis(value) {
  const v = Number(value) || 0;
  if (v >= 1000000) return `${(v / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
  if (v >= 1000) return `${Math.round(v / 1000)}K`;
  return String(Math.round(v));
}

// Inline bar widths for the list panels (relative to the row leader)
const maxTopQty = computed(() =>
  Math.max(
    1,
    ...(report.value.topItems || []).map((item) => Number(item.qty) || 0),
  ),
);
function topItemWidth(item) {
  return `${Math.round(((Number(item.qty) || 0) / maxTopQty.value) * 100)}%`;
}
const maxTableRevenue = computed(() =>
  Math.max(
    1,
    ...(report.value.byTable || []).map((r) => Number(r.revenue) || 0),
  ),
);
function tableBarWidth(row) {
  return `${Math.round(((Number(row.revenue) || 0) / maxTableRevenue.value) * 100)}%`;
}
const maxStatusCount = computed(() =>
  Math.max(
    1,
    ...(report.value.byStatus || []).map((r) => Number(r.orders) || 0),
  ),
);
function statusBarWidth(row) {
  return `${Math.round(((Number(row.orders) || 0) / maxStatusCount.value) * 100)}%`;
}

// Opens the Reports tab (sidebar entry): switch the tab and lazily apply the
// default range / fetch the first report — moved verbatim from AdminView.
function openReports() {
  adminTab.value = "reports";
  if (!reportStartDate.value || !reportEndDate.value) applyReportPreset("7d");
  else if (!Object.keys(report.value).length) fetchReport();
}

export function useAdminReports() {
  return {
    report,
    reportLoading,
    reportError,
    reportGroup,
    reportPreset,
    reportStartDate,
    reportEndDate,
    reportDataset,
    reportFormat,
    reportExporting,
    reportExportMsg,
    reportExportError,
    reportPresets,
    reportGroups,
    reportDatasets,
    reportFormats,
    applyReportPreset,
    openReports,
    fetchReport,
    exportReport,
    reportSeriesPoints,
    reportHourPoints,
    chartColor,
    fmtAxis,
    topItemWidth,
    tableBarWidth,
    statusBarWidth,
  };
}
