<template>
  <div class="shell" :class="{ 'nav-open': mobileNavOpen }">
    <!-- MOBILE TOP BAR -->
    <div class="mobile-bar">
      <div class="mark "><img width="40" src="https://res.cloudinary.com/daji2ml3y/image/upload/v1783262055/ChatGPT_Image_Jul_5_2026_09_32_32_PM_c6ziic.png" alt=""></div>
      <span class="mobile-bar-title">{{ t.super_admin }}</span>
      <button class="icon-btn" @click="mobileNavOpen = !mobileNavOpen" aria-label="Toggle navigation">
        <AppIcon name="menu" :size="18" />
      </button>
    </div>

    <!-- SIDEBAR -->
    <aside class="sidebar">
      <div class="brand-area">
        <div class="brand-glow"></div>
        <div class="brand-content">
          <div class="mark"><img width="40" src="https://res.cloudinary.com/daji2ml3y/image/upload/v1783262055/ChatGPT_Image_Jul_5_2026_09_32_32_PM_c6ziic.png" alt=""></div>
          <div class="brand-text">
            <span class="brand-name">{{ t.super_admin }}</span>
          </div>
        </div>
      </div>

      <nav class="nav">
        <button
          class="nav-item"
          :class="{ active: tab === 'users' }"
          @click="tab = 'users'; fetchUsers(); mobileNavOpen = false"
        >
          <AppIcon name="users" :size="18" />
          <span>{{ t.users }}</span>
        </button>
        <button
          class="nav-item"
          :class="{ active: tab === 'restaurants' }"
          @click="tab = 'restaurants'; fetchRestaurants(); mobileNavOpen = false"
        >
          <AppIcon name="store" :size="18" />
          <span>{{ t.restaurants }}</span>
        </button>
      </nav>

      <div class="sidebar-footer">
        <button class="lang-btn" @click="toggleLocale">
          {{ locale === "km" ? "English" : "ភាសាខ្មែរ" }}
        </button>
        <button class="logout-link" @click="showLogoutModal = true">
          <AppIcon name="lock" :size="15" /> {{ t.logout }}
        </button>
      </div>
    </aside>

    <div class="nav-scrim" @click="mobileNavOpen = false"></div>

    <!-- MAIN -->
    <main class="main">
      <header class="topbar">
        <div>
          <h1 class="page-title">{{ tab === 'users' ? t.users : t.restaurants }}</h1>
          <p class="page-sub">{{ t.super_admin }} · {{ t.manage_system || 'Manage system' }}</p>
        </div>
      </header>

      <!-- STATS -->
      <section class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon-wrap icon-teal"><AppIcon name="users" :size="20" /></div>
          <div class="stat-body">
            <span class="stat-num">{{ stats.totalUsers }}</span>
            <span class="stat-label">{{ t.total_users }}</span>
          </div>
          <div class="stat-spark teal"></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrap icon-amber"><AppIcon name="store" :size="20" /></div>
          <div class="stat-body">
            <span class="stat-num">{{ stats.totalRestaurants }}</span>
            <span class="stat-label">{{ t.total_restaurants }}</span>
          </div>
          <div class="stat-spark amber"></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrap icon-blue"><AppIcon name="clipboard" :size="20" /></div>
          <div class="stat-body">
            <span class="stat-num">{{ stats.totalOrders }}</span>
            <span class="stat-label">{{ t.total_orders }}</span>
          </div>
          <div class="stat-spark blue"></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrap icon-green"><AppIcon name="food" :size="20" /></div>
          <div class="stat-body">
            <span class="stat-num">{{ stats.totalFoods }}</span>
            <span class="stat-label">{{ t.total_foods }}</span>
          </div>
          <div class="stat-spark green"></div>
        </div>
      </section>

      <!-- USERS -->
      <section v-if="tab === 'users'" class="panel">
        <div class="panel-head">
          <span class="panel-title"><AppIcon name="users" :size="16" /> {{ t.users }}</span>
          <span class="panel-count">{{ users.length }}</span>
        </div>

        <div v-if="users.length" class="rows">
          <div
            v-for="user in users"
            :key="user.id"
            class="row"
            @click="openUserDetail(user)"
          >
            <div class="row-main">
              <div class="avatar" :class="user.role === 'super_admin' ? 'avatar-amber' : 'avatar-teal'">
                {{ (user.full_name || user.email || '?').charAt(0).toUpperCase() }}
              </div>
              <div class="row-text">
                <span class="row-muted">{{ user.restaurant_name || "Super Admin" }}</span>
                <span class="row-sub">{{ user.email }}</span>
              </div>
            </div>

            <div class="row-meta">
              <span class="tag" :class="user.role === 'super_admin' ? 'tag-amber' : 'tag-blue'">
                {{ user.role === "super_admin" ? t.super_admin_label : t.owner }}
              </span>
              <span class="status-dot" :class="'sd-' + user.status">
                <i></i>{{ user.status }}
              </span>
              <span class="status-dot" :class="user.email_verified_at ? 'sd-verified' : 'sd-pending'">
                <i></i>{{ user.email_verified_at ? t.email_verified : t.not_verified }}
              </span>
              
            </div>

            <div class="row-actions" @click.stop>
              <select
                :value="user.status"
                @change="updateUserStatus(user.id, $event.target.value)"
                class="select"
              >
                <option value="active">{{ t.activate }}</option>
                <option value="suspended">{{ t.suspend }}</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
        <div v-else class="empty">
          <AppIcon name="category" :size="34" />
          <p>{{ t.no_data }}</p>
        </div>
      </section>

      <!-- RESTAURANTS -->
      <section v-if="tab === 'restaurants'" class="panel">
        <div class="panel-head">
          <span class="panel-title"><AppIcon name="store" :size="16" /> {{ t.restaurants }}</span>
          <span class="panel-count">{{ restaurants.length }}</span>
        </div>

        <div v-if="restaurants.length" class="rows">
          <div
            v-for="r in restaurants"
            :key="r.id"
            class="row"
            @click="openRestaurantDetail(r)"
          >
            <div class="row-main">
              <div class="avatar avatar-amber avatar-square">
                <AppIcon name="store" :size="16" />
              </div>
              <div class="row-text">
                <span class="row-title">{{ r.name }}</span>
                <span class="row-sub">{{ r.owner_email }}</span>
              </div>
            </div>

            <div class="row-meta">
              <span class="status-dot" :class="'sd-' + r.status">
                <i></i>{{ r.status }}
              </span>
              <code class="code" v-if="r.telegram_link_code">{{ r.telegram_link_code }}</code>
              <span class="row-muted">{{ formatDate(r.created_at) }}</span>
            </div>
          </div>
        </div>
        <div v-else class="empty">
          <AppIcon name="category" :size="34" />
          <p>{{ t.no_data }}</p>
        </div>
      </section>
    </main>

    <!-- USER DETAIL DRAWER -->
    <Teleport to="body">
      <Transition name="drawer">
        <div v-if="selectedUser" class="drawer-overlay" @click.self="selectedUser = null">
          <div class="drawer">
            <div class="drawer-head">
              <div class="drawer-id">
                <div class="avatar avatar-lg" :class="selectedUser.role === 'super_admin' ? 'avatar-amber' : 'avatar-teal'">
                  {{ (selectedUser.full_name || '?').charAt(0).toUpperCase() }}
                </div>
                <div>
                  <div class="drawer-title">{{ selectedUser.full_name || t.username }}</div>
                  <div class="drawer-sub">{{ selectedUser.email }}</div>
                </div>
              </div>
              <button class="icon-btn" @click="selectedUser = null" aria-label="Close">✕</button>
            </div>

            <div class="drawer-body">
              <div class="field-grid">
                <div class="field">
                  <span class="field-label">ID</span>
                  <span class="field-value">#{{ selectedUser.id }}</span>
                </div>
                <div class="field">
                  <span class="field-label">{{ t.role }}</span>
                  <span class="tag" :class="selectedUser.role === 'super_admin' ? 'tag-amber' : 'tag-blue'">
                    {{ selectedUser.role === "super_admin" ? t.super_admin_label : t.owner }}
                  </span>
                </div>
                <div class="field">
                  <span class="field-label">{{ t.status }}</span>
                  <span class="status-dot" :class="'sd-' + selectedUser.status"><i></i>{{ selectedUser.status }}</span>
                </div>
                <div class="field">
                  <span class="field-label">{{ t.email_verified }}</span>
                  <span class="status-dot" :class="selectedUser.email_verified_at ? 'sd-verified' : 'sd-pending'">
                    <i></i>{{ selectedUser.email_verified_at ? t.email_verified : t.not_verified }}
                  </span>
                </div>
                <div class="field">
                  <span class="field-label">{{ t.restaurants }}</span>
                  <span class="field-value">{{ selectedUser.restaurant_name || "—" }}</span>
                </div>
                <div class="field">
                  <span class="field-label">{{ t.created_at }}</span>
                  <span class="field-value">{{ formatDate(selectedUser.created_at) }}</span>
                </div>
              </div>

              <div class="drawer-actions">
                <select
                  :value="selectedUser.status"
                  @change="updateModalUserStatus($event.target.value)"
                  class="select select-block"
                >
                  <option value="active">{{ t.activate }}</option>
                  <option value="suspended">{{ t.suspend }}</option>
                  <option value="inactive">Inactive</option>
                </select>

                <button
                  v-if="!selectedUser.email_verified_at"
                  class="btn btn-green"
                  @click="verifyUserEmail(selectedUser.id)"
                >
                  <AppIcon name="check" :size="14" /> {{ t.verify_email_btn || "Verify email" }}
                </button>
                <button
                  v-if="!selectedUser.email_verified_at"
                  class="btn btn-blue"
                  @click="resendVerification(selectedUser.id)"
                >
                  <AppIcon name="mail" :size="14" /> {{ t.resend_verification || "Resend verification" }}
                </button>
                <button class="btn btn-ghost" @click="selectedUser = null">{{ t.close }}</button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- RESTAURANT DETAIL DRAWER -->
    <Teleport to="body">
      <Transition name="drawer">
        <div v-if="selectedRestaurant" class="drawer-overlay" @click.self="selectedRestaurant = null">
          <div class="drawer">
            <div class="drawer-head">
              <div class="drawer-id">
                <div class="avatar avatar-lg avatar-amber avatar-square">
                  <AppIcon name="store" :size="20" />
                </div>
                <div>
                  <div class="drawer-title">{{ selectedRestaurant.name }}</div>
                  <div class="drawer-sub">{{ selectedRestaurant.owner_email }}</div>
                </div>
              </div>
              <button class="icon-btn" @click="selectedRestaurant = null" aria-label="Close">✕</button>
            </div>

            <div class="drawer-body">
              <div class="field-grid">
                <div class="field">
                  <span class="field-label">ID</span>
                  <span class="field-value">#{{ selectedRestaurant.id }}</span>
                </div>
                <div class="field">
                  <span class="field-label">{{ t.restaurant_name }}</span>
                  <span class="field-value">{{ selectedRestaurant.name }}</span>
                </div>
                <div class="field">
                  <span class="field-label">{{ t.status }}</span>
                  <span class="status-dot" :class="'sd-' + selectedRestaurant.status">
                    <i></i>{{ selectedRestaurant.status }}
                  </span>
                </div>
                <div class="field">
                  <span class="field-label">{{ t.telegram_link_code || "Link code" }}</span>
                  <code class="code">{{ selectedRestaurant.telegram_link_code || "—" }}</code>
                </div>
                <div class="field">
                  <span class="field-label">{{ t.created_at }}</span>
                  <span class="field-value">{{ formatDate(selectedRestaurant.created_at) }}</span>
                </div>
              </div>

              <div class="drawer-actions">
                <button class="btn btn-ghost" @click="selectedRestaurant = null">{{ t.close }}</button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- CONFIRM LOGOUT (exact style from AdminView) -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showLogoutModal"
          class="modal-overlay"
          @click.self="showLogoutModal = false"
        >
          <div class="confirm-box pop-in">
            <div class="confirm-icon"><AppIcon name="lock" :size="36" /></div>
            <div class="confirm-title confirm-title--blue">{{ t.logout }}</div>
            <div class="confirm-name">{{ t.confirm_logout }}</div>
            <div class="confirm-btns">
              <button class="confirm-cancel" @click="showLogoutModal = false">{{ t.cancel }}</button>
              <button class="confirm-logout" @click="confirmLogout">{{ t.logout }}</button>
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

// Modal / drawer state
const selectedUser = ref(null);
const selectedRestaurant = ref(null);
const showLogoutModal = ref(false);
const mobileNavOpen = ref(false);

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
    console.log("Fetched users:", users.value);
  } catch (err) {
    console.error(err);
  }
}

async function fetchRestaurants() {
  try {
    const res = await axios.get(`${API_BASE}/api/admin/restaurants`);
    restaurants.value = res.data;
    console.log("Fetched restaurants:", restaurants.value);
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

async function verifyUserEmail(userId) {
  try {
    const res = await axios.post(`${API_BASE}/api/admin/users/${userId}/verify`);
    if (selectedUser.value && selectedUser.value.id === userId) {
      selectedUser.value.email_verified_at = new Date().toISOString();
    }
    const user = users.value.find(u => u.id === userId);
    if (user) user.email_verified_at = new Date().toISOString();
    alert(res.data.message || "Email verified successfully");
  } catch (err) {
    alert(err.response?.data?.error || t.error);
  }
}

async function resendVerification(userId) {
  try {
    const res = await axios.post(`${API_BASE}/api/admin/users/${userId}/resend-verification`);
    alert(res.data.message || "Verification email sent");
  } catch (err) {
    alert(err.response?.data?.error || t.error);
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

<style>
:root {
  /* Brand palette */
  --teal: #0f766e;
  --teal-dark: #0d5e57;
  --green: #22c55e;
  --green-soft: #86efac;
  --amber: #f59e0b;
  --amber-soft: #fbbf24;
  --red: #c62828;
  --red-deep: #b71c1c;
  --blue: #2563eb;
  --ink: #14532d;
  --ink-light: #166534;
  --muted: #6b7280;
  --muted-light: #9ca3af;
  --text: #374151;
  --surface: #ffffff;
  --surface-soft: #f8fdf9;
  --surface-warm: #f0fdf4;
  --border: #e2e8f0;
  --border-light: #e6f3e8;
}
</style>

<style scoped>
/* ════════════════════════════════════════════════════════
   SUPER ADMIN VIEW — Sidebar layout
   Colors matched to AdminView brand (teal/green/amber)
   ════════════════════════════════════════════════════════ */

.shell {
  display: grid;
  grid-template-columns: 236px 1fr;
  background: #f1f5f4;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: var(--text);
}

/* ═══ SIDEBAR ═══ */
.sidebar {
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  z-index: 100;
}

/* Brand area with gradient */
.brand-area {
  background: linear-gradient(135deg, #0f766e 0%, #166534 50%, #22c55e 100%);
  padding: 24px 18px;
  position: relative;
  display: flex;
  align-items: center;
  height: 70px;
  overflow: hidden;
}
.brand-glow {
  position: absolute;
  top: -40px;
  right: -30px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  pointer-events: none;
}
.brand-content {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  z-index: 1;
}
.mark {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  justify-content: center;
  align-items: center;
  object-fit: cover;
}

.brand-text {
  display: flex;
  flex-direction: column;
}
.brand-name {
  font-family: "Hanuman", serif;
  font-size: 15px;
  font-weight: 700;
  color: white;
  line-height: 1.3;
}
.brand-role {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.75);
  font-weight: 500;
}

/* Navigation */
.nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 10px;
  flex: 1;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 12px;
  border: none;
  background: none;
  border-radius: 10px;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--muted);
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
}
.nav-item:hover {
  background: var(--surface-warm);
  color: var(--ink);
}
.nav-item.active {
  background: var(--surface-warm);
  color: var(--teal);
  box-shadow: inset 3px 0 0 var(--teal);
}

/* Sidebar footer */
.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 14px 20px;
  border-top: 1px solid var(--border);
}
.lang-btn {
  padding: 9px 12px;
  background: var(--surface-warm);
  color: var(--ink);
  border: 1px solid var(--border-light);
  border-radius: 10px;
  font-size: 12px;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.lang-btn:hover {
  border-color: var(--green);
  background: #dcfce7;
}
.logout-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 9px 12px;
  background: #fef2f2;
  border-color: #fecaca;
  border: 1px solid transparent;
  border-radius: 10px;
  font-size: 12.5px;
  font-family: inherit;
  font-weight: 600;
  color: var(--red);
  cursor: pointer;
  transition: all 0.15s;
}
.logout-link:hover {
  background: #fef2f2;
  border-color: #fecaca;
}

/* ═══ MOBILE BAR / SCRIM ═══ */
.mobile-bar { display: none; height: 70px;}
.nav-scrim { display: none; }

/* ═══ MAIN ═══ */
.main {
  padding: 28px 32px 60px;
  max-width: 1200px;
  width: 100%;
}
.topbar {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--border-light);
}
.page-title {
  font-family: "Hanuman", serif;
  font-size: 22px;
  font-weight: 700;
  color: var(--ink);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}
.page-sub {
  font-size: 12.5px;
  color: var(--muted);
  margin: 4px 0 0;
  font-weight: 500;
}

/* ═══ STATS GRID ═══ */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 28px;
}
/* Large tablets */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Tablets */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mobile */
@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  position: relative;
  overflow: hidden;
  transition: transform 0.18s, box-shadow 0.18s;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(20, 83, 45, 0.08);
}
.stat-icon-wrap {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.icon-teal { background: #ccfbf1; color: var(--teal); }
.icon-amber { background: #fef3c7; color: var(--amber); }
.icon-blue { background: #dbeafe; color: var(--blue); }
.icon-green { background: #dcfce7; color: #166534; }

.stat-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.stat-num {
  font-family: "Hanuman", serif;
  font-size: 26px;
  font-weight: 700;
  color: var(--ink);
  line-height: 1.1;
}
.stat-label {
  font-size: 11.5px;
  color: var(--muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.stat-spark {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
}
.stat-spark.teal { background: linear-gradient(90deg, var(--teal), var(--green)); }
.stat-spark.amber { background: linear-gradient(90deg, var(--amber), var(--amber-soft)); }
.stat-spark.blue { background: linear-gradient(90deg, var(--blue), #93c5fd); }
.stat-spark.green { background: linear-gradient(90deg, #166534, var(--green)); }

/* ═══ PANEL / ROWS ═══ */
.panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}
.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  background: var(--surface-soft);
}
.panel-title {
  font-family: "Hanuman", serif;
  font-size: 14.5px;
  font-weight: 700;
  color: var(--ink);
  display: flex;
  align-items: center;
  gap: 8px;
}
.panel-count {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--teal);
  background: var(--surface-warm);
  border: 1px solid #bbf7d0;
  padding: 3px 12px;
  border-radius: 999px;
}

.rows { display: flex; flex-direction: column; }

.row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 20px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background 0.12s;
}
.row:last-child { border-bottom: none; }
.row:hover { background: #f8fdfa; }

.row-main {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
  flex: 1 1 auto;
}

/* Avatar */
.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Hanuman", serif;
  font-weight: 700;
  font-size: 14px;
  color: white;
  flex-shrink: 0;
}
.avatar-square { border-radius: 10px; }
.avatar-lg { width: 46px; height: 46px; font-size: 16px; }
.avatar-teal { background: linear-gradient(135deg, var(--teal), var(--green)); }
.avatar-amber { background: linear-gradient(135deg, var(--amber), #f59e0b); }

.row-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.row-title {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.row-sub {
  font-size: 11.5px;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  flex: 1 0 auto;
  justify-content: flex-end;
}
.row-muted { font-size: 12px; color: var(--muted); white-space: nowrap; }

.row-actions { flex-shrink: 0; }

/* Tags */
.tag {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  white-space: nowrap;
  letter-spacing: 0.2px;
}
.tag-amber { background: #fef3c7; color: #92400e; }
.tag-blue { background: #dbeafe; color: #1e40af; }
.tag-teal { background: #ccfbf1; color: #0f766e; }

/* Status dots */
.status-dot {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
}
.status-dot i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
}
.sd-active i { background: #16a34a; box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.15); }
.sd-suspended i { background: var(--red); }
.sd-inactive i { background: var(--muted-light); }
.sd-verified i { background: #16a34a; box-shadow: 0 0 0 2px rgba(22, 163, 74, 0.15); }
.sd-pending i { background: #f59e0b; box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.15); }

/* Code */
.code {
  background: #fefce8;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  color: #92400e;
  font-family: "SFMono-Regular", Consolas, monospace;
  border: 1px solid #fde68a;
}

/* Select */
.select {
  padding: 7px 10px;
  border: 1.5px solid var(--border);
  border-radius: 9px;
  font-size: 12px;
  font-family: inherit;
  color: var(--text);
  background: var(--surface);
  outline: none;
  cursor: pointer;
  min-width: 100px;
  transition: border-color 0.15s;
}
.select:focus, .select:focus-visible { border-color: var(--green); box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.12); }
.select-block { width: 100%; }

/* Empty state */
.empty {
  text-align: center;
  padding: 56px 20px;
  color: var(--muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.empty p { margin: 0; font-size: 13.5px; }

/* ═══ ICON BUTTONS ═══ */
.icon-btn {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--surface);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--ink);
  font-size: 14px;
  transition: all 0.15s;
  flex-shrink: 0;
}
.icon-btn:hover { background: var(--surface-warm); border-color: var(--green-soft); }

/* ═══ DRAWER (detail panels) ═══ */
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(20, 40, 30, 0.35);
  z-index: 200;
  display: flex;
  justify-content: flex-end;
}
.drawer {
  width: 100%;
  max-width: 440px;
  height: 100%;
  background: var(--surface);
  box-shadow: -18px 0 40px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}
.drawer-overlay:active .drawer,
.drawer:hover { box-shadow: -18px 0 50px rgba(0, 0, 0, 0.15); }

.drawer-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 24px 22px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--surface-soft);
}
.drawer-id { display: flex; align-items: center; gap: 12px; }
.drawer-title {
  font-family: "Hanuman", serif;
  font-size: 16px;
  font-weight: 700;
  color: var(--ink);
}
.drawer-sub { font-size: 12px; color: var(--muted); margin-top: 2px; }

.drawer-body { padding: 22px 22px 30px; display: flex; flex-direction: column; gap: 24px; }

/* Field grid */
.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.field {
  background: var(--surface-soft);
  border-radius: 11px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.field-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--muted-light);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.field-value { font-size: 13px; font-weight: 600; color: var(--text); }

/* Drawer actions */
.drawer-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.drawer-actions .btn {
  flex: 1;
  justify-content: center;
  min-width: 120px;
}

/* Buttons */
.btn {
  padding: 9px 16px;
  border: none;
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s;
  white-space: nowrap;
}
.btn:hover { filter: brightness(0.95); }
.btn:active { transform: scale(0.98); }
.btn-ghost { background: var(--surface-warm); color: var(--ink); }
.btn-ghost:hover { background: #dcfce7; }
.btn-green { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
.btn-green:hover { background: #bbf7d0; }
.btn-blue { background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; }
.btn-blue:hover { background: #bfdbfe; }
/* ═══ CONFIRM MODAL (exact style from AdminView) ═══ */
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
  color: var(--text);
  margin-bottom: 18px;
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
  background: #7a2a2a;
}

/* ═══ TRANSITIONS ═══ */
.fade-enter-active, .fade-leave-active { transition: opacity 0.18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.drawer-enter-active, .drawer-leave-active { transition: opacity 0.2s ease; }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }

.drawer { transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1); }
.drawer-enter-from .drawer, .drawer-leave-to .drawer { transform: translateX(100%); }

/* ═══ REDUCED MOTION ═══ */
@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; animation: none !important; }
}

/* ════════════════════════════════════════════════════════
   RESPONSIVE — Tablet & Mobile
   ════════════════════════════════════════════════════════ */

/* Tablet: 900px and below */
@media (max-width: 900px) {
  .shell { grid-template-columns: 1fr; }

  /* Mobile top bar */
  .mobile-bar {
    display: flex;
    align-items: center;
    height: 70px !important;
    gap: 12px;
    padding: 14px 16px;
    background: linear-gradient(135deg, #0f766e, #166534);
    color: white;
    position: sticky;
    top: 0;
    z-index: 90;
  }
  .mobile-bar .icon-btn {
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
  .mobile-bar .icon-btn:hover { background: rgba(255, 255, 255, 0.2); }
  .mobile-bar-title {
    font-family: "Hanuman", serif;
    font-weight: 700;
    font-size: 14.5px;
    color: white;
    flex: 1;
  }

  /* Sidebar slides in from left */
  .sidebar {
    position: fixed;
    left: -260px;
    top: 0;
    width: 236px;
    z-index: 220;
    transition: left 0.22s ease;
    box-shadow: none;
  }
  .nav-open .sidebar { left: 0; box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15); }

  .nav-open .nav-scrim {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 210;
  }

  /* Main content */
  .main { padding: 20px 14px 48px; }

  /* Stats: 2x2 grid */
  .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .stat-card { padding: 14px; }
  .stat-icon-wrap { width: 36px; height: 36px; }
  .stat-icon-wrap :deep(svg) { width: 18px; height: 18px; }
  .stat-num { font-size: 22px; }
  .stat-label { font-size: 10px; }

  /* Row: stack vertically */
  .row {
    flex-direction: column;
    align-items: stretch;
    padding: 14px 16px;
    gap: 10px;
  }
  .row-main { min-width: 0; }
  .row-meta {
    justify-content: flex-start;
    gap: 8px;
  }
  .row-actions { width: 100%; }
  .row-actions .select { width: 100%; }

  /* Drawer: full width on mobile */
  .drawer { max-width: 100%; }
  .field-grid { grid-template-columns: 1fr; }
  .drawer-actions .btn { min-width: 0; }
}

/* Small phone: 480px and below */
@media (max-width: 480px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .stat-card { padding: 12px; gap: 10px; }
  .stat-icon-wrap { width: 32px; height: 32px; border-radius: 10px; }
  .stat-icon-wrap :deep(svg) { width: 16px; height: 16px; }
  .stat-num { font-size: 20px; }

  .panel-head { padding: 14px 14px; }
  .panel-head .panel-title { font-size: 13px; }

  .row { padding: 12px 14px; }
  .row-title { font-size: 12.5px; }
  .row-sub { font-size: 11px; }
  .row-meta { font-size: 11px; gap: 6px; }

  .row-meta .tag { font-size: 10px; padding: 2px 8px; }
  .row-meta .status-dot { font-size: 10.5px; }

  .avatar { width: 32px; height: 32px; font-size: 12px; }
  .avatar-lg { width: 40px; height: 40px; font-size: 14px; }

  .drawer-head { padding: 18px 16px 14px; }
  .drawer-body { padding: 16px 16px 24px; gap: 18px; }

  .topbar { margin-bottom: 16px; padding-bottom: 12px; }
  .page-title { font-size: 18px; }
  .page-sub { font-size: 11.5px; }

  .confirm-box { max-width: 280px; padding: 24px 18px; }
}
</style>