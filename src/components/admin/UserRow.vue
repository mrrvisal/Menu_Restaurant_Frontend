<!-- One list row (user / owner / super admin / restaurant / order).
     Renders the row skeleton only — badges, counters and action controls are
     passed in through slots so every list keeps its own columns.
       #meta    badges on the right (tags, status dots, dates…)
       #actions trailing control (status select, buttons…) — clicks are stopped -->
<template>
  <div class="row" :class="{ 'is-clickable': clickable }" :title="tooltip || undefined" @click="onClick">
    <div class="row-main">
      <div class="avatar" :class="[`tone-${tone}`, { 'is-square': square }]">
        <AppIcon v-if="icon" :name="icon" :size="16" />
        <template v-else>{{ initial }}</template>
      </div>
      <div class="row-text">
        <span class="row-title">{{ title }}</span>
        <span v-if="subtitle" class="row-sub">{{ subtitle }}</span>
      </div>
      <!-- Hover affordance: this row opens a detail drawer -->
      <span v-if="hint" class="row-hint" aria-hidden="true">
        <AppIcon name="eye" :size="13" /> {{ hint }}
      </span>
    </div>
    <div class="row-meta"><slot name="meta" /></div>
    <div v-if="$slots.actions" class="row-actions" @click.stop>
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
import AppIcon from "@/components/AppIcon.vue";

const props = defineProps({
  title: { type: String, default: "" },
  subtitle: { type: String, default: "" },
  initial: { type: String, default: "?" },
  icon: { type: String, default: "" },
  tone: { type: String, default: "teal" }, // teal | amber
  square: { type: Boolean, default: false },
  clickable: { type: Boolean, default: true },
  // Tooltip / label of the hover affordance (e.g. t.view) — empty hides it
  hint: { type: String, default: "" },
  // Native tooltip for the whole row (e.g. the role label)
  tooltip: { type: String, default: "" },
});
const emit = defineEmits(["select"]);

function onClick() {
  if (props.clickable) emit("select");
}
</script>

<style scoped>
.row {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 56px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--sa-line, #dfeadc);
  transition: background 0.15s ease;
}

.row.is-clickable {
  cursor: pointer;
}

.row.is-clickable:hover {
  background: var(--green-pale, #e8f5e9);
}

.row:last-child {
  border-bottom: none;
}

.row-main {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
  flex: 1 1 auto;
}

.row-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.row-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--green-dark, #14532d);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row-sub {
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--text-mid, #6b7280);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Hover affordance — appears next to the text on pointer devices only */
.row-hint {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-left: auto;
  padding: 4px 11px;
  border-radius: 999px;
  background: var(--green-mid, #2d7a2d);
  color: var(--white, #fff);
  font-size: 12.5px;
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  transform: translateX(-4px);
  transition: opacity 0.15s ease, transform 0.15s ease;
  pointer-events: none;
}

.row.is-clickable:hover .row-hint,
.row.is-clickable:focus-within .row-hint {
  opacity: 1;
  transform: none;
}

.row-meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
  flex: 1 0 auto;
}

.row-actions {
  flex-shrink: 0;
}

/* Avatars — 38px circle, 10px square for stores / orders */
.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Hanuman", serif;
  font-weight: 700;
  font-size: 14px;
  color: white;
  flex-shrink: 0;
}

.avatar.is-square {
  border-radius: 10px;
}

.avatar.tone-teal {
  background: linear-gradient(135deg, var(--teal), var(--green));
}

.avatar.tone-amber {
  background: linear-gradient(135deg, var(--amber), var(--amber-soft));
}

/* Mobile: rows stack, meta wraps left, actions full width */
@media (max-width: 900px) {
  .row {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    padding: 16px;
  }

  .row-main {
    min-width: 0;
  }

  .row-meta {
    justify-content: flex-start;
    gap: 8px;
  }

  .row-actions {
    width: 100%;
  }

  /* No hover on touch devices */
  .row-hint {
    display: none;
  }
}

@media (max-width: 480px) {
  .row {
    padding: 14px;
  }

  .row-title {
    font-size: 14px;
  }

  .row-sub {
    font-size: 13.5px;
  }

  .avatar {
    width: 34px;
    height: 34px;
    font-size: 13px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .row-hint {
    transition: none;
  }
}
</style>
