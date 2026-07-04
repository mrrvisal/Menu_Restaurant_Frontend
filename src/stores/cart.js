// frontend/src/stores/cart.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useCartStore = defineStore("cart", () => {
  // { foodId: { qty, name, price, img, category } }
  const items = ref({});

  const count = computed(() =>
    Object.values(items.value).reduce((s, v) => s + v.qty, 0),
  );
  const total = computed(() =>
    Object.values(items.value).reduce((s, v) => s + v.price * v.qty, 0),
  );

  function add(food) {
    if (food.status === "unavailable") return;
    if (items.value[food.id]) {
      items.value[food.id].qty++;
    } else {
      items.value[food.id] = {
        qty: 1,
        name: food.name,
        price: Number(food.price),
        img: food.img || null,
        category: food.category,
      };
    }
  }

  function change(foodId, delta) {
    if (!items.value[foodId]) return;
    items.value[foodId].qty += delta;
    if (items.value[foodId].qty <= 0) delete items.value[foodId];
  }

  function clear() {
    items.value = {};
  }

  return { items, count, total, add, change, clear };
});
