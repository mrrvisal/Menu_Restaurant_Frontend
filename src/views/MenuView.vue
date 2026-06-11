<!-- frontend/src/views/MenuView.vue -->
<template>
  <div class="page">

    <!-- HEADER -->
    <div class="header">
      <span class="leaf l1">🌿</span>
      <span class="leaf l2">🍃</span>
      <span class="leaf l3">🌿</span>
      <span class="leaf l4">🍃</span>
      <span class="leaf l5">🌿</span>
      <span class="leaf l6">🍃</span>
      <span class="leaf l7">🌿</span>
      <span class="leaf l8">🍃</span>
      <span class="sparkle s1"></span>
      <span class="sparkle s2"></span>
      <span class="sparkle s3"></span>
      <span class="sparkle s4"></span>
      <span class="sparkle s5"></span>
      <img
        src="https://res.cloudinary.com/daji2ml3y/image/upload/v1777712294/ChatGPT_Image_May_2_2026_03_39_44_PM-Picsart-BackgroundRemover_1_x4yi9t.png"
        class="header-logo"
        alt="restaurant logo"
      />
      <div class="wave-divider">
        <svg viewBox="0 0 1440 28" fill="none"
             xmlns="http://www.w3.org/2000/svg"
             preserveAspectRatio="none"
             style="height:28px">
          <path
            d="M0 14 C180 0 360 28 540 14
               C720 0 900 28 1080 14
               C1260 0 1440 28 1440 14
               L1440 28 L0 28 Z"
            fill="#f4faf6"/>
          <path
            d="M1440 14 C1620 0 1800 28 1980 14
               C2160 0 2340 28 2520 14
               C2700 0 2880 28 2880 14
               L2880 28 L1440 28 Z"
            fill="#f4faf6"/>
        </svg>
      </div>
    </div>

    <!-- TABS -->
    <div class="tabs-wrap">
      <!-- Skeleton tabs while categories loading -->
      <div v-if="!foods.categories.length" class="tabs">
        <div v-for="n in 5" :key="n" class="sk tab-sk"></div>
      </div>
      <div v-else class="tabs">
        <button
          v-for="cat in foods.categories"
          :key="cat.slug"
          class="tab"
          :class="{ active: curCat === cat.slug }"
          @click="switchCategory(cat.slug)"
        >
          <span class="tab-icon">{{ cat.icon }}</span>
          {{ cat.label_km }}
        </button>
      </div>
    </div>

    <!-- SEARCH -->
    <div class="search-bar">
      <div class="search-wrap">
        <svg class="search-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8">
          <circle cx="8.5" cy="8.5" r="5.5"/><path d="M15 15l-3-3"/>
        </svg>
        <input v-model="searchQ" placeholder="ស្វែងរកម្ហូប..." @input="debouncedLoad()" />
        <button v-if="searchQ" class="search-clear" @click="searchQ = ''; load()">✕</button>
      </div>
    </div>

    <!-- GRID -->
    <div class="menu-section">

      <!-- Skeleton: shown while loading OR before first fetch completes -->
      <div v-if="foods.loading || !initialized" class="food-grid">
        <div v-for="n in 10" :key="n" class="card-sk">
          <div class="sk card-img-sk"></div>
          <div class="card-body-sk">
            <div class="sk line-sk short"></div>
            <div class="sk line-sk price"></div>
          </div>
        </div>
      </div>

      <!-- Food grid: shown when NOT loading AND results exist -->
      <div v-else-if="filteredFoods.length" class="food-grid">
        <FoodCard
          v-for="food in filteredFoods"
          :key="food.id"
          :food="food"
          :cart-qty="cart.items[food.id]?.qty || 0"
          @add-cart="cart.add($event)"
          @detail="selectedFood = $event"
        />
      </div>

      <!-- Empty state: only shown after a search that returned nothing -->
      <div v-else-if="searchQ" class="empty">
        <div class="empty-illustration">🍽️</div>
        <p class="empty-title">រកមិនឃើញម្ហូប</p>
        <p class="empty-sub">សូមសាកល្បងស្វែងរកពាក្យផ្សេង</p>
      </div>

    </div>

    <!-- CART FAB -->
    <Transition name="fab-pop">
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
        <span class="cart-fab-label">
          <span class="cart-fab-badge">{{ cart.count }}</span>
          {{ cart.total.toFixed(0) }}៛
        </span>
      </button>
    </Transition>

    <!-- ADMIN FAB -->
    <button class="fab-admin" @click="goAdmin">
      <span>🔐</span> Admin
    </button>

    <!-- MODALS -->
    <CartModal :show="showCart" :table-from-qr="tableFromQR" @close="showCart = false" />

    <!-- Food Detail Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="selectedFood" class="modal-overlay" @click.self="selectedFood = null">
          <div class="modal-card pop-in">
            <button class="modal-close" @click="selectedFood = null">✕</button>

            <div class="detail-img-wrap">
              <img v-if="selectedFood.img_url" :src="selectedFood.img_url" :alt="selectedFood.name" />
              <span v-else class="detail-img-placeholder">{{ getCategoryEmoji(selectedFood.category) }}</span>
              <div class="detail-img-gradient"></div>
            </div>

            <div class="detail-body">
              <span class="detail-status-chip" :class="selectedFood.status">
                {{ selectedFood.status === 'available' ? '✅ មាន' : '❌ អស់' }}
              </span>
              <div class="detail-name">{{ selectedFood.name }}</div>
              <div class="detail-price">{{ Number(selectedFood.price).toFixed(0) }}៛</div>

              <button
                v-if="selectedFood.status === 'available'"
                class="add-cart-big"
                @click="cart.add(selectedFood); selectedFood = null;"
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
import { useRoute, useRouter } from "vue-router";
import { useFoodsStore } from "@/stores/foods";
import { useCartStore } from "@/stores/cart";
import FoodCard from "@/components/FoodCard.vue";
import CartModal from "@/components/CartModal.vue";

const route = useRoute();
const router = useRouter();
const foods = useFoodsStore();
const cart = useCartStore();

const curCat = ref("");
const searchQ = ref("");
const showCart = ref(false);
const selectedFood = ref(null);
const initialized = ref(false); // true after the very first successful fetch

// Read table number from URL parameter ?table=X
const tableFromQR = computed(() => {
  const t = route.query.table;
  return t && !isNaN(t) ? parseInt(t) : null;
});
const tableBadge = ref(null);

// Debounce timer for search input
let searchTimer = null;

// Derives from store — skeleton is controlled by foods.loading
const filteredFoods = computed(() => foods.foods);
const cartPreviewItems = computed(() => Object.values(cart.items).slice(0, 3));

function getCategoryEmoji(category) {
  const emojis = {
    "made-to-order": "🍽️",
    "ready-cooked": "🍱",
    dessert: "🍰",
  };
  return emojis[category] || "🍽️";
}

async function load() {
  const params = {};
  if (curCat.value) params.category = curCat.value;
  if (searchQ.value) params.search = searchQ.value;
  await foods.fetchFoods(params);
}

// Switch tab: update category and immediately trigger load (with loading state)
function switchCategory(slug) {
  curCat.value = slug;
  load();
}

// Debounce search so skeleton doesn't flash on every keystroke
function debouncedLoad() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => load(), 350);
}

onMounted(async () => {
  await foods.fetchCategories();
  if (foods.categories.length) {
    curCat.value = foods.categories[0].slug;
  }
  await load();
  initialized.value = true;
});

function goAdmin() {
  router.push("/admin");
}
</script>

<style scoped>
/* ============================================================
   CSS VARIABLES
   ============================================================ */
.page {
  --green-pale: #f0fdf4;
  --green-soft: #bbf7d0;
  --green-light: #4ade80;
  --green-mid: #16a34a;
  --green-dark: #14532d;
  --orange: #ea580c;
  --white: #ffffff;
  --text-dark: #111827;
  --text-light: #6b7280;
  --radius: 16px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.09);
  --shadow-lg: 0 12px 40px rgba(0,0,0,0.14);

  min-height: 100vh;
  background: #f4faf6;
  font-family: "Hanuman", "Noto Sans Khmer", system-ui, sans-serif;
}

/* ============================================================
   SKELETON SHIMMER
   ============================================================ */
@keyframes shimmer {
  0%   { background-position: -700px 0 }
  100% { background-position:  700px 0 }
}
.sk {
  background: linear-gradient(90deg, #dff0e6 25%, #c5e3cf 50%, #dff0e6 75%);
  background-size: 700px 100%;
  animation: shimmer 1.5s infinite linear;
  border-radius: 8px;
}
.tab-sk {
  height: 36px;
  width: 84px;
  flex-shrink: 0;
  border-radius: 20px;
  margin: 7px 4px;
}
.card-sk {
  background: #fff;
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid #e2f0e6;
}
/* Matches FoodCard .food-card-img exactly: width 100%, aspect-ratio 1/1 */
.card-img-sk {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 0;
  flex-shrink: 0;
}
.card-body-sk { padding: 12px; display: flex; flex-direction: column; gap: 9px; }
.line-sk      { height: 12px; width: 100%; border-radius: 6px; }
.line-sk.short { width: 60%; }
.line-sk.price { width: 40%; height: 16px; }

/* ============================================================
   HEADER
   ============================================================ */
.header {
  background: linear-gradient(135deg, #0f766e, #22c55e, #86efac);
  padding: 36px 20px 32px;
  text-align: center;
  position: relative;
  overflow: hidden;
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.header::before {
  content: '';
  position: absolute;
  width: 220px; height: 220px;
  border-radius: 50%;
  background: rgba(255,255,255,0.06);
  top: -60px; right: -50px;
  pointer-events: none;
}
.header::after {
  content: '';
  position: absolute;
  width: 140px; height: 140px;
  border-radius: 50%;
  background: rgba(255,255,255,0.04);
  bottom: -40px; left: -30px;
  pointer-events: none;
}
.header-logo {
  width: 150px;
  position: relative; z-index: 2;
  filter: drop-shadow(0 6px 18px rgba(0,0,0,0.35));
  animation: logoFloat 3.6s ease-in-out infinite;
}
@keyframes logoFloat {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-8px); }
}
.leaf {
  position: absolute;
  opacity: 0;
  animation: leafFall linear infinite;
  pointer-events: none;
  z-index: 3;
  user-select: none;
}
.l1 { left:  8%; font-size: 26px; animation-duration: 6.0s; animation-delay: 0.0s; }
.l2 { left: 18%; font-size: 18px; animation-duration: 7.5s; animation-delay: 1.2s; }
.l3 { left: 32%; font-size: 20px; animation-duration: 5.8s; animation-delay: 2.5s; }
.l4 { left: 55%; font-size: 14px; animation-duration: 8.0s; animation-delay: 0.6s; }
.l5 { left: 68%; font-size: 22px; animation-duration: 6.5s; animation-delay: 3.0s; }
.l6 { left: 80%; font-size: 16px; animation-duration: 7.0s; animation-delay: 1.8s; }
.l7 { left: 90%; font-size: 20px; animation-duration: 5.5s; animation-delay: 4.0s; }
.l8 { left: 44%; font-size: 12px; animation-duration: 9.0s; animation-delay: 0.3s; }
@keyframes leafFall {
  0%   { top: -5%;  opacity: 0;   transform: rotate(0deg)   translateX(0); }
  8%   {             opacity: .55; }
  85%  {             opacity: .4;  }
  100% { top: 105%; opacity: 0;   transform: rotate(360deg) translateX(24px); }
}
.sparkle {
  position: absolute;
  width: 4px; height: 4px;
  border-radius: 50%;
  background: rgba(255,255,255,0.7);
  animation: sparklePop ease-in-out infinite;
  pointer-events: none; z-index: 3;
}
.s1 { top: 20%; left: 15%; animation-duration: 2.4s; animation-delay: 0.0s; }
.s2 { top: 60%; left: 25%; animation-duration: 3.1s; animation-delay: 0.8s; }
.s3 { top: 30%; left: 72%; animation-duration: 2.8s; animation-delay: 1.5s; }
.s4 { top: 70%; left: 82%; animation-duration: 2.2s; animation-delay: 0.4s; }
.s5 { top: 50%; left: 48%; animation-duration: 3.5s; animation-delay: 2.1s; }
@keyframes sparklePop {
  0%, 100% { transform: scale(0);   opacity: 0; }
  40%       { transform: scale(1.6); opacity: 1; }
  60%       { transform: scale(0.8); opacity: .7; }
}
.wave-divider {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 28px; overflow: hidden;
  pointer-events: none; z-index: 4;
}
.wave-divider svg {
  position: absolute; bottom: 0;
  width: 200%; left: 0;
  animation: waveDrift 8s linear infinite;
}
@keyframes waveDrift {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* ============================================================
   TABS
   ============================================================ */
.tabs-wrap {
  background: var(--white);
  border-bottom: 1.5px solid #e2f0e6;
  overflow-x: auto;
  scrollbar-width: none;
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}
.tabs-wrap::-webkit-scrollbar { display: none; }
.tabs {
  display: flex;
  min-width: max-content;
  padding: 0 12px;
  gap: 2px;
}
.tab {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 13px 16px 11px;
  font-size: 13px;
  font-family: inherit;
  font-weight: 500;
  color: var(--text-light);
  border: none;
  background: none;
  cursor: pointer;
  white-space: nowrap;
  border-bottom: 3px solid transparent;
  transition: all 0.18s;
  position: relative;
  top: 1.5px;
  letter-spacing: 0.01em;
}
.tab-icon { font-size: 15px; }
.tab.active {
  color: var(--green-mid);
  border-bottom-color: var(--green-mid);
  font-weight: 700;
}
.tab:hover:not(.active) {
  color: #374151;
  background: #f0fdf4;
  border-radius: 8px 8px 0 0;
}

/* ============================================================
   SEARCH
   ============================================================ */
.search-bar {
  padding: 12px 16px;
  background: var(--white);
  border-bottom: 1px solid #e2f0e6;
}
.search-wrap {
  position: relative;
  max-width: 100%;
  margin: 0 auto;
}
.search-icon {
  position: absolute;
  left: 13px;
  top: 50%;
  transform: translateY(-50%);
  width: 17px;
  height: 17px;
  color: #9ca3af;
  pointer-events: none;
}
.search-bar input {
  width: 100%;
  padding: 10px 38px 10px 40px;
  border: 1.5px solid #d1fae5;
  border-radius: 26px;
  font-size: 13.5px;
  font-family: inherit;
  background: #f0fdf4;
  color: var(--text-dark);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.search-bar input:focus {
  border-color: var(--green-light);
  box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.15);
}
.search-clear {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: #d1d5db;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

/* ============================================================
   MENU SECTION & GRID
   ============================================================ */
.menu-section {
  padding: 16px 14px 120px;
}
.food-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
}
@media (max-width: 1100px) { .food-grid { grid-template-columns: repeat(4, 1fr); } }
@media (max-width: 800px)  { .food-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 560px)  { .food-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 360px)  { .food-grid { grid-template-columns: 1fr; } }

/* ============================================================
   EMPTY STATE
   ============================================================ */
.empty {
  text-align: center;
  padding: 60px 20px 40px;
}
.empty-illustration {
  font-size: 56px;
  margin-bottom: 14px;
  opacity: 0.35;
}
.empty-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 6px;
}
.empty-sub {
  font-size: 13px;
  color: var(--text-light);
}

/* ============================================================
   CART FAB
   ============================================================ */
.cart-fab {
  position: fixed;
  bottom: 26px;
  left: 16px;
  background: var(--orange);
  color: #fff;
  border: none;
  border-radius: 50px;
  padding: 7px 16px 7px 7px;
  font-size: 14px;
  font-family: inherit;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(234, 88, 12, 0.45);
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 100;
  transition: transform 0.2s, box-shadow 0.2s;
}
.cart-fab:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 28px rgba(234, 88, 12, 0.5);
}
.cart-fab:active { transform: scale(0.97); }
.cart-fab-images { display: flex; align-items: center; flex-shrink: 0; }
.cart-fab-img {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255,255,255,0.45);
  background: #fff3e0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}
.cart-fab-img--emoji { font-size: 16px; line-height: 34px; text-align: center; }
.cart-fab-label     { display: flex; align-items: center; gap: 7px; }
.cart-fab-badge {
  background: #fff;
  color: var(--orange);
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
.fab-pop-enter-active { animation: fabIn 0.3s cubic-bezier(0.34,1.56,0.64,1); }
.fab-pop-leave-active { animation: fabIn 0.18s reverse ease-in; }
@keyframes fabIn {
  from { transform: translateY(18px) scale(0.85); opacity: 0; }
  to   { transform: translateY(0)    scale(1);    opacity: 1; }
}

/* ============================================================
   ADMIN FAB
   ============================================================ */
.fab-admin {
  position: fixed;
  bottom: 26px;
  right: 16px;
  background: #1f2937;
  color: #e5e7eb;
  border: none;
  border-radius: 50px;
  padding: 13px 18px;
  font-size: 13px;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 100;
  transition: all 0.2s;
}
.fab-admin:hover {
  background: #111827;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.35);
}

/* ============================================================
   FOOD DETAIL MODAL
   ============================================================ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 200;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0;
}
@media (min-width: 560px) {
  .modal-overlay { align-items: center; padding: 20px; }
}
.modal-card {
  background: #fff;
  border-radius: 24px 24px 0 0;
  width: 100%;
  max-width: 480px;
  max-height: 92vh;
  overflow-y: auto;
  box-shadow: 0 -8px 40px rgba(0,0,0,0.2);
  position: relative;
}
@media (min-width: 560px) {
  .modal-card { border-radius: 24px; box-shadow: var(--shadow-lg); }
}
.modal-close {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 10;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(0,0,0,0.35);
  color: #fff;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.detail-img-wrap {
  width: 100%;
  height: 400px;
  overflow: hidden;
  background: #f0fdf4;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.detail-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.detail-img-gradient {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 80px;
  background: linear-gradient(to top, rgba(0,0,0,0.16), transparent);
  pointer-events: none;
}
.detail-img-placeholder { font-size: 80px; }
.detail-body { padding: 18px 20px 28px; }
.detail-status-chip {
  display: inline-block;
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 600;
  margin-bottom: 10px;
}
.detail-status-chip.available   { background: #dcfce7; color: #166534; }
.detail-status-chip.unavailable { background: #fee2e2; color: #991b1b; }
.detail-name {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 6px;
  line-height: 1.3;
}
.detail-price {
  font-size: 22px;
  font-weight: 700;
  color: var(--green-mid);
  margin-bottom: 18px;
}
.add-cart-big {
  display: block;
  width: 100%;
  padding: 15px;
  background: var(--green-mid);
  color: #fff;
  border: none;
  border-radius: 14px;
  font-size: 15px;
  font-family: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
  letter-spacing: 0.02em;
}
.add-cart-big:hover  { background: var(--green-dark); }
.add-cart-big:active { transform: scale(0.98); }

/* ============================================================
   TRANSITIONS
   ============================================================ */
.fade-enter-active, .fade-leave-active { transition: opacity 0.22s ease; }
.fade-enter-from,  .fade-leave-to      { opacity: 0; }
.pop-in { animation: popIn 0.26s cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes popIn {
  from { transform: translateY(30px) scale(0.96); opacity: 0; }
  to   { transform: translateY(0)    scale(1);    opacity: 1; }
}
</style>