import { ref, computed } from "vue";

// ─── DEMO CART (local only — the demo never talks to the backend) ──
// Cart state + actions shared by the cart FAB, cart sheet and success
// modal. Plain per-instance refs (NOT a module singleton), so leaving
// the page still resets everything exactly like the original view.
export function useDemoCart() {
  const cart = ref({});
  const cartOpen = ref(false);
  const placing = ref(false);
  const lastOrder = ref(null);
  const tableNo = ref("");

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

  return {
    cart,
    cartOpen,
    placing,
    lastOrder,
    tableNo,
    cartItems,
    cartCount,
    cartTotal,
    cartPreviewItems,
    add,
    change,
    clearCart,
    placeOrder,
    resetDemo,
  };
}
