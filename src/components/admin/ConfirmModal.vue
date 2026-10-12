<!-- Confirm / info dialog in the app's "confirm-box" style.
     Used for logouts, dangerous deletes and the temporary-password reveal —
     extra content goes in the default slot, #actions is not needed here. -->
<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="modal-overlay" @click.self="emit('cancel')">
        <div ref="card" class="modal-card pop-in" :class="{ danger }" :role="danger ? 'alertdialog' : 'dialog'"
          aria-modal="true" aria-labelledby="confirm-title" :aria-describedby="message ? 'confirm-desc' : undefined"
          tabindex="-1">
          <div class="modal-header">
            <span class="modal-icon" aria-hidden="true">
              <AppIcon :name="icon" :size="16" />
            </span>
            <span class="modal-title" id="confirm-title">{{ title }}</span>
            <button type="button" class="modal-close" :aria-label="cancelLabel" @click="emit('cancel')">
              <AppIcon name="x" :size="18" />
            </button>
          </div>

          <div class="modal-body">
            <p v-if="message" class="confirm-desc" id="confirm-desc">{{ message }}</p>
            <!-- Extra content (e.g. the temporary password) goes here -->
            <slot />
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-ghost" @click="emit('cancel')">{{ cancelLabel }}</button>
            <button v-if="!hideConfirm" type="button" class="btn-confirm" @click="emit('confirm')">
              {{ confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from "vue";
import AppIcon from "@/components/AppIcon.vue";

const props = defineProps({
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

const card = ref(null); // dialog element — focus-trap target

// On open: remember the trigger, lock page scroll, and focus the safest action
// (Cancel for a destructive confirm, the primary otherwise). On close: restore
// scroll and return focus to whatever opened the dialog.
let lastFocused = null;
let prevOverflow = null;

watch(
  () => props.open,
  async (open) => {
    if (open) {
      lastFocused = document.activeElement;
      prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      await nextTick();
      card.value
        ?.querySelector(props.danger || props.hideConfirm ? ".btn-ghost" : ".btn-confirm")
        ?.focus();
    } else {
      document.body.style.overflow = prevOverflow ?? "";
      prevOverflow = null;
      lastFocused?.focus?.();
      lastFocused = null;
    }
  },
);

// Escape cancels and Tab cycles inside the dialog. The listener is global because
// the card is teleported to <body>; the guard makes it a no-op when shut.
function onKeydown(e) {
  if (!props.open || !card.value) return;
  if (e.key === "Escape") {
    e.preventDefault();
    emit("cancel");
    return;
  }
  if (e.key !== "Tab") return;
  const nodes = Array.from(
    card.value.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => el.offsetWidth || el.offsetHeight);
  if (!nodes.length) return;
  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  if (!card.value.contains(document.activeElement)) {
    e.preventDefault();
    first.focus();
  } else if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

window.addEventListener("keydown", onKeydown);
onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
  if (prevOverflow !== null) {
    document.body.style.overflow = prevOverflow;
    prevOverflow = null;
  }
  lastFocused?.focus?.();
  lastFocused = null;
});
</script>

<style scoped>
/* ════════════════════════════════════════════════════════════
   Confirm / alert dialog — matches CreateAdminModal's System.
   Scoped styles still reach the teleported card (Vue keeps the scope
   id on the moved DOM), so no global override is required.
   ════════════════════════════════════════════════════════════ */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 260;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
  overscroll-behavior: contain;
  /* Neutral scrim + soft blur lets the console recede behind the dialog. */
  background: rgba(17, 24, 20, 0.5);
  backdrop-filter: blur(3px);
}

.modal-card {
  width: 100%;
  max-width: 420px;
  border: 1px solid var(--sa-line, var(--border));
  border-radius: 18px;
  background: var(--surface);
  box-shadow: var(--sa-elev-floating, 0 18px 48px -12px rgba(20, 60, 30, 0.28), 0 2px 8px rgba(20, 60, 30, 0.1));
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 15px 14px 15px 18px;
  border-bottom: 1px solid var(--sa-line, var(--border));
  background: linear-gradient(180deg, var(--surface-soft), var(--surface));
}

/* Icon chip — teal tint by default, red when the action is destructive */
.modal-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(45, 122, 45, 0.12);
  color: var(--green-dark);
  flex-shrink: 0;
}

.modal-card.danger .modal-icon {
  background: rgba(198, 40, 40, 0.12);
  color: var(--red-deep);
}

.modal-title {
  flex: 1;
  min-width: 0;
  font-family: "Hanuman", serif; /* Khmer titles render correctly */
  font-size: 16px;
  font-weight: 700;
  line-height: 1.6;
  color: var(--green-dark);
}

.modal-card.danger .modal-title {
  color: var(--red-deep);
}

.modal-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid transparent;
  border-radius: 9px;
  background: transparent;
  color: var(--text-light);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.modal-close:hover {
  background: var(--green-pale);
  border-color: var(--green-soft);
  color: var(--green-dark);
}

.modal-body {
  padding: 18px;
}

.confirm-desc {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.6; /* Khmer message text needs the room */
  color: var(--text-mid);
  overflow-wrap: anywhere;
}

/* Body content like the temp-password row sits below the description */
.modal-body > * + * {
  margin-top: 12px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 18px;
  border-top: 1px solid var(--sa-line, var(--border));
  background: var(--surface-soft);
}

.modal-actions button {
  min-width: 104px;
}

.btn-ghost,
.btn-confirm {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 16px;
  border-radius: 10px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease,
    filter 0.15s ease, transform 0.15s ease;
}

/* Secondary = white + hairline (Stripe/Linear style) instead of a tinted block */
.btn-ghost {
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
}

.btn-ghost:hover {
  background: var(--surface-warm);
  border-color: var(--green-soft);
}

/* Primary keeps the green/cream identity — not a blue/purple SaaS cliché */
.btn-confirm {
  border: 1px solid transparent;
  background: linear-gradient(135deg, var(--green-mid), var(--green-light));
  color: var(--white);
  box-shadow: 0 4px 12px -4px rgba(45, 122, 45, 0.45);
}

.btn-confirm:hover {
  filter: brightness(1.05);
  transform: translateY(-1px);
}

.btn-confirm:active {
  transform: none;
}

/* Destructive confirm flips the primary to the red family */
.modal-card.danger .btn-confirm {
  background: linear-gradient(135deg, var(--red-deep), var(--red));
  box-shadow: 0 4px 12px -4px rgba(183, 28, 28, 0.45);
}

.btn-ghost:focus-visible,
.btn-confirm:focus-visible,
.modal-close:focus-visible {
  outline: 2px solid var(--green-accent);
  outline-offset: 2px;
}

/* ─── ANIMATION ──────────────────────────────────────────── */
.pop-in {
  animation: pop-in 0.22s var(--sa-ease, ease);
}

@keyframes pop-in {
  from {
    opacity: 0;
    transform: scale(0.97) translateY(6px);
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
  .modal-card {
    max-width: 100%;
    border-radius: 16px;
  }

  .modal-header,
  .modal-body,
  .modal-actions {
    padding-left: 14px;
    padding-right: 14px;
  }

  /* Equal, full-width actions on small phones */
  .modal-actions button {
    flex: 1 1 0;
    min-width: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pop-in {
    animation: none;
  }

  .btn-confirm:hover {
    transform: none;
  }
}
</style>
