<!-- frontend/src/views/AdminView.vue -->
<template>
  <div>
    <!-- HEADER -->
    <div class="header">
      <span class="leaf l1">🌿</span>
      <span class="leaf l2">🍃</span>
      <span class="leaf l3">🌿</span>
      <span class="leaf l4">🍃</span>
      <span class="leaf l5">🌿</span>
      <span class="leaf l6">🍃</span>
      <span class="leaf l7">🌿</span>
      <span class="leaf l8">🍃</span>
      <span class="sparkle s1"></span>
      <span class="sparkle s2"></span>
      <span class="sparkle s3"></span>
      <span class="sparkle s4"></span>
      <span class="sparkle s5"></span>
      <img
        src="https://res.cloudinary.com/daji2ml3y/image/upload/v1777712294/ChatGPT_Image_May_2_2026_03_39_44_PM-Picsart-BackgroundRemover_1_x4yi9t.png"
        class="header-logo"
        alt="restaurant logo"
      />
      <div class="wave-divider">
        <svg viewBox="0 0 1440 28" fill="none"
             xmlns="http://www.w3.org/2000/svg"
             preserveAspectRatio="none"
             style="height:28px">
          <path
            d="M0 14 C180 0 360 28 540 14
               C720 0 900 28 1080 14
               C1260 0 1440 28 1440 14
               L1440 28 L0 28 Z"
            fill="#f4faf6"/>
          <path
            d="M1440 14 C1620 0 1800 28 1980 14
               C2160 0 2340 28 2520 14
               C2700 0 2880 28 2880 14
               L2880 28 L1440 28 Z"
            fill="#f4faf6"/>
        </svg>
      </div>
    </div>

    <!-- ADMIN BAR -->
    <div class="admin-bar">
      <div class="admin-actions">
        <button class="admin-add-btn" @click="openAdd">➕ បន្ថែមម្ហូប</button>
        <div class="admin-right">
          <button class="admin-qr-btn" @click="showQR = true">
            📱 បង្កើត QR
          </button>
          <button class="admin-logout-btn" @click="loggingOut = true">
            🔒 ចេញ
          </button>
        </div>
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

    <!-- QR MODAL -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showQR" class="modal-overlay" @click.self="showQR = false">
          <div class="qr-modal pop-in">
            <div class="qr-modal-header">
              <span>📱 បង្កើត QR សម្រាប់តុ</span>
              <button class="qr-close-btn" @click="showQR = false">✕</button>
            </div>
            <div class="qr-modal-body">
              <div class="qr-input-row">
                <input
                  v-model="qrTableNumber"
                  type="number"
                  min="1"
                  placeholder="លេខតុ..."
                  class="qr-input"
                  @keyup.enter="generateQR"
                />
                <button
                  class="qr-gen-btn"
                  @click="generateQR"
                  :disabled="qrLoading"
                >
                  {{ qrLoading ? "⏳" : "បង្កើត" }}
                </button>
              </div>
              <div v-if="qrCodeDataUrl" class="qr-preview">
                <img
                  :src="qrCodeDataUrl"
                  :alt="'QR for table ' + qrTableNumber"
                  class="qr-img"
                />
                <div class="qr-table-label">តុទី {{ qrTableNumber }}</div>
                <a :href="qrDownloadUrl" download class="qr-download-btn">
                  ⬇️ ទាញយក QR
                </a>
              </div>
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
            <div class="confirm-title confirm-title--blue">
              តើចង់ចេញពីប្រព័ន្ធ?
            </div>
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
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useFoodsStore } from "@/stores/foods";
import FoodCard from "@/components/FoodCard.vue";
import FoodFormModal from "@/components/FoodFormModal.vue";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

const router = useRouter();
const auth = useAuthStore();
const foods = useFoodsStore();

const curCat = ref("");
const searchQ = ref("");
const showForm = ref(false);
const editingFood = ref(null);
const deletingFood = ref(null);
const loggingOut = ref(false);
const showQR = ref(false);

// ── QR Generator ──
const qrTableNumber = ref("");
const qrCodeDataUrl = ref("");
const qrLoading = ref(false);
const qrError = ref("");

const qrDownloadUrl = computed(() => {
  if (!qrTableNumber.value) return "#";
  return `${API_BASE}/api/qr/table/${qrTableNumber.value}?format=png`;
});

async function generateQR() {
  const num = parseInt(qrTableNumber.value);
  if (!num || num < 1) {
    qrError.value = "សូមបញ្ចូលលេខតុឲ្យបានត្រឹមត្រូវ";
    return;
  }
  qrLoading.value = true;
  qrError.value = "";
  try {
    const res = await axios.get(`${API_BASE}/api/qr/table/${num}`);
    qrCodeDataUrl.value = res.data.qrCode;
  } catch (e) {
    qrError.value =
      "បង្កើត QR បរាជ័យ: " + (e.response?.data?.error || e.message);
  } finally {
    qrLoading.value = false;
  }
}

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
.admin-right {
  display: flex;
  gap: 6px;
  align-items: center;
}
.admin-qr-btn {
  padding: 7px 14px;
  background: #0f766e;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 12px;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.admin-qr-btn:hover {
  background: #0d5e57;
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

/* QR MODAL */
.qr-modal {
  background: white;
  border-radius: 22px;
  width: 90%;
  max-width: 340px;
  overflow: hidden;
}
.qr-modal-header {
  background: linear-gradient(135deg, #0f766e, #22c55e);
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  font-family: "Hanuman", serif;
}
.qr-close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
  font-size: 16px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.qr-close-btn:hover {
  background: rgba(255, 255, 255, 0.4);
}
.qr-modal-body {
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.qr-input-row {
  display: flex;
  gap: 8px;
  width: 100%;
  max-width: 300px;
}
.qr-input {
  flex: 1;
  padding: 9px 14px;
  border: 1.5px solid var(--green-soft);
  border-radius: 24px;
  font-size: 15px;
  font-family: inherit;
  background: var(--green-pale);
  color: var(--text-dark);
  outline: none;
}
.qr-input:focus {
  border-color: var(--green-light);
}
.qr-gen-btn {
  padding: 9px 18px;
  background: var(--green-mid);
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 13px;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
}
.qr-gen-btn:hover {
  background: var(--green-dark);
}
.qr-gen-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.qr-preview {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.qr-img {
  width: 200px;
  height: 200px;
  border-radius: 12px;
  border: 3px solid var(--green-soft);
  object-fit: contain;
}
.qr-table-label {
  margin-top: 6px;
  font-family: "Hanuman", serif;
  font-size: 15px;
  font-weight: 700;
  color: var(--green-dark);
}
.qr-download-btn {
  display: inline-block;
  margin-top: 10px;
  padding: 9px 22px;
  background: #0f766e;
  color: white;
  border-radius: 24px;
  font-size: 13px;
  font-family: inherit;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s;
}
.qr-download-btn:hover {
  background: #0d5e57;
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
.header {
  background: linear-gradient(135deg, #0f766e, #22c55e, #86efac);
  padding: 36px 20px 32px;
  text-align: center;
  position: relative;
  overflow: hidden;
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.header::before {
  content: '';
  position: absolute;
  width: 220px; height: 220px;
  border-radius: 50%;
  background: rgba(255,255,255,0.06);
  top: -60px; right: -50px;
  pointer-events: none;
}
.header::after {
  content: '';
  position: absolute;
  width: 140px; height: 140px;
  border-radius: 50%;
  background: rgba(255,255,255,0.04);
  bottom: -40px; left: -30px;
  pointer-events: none;
}
.header-logo {
  width: 150px;
  position: relative; z-index: 2;
  filter: drop-shadow(0 6px 18px rgba(0,0,0,0.35));
  animation: logoFloat 3.6s ease-in-out infinite;
}
@keyframes logoFloat {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-8px); }
}
.leaf {
  position: absolute;
  opacity: 0;
  animation: leafFall linear infinite;
  pointer-events: none;
  z-index: 3;
  user-select: none;
}
.l1 { left:  8%; font-size: 26px; animation-duration: 6.0s; animation-delay: 0.0s; }
.l2 { left: 18%; font-size: 18px; animation-duration: 7.5s; animation-delay: 1.2s; }
.l3 { left: 32%; font-size: 20px; animation-duration: 5.8s; animation-delay: 2.5s; }
.l4 { left: 55%; font-size: 14px; animation-duration: 8.0s; animation-delay: 0.6s; }
.l5 { left: 68%; font-size: 22px; animation-duration: 6.5s; animation-delay: 3.0s; }
.l6 { left: 80%; font-size: 16px; animation-duration: 7.0s; animation-delay: 1.8s; }
.l7 { left: 90%; font-size: 20px; animation-duration: 5.5s; animation-delay: 4.0s; }
.l8 { left: 44%; font-size: 12px; animation-duration: 9.0s; animation-delay: 0.3s; }
@keyframes leafFall {
  0%   { top: -5%;  opacity: 0;   transform: rotate(0deg)   translateX(0); }
  8%   {             opacity: .55; }
  85%  {             opacity: .4;  }
  100% { top: 105%; opacity: 0;   transform: rotate(360deg) translateX(24px); }
}
.sparkle {
  position: absolute;
  width: 4px; height: 4px;
  border-radius: 50%;
  background: rgba(255,255,255,0.7);
  animation: sparklePop ease-in-out infinite;
  pointer-events: none; z-index: 3;
}
.s1 { top: 20%; left: 15%; animation-duration: 2.4s; animation-delay: 0.0s; }
.s2 { top: 60%; left: 25%; animation-duration: 3.1s; animation-delay: 0.8s; }
.s3 { top: 30%; left: 72%; animation-duration: 2.8s; animation-delay: 1.5s; }
.s4 { top: 70%; left: 82%; animation-duration: 2.2s; animation-delay: 0.4s; }
.s5 { top: 50%; left: 48%; animation-duration: 3.5s; animation-delay: 2.1s; }
@keyframes sparklePop {
  0%, 100% { transform: scale(0);   opacity: 0; }
  40%       { transform: scale(1.6); opacity: 1; }
  60%       { transform: scale(0.8); opacity: .7; }
}
.wave-divider {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 28px; overflow: hidden;
  pointer-events: none; z-index: 4;
}
.wave-divider svg {
  position: absolute; bottom: 0;
  width: 200%; left: 0;
  animation: waveDrift 8s linear infinite;
}
@keyframes waveDrift {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
</style>