<!-- frontend/src/views/AdminView.vue -->
<template>
  <div>
    <!-- HEADER -->
    <div class="header">
      <div class="header-bg-overlay"></div>
      <div class="header-bg-pattern"></div>
      <div class="header-content">
        <div class="header-logo-ring">
          <img
            :src="restaurantLogo"
            class="header-logo"
            alt="restaurant logo"
          />
        </div>
        <div class="header-text">
          <div class="header-restaurant-name">
            {{ auth.restaurant?.name || "ភោជនីយដ្ឋាន" }}
          </div>
        </div>
      </div>
    </div>

    <!-- ADMIN BAR -->
    <div class="admin-bar">
      <div class="admin-actions">
        <button class="admin-add-btn" @click="openAdd">
          <AppIcon name="add" :size="16" /> {{ i18n.t.add_food }}
        </button>
        <div class="admin-right">
          <button class="lang-btn" @click="i18n.toggleLocale">
            {{ i18n.locale === "km" ? "English" : "ភាសាខ្មែរ" }}
          </button>
          <button class="admin-add-cat-btn" @click="openCatForm()">
            <AppIcon name="category" :size="16" /> {{ i18n.t.add_category }}
          </button>
          <button class="admin-qr-btn" @click="showQR = true">
            <AppIcon name="qr" :size="16" /> {{ i18n.t.generate_qr }}
          </button>
          <button class="admin-profile-btn" @click="openProfile">
            <AppIcon name="user" :size="16" /> {{ i18n.t.profile || "Profile" }}
          </button>
          <button
            class="admin-telegram-btn"
            @click="showTelegramSettings = true"
          >
            <AppIcon name="telegram" :size="16" /> {{ i18n.t.telegram }}
          </button>
          <button class="admin-logout-btn" @click="loggingOut = true">
            <AppIcon name="lock" :size="16" /> {{ i18n.t.logout }}
          </button>
        </div>
      </div>
    </div>

    <!-- PREVIEW + DASHBOARD SUMMARY -->
    <div class="dashboard-summary">
      <div class="summary-card preview-card">
        <div class="preview-card-glow"></div>
        <div class="preview-card-bg-pattern">
          <span class="pattern-dot"></span>
          <span class="pattern-dot"></span>
          <span class="pattern-dot"></span>
          <span class="pattern-dot"></span>
          <span class="pattern-dot"></span>
          <span class="pattern-dot"></span>
          <span class="pattern-dot"></span>
          <span class="pattern-dot"></span>
          <span class="pattern-dot"></span>
          <span class="pattern-dot"></span>
          <span class="pattern-dot"></span>
          <span class="pattern-dot"></span>
        </div>
        <div class="summary-card-content">
          <div class="preview-card-header">
            <div class="preview-card-header-left">
              <div class="preview-icon-wrapper">
                <AppIcon name="eye" :size="30" />
              </div>
              <div>
                <div class="summary-card-title">{{ i18n.t.owner_preview }}</div>
                <p class="summary-card-subtitle">
                  {{ i18n.t.guest_menu_experience }}
                </p>
              </div>
            </div>
            <span class="preview-live-badge">
              <span class="live-dot"></span>
              {{ i18n.t.live }}
            </span>
          </div>
          <p class="summary-card-text">
            {{ i18n.t.preview_desc }}
          </p>
          <div class="preview-actions">
            <div class="preview-url-box">
              <span class="preview-url-icon">🔗</span>
              <span class="preview-url-text">{{
                previewMenuUrl !== "#"
                  ? previewMenuUrl.slice(0, 40) + "..."
                  : i18n.t.menu_url
              }}</span>
            </div>
            <div class="summary-actions">
              <button class="copy-btn" @click="copyPreviewLink">
                <span class="btn-icon">{{
                  previewLinkCopied ? "✅" : "📋"
                }}</span>
                <span>{{
                  previewLinkCopied ? i18n.t.copied : i18n.t.copy_link
                }}</span>
              </button>
              <button class="open-btn" @click="openPreview">
                <span class="btn-icon">🚀</span>
                <span>{{ i18n.t.open_menu }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="summary-card stats-card">
        <div class="summary-card-bg"></div>
        <div class="summary-card-content">
          <div class="summary-card-top">
            <AppIcon name="chart" :size="22" class="summary-card-icon" />
            <span class="stats-period-badge">{{ i18n.t.today }}</span>
          </div>
          <div class="summary-card-title">{{ i18n.t.daily_revenue }}</div>
          <div class="stats-values">
            <div class="stats-item stats-item-revenue">
              <div class="stats-number">
                {{ Number(stats.totalRevenue || 0).toLocaleString() }}
                <span class="stats-currency">៛</span>
              </div>
              <div class="stats-label">
                <span class="stats-dot revenue-dot"></span>
                {{ i18n.t.revenue }}
              </div>
            </div>
            <div class="stats-divider"></div>
            <div class="stats-item stats-item-orders">
              <div class="stats-number">{{ stats.totalOrders || 0 }}</div>
              <div class="stats-label">
                <span class="stats-dot orders-dot"></span>
                {{ i18n.t.orders }}
              </div>
            </div>
          </div>
          <div class="stats-filter">
            <div class="stats-filter-group">
              <label class="stats-filter-label">{{ i18n.t.from }}</label>
              <input
                type="date"
                v-model="statsStartDate"
                @change="fetchStats"
              />
            </div>
            <div class="stats-filter-arrow">→</div>
            <div class="stats-filter-group">
              <label class="stats-filter-label">{{ i18n.t.to }}</label>
              <input type="date" v-model="statsEndDate" @change="fetchStats" />
            </div>
          </div>
          <div v-if="statsLoading" class="stats-loading">
            <span class="stats-spinner"></span>
            Loading...
          </div>
          <div v-else-if="statsError" class="stats-error">{{ statsError }}</div>
        </div>
      </div>
    </div>

    <!-- TABS: FOODS / CATEGORIES / ORDERS -->
    <div class="admin-tabs">
      <button
        class="admin-tab"
        :class="{ active: adminTab === 'foods' }"
        @click="adminTab = 'foods'"
      >
        <AppIcon name="food" :size="16" /> ម្ហូប
      </button>
      <button
        class="admin-tab"
        :class="{ active: adminTab === 'categories' }"
        @click="adminTab = 'categories'"
      >
        <AppIcon name="category" :size="16" /> ប្រភេទ
      </button>
      <button
        class="admin-tab"
        :class="{ active: adminTab === 'orders' }"
        @click="
          adminTab = 'orders';
          fetchOrders();
        "
      >
        <AppIcon name="clipboard" :size="16" /> ការកម្មង់
      </button>
    </div>

    <!-- ─── FOODS MANAGEMENT ─── -->
    <div v-if="adminTab === 'foods'">
      <!-- TABS -->
      <div class="tabs-wrap">
        <div class="tabs">
          <button
            v-for="cat in foods.categories"
            :key="cat.id"
            class="tab"
            :class="{ active: curCat === cat.id }"
            @click="
              curCat = cat.id;
              load();
            "
          >
            {{ cat.label_km }}
          </button>
        </div>
      </div>

      <!-- SEARCH -->
      <div class="search-bar">
        <div class="search-wrap">
          <AppIcon name="search" :size="18" class="search-icon" />
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
          <div class="empty-icon"><AppIcon name="clock" :size="40" /></div>
          Loading...
        </div>
        <div v-else-if="!foods.foods.length" class="empty">
          <div class="empty-icon"><AppIcon name="search" :size="40" /></div>
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

    <!-- ─── CATEGORIES MANAGEMENT ─── -->
    <div v-else-if="adminTab === 'categories'" class="cat-mgmt-section">
      <div class="cat-mgmt-header">
        <span><AppIcon name="category" :size="18" /> គ្រប់គ្រងប្រភេទម្ហូប</span>
        <button class="cat-mgmt-add-btn" @click="openCatForm()">
          <AppIcon name="add" :size="14" /> បន្ថែម
        </button>
      </div>

      <div v-if="!foods.categories.length" class="empty">
        <div class="empty-icon"><AppIcon name="category" :size="40" /></div>
        មិនទាន់មានប្រភេទទេ
      </div>

      <div v-else class="cat-list">
        <div v-for="cat in foods.categories" :key="cat.id" class="cat-item">
          <div class="cat-item-info">
            <div class="cat-item-name">{{ cat.label_km }}</div>
          </div>
          <div class="cat-item-right">
            <button class="cat-item-edit" @click="openCatForm(cat)">
              <AppIcon name="edit" :size="16" />
            </button>
            <button class="cat-item-del" @click="confirmDelCat(cat)">
              <AppIcon name="trash" :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── ORDERS MANAGEMENT ─── -->
    <div v-else class="orders-section">
      <div class="orders-header">
        <span><AppIcon name="clipboard" :size="18" /> ការកម្មង់ថ្មីៗ</span>
      </div>

      <div v-if="ordersLoading" class="empty">
        <div class="empty-icon"><AppIcon name="clock" :size="40" /></div>
        Loading...
      </div>

      <div v-else-if="!orders.length" class="empty">
        <div class="empty-icon"><AppIcon name="clipboard" :size="40" /></div>
        មិនទាន់មានការកម្មង់ទេ
      </div>

      <div v-else class="orders-list">
        <div v-for="order in orders" :key="order.id" class="order-card">
          <div class="order-header">
            <span class="order-id">#{{ order.id }}</span>
            <span class="order-table"
              ><AppIcon name="table" :size="14" /> តុ {{ order.table_no }}</span
            >
          </div>
          <div class="order-time">{{ formatDate(order.created_at) }}</div>
          <div class="order-items">
            <div
              v-for="(item, idx) in parseItems(order.items)"
              :key="idx"
              class="order-item"
            >
              <span>{{ item.name }}</span>
              <span
                >{{ item.qty }} ×
                {{ Number(item.price).toLocaleString() }}៛</span
              >
            </div>
          </div>
          <div v-if="order.note" class="order-note">
            <AppIcon name="note" :size="14" /> {{ order.note }}
          </div>
          <div class="order-total">
            <AppIcon name="money" :size="14" /> សរុប:
            {{ Number(order.total).toLocaleString() }}៛
          </div>
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

    <!-- CONFIRM DELETE FOOD -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="deletingFood"
          class="modal-overlay"
          @click.self="deletingFood = null"
        >
          <div class="confirm-box pop-in">
            <div class="confirm-icon"><AppIcon name="trash" :size="36" /></div>
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

    <!-- CONFIRM DELETE CATEGORY -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="deletingCat"
          class="modal-overlay"
          @click.self="deletingCat = null"
        >
          <div class="confirm-box pop-in">
            <div class="confirm-icon"><AppIcon name="trash" :size="36" /></div>
            <div class="confirm-title">លុបប្រភេទនេះ?</div>
            <div class="confirm-name">{{ deletingCat.label_km }}</div>
            <div class="confirm-btns">
              <button class="confirm-cancel" @click="deletingCat = null">
                បោះបង់
              </button>
              <button class="confirm-delete" @click="doDeleteCat">លុប</button>
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
              <span><AppIcon name="qr" :size="16" /> បង្កើត QR សម្រាប់តុ</span>
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
                  {{ qrLoading ? "" : "បង្កើត" }}
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
                  <AppIcon name="download" :size="14" /> ទាញយក QR
                </a>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- TELEGRAM SETTINGS MODAL -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showTelegramSettings"
          class="modal-overlay"
          @click.self="showTelegramSettings = false"
        >
          <div class="modal-card pop-in">
            <div class="modal-header">
              <span class="modal-header-title"
                ><AppIcon name="telegram" :size="18" /> ភ្ជាប់ Telegram</span
              >
              <button class="close-btn" @click="showTelegramSettings = false">
                ✕
              </button>
            </div>
            <div class="modal-form">
              <div v-if="tgSuccess" class="form-success-msg">
                {{ tgSuccess }}
              </div>
              <div v-if="tgError" class="tg-error-msg">
                <AppIcon name="alert-circle" :size="14" /> {{ tgError }}
              </div>

              <div class="telegram-note">
                <p>
                  <AppIcon name="bell" :size="14" /> ភ្ជាប់ Telegram
                  ដើម្បីទទួលការជូនដំណឹងរាល់ពេលមានការបញ្ជាទិញថ្មី!
                </p>
                <div class="telegram-bot-name">
                  <AppIcon name="telegram" :size="14" /> Bot:
                  <strong>@digital_menu_khmer_bot</strong>
                </div>
              </div>

              <!-- Link Code Display -->
              <div class="link-code-section">
                <div class="link-code-label">លេខកូដភ្ជាប់របស់អ្នក៖</div>
                <div class="link-code-box" @click="copyLinkCode">
                  <span class="link-code-value">{{ displayLinkCode }}</span>
                  <button class="link-code-copy-btn" title="ចម្លង">
                    <AppIcon name="clipboard" :size="16" />
                  </button>
                </div>
                <div v-if="copied" class="link-code-copied">
                  <AppIcon name="check" :size="14" /> ចម្លងរួច!
                </div>
                <div class="link-code-hint">
                  <span class="link-code-permanent"
                    ><AppIcon name="lock" :size="12" />
                    លេខកូដនេះមិនអាចប្តូរបានទេ</span
                  >
                </div>
              </div>

              <!-- Instructions -->
              <details class="telegram-guide" :open="!isLinked">
                <summary class="telegram-guide-summary">
                  <AppIcon name="book-open" :size="14" /> របៀបភ្ជាប់ Telegram
                </summary>
                <div class="telegram-guide-content">
                  <div class="guide-step">
                    <span class="guide-step-num">1</span>
                    <span>បើក Telegram របស់អ្នក</span>
                  </div>
                  <div class="guide-step">
                    <span class="guide-step-num">2</span>
                    <span
                      >ស្វែងរក Bot
                      <strong>@digital_menu_khmer_bot</strong></span
                    >
                  </div>
                  <div class="guide-step">
                    <span class="guide-step-num">3</span>
                    <span
                      >ចុច <strong>Start</strong> ឬផ្ញើ
                      <code>/start</code></span
                    >
                  </div>
                  <div class="guide-step">
                    <span class="guide-step-num">4</span>
                    <span
                      >ផ្ញើ <code>/link <strong>លេខកូដ</strong></code> (ឧ.
                      <code>/link {{ displayLinkCode }}</code
                      >)</span
                    >
                  </div>
                  <div class="guide-step">
                    <span class="guide-step-num">5</span>
                    <span
                      >រួចរាល់!
                      <AppIcon name="check" :size="14" />
                      អ្នកនឹងទទួលបានការជូនដំណឹងរាល់ពេលមានការបញ្ជាទិញ</span
                    >
                  </div>
                </div>
              </details>

              <!-- Status -->
              <div v-if="isLinked" class="tg-linked-status">
                <span class="tg-linked-badge"
                  ><AppIcon name="check-circle" :size="14" /> ភ្ជាប់ Telegram
                  រួចរាល់</span
                >
                <button class="tg-unlink-btn" @click="unlinkTelegram">
                  លែងភ្ជាប់
                </button>
              </div>
              <div v-else class="tg-not-linked">
                ⚠️ មិនទាន់ភ្ជាប់ Telegram នៅឡើយទេ
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
            <div class="confirm-icon"><AppIcon name="lock" :size="36" /></div>
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

    <!-- CATEGORY FORM MODAL (green theme matching FoodFormModal) -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showCatForm"
          class="modal-overlay"
          @click.self="showCatForm = false"
        >
          <div class="modal-card pop-in">
            <div class="modal-header">
              <span class="modal-header-title">
                {{ editingCat ? "កែប្រែប្រភេទ" : "បន្ថែមប្រភេទ" }}
              </span>
              <button class="close-btn" @click="showCatForm = false">✕</button>
            </div>
            <div class="modal-form">
              <div v-if="catSuccess" class="form-success-msg">
                {{ catSuccess }}
              </div>

              <div class="form-group">
                <label class="form-label">ឈ្មោះប្រភេទ *</label>
                <input
                  v-model="catLabelKm"
                  class="form-input"
                  :class="{ error: catErrors }"
                  placeholder="e.g. ភេសជ្ជៈ, បង្អែម, ..."
                  @input="catErrors = ''"
                />
                <div v-if="catErrors" class="field-err">{{ catErrors }}</div>
              </div>

              <button
                class="submit-btn"
                :disabled="catSubmitting"
                @click="submitCategory"
              >
                {{
                  catSubmitting
                    ? "កំពុងរក្សាទុក..."
                    : editingCat
                    ? "រក្សាទុក"
                    : "បន្ថែម"
                }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- PROFILE MODAL -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showProfile"
          class="modal-overlay"
          @click.self="showProfile = false"
        >
          <div class="modal-card pop-in">
            <div class="modal-header">
              <span class="modal-header-title"
                ><AppIcon name="user" :size="18" />
                {{ i18n.t.profile || "កែប្រែហាង" }}</span
              >
              <button class="close-btn" @click="showProfile = false">✕</button>
            </div>
            <div class="modal-form">
              <div v-if="profileSuccess" class="form-success-msg">
                {{ profileSuccess }}
              </div>
              <div v-if="profileError" class="tg-error-msg">
                {{ profileError }}
              </div>

              <!-- Logo preview -->
              <div class="profile-logo-section">
                <div class="profile-logo-preview">
                  <img
                    :src="profileLogoPreview || restaurantLogo"
                    class="profile-logo-img"
                    alt="logo preview"
                  />
                </div>
                <label class="profile-logo-upload">
                  <AppIcon name="camera" :size="16" />
                  {{ i18n.t.change_logo || "ប្តូររូប" }}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    @change="onLogoChange"
                  />
                </label>
              </div>

              <div class="form-group">
                <label class="form-label"
                  >{{ i18n.t.restaurant_name || "ឈ្មោះហាង" }} *</label
                >
                <input
                  v-model="profileName"
                  class="form-input"
                  placeholder="e.g. ម្លប់ព្រឹក ដាលីន"
                />
              </div>

              <button
                class="submit-btn"
                :disabled="profileSubmitting"
                @click="submitProfile"
              >
                {{ profileSubmitting ? "កំពុងរក្សាទុក..." : "រក្សាទុក" }}
              </button>
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
import { useI18nStore } from "@/stores/i18n";
import FoodCard from "@/components/FoodCard.vue";
import FoodFormModal from "@/components/FoodFormModal.vue";
import AppIcon from "@/components/AppIcon.vue";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;

const router = useRouter();
const auth = useAuthStore();
const foods = useFoodsStore();
const i18n = useI18nStore();

const adminTab = ref("foods");
const curCat = ref("");
const searchQ = ref("");
const showForm = ref(false);
const editingFood = ref(null);
const deletingFood = ref(null);
const loggingOut = ref(false);
const showQR = ref(false);

const stats = ref({ totalRevenue: 0, totalOrders: 0, daily: [] });
const statsLoading = ref(false);
const statsError = ref("");
const statsStartDate = ref(
  new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
);
const statsEndDate = ref(new Date().toISOString().slice(0, 10));
const previewLinkCopied = ref(false);

const previewMenuUrl = computed(() => {
  if (!auth.restaurantId) return "#";
  const origin = window?.location?.origin || "";
  return `${origin}/menu?restaurant_id=${auth.restaurantId}`;
});

// Restaurant
const restaurantLogo = computed(() => {
  return (
    auth.restaurant?.logoUrl ||
    "https://res.cloudinary.com/daji2ml3y/image/upload/v1783262055/ChatGPT_Image_Jul_5_2026_09_32_32_PM_c6ziic.png"
  );
});

// ── Profile Modal ──
const showProfile = ref(false);
const profileName = ref("");
const profileLogoFile = ref(null);
const profileLogoPreview = ref(null);
const profileSubmitting = ref(false);
const profileSuccess = ref("");
const profileError = ref("");

function openProfile() {
  profileName.value = auth.restaurant?.name || "";
  profileLogoFile.value = null;
  profileLogoPreview.value = null;
  profileSuccess.value = "";
  profileError.value = "";
  showProfile.value = true;
}

function onLogoChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  profileLogoFile.value = file;
  const reader = new FileReader();
  reader.onload = (ev) => {
    profileLogoPreview.value = ev.target.result;
  };
  reader.readAsDataURL(file);
}

async function submitProfile() {
  if (!profileName.value.trim()) {
    profileError.value = "សូមបញ្ចូលឈ្មោះហាង";
    return;
  }
  profileSubmitting.value = true;
  profileSuccess.value = "";
  profileError.value = "";
  try {
    const formData = new FormData();
    formData.append("name", profileName.value.trim());
    if (profileLogoFile.value) {
      formData.append("logo", profileLogoFile.value);
    }
    const res = await axios.patch(`${API_BASE}/api/auth/restaurant`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (res.data.restaurant) {
      auth.restaurant.name = res.data.restaurant.name;
      auth.restaurant.logoUrl = res.data.restaurant.logoUrl;
      auth.saveToStorage();
    }
    profileSuccess.value = "រក្សាទុកបានជោគជ័យ!";
    setTimeout(() => {
      showProfile.value = false;
    }, 1200);
  } catch (err) {
    profileError.value =
      err.response?.data?.error || "មានបញ្ហា សូមព្យាយាមម្ដងទៀត";
  } finally {
    profileSubmitting.value = false;
  }
}

// ── Telegram Settings (Link Code) ──
const showTelegramSettings = ref(false);
const tgSubmitting = ref(false);
const tgSuccess = ref("");
const tgError = ref("");
const copied = ref(false);

const displayLinkCode = computed(() => auth.linkCode || "------");
const isLinked = computed(() => auth.isTelegramLinked);

async function copyLinkCode() {
  try {
    await navigator.clipboard.writeText(auth.linkCode || "");
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    const el = document.createElement("textarea");
    el.value = auth.linkCode || "";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  }
}

async function unlinkTelegram() {
  if (!confirm("តើចង់លែងភ្ជាប់ Telegram មែនទេ?")) return;
  try {
    await axios.patch(`${API_BASE}/api/auth/unlink-telegram`);
    if (auth.restaurant) {
      auth.restaurant.telegramChatId = null;
      auth.saveToStorage();
    }
    tgSuccess.value = "លែងភ្ជាប់ Telegram រួចរាល់!";
    setTimeout(() => {
      tgSuccess.value = "";
    }, 2000);
  } catch (err) {
    tgError.value = err.response?.data?.error || "មានបញ្ហា សូមព្យាយាមម្ដងទៀត";
  }
}

// ── Orders ──
const orders = ref([]);
const ordersLoading = ref(false);

async function fetchOrders() {
  ordersLoading.value = true;
  try {
    const res = await axios.get(`${API_BASE}/api/orders`);
    orders.value = res.data;
  } catch (err) {
    console.error("Fetch orders error:", err);
  } finally {
    ordersLoading.value = false;
  }
}

function parseItems(items) {
  try {
    return typeof items === "string" ? JSON.parse(items) : items;
  } catch {
    return [];
  }
}

function statusLabel(status) {
  const labels = {
    pending: "រង់ចាំ",
    confirmed: "បញ្ជាក់",
    preparing: "កំពុងរៀបចំ",
    ready: "រួចរាល់",
    served: "បានបម្រើ",
    cancelled: "បោះបង់",
  };
  return labels[status] || status;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString("km-KH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function updateOrderStatus(orderId, status) {
  try {
    await axios.patch(`${API_BASE}/api/orders/${orderId}/status`, { status });
    const idx = orders.value.findIndex((o) => o.id === orderId);
    if (idx !== -1) orders.value[idx].status = status;
  } catch (err) {
    alert("មិនអាចប្តូរស្ថានភាពកម្មង់បានទេ");
  }
}

// ── Category Form ──
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
    catErrors.value = "សូមបញ្ចូលឈ្មោះប្រភេទ";
    return;
  }
  catSubmitting.value = true;
  try {
    const data = { label_km: catLabelKm.value.trim() };
    if (editingCat.value) {
      await foods.updateCategory(editingCat.value.id, data);
      catSuccess.value = "កែប្រែប្រភេទបានជោគជ័យ!";
      setTimeout(() => {
        showCatForm.value = false;
        editingCat.value = null;
        catSuccess.value = "";
      }, 1200);
    } else {
      await foods.addCategory(data);
      catSuccess.value = "បន្ថែមប្រភេទបានជោគជ័យ!";
      catLabelKm.value = "";
      setTimeout(() => {
        catSuccess.value = "";
      }, 1500);
    }
  } catch (err) {
    catErrors.value = err.response?.data?.error || "មានបញ្ហា សូមព្យាយាមម្ដងទៀត";
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
    alert(err.response?.data?.error || "លុបមិនបានជោគជ័យ");
  }
  deletingCat.value = null;
}

// ── QR Generator ──
const qrTableNumber = ref("");
const qrCodeDataUrl = ref("");
const qrLoading = ref(false);
const qrError = ref("");

const qrDownloadUrl = computed(() => {
  if (!qrTableNumber.value) return "#";
  let url = `${API_BASE}/api/qr/table/${qrTableNumber.value}?format=png`;
  if (auth.restaurantId) {
    url += `&restaurant_id=${auth.restaurantId}`;
  }
  return url;
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
    let url = `${API_BASE}/api/qr/table/${num}`;
    if (auth.restaurantId) {
      url += `?restaurant_id=${auth.restaurantId}`;
    }
    const res = await axios.get(url);
    qrCodeDataUrl.value = res.data.qrCode;
  } catch (e) {
    qrError.value =
      "បង្កើត QR បរាជ័យ: " + (e.response?.data?.error || e.message);
  } finally {
    qrLoading.value = false;
  }
}

async function fetchStats() {
  if (!auth.restaurantId) return;
  statsLoading.value = true;
  statsError.value = "";
  try {
    const res = await axios.get(`${API_BASE}/api/orders/stats`, {
      params: {
        start_date: statsStartDate.value,
        end_date: statsEndDate.value,
      },
    });
    stats.value = res.data;
  } catch (err) {
    statsError.value = err.response?.data?.error || "Failed to load stats";
  } finally {
    statsLoading.value = false;
  }
}

function copyPreviewLink() {
  if (!navigator.clipboard || previewMenuUrl.value === "#") return;
  navigator.clipboard.writeText(previewMenuUrl.value);
  previewLinkCopied.value = true;
  setTimeout(() => {
    previewLinkCopied.value = false;
  }, 2000);
}

function openPreview() {
  if (previewMenuUrl.value === "#") return;
  window.open(previewMenuUrl.value, "_blank");
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
  if (foods.categories.length) curCat.value = foods.categories[0].id;
  await load();
  fetchStats();
});
</script>

<style scoped>
/* ─── DASHBOARD SUMMARY ─── */
.dashboard-summary {
  display: grid;
  gap: 14px;
  padding: 18px 16px 10px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  max-width: 800px;
  margin: 0 auto;
}
.summary-card {
  position: relative;
  background: #fff;
  border: 1.5px solid #e6f3e8;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.1);
}
.summary-card-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  pointer-events: none;
}
.preview-card .summary-card-bg {
  background: linear-gradient(90deg, #f59e0b, #fbbf24, #fcd34d);
}
.stats-card .summary-card-bg {
  background: linear-gradient(90deg, #0f766e, #22c55e, #86efac);
}
.preview-card {
  background: linear-gradient(135deg, #fffbeb 0%, #fefce8 50%, #fff7ed 100%);
  border-color: #fde68a;
  position: relative;
}
.preview-card-glow {
  position: absolute;
  top: -40px;
  right: -40px;
  width: 120px;
  height: 120px;
  background: radial-gradient(
    circle,
    rgba(251, 191, 36, 0.15) 0%,
    transparent 70%
  );
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}
.preview-card-bg-pattern {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}
.pattern-dot {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #fbbf24;
  border-radius: 50%;
  opacity: 0.15;
}
.pattern-dot:nth-child(1) {
  top: 12%;
  left: 8%;
}
.pattern-dot:nth-child(2) {
  top: 25%;
  left: 85%;
}
.pattern-dot:nth-child(3) {
  top: 45%;
  left: 15%;
}
.pattern-dot:nth-child(4) {
  top: 60%;
  left: 75%;
}
.pattern-dot:nth-child(5) {
  top: 78%;
  left: 22%;
}
.pattern-dot:nth-child(6) {
  top: 35%;
  left: 55%;
}
.pattern-dot:nth-child(7) {
  top: 70%;
  left: 50%;
}
.pattern-dot:nth-child(8) {
  top: 15%;
  left: 45%;
}
.pattern-dot:nth-child(9) {
  top: 85%;
  left: 70%;
}
.pattern-dot:nth-child(10) {
  top: 50%;
  left: 88%;
}
.pattern-dot:nth-child(11) {
  top: 90%;
  left: 10%;
}
.pattern-dot:nth-child(12) {
  top: 5%;
  left: 65%;
}

.preview-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.preview-card-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.preview-icon-wrapper {
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.preview-icon {
  font-size: 20px;
  position: relative;
  z-index: 1;
}
.preview-icon-ring::after {
  content: "";
  position: absolute;
  inset: 2px;
  border-radius: 10px;
  background: #fffbeb;
}
.preview-live-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  padding: 4px 12px;
  border-radius: 999px;
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  color: #166534;
  border: 1px solid #86efac;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.2);
}
.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
  animation: livePulse 1.5s ease-in-out infinite;
}
@keyframes livePulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.3);
  }
}
.summary-card-subtitle {
  font-size: 11px;
  color: #a16207;
  margin: 0;
  font-weight: 500;
}
.preview-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.preview-url-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fdf9;
  border: 1px solid #e6f3e8;
  border-radius: 10px;
  padding: 8px 12px;
}
.preview-url-icon {
  font-size: 14px;
  flex-shrink: 0;
}
.preview-url-text {
  font-size: 11px;
  color: #6b7280;
  font-family: "Courier New", monospace;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.summary-card-content {
  position: relative;
  padding: 16px 18px 18px;
  z-index: 1;
}
.summary-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.summary-card-icon {
  font-size: 22px;
  line-height: 1;
}
.summary-card-badge {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 3px 10px;
  border-radius: 999px;
  background: #dcfce7;
  color: #166534;
}
.stats-period-badge {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 3px 10px;
  border-radius: 999px;
  background: #f0fdf4;
  color: #0f766e;
  border: 1px solid #bbf7d0;
}
.summary-card-title {
  font-family: "Hanuman", serif;
  font-size: 16px;
  font-weight: 700;
  color: #14532d;
  margin-bottom: 6px;
}
.summary-card-text {
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 14px;
  line-height: 1.5;
}
.summary-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.copy-btn,
.open-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  border-radius: 999px;
  padding: 9px 16px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}
.copy-btn {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
}
.copy-btn:hover {
  background: #fde68a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
}
.open-btn {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}
.open-btn:hover {
  background: #bbf7d0;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}
.btn-icon {
  font-size: 14px;
  line-height: 1;
}
.stats-values {
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 14px;
  background: #f8fdf9;
  border: 1px solid #e6f3e8;
  border-radius: 14px;
  padding: 14px 16px;
}
.stats-item {
  flex: 1;
  text-align: center;
}
.stats-item-revenue {
  text-align: left;
}
.stats-item-orders {
  text-align: right;
}
.stats-divider {
  width: 1px;
  height: 40px;
  background: #e6f3e8;
  margin: 0 16px;
  flex-shrink: 0;
}
.stats-number {
  font-family: "Hanuman", serif;
  font-size: 22px;
  font-weight: 700;
  color: #14532d;
  line-height: 1.2;
}
.stats-currency {
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  margin-left: 2px;
}
.stats-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
  font-weight: 500;
}
.stats-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}
.revenue-dot {
  background: #22c55e;
}
.orders-dot {
  background: #0f766e;
}
.stats-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #374151;
}
.stats-filter-group {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
}
.stats-filter-label {
  font-size: 10px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.stats-filter input {
  border: 1.5px solid #d1fae5;
  border-radius: 10px;
  padding: 7px 10px;
  font-size: 12px;
  font-family: inherit;
  color: #374151;
  background: #f8fdf9;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
}
.stats-filter input:focus {
  border-color: #22c55e;
}
.stats-filter-arrow {
  color: #d1d5db;
  font-size: 16px;
  font-weight: 300;
  margin-top: 14px;
  flex-shrink: 0;
}
.stats-loading {
  margin-top: 10px;
  font-size: 12px;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 8px;
}
.stats-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #d1fae5;
  border-top-color: #22c55e;
  border-radius: 50%;
  animation: statsSpin 0.6s linear infinite;
  display: inline-block;
}
@keyframes statsSpin {
  to {
    transform: rotate(360deg);
  }
}
.stats-error {
  margin-top: 10px;
  font-size: 12px;
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 8px 12px;
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
.lang-btn {
  padding: 7px 14px;
  background: var(--green-pale);
  color: var(--green-dark);
  border: 1.5px solid var(--green-soft);
  border-radius: 20px;
  font-size: 12px;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.lang-btn:hover {
  background: var(--green-soft);
  color: var(--green-dark);
  border-color: var(--green-mid);
}
.admin-add-cat-btn {
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
  white-space: nowrap;
}
.admin-add-cat-btn:hover {
  background: #0d5e57;
}
.admin-profile-btn {
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
  white-space: nowrap;
}
.admin-profile-btn:hover {
  background: #0d5e57;
}
.admin-telegram-btn {
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
  white-space: nowrap;
}
.admin-telegram-btn:hover {
  background: #0d5e57;
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

/* ADMIN TABS */
.admin-tabs {
  display: flex;
  background: var(--white);
  border-bottom: 2px solid var(--green-soft);
}
.admin-tab {
  flex: 1;
  padding: 12px;
  font-size: 14px;
  font-family: inherit;
  font-weight: 600;
  color: var(--text-light);
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
}
.admin-tab.active {
  color: var(--green-mid);
  border-bottom-color: var(--green-mid);
}

/* FOODS TABS */
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

/* ─── CATEGORY MANAGEMENT ─── */
.cat-mgmt-section {
  padding: 16px;
  max-width: 600px;
  margin: 0 auto;
}
.cat-mgmt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-family: "Hanuman", serif;
  font-size: 16px;
  font-weight: 700;
  color: var(--green-dark);
}
.cat-mgmt-add-btn {
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
.cat-mgmt-add-btn:hover {
  background: var(--green-dark);
}
.cat-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.cat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border: 1.5px solid var(--green-soft);
  border-radius: 14px;
  padding: 12px 14px;
  transition: border-color 0.2s;
}
.cat-item:hover {
  border-color: var(--green-light);
}
.cat-item-info {
  display: flex;
  flex-direction: column;
}
.cat-item-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-dark);
}
.cat-item-right {
  display: flex;
  align-items: center;
  gap: 6px;
}
.cat-item-edit {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: var(--green-pale);
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.cat-item-edit:hover {
  background: #d4edda;
}
.cat-item-del {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: #fbe9e7;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.cat-item-del:hover {
  background: #ffccbc;
}

/* ─── ORDERS SECTION ─── */
.orders-section {
  padding: 16px;
  max-width: 600px;
  margin: 0 auto;
}
.orders-header {
  font-family: "Hanuman", serif;
  font-size: 16px;
  font-weight: 700;
  color: var(--green-dark);
  margin-bottom: 16px;
}
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.order-card {
  background: white;
  border: 1.5px solid var(--green-soft);
  border-radius: 14px;
  padding: 14px;
}
.order-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}
.order-id {
  font-family: "Hanuman", serif;
  font-size: 14px;
  font-weight: 700;
  color: var(--green-dark);
}
.order-table {
  font-size: 13px;
  font-weight: 600;
  color: #555;
}
.order-status {
  margin-left: auto;
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 12px;
  font-weight: 600;
}
.order-status.pending {
  background: #fef3c7;
  color: #92400e;
}
.order-status.confirmed {
  background: #dbeafe;
  color: #1e40af;
}
.order-status.preparing {
  background: #fce7f3;
  color: #9d174d;
}
.order-status.ready {
  background: #dcfce7;
  color: #166534;
}
.order-status.served {
  background: #d1fae5;
  color: #065f46;
}
.order-status.cancelled {
  background: #fbe9e7;
  color: #c62828;
}
.order-time {
  font-size: 11px;
  color: #9ca3af;
  margin-bottom: 8px;
}
.order-items {
  border-top: 1px solid #e8f5e9;
  padding-top: 8px;
}
.order-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  padding: 3px 0;
  color: #374151;
}
.order-note {
  margin-top: 6px;
  font-size: 12px;
  color: #6b7280;
  font-style: italic;
}
.order-total {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 700;
  color: var(--green-dark);
}
.order-actions {
  margin-top: 10px;
}
.order-status-select {
  width: 100%;
  padding: 8px;
  border: 1.5px solid var(--green-soft);
  border-radius: 8px;
  font-size: 12px;
  font-family: inherit;
  background: white;
  outline: none;
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
  background: #7a2a2a;
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

/* ─── HEADER (Centered Layout) ─── */
.header {
  position: relative;
  background: linear-gradient(135deg, #0f766e 0%, #22c55e 50%, #16a34a 100%);
  padding: 36px 24px 32px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}
.header-bg-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at 50% 0%,
    rgba(255, 255, 255, 0.08) 0%,
    transparent 60%
  );
  pointer-events: none;
}
.header-bg-pattern {
  position: absolute;
  inset: 0;
  opacity: 0.04;
  background-image: radial-gradient(circle, #fff 1px, transparent 1px);
  background-size: 32px 32px;
  pointer-events: none;
}
.header-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  max-width: 400px;
  width: 100%;
}
.header-logo-ring {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 0 6px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 0.08);
  transition: transform 0.3s ease;
}
.header-logo-ring:hover {
  transform: scale(1.03);
}
.header-logo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.header-text {
  text-align: center;
}
.header-restaurant-name {
  color: #fff;
  font-family: "Hanuman", serif;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.3;
  margin: 0;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}
.tg-error-msg {
  background: #fef2f2;
  border: 1.5px solid #fecaca;
  border-radius: 10px;
  padding: 10px 14px;
  margin-bottom: 14px;
  font-size: 13px;
  color: #dc2626;
  font-weight: 600;
}

/* Profile Modal */
.profile-logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
}
.profile-logo-preview {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--green-soft);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.profile-logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.profile-logo-upload {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: var(--green-pale);
  color: var(--green-dark);
  border: 1.5px solid var(--green-soft);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.profile-logo-upload:hover {
  background: var(--green-soft);
}

/* Link Code Section */
.link-code-section {
  margin-bottom: 12px;
  text-align: center;
}
.link-code-label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 6px;
}
.link-code-box {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #f0fdf4;
  border: 2px dashed #16a34a;
  border-radius: 12px;
  padding: 10px 18px;
  cursor: pointer;
  transition: all 0.2s;
}
.link-code-box:hover {
  background: #dcfce7;
  border-color: #15803d;
}
.link-code-value {
  font-family: "Courier New", monospace;
  font-size: 24px;
  font-weight: 800;
  color: #14532d;
  letter-spacing: 4px;
}
.link-code-copy-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 2px;
  transition: transform 0.15s;
}
.link-code-copy-btn:hover {
  transform: scale(1.2);
}
.link-code-copied {
  font-size: 12px;
  color: #16a34a;
  font-weight: 600;
  margin-top: 4px;
}
.link-code-hint {
  margin-top: 8px;
}
.link-code-regenerate-btn {
  background: none;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  padding: 5px 12px;
  font-size: 11px;
  font-family: inherit;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}
.link-code-regenerate-btn:hover {
  border-color: #16a34a;
  color: #16a34a;
}
.tg-linked-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding: 10px 12px;
  background: #f0fdf4;
  border: 1.5px solid #bbf7d0;
  border-radius: 10px;
}
.tg-linked-badge {
  font-size: 12px;
  font-weight: 600;
  color: #166534;
}
.tg-unlink-btn {
  background: #fbe9e7;
  border: 1.5px solid #ffccbc;
  border-radius: 8px;
  padding: 5px 10px;
  font-size: 11px;
  font-family: inherit;
  color: #c62828;
  cursor: pointer;
  transition: all 0.2s;
}
.tg-unlink-btn:hover {
  background: #ffccbc;
}
.tg-not-linked {
  margin-top: 12px;
  padding: 10px 12px;
  background: #fefce8;
  border: 1.5px solid #fde68a;
  border-radius: 10px;
  font-size: 12px;
  color: #92400e;
  text-align: center;
}

/* Telegram Guide */
.telegram-note {
  background: #fefce8;
  border: 1.5px solid #fde68a;
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 10px;
  text-align: left;
  font-size: 12px;
  color: #92400e;
  line-height: 1.5;
}
.telegram-note p {
  margin: 4px 0;
}
.telegram-bot-name {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid #fde68a;
  font-size: 12px;
  color: #92400e;
}
.telegram-guide {
  margin-bottom: 12px;
  text-align: left;
}
.telegram-guide-summary {
  font-size: 12px;
  font-weight: 600;
  color: #0f766e;
  cursor: pointer;
  padding: 6px 0;
  user-select: none;
}
.telegram-guide-summary:hover {
  color: #14532d;
}
.telegram-guide-content {
  background: #f0fdf4;
  border: 1.5px solid #bbf7d0;
  border-radius: 10px;
  padding: 12px;
  margin-top: 6px;
}
.guide-step {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 12px;
  color: #374151;
  line-height: 1.4;
}
.guide-step:last-child {
  margin-bottom: 0;
}
.guide-step-num {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #16a34a;
  color: white;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.guide-step code {
  background: #e8f5e9;
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 11px;
  color: #166534;
}

/* ─── CATEGORY FORM MODAL (reuses FoodFormModal styles) ─── */
.modal-card {
  background: white;
  border-radius: 22px;
  width: 100%;
  max-width: 420px;
  max-height: 88vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 18px 0;
}
.modal-header-title {
  font-family: "Hanuman", serif;
  font-size: 17px;
  font-weight: 700;
  color: var(--green-dark);
}
.close-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--green-pale);
  border: none;
  cursor: pointer;
  font-size: 17px;
  font-weight: 700;
  color: var(--green-dark);
}
.modal-form {
  padding: 14px 18px 22px;
}
.form-group {
  margin-bottom: 14px;
}
.form-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-mid);
  margin-bottom: 5px;
  display: block;
}
.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid var(--green-soft);
  border-radius: 10px;
  font-size: 13px;
  font-family: inherit;
  outline: none;
  color: var(--text-dark);
  transition: border 0.2s;
  background: white;
  box-sizing: border-box;
}
.form-input:focus {
  border-color: var(--green-light);
}
.form-input.error {
  border-color: #e53935;
  background: #fff8f8;
}
.field-err {
  font-size: 11px;
  color: #e53935;
  margin-top: 4px;
}
.field-hint {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 3px;
}
.field-hint a {
  color: #16a34a;
}
.form-success-msg {
  background: #e8f5e9;
  border: 1.5px solid #a5d6a7;
  border-radius: 10px;
  padding: 10px 14px;
  margin-bottom: 14px;
  font-size: 13px;
  color: #2d7a2d;
  font-weight: 600;
}
.submit-btn {
  width: 100%;
  padding: 13px;
  background: var(--green-mid);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.submit-btn:hover {
  background: var(--green-dark);
}
.submit-btn:disabled {
  background: #9e9e9e;
  cursor: not-allowed;
}
</style>