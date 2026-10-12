<!-- Create an owner (admin) or a super admin. The form owns its state and
     validation and emits a ready-to-send payload — the parent does the request
     and closes the dialog on success. -->
<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="modal-overlay" @click.self="!loading && emit('close')">
        <div ref="card" class="modal-card pop-in" role="dialog" aria-modal="true"
          aria-labelledby="sa-cam-title" tabindex="-1">
          <div class="modal-header">
            <span class="modal-title" id="sa-cam-title">
              <span class="modal-title-icon" aria-hidden="true">
                <AppIcon :name="isSuper ? 'shield' : 'users'" :size="15" />
              </span>
              {{ title }}
            </span>
            <button type="button" class="modal-close" :aria-label="i18n.t.close" :disabled="loading"
              @click="emit('close')">
              <AppIcon name="x" :size="18" />
            </button>
          </div>

          <!-- novalidate: native bubbles are English-only. Validation is shown
               inline under each field (see emailError / nameError / passwordError)
               and on submit, so no toast is needed. -->
          <form class="modal-form" novalidate @submit.prevent="submit">
            <div class="form-group">
              <label for="sa-cam-email">{{ i18n.t.email }} *</label>
              <input id="sa-cam-email" v-model.trim="form.email" type="email" class="input"
                :class="{ 'is-invalid': emailError }" placeholder="admin@example.com" required autocomplete="email"
                :aria-invalid="emailError ? 'true' : undefined"
                :aria-describedby="emailError ? 'sa-cam-email-err' : undefined" @blur="touched.email = true" />
              <p v-if="emailError" id="sa-cam-email-err" class="field-error">{{ emailError }}</p>
            </div>

            <div class="form-group">
              <label for="sa-cam-name">{{ i18n.t.full_name }} *</label>
              <input id="sa-cam-name" v-model.trim="form.fullName" type="text" class="input"
                :class="{ 'is-invalid': nameError }" :placeholder="isSuper ? 'Super Admin Name' : 'Admin Name'"
                required autocomplete="name" :aria-invalid="nameError ? 'true' : undefined"
                :aria-describedby="nameError ? 'sa-cam-name-err' : undefined" @blur="touched.fullName = true" />
              <p v-if="nameError" id="sa-cam-name-err" class="field-error">{{ nameError }}</p>
            </div>

            <div v-if="!isSuper" class="form-group">
              <label>{{ i18n.t.role }}</label>
              <AppSelect block size="sm" variant="teal" :model-value="form.role" :options="roleOptions"
                @update:model-value="form.role = $event" />
            </div>

            <div class="form-group">
              <label for="sa-cam-password">
                {{ i18n.t.password }}<span v-if="passwordRequired"> *</span>
              </label>
              <div class="pw-wrap">
                <input id="sa-cam-password" v-model="form.password" :type="showPassword ? 'text' : 'password'" class="input"
                  :class="{ 'is-invalid': passwordError }" placeholder="••••••••" :required="passwordRequired"
                  :minlength="passwordRequired ? 8 : null" autocomplete="new-password"
                  :aria-invalid="passwordError ? 'true' : undefined"
                  :aria-describedby="passwordError ? 'sa-cam-password-err' : undefined" @blur="touched.password = true" />
                <button type="button" class="pw-toggle" :aria-label="showPassword ? i18n.t.hide_password : i18n.t.show_password"
                  :aria-pressed="showPassword" :title="showPassword ? i18n.t.hide_password : i18n.t.show_password"
                  @click="showPassword = !showPassword">
                  <AppIcon :name="showPassword ? 'eye-off' : 'eye'" :size="16" />
                </button>
              </div>
              <p v-if="passwordRequired" class="field-hint">{{ i18n.t.password_min_length }}</p>
              <p v-if="passwordError" id="sa-cam-password-err" class="field-error">{{ passwordError }}</p>
            </div>

            <div class="form-hint">{{ i18n.t.fill_required_fields }}</div>

            <div class="modal-actions">
              <button type="button" class="btn-ghost" :disabled="loading" @click="emit('close')">
                {{ i18n.t.cancel }}
              </button>
              <button type="submit" class="btn-teal" :disabled="loading">
                <span v-if="loading" class="spinner" aria-hidden="true"></span>
                <AppIcon v-else name="check" :size="14" /> {{ i18n.t.save }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from "vue";
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
const card = ref(null); // dialog element — focus-trap target
const showPassword = ref(false); // toggles the eye on the password field

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

// Inline validation: a field only shows its error once the user has left it
// (blur), then updates live as they type. Everything is marked touched on a
// submit attempt so nothing submits while invalid — no toast needed.
const touched = reactive({ email: false, fullName: false, password: false });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const emailError = computed(() => {
  if (!touched.email) return "";
  if (!form.email.trim()) return i18n.t.fill_required_fields;
  if (!EMAIL_RE.test(form.email.trim())) return i18n.t.validation_email_invalid;
  return "";
});
const nameError = computed(() => {
  if (!touched.fullName) return "";
  return form.fullName.trim() ? "" : i18n.t.fill_required_fields;
});
const passwordError = computed(() => {
  if (!touched.password) return "";
  if (passwordRequired.value && form.password.length < 8) {
    return i18n.t.password_min_length;
  }
  return "";
});

function reset() {
  form.email = "";
  form.fullName = "";
  form.password = "";
  form.role = "owner";
  showPassword.value = false; // never reopen with the password already revealed
  touched.email = false;
  touched.fullName = false;
  touched.password = false;
}

// Every open starts from a clean form (a cancelled attempt is not kept),
// moves focus into the dialog and locks the page scroll behind it.
let lastFocused = null;
let prevOverflow = null;

watch(
  () => props.open,
  async (open) => {
    if (open) {
      reset();
      lastFocused = document.activeElement;
      prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      await nextTick();
      card.value?.querySelector("input")?.focus();
    } else {
      document.body.style.overflow = prevOverflow ?? "";
      prevOverflow = null;
      lastFocused?.focus?.();
      lastFocused = null;
    }
  },
);

// Escape closes and Tab cycles inside the dialog. The listener is global because
// the card is teleported to <body>; the guard makes it a no-op when shut.
function onKeydown(e) {
  if (!props.open) return;
  if (e.key === "Escape") {
    if (props.loading) return;
    e.preventDefault();
    emit("close");
    return;
  }
  if (e.key !== "Tab" || !card.value) return;
  const nodes = Array.from(
    card.value.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
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

// The form is novalidate, so native English-only bubbles never appear. On submit
// every field is marked touched (so all inline errors surface at once) and, if
// anything is invalid, focus moves to the first offender and the emit is skipped.
// Nothing is emitted to the parent on failure — validation is fully inline.
function submit() {
  touched.email = true;
  touched.fullName = true;
  touched.password = true;

  const firstInvalid =
    emailError.value ? "#sa-cam-email"
      : nameError.value ? "#sa-cam-name"
        : passwordError.value ? "#sa-cam-password"
          : null;
  if (firstInvalid) {
    card.value?.querySelector(firstInvalid)?.focus();
    return;
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
  padding: 20px;
  overflow-y: auto;
  overscroll-behavior: contain;
  /* Neutral scrim + soft blur lets the console recede behind the dialog. */
  background: rgba(17, 24, 20, 0.5);
  -webkit-backdrop-filter: blur(6px) saturate(110%);
  backdrop-filter: blur(6px) saturate(110%);
}

.modal-card {
  width: 100%;
  max-width: 420px;
  /* margin:auto (not flex centering) keeps a tall dialog reachable on small screens. */
  margin: auto;
  background: var(--surface);
  border: 1px solid var(--sa-line, var(--border));
  border-radius: 18px;
  box-shadow: var(--sa-elev-floating, 0 20px 60px rgba(0, 0, 0, 0.15));
  overflow: hidden;
  outline: none;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 15px 18px;
  background: linear-gradient(180deg, var(--surface-soft), var(--surface));
  border-bottom: 1px solid var(--sa-line, var(--border));
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: "Hanuman", serif;
  font-size: 15.5px;
  font-weight: 700;
  color: var(--ink);
}

/* Small tinted chip keeps the icon readable without a heavy header block. */
.modal-title-icon {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  flex: none;
  border-radius: 9px;
  background: rgba(15, 118, 110, 0.1);
  color: var(--teal);
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: none;
  border-radius: 9px;
  background: none;
  color: var(--muted);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.modal-close:hover:not(:disabled) {
  background: rgba(20, 60, 30, 0.07);
  color: var(--ink);
}

.modal-close:disabled {
  opacity: 0.5;
  cursor: default;
}

.modal-close:focus-visible {
  outline: 2px solid var(--green-accent);
  outline-offset: 2px;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* Sentence case instead of uppercase: uppercase is a no-op for Khmer and
   letter-spacing only separates its stacked diacritics. */
.form-group label {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text);
}

.field-hint {
  font-size: 11.5px;
  color: var(--muted);
}

/* Inline validation message under a field (bilingual, replaces the toast) */
.field-error {
  font-size: 11.5px;
  color: var(--red-deep);
}

/* Red hairline + halo so the invalid state matches the soft-focus treatment */
.input.is-invalid {
  border-color: var(--red);
}

.input.is-invalid:focus {
  border-color: var(--red);
  box-shadow: 0 0 0 3px rgba(198, 40, 40, 0.13);
}

/* Password field + eye toggle share one row; the button sits inside the input. */
.pw-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.pw-wrap .input {
  padding-right: 42px; /* room for the eye button so text never slides under it */
}

.pw-toggle {
  position: absolute;
  right: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.pw-toggle:hover {
  background: var(--surface-warm);
  color: var(--teal);
}

.pw-toggle:focus-visible {
  outline: 2px solid var(--green-accent);
  outline-offset: 2px;
}

.input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  font-family: inherit;
  font-size: 14px;
  color: var(--text);
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.input:hover {
  border-color: #cbd5e1;
}

.input:focus {
  border-color: var(--teal);
  /* Soft halo instead of jumping the border weight — keeps the hairline look. */
  box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.13);
}

.input::placeholder {
  color: var(--muted-light);
}

.form-hint {
  padding: 8px 10px;
  border: 1px dashed var(--border);
  border-radius: 9px;
  background: var(--surface-warm);
  font-size: 11.5px;
  color: var(--muted);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 14px;
  border-top: 1px solid var(--sa-line, var(--border));
}

.modal-actions button {
  min-width: 108px;
}

.btn-ghost,
.btn-teal {
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

/* Secondary = white + hairline (Stripe/Linear style) instead of a tinted block. */
.btn-ghost {
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
}

.btn-ghost:hover:not(:disabled) {
  background: var(--surface-warm);
  border-color: #cbd5e1;
}

.btn-teal {
  border: 1px solid transparent;
  background: linear-gradient(135deg, #0f766e, #14b8a6);
  color: white;
  box-shadow: 0 4px 12px -4px rgba(15, 118, 110, 0.45);
}

.btn-teal:hover:not(:disabled) {
  filter: brightness(1.05);
  transform: translateY(-1px);
}

.btn-teal:active:not(:disabled) {
  transform: none;
}

.btn-ghost:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-teal:disabled {
  background: #9ca3af;
  box-shadow: none;
  cursor: not-allowed;
}

.btn-ghost:focus-visible,
.btn-teal:focus-visible {
  outline: 2px solid var(--green-accent);
  outline-offset: 2px;
}

/* Loading spinner — same pattern as AdminCallsSection */
.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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

  .btn-teal:hover:not(:disabled) {
    transform: none;
  }
}
</style>
