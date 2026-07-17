<!-- frontend/src/components/FoodCard.vue -->
<template>
  <div class="food-card" @click="$emit('detail', food)">
    <!-- Admin delete button -->
    <button v-if="isAdmin" class="card-delete-btn" @click.stop="$emit('delete', food)">✕</button>

    <!-- Image -->
    <div class="food-card-img">
      <img v-if="food.img_url" :src="food.img_url" :alt="food.name" @error="imgError = true" />
      <span v-if="!food.img_url || imgError" class="img-fallback"><AppIcon name="food" :size="48" /></span>
      <div v-if="food.status === 'unavailable'" class="unavail-overlay">
        <span class="unavail-tag"><AppIcon name="x-circle" :size="12" /> អស់</span>
      </div>
    </div>

    <!-- Body -->
    <div class="food-card-body">
      <div class="food-card-name">{{ food.name }}</div>
      <div class="food-card-footer">
        <span class="food-card-price">{{ Number(food.price).toFixed(0) }}៛</span>

        <!-- Admin: status toggle -->
        <button v-if="isAdmin"
          class="status-toggle-btn"
          :class="food.status"
          @click.stop="$emit('toggle-status', food.id)">
          <AppIcon name="check-circle" :size="12" /> {{ food.status === 'available' ? 'មាន' : 'អស់' }}
        </button>

        <!-- Guest: add to cart -->
        <template v-else>
          <button v-if="food.status === 'unavailable'" class="add-cart-btn unavail" disabled><AppIcon name="x-circle" :size="14" /> អស់</button>
          <button v-else class="add-cart-btn" @click.stop="$emit('add-cart', food)">
            {{ cartQty > 0 ? `🛒 (${cartQty})` : '+ ដាក់' }}
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AppIcon from "@/components/AppIcon.vue";

const props = defineProps({
  food:     { type: Object,  required: true },
  isAdmin:  { type: Boolean, default: false },
  cartQty:  { type: Number,  default: 0 },
});

defineEmits(['detail', 'delete', 'toggle-status', 'add-cart']);

const imgError = ref(false);

function getCategoryEmoji(category) {
  return 'food';
}
</script>

<style scoped>
.food-card {
  background: var(--white);
  border-radius: var(--radius-card);
  overflow: hidden;
  box-shadow: 0 2px 10px var(--shadow);
  border: 1px solid var(--green-soft);
  cursor: pointer;
  transition: transform .15s, box-shadow .15s;
  display: flex;
  flex-direction: column;
  position: relative;
}
.food-card:hover { transform: translateY(-3px); box-shadow: 0 6px 20px var(--shadow); }

.food-card-img {
  width: 100%;
  aspect-ratio: 1/1;
  background: var(--green-pale);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}
.food-card-img img { width: 100%; height: 100%; object-fit: cover; }
.img-fallback { font-size: 50px; }

.unavail-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,.34);
  display: flex; align-items: center; justify-content: center;
}
.unavail-tag {
  background: #c62828; color: #fff;
  font-size: 10px; font-weight: 700;
  padding: 3px 10px; border-radius: 20px;
}

.food-card-body { padding: 10px; flex: 1; display: flex; flex-direction: column; gap: 6px; }
@media (max-width: 480px) {
  .food-card-body { padding: 8px; gap: 4px; }
}
.food-card-name { font-family: 'Hanuman', serif; font-size: 14px; font-weight: 700; line-height: 1.3; }
@media (max-width: 480px) {
  .food-card-name { font-size: 12px; }
}
.food-card-price { font-size: 14px; font-weight: 700; color: var(--green-dark); }
@media (max-width: 480px) {
  .food-card-price { font-size: 12px; }
  .add-cart-btn { padding: 4px 8px; font-size: 10px; }
  .status-toggle-btn { font-size: 9px; padding: 2px 6px; }
}
.food-card-footer {
  display: flex; justify-content: space-between;
  align-items: center; margin-top: auto; gap: 4px; flex-wrap: wrap;
}
@media (max-width: 480px) {
  .food-card-footer { flex-direction: column; align-items: stretch; gap: 6px; }
  .food-card-footer .add-cart-btn,
  .food-card-footer .status-toggle-btn { width: 100%; justify-content: center; }
}

.status-toggle-btn {
  font-size: 10px; padding: 3px 8px; border-radius: 20px;
  font-weight: 600; cursor: pointer; border: none; white-space: nowrap;
  transition: all .2s; flex-shrink: 0;
}
.status-toggle-btn.available  { background: #e8f5e9; color: #2d7a2d; border: 1px solid #a5d6a7; }
.status-toggle-btn.unavailable { background: #fbe9e7; color: #bf360c; border: 1px solid #ffccbc; }
.status-toggle-btn:hover { filter: brightness(.9); }

.add-cart-btn {
  background: var(--green-mid); color: white; border: none;
  border-radius: 20px; padding: 5px 11px; font-size: 11px;
  font-weight: 600; cursor: pointer; transition: all .15s;
  white-space: nowrap; flex-shrink: 0;
}
.add-cart-btn:hover { background: var(--green-dark); }
.add-cart-btn.unavail { background: #9e9e9e; cursor: not-allowed; }

.card-delete-btn {
  position: absolute; top: 6px; right: 6px;
  width: 26px; height: 26px; border-radius: 50%;
  background: rgba(198,40,40,.9); color: white; border: none;
  cursor: pointer; font-size: 13px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  z-index: 10; transition: transform .15s, background .15s;
}
.card-delete-btn:hover { background: #b71c1c; transform: scale(1.15); }
</style>