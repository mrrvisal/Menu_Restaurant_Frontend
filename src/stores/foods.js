// frontend/src/stores/foods.js
import { defineStore } from "pinia";
import { ref } from "vue";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const useFoodsStore = defineStore("foods", () => {
  const foods = ref([]);
  const categories = ref([]);
  const loading = ref(false);
  const error = ref(null);

  async function fetchCategories() {
    const res = await axios.get(`${API_BASE_URL}/api/categories`);
    categories.value = res.data;
  }

  async function fetchFoods(params = {}) {
    loading.value = true;
    error.value = null;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/foods`, { params });
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

  async function deleteFood(id) {
    await axios.delete(`${API_BASE_URL}/api/foods/${id}`);
    foods.value = foods.value.filter((f) => f.id !== id);
  }

  return {
    foods,
    categories,
    loading,
    error,
    fetchCategories,
    fetchFoods,
    addFood,
    updateFood,
    toggleStatus,
    deleteFood,
  };
});
