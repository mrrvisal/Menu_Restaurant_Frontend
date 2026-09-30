// Pure order/date helpers — moved verbatim out of AdminView.vue so the split
// admin components (order cards, reports, devices) can share ONE copy.
// No behavior changes — shared by the split admin components.

// Items column stores JSON (string) on rows fetched from /api/orders.
import { useI18nStore } from "@/stores/i18n";
export function parseItems(items) {
  try {
    return typeof items === "string" ? JSON.parse(items) : items;
  } catch {
    return [];
  }
}

export function statusLabel(status) {
  // Locale-aware order-status text (i18n order_st_*). The glyph that used to
  // be baked into these labels (hourglass / chef / plate / check / cross) is
  // now an SVG <AppIcon> rendered next to this text via statusIcon() below.
  const i18n = useI18nStore();
  const labels = {
    pending: i18n.t.order_st_pending,
    confirmed: i18n.t.order_st_confirmed,
    preparing: i18n.t.order_st_preparing,
    ready: i18n.t.order_st_ready,
    served: i18n.t.order_st_served,
    cancelled: i18n.t.order_st_cancelled,
  };
  return labels[status] || status;
}

// AppIcon name for an order status (dashboard order cards + status buttons).
export function statusIcon(status) {
  const icons = {
    pending: "clock",
    confirmed: "clock-check",
    preparing: "chef",
    ready: "plate",
    served: "check-circle",
    cancelled: "x-circle",
  };
  return icons[status] || "clock";
}

export function getStatusOptions(currentStatus) {
  // Show ALL statuses (except current) so admin can change to any status directly
  const allStatuses = ["preparing", "ready", "served", "cancelled"];
  return allStatuses.filter((s) => s !== currentStatus);
}

// Localized (km / en) date+time — used by order cards AND the devices sheet.
export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString(useI18nStore().locale === "km" ? "km-KH" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
