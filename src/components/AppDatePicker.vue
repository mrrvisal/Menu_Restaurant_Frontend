<!-- ═══════════════════════════════════════════════════════════
   AppDatePicker — modern date picker (replaces native type="date")
   ─────────────────────────────────────────────────────────────
   • Pill field with a calendar icon and a localized, human-readable
     value ("17 តុលា 2026" / "17 Sep 2026") instead of "2026-10-17"
   • Custom dropdown calendar (teleported to <body>, like AppSelect):
     month navigation, weekday row, today ring, selected fill
   • Locale-aware labels via the i18n store (km-KH / en)
   • v-model uses the SAME "YYYY-MM-DD" string as the old input, so
     it's a drop-in replacement for <input type="date">
   • Optional min / max props (YYYY-MM-DD) disable out-of-range days
   ═══════════════════════════════════════════════════════════ -->
<template>
  <div ref="rootEl" class="dp" @keydown.esc.stop="close">
    <button
      type="button"
      class="dp-field"
      :class="{ 'is-open': open, 'is-empty': !modelValue }"
      aria-haspopup="dialog"
      :aria-expanded="open"
      :title="display || modelValue || placeholder"
      @click="toggle"
    >
      <svg
        class="dp-ico"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
      <span class="dp-value" :class="{ 'is-placeholder': !display }">{{
        display || placeholder
      }}</span>
      <svg
        class="dp-chev"
        :class="{ flip: open }"
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      ><polyline points="6 9 12 15 18 9" /></svg>
    </button>

    <!-- Calendar popup (teleported so no parent can clip it) -->
    <Teleport to="body">
      <Transition name="dp-pop">
        <div
          v-if="open"
          ref="popEl"
          class="dp-pop"
          role="dialog"
          aria-label="Select date"
          :style="popStyle"
          @pointerdown.stop
        >
          <div class="dp-head">
            <button
              type="button"
              class="dp-nav"
              aria-label="Previous month"
              @click="shiftMonth(-1)"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <span class="dp-title">{{ monthTitle }}</span>
            <button
              type="button"
              class="dp-nav"
              aria-label="Next month"
              @click="shiftMonth(1)"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>

          <div class="dp-week">
            <span v-for="(w, i) in weekdayLabels" :key="i">{{ w }}</span>
          </div>

          <div class="dp-grid">
            <span v-for="n in leadBlanks" :key="'b' + n" class="dp-day dp-blank"></span>
            <button
              v-for="d in daysInMonth"
              :key="d"
              type="button"
              class="dp-day"
              :class="{
                'is-today': isToday(d),
                'is-sel': isSelected(d),
                'is-dis': isDisabled(d),
              }"
              :disabled="isDisabled(d)"
              @click="select(d)"
            >
              {{ d }}
            </button>
          </div>

          <div class="dp-foot">
            <button type="button" class="dp-act" @click="pickToday">
              {{ i18n.t.report_today || "Today" }}
            </button>
            <button
              v-if="modelValue"
              type="button"
              class="dp-act dp-act-ghost"
              @click="clear"
            >
              {{ i18n.t.dp_clear || "Clear" }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted, nextTick } from "vue";
import { useI18nStore } from "@/stores/i18n";

const props = defineProps({
  /** "YYYY-MM-DD" — identical to the native input's value format */
  modelValue: { type: String, default: "" },
  placeholder: { type: String, default: "YYYY-MM-DD" },
  /** Optional range limits, "YYYY-MM-DD" */
  min: { type: String, default: "" },
  max: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue", "change"]);

const i18n = useI18nStore();
const open = ref(false);
const rootEl = ref(null);
const popEl = ref(null);
const popStyle = ref({});

const now = new Date();
const viewYear = ref(now.getFullYear());
const viewMonth = ref(now.getMonth()); // 0-based
const todayYmd = ymd(now.getFullYear(), now.getMonth(), now.getDate());

const locale = computed(() => (i18n.locale === "km" ? "km-KH" : "en-GB"));

// ─── date helpers (local time, no UTC shifting) ──────────────
function parseYmd(s) {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}
function ymd(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

// ─── labels ──────────────────────────────────────────────────
const display = computed(() => {
  const dt = parseYmd(props.modelValue);
  if (!dt) return "";
  try {
    return new Intl.DateTimeFormat(locale.value, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(dt);
  } catch {
    return props.modelValue;
  }
});

const monthTitle = computed(() => {
  try {
    return new Intl.DateTimeFormat(locale.value, {
      month: "long",
      year: "numeric",
    }).format(new Date(viewYear.value, viewMonth.value, 1));
  } catch {
    return `${viewMonth.value + 1}/${viewYear.value}`;
  }
});

// Oct 1 2023 is a Sunday → stable 7-label Sunday-first row
const weekdayLabels = computed(() => {
  const out = [];
  try {
    const fmt = new Intl.DateTimeFormat(locale.value, { weekday: "narrow" });
    for (let i = 0; i < 7; i++) out.push(fmt.format(new Date(2023, 9, 1 + i)));
  } catch {
    out.push(...["S", "M", "T", "W", "T", "F", "S"]);
  }
  return out;
});

// ─── calendar model ──────────────────────────────────────────
const daysInMonth = computed(() =>
  new Date(viewYear.value, viewMonth.value + 1, 0).getDate(),
);
const leadBlanks = computed(() =>
  new Date(viewYear.value, viewMonth.value, 1).getDay(),
);

function isToday(d) {
  return ymd(viewYear.value, viewMonth.value, d) === todayYmd;
}
function isSelected(d) {
  return props.modelValue === ymd(viewYear.value, viewMonth.value, d);
}
function isDisabled(d) {
  const s = ymd(viewYear.value, viewMonth.value, d);
  if (props.min && s < props.min) return true;
  if (props.max && s > props.max) return true;
  return false;
}

// ─── actions ─────────────────────────────────────────────────
function syncView() {
  const dt = parseYmd(props.modelValue) || new Date();
  viewYear.value = dt.getFullYear();
  viewMonth.value = dt.getMonth();
}
function shiftMonth(n) {
  let m = viewMonth.value + n;
  let y = viewYear.value;
  if (m < 0) {
    m = 11;
    y -= 1;
  } else if (m > 11) {
    m = 0;
    y += 1;
  }
  viewMonth.value = m;
  viewYear.value = y;
}
function select(d) {
  if (isDisabled(d)) return;
  const val = ymd(viewYear.value, viewMonth.value, d);
  emit("update:modelValue", val);
  emit("change", val);
  close();
}
function pickToday() {
  viewYear.value = now.getFullYear();
  viewMonth.value = now.getMonth();
  emit("update:modelValue", todayYmd);
  emit("change", todayYmd);
  close();
}
function clear() {
  emit("update:modelValue", "");
  emit("change", "");
  close();
}
function toggle() {
  if (open.value) return close();
  syncView();
  open.value = true;
  nextTick(positionPop);
}
function close() {
  open.value = false;
}

// Position the teleported popup right under the field (same approach
// as AppSelect's menu, so it works inside scrollable toolbars).
function positionPop() {
  const anchor = rootEl.value;
  const pop = popEl.value;
  if (!anchor || !pop) return;
  const r = anchor.getBoundingClientRect();
  const popH = pop.offsetHeight || 320;
  const spaceBelow = window.innerHeight - r.bottom;
  // Flip above the field when there isn't room below
  const showAbove = spaceBelow < popH + 12 && r.top > popH + 12;
  popStyle.value = {
    position: "fixed",
    left: `${Math.max(8, Math.min(r.left, window.innerWidth - 274))}px`,
    top: showAbove
      ? `${Math.max(8, r.top - popH - 6)}px`
      : `${r.bottom + 6}px`,
  };
}

function onDocPointerDown(e) {
  if (rootEl.value && !rootEl.value.contains(e.target)) close();
}
function onWinChange() {
  if (open.value) positionPop();
}
watch(open, (v) => {
  if (v) {
    document.addEventListener("pointerdown", onDocPointerDown);
    window.addEventListener("resize", onWinChange);
    window.addEventListener("scroll", onWinChange, { passive: true });
  } else {
    document.removeEventListener("pointerdown", onDocPointerDown);
    window.removeEventListener("resize", onWinChange);
    window.removeEventListener("scroll", onWinChange);
  }
});
onUnmounted(() => {
  document.removeEventListener("pointerdown", onDocPointerDown);
  window.removeEventListener("resize", onWinChange);
  window.removeEventListener("scroll", onWinChange);
});
</script>

<style scoped>
.dp {
  position: relative;
  display: inline-flex;
  width: 100%;
}

/* ─── field ─── */
.dp-field {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 36px;
  padding: 8px 12px;
  background: var(--surface, #ffffff);
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 8px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  color: var(--text, #0f172a);
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
}
.dp-field:hover {
  border-color: var(--primary-strong, var(--primary, #0f766e));
  transform: translateY(-1px);
  box-shadow: 0 2px 8px var(--primary-glow, rgba(15, 118, 110, 0.15));
}
.dp-field.is-open {
  border-color: var(--primary-strong, var(--primary, #0f766e));
  box-shadow: 0 0 0 3px var(--primary-glow, rgba(15, 118, 110, 0.15));
}
.dp-ico {
  color: var(--primary-strong, var(--primary, #0f766e));
  flex-shrink: 0;
}
.dp-value {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dp-value.is-placeholder {
  color: var(--muted-light, #9ca3af);
  font-weight: 500;
}
.dp-chev {
  color: var(--muted, #6b7280);
  flex-shrink: 0;
  transition: transform 0.2s ease;
}
.dp-chev.flip {
  transform: rotate(180deg);
}

/* ─── popup calendar ─── */
.dp-pop {
  z-index: 400;
  width: 266px;
  padding: 12px;
  background: var(--surface, #ffffff);
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 12px;
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.16);
}
.dp-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 8px;
}
.dp-title {
  flex: 1;
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--ink, #14532d);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dp-nav {
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 7px;
  background: var(--surface, #ffffff);
  color: var(--muted, #6b7280);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: all 0.15s ease;
}
.dp-nav:hover {
  border-color: var(--primary-strong, var(--primary, #0f766e));
  color: var(--primary-strong, var(--primary, #0f766e));
  background: var(--surface-green, #f0fdf4);
}
.dp-week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 4px;
}
.dp-week span {
  font-size: 9px;
  font-weight: 700;
  color: var(--muted, #6b7280);
  text-align: center;
  padding: 3px 0;
  text-transform: uppercase;
}
.dp-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}
.dp-day {
  aspect-ratio: 1 / 1;
  min-height: 30px;
  border: none;
  border-radius: 8px;
  background: transparent;
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--text, #0f172a);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.12s ease;
}
.dp-day:hover:not(.is-dis):not(.is-sel) {
  background: var(--surface-green, #f0fdf4);
  color: var(--primary-strong, var(--primary, #0f766e));
}
.dp-day.is-today {
  box-shadow: inset 0 0 0 1.5px var(--primary-strong, var(--primary, #0f766e));
  color: var(--primary-strong, var(--primary, #0f766e));
}
.dp-day.is-sel {
  background: linear-gradient(
    135deg,
    var(--primary, #0f766e),
    var(--primary-light, #14b8a6)
  );
  color: var(--on-primary, #fff);
  box-shadow: 0 2px 8px var(--primary-glow-strong, rgba(15, 118, 110, 0.25));
}
.dp-day.is-dis {
  opacity: 0.3;
  cursor: not-allowed;
}
.dp-blank {
  pointer-events: none;
}
.dp-foot {
  display: flex;
  justify-content: space-between;
  gap: 6px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--border, #e2e8f0);
}
.dp-act {
  border: 1px solid var(--border-green, #bbf7d0);
  background: var(--surface-green, #f0fdf4);
  color: var(--ink, #14532d);
  font-family: inherit;
  font-size: 10.5px;
  font-weight: 700;
  padding: 5px 10px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.dp-act:hover {
  background: var(--tint-hover, #dcfce7);
  transform: translateY(-1px);
}
.dp-act-ghost {
  background: transparent;
  border-color: var(--border, #e2e8f0);
  color: var(--muted, #6b7280);
}

/* ─── transition (same feel as AppSelect's as-pop) ─── */
.dp-pop-enter-active,
.dp-pop-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dp-pop-enter-from,
.dp-pop-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}

/* Small screens: smaller popup */
@media (max-width: 480px) {
  .dp-pop {
    width: min(280px, calc(100vw - 24px));
    padding: 10px;
  }
  .dp-day {
    min-height: 28px;
  }
}
</style>