<!-- frontend/src/views/MenuView.vue -->
<template>
  <div class="page">
    <!-- HEADER -->
    <div class="header">
      <div class="header-bg-overlay"></div>
      <div class="header-bg-pattern"></div>
      <div class="header-blob header-blob-1"></div>
      <div class="header-blob header-blob-2"></div>
      <div class="header-content">
        <div class="header-logo-ring">
          <img
            :src="
              restaurantInfo?.logo_url ||
              'https://res.cloudinary.com/daji2ml3y/image/upload/v1783262055/ChatGPT_Image_Jul_5_2026_09_32_32_PM_c6ziic.png'
            "
            class="header-logo"
            alt="restaurant logo"
          />
        </div>
        <div class="header-text">
          <h1 class="header-title">
            {{ restaurantInfo?.name }}
          </h1>
        </div>
      </div>
    </div>

    <!-- STICKY CONTROL BAR (tabs + search) -->
    <div class="control-bar">
      <!-- TABS -->
      <div class="tabs-wrap">
        <div v-if="!foods.categories.length" class="tabs">
          <div v-for="n in 5" :key="n" class="sk tab-sk"></div>
        </div>
        <div v-else class="tabs">
          <button
            v-for="cat in foods.categories"
            :key="cat.id"
            class="tab"
            :class="{ active: curCat === cat.id }"
            @click="switchCategory(cat.id)"
          >
            <span class="tab-label">{{ cat.label_km }}</span>
          </button>
        </div>
      </div>

      <!-- SEARCH -->
      <div class="search-bar">
        <div class="search-inner">
          <svg
            class="search-icon"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <circle cx="8.5" cy="8.5" r="5.5" />
            <path d="M15 15l-3-3" />
          </svg>
          <input
            v-model="searchQ"
            placeholder="ស្វែងរកម្ហូប..."
            @input="debouncedLoad()"
          />
          <button
            v-if="searchQ"
            class="search-clear"
            @click="
              searchQ = '';
              load();
            "
          >
            ✕
          </button>
        </div>
      </div>
    </div>

    <!-- MENU GRID -->
    <div class="menu-section">
      <!-- Skeleton loading -->
      <div v-if="foods.loading || !initialized" class="food-grid">
        <div v-for="n in 10" :key="n" class="card-sk">
          <div class="sk card-img-sk"></div>
          <div class="card-body-sk">
            <div class="sk line-sk short"></div>
            <div class="sk line-sk price"></div>
          </div>
        </div>
      </div>

      <!-- Food grid -->
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

      <!-- Empty state -->
      <div v-else-if="searchQ" class="empty-state">
        <div class="empty-icon-ring">
          <AppIcon name="search" :size="36" />
        </div>
        <p class="empty-title">រកមិនឃើញម្ហូប</p>
        <p class="empty-sub">សូមសាកល្បងស្វែងរកពាក្យផ្សេង</p>
      </div>
    </div>

    <!-- CART FAB -->
    <Transition name="fab-pop">
      <button v-if="cart.count > 0" class="cart-fab" @click="showCart = true">
        <div class="cart-fab-images">
          <img
            v-for="(item, index) in cartPreviewItems"
            :key="item.id || index"
            :src="
              item.img ||
              'https://res.cloudinary.com/daji2ml3y/image/upload/v1783260526/error-image-icon_194117-662_kppjnq.avif'
            "
            :alt="item.name"
            class="cart-fab-img"
            :style="{
              zIndex: cartPreviewItems.length - index,
              marginLeft: index > 0 ? '-10px' : '0',
            }"
          />
        </div>
        <span class="cart-fab-label">
          <span class="cart-fab-badge">{{ cart.count }}</span>
          <span class="cart-fab-total">{{ cart.total.toFixed(0) }}៛</span>
        </span>
      </button>
    </Transition>

    <!-- CART MODAL -->
    <CartModal
      :show="showCart"
      :table-from-qr="tableFromQR"
      :restaurant-id="restaurantId"
      @close="showCart = false"
    />

    <!-- FOOD DETAIL MODAL -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="selectedFood"
          class="modal-overlay"
          @click.self="selectedFood = null"
        >
          <div class="modal-card">
            <div class="modal-drag-handle"></div>

            <button class="modal-close" @click="selectedFood = null">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div class="detail-img-wrap">
              <img
                v-if="selectedFood.img_url"
                :src="selectedFood.img_url"
                :alt="selectedFood.name"
              />
              <span v-else class="detail-img-placeholder">{{
                getCategoryEmoji(selectedFood.category)
              }}</span>
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
              <div class="detail-price">
                {{ Number(selectedFood.price).toFixed(0) }}៛
              </div>

              <button
                v-if="selectedFood.status === 'available'"
                class="add-cart-big"
                @click="
                  cart.add(selectedFood);
                  selectedFood = null;
                "
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                ដាក់ក្នុងកញ្ចប់
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
import { useAuthStore } from "@/stores/auth";
import FoodCard from "@/components/FoodCard.vue";
import CartModal from "@/components/CartModal.vue";
import AppIcon from "@/components/AppIcon.vue";
import axios from "axios";

const route = useRoute();
const router = useRouter();
const foods = useFoodsStore();
const cart = useCartStore();
const auth = useAuthStore();
const isLoggedIn = computed(() => auth.isLoggedIn);

const curCat = ref(null);
const searchQ = ref("");
const showCart = ref(false);
const selectedFood = ref(null);
const initialized = ref(false);
const restaurantInfo = ref(null);

const restaurantSlug = computed(() => route.query.slug || null);

// Try to decrypt restaurant token if provided
const encryptedToken = computed(() => route.query.rid || null);
const restaurantId = ref(null);

onMounted(async () => {
  // If encrypted token provided, decrypt it first
  if (encryptedToken.value) {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/qr/decrypt`,
        { params: { rid: encryptedToken.value } }
      );
      restaurantId.value = res.data.restaurantId;
    } catch (err) {
      console.error("Failed to decrypt token:", err);
      restaurantId.value = null;
    }
  } else {
    // Fallback to direct restaurant_id parameter
    const id = route.query.restaurant_id;
    if (id && !isNaN(id)) {
      restaurantId.value = parseInt(id);
    }
  }

  await foods.fetchCategories(getRestaurantParams());
  if (foods.categories.length) {
    curCat.value = foods.categories[0].id;
  }
  await loadRestaurant();
  await load();
  initialized.value = true;
});

function getRestaurantParams() {
  if (restaurantSlug.value) return { slug: restaurantSlug.value };
  if (restaurantId.value) return { restaurant_id: restaurantId.value };
  return {};
}

const tableFromQR = computed(() => {
  const t = route.query.table;
  return t && !isNaN(t) ? parseInt(t) : null;
});

async function loadRestaurant() {
  if (!restaurantId.value) {
    restaurantInfo.value = null;
    return;
  }
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/restaurants/${restaurantId.value}`
    );
    restaurantInfo.value = res.data;
  } catch (err) {
    restaurantInfo.value = null;
  }
}

let searchTimer = null;

const filteredFoods = computed(() => foods.foods);
const cartPreviewItems = computed(() => Object.values(cart.items).slice(0, 3));

function getCategoryEmoji(category) {
  const icons = {
    "made-to-order": "food",
    "ready-cooked": "food",
    dessert: "food",
  };
  return icons[category] || "food";
}

async function load() {
  const params = { ...getRestaurantParams() };
  if (curCat.value) params.category = curCat.value;
  if (searchQ.value) params.search = searchQ.value;
  await foods.fetchFoods(params);
}

function switchCategory(slug) {
  curCat.value = slug;
  load();
}

function debouncedLoad() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => load(), 350);
}

function goAdmin() {
  if (auth.isSuperAdmin) router.push("/super-admin");
  else router.push("/dashboard");
}
</script>

<style scoped>
/* ============================================================
   CSS VARIABLES (unchanged palette)
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
  --radius: 20px;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.03);
  --shadow-md: 0 6px 20px rgba(16, 24, 20, 0.08);
  --shadow-lg: 0 20px 50px rgba(16, 24, 20, 0.16);

  min-height: 100vh;
  background: #f4faf6;
  font-family: "Hanuman", "Noto Sans Khmer", system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* ============================================================
   SKELETON SHIMMER
   ============================================================ */
@keyframes shimmer {
  0% {
    background-position: -700px 0;
  }
  100% {
    background-position: 700px 0;
  }
}
.sk {
  background: linear-gradient(90deg, #e6f4ea 25%, #d3ecdc 50%, #e6f4ea 75%);
  background-size: 700px 100%;
  animation: shimmer 1.5s infinite linear;
  border-radius: 10px;
}
.tab-sk {
  height: 34px;
  width: 84px;
  flex-shrink: 0;
  border-radius: 999px;
  margin: 4px;
}
.card-sk {
  background: #fff;
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid #eaf5ed;
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

/* ============================================================
   HEADER (Layered, modern glass composition — now animated)
   ============================================================ */
.header {
  position: relative;
  background: linear-gradient(145deg, #0f766e 0%, #22c55e 55%, #16a34a 100%);
  background-size: 200% 200%;
  animation: headerGradientShift 8s ease-in-out infinite;
  padding: 40px 20px 56px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 190px;
  border-radius: 0 0 32px 32px;
}
@keyframes headerGradientShift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}
@media (max-width: 480px) {
  .header {
    padding: 30px 16px 44px;
    min-height: 160px;
    border-radius: 0 0 24px 24px;
  }
}
.header-bg-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.12) 0%, transparent 62%);
  pointer-events: none;
}
.header-bg-pattern {
  position: absolute;
  inset: -28px;
  opacity: 0.08;
  background-image: radial-gradient(circle, #fff 1.5px, transparent 1.5px);
  background-size: 28px 28px;
  pointer-events: none;
  animation: patternDrift 12s linear infinite;
}
@keyframes patternDrift {
  from {
    transform: translate(0, 0);
  }
  to {
    transform: translate(-28px, -28px);
  }
}
.header-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(30px);
  pointer-events: none;
}
.header-blob-1 {
  width: 180px;
  height: 180px;
  background: rgba(255, 255, 255, 0.14);
  top: -90px;
  right: -50px;
  animation: floatBlob1 7s ease-in-out infinite;
}
.header-blob-2 {
  width: 140px;
  height: 140px;
  background: rgba(20, 83, 45, 0.25);
  bottom: -80px;
  left: -40px;
  animation: floatBlob2 9s ease-in-out infinite;
}
@keyframes floatBlob1 {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(-16px, 18px) scale(1.08);
  }
}
@keyframes floatBlob2 {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(14px, -14px) scale(1.06);
  }
}
.header-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  max-width: 400px;
  width: 100%;
  animation: headerContentIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
@keyframes headerContentIn {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.header-logo-ring {
  width: 100px;
  height: 100px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.35);
  box-shadow:
    0 0 0 8px rgba(255, 255, 255, 0.1),
    0 10px 28px rgba(0, 0, 0, 0.18);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(6px);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation:
    logoPopIn 0.6s 0.1s cubic-bezier(0.34, 1.56, 0.64, 1) both,
    logoFloat 4.5s 0.7s ease-in-out infinite;
}
@keyframes logoPopIn {
  from {
    opacity: 0;
    transform: scale(0.6) rotate(-8deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}
@keyframes logoFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}
@media (max-width: 480px) {
  .header-logo-ring {
    width: 76px;
    height: 76px;
  }
}
.header-logo-ring:hover {
  transform: scale(1.05) rotate(1deg);
  animation-play-state: paused;
}
.header-logo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.header-text {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.header-eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.75);
}
.header-title {
  color: #fff;
  font-size: 23px;
  font-weight: 800;
  margin: 0;
  line-height: 1.3;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  animation: titleFadeUp 0.6s 0.25s ease both;
}
@keyframes titleFadeUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@media (max-width: 480px) {
  .header-title {
    font-size: 19px;
  }
}

/* ============================================================
   CONTROL BAR (tabs + search grouped as a floating card)
   ============================================================ */
.control-bar {
  position: sticky;
  top: 0;
  z-index: 50;
  margin: -28px 12px 0;
  background: var(--white);
  border-radius: 22px;
  box-shadow: var(--shadow-lg);
  border: 1px solid #eaf5ed;
  overflow: hidden;
}
@media (max-width: 480px) {
  .control-bar {
    margin: -22px 8px 0;
    border-radius: 18px;
  }
}

/* ============================================================
   TABS
   ============================================================ */
.tabs-wrap {
  overflow-x: auto;
  scrollbar-width: none;
  border-bottom: 1px solid #eef7f0;
}
.tabs-wrap::-webkit-scrollbar {
  display: none;
}
.tabs {
  display: flex;
  min-width: max-content;
  padding: 10px 12px;
  gap: 6px;
}
.tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  font-size: 13px;
  font-family: inherit;
  font-weight: 600;
  color: var(--text-light);
  border: none;
  background: transparent;
  cursor: pointer;
  white-space: nowrap;
  border-radius: 999px;
  transition: all 0.2s ease;
}
@media (max-width: 480px) {
  .tab {
    padding: 8px 13px;
    font-size: 12px;
  }
}
.tab-label {
  letter-spacing: 0.01em;
}
.tab.active {
  color: #fff;
  font-weight: 700;
  background: linear-gradient(135deg, var(--green-mid), var(--green-light));
  box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
}
.tab:hover:not(.active) {
  color: var(--green-dark);
  background: var(--green-pale);
}

/* ============================================================
   SEARCH
   ============================================================ */
.search-bar {
  padding: 12px 14px 14px;
}
.search-inner {
  position: relative;
  max-width: 100%;
  margin: 0 auto;
}
.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 17px;
  height: 17px;
  color: #9ca3af;
  pointer-events: none;
}
.search-bar input {
  width: 100%;
  padding: 12px 40px 12px 42px;
  border: 1.5px solid #e3f5e8;
  border-radius: 16px;
  font-size: 14px;
  font-family: inherit;
  background: #f6fdf8;
  color: var(--text-dark);
  outline: none;
  transition: all 0.2s;
  box-sizing: border-box;
}
.search-bar input:focus {
  border-color: var(--green-light);
  background: #fff;
  box-shadow: 0 0 0 4px rgba(74, 222, 128, 0.14);
}
.search-bar input::placeholder {
  color: #9ca3af;
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
  width: 20px;
  height: 20px;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}
.search-clear:hover {
  background: #9ca3af;
}

/* ============================================================
   MENU SECTION & GRID
   ============================================================ */
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

/* ============================================================
   EMPTY STATE
   ============================================================ */
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
  color: var(--green-mid);
  display: flex;
  align-items: center;
  justify-content: center;
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
  background: linear-gradient(135deg, var(--orange), #f97316);
  color: #fff;
  border: none;
  border-radius: 50px;
  padding: 7px 20px 7px 7px;
  font-size: 14px;
  font-family: inherit;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 10px 28px rgba(234, 88, 12, 0.38);
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
  box-shadow: 0 14px 34px rgba(234, 88, 12, 0.46);
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
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.5);
  background: #fff3e0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}
.cart-fab-label {
  display: flex;
  align-items: center;
  gap: 8px;
}
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
  padding: 12px 18px;
  font-size: 13px;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 7px;
  z-index: 100;
  transition: all 0.2s;
}
.fab-admin:hover {
  background: #111827;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

/* ============================================================
   FOOD DETAIL MODAL
   ============================================================ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 20, 14, 0.55);
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
  background: #dcfce7;
  color: #166534;
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
  color: var(--green-mid);
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
  color: #fff;
  border: none;
  border-radius: 16px;
  font-size: 15px;
  font-family: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 8px 20px rgba(22, 163, 74, 0.32);
}
.add-cart-big:hover {
  background: linear-gradient(135deg, var(--green-dark), var(--green-mid));
  transform: translateY(-2px);
  box-shadow: 0 10px 26px rgba(22, 163, 74, 0.38);
}
.add-cart-big:active {
  transform: scale(0.98);
}

/* ============================================================
   TRANSITIONS
   ============================================================ */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.22s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>