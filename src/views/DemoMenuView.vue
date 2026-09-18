<!-- frontend/src/views/DemoMenuView.vue -->
<!-- Demo menu styled 1:1 after the real customer MenuView (animated gradient
     header, sticky control bar, FoodCard grid, cart FAB, bottom-sheet modals)
     but runs fully on local demo data — no backend, no account, no real orders. -->
<template>
  <div class="page">
    <SiteNav />

    <main class="menu-main">
      <!-- HEADER (MenuView layered animated gradient) -->
      <div class="header sel-light">
        <div class="header-bg-overlay"></div>
        <div class="header-bg-pattern"></div>
        <div class="header-blob header-blob-1"></div>
        <div class="header-blob header-blob-2"></div>
        <div class="header-content">
          <span class="header-demo-chip">
            <AppIcon name="rocket" :size="12" /> {{ i18n.t.demo_badge }}
          </span>
          <div class="header-logo-ring">
            <img :src="DEMO_LOGO_URL" class="header-logo" alt="restaurant logo" />
          </div>
          <div class="header-text">
            <h1 class="header-title">{{ i18n.locale === "km" ? "ម្លប់ព្រឹកដាលីន" : "Mlob Pring Dalin" }}</h1>
            <p class="header-tagline">{{ i18n.t.demo_restaurant_tagline }}</p>
          </div>
          <router-link to="/register" class="header-cta">{{ i18n.t.get_started_free }}</router-link>
        </div>
      </div>

      <!-- STICKY CONTROL BAR (tabs + search, MenuView floating card) -->
      <div class="control-bar">
        <div class="tabs-wrap">
          <div class="tabs">
            <button
              v-for="c in demoCategories"
              :key="c.id"
              class="tab"
              :class="{ active: catId === c.id }"
              @click="catId = c.id"
            >
              <AppIcon v-if="c.icon" :name="c.icon" :size="14" />
              <AppIcon v-else name="category" :size="14" />
              <span class="tab-label">{{ i18n.locale === "km" ? c.label_km : c.label_en }}</span>
            </button>
          </div>
        </div>
        <div class="search-bar">
          <div class="search-inner">
            <svg class="search-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="8.5" cy="8.5" r="5.5" />
              <path d="M15 15l-3-3" />
            </svg>
            <input v-model="searchQ" :placeholder="i18n.t.demo_search_placeholder" />
            <button v-if="searchQ" class="search-clear" @click="searchQ = ''">
              <AppIcon name="x" :size="14" />
            </button>
          </div>
        </div>
      </div>

      <!-- MENU GRID -->
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
          <FoodCard
            v-for="food in mappedFoods"
            :key="food.id"
            :food="food"
            :cart-qty="cart[food.id]?.qty || 0"
            @add-cart="add"
            @detail="selectedFood = $event"
          />
        </div>

        <div v-else class="empty-state">
          <div class="empty-icon-ring"><AppIcon name="search" :size="36" /></div>
          <p class="empty-title">{{ i18n.t.demo_empty }}</p>
        </div>
      </div>
      <!-- CART FAB (MenuView stacked-image pill) -->
      <Transition name="fab-pop">
        <button v-if="cartCount > 0 && !cartOpen && !lastOrder" class="cart-fab" @click="cartOpen = true">
          <div class="cart-fab-images">
            <div
              v-for="(item, index) in cartPreviewItems"
              :key="item.id"
              class="cart-fab-img"
              :style="{ zIndex: cartPreviewItems.length - index, marginLeft: index > 0 ? '-10px' : '0' }"
            >
              <img v-if="item.img" :src="item.img" :alt="item.name" />
              <AppIcon v-else :name="item.icon || 'plate'" :size="34" />
            </div>
          </div>
          <span class="cart-fab-label">
            <span class="cart-fab-badge">{{ cartCount }}</span>
            <span class="cart-fab-total">{{ cartTotal.toFixed(0) }}៛</span>
          </span>
        </button>
      </Transition>

      <!-- CART MODAL (MenuView bottom sheet) -->
      <Teleport to="body">
        <Transition name="fade">
          <div v-if="cartOpen" class="modal-overlay" @click.self="cartOpen = false">
            <div class="modal-card">
              <div class="modal-drag-handle"></div>
              <button class="modal-close" @click="cartOpen = false">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <div class="cart-body">
                <h2 class="cart-title">{{ i18n.t.demo_cart_title }}</h2>
                <div v-if="!cartItems.length" class="cart-empty">
                  <AppIcon name="cart" :size="42" />
                  <p>{{ i18n.t.demo_cart_empty }}</p>
                </div>
                <template v-else>
                  <div class="cart-list">
                    <div v-for="item in cartItems" :key="item.id" class="cart-row">
                      <div class="cart-row-img">
                        <img v-if="item.img" :src="item.img" :alt="item.name" />
                        <AppIcon v-else :name="item.icon || 'plate'" :size="32" />
                      </div>
                      <div class="cart-row-info">
                        <b>{{ item.name }}</b>
                        <span>{{ item.price.toLocaleString() }}៛</span>
                      </div>
                      <div class="cart-stepper">
                        <button @click="change(item.id, -1)" aria-label="minus">−</button>
                        <span>{{ item.qty }}</span>
                        <button @click="change(item.id, 1)" aria-label="plus">+</button>
                      </div>
                      <b class="cart-row-sub">{{ (item.price * item.qty).toLocaleString() }}៛</b>
                    </div>
                  </div>
                  <div class="cart-total-row">
                    <span>{{ i18n.t.total }}</span>
                    <b>{{ cartTotal.toLocaleString() }}៛</b>
                  </div>
                  <input v-model="tableNo" class="table-input" :placeholder="i18n.t.demo_table_ph" />
                  <div class="cart-actions">
                    <button class="ghost-btn" @click="clearCart">{{ i18n.t.demo_clear }}</button>
                    <button class="add-cart-big" :disabled="placing" @click="placeOrder">
                      <span v-if="placing" class="spinner"></span>
                      {{ placing ? i18n.t.demo_placing : i18n.t.demo_place_order }}
                    </button>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- FOOD DETAIL MODAL (MenuView bottom sheet) -->
      <Teleport to="body">
        <Transition name="fade">
          <div v-if="selectedFood" class="modal-overlay" @click.self="selectedFood = null">
            <div class="modal-card">
              <div class="modal-drag-handle"></div>
              <button class="modal-close" @click="selectedFood = null">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <div class="detail-img-wrap">
                <img v-if="selectedFood.img_url" :src="selectedFood.img_url" :alt="selectedFood.name" />
                <span v-else class="detail-img-placeholder"><AppIcon :name="selectedFood.icon || 'plate'" :size="36" /></span>
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
                <button class="add-cart-big" @click="add(selectedFood); selectedFood = null;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  {{ i18n.t.add }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- ORDER SUCCESS MODAL -->
      <Teleport to="body">
        <Transition name="fade">
          <div v-if="lastOrder" class="modal-overlay" @click.self="lastOrder = null">
            <div class="modal-card success-card">
              <div class="modal-drag-handle"></div>
              <button class="modal-close" @click="lastOrder = null">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <div class="success-body">
                <div class="success-icon"><AppIcon name="check-circle" :size="46" /></div>
                <h2 class="detail-name">{{ i18n.t.demo_success_title }}</h2>
                <p class="success-desc">{{ i18n.t.demo_success_desc }}</p>
                <div class="success-code">
                  {{ i18n.t.demo_order_code }}: <b>{{ lastOrder.code }}</b>
                  · {{ i18n.t.table }} <b>{{ lastOrder.tableNo }}</b>
                </div>
                <ul class="success-items">
                  <li v-for="item in lastOrder.items" :key="item.id">
                    <span>{{ item.name }} × {{ item.qty }}</span>
                    <span>{{ (item.price * item.qty).toLocaleString() }}៛</span>
                  </li>
                </ul>
                <div class="cart-total-row">
                  <span>{{ i18n.t.total }}</span>
                  <b>{{ lastOrder.total.toLocaleString() }}៛</b>
                </div>
                <div class="cart-actions">
                  <button class="ghost-btn" @click="resetDemo">{{ i18n.t.demo_new_order }}</button>
                  <router-link to="/register" class="add-cart-big register-cta">{{ i18n.t.get_started_free }}</router-link>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </main>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useI18nStore } from "@/stores/i18n";
import { DEMO_LOGO_URL, demoCategories, demoFoods } from "@/data/demo";
import SiteNav from "@/components/SiteNav.vue";
import FoodCard from "@/components/FoodCard.vue";
import AppIcon from "@/components/AppIcon.vue";

const i18n = useI18nStore();
const catId = ref(demoCategories[0].id);
const searchQ = ref("");
const cart = ref({});
const cartOpen = ref(false);
const placing = ref(false);
const lastOrder = ref(null);
const tableNo = ref("");
const selectedFood = ref(null);
const loading = ref(true);

// Brief skeleton so the demo shows the same loading state as the real menu
let loadTimer = null;
onMounted(() => {
  loadTimer = setTimeout(() => (loading.value = false), 600);
});
onUnmounted(() => clearTimeout(loadTimer));

const filteredFoods = computed(() => {
  const q = searchQ.value.trim().toLowerCase();
  return demoFoods.filter((f) => {
    const inCat = f.category === catId.value;
    const inQ =
      !q ||
      f.name.toLowerCase().includes(q) ||
      f.name_en.toLowerCase().includes(q);
    return inCat && inQ;
  });
});

// Map local demo data onto the same shape MenuView feeds <FoodCard />
const mappedFoods = computed(() =>
  filteredFoods.value.map((f) => ({
    id: f.id,
    name: f.name,
    name_en: f.name_en,
    price: f.price,
    status: f.sold_out ? "unavailable" : "available",
    img_url: f.img || null,
    icon: f.icon,
    category: f.category,
  }))
);

const cartItems = computed(() => Object.values(cart.value));
const cartCount = computed(() =>
  cartItems.value.reduce((s, v) => s + v.qty, 0)
);
const cartTotal = computed(() =>
  cartItems.value.reduce((s, v) => s + v.price * v.qty, 0)
);
const cartPreviewItems = computed(() => cartItems.value.slice(0, 3));

function add(food) {
  if (food.status === "unavailable") return;
  if (cart.value[food.id]) {
    cart.value[food.id].qty += 1;
  } else {
    cart.value[food.id] = {
      id: food.id,
      qty: 1,
      name: food.name,
      price: Number(food.price),
      icon: food.icon,
      img: food.img_url,
    };
  }
}

function change(id, delta) {
  if (!cart.value[id]) return;
  cart.value[id].qty += delta;
  if (cart.value[id].qty <= 0) delete cart.value[id];
}

function clearCart() {
  cart.value = {};
}

function placeOrder() {
  if (placing.value || cartCount.value === 0) return;
  placing.value = true;
  // Simulated checkout — the demo never talks to the backend.
  setTimeout(() => {
    lastOrder.value = {
      code: "DEMO-" + Math.floor(1000 + Math.random() * 9000),
      tableNo: tableNo.value.trim() || "5",
      items: cartItems.value.map((it) => ({ ...it })),
      total: cartTotal.value,
    };
    cart.value = {};
    cartOpen.value = false;
    placing.value = false;
  }, 900);
}

function resetDemo() {
  lastOrder.value = null;
}
</script>

<style scoped>
/* ============================================================
   CSS VARIABLES — same palette as MenuView
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

  /* The admin theme store (stores/theme.js) paints --primary*, --surface-green,
     --border-green and --on-primary as INLINE vars on <html>, defaulting to
     teal. The shared FoodCard prefers those first, so without these overrides
     the demo's food cards (buttons, prices, status pill, shadows) turn
     blue/teal. Pin them to this page's green palette — a rule on .page always
     beats the <html> inline styles for everything inside the demo page. */
  --primary: var(--green-mid);
  --primary-dark: var(--green-dark);
  --primary-light: var(--green-light);
  --primary-strong: var(--green-mid);
  --primary-glow: rgba(22, 163, 74, 0.15);
  --primary-glow-strong: rgba(22, 163, 74, 0.25);
  --on-primary: #ffffff;
  --surface-green: var(--green-pale);
  --border-green: #c8e6c9;
  --tint-hover: var(--green-pale);
  --shadow-tint-soft: rgba(16, 24, 20, 0.08);
  --shadow-tint: rgba(16, 24, 20, 0.16);

  min-height: 100vh;
  background: var(--green-pale, #f4faf6);
  font-family: "Hanuman", "Noto Sans Khmer", system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.menu-main { position: relative; }

/* HEADER — MenuView layered animated gradient */
.header {
  position: relative;
  background: var(
    --header-grad,
    linear-gradient(145deg, #0f766e 0%, #22c55e 55%, #16a34a 100%)
  );
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
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
@media (max-width: 480px) {
  .header { padding: 30px 16px 44px; min-height: 160px; border-radius: 0 0 24px 24px; }
}
.header-bg-overlay {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.12) 0%, transparent 62%);
  pointer-events: none;
}
.header-bg-pattern {
  position: absolute; inset: -28px; opacity: 0.08;
  background-image: radial-gradient(circle, #fff 1.5px, transparent 1.5px);
  background-size: 28px 28px;
  pointer-events: none;
  animation: patternDrift 12s linear infinite;
}
@keyframes patternDrift {
  from { transform: translate(0, 0); }
  to { transform: translate(-28px, -28px); }
}
.header-blob { position: absolute; border-radius: 50%; filter: blur(30px); pointer-events: none; }
.header-blob-1 {
  width: 180px; height: 180px;
  background: rgba(255, 255, 255, 0.14);
  top: -90px; right: -50px;
  animation: floatBlob1 7s ease-in-out infinite;
}
.header-blob-2 {
  width: 140px; height: 140px;
  background: var(--header-blob2, rgba(20, 83, 45, 0.25));
  bottom: -80px; left: -40px;
  animation: floatBlob2 9s ease-in-out infinite;
}
@keyframes floatBlob1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-16px, 18px) scale(1.08); }
}
@keyframes floatBlob2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(14px, -14px) scale(1.06); }
}
.header-content {
  position: relative; z-index: 2;
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  max-width: 400px; width: 100%;
  animation: headerContentIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
@keyframes headerContentIn {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
.header-demo-chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 12px; border-radius: 20px;
  background: rgba(255, 255, 255, 0.18);
  color: #fff; font-size: 11px; font-weight: 800;
  letter-spacing: 0.08em; text-transform: uppercase;
  backdrop-filter: blur(4px);
}
.header-logo-ring {
  width: 100px; height: 100px; border-radius: 20px;
  display: flex; align-items: center; justify-content: center; overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 0 0 8px rgba(255, 255, 255, 0.1), 0 10px 28px rgba(0, 0, 0, 0.18);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(6px);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation:
    logoPopIn 0.6s 0.1s cubic-bezier(0.34, 1.56, 0.64, 1) both,
    logoFloat 4.5s 0.7s ease-in-out infinite;
}
@keyframes logoPopIn {
  from { opacity: 0; transform: scale(0.6) rotate(-8deg); }
  to { opacity: 1; transform: scale(1) rotate(0deg); }
}
@keyframes logoFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
@media (max-width: 480px) { .header-logo-ring { width: 76px; height: 76px; } }
.header-logo-ring:hover { transform: scale(1.05) rotate(1deg); animation-play-state: paused; }
.header-logo { width: 100%; height: 100%; object-fit: cover; }
.header-text { text-align: center; }
.header-title {
  color: var(--header-fg, #fff); font-size: 23px; font-weight: 800; margin: 0;
  line-height: 1.3; text-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  animation: titleFadeUp 0.6s 0.25s ease both;
}
@keyframes titleFadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.header-tagline {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px; margin: 4px 0 0;
  animation: titleFadeUp 0.6s 0.32s ease both;
}
.header-cta {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 10px 22px; border-radius: 12px;
  background: rgba(255, 255, 255, 0.92); color: var(--green-dark, #14532d);
  font-size: 13px; font-weight: 800; text-decoration: none;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
  transition: all 0.2s;
  animation: titleFadeUp 0.6s 0.4s ease both;
}
.header-cta:hover { transform: translateY(-2px); background: #fff; }
@media (max-width: 480px) { .header-title { font-size: 19px; } }

/* CONTROL BAR — MenuView sticky floating card */
.control-bar {
  position: sticky; top: 12px; z-index: 50;
  margin: -28px 12px 0;
  background: var(--white);
  border-radius: 22px;
  box-shadow: 0 20px 50px var(--shadow-tint, rgba(16, 24, 20, 0.16));
  border: 1px solid var(--green-soft, #eaf5ed);
  overflow: hidden;
}
@media (max-width: 480px) {
  .control-bar { margin: -22px 8px 0; border-radius: 18px; }
}
.tabs-wrap { overflow-x: auto; scrollbar-width: none; border-bottom: 1px solid var(--green-pale, #eef7f0); }
.tabs-wrap::-webkit-scrollbar { display: none; }
.tabs { display: flex; min-width: max-content; padding: 10px 12px; gap: 6px; }
.tab {
  display: flex; align-items: center; gap: 6px;
  padding: 9px 16px; font-size: 13px; font-family: inherit; font-weight: 600;
  color: var(--text-light); border: none; background: transparent;
  cursor: pointer; white-space: nowrap; border-radius: 999px;
  transition: all 0.2s ease;
}
@media (max-width: 480px) { .tab { padding: 8px 13px; font-size: 12px; } }
.tab-label { letter-spacing: 0.01em; }
.tab.active {
  color: var(--on-primary, #fff); font-weight: 700;
  background: linear-gradient(135deg, var(--green-mid), var(--green-light));
  box-shadow: 0 4px 12px var(--glow-strong, rgba(22, 163, 74, 0.3));
}
.tab:hover:not(.active) { color: var(--green-dark); background: var(--green-pale); }
.search-bar { padding: 12px 14px 14px; }
.search-inner { position: relative; max-width: 100%; margin: 0 auto; }
.search-icon {
  position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
  width: 17px; height: 17px; color: #9ca3af; pointer-events: none;
}
.search-bar input {
  width: 100%; padding: 12px 40px 12px 42px;
  border: 1.5px solid var(--green-soft, #e3f5e8); border-radius: 16px;
  font-size: 14px; font-family: inherit;
  background: var(--green-pale, #f6fdf8); color: var(--text-dark);
  outline: none; transition: all 0.2s; box-sizing: border-box;
}
.search-bar input:focus {
  border-color: var(--green-strong, var(--green-light)); background: #fff;
  box-shadow: 0 0 0 4px var(--glow-soft, rgba(74, 222, 128, 0.14));
}
.search-bar input::placeholder { color: #9ca3af; }
.search-clear {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  background: #d1d5db; color: #fff; border: none; border-radius: 50%;
  width: 20px; height: 20px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.search-clear:hover { background: #9ca3af; }

/* SKELETON SHIMMER — same as MenuView */
@keyframes shimmer {
  0% { background-position: -700px 0; }
  100% { background-position: 700px 0; }
}
.sk {
  background: linear-gradient(90deg, var(--green-pale, #e6f4ea) 25%, var(--green-soft, #d3ecdc) 50%, var(--green-pale, #e6f4ea) 75%);
  background-size: 700px 100%;
  animation: shimmer 1.5s infinite linear;
  border-radius: 10px;
}
.card-sk {
  background: #fff; border-radius: var(--radius); overflow: hidden;
  box-shadow: var(--shadow-sm); border: 1px solid var(--green-soft, #eaf5ed);
}
.card-img-sk { width: 100%; aspect-ratio: 1 / 1; border-radius: 0; flex-shrink: 0; }
.card-body-sk { padding: 12px; display: flex; flex-direction: column; gap: 9px; }
.line-sk { height: 12px; width: 100%; border-radius: 6px; }
.line-sk.short { width: 60%; }
.line-sk.price { width: 40%; height: 16px; }

/* MENU GRID — same breakpoints as MenuView */
.menu-section { padding: 22px 14px 120px; }
@media (max-width: 480px) { .menu-section { padding: 18px 10px 100px; } }
.food-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
@media (max-width: 480px) { .food-grid { gap: 10px; } }
@media (max-width: 1100px) { .food-grid { grid-template-columns: repeat(4, 1fr); } }
@media (max-width: 800px) { .food-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 560px) { .food-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 360px) { .food-grid { grid-template-columns: 1fr; } }

/* EMPTY STATE */
.empty-state { text-align: center; padding: 64px 20px 40px; }
.empty-icon-ring {
  width: 78px; height: 78px; margin: 0 auto 16px; border-radius: 50%;
  background: var(--green-pale); color: var(--green-strong, var(--green-mid));
  display: flex; align-items: center; justify-content: center;
}
.empty-title { font-size: 15px; font-weight: 700; color: var(--text-dark); margin: 0; }

/* CART FAB — MenuView stacked-image pill */
.cart-fab {
  position: fixed; bottom: 26px; left: 16px;
  background: linear-gradient(135deg, var(--green-mid), var(--green-light));
  color: var(--on-primary, #fff); border: none; border-radius: 50px;
  padding: 7px 20px 7px 7px; font-size: 14px; font-family: inherit; font-weight: 700;
  cursor: pointer;
  display: flex; align-items: center; gap: 10px; z-index: 100;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@media (max-width: 480px) {
  .cart-fab { bottom: 18px; left: 12px; padding: 6px 14px 6px 6px; font-size: 12px; gap: 8px; }
  .cart-fab-img { width: 28px; height: 28px; }
  .cart-fab-badge { width: 18px; height: 18px; font-size: 10px; }
  .cart-fab-total { font-size: 11px; }
}
.cart-fab:hover { transform: translateY(-4px) scale(1.02);}
.cart-fab:active { transform: scale(0.97); }
.cart-fab-images { display: flex; align-items: center; flex-shrink: 0; }
.cart-fab-img {
  width: 34px; height: 34px; border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.5);
  background: #fff; display: inline-flex; align-items: center; justify-content: center;
  font-size: 15px; flex-shrink: 0; position: relative; overflow: hidden;
}
.cart-fab-img img { width: 100%; height: 100%; object-fit: cover; }
.cart-fab-label { display: flex; align-items: center; gap: 8px; }
.cart-fab-badge {
  background: #fff; color: var(--green-strong, var(--green-mid)); border-radius: 50%;
  width: 22px; height: 22px; font-size: 11px; font-weight: 800;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.cart-fab-total { font-size: 13px; }
.fab-pop-enter-active { animation: fabIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.fab-pop-leave-active { animation: fabIn 0.18s reverse ease-in; }
@keyframes fabIn {
  from { transform: translateY(18px) scale(0.85); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}

/* MODALS — MenuView bottom sheet */
.modal-overlay {
  /* The modals are Teleported to <body>, OUTSIDE .page — they only inherit
     the admin theme store's teal vars from <html>. Pin the demo's green
     palette here (literal hex: --green-* don't exist at root level) so every
     teleported modal (cart, detail, success) stays green, not blue/teal. */
  --green-pale: #f0fdf4;
  --green-soft: #bbf7d0;
  --green-light: #4ade80;
  --green-mid: #16a34a;
  --green-strong: #16a34a;
  --green-dark: #14532d;
  --primary: #16a34a;
  --primary-dark: #14532d;
  --primary-strong: #16a34a;
  --primary-glow: rgba(22, 163, 74, 0.15);
  --primary-glow-strong: rgba(22, 163, 74, 0.25);
  --on-primary: #ffffff;
  --surface-green: #f0fdf4;
  --border-green: #c8e6c9;
  --tint-hover: #f0fdf4;
  --white: #ffffff;
  --text-dark: #111827;
  --text-light: #6b7280;
  --radius: 20px;

  position: fixed; inset: 0;
  background: rgba(10, 20, 14, 0.55);
  backdrop-filter: blur(2px);
  z-index: 200;
  display: flex; align-items: flex-end; justify-content: center; padding: 0;
}
@media (min-width: 560px) { .modal-overlay { align-items: center; padding: 20px; } }
.modal-card {
  background: #fff; border-radius: 28px 28px 0 0;
  width: 100%; max-width: 480px; max-height: 92vh; overflow-y: auto;
  box-shadow: 0 -12px 48px rgba(0, 0, 0, 0.18);
  position: relative;
  animation: slideUp 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@media (min-width: 560px) { .modal-card { border-radius: 28px; } }
.modal-drag-handle {
  position: sticky; top: 0; width: 40px; height: 4px; border-radius: 4px;
  background: #e5e7eb; margin: 12px auto 0;
}
@media (min-width: 560px) { .modal-drag-handle { display: none; } }
@keyframes slideUp {
  from { transform: translateY(40px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.modal-close {
  position: absolute; top: 14px; right: 14px; z-index: 10;
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(0, 0, 0, 0.32); color: #fff; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s; backdrop-filter: blur(4px);
}
.modal-close:hover { background: rgba(0, 0, 0, 0.5); }

/* FOOD DETAIL (MenuView) */
.detail-img-wrap {
  width: 100%; height: 300px; overflow: hidden;
  background: var(--green-pale);
  display: flex; align-items: center; justify-content: center;
  position: relative;
}
@media (max-width: 480px) { .detail-img-wrap { height: 240px; } }
.detail-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
.detail-img-gradient {
  position: absolute; bottom: 0; left: 0; right: 0; height: 110px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.22), transparent);
  pointer-events: none;
}
.detail-img-placeholder { font-size: 80px; }
.detail-body { padding: 22px 22px 30px; }
@media (max-width: 480px) { .detail-body { padding: 18px 18px 24px; } }
.detail-header { margin-bottom: 10px; }
.detail-status {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 12px; padding: 5px 13px; border-radius: 20px; font-weight: 600;
}
.detail-status.available { background: var(--green-pale, #dcfce7); color: var(--green-dark, #166534); }
.detail-status.unavailable { background: #fee2e2; color: #991b1b; }
.detail-name {
  font-size: 25px; font-weight: 700; color: var(--text-dark);
  margin: 0 0 4px; line-height: 1.3;
}
@media (max-width: 480px) { .detail-name { font-size: 21px; } }
.detail-sub { margin: 0; font-size: 13px; color: var(--text-light); }
.detail-price { font-size: 25px; font-weight: 800; color: var(--green-strong, var(--green-mid)); margin: 6px 0 22px; }
@media (max-width: 480px) { .detail-price { font-size: 21px; margin-bottom: 18px; } }
.add-cart-big {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; padding: 16px;
  background: linear-gradient(135deg, var(--green-mid), var(--green-light));
  color: var(--on-primary, #fff); border: none; border-radius: 16px;
  font-size: 15px; font-family: inherit; font-weight: 700; cursor: pointer;
  transition: all 0.2s; box-shadow: 0 8px 20px var(--glow-strong, rgba(22, 163, 74, 0.32));
  text-decoration: none; box-sizing: border-box;
}
.add-cart-big:hover {
  background: linear-gradient(135deg, var(--green-dark), var(--green-mid));
  transform: translateY(-2px);
  box-shadow: 0 10px 26px var(--glow-strong, rgba(22, 163, 74, 0.38));
}
.add-cart-big:active { transform: scale(0.98); }
.add-cart-big:disabled { opacity: 0.7; cursor: default; }
/* ============================================================
   DEMO CART MODAL (MenuView bottom-sheet body)
   ============================================================ */
.cart-body { padding: 20px 20px 26px; }
@media (max-width: 480px) { .cart-body { padding: 16px 16px 22px; } }
.cart-title {
  margin: 0 0 16px;
  font-size: 20px; font-weight: 800; color: var(--text-dark);
}
.cart-empty {
  text-align: center; padding: 34px 0 16px;
  color: var(--text-light); font-size: 13px; font-weight: 600;
}
.cart-empty svg { color: var(--green-light); display: block; margin: 0 auto 8px; }
.cart-list { display: grid; gap: 10px; margin-bottom: 14px; }
.cart-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px; border-radius: 12px; background: var(--green-pale);
}
.cart-row-img {
  width: 44px; height: 44px; border-radius: 10px; overflow: hidden; flex-shrink: 0;
  background: var(--green-soft); display: flex; align-items: center; justify-content: center;
  font-size: 18px;
}
.cart-row-img img { width: 100%; height: 100%; object-fit: cover; }
.cart-row-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.cart-row-info b {
  font-size: 13px; color: var(--text-dark);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.cart-row-info span { font-size: 11px; color: var(--text-light); }
.cart-stepper {
  display: inline-flex; align-items: center; gap: 8px; flex-shrink: 0;
  padding: 4px 8px; border-radius: 999px;
  background: #fff; border: 1px solid var(--border-green);
}
.cart-stepper button {
  width: 24px; height: 24px; border-radius: 50%;
  border: none; background: var(--green-pale); color: var(--green-mid);
  font-size: 15px; font-weight: 800; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: transform 0.15s, background 0.15s;
}
.cart-stepper button:hover { background: var(--green-soft); transform: scale(1.1); }
.cart-stepper span { min-width: 18px; text-align: center; font-size: 13px; font-weight: 800; color: var(--text-dark); }
.cart-row-sub { font-size: 13px; color: var(--green-dark); white-space: nowrap; }
.cart-total-row {
  display: flex; justify-content: space-between; align-items: center;
  margin: 2px 0 14px; padding: 14px 2px 0;
  border-top: 1px dashed var(--green-soft);
  font-size: 14px; font-weight: 600; color: var(--text-light);
}
.cart-total-row b { font-size: 20px; font-weight: 800; color: var(--green-dark); }
.table-input {
  width: 100%; padding: 12px 14px;
  border: 1.5px solid var(--green-soft); border-radius: 12px;
  font-size: 14px; font-family: inherit; color: var(--text-dark);
  background: var(--green-pale); outline: none; transition: all 0.2s;
  box-sizing: border-box;
}
.table-input:focus {
  border-color: var(--green-light); background: #fff;
  box-shadow: 0 0 0 4px var(--glow-soft, rgba(74, 222, 128, 0.14));
}
.cart-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 4px; }
.ghost-btn {
  padding: 14px 10px; border-radius: 16px;
  border: 1.5px solid var(--green-soft); background: #fff; color: var(--text-dark);
  font-family: inherit; font-size: 14px; font-weight: 700; cursor: pointer;
  transition: all 0.2s;
}
.ghost-btn:hover { border-color: var(--green-light); background: var(--green-pale); color: var(--green-dark); }
.spinner {
  width: 16px; height: 16px; border-radius: 50%;
  border: 2.5px solid rgba(255, 255, 255, 0.4); border-top-color: #fff;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ORDER SUCCESS (simulated demo order) */
.success-body { padding: 26px 22px 28px; text-align: center; }
@media (max-width: 480px) { .success-body { padding: 20px 16px 24px; } }
.success-icon {
  width: 78px; height: 78px; margin: 0 auto 14px; border-radius: 50%;
  background: var(--green-pale); color: var(--green-mid);
  display: flex; align-items: center; justify-content: center;
  animation: checkPop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
@keyframes checkPop {
  from { transform: scale(0.4); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.success-desc { margin: 6px 0 14px; font-size: 13px; line-height: 1.6; color: var(--text-light); }
.success-code {
  display: block; padding: 10px 14px; border-radius: 12px; margin-bottom: 14px;
  background: var(--green-pale); border: 1px dashed var(--green-soft);
  font-size: 12px; font-weight: 600; color: var(--green-dark);
}
.success-code b { font-size: 15px; letter-spacing: 0.03em; }
.success-items {
  list-style: none; margin: 0 0 4px; padding: 0 2px; text-align: left;
}
.success-items li {
  display: flex; justify-content: space-between; align-items: center; gap: 10px;
  padding: 7px 0; font-size: 12.5px; color: var(--text-dark);
}
.success-items li + li { border-top: 1px solid var(--green-pale); }
.success-card .cart-actions { margin-top: 14px; }
.success-card .register-cta { justify-content: center; }


/* TRANSITIONS */
.fade-enter-active, .fade-leave-active { transition: opacity 0.22s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

