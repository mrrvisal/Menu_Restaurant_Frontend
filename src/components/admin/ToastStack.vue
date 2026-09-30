<!-- Bottom-right toast stack (success / error) — teleported above everything.
     The view owns the list; this component only renders it. -->
<template>
  <Teleport to="body">
    <div class="toast-stack" aria-live="polite">
      <TransitionGroup name="toast">
        <div v-for="toast in toasts" :key="toast.id" class="toast" :class="`toast-${toast.type}`">
          <AppIcon :name="toast.type === 'error' ? 'x-octagon' : 'tick-circle'" :size="15" />
          <span>{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import AppIcon from "@/components/AppIcon.vue";

defineProps({
  // [{ id, message, type: "success" | "error" }]
  toasts: { type: Array, default: () => [] },
});
</script>

<style scoped>
.toast-stack {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 3000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: min(320px, calc(100vw - 32px));
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-left: 4px solid var(--green);
  border-radius: 10px;
  background: var(--surface);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text);
}

.toast :deep(svg) {
  color: var(--green);
  flex-shrink: 0;
}

.toast-error {
  border-left-color: var(--red);
  color: var(--red-deep);
}

.toast-error :deep(svg) {
  color: var(--red);
}

/* ─── TRANSITION ─────────────────────────────────────────── */
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
