<template>
  <div class="rep-top">
    <div class="rep-side">
      <div class="bar rep-bar">
        <div class="rep-presets">
          <button v-for="p in reportPresets" :key="p.key" class="chip" :class="{ active: reportPreset === p.key }"
            @click="applyReportPreset(p.key)">
            {{ p.label }}
          </button>
        </div>
        <div class="rep-controls">
          <label class="rep-date">
            <span>{{ i18n.t.report_from }}</span>
            <AppDatePicker v-model="reportStartDateModel" :max="reportEndDate" @change="
              reportPresetModel = 'custom';
            fetchReport();
            " />
          </label>
          <label class="rep-date">
            <span>{{ i18n.t.report_to }}</span>
            <AppDatePicker v-model="reportEndDateModel" :min="reportStartDate" @change="
              reportPresetModel = 'custom';
            fetchReport();
            " />
          </label>
          <div class="rep-groups">
            <button v-for="g in reportGroups" :key="g.key" class="chip" :class="{ active: reportGroup === g.key }"
              @click="
                reportGroupModel = g.key;
              fetchReport();
              ">
              {{ g.label }}
            </button>
          </div>
        </div>
        <div class="rep-export">
          <AppSelect v-model="reportDatasetModel" :options="reportDatasets" size="md" tone="soft" variant="teal"
            :label="i18n.t.report_dataset" />
          <AppSelect v-model="reportFormatModel" :options="reportFormats" size="md" tone="soft" variant="teal"
            :label="i18n.t.report_format" />
          <button class="ac ac-primary" :disabled="reportExporting" @click="exportReport">
            <AppIcon name="download" :size="14" />
            {{ reportExporting ? i18n.t.report_exporting : i18n.t.report_export }}
          </button>
        </div>
      </div>
      <div v-if="reportExportMsg" class="msg rep-msg" :class="reportExportError ? 'msg-e' : 'msg-s'">
        <AppIcon :name="reportExportError ? 'alert-circle' : 'check-circle'" :size="14" />
        {{ reportExportMsg }}
      </div>
    </div>

    <div class="rep-main-col">
      <div v-if="reportLoading" class="empty">
        <div class="spinner"></div>
        <p>{{ i18n.t.loading }}</p>
      </div>
      <div v-else-if="reportError" class="empty">
        <AppIcon name="alert-circle" :size="34" />
        <p>{{ reportError }}</p>
      </div>
      <template v-else>
        <div class="rep-cards">
          <div class="rep-card">
            <div class="rep-card-i rep-i-teal">
              <AppIcon name="money" :size="18" />
            </div>
            <div class="metric-b">
              <span class="metric-v">{{ currencyStore.fmt(report.summary?.revenue) }}</span>
              <span class="metric-l">{{ i18n.t.revenue }}</span>
            </div>
          </div>
          <div class="rep-card">
            <div class="rep-card-i rep-i-green">
              <AppIcon name="orders" :size="18" />
            </div>
            <div class="metric-b">
              <span class="metric-v">{{ report.summary?.orders ?? 0 }}</span>
              <span class="metric-l">{{ i18n.t.orders }}</span>
            </div>
          </div>
          <div class="rep-card">
            <div class="rep-card-i rep-i-blue">
              <AppIcon name="chart" :size="18" />
            </div>
            <div class="metric-b">
              <span class="metric-v">{{ currencyStore.fmt(report.summary?.avgOrderValue) }}</span>
              <span class="metric-l">{{ i18n.t.report_avg_order }}</span>
            </div>
          </div>
          <div class="rep-card">
            <div class="rep-card-i rep-i-amber">
              <AppIcon name="food" :size="18" />
            </div>
            <div class="metric-b">
              <span class="metric-v">{{ report.summary?.itemsSold ?? 0 }}</span>
              <span class="metric-l">{{ i18n.t.report_items_sold }}</span>
            </div>
          </div>
          <div class="rep-card" :class="{ 'rep-card-dim': !report.summary?.cancelledOrders }">
            <div class="rep-card-i rep-i-red">
              <AppIcon name="x-circle" :size="18" />
            </div>
            <div class="metric-b">
              <span class="metric-v">{{ report.summary?.cancelledOrders ?? 0 }}</span>
              <span class="metric-l">{{ i18n.t.cancelled }} · {{
                currencyStore.fmt(report.summary?.cancelledRevenue) }}</span>
            </div>
          </div>
        </div>

        <div class="rep-panel">
          <div class="rep-panel-h">
            <span>
              <AppIcon name="chart" :size="15" /> {{ i18n.t.report_chart_title }}
            </span>
            <span v-if="report.summary?.bestPeriod" class="rep-panel-sub">
              {{ i18n.t.report_best_period }}: {{ report.summary.bestPeriod.label }} ·
              {{ currencyStore.fmt(report.summary.bestPeriod.revenue) }}
            </span>
          </div>
          <SalesChart :points="reportSeriesPoints" :color="chartColor" :format-value="(v) => currencyStore.fmt(v)"
            :format-axis="fmtAxis" :aria-label="i18n.t.report_chart_title" :empty-text="i18n.t.no_data" />
        </div>
        <div class="rep-two">
          <div class="rep-panel">
            <div class="rep-panel-h">
              <span>
                <AppIcon name="food" :size="15" /> {{ i18n.t.report_top_title }}
              </span>
            </div>
            <div v-if="!report.topItems?.length" class="rep-empty">{{ i18n.t.no_data }}</div>
            <div v-else class="rep-rows">
              <div v-for="(item, i) in report.topItems" :key="item.name" class="rep-row">
                <span class="rep-rank">{{ i + 1 }}</span>
                <div class="rep-row-b">
                  <span class="rep-row-l">{{ item.name }}</span>
                  <div class="rep-row-bar">
                    <span :style="{ width: topItemWidth(item) }" :title="currencyStore.fmt(item.revenue)"></span>
                  </div>
                </div>
                <span class="rep-row-v">
                  <strong>{{ item.qty }}</strong>
                  <em>{{ i18n.t.report_qty }}</em>
                  <b>{{ currencyStore.fmt(item.revenue) }}</b>
                </span>
              </div>
            </div>
          </div>

          <div class="rep-panel">
            <div class="rep-panel-h">
              <span>
                <AppIcon name="clock" :size="15" /> {{ i18n.t.report_hours_title }}
              </span>
            </div>
            <SalesChart :points="reportHourPoints" :color="chartColor"
              :format-value="(v) => `${v} ${i18n.t.orders}`" :format-axis="(v) => v"
              :aria-label="i18n.t.report_hours_title" :empty-text="i18n.t.no_data" />
          </div>
        </div>

        <div class="rep-two">
          <div class="rep-panel">
            <div class="rep-panel-h">
              <span>
                <AppIcon name="table" :size="15" /> {{ i18n.t.report_tables_title }}
              </span>
            </div>
            <div v-if="!report.byTable?.length" class="rep-empty">{{ i18n.t.no_data }}</div>
            <div v-else class="rep-rows">
              <div v-for="row in report.byTable" :key="row.table_no" class="rep-row">
                <div class="rep-row-b">
                  <span class="rep-row-l">{{ i18n.t.table }} {{ row.table_no }}</span>
                  <div class="rep-row-bar">
                    <span :style="{ width: tableBarWidth(row) }" :title="currencyStore.fmt(row.revenue)"></span>
                  </div>
                </div>
                <span class="rep-row-v">
                  <strong>{{ row.orders }}</strong>
                  <b>{{ currencyStore.fmt(row.revenue) }}</b>
                </span>
              </div>
            </div>
          </div>

          <div class="rep-panel">
            <div class="rep-panel-h">
              <span>
                <AppIcon name="orders" :size="15" /> {{ i18n.t.report_status_title }}
              </span>
            </div>
            <div v-if="!report.byStatus?.length" class="rep-empty">{{ i18n.t.no_data }}</div>
            <div v-else class="rep-rows">
              <div v-for="row in report.byStatus" :key="row.status" class="rep-row">
                <span class="order-st" :class="row.status">
                  <AppIcon :name="statusIcon(row.status)" :size="11" />
                  {{ statusLabel(row.status) }}
                </span>
                <div class="rep-row-b">
                  <div class="rep-row-bar">
                    <span :style="{ width: statusBarWidth(row) }" :title="currencyStore.fmt(row.revenue)"></span>
                  </div>
                </div>
                <span class="rep-row-v">
                  <strong>{{ row.orders }}</strong>
                  <b>{{ currencyStore.fmt(row.revenue) }}</b>
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, toRefs } from "vue";
import AppDatePicker from "@/components/AppDatePicker.vue";
import AppIcon from "@/components/AppIcon.vue";
import AppSelect from "@/components/AppSelect.vue";
import SalesChart from "@/components/SalesChart.vue";

const props = defineProps([
  "report",
  "reportLoading",
  "reportError",
  "reportGroup",
  "reportPreset",
  "reportStartDate",
  "reportEndDate",
  "reportDataset",
  "reportFormat",
  "reportExporting",
  "reportExportMsg",
  "reportExportError",
  "reportPresets",
  "reportGroups",
  "reportDatasets",
  "reportFormats",
  "applyReportPreset",
  "fetchReport",
  "exportReport",
  "reportSeriesPoints",
  "reportHourPoints",
  "chartColor",
  "fmtAxis",
  "topItemWidth",
  "tableBarWidth",
  "statusBarWidth",
  "i18n",
  "currencyStore",
  "statusIcon",
  "statusLabel",
]);
const emit = defineEmits([
  "update:reportGroup",
  "update:reportPreset",
  "update:reportStartDate",
  "update:reportEndDate",
  "update:reportDataset",
  "update:reportFormat",
]);
const {
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
  fetchReport,
  exportReport,
  reportSeriesPoints,
  reportHourPoints,
  chartColor,
  fmtAxis,
  topItemWidth,
  tableBarWidth,
  statusBarWidth,
  i18n,
  currencyStore,
  statusIcon,
  statusLabel,
} = toRefs(props);

const reportGroupModel = computed({
  get: () => reportGroup.value,
  set: (value) => emit("update:reportGroup", value),
});
const reportPresetModel = computed({
  get: () => reportPreset.value,
  set: (value) => emit("update:reportPreset", value),
});
const reportStartDateModel = computed({
  get: () => reportStartDate.value,
  set: (value) => emit("update:reportStartDate", value),
});
const reportEndDateModel = computed({
  get: () => reportEndDate.value,
  set: (value) => emit("update:reportEndDate", value),
});
const reportDatasetModel = computed({
  get: () => reportDataset.value,
  set: (value) => emit("update:reportDataset", value),
});
const reportFormatModel = computed({
  get: () => reportFormat.value,
  set: (value) => emit("update:reportFormat", value),
});
</script>

<style scoped>
/* Filter panel (left) + summary cards (right) — stacks when resized */
.rep-top {
  display: grid;
  grid-template-columns: minmax(250px, 300px) 1fr;
  gap: 16px;
  align-items: start;
  margin-bottom: 16px;
}

.rep-side {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

@media (min-width: 1281px) {
  .rep-side {
    position: sticky;
    top: calc(var(--hdr-stick-top, 0px) + var(--hdr-h, 0px) + 16px);
    align-self: start;
    max-height: calc(100vh - var(--hdr-stick-top, 0px) - var(--hdr-h, 0px) - 32px);
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-gutter: stable;
  }

  .rep-side .bar {
    margin: 0;
    padding: 14px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
  }

  .rep-side .rep-controls {
    gap: 12px;
  }
}

.rep-main-col {
  min-width: 0;
}

.rep-side .bar {
  flex-direction: column;
  align-items: stretch;
  gap: 14px;
  margin-bottom: 0;
  padding: 14px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
}

.rep-presets,
.rep-groups {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  background: #eef2f7;
  padding: 4px;
  border-radius: 12px;
}

.rep-presets .chip,
.rep-groups .chip {
  border: none;
  background: transparent;
  border-radius: 9px;
  min-height: 34px;
  padding: 6px 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--muted);
  text-align: center;
}

.rep-presets .chip:hover,
.rep-groups .chip:hover {
  transform: none;
  box-shadow: none;
  color: var(--text);
}

.rep-presets .chip.active,
.rep-groups .chip.active {
  background: var(--primary);
  border-color: transparent;
  color: #fff;
}

.rep-controls {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
}

.rep-date {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rep-date span {
  font-size: 10.5px;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0;
}

.rep-date .dp {
  width: 100%;
}

.rep-export {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
}

.rep-export .as-root {
  min-width: 0;
  width: 100%;
}

.rep-export .ac {
  width: 100%;
  justify-content: center;
}

.rep-msg {
  margin: 0;
}

.rep-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.rep-cards .rep-card:last-child {
  grid-column: 1 / -1;
}

.rep-card {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 100%;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px 16px;
  transition: all 0.25s ease;
}

.rep-card:hover {
  border-color: var(--primary-strong, var(--primary));
  box-shadow: 0 4px 16px var(--primary-glow);
}

.rep-card-dim {
  opacity: 0.75;
}

.rep-card-i {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.rep-i-teal {
  background: var(--tint-hover, #ccfbf1);
  color: var(--primary-strong, var(--primary));
}

.rep-i-green {
  background: var(--tint-hover, #dcfce7);
  color: var(--green-dark);
}

.rep-i-blue {
  background: #dbeafe;
  color: #1d4ed8;
}

.rep-i-amber {
  background: #fef3c7;
  color: var(--amber);
}

.rep-i-red {
  background: #fee2e2;
  color: var(--red);
}

.rep-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px 18px;
  margin-bottom: 16px;
  min-width: 0;
}

.rep-panel-h {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.rep-panel-h > span:first-child {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
}

.rep-panel-sub {
  font-size: 10.5px;
  color: var(--muted);
}

.rep-two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.rep-two .rep-panel {
  margin-bottom: 16px;
}

.rep-empty {
  font-size: 12px;
  color: var(--muted);
  text-align: center;
  padding: 18px 0;
}

.rep-rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rep-row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.rep-rank {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--surface-green);
  border: 1px solid var(--border-green);
  color: var(--primary-strong, var(--primary));
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.rep-row-b {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rep-row-l {
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rep-row-bar {
  height: 6px;
  border-radius: 999px;
  background: var(--surface-green);
  overflow: hidden;
}

.rep-row-bar span {
  display: block;
  height: 100%;
  min-width: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg,
      var(--primary-strong, var(--primary)),
      var(--primary-light, #14b8a6));
  transition: width 0.4s ease;
}

.rep-row-v {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-shrink: 0;
  justify-content: flex-end;
}

.rep-row-v strong {
  font-size: 12.5px;
  color: var(--ink);
}

.rep-row-v em {
  font-size: 9px;
  font-style: normal;
  color: var(--muted-light);
  text-transform: uppercase;
}

.rep-row-v b {
  font-size: 11px;
  font-weight: 600;
  color: var(--muted);
  white-space: nowrap;
}

@media (max-width: 1280px) {
  .rep-top {
    grid-template-columns: 1fr;
  }

  .rep-main-col {
    border-top: 1px dashed var(--border);
    padding-top: 14px;
  }
}

@media (max-width: 900px) {
  .rep-two {
    grid-template-columns: 1fr;
    gap: 0;
  }
}

@media (max-width: 420px) {
  .rep-cards {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .rep-cards .rep-card:last-child {
    grid-column: auto;
  }

  .rep-panel {
    padding: 14px;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
}
</style>
