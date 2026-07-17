<!-- frontend/src/components/CartModal.vue -->
<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
        <Transition name="slide-up" appear>
          <div class="cart-modal-card" v-if="show">
            <!-- HEADER -->
            <div class="modal-header">
              <span class="modal-header-title"><AppIcon name="clipboard" :size="18" /> តារាងការបញ្ជាទិញ</span>
              <button class="close-btn" @click="$emit('close')">✕</button>
            </div>

            <!-- EMPTY STATE -->
            <div v-if="!cart.count" class="cart-empty">
              <div class="empty-icon"><AppIcon name="clipboard" :size="48" /></div>
              <p>មិនមានទំនិញក្នុងកញ្ចប់</p>
            </div>

            <!-- CART ITEMS -->
            <div v-else class="cart-list">
              <TransitionGroup name="item" tag="div">
                <div
                  v-for="(item, foodId) in cart.items"
                  :key="foodId"
                  class="cart-item"
                >
                  <div class="item-img">
                    <img :src="item.img || 'https://res.cloudinary.com/daji2ml3y/image/upload/v1783260526/error-image-icon_194117-662_kppjnq.avif'" :alt="item.name" />
                  </div>
                  <div class="item-info">
                    <div class="item-name">{{ item.name }}</div>
                    <div class="item-price">
                      {{ Number(item.price).toFixed(0) }}៛
                    </div>
                  </div>
                  <div class="item-controls">
                    <button class="qty-btn" @click="cart.change(foodId, -1)">
                      −
                    </button>
                    <span class="qty-val">{{ item.qty }}</span>
                    <button class="qty-btn" @click="cart.change(foodId, +1)">
                      +
                    </button>
                  </div>
                  <div class="item-subtotal">
                    {{ (item.price * item.qty).toFixed(0) }}៛
                  </div>
                </div>
              </TransitionGroup>
            </div>

            <!-- FOOTER -->
            <div v-if="cart.count" class="cart-footer">
              <!-- Feedback -->
              <Transition name="fade">
                <div v-if="feedback.success" class="tg-success">
                  <AppIcon name="check-circle" :size="14" /> បញ្ជាទិញបានជោគជ័យ!
                </div>
              </Transition>
              <Transition name="fade">
                <div v-if="feedback.error" class="tg-error">
                  <AppIcon name="x-circle" :size="14" /> {{ feedback.errorMsg }}
                </div>
              </Transition>

              <!-- Summary -->
              <div class="cart-summary">
                <span class="cart-total-label">សរុប</span>
                <span class="cart-total-amt">{{ cart.total.toFixed(0) }}៛</span>
              </div>

              <!-- Table Number -->
              <div class="field-wrap">
                <input
                  v-model="tableNo"
                  class="field-input"
                  placeholder="លេខតុ (ចាំបាច់)"
                />
              </div>

              <!-- Note -->
              <div class="field-wrap">
                <span class="field-label"><AppIcon name="note" :size="14" /> កំណត់ចំណាំ (optional)</span>
                <textarea
                  v-model="note"
                  class="field-textarea"
                  rows="2"
                  placeholder="ឧ: មិនហូបខ្ទឹម, ហឹរតិច..."
                ></textarea>
              </div>

              <!-- Actions -->
              <div class="cart-actions">
                <button class="clear-btn" @click="cart.clear()">
                  <AppIcon name="trash" :size="14" /> លុបរាល់
                </button>
                <button
                  class="order-btn"
                  :disabled="sending"
                  @click="submitOrder"
                >
                  <span v-if="sending" class="spinner">⏳</span>
                  <svg
                    v-else
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                  {{ sending ? "កំពុងបញ្ជូន..." : "បញ្ជាទិញ" }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { useCartStore } from "@/stores/cart";
import AppIcon from "@/components/AppIcon.vue";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const props = defineProps({
  show: Boolean,
  tableFromQr: { type: Number, default: null },
  restaurantId: { type: Number, default: null },
});
defineEmits(["close"]);

const cart = useCartStore();

const tableNo = ref("");
const note = ref("");

// Auto-fill table number from QR code when modal opens
watch(
  () => props.show,
  (newVal) => {
    if (newVal && props.tableFromQr) {
      tableNo.value = String(props.tableFromQr);
    }
  }
);
const sending = ref(false);
const feedback = reactive({ success: false, error: false, errorMsg: "" });

function getCategoryEmoji(category) {
  const emojis = {
    "made-to-order": "🍽️",
    "ready-cooked": "🍱",
    dessert: "🍰",
  };
  return emojis[category] || "🍽️";
}

function showFeedback(type, msg = "") {
  feedback.success = type === "success";
  feedback.error = type === "error";
  feedback.errorMsg = msg;
  setTimeout(() => {
    feedback.success = false;
    feedback.error = false;
  }, 3500);
}

async function submitOrder() {
  if (!tableNo.value.trim()) {
    showFeedback("error", "⚠️ សូមបញ្ចូលលេខតុជាមុន");
    return;
  }
  sending.value = true;
  try {
    // Build order payload with restaurant context
    const orderItems = Object.values(cart.items).map((v) => ({
      name: v.name,
      price: v.price,
      qty: v.qty,
    }));

    const payload = {
      table_no: tableNo.value.trim(),
      note: note.value.trim(),
      items: orderItems,
    };

    // Include restaurant_id if available (for public ordering)
    if (props.restaurantId) {
      payload.restaurant_id = props.restaurantId;
    }

    await axios.post(`${API_BASE_URL}/api/orders`, payload);
    cart.clear();
    tableNo.value = "";
    note.value = "";
    showFeedback("success");
  } catch (err) {
    const msg = err?.response?.data?.message || "មានបញ្ហា សូមព្យាយាមម្ដងទៀត";
    showFeedback("error", msg);
  } finally {
    sending.value = false;
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 300;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
@media (min-width: 600px) {
  .modal-overlay {
    align-items: center;
    padding: 20px;
  }
}

.cart-modal-card {
  background: #fff;
  border-radius: 22px 22px 0 0;
  width: 100%;
  max-width: 520px;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.18);
  overflow: hidden;
}
@media (max-width: 480px) {
  .cart-modal-card {
    max-height: 96vh;
  }
}
@media (min-width: 600px) {
  .cart-modal-card {
    border-radius: 22px;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 18px 14px;
  border-bottom: 1.5px solid #e8f5e9;
  flex-shrink: 0;
}
@media (max-width: 480px) {
  .modal-header {
    padding: 14px 14px 12px;
  }
  .modal-header-title {
    font-size: 15px;
  }
}
.modal-header-title {
  font-family: "Hanuman", serif;
  font-size: 17px;
  font-weight: 700;
  color: #0f766e;
}
.close-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #f1f8f4;
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: 700;
  color: #0f766e;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.close-btn:hover {
  background: #dcfce7;
}

.cart-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
  color: #9e9e9e;
}
.cart-empty .empty-icon {
  font-size: 54px;
  margin-bottom: 12px;
}
.cart-empty p {
  font-size: 15px;
  font-family: "Hanuman", serif;
}

.cart-list {
  flex: 1;
  overflow-y: auto;
  padding: 6px 0;
  scrollbar-width: thin;
  scrollbar-color: #a7f3d0 transparent;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-bottom: 1px solid #f1f8f4;
  transition: background 0.15s;
}
@media (max-width: 480px) {
  .cart-item {
    gap: 8px;
    padding: 8px 12px;
  }
}
.cart-item:last-child {
  border-bottom: none;
}
.cart-item:hover {
  background: #f9fffe;
}

.item-img {
  width: 46px;
  height: 46px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f1f8f4;
  display: flex;
  align-items: center;
  justify-content: center;
}
.item-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.item-emoji {
  font-size: 26px;
  line-height: 1;
}

.item-info {
  flex: 1;
  min-width: 0;
}
.item-name {
  font-family: "Hanuman", serif;
  font-size: 13.5px;
  font-weight: 600;
  color: #1b3a2d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item-price {
  font-size: 12px;
  color: #16a34a;
  font-weight: 600;
  margin-top: 2px;
}

.item-controls {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.qty-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #dcfce7;
  border: none;
  cursor: pointer;
  font-size: 17px;
  font-weight: 700;
  color: #0f766e;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, transform 0.1s;
  line-height: 1;
}
.qty-btn:hover {
  background: #bbf7d0;
}
.qty-btn:active {
  transform: scale(0.88);
}
.qty-val {
  min-width: 22px;
  text-align: center;
  font-weight: 700;
  font-size: 14px;
  color: #1b3a2d;
}

.item-subtotal {
  font-size: 13px;
  font-weight: 700;
  color: #0f766e;
  min-width: 50px;
  text-align: right;
  flex-shrink: 0;
}
@media (max-width: 480px) {
  .item-subtotal {
    min-width: 40px;
    font-size: 11px;
  }
}

.cart-footer {
  border-top: 2px solid #e8f5e9;
  padding: 14px 16px 18px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
@media (max-width: 480px) {
  .cart-footer {
    padding: 12px 12px 16px;
    gap: 8px;
  }
}

.tg-success {
  background: #dcfce7;
  color: #15803d;
  border: 1px solid #a7f3d0;
  border-radius: 10px;
  padding: 9px 14px;
  font-size: 13px;
  font-weight: 600;
  font-family: "Hanuman", serif;
}
.tg-error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 10px;
  padding: 9px 14px;
  font-size: 13px;
  font-weight: 600;
  font-family: "Hanuman", serif;
}

.cart-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
@media (max-width: 480px) {
  .cart-total-amt {
    font-size: 18px;
  }
}
.cart-total-label {
  font-family: "Hanuman", serif;
  font-size: 15px;
  color: #555;
  font-weight: 600;
}
.cart-total-amt {
  font-size: 22px;
  font-weight: 800;
  color: #0f766e;
}

.field-wrap {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.field-label {
  font-size: 12px;
  color: #888;
  font-weight: 600;
}

.field-input {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #a7f3d0;
  border-radius: 12px;
  font-size: 13.5px;
  font-family: inherit;
  background: #f0fdf4;
  color: #1b3a2d;
  outline: none;
  transition: border 0.2s;
  box-sizing: border-box;
}
.field-input:focus {
  border-color: #22c55e;
}

.field-textarea {
  width: 100%;
  padding: 9px 14px;
  border: 1.5px solid #e8f5e9;
  border-radius: 12px;
  font-size: 13px;
  font-family: inherit;
  resize: none;
  outline: none;
  color: #1b3a2d;
  background: #fafffe;
  transition: border 0.2s;
  box-sizing: border-box;
}
.field-textarea:focus {
  border-color: #a7f3d0;
}

.cart-actions {
  display: flex;
  gap: 10px;
}
@media (max-width: 480px) {
  .cart-actions {
    flex-direction: column;
    gap: 8px;
  }
  .clear-btn {
    width: 100%;
    justify-content: center;
  }
}

.clear-btn {
  flex-shrink: 0;
  padding: 12px 14px;
  background: #fef2f2;
  color: #ef4444;
  border: 1.5px solid #fecaca;
  border-radius: 12px;
  font-size: 13px;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.clear-btn:hover {
  background: #fee2e2;
}

.order-btn {
  flex: 1;
  padding: 12px 16px;
  background: linear-gradient(135deg, #0f766e 0%, #22c55e 100%);
  color: white;
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
  box-shadow: 0 4px 14px rgba(15, 118, 110, 0.35);
}
.order-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #0d6761 0%, #16a34a 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(15, 118, 110, 0.4);
}
.order-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.spinner {
  display: inline-block;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Transitions */
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

.item-enter-active {
  transition: all 0.22s ease;
}
.item-leave-active {
  transition: all 0.18s ease;
}
.item-enter-from {
  opacity: 0;
  transform: translateX(-14px);
}
.item-leave-to {
  opacity: 0;
  transform: translateX(14px);
}
</style>