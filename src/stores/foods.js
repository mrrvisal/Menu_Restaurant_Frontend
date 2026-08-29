// frontend/src/stores/foods.js
import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";
import { useAuthStore } from "./auth";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const useFoodsStore = defineStore("foods", () => {
  const auth = useAuthStore();
  const foods = ref([]);
  const categories = ref([]);
  const menus = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // The currently active restaurant (for owner actions)
  function activeRestaurantId() {
    return auth.restaurantId;
  }

  async function fetchMenus(restaurantId = null) {
    const id = restaurantId || activeRestaurantId();
    if (!id) {
      menus.value = [];
      return;
    }
    const res = await axios.get(`${API_BASE_URL}/api/menus`, {
      params: { restaurant_id: id },
    });
    menus.value = res.data;
  }

  async function addMenu(name) {
    const id = activeRestaurantId();
    const res = await axios.post(`${API_BASE_URL}/api/menus`, {
      restaurant_id: id,
      name,
    });
    menus.value.push(res.data);
    return res.data;
  }

  async function updateMenu(id, name) {
    const res = await axios.patch(`${API_BASE_URL}/api/menus/${id}`, { name });
    const idx = menus.value.findIndex((m) => m.id === id);
    if (idx !== -1) menus.value[idx] = res.data;
    return res.data;
  }

  async function deleteMenu(id) {
    await axios.delete(`${API_BASE_URL}/api/menus/${id}`);
    menus.value = menus.value.filter((m) => m.id !== id);
    foods.value = foods.value.filter((f) => f.menu_id !== id);
    categories.value = categories.value.filter((c) => c.menu_id !== id);
  }

  async function fetchCategories(params = {}, restaurantId = null) {
    const id = restaurantId || activeRestaurantId();
    const res = await axios.get(`${API_BASE_URL}/api/categories`, {
      params: { restaurant_id: id, ...params },
    });
    categories.value = res.data;
  }

  async function fetchFoods(params = {}, restaurantId = null) {
    loading.value = true;
    error.value = null;
    try {
      const id = restaurantId || activeRestaurantId();
      const res = await axios.get(`${API_BASE_URL}/api/foods`, {
        params: { restaurant_id: id, ...params },
      });
      // Transform img to img_url for frontend compatibility
      foods.value = res.data.map((food) => ({
        ...food,
        img_url: food.img,
      }));
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  async function addFood(formData) {
    const id = activeRestaurantId();
    formData.append("restaurant_id", id);
    if (auth.currentMenuId) formData.append("menu_id", auth.currentMenuId);
    const res = await axios.post(`${API_BASE_URL}/api/foods`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const newFood = { ...res.data, img_url: res.data.img };
    foods.value.push(newFood);
    return newFood;
  }

  async function updateFood(id, formData) {
    const res = await axios.patch(`${API_BASE_URL}/api/foods/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const updatedFood = { ...res.data, img_url: res.data.img };
    const idx = foods.value.findIndex((f) => f.id === id);
    if (idx !== -1) foods.value[idx] = updatedFood;
    return updatedFood;
  }

  async function toggleStatus(id) {
    const res = await axios.patch(`${API_BASE_URL}/api/foods/${id}/status`);
    const idx = foods.value.findIndex((f) => f.id === id);
    if (idx !== -1) foods.value[idx].status = res.data.status;
  }

  async function addCategory(data) {
    const id = activeRestaurantId();
    const res = await axios.post(`${API_BASE_URL}/api/categories`, {
      restaurant_id: id,
      menu_id: auth.currentMenuId,
      ...data,
    });
    categories.value.push(res.data);
    return res.data;
  }

  async function updateCategory(id, data) {
    const res = await axios.patch(`${API_BASE_URL}/api/categories/${id}`, data);
    const idx = categories.value.findIndex((c) => c.id === id);
    if (idx !== -1) categories.value[idx] = res.data;
    return res.data;
  }

  async function deleteCategory(id) {
    await axios.delete(`${API_BASE_URL}/api/categories/${id}`);
    categories.value = categories.value.filter((c) => c.id !== id);
  }

  async function deleteFood(id) {
    await axios.delete(`${API_BASE_URL}/api/foods/${id}`);
    foods.value = foods.value.filter((f) => f.id !== id);
  }

  return {
    foods, categories, menus, loading, error,
    fetchCategories, fetchFoods, fetchMenus, addMenu, updateMenu, deleteMenu,
    addFood, updateFood, toggleStatus, deleteFood,
    addCategory, updateCategory, deleteCategory,
  };
});