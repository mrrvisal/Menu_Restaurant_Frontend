<!-- Demo menu running on local demo data without backend requirement -->
<template>
  <div class="page">
    <SiteNav />

    <main class="menu-main">
      <!-- HEADER (MenuView layered animated gradient) -->
      <DemoHeader />

      <!-- STICKY CONTROL BAR (tabs + search, MenuView floating card) -->
      <DemoControlBar v-model:cat-id="catId" v-model:search-q="searchQ" />

      <!-- MENU GRID -->
      <DemoMenuGrid :loading="loading" :mapped-foods="mappedFoods" :cart="cart" @add-cart="add"
        @detail="selectedFood = $event" />

      <!-- CART FAB (MenuView stacked-image pill) -->
      <Transition name="fab-pop">
        <DemoCartFab v-if="cartCount > 0 && !cartOpen && !lastOrder" :cart-count="cartCount" :cart-total="cartTotal"
          :cart-preview-items="cartPreviewItems" @open="cartOpen = true" />
      </Transition>

      <!-- CART MODAL (MenuView bottom sheet) -->
      <Teleport to="body">
        <Transition name="fade">
          <DemoCartModal v-if="cartOpen" :cart-items="cartItems" :cart-total="cartTotal" :placing="placing"
            v-model:table-no="tableNo" @close="cartOpen = false" @change="change" @clear="clearCart"
            @place="placeOrder" />
        </Transition>
      </Teleport>

      <!-- FOOD DETAIL MODAL (MenuView bottom sheet) -->
      <Teleport to="body">
        <Transition name="fade">
          <DemoFoodDetailModal v-if="selectedFood" :selected-food="selectedFood" @close="selectedFood = null"
            @add="add($event); selectedFood = null" />
        </Transition>
      </Teleport>

      <!-- ORDER SUCCESS MODAL -->
      <Teleport to="body">
        <Transition name="fade">
          <DemoOrderSuccessModal v-if="lastOrder" :last-order="lastOrder" @close="lastOrder = null"
            @reset="resetDemo" />
        </Transition>
      </Teleport>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { demoCategories, demoFoods } from "@/data/demo";
import SiteNav from "@/components/SiteNav.vue";
import DemoHeader from "@/components/demo/DemoHeader.vue";
import DemoControlBar from "@/components/demo/DemoControlBar.vue";
import DemoMenuGrid from "@/components/demo/DemoMenuGrid.vue";
import DemoCartFab from "@/components/demo/DemoCartFab.vue";
import DemoCartModal from "@/components/demo/DemoCartModal.vue";
import DemoFoodDetailModal from "@/components/demo/DemoFoodDetailModal.vue";
import DemoOrderSuccessModal from "@/components/demo/DemoOrderSuccessModal.vue";
import { useDemoCart } from "@/composables/useDemoCart";

const catId = ref(demoCategories[0].id);
const searchQ = ref("");
const selectedFood = ref(null);
const loading = ref(true);

// ─── CART / CHECKOUT (the demo never talks to the backend) ──
// State + actions shared by the FAB, cart sheet and success modal.
const {
  cart, cartOpen, placing, lastOrder, tableNo,
  cartItems, cartCount, cartTotal, cartPreviewItems,
  add, change, clearCart, placeOrder, resetDemo,
} = useDemoCart();

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

.menu-main {
  position: relative;
}

/* ============================================================
   SHARED MODAL CHROME + BUTTONS (cart / detail / success all use these)
   .modal-overlay stays verbatim scoped: it carries the view's scope id
   itself, which still holds after <Teleport to="body"> — a bare
   :deep(.modal-overlay) would need a scoped ANCESTOR and never match.
   Everything INSIDE the teleported overlay is reached via :deep(),
   anchored on that overlay. Keyframes stay with the rules using them.
   ============================================================ */
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

:deep(.modal-card) {
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

@media (min-width: 560px) {
  :deep(.modal-card) {
    border-radius: 28px;
  }
}

:deep(.modal-drag-handle) {
  position: sticky;
  top: 0;
  width: 40px;
  height: 4px;
  border-radius: 4px;
  background: #e5e7eb;
  margin: 12px auto 0;
}

@media (min-width: 560px) {
  :deep(.modal-drag-handle) {
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

:deep(.modal-close) {
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

:deep(.modal-close:hover) {
  background: rgba(0, 0, 0, 0.5);
}
:deep(.add-cart-big) {
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
  text-decoration: none;
  box-sizing: border-box;
}

:deep(.add-cart-big:hover) {
  background: linear-gradient(135deg, var(--green-dark), var(--green-mid));
  transform: translateY(-2px);
  box-shadow: 0 10px 26px var(--glow-strong, rgba(22, 163, 74, 0.38));
}

:deep(.add-cart-big:active) {
  transform: scale(0.98);
}

:deep(.add-cart-big:disabled) {
  opacity: 0.7;
  cursor: default;
}
:deep(.cart-total-row) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 2px 0 14px;
  padding: 14px 2px 0;
  border-top: 1px dashed var(--green-soft);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-light);
}

:deep(.cart-total-row b) {
  font-size: 20px;
  font-weight: 800;
  color: var(--green-dark);
}
:deep(.cart-actions) {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 4px;
}

:deep(.ghost-btn) {
  padding: 14px 10px;
  border-radius: 16px;
  border: 1.5px solid var(--green-soft);
  background: #fff;
  color: var(--text-dark);
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

:deep(.ghost-btn:hover) {
  border-color: var(--green-light);
  background: var(--green-pale);
  color: var(--green-dark);
}

:deep(.spinner) {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2.5px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* TRANSITIONS — applied to the teleported overlay itself (which keeps its
   scope id), so these stay verbatim. The Transition wrappers live here. */
/* TRANSITIONS */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.22s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
