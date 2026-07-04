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
      <div class="header-content">
        <span class="header-icon"><AppIcon name="settings" :size="28" /></span>
        <span class="header-title">{{ t.super_admin }}</span>
      </div>
      <div class="wave-divider">
        <svg
          viewBox="0 0 1440 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          style="height: 28px"
        >
          <path
            d="M0 14 C180 0 360 28 540 14 C720 0 900 28 1080 14 C1260 0 1440 28 1440 14 L1440 28 L0 28 Z"
            fill="#f4faf6"
          />
          <path
            d="M1440 14 C1620 0 1800 28 1980 14 C2160 0 2340 28 2520 14 C2700 0 2880 28 2880 14 L2880 28 L1440 28 Z"
            fill="#f4faf6"
          />
        </svg>
      </div>
    </div>

    <!-- ADMIN BAR -->
    <div class="admin-bar">
      <div class="admin-bar-left">
        <span class="admin-bar-title"><AppIcon name="settings" :size="18" /> {{ t.super_admin }}</span>
      </div>
      <div class="admin-bar-right">
        <button class="lang-btn" @click="toggleLocale">
          {{ locale === "km" ? "English" : "ភាសាខ្មែរ" }}
        </button>
        <button class="logout-btn" @click="showLogoutModal = true">
          <AppIcon name="lock" :size="14" /> {{ t.logout }}
        </button>
      </div>
    </div>

    <!-- STATS ROW -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-card-bg"></div>
        <div class="stat-card-content">
          <div class="stat-icon"><AppIcon name="users" :size="24" /></div>
          <div class="stat-info">
            <span class="stat-num">{{ stats.totalUsers }}</span>
            <span class="stat-label">{{ t.total_users }}</span>
          </div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card-bg"></div>
        <div class="stat-card-content">
          <div class="stat-icon"><AppIcon name="store" :size="24" /></div>
          <div class="stat-info">
            <span class="stat-num">{{ stats.totalRestaurants }}</span>
            <span class="stat-label">{{ t.total_restaurants }}</span>
          </div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card-bg"></div>
        <div class="stat-card-content">
          <div class="stat-icon"><AppIcon name="clipboard" :size="24" /></div>
          <div class="stat-info">
            <span class="stat-num">{{ stats.totalOrders }}</span>
            <span class="stat-label">{{ t.total_orders }}</span>
          </div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card-bg"></div>
        <div class="stat-card-content">
          <div class="stat-icon"><AppIcon name="food" :size="24" /></div>
          <div class="stat-info">
            <span class="stat-num">{{ stats.totalFoods }}</span>
            <span class="stat-label">{{ t.total_foods }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- TABS -->
    <div class="admin-tabs">
      <button
        :class="{ active: tab === 'users' }"
        @click="
          tab = 'users';
          fetchUsers();
        "
      >
        <AppIcon name="users" :size="16" /> {{ t.users }}
      </button>
      <button
        :class="{ active: tab === 'restaurants' }"
        @click="
          tab = 'restaurants';
          fetchRestaurants();
        "
      >
        <AppIcon name="store" :size="16" /> {{ t.restaurants }}
      </button>
    </div>

    <!-- USERS TABLE -->
    <div v-if="tab === 'users'" class="table-section">
      <div class="table-header">
        <span class="table-header-title"><AppIcon name="users" :size="16" /> {{ t.users }}</span>
        <span class="table-header-count"
          >{{ users.length }} {{ t.total_users?.toLowerCase?.() || "" }}</span
        >
      </div>
      <div v-if="users.length" class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>{{ t.email }}</th>
              <th>{{ t.full_name }}</th>
              <th>{{ t.role }}</th>
              <th>{{ t.status }}</th>
              <th>{{ t.email_verified }}</th>
              <th>{{ t.restaurants }}</th>
              <th>{{ t.actions }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in users"
              :key="user.id"
              class="clickable-row"
              @click="openUserDetail(user)"
            >
              <td class="cell-id">{{ user.id }}</td>
              <td class="cell-email">{{ user.email }}</td>
              <td>{{ user.full_name || "-" }}</td>
              <td>
                <span :class="'role-badge ' + user.role">
                  {{
                    user.role === "super_admin" ? t.super_admin_label : t.owner
                  }}
                </span>
              </td>
              <td>
                <span :class="'status-badge ' + user.status">{{
                  user.status
                }}</span>
              </td>
              <td>
                <span
                  :class="
                    'verify-badge ' +
                    (user.email_verified_at ? 'verified' : 'not-verified')
                  "
                >
                  {{
                    user.email_verified_at ? t.email_verified : t.not_verified
                  }}
                </span>
              </td>
              <td>{{ user.restaurant_name || "-" }}</td>
              <td @click.stop>
                <select
                  :value="user.status"
                  @change="updateUserStatus(user.id, $event.target.value)"
                  class="status-select"
                >
                  <option value="active">{{ t.activate }}</option>
                  <option value="suspended">{{ t.suspend }}</option>
                  <option value="inactive">Inactive</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-state">
        <div class="empty-icon"><AppIcon name="category" :size="40" /></div>
        <div class="empty-text">{{ t.no_data }}</div>
      </div>
    </div>

    <!-- RESTAURANTS TABLE -->
    <div v-if="tab === 'restaurants'" class="table-section">
      <div class="table-header">
        <span class="table-header-title"><AppIcon name="store" :size="16" /> {{ t.restaurants }}</span>
        <span class="table-header-count"
          >{{ restaurants.length }}
          {{ t.total_restaurants?.toLowerCase?.() || "" }}</span
        >
      </div>
      <div v-if="restaurants.length" class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>{{ t.restaurant_name }}</th>
              <th>Slug</th>
              <th>{{ t.owner }}</th>
              <th>{{ t.language }}</th>
              <th>{{ t.status }}</th>
              <th>{{ t.telegram_link_code || "Link Code" }}</th>
              <th>{{ t.created_at }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="r in restaurants"
              :key="r.id"
              class="clickable-row"
              @click="openRestaurantDetail(r)"
            >
              <td class="cell-id">{{ r.id }}</td>
              <td class="cell-name">{{ r.name }}</td>
              <td>
                <code class="cell-slug">{{ r.slug }}</code>
              </td>
              <td class="cell-email">{{ r.owner_email }}</td>
              <td>
                <span class="lang-badge">{{
                  r.default_language === "km" ? "ភាសាខ្មែរ" : "English"
                }}</span>
              </td>
              <td>
                <span :class="'status-badge ' + r.status">{{ r.status }}</span>
              </td>
              <td>
                <code class="cell-code">{{ r.telegram_link_code || "-" }}</code>
              </td>
              <td class="cell-date">{{ formatDate(r.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-state">
        <div class="empty-icon"><AppIcon name="category" :size="40" /></div>
        <div class="empty-text">{{ t.no_data }}</div>
      </div>
    </div>

    <!-- USER DETAIL MODAL -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="selectedUser"
          class="modal-overlay"
          @click.self="selectedUser = null"
        >
          <div class="modal-card pop-in">
            <div class="modal-header">
              <div class="modal-header-left">
                <div class="modal-avatar">
                  {{
                    selectedUser.full_name
                      ? selectedUser.full_name.charAt(0).toUpperCase()
                      : ""
                  }}
                </div>
                <div>
                  <div class="modal-title">
                    {{ selectedUser.full_name || t.username }}
                  </div>
                  <div class="modal-subtitle">{{ selectedUser.email }}</div>
                </div>
              </div>
              <button class="modal-close-btn" @click="selectedUser = null">
                ✕
              </button>
            </div>
            <div class="modal-body">
              <div class="modal-section">
                <div class="modal-section-title">
                  {{ t.details || "Details" }}
                </div>
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="detail-label">ID</span>
                    <span class="detail-value">#{{ selectedUser.id }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">{{ t.phone || "Phone" }}</span>
                    <span class="detail-value">{{
                      selectedUser.phone || "-"
                    }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">{{ t.role }}</span>
                    <span class="detail-value">
                      <span :class="'role-badge ' + selectedUser.role">
                        {{
                          selectedUser.role === "super_admin"
                            ? t.super_admin_label
                            : t.owner
                        }}
                      </span>
                    </span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">{{ t.status }}</span>
                    <span class="detail-value">
                      <span :class="'status-badge ' + selectedUser.status">{{
                        selectedUser.status
                      }}</span>
                    </span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">{{ t.email_verified }}</span>
                    <span class="detail-value">
                      <span
                        :class="
                          'verify-badge ' +
                          (selectedUser.email_verified_at
                            ? 'verified'
                            : 'not-verified')
                        "
                      >
                        {{
                          selectedUser.email_verified_at
                            ? t.email_verified
                            : t.not_verified
                        }}
                      </span>
                    </span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">{{ t.restaurants }}</span>
                    <span class="detail-value">{{
                      selectedUser.restaurant_name || "-"
                    }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">{{ t.created_at }}</span>
                    <span class="detail-value">{{
                      formatDate(selectedUser.created_at)
                    }}</span>
                  </div>
                </div>
              </div>
              <div class="modal-section">
                <div class="modal-section-title">{{ t.actions }}</div>
                <div class="modal-actions">
                  <select
                    :value="selectedUser.status"
                    @change="updateModalUserStatus($event.target.value)"
                    class="status-select modal-status-select"
                  >
                    <option value="active">{{ t.activate }}</option>
                    <option value="suspended">{{ t.suspend }}</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <button
                    class="modal-action-btn close-action"
                    @click="selectedUser = null"
                  >
                    {{ t.close }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- RESTAURANT DETAIL MODAL -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="selectedRestaurant"
          class="modal-overlay"
          @click.self="selectedRestaurant = null"
        >
          <div class="modal-card pop-in">
            <div class="modal-header">
              <div class="modal-header-left">
                <div class="modal-avatar modal-avatar-restaurant"><AppIcon name="store" :size="20" /></div>
                <div>
                  <div class="modal-title">{{ selectedRestaurant.name }}</div>
                  <div class="modal-subtitle">
                    {{ selectedRestaurant.slug }}
                  </div>
                </div>
              </div>
              <button
                class="modal-close-btn"
                @click="selectedRestaurant = null"
              >
                ✕
              </button>
            </div>
            <div class="modal-body">
              <div class="modal-section">
                <div class="modal-section-title">
                  {{ t.details || "Details" }}
                </div>
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="detail-label">ID</span>
                    <span class="detail-value"
                      >#{{ selectedRestaurant.id }}</span
                    >
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">{{ t.restaurant_name }}</span>
                    <span class="detail-value">{{
                      selectedRestaurant.name
                    }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Slug</span>
                    <span class="detail-value"
                      ><code class="cell-slug">{{
                        selectedRestaurant.slug
                      }}</code></span
                    >
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">{{ t.owner }}</span>
                    <span class="detail-value cell-email">{{
                      selectedRestaurant.owner_email
                    }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">{{ t.language }}</span>
                    <span class="detail-value">
                      <span class="lang-badge">{{
                        selectedRestaurant.default_language === "km"
                          ? "ភាសាខ្មែរ"
                          : "English"
                      }}</span>
                    </span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">{{ t.status }}</span>
                    <span class="detail-value">
                      <span
                        :class="'status-badge ' + selectedRestaurant.status"
                        >{{ selectedRestaurant.status }}</span
                      >
                    </span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">{{
                      t.telegram_link_code || "Link Code"
                    }}</span>
                    <span class="detail-value"
                      ><code class="cell-code">{{
                        selectedRestaurant.telegram_link_code || "-"
                      }}</code></span
                    >
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">{{ t.created_at }}</span>
                    <span class="detail-value cell-date">{{
                      formatDate(selectedRestaurant.created_at)
                    }}</span>
                  </div>
                </div>
              </div>
              <div class="modal-section">
                <div class="modal-section-title">{{ t.actions }}</div>
                <div class="modal-actions">
                  <button
                    class="modal-action-btn close-action"
                    @click="selectedRestaurant = null"
                  >
                    {{ t.close }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- CONFIRM LOGOUT MODAL -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showLogoutModal"
          class="modal-overlay"
          @click.self="showLogoutModal = false"
        >
          <div class="confirm-box pop-in">
            <div class="confirm-icon"><AppIcon name="lock" :size="36" /></div>
            <div class="confirm-title">{{ t.logout }}</div>
            <div class="confirm-text">
              {{ t.confirm_logout || "Are you sure you want to logout?" }}
            </div>
            <div class="confirm-btns">
              <button class="confirm-cancel" @click="showLogoutModal = false">
                {{ t.cancel }}
              </button>
              <button class="confirm-logout" @click="confirmLogout">
                {{ t.logout }}
              </button>
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
import { useI18nStore } from "@/stores/i18n";
import AppIcon from "@/components/AppIcon.vue";
import axios from "axios";

const router = useRouter();
const auth = useAuthStore();
const { t, locale, toggleLocale } = useI18nStore();
const API_BASE = import.meta.env.VITE_API_URL;

const tab = ref("users");
const users = ref([]);
const restaurants = ref([]);
const stats = ref({
  totalUsers: 0,
  totalRestaurants: 0,
  totalOrders: 0,
  totalFoods: 0,
});

// Modal state
const selectedUser = ref(null);
const selectedRestaurant = ref(null);
const showLogoutModal = ref(false);

onMounted(async () => {
  try {
    const [s, u, r] = await Promise.all([
      axios.get(`${API_BASE}/api/admin/stats`),
      axios.get(`${API_BASE}/api/admin/users`),
      axios.get(`${API_BASE}/api/admin/restaurants`),
    ]);
    stats.value = s.data;
    users.value = u.data;
    restaurants.value = r.data;
  } catch (err) {
    console.error(err);
  }
});

async function fetchUsers() {
  try {
    const res = await axios.get(`${API_BASE}/api/admin/users`);
    users.value = res.data;
  } catch (err) {
    console.error(err);
  }
}

async function fetchRestaurants() {
  try {
    const res = await axios.get(`${API_BASE}/api/admin/restaurants`);
    restaurants.value = res.data;
  } catch (err) {
    console.error(err);
  }
}

async function updateUserStatus(userId, status) {
  try {
    await axios.patch(`${API_BASE}/api/admin/users/${userId}/status`, {
      status,
    });
    const user = users.value.find((u) => u.id === userId);
    if (user) user.status = status;
    if (selectedUser.value && selectedUser.value.id === userId) {
      selectedUser.value.status = status;
    }
  } catch (err) {
    alert(err.response?.data?.error || t.error);
  }
}

function openUserDetail(user) {
  selectedUser.value = { ...user };
}

function openRestaurantDetail(restaurant) {
  selectedRestaurant.value = { ...restaurant };
}

function updateModalUserStatus(status) {
  if (selectedUser.value) {
    updateUserStatus(selectedUser.value.id, status);
    selectedUser.value.status = status;
  }
}

function formatDate(d) {
  return new Date(d).toLocaleDateString();
}

function confirmLogout() {
  showLogoutModal.value = false;
  auth.logout();
  router.push("/login");
}
</script>

<style scoped>
/* ─── HEADER (matches AdminView) ─── */
.header {
  background: linear-gradient(135deg, #0f766e, #22c55e, #86efac);
  padding: 36px 20px 32px;
  text-align: center;
  position: relative;
  overflow: hidden;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.header::before {
  content: "";
  position: absolute;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  top: -60px;
  right: -50px;
  pointer-events: none;
}
.header::after {
  content: "";
  position: absolute;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
  bottom: -40px;
  left: -30px;
  pointer-events: none;
}
.header-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 10px;
}
.header-icon {
  font-size: 28px;
}
.header-title {
  font-family: "Hanuman", serif;
  font-size: 20px;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
.wave-divider {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 28px;
  overflow: hidden;
  pointer-events: none;
  z-index: 4;
}
.wave-divider svg {
  position: absolute;
  bottom: 0;
  width: 200%;
  left: 0;
  animation: waveDrift 8s linear infinite;
}
@keyframes waveDrift {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

/* ─── LEAVES & SPARKLES (matches AdminView) ─── */
.leaf {
  position: absolute;
  opacity: 0;
  animation: leafFall linear infinite;
  pointer-events: none;
  z-index: 3;
  user-select: none;
}
.l1 {
  left: 8%;
  font-size: 26px;
  animation-duration: 6s;
  animation-delay: 0s;
}
.l2 {
  left: 18%;
  font-size: 18px;
  animation-duration: 7.5s;
  animation-delay: 1.2s;
}
.l3 {
  left: 32%;
  font-size: 20px;
  animation-duration: 5.8s;
  animation-delay: 2.5s;
}
.l4 {
  left: 55%;
  font-size: 14px;
  animation-duration: 8s;
  animation-delay: 0.6s;
}
.l5 {
  left: 68%;
  font-size: 22px;
  animation-duration: 6.5s;
  animation-delay: 3s;
}
.l6 {
  left: 80%;
  font-size: 16px;
  animation-duration: 7s;
  animation-delay: 1.8s;
}
.l7 {
  left: 90%;
  font-size: 20px;
  animation-duration: 5.5s;
  animation-delay: 4s;
}
.l8 {
  left: 44%;
  font-size: 12px;
  animation-duration: 9s;
  animation-delay: 0.3s;
}
@keyframes leafFall {
  0% {
    top: -5%;
    opacity: 0;
    transform: rotate(0deg) translateX(0);
  }
  8% {
    opacity: 0.55;
  }
  85% {
    opacity: 0.4;
  }
  100% {
    top: 105%;
    opacity: 0;
    transform: rotate(360deg) translateX(24px);
  }
}
.sparkle {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.7);
  animation: sparklePop ease-in-out infinite;
  pointer-events: none;
  z-index: 3;
}
.s1 {
  top: 20%;
  left: 15%;
  animation-duration: 2.4s;
  animation-delay: 0s;
}
.s2 {
  top: 60%;
  left: 25%;
  animation-duration: 3.1s;
  animation-delay: 0.8s;
}
.s3 {
  top: 30%;
  left: 72%;
  animation-duration: 2.8s;
  animation-delay: 1.5s;
}
.s4 {
  top: 70%;
  left: 82%;
  animation-duration: 2.2s;
  animation-delay: 0.4s;
}
.s5 {
  top: 50%;
  left: 48%;
  animation-duration: 3.5s;
  animation-delay: 2.1s;
}
@keyframes sparklePop {
  0%,
  100% {
    transform: scale(0);
    opacity: 0;
  }
  40% {
    transform: scale(1.6);
    opacity: 1;
  }
  60% {
    transform: scale(0.8);
    opacity: 0.7;
  }
}

/* ─── ADMIN BAR ─── */
.admin-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: #fff3e0;
  border-bottom: 2px solid #ffb74d;
  gap: 8px;
  flex-wrap: wrap;
}
.admin-bar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.admin-bar-title {
  font-family: "Hanuman", serif;
  font-size: 15px;
  font-weight: 700;
  color: #14532d;
}
.admin-bar-right {
  display: flex;
  gap: 8px;
  align-items: center;
}
.lang-btn {
  padding: 7px 14px;
  background: var(--green-pale, #e8f5e9);
  color: var(--green-dark, #1a4a1a);
  border: 1.5px solid var(--green-soft, #c8e6c9);
  border-radius: 20px;
  font-size: 12px;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.lang-btn:hover {
  background: var(--green-soft, #c8e6c9);
  border-color: var(--green-mid, #2d7a2d);
}
.logout-btn {
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
  white-space: nowrap;
}
.logout-btn:hover {
  background: #c62828;
  color: white;
}

/* ─── STATS ROW ─── */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 16px;
  max-width: 900px;
  margin: 0 auto;
}
@media (max-width: 700px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
.stat-card {
  position: relative;
  background: white;
  border: 1.5px solid #e6f3e8;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.1);
}
.stat-card-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #0f766e, #22c55e, #86efac);
  pointer-events: none;
}
.stat-card-content {
  position: relative;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.stat-icon {
  font-size: 24px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0fdf4;
  border-radius: 12px;
  flex-shrink: 0;
}
.stat-info {
  display: flex;
  flex-direction: column;
}
.stat-num {
  font-family: "Hanuman", serif;
  font-size: 24px;
  font-weight: 700;
  color: #14532d;
  line-height: 1.2;
}
.stat-label {
  font-size: 11px;
  color: #6b7280;
  margin-top: 2px;
  font-weight: 500;
}

/* ─── TABS ─── */
.admin-tabs {
  display: flex;
  background: white;
  border-bottom: 2px solid #c8e6c9;
  padding: 0 16px;
}
.admin-tabs button {
  padding: 12px 20px;
  border: none;
  background: none;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: #6a8f6a;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
}
.admin-tabs button.active {
  color: #2d7a2d;
  border-bottom-color: #2d7a2d;
}
.admin-tabs button:hover {
  color: #2d7a2d;
}

/* ─── TABLE SECTION ─── */
.table-section {
  padding: 16px;
  max-width: 1200px;
  margin: 0 auto;
}
.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.table-header-title {
  font-family: "Hanuman", serif;
  font-size: 15px;
  font-weight: 700;
  color: #14532d;
}
.table-header-count {
  font-size: 12px;
  color: #6b7280;
  background: #f0fdf4;
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid #bbf7d0;
}
.table-wrap {
  overflow-x: auto;
  border-radius: 14px;
  border: 1.5px solid #e6f3e8;
  background: white;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.05);
}
.table {
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
}
.table th {
  padding: 12px 14px;
  text-align: left;
  font-size: 10px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: #f8fdf9;
  border-bottom: 2px solid #e6f3e8;
}
.table td {
  padding: 11px 14px;
  font-size: 12px;
  color: #374151;
  border-bottom: 1px solid #f1f5f9;
}
.table tbody tr:last-child td {
  border-bottom: none;
}
.table tbody tr:hover td {
  background: #f0fdf4;
}
.clickable-row {
  cursor: pointer;
}
.clickable-row:hover td {
  background: #f0fdf4;
}
.cell-id {
  font-weight: 600;
  color: #14532d;
  font-family: "Hanuman", serif;
}
.cell-email {
  color: #0f766e;
  font-weight: 500;
}
.cell-name {
  font-weight: 600;
  color: #14532d;
}
.cell-slug {
  background: #f0fdf4;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  color: #166534;
}
.cell-code {
  background: #fefce8;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  color: #92400e;
  font-family: "Courier New", monospace;
}
.cell-date {
  color: #6b7280;
  font-size: 11px;
}

/* ─── BADGES ─── */
.role-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}
.role-badge.super_admin {
  background: #fef3c7;
  color: #92400e;
}
.role-badge.owner {
  background: #dbeafe;
  color: #1e40af;
}
.status-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}
.status-badge.active {
  background: #dcfce7;
  color: #166534;
}
.status-badge.suspended {
  background: #fbe9e7;
  color: #c62828;
}
.status-badge.inactive {
  background: #f3f4f6;
  color: #6b7280;
}
.verify-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}
.verify-badge.verified {
  background: #dcfce7;
  color: #166534;
}
.verify-badge.not-verified {
  background: #fef3c7;
  color: #92400e;
}
.lang-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  background: #f0fdf4;
  color: #0f766e;
  border: 1px solid #bbf7d0;
}
.status-select {
  padding: 5px 10px;
  border: 1.5px solid #d1fae5;
  border-radius: 8px;
  font-size: 11px;
  font-family: inherit;
  color: #374151;
  background: white;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s;
}
.status-select:focus {
  border-color: #22c55e;
}

/* ─── CONFIRM BOX (Logout Modal) ─── */
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
.confirm-text {
  font-size: 13px;
  color: #3a5a3a;
  margin-bottom: 18px;
  line-height: 1.5;
}
.confirm-btns {
  display: flex;
  gap: 10px;
}
.confirm-cancel {
  flex: 1;
  padding: 11px;
  background: #e8f5e9;
  color: #1a4a1a;
  border: none;
  border-radius: 10px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.confirm-cancel:hover {
  background: #c8e6c9;
}
.confirm-logout {
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
  transition: background 0.2s;
}
.confirm-logout:hover {
  background: #b71c1c;
}

/* ─── EMPTY STATE ─── */
.empty-state {
  text-align: center;
  padding: 50px 20px;
  background: white;
  border: 1.5px solid #e6f3e8;
  border-radius: 14px;
}
.empty-icon {
  font-size: 46px;
  margin-bottom: 10px;
}
.empty-text {
  font-size: 14px;
  color: #6b7280;
}

/* ─── MODAL OVERLAY ─── */
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
.modal-card {
  background: white;
  border-radius: 22px;
  width: 100%;
  max-width: 500px;
  max-height: 88vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 22px 0;
}
.modal-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.modal-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0f766e, #22c55e);
  color: white;
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-family: "Hanuman", serif;
}
.modal-avatar-restaurant {
  font-size: 20px;
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
}
.modal-title {
  font-family: "Hanuman", serif;
  font-size: 17px;
  font-weight: 700;
  color: #14532d;
}
.modal-subtitle {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}
.modal-close-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #e8f5e9;
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: 700;
  color: #1a4a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.modal-close-btn:hover {
  background: #c8e6c9;
}
.modal-body {
  padding: 18px 22px 22px;
}
.modal-section {
  margin-bottom: 16px;
}
.modal-section:last-child {
  margin-bottom: 0;
}
.modal-section-title {
  font-size: 11px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 1.5px solid #e6f3e8;
}
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
@media (max-width: 420px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
.detail-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px;
  background: #f8fdf9;
  border-radius: 10px;
}
.detail-label {
  font-size: 10px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.detail-value {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}
.modal-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}
.modal-status-select {
  flex: 1;
  padding: 8px 12px;
  font-size: 12px;
}
.modal-action-btn {
  padding: 8px 18px;
  border: none;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}
.close-action {
  background: #e8f5e9;
  color: #1a4a1a;
}
.close-action:hover {
  background: #c8e6c9;
}

/* ─── TRANSITIONS ─── */
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