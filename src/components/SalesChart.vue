<!--
  frontend/src/components/SalesChart.vue
  ─────────────────────────────────────────────────────────────
  Dependency-free SVG bar chart for the dashboard Reports tab.
  The project ships no chart library (and its whole iconography is inline
  SVG), so this draws the axis, grid, bars and labels itself and sizes to
  its container with a ResizeObserver.

  Usage:
    <SalesChart :points="[{ label: '2026-09-10', value: 125000 }]"
                :format-value="currencyStore.fmt" />
-->
<template>
  <div ref="root" class="chart-root" :style="{ height: height + 'px' }">
    <div
      v-if="!points.length"
      class="chart-empty"
      :style="{ lineHeight: height + 'px' }"
    >
      {{ emptyText }}
    </div>
    <svg
      v-else
      class="chart-svg"
      :width="width"
      :height="height"
      :viewBox="`0 0 ${Math.max(width, 1)} ${height}`"
      role="img"
      :aria-label="ariaLabel"
    >
      <defs>
        <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="color" stop-opacity="0.95" />
          <stop offset="100%" :stop-color="color" stop-opacity="0.45" />
        </linearGradient>
      </defs>

      <!-- horizontal grid + value axis -->
      <g class="chart-grid">
        <template v-for="t in ticks" :key="'t' + t.value">
          <line :x1="pad.left" :y1="t.y" :x2="width - pad.right" :y2="t.y" />
          <text
            class="chart-axis-y"
            :x="pad.left - 8"
            :y="t.y + 3.5"
            text-anchor="end"
          >
            {{ formatAxis ? formatAxis(t.value) : t.value }}
          </text>
        </template>
      </g>

      <!-- bars (with a full-height hit area so the whole slot is hoverable) -->
      <g>
        <template v-for="b in bars" :key="b.label + b.index">
          <rect
            :class="['chart-bar', { active: hoverIndex === b.index }]"
            :x="b.x"
            :y="b.y"
            :width="b.w"
            :height="b.h"
            :rx="barRadius"
            :fill="`url(#${gradientId})`"
          >
            <title>{{ b.label }} — {{ formatValue ? formatValue(b.value) : b.value }}</title>
          </rect>
          <rect
            class="chart-hit"
            :x="b.x - b.gap / 2"
            :y="pad.top"
            :width="b.w + b.gap"
            :height="innerH"
            @pointerenter="hoverIndex = b.index"
            @pointerleave="hoverIndex = null"
          >
            <title>{{ b.label }} — {{ formatValue ? formatValue(b.value) : b.value }}</title>
          </rect>
        </template>
      </g>

      <!-- x labels (thinned out so they never overlap) -->
      <g class="chart-axis-x">
        <text
          v-for="b in labelledBars"
          :key="'x' + b.index"
          :x="b.x + b.w / 2"
          :y="height - 8"
          text-anchor="middle"
        >{{ b.shortLabel }}</text>
      </g>
    </svg>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  // [{ label: String, value: Number }]
  points: { type: Array, default: () => [] },
  height: { type: Number, default: 190 },
  color: { type: String, default: "#0f766e" },
  formatValue: { type: Function, default: null },
  formatAxis: { type: Function, default: null },
  emptyText: { type: String, default: "" },
  ariaLabel: { type: String, default: "" },
});

const root = ref(null);
const width = ref(640);
const hoverIndex = ref(null);

const pad = { top: 14, right: 12, bottom: 26, left: 48 };
const innerW = computed(() => Math.max(width.value - pad.left - pad.right, 10));
const innerH = computed(() => Math.max(props.height - pad.top - pad.bottom, 10));

// Unique gradient id per instance (several charts can share a page)
const gradientId = computed(
  () => `sc-grad-${Math.random().toString(36).slice(2, 8)}`,
);

const maxValue = computed(() =>
  props.points.reduce((m, p) => Math.max(m, Number(p.value) || 0), 0),
);

// Round the axis top up to a readable step (1/2/2.5/5/10 × 10ⁿ)
const axisMax = computed(() => {
  const v = maxValue.value;
  if (v <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return step * pow;
});
const ticks = computed(() => {
  const out = [];
  for (let i = 0; i <= 4; i++) {
    const ratio = i / 4;
    out.push({
      value: axisMax.value * ratio,
      y: pad.top + innerH.value - innerH.value * ratio,
    });
  }
  return out;
});

const bars = computed(() => {
  const n = props.points.length;
  if (!n) return [];
  const slot = innerW.value / n;
  const gap = Math.max(slot * 0.28, 1);
  const w = Math.max(slot - gap, 1);
  const base = pad.top + innerH.value;

  return props.points.map((p, i) => {
    const value = Number(p.value) || 0;
    const h = axisMax.value > 0 ? (value / axisMax.value) * innerH.value : 0;
    const label = String(p.label ?? "");
    return {
      index: i,
      label,
      // Keep x labels readable ("2026-09-10" → "09-10")
      shortLabel: label.length > 8 ? label.slice(-5) : label,
      value,
      x: pad.left + i * slot + gap / 2,
      y: base - h,
      w,
      // A 1.5px stub keeps "small but non-zero" days visible
      h: Math.max(h, value > 0 ? 1.5 : 0),
      gap,
    };
  });
});

// Show roughly one x label per 62px of width (never fewer than 2)
const labelledBars = computed(() => {
  const n = bars.value.length;
  if (!n) return [];
  const maxLabels = Math.max(2, Math.floor(innerW.value / 62));
  const step = Math.ceil(n / maxLabels);
  const out = [];
  for (let i = 0; i < n; i += step) out.push(bars.value[i]);
  return out;
});

const barRadius = computed(() => (bars.value.length > 40 ? 1 : 3));

let observer = null;
function measure() {
  if (root.value) width.value = root.value.clientWidth || 640;
}
function onWindowResize() {
  measure();
}

onMounted(() => {
  measure();
  if (typeof ResizeObserver !== "undefined" && root.value) {
    observer = new ResizeObserver(measure);
    observer.observe(root.value);
  } else {
    window.addEventListener("resize", onWindowResize);
  }
});
onBeforeUnmount(() => {
  if (observer) observer.disconnect();
  else window.removeEventListener("resize", onWindowResize);
});
</script>

<style scoped>
.chart-root {
  position: relative;
  width: 100%;
  overflow: hidden;
}
.chart-empty {
  font-size: 12px;
  color: var(--muted, #6b7280);
  text-align: center;
}
.chart-svg {
  display: block;
}
.chart-grid line {
  stroke: var(--border, #e2e8f0);
  stroke-width: 1;
  stroke-dasharray: 3 4;
}
.chart-axis-y,
.chart-axis-x text {
  font-size: 9.5px;
  font-weight: 600;
  fill: var(--muted-light, #9ca3af);
}
.chart-axis-x text {
  font-size: 9px;
}
.chart-bar {
  transition: opacity 0.15s ease;
  pointer-events: none;
}
.chart-hit {
  fill: transparent;
  cursor: default;
}
.chart-bar.active {
  opacity: 0.65;
}
</style>
