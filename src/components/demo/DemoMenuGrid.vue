<template>
      <div class="menu-section">
        <!-- Brief simulated load so the demo shows the real skeleton shimmer -->
        <div v-if="loading" class="food-grid">
          <div v-for="n in 10" :key="n" class="card-sk">
            <div class="sk card-img-sk"></div>
            <div class="card-body-sk">
              <div class="sk line-sk short"></div>
              <div class="sk line-sk price"></div>
            </div>
          </div>
        </div>

        <div v-else-if="mappedFoods.length" class="food-grid">
          <FoodCard v-for="food in mappedFoods" :key="food.id" :food="food" :cart-qty="cart[food.id]?.qty || 0"
            @add-cart="$emit('add-cart', $event)" @detail="$emit('detail', $event)" />
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon-ring">
            <AppIcon name="search" :size="36" />
          </div>
          <p class="empty-title">{{ i18n.t.demo_empty }}</p>
        </div>
      </div>
</template>

<script setup>
import { useI18nStore } from "@/stores/i18n";
import FoodCard from "@/components/FoodCard.vue";
import AppIcon from "@/components/AppIcon.vue";

const i18n = useI18nStore();

// Foods/cart/loading are computed in the parent; FoodCard's events are
// re-emitted under their original names so parent handlers stay identical.
defineProps({
  loading: { type: Boolean, default: false },
  mappedFoods: { type: Array, default: () => [] },
  cart: { type: Object, default: () => ({}) },
});
defineEmits(["add-cart", "detail"]);
</script>
<style scoped>
/* SKELETON SHIMMER — same as MenuView */
@keyframes shimmer {
  0% {
    background-position: -700px 0;
  }

  100% {
    background-position: 700px 0;
  }
}

.sk {
  background: linear-gradient(90deg, var(--green-pale, #e6f4ea) 25%, var(--green-soft, #d3ecdc) 50%, var(--green-pale, #e6f4ea) 75%);
  background-size: 700px 100%;
  animation: shimmer 1.5s infinite linear;
  border-radius: 10px;
}

.card-sk {
  background: #fff;
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--green-soft, #eaf5ed);
}

.card-img-sk {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 0;
  flex-shrink: 0;
}

.card-body-sk {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.line-sk {
  height: 12px;
  width: 100%;
  border-radius: 6px;
}

.line-sk.short {
  width: 60%;
}

.line-sk.price {
  width: 40%;
  height: 16px;
}

/* MENU GRID — same breakpoints as MenuView */
.menu-section {
  padding: 22px 14px 120px;
}

@media (max-width: 480px) {
  .menu-section {
    padding: 18px 10px 100px;
  }
}

.food-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

@media (max-width: 480px) {
  .food-grid {
    gap: 10px;
  }
}

@media (max-width: 1100px) {
  .food-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 800px) {
  .food-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 560px) {
  .food-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 360px) {
  .food-grid {
    grid-template-columns: 1fr;
  }
}

/* EMPTY STATE */
.empty-state {
  text-align: center;
  padding: 64px 20px 40px;
}

.empty-icon-ring {
  width: 78px;
  height: 78px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: var(--green-pale);
  color: var(--green-strong, var(--green-mid));
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0;
}

</style>
