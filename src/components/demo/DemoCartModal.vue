<template>
          <div class="modal-overlay" @click.self="$emit('close')">
            <div class="modal-card">
              <div class="modal-drag-handle"></div>
              <button class="modal-close" @click="$emit('close')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                  stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <div class="cart-body">
                <h2 class="cart-title">{{ i18n.t.demo_cart_title }}</h2>
                <div v-if="!cartItems.length" class="cart-empty">
                  <AppIcon name="cart" :size="42" />
                  <p>{{ i18n.t.demo_cart_empty }}</p>
                </div>
                <template v-else>
                  <div class="cart-list">
                    <div v-for="item in cartItems" :key="item.id" class="cart-row">
                      <div class="cart-row-img">
                        <img v-if="item.img" :src="item.img" :alt="item.name" />
                        <AppIcon v-else :name="item.icon || 'plate'" :size="32" />
                      </div>
                      <div class="cart-row-info">
                        <b>{{ item.name }}</b>
                        <span>{{ item.price.toLocaleString() }}៛</span>
                      </div>
                      <div class="cart-stepper">
                        <button @click="$emit('change', item.id, -1)" aria-label="minus">−</button>
                        <span>{{ item.qty }}</span>
                        <button @click="$emit('change', item.id, 1)" aria-label="plus">+</button>
                      </div>
                      <b class="cart-row-sub">{{ (item.price * item.qty).toLocaleString() }}៛</b>
                    </div>
                  </div>
                  <div class="cart-total-row">
                    <span>{{ i18n.t.total }}</span>
                    <b>{{ cartTotal.toLocaleString() }}៛</b>
                  </div>
                  <input :value="tableNo" @input="$emit('update:table-no', $event.target.value)" class="table-input"
                :placeholder="i18n.t.demo_table_ph" />
                  <div class="cart-actions">
                    <button class="ghost-btn" @click="$emit('clear')">{{ i18n.t.demo_clear }}</button>
                    <button class="add-cart-big" :disabled="placing" @click="$emit('place')">
                      <span v-if="placing" class="spinner"></span>
                      {{ placing ? i18n.t.demo_placing : i18n.t.demo_place_order }}
                    </button>
                  </div>
                </template>
              </div>
            </div>
          </div>
</template>

<script setup>
import { useI18nStore } from "@/stores/i18n";
import AppIcon from "@/components/AppIcon.vue";

const i18n = useI18nStore();

// Cart data + actions live in the parent (useDemoCart); the sheet itself
// is rendered here — v-if / Teleport / Transition stay in the view.
defineProps({
  cartItems: { type: Array, default: () => [] },
  cartTotal: { type: Number, default: 0 },
  placing: { type: Boolean, default: false },
  tableNo: { type: String, default: "" },
});
defineEmits(["close", "change", "clear", "place", "update:table-no"]);
</script>
<style scoped>
/* ============================================================
   DEMO CART MODAL (MenuView bottom-sheet body)
   ============================================================ */
.cart-body {
  padding: 20px 20px 26px;
}

@media (max-width: 480px) {
  .cart-body {
    padding: 16px 16px 22px;
  }
}

.cart-title {
  margin: 0 0 16px;
  font-size: 20px;
  font-weight: 800;
  color: var(--text-dark);
}

.cart-empty {
  text-align: center;
  padding: 34px 0 16px;
  color: var(--text-light);
  font-size: 13px;
  font-weight: 600;
}

.cart-empty svg {
  color: var(--green-light);
  display: block;
  margin: 0 auto 8px;
}

.cart-list {
  display: grid;
  gap: 10px;
  margin-bottom: 14px;
}

.cart-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 12px;
  background: var(--green-pale);
}

.cart-row-img {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--green-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.cart-row-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cart-row-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.cart-row-info b {
  font-size: 13px;
  color: var(--text-dark);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cart-row-info span {
  font-size: 11px;
  color: var(--text-light);
}

.cart-stepper {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  padding: 4px 8px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid var(--border-green);
}

.cart-stepper button {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: var(--green-pale);
  color: var(--green-mid);
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s, background 0.15s;
}

.cart-stepper button:hover {
  background: var(--green-soft);
  transform: scale(1.1);
}

.cart-stepper span {
  min-width: 18px;
  text-align: center;
  font-size: 13px;
  font-weight: 800;
  color: var(--text-dark);
}

.cart-row-sub {
  font-size: 13px;
  color: var(--green-dark);
  white-space: nowrap;
}

.table-input {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid var(--green-soft);
  border-radius: 12px;
  font-size: 14px;
  font-family: inherit;
  color: var(--text-dark);
  background: var(--green-pale);
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
}

.table-input:focus {
  border-color: var(--green-light);
  background: #fff;
  box-shadow: 0 0 0 4px var(--glow-soft, rgba(74, 222, 128, 0.14));
}

</style>
