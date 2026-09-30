// Category form + category delete confirm — moved verbatim out of
// AdminView.vue. Singleton state shared by AdminView's Esc handler,
// AdminCategoriesTab and the AdminCategoryFormModal.
import { ref } from "vue";
import { useFoodsStore } from "@/stores/foods";
import { useI18nStore } from "@/stores/i18n";

const foods = useFoodsStore();
const i18n = useI18nStore();

const showCatForm = ref(false);
const editingCat = ref(null);
const catSubmitting = ref(false);
const catSuccess = ref("");
const catErrors = ref("");
const catLabelKm = ref("");
const deletingCat = ref(null);

function openCatForm(cat = null) {
  editingCat.value = cat;
  catSuccess.value = "";
  catErrors.value = "";
  catLabelKm.value = cat ? cat.label_km : "";
  showCatForm.value = true;
}
async function submitCategory() {
  catSuccess.value = "";
  catErrors.value = "";
  if (!catLabelKm.value.trim()) {
    catErrors.value = i18n.t.category_name_required;
    return;
  }
  catSubmitting.value = true;
  try {
    const data = { label_km: catLabelKm.value.trim() };
    if (editingCat.value) {
      await foods.updateCategory(editingCat.value.id, data);
      catSuccess.value = i18n.t.category_updated;
      setTimeout(() => {
        showCatForm.value = false;
        editingCat.value = null;
        catSuccess.value = "";
      }, 1200);
    } else {
      await foods.addCategory(data);
      catSuccess.value = i18n.t.category_created;
      catLabelKm.value = "";
      setTimeout(() => {
        catSuccess.value = "";
      }, 1500);
    }
  } catch (err) {
    catErrors.value =
      err.response?.data?.code === "DUPLICATE_CATEGORY"
        ? i18n.t.dup_category || "You already have a category with this name"
        : err.response?.data?.error || i18n.t.generic_error;
  } finally {
    catSubmitting.value = false;
  }
}
function confirmDelCat(cat) {
  deletingCat.value = cat;
}
async function doDeleteCat() {
  if (!deletingCat.value) return;
  try {
    await foods.deleteCategory(deletingCat.value.id);
  } catch (err) {
    alert(err.response?.data?.error || i18n.t.category_delete_failed);
  }
  deletingCat.value = null;
}

export function useAdminCategories() {
  return {
    showCatForm,
    editingCat,
    catSubmitting,
    catSuccess,
    catErrors,
    catLabelKm,
    deletingCat,
    openCatForm,
    submitCategory,
    confirmDelCat,
    doDeleteCat,
  };
}
