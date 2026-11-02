<template>
  <div class="food-card" :class="{ 'is-selected': selected }" @click="$emit('detail', food)">
    <!-- Admin selection checkbox -->
    <button v-if="isAdmin && selectable" class="card-select-btn" :class="{ checked: selected }"
      :aria-label="selected ? i18n.t.cancel_selection : i18n.t.select" @click.stop="$emit('select', food.id)">
      <span v-if="selected">✓</span>
    </button>

    <!-- Admin delete button -->
    <button v-if="isAdmin" class="card-delete-btn" @click.stop="$emit('delete', food)">
      <AppIcon name="x" :size="14" />
    </button>

    <!-- Status badge (customer only) -->
    <div v-if="!isAdmin && food.status === 'available'" class="card-status">
      <span class="detail-status" :class="food.status">
        <AppIcon name="check-circle" :size="14" />
        {{ i18n.t.available }}
      </span>
    </div>

    <!-- Image -->
    <div class="food-card-img">
      <img v-if="food.img_url" :src="food.img_url" :alt="displayName" @error="imgError = true" />
      <span v-if="!food.img_url || imgError" class="img-fallback">
        <AppIcon name="food" :size="48" />
      </span>
      <div v-if="food.status === 'unavailable'" class="unavail-overlay">
        <span class="unavail-tag">
          <AppIcon name="x-circle" :size="12" /> {{ i18n.t.unavailable }}
        </span>
      </div>
    </div>

    <!-- Body -->
    <div class="food-card-body">
      <div class="food-card-hard">
        <div class="food-card-name">{{ displayName }}</div>
        <div class="food-card-price-hide">{{ currencyStore.fmt(food.price) }}</div>
      </div>
      <div class="food-card-footer">
        <span class="food-card-price">{{ currencyStore.fmt(food.price) }}</span>

        <!-- Admin: status toggle -->
        <button v-if="isAdmin" class="status-toggle-btn" :class="food.status"
          @click.stop="$emit('toggle-status', food.id)">
          <AppIcon name="check-circle" :size="12" /> {{ food.status === 'available' ? i18n.t.available : i18n.t.unavailable }}
        </button>

        <!-- Guest: add to cart -->
        <template v-else>
          <button v-if="food.status === 'unavailable'" class="add-cart-btn unavail" disabled>
            <AppIcon name="x-circle" :size="14" /> {{ i18n.t.unavailable }}
          </button>
          <button v-else class="add-cart-btn" @click.stop="$emit('add-cart', food)">
            <template v-if="cartQty > 0">
              <AppIcon name="cart" :size="14" /> ({{ cartQty }})
            </template>
            <template v-else>+ {{ i18n.t.add }}</template>
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import AppIcon from "@/components/AppIcon.vue";
import { useCurrencyStore } from "@/stores/currency";
import { useI18nStore } from "@/stores/i18n";

const props = defineProps({
  food: { type: Object, required: true },
  isAdmin: { type: Boolean, default: false },
  cartQty: { type: Number, default: 0 },
  selectable: { type: Boolean, default: false },
  selected: { type: Boolean, default: false },
});

defineEmits(['detail', 'delete', 'toggle-status', 'add-cart', 'select']);

const currencyStore = useCurrencyStore();
const i18n = useI18nStore();

const imgError = ref(false);

// Guest reads the dish in the page language — English when the data has it,
// otherwise the stored (Khmer) name.
const displayName = computed(() =>
  i18n.locale === "en"
    ? props.food.name_en || props.food.name
    : props.food.name || props.food.name_en,
);

function getCategoryEmoji(category) {
  return 'food';
}
</script>

<style scoped>
.food-card {
  background: var(--white, #fff);
  border-radius: var(--radius-card, var(--radius, 16px));
  overflow: hidden;
  box-shadow: 0 2px 10px var(--shadow-tint-soft, var(--primary-glow, var(--shadow, rgba(0, 0, 0, 0.08))));
  border: 1px solid var(--border-green, var(--green-soft, #eaf5ed));
  cursor: pointer;
  transition: transform .15s, box-shadow .15s;
  display: flex;
  flex-direction: column;
  position: relative;
}

.food-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px var(--shadow-tint, var(--primary-glow-strong, var(--shadow, rgba(0, 0, 0, 0.08))));
}

.food-card-img {
  width: 100%;
  aspect-ratio: 1/1;
  background: var(--surface-green, var(--green-pale, #f0fdf4));
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.food-card-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.img-fallback {
  font-size: 50px;
  color: var(--primary, var(--green-light, currentColor));
}

.unavail-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, .34);
  display: flex;
  align-items: center;
  justify-content: center;
}

.unavail-tag {
  background: #c62828;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
}

/* Status badge — top-left over the image (from MenuView detail modal) */
.card-status {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 10;
  pointer-events: none;
}

.detail-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  padding: 5px 13px;
  border-radius: 20px;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.detail-status.available {
  /* Dynamic theme: the customer menu (MenuView) derives --green-pale/-dark/-soft
     from the restaurant's theme_color, while admin pages use the theme store's
     --surface-green/--primary-strong/--border-green. Chaining them makes the
     badge follow whichever palette is active (green fallbacks last). */
  background: var(--green-pale, var(--surface-green, #dcfce7));
  color: var(--green-dark, var(--primary-strong, #166534));
  border: 1px solid var(--green-soft, var(--border-green, rgba(0, 0, 0, 0.06)));
}

.detail-status.unavailable {
  background: #fee2e2;
  color: #991b1b;
}

@media (max-width: 480px) {
  .card-status {
    top: 6px;
    left: 6px;
  }

  .detail-status {
    font-size: 10px;
    padding: 3px 10px;
    gap: 3px;
  }
}

.food-card-body {
  padding: 10px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

@media (max-width: 480px) {
  .food-card-body {
    padding: 8px;
    gap: 4px;
  }
}

.food-card-hard {
  font-family: 'Hanuman', serif;
  display: flex;
  justify-content: space-between;
}

.food-card-name {
  font-family: 'Hanuman', serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.35;
  overflow-wrap: anywhere;
  word-break: normal;
}

@media (max-width: 480px) {
  .food-card-name {
    font-size: 12px;
    line-height: 1.35;
  }
}

.food-card-price {
  font-size: 14px;
  font-weight: 700;
  color: var(--primary-strong, var(--green-dark, #14532d));
}

.food-card-price-hide {
  font-size: 14px;
  display: none;
  font-weight: 700;
  color: var(--primary-strong, var(--green-dark, #14532d));
}

@media (max-width: 480px) {
  .food-card-price {
    font-size: 12px;
    display: none;
  }

  .food-card-price-hide {
    font-size: 12px;
    display: block;
  }

  .add-cart-btn {
    padding: 4px 8px;
    font-size: 10px;
  }

  .status-toggle-btn {
    font-size: 9px;
    line-height: 1.25;
    padding: 3px 7px;
    white-space: normal;
    text-align: center;
  }
}

.food-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  gap: 4px;
  flex-wrap: wrap;
}

@media (max-width: 480px) {
  .food-card-footer .add-cart-btn,
  .food-card-footer .status-toggle-btn {
    width: auto;
    max-width: 100%;
    justify-content: center;
  }
}

.status-toggle-btn {
  font-size: 10px;
  padding: 3px 8px;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  white-space: nowrap;
  transition: all .2s;
  flex-shrink: 0;
}

.status-toggle-btn.available {
  background: var(--surface-green, #e8f5e9);
  color: var(--primary-strong, #2d7a2d);
  border: 1px solid var(--border-green, #a5d6a7);
}

.status-toggle-btn.unavailable {
  background: #fbe9e7;
  color: #bf360c;
  border: 1px solid #ffccbc;
}

.status-toggle-btn:hover {
  filter: brightness(.9);
}

.add-cart-btn {
  background: var(--primary, var(--green-mid, #16a34a));
  color: var(--on-primary, #fff);
  border: none;
  border-radius: 20px;
  padding: 5px 11px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all .15s;
  white-space: nowrap;
  flex-shrink: 0;
}

.add-cart-btn:hover {
  background: var(--primary-dark, var(--green-dark, #14532d));
}

.add-cart-btn.unavail {
  background: #9e9e9e;
  cursor: not-allowed;
}

.card-delete-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(198, 40, 40, .9);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: transform .15s, background .15s;
}

.card-delete-btn:hover {
  background: #b71c1c;
  transform: scale(1.15);
}

.food-card.is-selected {
  outline: 3px solid var(--primary, #16a34a);
  outline-offset: -1px;
}

.card-select-btn {
  position: absolute;
  top: 6px;
  left: 6px;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: 2px solid rgba(255,255,255,.95);
  background: rgba(255,255,255,.92);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 11;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,.18);
}

.card-select-btn.checked {
  background: var(--primary, #16a34a);
  border-color: var(--primary, #16a34a);
}
</style>