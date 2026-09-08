<template>
  <div
    ref="rootEl"
    class="as-root"
    :class="[
      `as-var-${variant}`,
      `as-tone-${tone}`,
      `as-size-${size}`,
      { 'is-open': opened, 'as-block': block, 'as-ghost': ghost, 'as-disabled': disabled },
    ]"
    :style="{ '--as-radius': radius || (size === 'sm' ? '8px' : '10px'), minWidth: minWidth || undefined }"
  >
    <button
      type="button"
      :id="controlId"
      class="as-control"
      :disabled="disabled"
      :aria-label="label || undefined"
      aria-haspopup="listbox"
      :aria-controls="menuId"
      :aria-expanded="opened"
      :title="currentOption ? labelOf(currentOption) : placeholder"
      @click="toggle"
      @keydown="onKeydown"
    >
      <span class="as-value" :class="{ 'is-placeholder': !currentOption }">{{
        currentOption ? labelOf(currentOption) : placeholder
      }}</span>
      <svg
        class="as-chevron"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      ><polyline points="6 9 12 15 18 9" /></svg>
    </button>

    <Teleport to="body">
      <Transition name="as-pop">
        <ul
          v-if="opened"
          :id="menuId"
          ref="menuEl"
          class="as-menu"
          :class="[`as-var-${variant}`, `as-tone-${tone}`]"
          role="listbox"
          :aria-label="label || 'Select'"
          :style="menuStyle"
          @pointerdown.stop
        >
          <li
            v-for="(opt, i) in options"
            :key="keyOf(opt, i)"
            class="as-option"
            :class="{ 'is-active': i === activeIndex, 'is-selected': isSelected(opt) }"
            role="option"
            :aria-selected="isSelected(opt)"
            @click="select(opt)"
            @pointerenter="activeIndex = i"
          >
            <span class="as-option-label">{{ labelOf(opt) }}</span>
            <svg
              v-if="isSelected(opt)"
              class="as-check"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            ><polyline points="20 6 9 17 4 12" /></svg>
          </li>
          <li v-if="!options.length" class="as-empty">{{ emptyText }}</li>
        </ul>
      </Transition>
    </Teleport>
  </div>
</template>
<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from "vue";

// ----------------------------------------------------------------------------
// AppSelect — fully custom dropdown select (replaces native <select>/<option>).
// No OS-rendered dropdown: every option is a styled element of our own, so we
// get full control over the design (hover, selected gradient, check mark, …).
// ----------------------------------------------------------------------------
const props = defineProps({
  modelValue: { default: undefined },
  options: { type: Array, default: () => [] },
  optionValue: { type: String, default: "value" },
  optionLabel: { type: String, default: "label" },
  placeholder: { type: String, default: "Select…" },
  variant: { type: String, default: "green" }, // 'green' | 'teal'
  size: { type: String, default: "md" }, // 'sm' | 'md'
  tone: { type: String, default: "plain" }, // 'plain' | 'soft'
  block: { type: Boolean, default: false },
  ghost: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  label: { type: String, default: "" },
  emptyText: { type: String, default: "No options" },
  minWidth: { type: String, default: "" },
  radius: { type: String, default: "" },
});
const emit = defineEmits(["update:modelValue", "change"]);

const opened = ref(false);
const activeIndex = ref(0);
const rootEl = ref(null);
const menuEl = ref(null);
const menuPos = ref({ top: 0, left: 0, width: 200, maxHeight: 260 });

// unique ids for aria-controls wiring
let uidCounter = 0;
const uid = ++uidCounter;
const controlId = `as-control-${uid}`;
const menuId = `as-menu-${uid}`;

// rAF handle for the live reposition loop (keeps the menu glued to the
// control even while a parent is animating — e.g. the mobile sidebar slide)
let rafId = null;

/* ------------------------- helpers ------------------------- */
const valueOf = (opt) =>
  opt && typeof opt === "object" ? opt[props.optionValue] : opt;
const labelOf = (opt) =>
  opt && typeof opt === "object" ? opt[props.optionLabel] : String(opt ?? "");
const keyOf = (opt, i) => {
  const v = valueOf(opt);
  return v !== undefined && v !== null ? String(v) : `opt-${i}`;
};
const byValue = (v) => String(v ?? "");

const currentOption = computed(() =>
  props.options.find((o) => byValue(valueOf(o)) === byValue(props.modelValue))
);
const isSelected = (opt) => byValue(valueOf(opt)) === byValue(props.modelValue);

const menuStyle = computed(() => ({
  top: `${menuPos.value.top}px`,
  left: `${menuPos.value.left}px`,
  width: `${menuPos.value.width}px`,
  maxHeight: `${menuPos.value.maxHeight}px`,
}));

/* ---------------------- open / close ----------------------- */
function measure() {
  const el = rootEl.value;
  if (!el) return;
  const r = el.getBoundingClientRect();
  const estH = Math.min(props.options.length * 40 + 14, 260);
  const spaceBelow = window.innerHeight - r.bottom - 10;
  const openUp = spaceBelow < estH && r.top > estH + 10;
  menuPos.value = {
    top: openUp ? Math.max(8, r.top - estH - 6) : r.bottom + 6,
    left: Math.max(8, r.left),
    width: Math.max(r.width, 180),
    maxHeight: openUp
      ? Math.max(140, r.top - 58)
      : Math.max(140, Math.min(260, window.innerHeight - r.bottom - 24)),
  };
}

function startReposition() {
  stopReposition();
  const loop = () => {
    measure();
    rafId = requestAnimationFrame(loop);
  };
  rafId = requestAnimationFrame(loop);
}
function stopReposition() {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;
}

function openMenu() {
  measure();
  opened.value = true;
  activeIndex.value = Math.max(
    0,
    props.options.findIndex((o) => byValue(valueOf(o)) === byValue(props.modelValue))
  );
  // live reposition while open (parents may animate/scroll under us)
  startReposition();
  nextTick(() => {
    measure();
    menuEl.value
      ?.querySelector(".as-option.is-active")
      ?.scrollIntoView({ block: "nearest" });
  });
}

function closeMenu(restoreFocus = false) {
  opened.value = false;
  stopReposition();
  if (restoreFocus) rootEl.value?.querySelector(".as-control")?.focus();
}

function toggle() {
  if (props.disabled) return;
  opened.value ? closeMenu(true) : openMenu();
}

/* ---------------------- selection -------------------------- */
function select(opt) {
  const v = valueOf(opt);
  const changed = byValue(v) !== byValue(props.modelValue);
  closeMenu();
  // Match native <select>: no events when the same value is re-picked.
  if (changed) {
    emit("update:modelValue", v);
    emit("change", v);
  }
}

/* ---------------------- keyboard --------------------------- */
function onKeydown(e) {
  if (props.disabled) return;
  if (opened.value) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeMenu(true);
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const delta = e.key === "ArrowDown" ? 1 : -1;
      const max = props.options.length;
      if (max) activeIndex.value = (activeIndex.value + delta + max) % max;
    } else if ((e.key === "Enter" || e.key === " ") && props.options[activeIndex.value]) {
      e.preventDefault();
      select(props.options[activeIndex.value]);
    } else if (e.key === "Tab") {
      closeMenu(false);
    }
    return;
  }
  if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
    e.preventDefault();
    openMenu();
  }
}

/* ---------------------- lifecycle -------------------------- */
function onDocPointerDown(e) {
  if (rootEl.value && !rootEl.value.contains(e.target)) closeMenu(false);
}
function onLayout() {
  if (opened.value) measure();
}

watch(opened, (isOpen) => {
  if (isOpen) {
    document.addEventListener("pointerdown", onDocPointerDown, { passive: true });
    window.addEventListener("scroll", onLayout, { passive: true });
    window.addEventListener("resize", onLayout, { passive: true });
  } else {
    document.removeEventListener("pointerdown", onDocPointerDown);
    window.removeEventListener("scroll", onLayout);
    window.removeEventListener("resize", onLayout);
  }
});

// keep the highlighted option visible while navigating with the keyboard
watch(activeIndex, () => {
  if (!opened.value) return;
  nextTick(() => {
    menuEl.value
      ?.querySelector(".as-option.is-active")
      ?.scrollIntoView({ block: "nearest" });
  });
});

onBeforeUnmount(() => {
  stopReposition();
  document.removeEventListener("pointerdown", onDocPointerDown);
  window.removeEventListener("scroll", onLayout);
  window.removeEventListener("resize", onLayout);
});
</script>
<style scoped>
/* ═══════════════════════════════════════════════════════════
   AppSelect — Custom dropdown (no native select/option chrome)
   ═══════════════════════════════════════════════════════════
   IMPORTANT: the option menu is Teleported to <body>, so it is
   NOT a DOM descendant of .as-root and cannot inherit custom
   properties from it. All style tokens are therefore declared
   on BOTH .as-root and .as-menu (the menu also carries the
   variant/tone classes for that reason).                        */
.as-root,
.as-menu {
  /* Tokens — everything follows the dynamic theme: stores/theme.js pushes
     the primary, surface-green and primary-glow variable families to <html>
     (admin side) and MenuView pushes the restaurant palette (public menu
     side). Fallbacks keep the original brand-green look when a token is
     absent. */
  --as-accent: var(--primary-strong, var(--green-mid, #16a34a));
  --as-grad-a: var(--primary, #166534);
  --as-grad-b: var(--primary-light, #22c55e);
  --as-ring: var(--primary-glow, rgba(22, 101, 52, 0.16));
  --as-hover-bg: var(--surface-green, var(--green-pale, #f0fdf4));
  --as-hover-ink: var(--primary-strong, #166534);
  --as-border: var(--border, #e2e8f0);
  --as-ink: var(--text, #0f172a);

  position: relative;
  color: var(--as-ink);
}

/* Variant: teal (Admin / SuperAdmin brand) — same dynamic tokens, kept as an
   alias so existing usages are unaffected. */
.as-root.as-var-teal,
.as-menu.as-var-teal {
  --as-accent: var(--primary-strong, #0f766e);
  --as-grad-a: var(--primary, #0f766e);
  --as-grad-b: var(--primary-light, #14b8a6);
  --as-hover-ink: var(--primary-strong, #0f766e);
}

/* Tone: soft (mint border, matches form inputs / sidebar pill) */
.as-root.as-tone-soft,
.as-menu.as-tone-soft {
  --as-border: var(--border-green, var(--green-soft, #bbf7d0));
}
/* Tone: plain (neutral border) */
.as-root.as-tone-plain,
.as-menu.as-tone-plain {
  --as-border: var(--border, #e2e8f0);
}

/* Root sizing (the teleported menu positions itself, no sizing needed) */
.as-root {
  display: inline-block;
  width: auto;
}

/* Block / ghost / sizes */
.as-root.as-block { width: 100%; }
.as-root.as-ghost .as-control { background: transparent; }
.as-root.as-size-sm .as-control {
  min-height: 30px;
  padding: 4px 10px 4px 10px;
  font-size: 12px;
}
.as-root.as-size-md .as-control {
  min-height: 38px;
  padding: 8px 10px 8px 10px;
  font-size: 13px;
}

/* ---------- closed control (replaces native select) ---------- */
.as-control {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
  border: 1.5px solid var(--as-border);
  border-radius: var(--as-radius, 10px);
  background: var(--surface, #fff);
  color: var(--as-ink);
  font-family: inherit;
  font-weight: 500;
  line-height: 1.4;
  text-align: left;
  cursor: pointer;
  position: relative;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  -webkit-appearance: none;
  appearance: none;
}
.as-control:hover:not(:disabled) {
  border-color: var(--as-accent);
}
.as-control:focus-visible,
.as-root.is-open .as-control {
  outline: none;
  border-color: var(--as-accent);
  box-shadow: 0 0 0 3px var(--as-ring);
}
.as-control:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.as-value {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  font-size: 12px;
  text-overflow: ellipsis;
}
.as-value.is-placeholder {
  color: var(--muted-light, #9ca3af);
}
.as-chevron {
  flex-shrink: 0;
  color: var(--as-accent);
  transition: transform 0.2s ease;
}
.is-open .as-chevron {
  transform: rotate(180deg);
}

/* ─────────── the custom option menu ─────────── */
.as-menu {
  position: fixed;
  z-index: 1000000;
  margin: 0;
  padding: 6px;
  list-style: none;
  box-sizing: border-box;
  background: #fff;
  border: 1px solid var(--as-border);
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.14), 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow-y: auto;
  pointer-events: auto;
}

.as-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text, #0f172a);
  transition: background-color 0.12s ease, color 0.12s ease;
}
.as-option + .as-option {
  margin-top: 2px;
}
.as-option.is-active,
.as-option:hover {
  background: var(--as-hover-bg);
  color: var(--as-hover-ink);
}
.as-option.is-selected {
  background: linear-gradient(135deg, var(--as-grad-a), var(--as-grad-b));
  color: #fff;
  font-weight: 600;
  box-shadow: 0 2px 8px var(--as-ring);
}
.as-option-label {
  min-width: 0;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.as-check {
  flex-shrink: 0;
}

.as-empty {
  padding: 12px;
  text-align: center;
  font-size: 12px;
  color: var(--muted-light, #9ca3af);
}

/* Pop transition */
.as-pop-enter-active,
.as-pop-leave-active {
  transition: opacity 0.16s ease, transform 0.16s ease;
  transform-origin: top;
}
.as-pop-enter-from,
.as-pop-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}
</style>