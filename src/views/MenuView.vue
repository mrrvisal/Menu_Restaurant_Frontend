<!-- frontend/src/views/MenuView.vue -->
<template>
  <div class="page">
    <!-- HEADER -->
    <div class="header">
      <div class="header-bg-pattern"></div>
      <div class="header-content">
        <div class="header-logo-wrapper">
          <img
            :src="
              restaurantInfo?.logo_url ||
              'https://res.cloudinary.com/daji2ml3y/image/upload/v1777712294/ChatGPT_Image_May_2_2026_03_39_44_PM-Picsart-BackgroundRemover_1_x4yi9t.png'
            "
            class="header-logo"
            alt="restaurant logo"
          />
        </div>
        <div class="header-text">
          <h1 class="header-title">
            {{ restaurantInfo?.name || "Digital Menu" }}
          </h1>
          <p class="header-subtitle">
            {{
              restaurantInfo?.default_language === "en"
                ? "Scan the QR and order from your table"
                : "ស្កេន QR និងបញ្ជាទិញពីតុអ្នក"
            }}
          </p>
        </div>
      </div>
      <div class="header-wave">
        <svg
          viewBox="0 0 1440 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0 20 C240 0 480 40 720 20 C960 0 1200 40 1440 20 L1440 40 L0 40 Z"
            fill="#f4faf6"
          />
        </svg>
      </div>
    </div>

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
        <div class="empty-icon"><AppIcon name="search" :size="48" /></div>
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
            :src="item.img_url"
            :alt="item.name"
            class="cart-fab-img"
            :style="{
              zIndex: cartPreviewItems.length - index,
              marginLeft: index > 0 ? '-8px' : '0',
            }"
          />
          <span
            v-for="(item, index) in cartPreviewItems.filter((i) => !i.img_url)"
            :key="'icon-' + index"
            class="cart-fab-img cart-fab-img--emoji"
            :style="{
              zIndex: cartPreviewItems.length - index,
              marginLeft: index > 0 ? '-8px' : '0',
            }"
          >
            <AppIcon name="food" :size="16" />
          </span>
        </div>
        <span class="cart-fab-label">
          <span class="cart-fab-badge">{{ cart.count }}</span>
          <span class="cart-fab-total">{{ cart.total.toFixed(0) }}៛</span>
        </span>
      </button>
    </Transition>

    <!-- ADMIN FAB (only for logged in users) -->
    <button v-if="isLoggedIn" class="fab-admin" @click="goAdmin">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      Admin
    </button>

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
const restaurantId = computed(() => {
  const id = route.query.restaurant_id;
  if (id && !isNaN(id)) return parseInt(id);
  const rid = route.query.rid;
  if (rid) {
    try {
      const decoded = decodeURIComponent(rid);
      const parts = decoded.split(".");
      if (parts.length === 2) {
        const iv = atob(parts[0].replace(/_/g, "/").replace(/-/g, "+"));
        const data = atob(parts[1].replace(/_/g, "/").replace(/-/g, "+"));
        return parseInt(data, 10);
      }
    } catch {
      return null;
    }
  }
  return null;
});

const tableFromQR = computed(() => {
  const t = route.query.table;
  return t && !isNaN(t) ? parseInt(t) : null;
});

const restaurantParams = computed(() => {
  if (restaurantSlug.value) return { slug: restaurantSlug.value };
  if (restaurantId.value) return { restaurant_id: restaurantId.value };
  return {};
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
  const params = { ...restaurantParams.value };
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

onMounted(async () => {
  await foods.fetchCategories(restaurantParams.value);
  if (foods.categories.length) {
    curCat.value = foods.categories[0].id;
  }
  await loadRestaurant();
  await load();
  initialized.value = true;
});

function goAdmin() {
  if (auth.isSuperAdmin) router.push("/super-admin");
  else router.push("/dashboard");
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
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.03);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 12px 40px rgba(0, 0, 0, 0.12);

  min-height: 100vh;
  background: #f4faf6;
  font-family: "Hanuman", "Noto Sans Khmer", system-ui, sans-serif;
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
   HEADER
   ============================================================ */
.header {
  position: relative;
  background: linear-gradient(135deg, #0f766e 0%, #22c55e 50%, #86efac 100%);
  padding: 40px 20px 36px;
  text-align: center;
  overflow: hidden;
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.header-bg-pattern {
  position: absolute;
  inset: 0;
  opacity: 0.08;
  background-image: radial-gradient(
      circle at 20% 50%,
      #fff 1px,
      transparent 1px
    ),
    radial-gradient(circle at 80% 20%, #fff 1px, transparent 1px),
    radial-gradient(circle at 50% 80%, #fff 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
}
.header-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.header-logo-wrapper {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  backdrop-filter: blur(4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}
.header-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.15));
}
.header-text {
  text-align: center;
}
.header-title {
  color: #fff;
  font-size: 22px;
  font-weight: 800;
  margin: 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.header-subtitle {
  color: rgba(255, 255, 255, 0.75);
  font-size: 13px;
  margin: 4px 0 0;
  font-weight: 500;
}
.header-wave {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  pointer-events: none;
  z-index: 3;
}
.header-wave svg {
  width: 100%;
  height: 100%;
  display: block;
}

/* ============================================================
   TABS
   ============================================================ */
.tabs-wrap {
  background: var(--white);
  border-bottom: 1px solid #e2f0e6;
  overflow-x: auto;
  scrollbar-width: none;
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}
.tabs-wrap::-webkit-scrollbar {
  display: none;
}
.tabs {
  display: flex;
  min-width: max-content;
  padding: 0 12px;
  gap: 2px;
}
.tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 14px 18px 12px;
  font-size: 13px;
  font-family: inherit;
  font-weight: 600;
  color: var(--text-light);
  border: none;
  background: none;
  cursor: pointer;
  white-space: nowrap;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
  position: relative;
  top: 1px;
}
.tab-icon {
  font-size: 16px;
}
.tab-label {
  letter-spacing: 0.01em;
}
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
  padding: 11px 40px 11px 42px;
  border: 1.5px solid #d1fae5;
  border-radius: 28px;
  font-size: 14px;
  font-family: inherit;
  background: #f0fdf4;
  color: var(--text-dark);
  outline: none;
  transition: all 0.2s;
}
.search-bar input:focus {
  border-color: var(--green-light);
  box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.12);
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
  padding: 16px 14px 120px;
}
.food-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
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
  padding: 60px 20px 40px;
}
.empty-icon {
  font-size: 48px;
  margin-bottom: 14px;
  opacity: 0.3;
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
  padding: 7px 18px 7px 7px;
  font-size: 14px;
  font-family: inherit;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(234, 88, 12, 0.4);
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 100;
  transition: all 0.2s;
}
.cart-fab:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 28px rgba(234, 88, 12, 0.5);
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
  border: 2px solid rgba(255, 255, 255, 0.45);
  background: #fff3e0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}
.cart-fab-img--emoji {
  font-size: 16px;
  line-height: 34px;
  text-align: center;
}
.cart-fab-label {
  display: flex;
  align-items: center;
  gap: 7px;
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
  background: rgba(0, 0, 0, 0.55);
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
  border-radius: 24px 24px 0 0;
  width: 100%;
  max-width: 480px;
  max-height: 92vh;
  overflow-y: auto;
  box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.15);
  position: relative;
  animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
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
    border-radius: 24px;
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
  background: rgba(0, 0, 0, 0.3);
  color: #fff;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}
.modal-close:hover {
  background: rgba(0, 0, 0, 0.5);
}
.detail-img-wrap {
  width: 100%;
  height: 380px;
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
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.2), transparent);
  pointer-events: none;
}
.detail-img-placeholder {
  font-size: 80px;
}
.detail-body {
  padding: 20px 22px 28px;
}
.detail-header {
  margin-bottom: 10px;
}
.detail-status {
  display: inline-block;
  font-size: 12px;
  padding: 4px 12px;
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
  font-size: 24px;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 4px;
  line-height: 1.3;
}
.detail-name-en {
  font-size: 14px;
  color: var(--text-light);
  margin-bottom: 8px;
}
.detail-price {
  font-size: 24px;
  font-weight: 800;
  color: var(--green-mid);
  margin-bottom: 20px;
}
.add-cart-big {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, var(--green-mid), var(--green-light));
  color: #fff;
  border: none;
  border-radius: 14px;
  font-size: 15px;
  font-family: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 14px rgba(22, 163, 74, 0.3);
}
.add-cart-big:hover {
  background: linear-gradient(135deg, var(--green-dark), var(--green-mid));
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(22, 163, 74, 0.35);
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