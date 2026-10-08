<template>
  <div class="bar orders-bar">
    <div class="bar-acts">
      <span class="ods-label">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        {{ i18n.t.orders_search_date }}:
      </span>
      <label class="orders-date-search">
        <AppDatePicker v-model="searchDateModel" :placeholder="i18n.t.report_today" />
      </label>
      <button class="ac ac-ghost bar-refresh" :disabled="ordersLoading" @click="fetchOrders">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        {{ ordersLoading ? i18n.t.loading : i18n.t.refresh || "Refresh" }}
      </button>
    </div>
  </div>
  <div v-if="ordersLoading" class="order-grid orders-skeleton" role="status" :aria-label="i18n.t.loading">
    <div v-for="n in 3" :key="n" class="order-c order-skeleton">
      <div class="order-skeleton-head">
        <span class="order-skeleton-line order-skeleton-id"></span>
        <span class="order-skeleton-line order-skeleton-status"></span>
      </div>
      <span class="order-skeleton-line order-skeleton-item"></span>
      <span class="order-skeleton-line order-skeleton-item order-skeleton-item-short"></span>
      <div class="order-skeleton-foot">
        <span class="order-skeleton-line order-skeleton-total"></span>
        <span class="order-skeleton-line order-skeleton-action"></span>
      </div>
    </div>
  </div>
  <div v-else-if="searchActive" class="order-search">
    <header class="search-head">
      <span class="search-title">
        <AppIcon name="calendar" :size="14" />
        {{ dayLabel(searchDate) }}
      </span>
      <span class="search-count">{{ searchDateOrders.length }} {{ i18n.t.orders }}</span>
    </header>
    <div v-if="searchDateOrders.length" class="order-grid">
      <div v-for="order in searchDateOrders" :key="order.id" class="order-c">
        <div class="order-h">
          <div class="order-hl">
            <span class="order-id">
              <AppIcon name="clipboard" :size="12" />#{{ order.id }}
            </span>
            <span class="order-t"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="9" y1="3" x2="9" y2="9" />
              </svg>
              {{ i18n.t.table }} {{ order.table_no }}</span>
          </div>
          <div class="order-m">
            <span class="order-st" :class="order.status">
              <AppIcon :name="statusIcon(order.status)" :size="11" />
              {{ statusLabel(order.status) }}
            </span>
            <span class="order-time">{{ formatDate(order.created_at) }}</span>
          </div>
        </div>
        <div class="order-items">
          <div v-for="(item, idx) in parseItems(order.items)" :key="idx" class="order-i">
            <span>{{ item.name }}</span>
            <span class="order-p">{{ item.qty }} × {{ currencyStore.fmt(item.price) }}</span>
          </div>
        </div>
        <div v-if="order.note" class="order-n">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          {{ order.note }}
        </div>
        <div class="order-total">
          {{ i18n.t.total }}:
          <strong>{{ currencyStore.fmt(order.total) }}</strong>
        </div>
        <div v-if="getStatusOptions(order.status).length" class="order-status-actions">
          <span class="order-status-label">{{ i18n.t.change_status }}:</span>
          <div class="order-status-btns">
            <button v-for="s in getStatusOptions(order.status)" :key="s" class="order-status-btn"
              :class="'st-' + s" @click="updateOrderStatus(order.id, s)">
              <AppIcon :name="statusIcon(s)" :size="11" />
              {{ statusLabel(s) }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <p v-else class="day-empty-note">
      {{ i18n.t.no_orders_date }}
    </p>
  </div>
  <div v-else-if="!orders.length" class="empty">
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"
      opacity=".3">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
    <p>{{ i18n.t.no_orders_today }}</p>
  </div>
  <div v-else class="order-days">
    <div v-for="sec in orderSections" :key="sec.key" class="day-section" :class="{ 'day-today': sec.today }">
      <header class="day-head" :class="{
        clickable: sec.collapsible,
        open: sec.collapsible && expandedDays[sec.key],
      }" @click="sec.collapsible && toggleDay(sec.key)">
        <span class="day-title">
          <AppIcon :name="sec.today ? 'sun' : 'orders'" :size="14" />
          {{ sec.today ? i18n.t.report_today : dayLabel(sec.day) }}
        </span>
        <span class="day-meta">
          <span class="day-count">{{ sec.orders.length }} {{ i18n.t.orders }}</span>
          <svg v-if="sec.collapsible" class="day-chev" width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </header>

      <div v-if="!sec.collapsible || expandedDays[sec.key]" class="order-grid">
        <div v-for="order in sec.orders" :key="order.id" class="order-c">
          <div class="order-h">
            <div class="order-hl">
              <span class="order-id">
                <AppIcon name="clipboard" :size="12" />#{{ order.id }}
              </span>
              <span class="order-t"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="3" x2="9" y2="9" />
                </svg>
                {{ i18n.t.table }} {{ order.table_no }}</span>
            </div>
            <div class="order-m">
              <span class="order-st" :class="order.status">
                <AppIcon :name="statusIcon(order.status)" :size="11" />
                {{ statusLabel(order.status) }}
              </span>
              <span class="order-time">{{ formatDate(order.created_at) }}</span>
            </div>
          </div>
          <div class="order-items">
            <div v-for="(item, idx) in parseItems(order.items)" :key="idx" class="order-i">
              <span>{{ item.name }}</span>
              <span class="order-p">{{ item.qty }} × {{ currencyStore.fmt(item.price) }}</span>
            </div>
          </div>
          <div v-if="order.note" class="order-n">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            {{ order.note }}
          </div>
          <div class="order-total">
            {{ i18n.t.total }}:
            <strong>{{ currencyStore.fmt(order.total) }}</strong>
          </div>
          <div v-if="getStatusOptions(order.status).length" class="order-status-actions">
            <span class="order-status-label">{{ i18n.t.change_status }}:</span>
            <div class="order-status-btns">
              <button v-for="s in getStatusOptions(order.status)" :key="s" class="order-status-btn"
                :class="'st-' + s" @click="updateOrderStatus(order.id, s)">
                <AppIcon :name="statusIcon(s)" :size="11" />
                {{ statusLabel(s) }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <p v-if="sec.today && !sec.orders.length" class="day-empty-note">
        {{ i18n.t.no_orders_today }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, toRefs } from "vue";
import AppDatePicker from "@/components/AppDatePicker.vue";
import AppIcon from "@/components/AppIcon.vue";

const props = defineProps([
  "orders",
  "ordersLoading",
  "fetchOrders",
  "updateOrderStatus",
  "expandedDays",
  "toggleDay",
  "orderSections",
  "dayLabel",
  "searchDate",
  "searchActive",
  "searchDateOrders",
  "i18n",
  "currencyStore",
  "statusIcon",
  "statusLabel",
  "getStatusOptions",
  "formatDate",
  "parseItems",
]);
const emit = defineEmits(["update:searchDate"]);
const {
  orders,
  ordersLoading,
  fetchOrders,
  updateOrderStatus,
  expandedDays,
  toggleDay,
  orderSections,
  dayLabel,
  searchDate,
  searchActive,
  searchDateOrders,
  i18n,
  currencyStore,
  statusIcon,
  statusLabel,
  getStatusOptions,
  formatDate,
  parseItems,
} = toRefs(props);

const searchDateModel = computed({
  get: () => searchDate.value,
  set: (value) => emit("update:searchDate", value),
});
</script>

<style scoped>
.orders-skeleton {
  margin-bottom: 16px;
}

.order-skeleton {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 164px;
  pointer-events: none;
}

.order-skeleton-head,
.order-skeleton-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.order-skeleton-line {
  display: block;
  height: 13px;
  border-radius: 6px;
  background: linear-gradient(90deg, #e8edf0 25%, #f5f7f8 37%, #e8edf0 63%);
  background-size: 400% 100%;
  animation: order-skeleton-shimmer 1.4s ease infinite;
}

.order-skeleton-id {
  width: 72px;
}

.order-skeleton-status {
  width: 76px;
  height: 22px;
  border-radius: 999px;
}

.order-skeleton-item {
  width: 92%;
}

.order-skeleton-item-short {
  width: 64%;
}

.order-skeleton-total {
  width: 96px;
}

.order-skeleton-action {
  width: 82px;
  height: 28px;
}

@keyframes order-skeleton-shimmer {
  to {
    background-position: -100% 0;
  }
}

.order-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}

.order-days {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.day-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.day-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 14px;
  border-radius: 10px;
  background: var(--surface);
  border: 1px solid var(--border);
  font-size: 13px;
  font-weight: 800;
  color: var(--primary);
  box-sizing: border-box;
}

.day-section:not(.day-today) .day-head {
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  width: 100%;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.day-section:not(.day-today) .day-head:hover {
  border-color: var(--primary);
  box-shadow: 0 2px 10px var(--primary-glow);
}

.day-title {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}

.day-meta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  opacity: 0.75;
  font-size: 12px;
  font-weight: 700;
}

.day-chev {
  flex-shrink: 0;
  transition: transform 0.18s ease;
}

.day-head.open .day-chev {
  transform: rotate(180deg);
}

.day-empty-note {
  margin: 0;
  padding: 18px 14px;
  text-align: center;
  color: var(--text-dim, #6b7280);
  font-size: 13px;
  border: 1px dashed var(--border);
  border-radius: 10px;
}

.orders-bar {
  --ob-h: 36px;
}

.orders-bar .bar-acts {
  width: 100%;
}

.orders-bar .bar-refresh {
  margin-left: auto;
}

.ods-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 700;
  color: var(--muted, #6b7280);
  white-space: nowrap;
}

.orders-date-search {
  display: inline-flex;
  align-items: center;
}

.orders-date-search .dp {
  width: auto;
  height: var(--ob-h);
}

.orders-date-search :deep(.dp-field) {
  width: auto;
  min-width: 160px;
  height: var(--ob-h);
  min-height: var(--ob-h);
  box-sizing: border-box;
}

.orders-bar .ac {
  width: 120px;
  height: var(--ob-h);
  min-height: var(--ob-h);
  min-width: 0;
  box-sizing: border-box;
  justify-content: center;
}

.ods-clear {
  padding: 0 12px;
}

@media (max-width: 900px) {
  .orders-bar {
    --ob-h: 32px;
  }

  .orders-bar .bar-refresh {
    margin-left: 0;
  }

  .order-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .orders-bar {
    --ob-h: 30px;
  }

  .ods-label {
    width: 100%;
  }

  .order-c {
    padding: 10px;
  }
}

.order-search {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.search-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 14px;
  border-radius: 10px;
  background: var(--surface);
  border: 1px solid var(--primary);
  font-size: 13px;
  font-weight: 800;
  color: var(--primary);
  box-sizing: border-box;
}

.search-count {
  opacity: 0.75;
  font-size: 12px;
  font-weight: 700;
}

.order-c {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px;
  transition: all 0.25s ease;
}

.order-c:hover {
  border-color: var(--primary-strong, var(--primary));
  box-shadow: 0 4px 16px var(--primary-glow);
}

.order-h {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.order-hl {
  display: flex;
  align-items: center;
  gap: 6px;
}

.order-id {
  font-size: 14px;
  font-weight: 700;
  color: var(--ink);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.order-t {
  font-size: 11px;
  color: var(--muted);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.order-m {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

.order-time {
  font-size: 10px;
  color: var(--muted-light);
  white-space: nowrap;
}

.order-st.pending {
  background: #fef3c7;
  color: #92400e;
}

.order-st.confirmed {
  background: #dbeafe;
  color: #1e40af;
}

.order-st.preparing {
  background: #fce7f3;
  color: #9d174d;
}

.order-st.ready {
  background: var(--tint-hover, #dcfce7);
  color: var(--green-dark);
}

.order-st.served {
  background: #d1fae5;
  color: #065f46;
}

.order-st.cancelled {
  background: #fbe9e7;
  color: var(--red);
}

.order-items {
  border-top: 1px solid var(--border-green);
  padding-top: 6px;
}

.order-i {
  display: flex;
  justify-content: space-between;
  padding: 3px 0;
  font-size: 11px;
}

.order-p {
  color: var(--muted);
  font-weight: 600;
}

.order-n {
  margin-top: 4px;
  font-size: 10px;
  color: var(--muted);
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 4px;
}

.order-total {
  margin-top: 6px;
  font-size: 12px;
  color: var(--ink);
}

.order-status-actions {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed var(--border);
}

.order-status-label {
  display: block;
  font-size: 10px;
  font-weight: 600;
  color: var(--muted);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.order-status-btns {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.order-status-btn {
  flex: 1;
  min-width: 0;
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-height: 30px;
  background: var(--surface);
  color: var(--text);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.order-status-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.order-status-btn.st-preparing {
  background: #fce7f3;
  color: #9d174d;
  border-color: #fbcfe8;
}

.order-status-btn.st-preparing:hover {
  background: #fbcfe8;
  border-color: #f9a8d4;
}

.order-status-btn.st-ready {
  background: var(--tint-hover, #dcfce7);
  color: var(--green-dark);
  border-color: var(--border-green, #bbf7d0);
}

.order-status-btn.st-ready:hover {
  background: var(--border-green, #bbf7d0);
  border-color: #86efac;
}

.order-status-btn.st-served {
  background: #d1fae5;
  color: #065f46;
  border-color: #a7f3d0;
}

.order-status-btn.st-served:hover {
  background: #a7f3d0;
  border-color: #6ee7b7;
}

.order-status-btn.st-cancelled {
  background: #fbe9e7;
  color: var(--red);
  border-color: #fecaca;
}

.order-status-btn.st-cancelled:hover {
  background: #fecaca;
  border-color: #fca5a5;
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
}
</style>
