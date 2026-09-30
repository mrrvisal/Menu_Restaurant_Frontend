<!-- Slide-in detail panel (user / member / restaurant / order).
     Teleported to <body>; the parent controls it with :open, fills the body
     (a .field-grid lives in the view) and can add buttons through #actions. -->
<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="open" class="drawer-overlay" @click.self="emit('close')">
        <div class="drawer" role="dialog" aria-modal="true">
          <div class="drawer-head">
            <div class="drawer-id">
              <div class="avatar" :class="[`tone-${tone}`, { 'is-square': square }]">
                <AppIcon v-if="icon" :name="icon" :size="20" />
                <template v-else>{{ initial }}</template>
              </div>
              <div>
                <div class="drawer-title">{{ title }}</div>
                <div class="drawer-sub">{{ subtitle }}</div>
              </div>
            </div>
            <button class="icon-btn" :aria-label="closeLabel" @click="emit('close')">
              <AppIcon name="x" :size="16" />
            </button>
          </div>

          <div class="drawer-body">
            <slot />
            <div v-if="$slots.actions" class="drawer-actions">
              <slot name="actions" />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import AppIcon from "@/components/AppIcon.vue";

defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: "" },
  subtitle: { type: String, default: "" },
  initial: { type: String, default: "?" },
  icon: { type: String, default: "" },
  tone: { type: String, default: "teal" }, // teal | amber
  square: { type: Boolean, default: false },
  closeLabel: { type: String, default: "Close" },
});
const emit = defineEmits(["close"]);
</script>

<style scoped>
.drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  justify-content: flex-end;
  background: rgba(20, 40, 30, 0.35);
}

.drawer {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 440px;
  height: 100%;
  overflow-y: auto;
  background: var(--surface);
  box-shadow: -18px 0 40px rgba(0, 0, 0, 0.12);
  transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1);
}

.drawer-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 24px 22px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--surface-soft);
}

.drawer-id {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.drawer-title {
  font-family: "Hanuman", serif;
  font-size: 16px;
  font-weight: 700;
  color: var(--ink);
}

.drawer-sub {
  margin-top: 2px;
  font-size: 12px;
  color: var(--muted);
}

.drawer-body {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 22px 22px 30px;
}

/* Buttons handed in through #actions stretch evenly */
.drawer-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.drawer-actions :deep(.btn) {
  flex: 1;
  justify-content: center;
  min-width: 120px;
}

.icon-btn {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--ink);
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.icon-btn:hover {
  background: var(--surface-warm);
  border-color: var(--green-soft);
}

.avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Hanuman", serif;
  font-size: 16px;
  font-weight: 700;
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

/* ─── TRANSITION ─────────────────────────────────────────── */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.2s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .drawer,
.drawer-leave-to .drawer {
  transform: translateX(100%);
}

/* ─── RESPONSIVE ─────────────────────────────────────────── */
@media (max-width: 900px) {
  .drawer {
    max-width: 100%;
  }

  .drawer-actions :deep(.btn) {
    min-width: 0;
  }
}

@media (max-width: 480px) {
  .drawer-head {
    padding: 18px 16px 14px;
  }

  .drawer-body {
    padding: 16px 16px 24px;
    gap: 18px;
  }

  .avatar {
    width: 40px;
    height: 40px;
    font-size: 14px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .drawer {
    transition: none;
  }
}
</style>
