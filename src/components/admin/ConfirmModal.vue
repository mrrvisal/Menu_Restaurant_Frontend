<!-- Confirm / info dialog in the app's "confirm-box" style.
     Used for logouts, dangerous deletes and the temporary-password reveal —
     extra content goes in the default slot, #actions is not needed here. -->
<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="modal-overlay" @click.self="emit('cancel')">
        <div class="confirm-box pop-in" role="dialog" aria-modal="true">
          <div class="confirm-icon">
            <AppIcon :name="icon" :size="36" />
          </div>
          <div class="confirm-title" :class="{ 'is-danger': danger }">{{ title }}</div>
          <div v-if="message" class="confirm-name">{{ message }}</div>

          <slot />

          <div class="confirm-btns">
            <button class="confirm-cancel" @click="emit('cancel')">{{ cancelLabel }}</button>
            <button v-if="!hideConfirm" class="confirm-logout" :class="{ 'is-danger': danger }"
              @click="emit('confirm')">
              {{ confirmLabel }}
            </button>
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
  message: { type: String, default: "" },
  icon: { type: String, default: "check" },
  danger: { type: Boolean, default: false },
  confirmLabel: { type: String, default: "" },
  cancelLabel: { type: String, default: "" },
  // Info dialogs (temporary password) only need the closing button
  hideConfirm: { type: Boolean, default: false },
});
const emit = defineEmits(["confirm", "cancel"]);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 220;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.55);
}

.confirm-box {
  width: 90%;
  max-width: 300px;
  padding: 28px 22px;
  background: white;
  border-radius: 22px;
  text-align: center;
}

.confirm-icon {
  margin-bottom: 8px;
  font-size: 36px;
}

.confirm-title {
  margin-bottom: 6px;
  font-family: "Hanuman", serif;
  font-size: 17px;
  font-weight: 700;
  color: var(--teal);
}

.confirm-title.is-danger {
  color: #c62828;
}

.confirm-name {
  margin-bottom: 18px;
  font-size: 13px;
  color: var(--text);
}

.confirm-btns {
  display: flex;
  gap: 10px;
}

.confirm-cancel {
  flex: 1;
  padding: 11px;
  border: none;
  border-radius: 10px;
  background: #e8f5e9;
  color: #1a4a1a;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.confirm-cancel:hover {
  background: #c8e6c9;
}

.confirm-logout {
  flex: 1;
  padding: 11px;
  border: none;
  border-radius: 10px;
  background: #9f4040;
  color: white;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.confirm-logout:hover {
  background: #7a2a2a;
}

.confirm-logout.is-danger {
  background: var(--red-deep);
}

.confirm-logout.is-danger:hover {
  background: #8f1d1d;
}

/* ─── ANIMATION ──────────────────────────────────────────── */
.pop-in {
  animation: pop-in 0.18s ease;
}

@keyframes pop-in {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(6px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 480px) {
  .confirm-box {
    max-width: 280px;
    padding: 24px 18px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pop-in {
    animation: none;
  }
}
</style>
