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
              <div class="detail-img-wrap">
                <img v-if="selectedFood.img_url" :src="selectedFood.img_url" :alt="selectedFood.name" />
                <span v-else class="detail-img-placeholder">
                  <AppIcon :name="selectedFood.icon || 'plate'" :size="36" />
                </span>
                <div class="detail-img-gradient"></div>
              </div>
              <div class="detail-body">
                <div class="detail-header">
                  <span class="detail-status" :class="selectedFood.status">
                    <AppIcon name="check-circle" :size="14" />
                    {{ selectedFood.status === "available" ? " មាន" : " អស់" }}
                  </span>
                </div>
                <h2 class="detail-name">{{ selectedFood.name }}</h2>
                <div class="detail-price">{{ Number(selectedFood.price).toFixed(0) }}៛</div>
                <button class="add-cart-big" @click="$emit('add', selectedFood)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                    stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  {{ i18n.t.add }}
                </button>
              </div>
            </div>
          </div>
</template>

<script setup>
import { useI18nStore } from "@/stores/i18n";
import AppIcon from "@/components/AppIcon.vue";

const i18n = useI18nStore();

// The parent decides which food is open (v-if) and clears it on close/add.
defineProps({ selectedFood: { type: Object, default: null } });
defineEmits(["close", "add"]);
</script>
<style scoped>
/* FOOD DETAIL (MenuView) */
.detail-img-wrap {
  width: 100%;
  height: 300px;
  overflow: hidden;
  background: var(--green-pale);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

@media (max-width: 480px) {
  .detail-img-wrap {
    height: 240px;
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
  margin: 0 0 4px;
  line-height: 1.3;
}

@media (max-width: 480px) {
  .detail-name {
    font-size: 21px;
  }
}

.detail-sub {
  margin: 0;
  font-size: 13px;
  color: var(--text-light);
}

.detail-price {
  font-size: 25px;
  font-weight: 800;
  color: var(--green-strong, var(--green-mid));
  margin: 6px 0 22px;
}

@media (max-width: 480px) {
  .detail-price {
    font-size: 21px;
    margin-bottom: 18px;
  }
}

</style>
