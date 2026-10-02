<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="selectedFood" class="modal-overlay" @click.self="emit('close')">
        <div class="modal-card">
          <div class="modal-drag-handle"></div>

          <button class="modal-close" @click="emit('close')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
              stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div class="detail-img-wrap">
            <img v-if="selectedFood.img_url" :src="selectedFood.img_url" :alt="selectedFood.name" />
            <span v-else class="detail-img-placeholder"><img class="detail-img" src="https://res.cloudinary.com/daji2ml3y/image/upload/v1789488500/no-image_c9olpk.jpg"></img></span>
            <div class="detail-img-gradient"></div>
          </div>

          <div class="detail-body">
            <div class="detail-header">
              <span class="detail-status" :class="selectedFood.status">
                <AppIcon name="check-circle" :size="14" />
                {{ selectedFood.status === "available" ? i18n.t.available : i18n.t.unavailable }}
              </span>
            </div>
            <h2 class="detail-name">{{ displayName }}</h2>
            <div class="detail-price">
              {{ currencyStore.fmt(selectedFood.price) }}
            </div>

            <button v-if="selectedFood.status === 'available'" class="add-cart-big"
              @click="emit('add-cart', selectedFood)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {{ i18n.t.add_to_cart }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from "vue";
import AppIcon from "@/components/AppIcon.vue";
import { useI18nStore } from "@/stores/i18n";

const props = defineProps(["selectedFood", "currencyStore", "getCategoryEmoji"]);
const emit = defineEmits(["close", "add-cart"]);

const i18n = useI18nStore();

// Dish title follows the page language (English when available, else Khmer).
const displayName = computed(() =>
  i18n.locale === "en"
    ? props.selectedFood?.name_en || props.selectedFood?.name
    : props.selectedFood?.name || props.selectedFood?.name_en,
);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--modal-overlay, rgba(0, 0, 0, .55));
  backdrop-filter: blur(2px);
  z-index: 200;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0;
}

@media (min-width: 560px) {
  .modal-overlay {
    align-items: center;
    padding: 20px;
  }
}

.modal-card {
  background: #fff;
  border-radius: 28px 28px 0 0;
  width: 100%;
  max-width: 480px;
  max-height: 92vh;
  overflow-y: auto;
  box-shadow: 0 -12px 48px rgba(0, 0, 0, 0.18);
  position: relative;
  animation: slideUp 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-drag-handle {
  position: sticky;
  top: 0;
  width: 40px;
  height: 4px;
  border-radius: 4px;
  background: #e5e7eb;
  margin: 12px auto 0;
}

@media (min-width: 560px) {
  .modal-drag-handle {
    display: none;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(40px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (min-width: 560px) {
  .modal-card {
    border-radius: 28px;
  }
}

.modal-close {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 10;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.32);
  color: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
  backdrop-filter: blur(4px);
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.5);
}

.detail-img-wrap {
  width: 100%;
  height: 380px;
  overflow: hidden;
  background: var(--green-pale);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

@media (max-width: 480px) {
  .detail-img-wrap {
    height: 260px;
  }
}

@media (max-width: 360px) {
  .detail-img-wrap {
    height: 200px;
  }
}

.detail-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-img-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 110px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.22), transparent);
  pointer-events: none;
}

.detail-img-placeholder {
  font-size: 80px;
}

.detail-img-placeholder .detail-img {
  max-width: 100%;
}

.detail-body {
  padding: 22px 22px 30px;
}

@media (max-width: 480px) {
  .detail-body {
    padding: 18px 18px 24px;
  }
}

.detail-header {
  margin-bottom: 10px;
}

.detail-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  padding: 5px 13px;
  border-radius: 20px;
  font-weight: 600;
}

.detail-status.available {
  background: var(--green-pale, #dcfce7);
  color: var(--green-dark, #166534);
}

.detail-status.unavailable {
  background: #fee2e2;
  color: #991b1b;
}

.detail-name {
  font-size: 25px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 4px;
  line-height: 1.3;
}

@media (max-width: 480px) {
  .detail-name {
    font-size: 21px;
  }
}

.detail-price {
  font-size: 25px;
  font-weight: 800;
  color: var(--green-strong, var(--green-mid));
  margin-bottom: 22px;
}

@media (max-width: 480px) {
  .detail-price {
    font-size: 21px;
    margin-bottom: 18px;
  }
}

.add-cart-big {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, var(--green-mid), var(--green-light));
  color: var(--on-primary, #fff);
  border: none;
  border-radius: 16px;
  font-size: 15px;
  font-family: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 8px 20px var(--glow-strong, rgba(22, 163, 74, 0.32));
}

.add-cart-big:hover {
  background: linear-gradient(135deg, var(--green-dark), var(--green-mid));
  transform: translateY(-2px);
  box-shadow: 0 10px 26px var(--glow-strong, rgba(22, 163, 74, 0.38));
}

.add-cart-big:active {
  transform: scale(0.98);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.22s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
