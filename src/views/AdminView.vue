<!-- frontend/src/views/AdminView.vue -->
<template>
  <div>
    <!-- HEADER -->
    <div class="header">
      <span class="header-leaf">🌿</span>
      <span class="header-leaf2">🍃</span>
      <div class="restaurant-logo">
        <img
          src="https://res.cloudinary.com/daji2ml3y/image/upload/v1777712294/ChatGPT_Image_May_2_2026_03_39_44_PM-Picsart-BackgroundRemover_1_x4yi9t.png"
          style="width: 150px"
          alt=""
        />
      </div>
    </div>

    <!-- ADMIN BAR -->
    <div class="admin-bar">
      <div class="admin-actions">
        <button class="admin-add-btn" @click="openAdd">➕ បន្ថែមម្ហូប</button>
        <button class="admin-logout-btn" @click="loggingOut = true">🔒 ចេញ</button>
      </div>
    </div>

    <!-- MENU MANAGEMENT -->
    <div>
      <!-- TABS -->
      <div class="tabs-wrap">
        <div class="tabs">
          <button
            v-for="cat in foods.categories"
            :key="cat.slug"
            class="tab"
            :class="{ active: curCat === cat.slug }"
            @click="
              curCat = cat.slug;
              load();
            "
          >
            {{ cat.icon }} {{ cat.label_km }}
          </button>
        </div>
      </div>

      <!-- SEARCH -->
      <div class="search-bar">
        <div class="search-wrap">
          <span class="search-icon">🔍</span>
          <input
            v-model="searchQ"
            placeholder="ស្វែងរកម្ហូប..."
            @input="load()"
          />
        </div>
      </div>

      <!-- GRID -->
      <div class="menu-section">
        <div v-if="foods.loading" class="empty">
          <div class="empty-icon">⏳</div>
          Loading...
        </div>
        <div v-else-if="!foods.foods.length" class="empty">
          <div class="empty-icon">🔍</div>
          រកមិនឃើញ
        </div>
        <div v-else class="food-grid">
          <FoodCard
            v-for="food in foods.foods"
            :key="food.id"
            :food="food"
            is-admin
            @delete="confirmDel($event)"
            @toggle-status="foods.toggleStatus($event)"
            @detail="
              editingFood = $event;
              showForm = true;
            "
          />
        </div>
      </div>
    </div>

    <!-- FOOD FORM MODAL -->
    <FoodFormModal
      :show="showForm"
      :edit-food="editingFood"
      :categories="foods.categories"
      @close="
        showForm = false;
        editingFood = null;
      "
      @saved="load()"
    />

    <!-- CONFIRM DELETE -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="deletingFood"
          class="modal-overlay"
          @click.self="deletingFood = null"
        >
          <div class="confirm-box pop-in">
            <div class="confirm-icon">🗑️</div>
            <div class="confirm-title">លុបម្ហូបនេះ?</div>
            <div class="confirm-name">{{ deletingFood.name }}</div>
            <div class="confirm-btns">
              <button class="confirm-cancel" @click="deletingFood = null">
                បោះបង់
              </button>
              <button class="confirm-delete" @click="doDelete">លុប</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- CONFIRM LOGOUT -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="loggingOut"
          class="modal-overlay"
          @click.self="loggingOut = false"
        >
          <div class="confirm-box pop-in">
            <div class="confirm-icon">🔒</div>
            <div class="confirm-title confirm-title--blue">តើចង់ចេញពីប្រព័ន្ធ?</div>
            <div class="confirm-name">អ្នកនឹងត្រូវវិលត្រឡប់ទៅទំព័រចូល</div>
            <div class="confirm-btns">
              <button class="confirm-cancel" @click="loggingOut = false">
                បោះបង់
              </button>
              <button class="confirm-logout" @click="confirmLogout">ចេញ</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useFoodsStore } from "@/stores/foods";
import FoodCard from "@/components/FoodCard.vue";
import FoodFormModal from "@/components/FoodFormModal.vue";

const router = useRouter();
const auth = useAuthStore();
const foods = useFoodsStore();

const curCat = ref("");
const searchQ = ref("");
const showForm = ref(false);
const editingFood = ref(null);
const deletingFood = ref(null);
const loggingOut = ref(false);

async function load() {
  const params = {};
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
  await foods.deleteFood(deletingFood.value.id);
  deletingFood.value = null;
}

function confirmLogout() {
  auth.logout();
  router.push("/login");
}

onMounted(async () => {
  await foods.fetchCategories();
  if (foods.categories.length) curCat.value = foods.categories[0].slug;
  await load();
});
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, #0f766e 0%, #22c55e 60%, #86efac 100%);
  padding: 22px 16px 18px;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.header::before {
  content: "";
  position: absolute;
  top: -30px;
  right: -30px;
  width: 130px;
  height: 130px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
}
.header::after {
  content: "";
  position: absolute;
  bottom: -20px;
  left: -20px;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
}
.header-leaf {
  position: absolute;
  top: 10px;
  left: 12px;
  font-size: 26px;
  opacity: 0.3;
}
.header-leaf2 {
  position: absolute;
  top: 10px;
  right: 12px;
  font-size: 26px;
  opacity: 0.3;
}
.restaurant-logo {
  font-size: 42px;
  display: block;
  margin-bottom: 6px;
}
.restaurant-name {
  font-family: "Hanuman", serif;
  font-size: 22px;
  font-weight: 700;
  color: #fff;
}
.restaurant-sub {
  font-size: 12px;
  color: var(--green-accent);
  margin-top: 3px;
}

.admin-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 8px 14px;
  background: #fff3e0;
  border-bottom: 2px solid #ffb74d;
  gap: 8px;
  flex-wrap: wrap;
}
.admin-label {
  font-size: 12px;
  font-weight: 700;
  color: #e65100;
}
.admin-actions {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 8px;
}
.admin-add-btn {
  padding: 7px 14px;
  background: var(--green-mid);
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 12px;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.admin-add-btn:hover {
  background: var(--green-dark);
}
.admin-logout-btn {
  padding: 7px 14px;
  background: #fbe9e7;
  color: #c62828;
  border: 1.5px solid #ffccbc;
  border-radius: 20px;
  font-size: 12px;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.admin-logout-btn:hover {
  background: #c62828;
  color: white;
}

.tabs-wrap {
  background: var(--white);
  border-bottom: 2px solid var(--green-soft);
  overflow-x: auto;
  scrollbar-width: none;
}
.tabs-wrap::-webkit-scrollbar {
  display: none;
}
.tabs {
  display: flex;
  min-width: max-content;
  padding: 0 8px;
}
.tab {
  padding: 12px 14px;
  font-size: 13px;
  font-family: inherit;
  font-weight: 500;
  color: var(--text-light);
  border: none;
  background: none;
  cursor: pointer;
  white-space: nowrap;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
  position: relative;
  top: 2px;
}
.tab.active {
  color: var(--green-mid);
  border-bottom-color: var(--green-mid);
  font-weight: 600;
}

.search-bar {
  padding: 12px 16px;
  background: var(--white);
  border-bottom: 1px solid var(--green-soft);
}
.search-wrap {
  position: relative;
}
.search-bar input {
  width: 100%;
  padding: 9px 14px 9px 38px;
  border: 1.5px solid var(--green-soft);
  border-radius: 24px;
  font-size: 13px;
  font-family: inherit;
  background: var(--green-pale);
  color: var(--text-dark);
  outline: none;
}
.search-bar input:focus {
  border-color: var(--green-light);
}
.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.menu-section {
  padding: 12px 12px 40px;
}
.food-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}
@media (max-width: 1100px) {
  .food-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (max-width: 800px) {
  .food-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 560px) {
  .food-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
.empty {
  text-align: center;
  padding: 50px 20px;
  color: var(--text-light);
}
.empty-icon {
  font-size: 46px;
  margin-bottom: 10px;
}

/* CONFIRM MODALS */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.confirm-box {
  background: white;
  border-radius: 22px;
  width: 90%;
  max-width: 300px;
  padding: 28px 22px;
  text-align: center;
}
.confirm-icon {
  font-size: 36px;
  margin-bottom: 8px;
}
.confirm-title {
  font-family: "Hanuman", serif;
  font-size: 17px;
  font-weight: 700;
  color: #c62828;
  margin-bottom: 6px;
}
.confirm-title--blue {
  color: #b71c1c;
}
.confirm-name {
  font-size: 13px;
  color: var(--text-mid);
  margin-bottom: 18px;
}
.confirm-btns {
  display: flex;
  gap: 10px;
}
.confirm-cancel {
  flex: 1;
  padding: 11px;
  background: var(--green-pale);
  color: var(--green-dark);
  border: none;
  border-radius: 10px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.confirm-delete {
  flex: 1;
  padding: 11px;
  background: #c62828;
  color: white;
  border: none;
  border-radius: 10px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.confirm-delete:hover {
  background: #b71c1c;
}
.confirm-logout {
  flex: 1;
  padding: 11px;
  background: #9f4040;
  color: white;
  border: none;
  border-radius: 10px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.confirm-logout:hover {
  background: #b71c1c;
}

/* TRANSITIONS */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.pop-in {
  animation: popIn 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes popIn {
  from {
    transform: scale(0.85);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>