<!-- frontend/src/views/MenuView.vue -->
<template>
  <div>
    <!-- HEADER -->
    <div class="header">
      <span class="header-leaf">🌿</span>
      <span class="header-leaf2">🍃</span>
      <div class="restaurant-logo">
        <img
          src="https://res.cloudinary.com/daji2ml3y/image/upload/v1777712294/ChatGPT_Image_May_2_2026_03_39_44_PM-Picsart-BackgroundRemover_1_x4yi9t.png"
          style="width: 150px"
          alt=""
        />
      </div>
    </div>

    <!-- TABS -->
    <div class="tabs-wrap">
      <div class="tabs">
        <button
          v-for="cat in foods.categories"
          :key="cat.slug"
          class="tab"
          :class="{ active: curCat === cat.slug }"
          @click="
            curCat = cat.slug;
            load();
          "
        >
          {{ cat.icon }} {{ cat.label_km }}
        </button>
      </div>
    </div>

    <!-- SEARCH -->
    <div class="search-bar">
      <div class="search-wrap">
        <span class="search-icon">🔍</span>
        <input
          v-model="searchQ"
          placeholder="ស្វែងរកម្ហូប..."
          @input="load()"
        />
      </div>
    </div>

    <!-- GRID -->
    <div class="menu-section">
      <div v-if="foods.loading" class="empty">
        <div class="empty-icon">⏳</div>
        កំពុងទាញយក...
      </div>
      <div v-else-if="!filteredFoods.length" class="empty">
        <div class="empty-icon">🔍</div>
        រកមិនឃើញម្ហូប
      </div>
      <div v-else class="food-grid">
        <FoodCard
          v-for="food in filteredFoods"
          :key="food.id"
          :food="food"
          :cart-qty="cart.items[food.id]?.qty || 0"
          @add-cart="cart.add($event)"
          @detail="selectedFood = $event"
        />
      </div>
    </div>

    <!-- CART FAB -->
    <button v-if="cart.count > 0" class="cart-fab" @click="showCart = true">
      <div class="cart-fab-images">
        <template v-for="(item, index) in cartPreviewItems" :key="item.id">
          <img
            v-if="item.img_url"
            :src="item.img_url"
            :alt="item.name"
            class="cart-fab-img"
            :style="{ zIndex: cartPreviewItems.length - index, marginLeft: index > 0 ? '-8px' : '0' }"
          />
          <span
            v-else
            class="cart-fab-img cart-fab-img--emoji"
            :style="{ zIndex: cartPreviewItems.length - index, marginLeft: index > 0 ? '-8px' : '0' }"
          >{{ getCategoryEmoji(item.category) }}</span>
        </template>
      </div>
      <span class="cart-fab-badge">{{ cart.count }}</span>
      {{ cart.total.toFixed(0) }}៛
    </button>

    <!-- ADMIN FAB -->
    <button class="fab" @click="goAdmin">🔐 Admin</button>

    <!-- MODALS -->
    <CartModal :show="showCart" @close="showCart = false" />

    <!-- Food Detail -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="selectedFood"
          class="modal-overlay"
          @click.self="selectedFood = null"
        >
          <div class="modal-card pop-in">
            <div class="modal-header">
              <span class="modal-header-title">{{ selectedFood.name }}</span>
              <button class="close-btn" @click="selectedFood = null">✕</button>
            </div>
            <div class="detail-img-wrap">
              <img
                v-if="selectedFood.img_url"
                :src="selectedFood.img_url"
                :alt="selectedFood.name"
              />
              <span v-else class="detail-img-placeholder">{{
                getCategoryEmoji(selectedFood.category)
              }}</span>
            </div>
            <div class="detail-body">
              <div class="detail-name">{{ selectedFood.name }}</div>
              <div class="detail-price">
                {{ Number(selectedFood.price).toFixed(0) }}៛
              </div>
              <span class="detail-status" :class="selectedFood.status">
                {{ selectedFood.status === "available" ? "✅ មាន" : "❌ អស់" }}
              </span>
              <button
                v-if="selectedFood.status === 'available'"
                class="add-cart-big"
                @click="
                  cart.add(selectedFood);
                  selectedFood = null;
                "
              >
                + ដាក់ក្នុងកញ្ចប់
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useFoodsStore } from "@/stores/foods";
import { useCartStore } from "@/stores/cart";
import FoodCard from "@/components/FoodCard.vue";
import CartModal from "@/components/CartModal.vue";

const router = useRouter();
const foods = useFoodsStore();
const cart = useCartStore();

const curCat = ref("");
const searchQ = ref("");
const showCart = ref(false);
const selectedFood = ref(null);

const filteredFoods = computed(() => foods.foods);

// Show up to 3 item images stacked in the FAB
const cartPreviewItems = computed(() =>
  Object.values(cart.items).slice(0, 3)
);

function getCategoryEmoji(category) {
  const emojis = {
    'made-to-order': '🍽️',
    'ready-cooked': '🍱',
    'dessert': '🍰'
  };
  return emojis[category] || '🍽️';
}

async function load() {
  const params = {};
  if (curCat.value) params.category = curCat.value;
  if (searchQ.value) params.search = searchQ.value;
  await foods.fetchFoods(params);
}

onMounted(async () => {
  await foods.fetchCategories();
  if (foods.categories.length) {
    curCat.value = foods.categories[0].slug;
  }
  await load();
});

function goAdmin() {
  router.push("/admin");
}
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, #0f766e 0%, #22c55e 60%, #86efac 100%);
  padding: 22px 16px 18px;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.header::before {
  content: "";
  position: absolute;
  top: -30px;
  right: -30px;
  width: 130px;
  height: 130px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
}
.header::after {
  content: "";
  position: absolute;
  bottom: -20px;
  left: -20px;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
}
.header-leaf {
  position: absolute;
  top: 10px;
  left: 12px;
  font-size: 26px;
  opacity: 0.3;
}
.header-leaf2 {
  position: absolute;
  top: 10px;
  right: 12px;
  font-size: 26px;
  opacity: 0.3;
}
.restaurant-logo {
  font-size: 42px;
  display: block;
  margin-bottom: 6px;
}
.restaurant-name {
  font-family: "Hanuman", serif;
  font-size: 22px;
  font-weight: 700;
  color: #fff;
}
.restaurant-sub {
  font-size: 12px;
  color: var(--green-accent);
  margin-top: 3px;
}

.tabs-wrap {
  background: var(--white);
  border-bottom: 2px solid var(--green-soft);
  overflow-x: auto;
  scrollbar-width: none;
}
.tabs-wrap::-webkit-scrollbar {
  display: none;
}
.tabs {
  display: flex;
  min-width: max-content;
  padding: 0 8px;
}
.tab {
  padding: 12px 14px;
  font-size: 13px;
  font-family: inherit;
  font-weight: 500;
  color: var(--text-light);
  border: none;
  background: none;
  cursor: pointer;
  white-space: nowrap;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
  position: relative;
  top: 2px;
}
.tab.active {
  color: var(--green-mid);
  border-bottom-color: var(--green-mid);
  font-weight: 600;
}
.tab:hover {
  color: var(--green-light);
}

.search-bar {
  padding: 12px 16px;
  background: var(--white);
  border-bottom: 1px solid var(--green-soft);
}
.search-wrap {
  position: relative;
}
.search-bar input {
  width: 100%;
  padding: 9px 14px 9px 38px;
  border: 1.5px solid var(--green-soft);
  border-radius: 24px;
  font-size: 13px;
  font-family: inherit;
  background: var(--green-pale);
  color: var(--text-dark);
  outline: none;
  transition: border 0.2s;
}
.search-bar input:focus {
  border-color: var(--green-light);
}
.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 15px;
  pointer-events: none;
}

.menu-section {
  padding: 12px 12px 100px;
}
.food-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
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
    grid-template-columns: repeat(1, 1fr);
  }
}

.empty {
  text-align: center;
  padding: 50px 20px;
  color: var(--text-light);
}
.empty-icon {
  font-size: 46px;
  margin-bottom: 10px;
}

/* CART FAB */
.cart-fab {
  position: fixed;
  bottom: 24px;
  left: 16px;
  background: var(--orange);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 8px 18px 8px 8px;
  font-size: 13px;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(230, 81, 0, 0.4);
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 100;
  transition: all 0.2s;
}
.cart-fab:hover {
  background: #bf360c;
  transform: translateY(-2px);
}

/* Stacked food images inside FAB */
.cart-fab-images {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.cart-fab-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--orange);
  background: #fff3e0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}
.cart-fab-img--emoji {
  font-size: 16px;
  line-height: 32px;
  text-align: center;
}

.cart-fab-badge {
  background: white;
  color: var(--orange);
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ADMIN FAB */
.fab {
  position: fixed;
  bottom: 24px;
  right: 16px;
  background: #455a64;
  color: white;
  border: none;
  border-radius: 50px;
  padding: 13px 20px;
  font-size: 13px;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.28);
  display: flex;
  align-items: center;
  gap: 7px;
  z-index: 100;
  transition: all 0.2s;
}
.fab:hover {
  background: #263238;
  transform: translateY(-2px);
}

/* MODALS */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.modal-card {
  background: white;
  border-radius: 22px;
  width: 100%;
  max-width: 420px;
  max-height: 88vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 18px 0;
}
.modal-header-title {
  font-family: "Hanuman", serif;
  font-size: 17px;
  font-weight: 700;
  color: var(--green-dark);
}
.close-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--green-pale);
  border: none;
  cursor: pointer;
  font-size: 17px;
  font-weight: 700;
  color: var(--green-dark);
}
.detail-img-wrap {
  width: 100%;
  height: 400px;
  overflow: hidden;
  background: var(--green-pale);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 14px;
}
.detail-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.detail-img-placeholder {
  font-size: 80px;
}
.detail-body {
  padding: 16px 18px 22px;
}
.detail-name {
  font-family: "Hanuman", serif;
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 6px;
}
.detail-price {
  font-size: 20px;
  font-weight: 700;
  color: var(--green-dark);
  margin-bottom: 10px;
}
.detail-status {
  display: inline-block;
  font-size: 12px;
  padding: 4px 14px;
  border-radius: 20px;
  font-weight: 600;
}
.detail-status.available {
  background: #e8f5e9;
  color: #2d7a2d;
  border: 1px solid #a5d6a7;
}
.detail-status.unavailable {
  background: #fbe9e7;
  color: #bf360c;
  border: 1px solid #ffccbc;
}
.add-cart-big {
  display: block;
  width: 100%;
  margin-top: 16px;
  padding: 13px;
  background: var(--green-mid);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-family: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}
.add-cart-big:hover {
  background: var(--green-dark);
}

/* TRANSITIONS */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.pop-in {
  animation: popIn 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes popIn {
  from {
    transform: scale(0.85);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>