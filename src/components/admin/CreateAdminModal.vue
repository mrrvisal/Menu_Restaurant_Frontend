<!-- Create an owner (admin) or a super admin. The form owns its state and
     validation and emits a ready-to-send payload — the parent does the request
     and closes the dialog on success. -->
<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="modal-overlay" @click.self="emit('close')">
        <div class="modal-card pop-in" role="dialog" aria-modal="true">
          <div class="modal-header">
            <span class="modal-title">
              <AppIcon :name="isSuper ? 'shield' : 'users'" :size="16" /> {{ title }}
            </span>
            <button class="modal-close" :aria-label="i18n.t.close" @click="emit('close')">
              <AppIcon name="x" :size="18" />
            </button>
          </div>

          <form class="modal-form" @submit.prevent="submit">
            <div class="form-group">
              <label>{{ i18n.t.email }} *</label>
              <input v-model.trim="form.email" type="email" class="input" placeholder="admin@example.com" required />
            </div>

            <div class="form-group">
              <label>{{ i18n.t.full_name }} *</label>
              <input v-model.trim="form.fullName" type="text" class="input"
                :placeholder="isSuper ? 'Super Admin Name' : 'Admin Name'" required />
            </div>

            <div v-if="!isSuper" class="form-group">
              <label>{{ i18n.t.role }}</label>
              <AppSelect block size="sm" variant="teal" :model-value="form.role" :options="roleOptions"
                @update:model-value="form.role = $event" />
            </div>

            <div class="form-group">
              <label>
                {{ i18n.t.password }}
                <span class="label-hint">{{ passwordRequired ? "* (min 8 chars)" : "(optional)" }}</span>
              </label>
              <input v-model="form.password" type="password" class="input" placeholder="••••••••"
                :required="passwordRequired" :minlength="passwordRequired ? 8 : null" />
            </div>

            <div class="form-hint">{{ i18n.t.fill_required_fields }}</div>

            <div class="modal-actions">
              <button type="button" class="btn-ghost" @click="emit('close')">{{ i18n.t.cancel }}</button>
              <button type="submit" class="btn-teal" :disabled="loading">
                <AppIcon name="check" :size="14" /> {{ i18n.t.save }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, reactive, watch } from "vue";
import AppIcon from "@/components/AppIcon.vue";
import AppSelect from "@/components/AppSelect.vue";
import { useI18nStore } from "@/stores/i18n";

const props = defineProps({
  open: { type: Boolean, default: false },
  variant: { type: String, default: "owner" }, // owner | super-admin
  loading: { type: Boolean, default: false },
});
const emit = defineEmits(["close", "submit", "invalid"]);

const i18n = useI18nStore();
const form = reactive({ email: "", fullName: "", password: "", role: "owner" });

const isSuper = computed(() => props.variant === "super-admin");
const title = computed(() =>
  isSuper.value ? i18n.t.add_super_admin : i18n.t.add_admin,
);
const roleOptions = computed(() => [
  { value: "owner", label: i18n.t.owner },
  { value: "super_admin", label: i18n.t.super_admin_label },
]);
// A super admin always needs a password; an owner only when promoted to one.
const passwordRequired = computed(
  () => isSuper.value || form.role === "super_admin",
);

function reset() {
  form.email = "";
  form.fullName = "";
  form.password = "";
  form.role = "owner";
}

// Every open starts from a clean form (a cancelled attempt is not kept)
watch(
  () => props.open,
  (open) => {
    if (open) reset();
  },
);

function submit() {
  if (!form.email || !form.fullName) {
    return emit("invalid", i18n.t.fill_required_fields);
  }
  if (passwordRequired.value && form.password.length < 8) {
    return emit("invalid", i18n.t.password_min_length);
  }
  emit("submit", {
    email: form.email,
    fullName: form.fullName,
    password: form.password,
    role: isSuper.value ? "super_admin" : form.role,
  });
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.55);
}

.modal-card {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 22px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--surface-soft);
  border-bottom: 1px solid var(--border);
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: "Hanuman", serif;
  font-size: 15px;
  font-weight: 700;
  color: var(--ink);
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border: none;
  border-radius: 8px;
  background: none;
  color: var(--muted);
  cursor: pointer;
}

.modal-close:hover {
  background: var(--border);
  color: var(--text);
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.label-hint {
  text-transform: none;
  font-weight: 500;
  color: var(--muted-light);
}

.input {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  font-family: inherit;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
}

.input:focus {
  border-color: var(--teal);
}

.input::placeholder {
  color: var(--muted-light);
}

.form-hint {
  font-size: 11px;
  font-style: italic;
  color: var(--muted);
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

.modal-actions button {
  flex: 1;
  justify-content: center;
}

.btn-ghost,
.btn-teal {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  border: none;
  border-radius: 10px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-ghost {
  background: var(--surface-warm);
  color: var(--ink);
}

.btn-ghost:hover {
  background: #dcfce7;
}

.btn-teal {
  background: linear-gradient(135deg, #0f766e, #14b8a6);
  color: white;
  box-shadow: 0 4px 14px rgba(15, 118, 110, 0.3);
}

.btn-teal:hover:not(:disabled) {
  filter: brightness(1.05);
}

.btn-teal:disabled {
  background: #9ca3af;
  box-shadow: none;
  cursor: not-allowed;
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
  .modal-card {
    max-width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pop-in {
    animation: none;
  }
}
</style>
