<!-- One-line summary of the figures that belong to the current tab.
     Replaces the old stat grid that was repeated on every tab:
     "2 Users · 1 Super Admin · 2 Restaurants" -->
<template>
  <p v-if="items.length" class="summary">
    <span v-for="(item, i) in items" :key="item.label" class="summary-item">
      <span v-if="i" class="summary-sep" aria-hidden="true">·</span>
      <strong class="summary-value">{{ item.value }}</strong>
      <span class="summary-label">{{ item.label }}</span>
    </span>
  </p>
</template>

<script setup>
defineProps({
  // [{ value: Number | String, label: String }]
  items: { type: Array, default: () => [] },
});
</script>

<style scoped>
.summary {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px 10px;
  margin: 0;
  min-width: 0;
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--text-mid, #3a5a3a);
}

.summary-item {
  display: inline-flex;
  align-items: baseline;
  gap: 5px;
  white-space: nowrap;
}

.summary-sep {
  margin-right: 4px;
  color: var(--green-accent, #81c784);
}

.summary-value {
  font-family: "Hanuman", serif;
  font-size: 15px;
  font-weight: 700;
  color: var(--green-dark, #1a4a1a);
  font-variant-numeric: tabular-nums;
}

.summary-label {
  font-size: 13.5px;
}
</style>
