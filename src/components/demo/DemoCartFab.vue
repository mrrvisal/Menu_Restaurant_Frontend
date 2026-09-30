<template>
        <button class="cart-fab" @click="$emit('open')">
          <div class="cart-fab-images">
            <div v-for="(item, index) in cartPreviewItems" :key="item.id" class="cart-fab-img"
              :style="{ zIndex: cartPreviewItems.length - index, marginLeft: index > 0 ? '-10px' : '0' }">
              <img v-if="item.img" :src="item.img" :alt="item.name" />
              <AppIcon v-else :name="item.icon || 'plate'" :size="34" />
            </div>
          </div>
          <span class="cart-fab-label">
            <span class="cart-fab-badge">{{ cartCount }}</span>
            <span class="cart-fab-total">{{ cartTotal.toFixed(0) }}៛</span>
          </span>
        </button>
</template>

<script setup>
import AppIcon from "@/components/AppIcon.vue";

// Visibility (count > 0 && !cartOpen && !lastOrder) is decided in the parent.
defineProps({
  cartCount: { type: Number, default: 0 },
  cartTotal: { type: Number, default: 0 },
  cartPreviewItems: { type: Array, default: () => [] },
});
defineEmits(["open"]);
</script>
<style scoped>
/* CART FAB — MenuView stacked-image pill */
.cart-fab {
  position: fixed;
  bottom: 26px;
  left: 16px;
  background: linear-gradient(135deg, var(--green-mid), var(--green-light));
  color: var(--on-primary, #fff);
  border: none;
  border-radius: 50px;
  padding: 7px 20px 7px 7px;
  font-size: 14px;
  font-family: inherit;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 100;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@media (max-width: 480px) {
  .cart-fab {
    bottom: 18px;
    left: 12px;
    padding: 6px 14px 6px 6px;
    font-size: 12px;
    gap: 8px;
  }

  .cart-fab-img {
    width: 28px;
    height: 28px;
  }

  .cart-fab-badge {
    width: 18px;
    height: 18px;
    font-size: 10px;
  }

  .cart-fab-total {
    font-size: 11px;
  }
}

.cart-fab:hover {
  transform: translateY(-4px) scale(1.02);
}

.cart-fab:active {
  transform: scale(0.97);
}

.cart-fab-images {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.cart-fab-img {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.5);
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.cart-fab-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cart-fab-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cart-fab-badge {
  background: #fff;
  color: var(--green-strong, var(--green-mid));
  border-radius: 50%;
  width: 22px;
  height: 22px;
  font-size: 11px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cart-fab-total {
  font-size: 13px;
}

.fab-pop-enter-active {
  animation: fabIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fab-pop-leave-active {
  animation: fabIn 0.18s reverse ease-in;
}

@keyframes fabIn {
  from {
    transform: translateY(18px) scale(0.85);
    opacity: 0;
  }

  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

</style>
