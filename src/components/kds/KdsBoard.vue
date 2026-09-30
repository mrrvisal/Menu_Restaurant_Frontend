<template>
    <div class="kds-board">
      <section v-for="col in columns" :key="col.key" class="kds-col" :class="'col-' + col.key">
        <header class="col-head">
          <span class="col-title">{{ col.label }}</span>
          <span class="col-count">{{ visibleOrders(col.key).length }}</span>
        </header>

        <div class="col-body">
          <TransitionGroup name="card" tag="div" class="col-cards">
            <article v-for="o in visibleOrders(col.key)" :key="o.id" class="kds-card" :class="'st-' + o.status">
              <div class="card-head">
                <span class="card-table">
                  {{ i18n.t.table }} {{ o.table_no }}
                </span>
              </div>

              <ul class="card-items">
                <li v-for="(it, idx) in parseItems(o.items)" :key="idx">
                  <strong class="qty">{{ it.qty }}×</strong>
                  <span class="iname">{{ it.name }}</span>
                </li>
              </ul>

              <div v-if="o.note" class="card-note">
                <AppIcon name="note" :size="13" />
                {{ o.note }}
              </div>

              <footer class="card-foot">
                <span class="card-total">
                  {{ i18n.t.kds_total }}
                  {{ currencyStore.fmt(o.total) }}
                </span>
                <div v-if="actionsFor(o).length" class="card-acts">
                  <button v-for="a in actionsFor(o)" :key="a.to" class="act" :class="'act-' + a.to"
                    :disabled="busyId === o.id" @click="$emit('set-status', o, a.to)">
                    <AppIcon :name="a.icon" :size="13" />
                    {{ a.label }}
                  </button>
                </div>
              </footer>
            </article>
          </TransitionGroup>

          <div v-if="!visibleOrders(col.key).length" class="col-empty">
            {{ i18n.t.kds_empty_col }}
          </div>
        </div>
      </section>
    </div>
</template>

<script setup>
import { computed, toRefs } from "vue";
import { useI18nStore } from "@/stores/i18n";
import { useCurrencyStore } from "@/stores/currency";
import AppIcon from "@/components/AppIcon.vue";

const i18n = useI18nStore();
const currencyStore = useCurrencyStore();

// Board state comes from the view; toRefs keeps the original `x.value` reads.
// isToday is passed in so the day-reset logic stays in one place (the view).
const props = defineProps({
  orders: { type: Array, default: () => [] },
  showDone: { type: Boolean, default: true },
  busyId: { default: null },
  isToday: { type: Function, required: true },
});
defineEmits(["set-status"]);
const { orders, showDone, busyId } = toRefs(props);
const { isToday } = props;

// Column definitions — status → column mapping lives in statusColumn()
const columns = computed(() => [
  { key: "new", label: i18n.t.kds_col_new },
  { key: "preparing", label: i18n.t.kds_col_preparing },
  { key: "ready", label: i18n.t.kds_col_ready },
  { key: "done", label: i18n.t.kds_col_done },
]);

function statusColumn(status) {
  switch (status) {
    case "pending":
      return "new";
    case "preparing":
      return "preparing";
    case "ready":
      return "ready";
    default:
      return "done"; // served + cancelled
  }
}

function columnOrders(key) {
  return orders.value
    .filter((o) => isToday(o.created_at)) // FRONTEND ONLY: hide previous days (data untouched)
    .filter((o) => statusColumn(o.status) === key)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); // oldest first → cook first
}

// Done column only shows when toggled on; keep it short (latest 12)
function visibleOrders(key) {
  if (key === "done") {
    if (!showDone.value) return [];
    return columnOrders(key).slice(0, 12);
  }
  return columnOrders(key);
}

// ─── HELPERS ───────────────────────────────────────────────
function parseItems(raw) {
  try {
    const arr = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function actionsFor(o) {
  switch (o.status) {
    case "pending":
      return [
        { to: "preparing", label: i18n.t.kds_start, icon: "chef" },
        { to: "cancelled", label: i18n.t.kds_cancel, icon: "x" },
      ];
    case "preparing":
      return [
        { to: "ready", label: i18n.t.kds_ready, icon: "check" },
        { to: "cancelled", label: i18n.t.kds_cancel, icon: "x" },
      ];
    case "ready":
      return [{ to: "served", label: i18n.t.kds_served, icon: "check-circle" }];
    default:
      return [];
  }
}
</script>
<style scoped>
/* ─── Board ─── */
.kds-board {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding: 12px;
  min-height: 0;
}

.kds-col {
  display: flex;
  flex-direction: column;
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  min-height: 0;
}

.col-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  border-bottom: 3px solid transparent;
}

.col-new .col-head {
  color: #fbbf24;
  border-bottom-color: #f59e0b;
  background: rgba(245, 158, 11, 0.08);
}

.col-preparing .col-head {
  color: #60a5fa;
  border-bottom-color: #3b82f6;
  background: rgba(59, 130, 246, 0.08);
}

.col-ready .col-head {
  color: #4ade80;
  border-bottom-color: #22c55e;
  background: rgba(34, 197, 94, 0.08);
}

.col-done .col-head {
  color: #94a3b8;
  border-bottom-color: #64748b;
  background: rgba(100, 116, 139, 0.08);
}

.col-count {
  min-width: 26px;
  text-align: center;
  padding: 1px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  font-size: 12px;
}

.col-body {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  min-height: 0;
}

.col-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.col-empty {
  text-align: center;
  padding: 26px 8px;
  color: var(--text-faint);
  font-size: 12px;
  border: 1px dashed var(--border-line);
  border-radius: 10px;
}
/* ─── Cards ─── */
.kds-card {
  background: var(--bg-card);
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  padding: 10px 12px;
  transition: transform 0.15s ease, border-color 0.15s ease;
}

.kds-card.st-pending {
  border-left: 4px solid #f59e0b;
}

.kds-card.st-preparing {
  border-left: 4px solid #3b82f6;
}

.kds-card.st-ready {
  border-left: 4px solid #22c55e;
}

.kds-card.st-served,
.kds-card.st-cancelled {
  opacity: 0.55;
}

.kds-card.st-cancelled .card-table {
  text-decoration: line-through;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.card-table {
  font-size: 17px;
  font-weight: 800;
  color: var(--text-strong);
}

.card-items {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.card-items li {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 14px;
  color: var(--text);
}

.card-items .qty {
  color: var(--primary-light, #5eead4);
  min-width: 30px;
  text-align: right;
  font-size: 15px;
}

.card-note {
  margin-top: 7px;
  font-size: 12px;
  color: #fbbf24;
  background: rgba(245, 158, 11, 0.08);
  border: 1px dashed rgba(245, 158, 11, 0.35);
  border-radius: 8px;
  padding: 5px 9px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.card-foot {
  margin-top: 9px;
  padding-top: 9px;
  border-top: 1px dashed var(--border-line);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.card-total {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-dim);
}

.card-acts {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.act {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.15s ease;
  color: #fff;
}

.act:hover {
  transform: translateY(-1px);
  filter: brightness(1.12);
}

.act:disabled {
  opacity: 0.5;
  cursor: wait;
}

.act-preparing {
  background: #3b82f6;
}

.act-ready {
  background: #22c55e;
}

.act-served {
  background: #16a34a;
}

.act-cancelled {
  background: transparent;
  border: 1px solid #ef4444;
  color: #f87171;
}

/* Card enter/leave animation */
.card-enter-active {
  transition: all 0.25s ease;
}

.card-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}

.card-leave-active {
  transition: all 0.15s ease;
  opacity: 0;
}
/* ─── Responsive ─── */
@media (max-width: 1100px) {
  .kds-board {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .kds-board {
    grid-template-columns: 1fr;
  }

  .card-table {
    font-size: 16px;
  }
}
</style>
