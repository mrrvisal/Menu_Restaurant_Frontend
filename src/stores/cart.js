// frontend/src/stores/cart.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

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

  async function placeOrder(tableNo, note) {
    // Send full item details — backend doesn't query DB for orders
    const orderItems = Object.values(items.value).map((v) => ({
      name: v.name,
      price: v.price,
      qty: v.qty,
    }));

    const res = await axios.post(`${API_BASE_URL}/api/orders`, {
      table_no: tableNo,
      note,
      items: orderItems,
    });
    clear();
    return res.data;
  }

  return { items, count, total, add, change, clear, placeOrder };
});
