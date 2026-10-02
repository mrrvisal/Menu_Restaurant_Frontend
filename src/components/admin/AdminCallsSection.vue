<!-- Pending guest "call the owner" requests, shown at the top of the Orders
     tab. Each row can be marked handled (or reopened) with one tap. -->
<template>
  <section class="calls-strip">
    <header class="calls-head">
      <span class="calls-title">
        <AppIcon name="bell" :size="15" />
        {{ i18n.t.table_calls }}
        <span v-if="pending.length" class="calls-count">{{ pending.length }}</span>
      </span>
      <div class="calls-head-actions">
        <span class="calls-hint">{{ i18n.t.table_calls_hint }}</span>
        <button
          v-if="list.length"
          type="button"
          class="calls-toggle"
          :aria-expanded="expanded"
          @click="expanded = !expanded"
        >
          {{ expanded ? i18n.t.collapse : i18n.t.expand }}
          <svg
            class="calls-toggle-icon"
            :class="{ expanded }"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>
    </header>

    <template v-if="expanded">
      <div v-if="loading && !list.length" class="calls-empty">
        <span class="spinner"></span>
        {{ i18n.t.loading }}
      </div>

      <div v-else-if="!list.length" class="calls-empty">
        <AppIcon name="bell" :size="16" />
        {{ i18n.t.table_calls_empty }}
      </div>

      <ul v-else class="calls-list">
        <li v-for="call in list" :key="call.id" class="call-row" :class="{ done: call.status === 'handled' }">
          <span class="call-type" :class="call.type">
            {{ call.type === "bill" ? i18n.t.call_type_bill : i18n.t.call_type_extra }}
          </span>
          <span class="call-table">{{ i18n.t.table_no }} {{ call.table_no }}</span>
          <span v-if="call.message" class="call-msg">{{ call.message }}</span>
          <span class="call-time">{{ timeAgo(call.created_at) }}</span>
          <button v-if="call.status !== 'handled'" class="call-done" @click="mark(call.id)">
            <AppIcon name="check" :size="13" />
            {{ i18n.t.call_mark_done }}
          </button>
          <span v-else class="call-handled">
            <AppIcon name="check-circle" :size="13" />
            {{ i18n.t.call_handled }}
          </span>
        </li>
      </ul>
    </template>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import AppIcon from "@/components/AppIcon.vue";
import { useI18nStore } from "@/stores/i18n";
import { useAuthStore } from "@/stores/auth";
import { useAdminCalls } from "@/composables/useAdminCalls";

const i18n = useI18nStore();
const auth = useAuthStore();
const { calls, callsLoading, pendingCalls, fetchCalls, updateCallStatus } =
  useAdminCalls();

// Pending requests lead; handled ones follow so the owner sees recent
// resolutions without them shouting for attention. Newest first within
// each group.
const list = computed(() =>
  [...calls.value].sort((a, b) => {
    if (a.status === b.status) return b.id - a.id;
    return a.status === "pending" ? -1 : 1;
  }),
);
const pending = computed(() => pendingCalls.value);
const loading = computed(() => callsLoading.value);
const expanded = ref(true);

async function mark(id) {
  try {
    await updateCallStatus(id, "handled");
  } catch {
    /* already surfaced by the composable's console error */
  }
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Math.max(0, Date.now() - new Date(dateStr).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return i18n.locale === "km" ? "ឥឡូវនេះ" : "just now";
  if (mins < 60)
    return i18n.locale === "km" ? `${mins} នាទីមុន` : `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24)
    return i18n.locale === "km" ? `${hours} ម៉ោងមុន` : `${hours}h ago`;
  return new Date(dateStr).toLocaleDateString(
    i18n.locale === "km" ? "km-KH" : "en-US",
    { month: "short", day: "numeric" },
  );
}

onMounted(() => {
  fetchCalls();
});

// Multi-restaurant owners: switching restaurant in the sidebar must swap
// the panel to that restaurant's calls (same behaviour as the orders list).
watch(
  () => auth.restaurantId,
  () => fetchCalls(),
);
</script>

<style scoped>
.calls-strip {
  background: var(--surface, #fff);
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 2px rgba(16, 24, 20, 0.04);
}

.calls-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.calls-title {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text, #0f172a);
}

.calls-count {
  min-width: 19px;
  height: 19px;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--amber, #f59e0b);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.calls-hint {
  font-size: 11.5px;
  color: var(--muted, #6b7280);
}

.calls-head-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.calls-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 7px;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 7px;
  background: transparent;
  color: var(--text, #0f172a);
  font: inherit;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
}

.calls-toggle:hover {
  background: var(--surface-green, #f0fdf4);
}

.calls-toggle-icon {
  transition: transform 0.15s;
}

.calls-toggle-icon.expanded {
  transform: rotate(180deg);
}

.calls-empty {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: var(--muted, #6b7280);
  padding: 6px 2px;
}

.calls-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
}

.call-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 9px 12px;
  border-radius: 10px;
  background: var(--surface-green, #f0fdf4);
  border: 1px solid var(--border-green, #bbf7d0);
}

.call-row.done {
  background: var(--surface, #fff);
  border-color: var(--border, #e2e8f0);
  opacity: 0.75;
}

.call-type {
  font-size: 11.5px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
  white-space: nowrap;
}

.call-type.bill {
  background: #dcfce7;
  color: #15803d;
}

.call-type.extra {
  background: #fef3c7;
  color: #b45309;
}

.call-table {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--text, #0f172a);
  white-space: nowrap;
}

.call-msg {
  font-size: 12.5px;
  color: var(--text, #0f172a);
  flex: 1;
  min-width: 120px;
  word-break: break-word;
}

.call-time {
  font-size: 11px;
  color: var(--muted, #6b7280);
  margin-left: auto;
}

.call-done {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border: none;
  border-radius: 8px;
  background: var(--primary, #0f766e);
  color: #fff;
  font-size: 12px;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: filter 0.15s, transform 0.15s;
}

.call-done:hover {
  filter: brightness(1.08);
  transform: translateY(-1px);
}

.call-handled {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
  color: var(--green-dark, #16a34a);
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid var(--border, #e2e8f0);
  border-top-color: var(--primary, #0f766e);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 560px) {
  .call-msg {
    flex-basis: 100%;
    order: 5;
  }

  .calls-hint {
    display: none;
  }

  .calls-head-actions {
    margin-left: auto;
  }
}
</style>
