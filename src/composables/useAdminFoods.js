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
  if (!deletingFood.value) return;
  try {
    await foods.deleteFood(deletingFood.value.id);
  } catch (err) {
    // Ownership failures (e.g. a stale row from another account/restaurant)
    // come back as 404 — surface it instead of an unhandled rejection, and
    // keep the row until the list is refetched.
    console.error(
      "Delete food failed:",
      err?.response?.data?.error || err.message,
    );
  } finally {
    deletingFood.value = null;
  }
}

export function useAdminFoods() {
  return {
    curCat,
    searchQ,
    showForm,
    editingFood,
    deletingFood,
    menuCreating,
    load,
    openAdd,
    confirmDel,
    doDelete,
  };
}
