<!-- Bottom sheet where a guest at a table calls the owner — either to get
     the bill or to ask for something extra — using only their table number. -->
<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
        <Transition name="slide-up" appear>
          <div class="call-card" v-if="show">
            <!-- HEADER -->
            <div class="modal-header">
              <span class="modal-header-title">
                <AppIcon name="bell" :size="18" /> {{ i18n.t.call_owner_title }}
              </span>
              <button class="close-btn" @click="$emit('close')">
                <AppIcon name="x" :size="16" />
              </button>
            </div>

            <p class="call-sub">{{ i18n.t.call_owner_sub }}</p>

            <!-- SUCCESS STATE -->
            <div v-if="sent" class="call-success">
              <div class="call-success-ring">
                <AppIcon name="check-circle" :size="40" />
              </div>
              <p class="call-success-title">{{ i18n.t.call_success }}</p>
              <p class="call-success-sub">{{ i18n.t.call_success_sub }}</p>
            </div>

            <template v-else>
              <!-- TWO REQUEST TYPES -->
              <div class="call-types">
                <button class="call-type" :class="{ active: type === 'bill' }" @click="type = 'bill'">
                  <span class="call-type-ico"><AppIcon name="money-bag" :size="20" /></span>
                  <span class="call-type-txt">
                    <span class="call-type-name">{{ i18n.t.call_bill }}</span>
                    <span class="call-type-desc">{{ i18n.t.call_bill_desc }}</span>
                  </span>
                </button>
                <button class="call-type" :class="{ active: type === 'extra' }" @click="type = 'extra'">
                  <span class="call-type-ico"><AppIcon name="hand" :size="20" /></span>
                  <span class="call-type-txt">
                    <span class="call-type-name">{{ i18n.t.call_extra }}</span>
                    <span class="call-type-desc">{{ i18n.t.call_extra_desc }}</span>
                  </span>
                </button>
              </div>

              <!-- Table number -->
              <div class="field-wrap">
                <label class="field-label">
                  <AppIcon name="table" :size="14" /> {{ i18n.t.table_no }}
                </label>
                <input v-model="tableNo" class="field-input" :placeholder="i18n.t.table_no" />
              </div>

              <!-- What do you need (optional free text) -->
              <div class="field-wrap">
                <label class="field-label">
                  <AppIcon name="note" :size="14" /> {{ i18n.t.call_message_label }}
                </label>
                <textarea v-model="message" class="field-textarea" rows="2" :placeholder="i18n.t.call_message_ph"></textarea>
              </div>

              <!-- FEEDBACK -->
              <Transition name="fade">
                <div v-if="feedback.error" class="tg-error">
                  <AppIcon name="x-circle" :size="14" /> {{ feedback.errorMsg }}
                </div>
              </Transition>

              <!-- SEND -->
              <button class="order-btn" :disabled="sending" @click="submitCall">
                <span v-if="sending" class="spinner">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                    stroke-linecap="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                </span>
                <AppIcon v-else name="bell" :size="17" />
                {{ sending ? i18n.t.call_sending : i18n.t.call_send }}
              </button>
            </template>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { useI18nStore } from "@/stores/i18n";
import AppIcon from "@/components/AppIcon.vue";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const props = defineProps({
  show: Boolean,
  tableFromQr: { type: Number, default: null },
  restaurantId: { type: Number, default: null },
});
const emit = defineEmits(["close"]);

const i18n = useI18nStore();

const type = ref("bill");
const tableNo = ref("");
const message = ref("");
const sending = ref(false);
const sent = ref(false);
const feedback = reactive({ error: false, errorMsg: "" });

function showError(msg) {
  feedback.error = true;
  feedback.errorMsg = msg;
  setTimeout(() => {
    feedback.error = false;
  }, 4000);
}

// Reset + auto-fill the table number from the QR code each time it opens
watch(
  () => props.show,
  (open) => {
    if (!open) return;
    type.value = "bill";
    message.value = "";
    sent.value = false;
    feedback.error = false;
    tableNo.value = props.tableFromQr ? String(props.tableFromQr) : "";
  },
);

async function submitCall() {
  if (!tableNo.value.trim()) {
    showError(i18n.t.table_number_required);
    return;
  }
  if (!type.value) {
    showError(i18n.t.call_type_required);
    return;
  }

  sending.value = true;
  try {
    const payload = {
      table_no: tableNo.value.trim(),
      type: type.value,
      message: message.value.trim(),
    };
    if (props.restaurantId) payload.restaurant_id = props.restaurantId;

    await axios.post(`${API_BASE_URL}/api/calls`, payload);
    sent.value = true;
    // Close on its own so the guest is not stuck staring at the sheet.
    setTimeout(() => emit("close"), 2200);
  } catch (err) {
    const msg = err?.response?.data?.error || i18n.t.generic_error;
    showError(msg);
  } finally {
    sending.value = false;
  }
}

</script>

<style scoped>
/* ============================================================
   Same bottom-sheet shell as CartModal so the menu feels cohesive
   ============================================================ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--modal-overlay, rgba(10, 40, 24, 0.55));
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
}

.call-card {
  width: 100%;
  max-width: 460px;
  background: #fff;
  border-radius: 20px;
  padding: 26px 30px 24px;
  box-shadow: 0 20px 50px rgba(10, 40, 24, 0.3);
  max-height: 92vh;
  overflow-y: auto;
}

@media (max-width: 480px) {
  .modal-overlay {
    align-items: flex-end;
    padding: 0;
  }

  .call-card {
    max-width: 100%;
    border-radius: 20px 20px 0 0;
    padding: 20px 20px calc(20px + env(safe-area-inset-bottom));
    animation: sheetUp 0.32s cubic-bezier(0.32, 1.1, 0.6, 1);
  }
}

@keyframes sheetUp {
  from {
    transform: translateY(40px);
    opacity: 0.6;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.modal-header-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--green-dark, #14532d);
  display: flex;
  align-items: center;
  gap: 8px;
}

.close-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f3f4f6;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: all 0.15s;
}

.close-btn:hover {
  background: #e5e7eb;
  color: #111827;
}

.call-sub {
  font-size: 12.5px;
  color: var(--text-light, #6b7280);
  margin-bottom: 18px;
}

/* ── The two request types ─────────────────────────────── */
.call-types {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 16px;
}

@media (max-width: 420px) {
  .call-types {
    grid-template-columns: 1fr;
  }
}

.call-type {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 13px 14px;
  border-radius: 14px;
  border: 1.5px solid var(--green-soft, #e8f5e9);
  background: var(--green-pale, #fafffe);
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: all 0.18s ease;
}

.call-type:hover {
  border-color: var(--green-light, #a7f3d0);
}

.call-type.active {
  border-color: var(--green-strong, #22c55e);
  background: #fff;
  box-shadow: 0 0 0 4px var(--glow-soft, rgba(34, 197, 94, 0.14));
}

.call-type-ico {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  color: var(--green-strong, #22c55e);
}

.call-type-txt {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.call-type-name {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--green-dark, #14532d);
}

.call-type-desc {
  font-size: 11.5px;
  color: var(--text-light, #6b7280);
  line-height: 1.4;
}

/* ── Fields ─────────────────────────────────────────────── */
.field-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.field-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--green-dark, #14532d);
  display: flex;
  align-items: center;
  gap: 6px;
}

.field-input {
  padding: 11px 14px;
  border: 1.5px solid var(--green-soft, #e8f5e9);
  border-radius: 12px;
  font-size: 13.5px;
  font-family: inherit;
  background: var(--green-pale, #f0fdf4);
  color: #1b3a2d;
  outline: none;
  transition: border 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.field-input:focus {
  border-color: var(--green-strong, #22c55e);
  box-shadow: 0 0 0 4px var(--glow-soft, transparent);
}

.field-textarea {
  width: 100%;
  padding: 9px 14px;
  border: 1.5px solid var(--green-soft, #e8f5e9);
  border-radius: 12px;
  font-size: 13px;
  font-family: inherit;
  resize: none;
  outline: none;
  color: #1b3a2d;
  background: var(--green-pale, #fafffe);
  transition: border 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.field-textarea:focus {
  border-color: var(--green-strong, #a7f3d0);
  box-shadow: 0 0 0 4px var(--glow-soft, transparent);
}

/* ── Feedback ───────────────────────────────────────────── */
.tg-error {
  display: flex;
  align-items: center;
  gap: 7px;
  background: #fef2f2;
  color: #b91c1c;
  font-size: 12.5px;
  font-weight: 600;
  padding: 9px 13px;
  border-radius: 10px;
  border: 1px solid #fecaca;
  margin-bottom: 13px;
}

/* ── Send button (same pill as CartModal's order button) ─── */
.order-btn {
  width: 100%;
  padding: 12px 16px;
  background: linear-gradient(135deg, var(--primary, #0f766e) 0%, var(--primary-light, #22c55e) 100%);
  color: var(--on-primary, #fff);
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-family: "Hanuman", serif;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  box-shadow: 0 4px 14px var(--glow-strong, rgba(15, 118, 110, 0.35));
}

.order-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px var(--glow-strong, rgba(15, 118, 110, 0.4));
}

.order-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.spinner {
  display: inline-flex;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ── Success state ──────────────────────────────────────── */
.call-success {
  text-align: center;
  padding: 22px 10px 14px;
}

.call-success-ring {
  width: 76px;
  height: 76px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: var(--green-pale, #f0fdf4);
  color: var(--green-strong, #22c55e);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: popIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes popIn {
  from {
    transform: scale(0.5);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

.call-success-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--green-dark, #14532d);
  margin-bottom: 5px;
}

.call-success-sub {
  font-size: 13px;
  color: var(--text-light, #6b7280);
}

/* ── Transitions (same as CartModal) ────────────────────── */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active {
  transition: transform 0.32s cubic-bezier(0.32, 1.1, 0.6, 1), opacity 0.25s;
}

.slide-up-leave-active {
  transition: transform 0.22s ease, opacity 0.2s;
}

.slide-up-enter-from {
  transform: translateY(60px);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(30px);
  opacity: 0;
}
</style>
