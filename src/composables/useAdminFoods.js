// Foods grid + FoodFormModal state and actions — moved verbatim out of
// AdminView.vue. Singleton refs so AdminView (Esc handler) and
// AdminFoodsTab share the exact same state as before the split.
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useFoodsStore } from "@/stores/foods";

const auth = useAuthStore();
const foods = useFoodsStore();

export const curCat = ref("");
export const searchQ = ref("");
const showForm = ref(false);
const editingFood = ref(null);
const deletingFood = ref(null);
export const selectedFoodIds = ref([]);
export const selectingFoods = ref(false);
export const transferringFoods = ref(false);
export const transferAction = ref("move");
export const transferRestaurantId = ref(null);
export const transferMenuId = ref(null);

// ─── MENU HANDLING (one menu per restaurant) ───────────────
export const menuCreating = ref(false);

export async function load() {
  const params = {};
  if (auth.currentMenuId) params.menu_id = auth.currentMenuId;
  if (curCat.value) params.category = curCat.value;
  if (searchQ.value) params.search = searchQ.value;
  await foods.fetchFoods(params);
}

function openAdd() {
  editingFood.value = null;
  showForm.value = true;
}
function confirmDel(food) {
  deletingFood.value = food;
}
async function doDelete() {
  const ids = deletingFood.value?.ids || (deletingFood.value ? [deletingFood.value.id] : []);
  if (!ids.length) return;
  try {
    await (ids.length === 1 ? foods.deleteFood(ids[0]) : foods.deleteFoods(ids));
    selectedFoodIds.value = [];
  } catch (err) {
    console.error(
      "Delete food failed:",
      err?.response?.data?.error || err.message,
    );
  } finally {
    deletingFood.value = null;
  }
}

function toggleFoodSelection(id) {
  const numericId = Number(id);
  const index = selectedFoodIds.value.indexOf(numericId);
  if (index >= 0) selectedFoodIds.value.splice(index, 1);
  else selectedFoodIds.value.push(numericId);
}

function toggleSelectAll() {
  const visibleIds = foods.foods.map((food) => Number(food.id));
  selectedFoodIds.value = selectedFoodIds.value.length === visibleIds.length
    ? []
    : visibleIds;
}

function openTransfer(action) {
  if (!selectedFoodIds.value.length) return;
  transferAction.value = action;
  transferRestaurantId.value = auth.restaurants.find((restaurant) => restaurant.id !== auth.restaurantId)?.id || null;
  transferMenuId.value = null;
  transferringFoods.value = true;
  destinationChanged();
}

async function destinationChanged() {
  transferMenuId.value = null;
  if (!transferRestaurantId.value) return;
  await foods.fetchMenus(transferRestaurantId.value);
}

async function doTransfer() {
  if (!selectedFoodIds.value.length || !transferRestaurantId.value) return;
  await foods.transferFoods(
    [...selectedFoodIds.value],
    transferAction.value,
    transferRestaurantId.value,
    transferMenuId.value,
  );
  selectedFoodIds.value = [];
  selectingFoods.value = false;
  transferringFoods.value = false;
}

export function useAdminFoods() {
  return {
    curCat,
    searchQ,
    showForm,
    editingFood,
    deletingFood,
    menuCreating,
    selectedFoodIds,
    selectingFoods,
    transferringFoods,
    transferAction,
    transferRestaurantId,
    transferMenuId,
    load,
    openAdd,
    confirmDel,
    doDelete,
    toggleFoodSelection,
    toggleSelectAll,
    openTransfer,
    destinationChanged,
    doTransfer,
  };
}
