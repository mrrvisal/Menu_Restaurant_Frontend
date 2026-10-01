<!-- Generic admin panel list: card chrome, search / status tools, filter chips,
     add button, skeleton + empty states. The rows themselves come from the
     parent through the #row slot, so every tab keeps its own columns while the
     panel look stays identical everywhere.
       #tools — extra controls next to the search box (sort select…)
       #row   — one <UserRow> per item ({ item } is the slot scope) -->
<template>
  <section class="panel" :class="`tone-${tone}`">
    <div class="panel-head">
      <span class="panel-title">
        <AppIcon :name="icon" :size="16" /> {{ title }}
      </span>
      <div class="panel-tools">
        <div v-if="searchable" class="search-box">
          <AppIcon name="search" :size="14" />
          <input class="search-input" :value="search" :placeholder="placeholder" @input="onSearch" />
        </div>
        <AppSelect v-if="statusOptions.length" size="sm" variant="teal" min-width="110px" :model-value="status"
          :options="statusOptions" @update:model-value="emit('update:status', $event)" />
        <slot name="tools" />
        <span v-if="count !== null" class="panel-count">{{ count }}</span>
      </div>
    </div>

    <div v-if="addLabel" class="panel-actions">
      <button class="btn-add" @click="emit('add')">
        <AppIcon name="plus" :size="14" /> {{ addLabel }}
      </button>
    </div>

    <div v-if="chips.length" class="chips">
      <button v-for="chip in chips" :key="chip.value" class="chip"
        :class="{ 'chip-active': chip.value === activeChip }" @click="emit('update:activeChip', chip.value)">
        {{ chip.label }}
      </button>
    </div>

    <!-- Reusable loading placeholder (skeleton) on the first load only -->
    <div v-if="loading && !items.length" class="rows">
      <SkeletonRow v-for="i in 3" :key="i" />
    </div>
    <div v-else-if="items.length" class="rows">
      <template v-for="item in items" :key="item[itemKey]">
        <slot name="row" :item="item" />
      </template>
    </div>
    <!-- Empty state: icon + message + one action (Refresh / Clear filters) -->
    <div v-else class="empty">
      <div class="empty-icon">
        <AppIcon :name="emptyIcon" :size="26" />
      </div>
      <p>{{ emptyText }}</p>
    </div>
  </section>
</template>

<script setup>
import AppIcon from "@/components/AppIcon.vue";
import AppSelect from "@/components/AppSelect.vue";
import SkeletonRow from "@/components/admin/SkeletonRow.vue";

defineProps({
  title: { type: String, default: "" },
  icon: { type: String, default: "category" },
  tone: { type: String, default: "teal" }, // teal | amber (panel accent)
  items: { type: Array, default: () => [] },
  itemKey: { type: String, default: "id" },
  count: { type: Number, default: null },
  loading: { type: Boolean, default: false },
  // search box
  searchable: { type: Boolean, default: false },
  search: { type: String, default: "" },
  placeholder: { type: String, default: "" },
  // status select in the head
  status: { type: String, default: "" },
  statusOptions: { type: Array, default: () => [] },
  // quick filters
  chips: { type: Array, default: () => [] },
  activeChip: { type: String, default: "" },
  // add button
  addLabel: { type: String, default: "" },
  // empty state
  emptyText: { type: String, default: "" },
  emptyIcon: { type: String, default: "category" },
  // optional CTA under the empty message (Refresh / Clear filters)
  emptyActionLabel: { type: String, default: "" },
  emptyActionIcon: { type: String, default: "refresh" },
});

const emit = defineEmits([
  "update:search",
  "update:status",
  "update:activeChip",
  "add",
  "empty-action",
]);

const onSearch = (event) => emit("update:search", event.target.value);
</script>

<style scoped>
.panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  background: var(--surface-soft);
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: "Hanuman", serif;
  font-size: 14.5px;
  font-weight: 700;
  color: var(--ink);
  white-space: nowrap;
}

.panel-tools {
  display: flex;
  align-items: center;
  gap: 10px;
}

.panel-count {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--teal);
  background: var(--surface-warm);
  border: 1px solid #bbf7d0;
  padding: 3px 12px;
  border-radius: 999px;
}

/* Amber accent — super-admin (system) tab */
.panel.tone-amber .panel-title :deep(svg) {
  color: var(--amber);
}

.panel.tone-amber .panel-count {
  color: #92400e;
  background: #fffbeb;
  border-color: #fde68a;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 7px;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 9px;
  padding: 6px 10px;
  color: var(--muted);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.search-box:focus-within {
  border-color: var(--green);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.12);
}

.search-input {
  border: none;
  outline: none;
  background: transparent;
  font-family: inherit;
  font-size: 13.5px;
  color: var(--text-dark, #1b2e1b);
  width: 170px;
}

.search-input::placeholder {
  color: var(--muted-light);
}

.panel-actions {
  padding: 12px 20px;
  border-bottom: 1px solid #f1f5f9;
}

.btn-add {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  border: none;
  border-radius: 10px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  background: linear-gradient(135deg, #0f766e, #14b8a6);
  box-shadow: 0 4px 14px rgba(15, 118, 110, 0.3);
  transition: filter 0.15s ease;
}

.btn-add:hover {
  filter: brightness(1.05);
}

.panel.tone-amber .btn-add {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  color: #78350f;
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.3);
}

/* Quick filters (role / status chips) */
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  padding: 14px 20px;
  border-bottom: 1px solid #f1f5f9;
}

.chip {
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-mid, #3a5a3a);
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  min-height: 34px;
  padding: 6px 14px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.chip:hover {
  border-color: var(--green-soft);
  color: var(--ink);
}

.chip-active {
  background: linear-gradient(135deg, var(--teal), var(--green));
  border-color: transparent;
  color: white;
}

.rows {
  display: flex;
  flex-direction: column;
}

/* Empty state — icon + message + one action (Refresh / Clear filters) */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 44px 20px;
  text-align: center;
}

.empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--green-pale, #e8f5e9);
  color: var(--green-mid, #2d7a2d);
}

.empty p {
  margin: 0;
  max-width: 34ch;
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-mid, #3a5a3a);
}

.empty-action {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 44px;
  padding: 10px 18px;
  border: 1px solid var(--sa-line, #dfeadc);
  border-radius: 999px;
  background: var(--white, #fff);
  color: var(--green-mid, #2d7a2d);
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.empty-action:hover {
  background: var(--green-pale, #e8f5e9);
  border-color: var(--green-accent, #81c784);
}

.empty-action:focus-visible {
  outline: 2px solid var(--green-accent, #81c784);
  outline-offset: 2px;
}

/* Row skeletons moved to <SkeletonRow /> so every list shares one placeholder */

/* ─── RESPONSIVE ─────────────────────────────────────────── */
@media (max-width: 900px) {
  .panel-tools {
    flex-wrap: wrap;
    justify-content: flex-end;
    flex: 1;
  }

  .search-box {
    flex: 1;
  }

  .search-input {
    width: 100%;
    min-width: 0;
  }
}

@media (max-width: 480px) {
  .panel-head {
    padding: 14px;
    flex-direction: column;
  }

  .panel-title {
    font-size: 13px;
  }

  .panel-actions,
  .chips {
    padding: 12px 14px;
  }
}
</style>
