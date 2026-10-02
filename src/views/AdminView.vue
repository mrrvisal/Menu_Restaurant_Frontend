<!-- Admin dashboard management view -->
<template>
  <div class="root" :class="['layout-' + (sidebarPosition || 'left'), { 'nav-open': showMobile }]">
    <!-- ─── MOBILE BAR ─── -->
    <AdminMobileBar :restaurant-logo="restaurantLogo" :show-mobile="showMobile"
      @toggle-menu="showMobile = !showMobile" @logo-error="logoLoadError = true" />

    <!-- ─── SIDEBAR ─── -->
    <aside class="side" id="admin-sidebar">
      <div class="side-top">
        <div class="side-brand">
          <div class="side-icon">
            <img v-if="restaurantLogo" :src="restaurantLogo" alt="" @error="logoLoadError = true" />
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div class="side-meta">
            <span class="side-name">{{
              auth.restaurant?.name || "ភោជនីយដ្ឋាន"
              }}</span>
          </div>
        </div>

        <!-- Restaurant Switcher (one account may manage many restaurants) -->
        <div class="side-rest" v-if="auth.restaurants.length > 1">
          <AppSelect block size="sm" tone="soft" variant="teal" :model-value="auth.restaurantId"
            :options="auth.restaurants" option-value="id" option-label="name"
            @update:model-value="onSwitchRestaurant" />
        </div>
        <button class="side-add-rest" @click="openAddRestaurant">
          + {{ i18n.t.add_restaurant || "បន្ថែមភោជនីយដ្ឋាន" }}
        </button>
        <button v-if="auth.restaurantId" class="side-del-rest" @click="openDeleteRestaurant">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          {{ i18n.t.delete_restaurant || "លុបភោជនីយដ្ឋាន" }}
        </button>
      </div>

      <nav class="side-nav">
        <button class="nav-i" :class="{ active: adminTab === 'foods' }" @click="
          adminTab = 'foods';
        showMobile = false;
        ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M3 11h18M3 11v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8M3 11V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4" />
          </svg>
          <span>{{ i18n.t.foods }}</span>
        </button>
        <button class="nav-i" :class="{ active: adminTab === 'categories' }" @click="
          adminTab = 'categories';
        showMobile = false;
        ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v11z" />
          </svg>
          <span>{{ i18n.t.categories }}</span>
        </button>
        <button class="nav-i" :class="{ active: adminTab === 'orders' }" @click="
          adminTab = 'orders';
        fetchOrders();
        showMobile = false;
        ">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          </svg>
          <span>{{ i18n.t.orders }}</span>
          <span v-if="orders.length" class="nav-badge">{{
            orders.length
            }}</span>
        </button>
        <!-- Sales reports — the screen owners judge the SaaS by -->
        <button class="nav-i" :class="{ active: adminTab === 'reports' }" @click="
          openReports();
        showMobile = false;
        ">
          <AppIcon name="chart" :size="18" />
          <span>{{ i18n.t.reports || "Reports" }}</span>
        </button>
        <!-- Kitchen Display System — opens on its own (wall) screen -->
        <button class="nav-i" @click="openKds">
          <AppIcon name="chef" :size="18" />
          <span>{{ i18n.t.kds || "KDS" }}</span>
        </button>
      </nav>

      <div class="side-foot">
        <button class="logout" @click="loggingOut = true">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          {{ i18n.t.logout }}
        </button>
      </div>
    </aside>
    <div class="scrim" @click="showMobile = false"></div>

    <!-- ─── MAIN ─── -->
    <main class="main">
      <!-- Header (sticky — see .hdr in the stylesheet; hdrEl feeds --hdr-h) -->
      <div class="hdr" ref="hdrEl">
        <div class="hdr-l">
          <h1 class="hdr-title">
            <AppIcon name="sparkle" :size="18" class="hdr-title-i" />
            {{
              adminTab === "foods"
                ? i18n.t.foods
                : adminTab === "categories"
                  ? i18n.t.categories
                  : adminTab === "reports"
                    ? i18n.t.reports || "Reports"
                    : i18n.t.orders
            }}
          </h1>
        </div>
        <div class="hdr-r">
                  <button class="lang" @click="i18n.toggleLocale">
          {{ i18n.locale === "km" ? "EN" : "ខ្មែរ" }}
        </button>
          <NotificationBell @select="onNotificationSelect" />
          <div class="profile-wrap" ref="profileWrap">
            <button class="ac ac-primary ac-avatar" @click="toggleProfileMenu"
              :title="i18n.t.profile || i18n.t.settings" :aria-haspopup="true" :aria-expanded="profileMenuOpen">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
            <span v-if="!isLinked" class="hdr-dot" :title="i18n.t.telegram"></span>

            <Transition name="fade">
              <div v-if="profileMenuOpen" class="profile-menu">
                <div class="pm-head">
                  <div class="pm-avatar">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="1.5">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div class="pm-info">
                    <strong>{{
                      auth.restaurant?.name || auth.user?.email || i18n.t.profile
                      }}</strong>
                    <span>{{ auth.user?.email }}</span>
                  </div>
                </div>

                <div class="pm-body">
                  <button class="pm-item" @click="runProfileAction(openProfile)">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
                      stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
                    </svg>
                    <span>{{ i18n.t.profile || i18n.t.settings }}</span>
                  </button>

                  <button class="pm-item" @click="runProfileAction(openSettings)">
                    <AppIcon name="settings" :size="15" />
                    <span>{{ i18n.t.settings || "Settings" }}</span>
                  </button>

                  <button class="pm-item" @click="runProfileAction(openQR)">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="1.5">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                    </svg>
                    <span>{{ i18n.t.generate_qr }}</span>
                  </button>
                  <button class="pm-item" @click="runProfileAction(openDevices)">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="1.5">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <polyline points="9 12 11 14 15 10" />
                    </svg>
                    <span>{{ i18n.t.devices }}</span>
                  </button>
                  <button class="pm-item" @click="runProfileAction(openTelegramSettings)">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="1.5">
                      <path d="m21 4-4.5 16-5.2-5.1L7 19l1.2-6L3 10.8 21 4Z" />
                    </svg>
                    <span>{{ i18n.t.telegram }}</span>
                    <span v-if="!isLinked" class="pm-dot"></span>
                  </button>
                  <button class="pm-item" @click="runProfileAction(openPreview)">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="1.5">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <span>{{ i18n.t.owner_preview }}</span>
                  </button>
                  <!-- Share the menu to every platform (Facebook, Messenger,
                       Telegram, WhatsApp, Instagram, WeChat, LinkedIn, X…) -->
                  <button class="pm-item" @click="runProfileAction(openShare)">
                    <AppIcon name="share" :size="15" />
                    <span>{{ i18n.t.share_title }}</span>
                  </button>

                  <!-- ── Install app (PWA download) ──
                       Once the app is already installed this row still works:
                       it says "Installed" and offers "Install again". -->
                  <button v-if="installAvailable" class="pm-item" @click="runProfileAction(openInstall)">
                    <AppIcon :name="isInstalled ? 'check-circle' : 'download'" :size="15" />
                    <span class="pm-label">
                      {{
                        isInstalled ? i18n.t.install_again : i18n.t.install_app
                      }}
                      <em v-if="isInstalled" class="pm-note">{{
                        i18n.t.install_installed
                        }}</em>
                    </span>
                  </button>

                  <div class="pm-sep"></div>

                  <button class="pm-item pm-danger" @click="runProfileAction(() => { loggingOut = true; })">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
                      stroke-linecap="round" stroke-linejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>{{ i18n.t.logout }}</span>
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <!-- Metrics -->
      <div class="metrics">
        <div class="metric metric-teal">
          <div class="metric-icon mi-teal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M3 3v18h18" />
              <path d="M18 17V9" />
              <path d="M13 17V5" />
              <path d="M8 17v-3" />
            </svg>
          </div>
          <div class="metric-b">
            <span class="metric-v">{{ currencyStore.fmt(stats.summary?.revenue ?? stats.totalRevenue) }}</span>
            <span class="metric-l">{{ i18n.t.revenue }}</span>
          </div>
          <div class="metric-glow"></div>
        </div>
        <div class="metric metric-green">
          <div class="metric-icon mi-green">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            </svg>
          </div>
          <div class="metric-b">
            <span class="metric-v">{{ stats.summary?.orders ?? (stats.totalOrders || 0) }}</span>
            <span class="metric-l">{{ i18n.t.orders }}</span>
          </div>
          <div class="metric-glow"></div>
        </div>
        <div class="metric metric-amber">
          <div class="metric-icon mi-amber">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div class="metric-b">
            <span class="metric-v">{{ foods.foods.length }}</span>
            <span class="metric-l">{{ i18n.t.foods }}</span>
          </div>
          <div class="metric-glow"></div>
        </div>
      </div>

      <!-- Menu (one menu per restaurant) + gating -->
      <div class="menustrip">
        <div class="menustrip-label">{{ i18n.t.menu }}</div>
        <div v-if="!auth.restaurantId" class="menustrip-empty">
          <span>{{ i18n.t.need_restaurant || "សូមបង្កើតភោជនីយដ្ឋានជាមុន" }}</span>
          <button class="btn btn-primary btn-sm" @click="openAddRestaurant">
            {{ i18n.t.add_restaurant || "+ បង្កើតភោជនីយដ្ឋាន" }}
          </button>
        </div>
        <template v-else-if="!foods.menus.length">
          <div class="menustrip-empty">
            <span>{{ i18n.t.need_menu || "សូមបង្កើតមីនុយជាមុន" }}</span>
            <button class="btn btn-primary btn-sm" :disabled="menuCreating" @click="ensureDefaultMenu()">
              {{ menuCreating ? i18n.t.loading : (i18n.t.create_menu || "បង្កើតមីនុយ") }}
            </button>
          </div>
        </template>
        <template v-else>
          <div class="menu-single">
            <span class="menu-single-name">{{ i18n.t.default_menu }}</span>
          </div>
        </template>
      </div>

      <!-- ──────── FOODS ──────── -->
      <template v-if="adminTab === 'foods'">
        <div class="bar">
          <div class="bar-scroll">
            <button v-for="cat in foods.categories" :key="cat.id" class="chip" :class="{ active: curCat === cat.id }"
              @click="
                curCat = cat.id;
              load();
              ">
              {{ cat.label_km }}
            </button>
          </div>
          <div class="bar-acts">
            <div class="srch">
              <svg class="srch-i" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="1.5">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input v-model="searchQ" :placeholder="i18n.t.search" @input="load()" />
              <button v-if="searchQ" class="srch-x" aria-label="Clear search" @click="
                searchQ = '';
              load();
              ">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <button class="ac ac-primary" @click="openAdd">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              <span class="btn-text">{{ i18n.t.add_food }}</span>
            </button>
          </div>
        </div>

        <div v-if="foods.loading" class="empty">
          <div class="spinner"></div>
          <p>{{ i18n.t.loading }}</p>
        </div>
        <div v-else-if="!foods.foods.length" class="empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"
            opacity=".3">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <p>{{ searchQ ? "រកមិនឃើញ" : i18n.t.no_data }}</p>
          <button v-if="!searchQ" class="ac ac-primary" @click="openAdd">
            {{ i18n.t.add_food }}
          </button>
        </div>
        <div v-else class="grid">
          <FoodCard v-for="food in foods.foods" :key="food.id" :food="food" is-admin @delete="confirmDel($event)"
            @toggle-status="foods.toggleStatus($event)" @detail="
              editingFood = $event;
            showForm = true;
            " />
        </div>
      </template>

      <!-- ──────── CATEGORIES ──────── -->
      <template v-if="adminTab === 'categories'">
        <div class="bar">
          <div class="bar-acts">
            <button class="ac ac-primary" @click="openCatForm()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              {{ i18n.t.add_category }}
            </button>
          </div>
        </div>
        <div v-if="!foods.categories.length" class="empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"
            opacity=".3">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v11z" />
          </svg>
          <p>{{ i18n.t.no_data }}</p>
        </div>
        <div v-else class="cat-grid">
          <div v-for="cat in foods.categories" :key="cat.id" class="cat-c">
            <span class="cat-n">{{ cat.label_km }}</span>
            <div class="cat-acts">
              <button class="ic ic-sm" aria-label="Edit category" @click="openCatForm(cat)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button class="ic ic-sm ic-red" aria-label="Delete category" @click="confirmDelCat(cat)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </template>

      <AdminCallsSection v-if="adminTab === 'orders'" />
      <AdminOrdersSection
        v-if="adminTab === 'orders'"
        :orders="orders"
        :orders-loading="ordersLoading"
        :fetch-orders="fetchOrders"
        :update-order-status="updateOrderStatus"
        :expanded-days="expandedDays"
        :toggle-day="toggleDay"
        :order-sections="orderSections"
        :day-label="dayLabel"
        v-model:search-date="searchDate"
        :search-active="searchActive"
        :search-date-orders="searchDateOrders"
        :i18n="i18n"
        :currency-store="currencyStore"
        :status-icon="statusIcon"
        :status-label="statusLabel"
        :get-status-options="getStatusOptions"
        :format-date="formatDate"
        :parse-items="parseItems"
      />
      <AdminReportsSection
        v-if="adminTab === 'reports'"
        :report="report"
        :report-loading="reportLoading"
        :report-error="reportError"
        v-model:report-group="reportGroup"
        v-model:report-preset="reportPreset"
        v-model:report-start-date="reportStartDate"
        v-model:report-end-date="reportEndDate"
        v-model:report-dataset="reportDataset"
        v-model:report-format="reportFormat"
        :report-exporting="reportExporting"
        :report-export-msg="reportExportMsg"
        :report-export-error="reportExportError"
        :report-presets="reportPresets"
        :report-groups="reportGroups"
        :report-datasets="reportDatasets"
        :report-formats="reportFormats"
        :apply-report-preset="applyReportPreset"
        :fetch-report="fetchReport"
        :export-report="exportReport"
        :report-series-points="reportSeriesPoints"
        :report-hour-points="reportHourPoints"
        :chart-color="chartColor"
        :fmt-axis="fmtAxis"
        :top-item-width="topItemWidth"
        :table-bar-width="tableBarWidth"
        :status-bar-width="statusBarWidth"
        :i18n="i18n"
        :currency-store="currencyStore"
        :status-icon="statusIcon"
        :status-label="statusLabel"
      />
    </main>

    <!-- ═══════ MODALS ═══════ -->

    <FoodFormModal :show="showForm" :edit-food="editingFood" :categories="foods.categories" @close="
      showForm = false;
    editingFood = null;
    " @saved="load()" />

    <!-- Add Restaurant (one account → many restaurants) -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showAddRestaurant" class="overlay" @click.self="showAddRestaurant = false">
          <div class="sheet">
            <div class="sheet-h">
              <span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="1.5">
                  <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4M9 11h.01M15 11h.01M9 15h.01M15 15h.01" />
                </svg>
                {{ i18n.t.create_restaurant || "New Restaurant" }}</span><button class="ic" aria-label="Close"
                @click="showAddRestaurant = false">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div class="sheet-b">
              <div v-if="addRestaurantMsg" class="msg msg-s">
                {{ addRestaurantMsg }}
              </div>
              <div v-if="addRestaurantError" class="msg msg-e">
                {{ addRestaurantError }}
              </div>
              <div class="fld">
                <label class="fld-l">{{ i18n.t.restaurant_name }} *</label>
                <input v-model="addRestaurantName" class="fld-i" :placeholder="i18n.t.restaurant_name_ph || ''"
                  @keyup.enter="submitAddRestaurant" />
              </div>
              <button class="btn btn-primary btn-b" :disabled="addRestaurantSubmitting" @click="submitAddRestaurant">
                {{
                  addRestaurantSubmitting
                    ? i18n.t.loading
                    : i18n.t.add_restaurant
                }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Restaurant (owner removes one of their own; type the name to confirm) -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showDeleteRestaurant" class="overlay" @click.self="showDeleteRestaurant = false">
          <div class="sheet">
            <div class="sheet-h">
              <span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="1.5">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                {{ i18n.t.delete_restaurant || "Delete Restaurant" }}</span><button class="ic" aria-label="Close"
                @click="showDeleteRestaurant = false">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div class="sheet-b">
              <div v-if="deleteRestaurantMsg" class="msg msg-s">{{ deleteRestaurantMsg }}</div>
              <div v-if="deleteRestaurantError" class="msg msg-e">{{ deleteRestaurantError }}</div>
              <p class="del-rest-warn">{{ i18n.t.del_rest_warning }}</p>
              <div class="fld">
                <label class="fld-l">
                  {{ i18n.t.del_rest_type_name }} — <b>{{ auth.restaurant?.name }}</b>
                </label>
                <input v-model="deleteRestaurantConfirm" class="fld-i" :placeholder="auth.restaurant?.name || ''"
                  @keyup.enter="submitDeleteRestaurant" />
              </div>
              <button class="btn btn-r btn-b"
                :disabled="deleteRestaurantSubmitting || !deleteRestaurantConfirmMatches"
                @click="submitDeleteRestaurant">
                {{ deleteRestaurantSubmitting ? i18n.t.loading : i18n.t.delete_restaurant }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Food -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="deletingFood" class="overlay" @click.self="deletingFood = null">
          <div class="dlg">
            <div class="dlg-i">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </div>
            <div class="dlg-t">{{ i18n.t.confirm_delete_food }}</div>
            <div class="dlg-d">{{ deletingFood.name }}</div>
            <div class="dlg-acts">
              <button class="btn btn-g" @click="deletingFood = null">
                {{ i18n.t.cancel }}</button><button class="btn btn-r" @click="doDelete">
                {{ i18n.t.delete }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Category -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="deletingCat" class="overlay" @click.self="deletingCat = null">
          <div class="dlg">
            <div class="dlg-i">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </div>
            <div class="dlg-t">{{ i18n.t.confirm_delete_category }}</div>
            <div class="dlg-d">{{ deletingCat.label_km }}</div>
            <div class="dlg-acts">
              <button class="btn btn-g" @click="deletingCat = null">
                {{ i18n.t.cancel }}</button><button class="btn btn-r" @click="doDeleteCat">
                {{ i18n.t.delete }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Logout -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="loggingOut" class="overlay" @click.self="loggingOut = false">
          <div class="dlg">
            <div class="dlg-i dlg-i-r">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div class="dlg-t">{{ i18n.t.logout }}</div>
            <div class="dlg-d">{{ i18n.t.confirm_logout }}</div>
            <div class="dlg-acts">
              <button class="btn btn-g" @click="loggingOut = false">
                {{ i18n.t.cancel }}</button><button class="btn btn-r" @click="confirmLogout">
                {{ i18n.t.logout }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- QR -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showQR" class="overlay" @click.self="showQR = false">
          <div class="sheet">
            <div class="sheet-h">
              <span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="1.5">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
                {{ i18n.t.generate_qr }}</span><button class="ic" aria-label="Close" @click="showQR = false">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div class="sheet-b">
              <div class="qr-r">
                <input v-model="qrTableNumber" type="number" min="1" :placeholder="i18n.t.table_no" class="qr-inp"
                  @keyup.enter="generateQR" /><button class="btn btn-primary" :disabled="qrLoading" @click="generateQR">
                  {{ qrLoading ? i18n.t.generating : i18n.t.generate || "Generate" }}
                </button>
              </div>
              <div v-if="qrError" class="msg msg-e">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {{ qrError }}
              </div>
              <div v-if="qrInfo" class="msg msg-i">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                {{ qrInfo }}
              </div>
              <div v-if="qrCodeDataUrl" class="qr-p">
                <img :src="qrCodeDataUrl" :alt="'QR ' + qrTableNumber" /><span class="qr-l">{{ i18n.t.table }} {{
                  qrTableNumber }}</span><button class="btn btn-primary" @click="downloadQR">
                  {{ i18n.t.download_qr || "Download" }}
                </button>
              </div>

              <!-- ─── SAVED QR CODES (already "made done") ─── -->
              <div class="qr-saved">
                <div class="qr-saved-h">
                  <span>{{ i18n.t.saved_qr_list || "Saved QR codes" }}</span>
                  <span v-if="!qrListLoading && savedQrs.length" class="qr-saved-count">{{ savedQrs.length }}</span>
                </div>
                <div class="srch qr-srch">
                  <svg class="srch-i" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="1.5">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  <input v-model="qrSearch" :placeholder="i18n.t.search_table || 'Search table number...'
                    " />
                  <button v-if="qrSearch" class="srch-x" aria-label="Clear table search" @click="qrSearch = ''">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
                <div v-if="qrListLoading" class="qr-saved-loading">
                  <div class="spinner"></div>
                </div>
                <div v-else-if="qrListError" class="msg msg-e">
                  {{ qrListError }}
                </div>
                <div v-else-if="!filteredSavedQrs.length" class="qr-saved-empty">
                  {{
                    qrSearch
                      ? i18n.t.no_search_result || "No results"
                      : i18n.t.no_saved_qr || "No saved QR codes yet"
                  }}
                </div>
                <div v-else class="qr-saved-grid">
                  <div v-for="qr in filteredSavedQrs" :key="qr.id" class="qr-item"
                    :class="{ active: selectedSavedNo === qr.table_no }">
                    <div class="qr-item-thumb" @click="previewSavedQr(qr)">
                      <img v-if="qr._dataUrl" :src="qr._dataUrl" :alt="'QR ' + qr.table_no" />
                      <svg v-else width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="1.5">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                      </svg>
                    </div>
                    <span class="qr-item-no">{{ i18n.t.table }} {{ qr.table_no }}</span>
                    <span class="qr-item-date">{{
                      formatQrDate(qr.created_at)
                      }}</span>
                    <div class="qr-item-acts">
                      <button class="ic ic-sm" :title="i18n.t.preview || 'Preview'"
                        :aria-label="'Preview QR ' + qr.table_no" @click="previewSavedQr(qr)">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          stroke-width="1.5">
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                      <button class="ic ic-sm" :title="i18n.t.download_qr || 'Download'"
                        :aria-label="'Download QR ' + qr.table_no" @click="downloadSavedQr(qr)">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          stroke-width="1.5">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      </button>
                      <button class="ic ic-sm ic-red" :title="i18n.t.delete || 'Delete'"
                        :aria-label="'Delete QR ' + qr.table_no" @click="confirmDelQr(qr)">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          stroke-width="1.5">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ─── SHARE MENU · Facebook, Messenger, Telegram, WhatsApp, Instagram,
         WeChat, LINE, Viber, LinkedIn, X, Reddit, Pinterest, Email, SMS ─── -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showShare" class="overlay" @click.self="showShare = false">
          <div class="sheet">
            <div class="sheet-h">
              <span>
                <AppIcon name="share" :size="16" />{{ i18n.t.share_title }}
              </span><button class="ic" :aria-label="i18n.t.close" @click="showShare = false">
                <AppIcon name="x" :size="16" />
              </button>
            </div>
            <div class="sheet-b">
              <ShareGrid :show-header="false" :url="shareLinks.shareUrl" :qr-url="shareLinks.spaUrl" :text="shareText"
                :image="shareImage" :accent="theme.primary" @shared="showShare = false" />
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete QR -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="deletingQr" class="overlay" @click.self="deletingQr = null">
          <div class="dlg">
            <div class="dlg-i">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </div>
            <div class="dlg-t">
              {{ i18n.t.delete_qr_title || "លុប QR នេះ?" }}
            </div>
            <div class="dlg-d">
              {{ i18n.t.table }} {{ deletingQr.table_no }}
            </div>
            <div class="dlg-acts">
              <button class="btn btn-g" @click="deletingQr = null">
                {{ i18n.t.cancel }}</button><button class="btn btn-r" @click="doDeleteQr">
                {{ i18n.t.delete }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Telegram -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showTelegramSettings" class="overlay" @click.self="showTelegramSettings = false">
          <div class="sheet">
            <div class="sheet-h">
              <span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="1.5">
                  <path d="m21 4-4.5 16-5.2-5.1L7 19l1.2-6L3 10.8 21 4Z" />
                </svg>
                {{ i18n.t.telegram_settings }}</span><button class="ic" aria-label="Close"
                @click="showTelegramSettings = false">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div class="sheet-b">
              <div v-if="tgSuccess" class="msg msg-s">{{ tgSuccess }}</div>
              <div v-if="tgError" class="msg msg-e">{{ tgError }}</div>
              <div class="tg-c">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {{ i18n.t.connect_telegram }}<br />
              </div>

              <!-- Jump straight into the bot chat (new tab). web.telegram.org
                   also works without the desktop app; on mobile Telegram
                   offers "Open in app". -->
              <a class="btn btn-primary btn-b tg-open" :href="TELEGRAM_BOT_URL" target="_blank"
                rel="noopener noreferrer">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="m21 4-4.5 16-5.2-5.1L7 19l1.2-6L3 10.8 21 4Z" />
                </svg>
                {{ i18n.t.tg_step_open || "Open Telegram" }}
              </a>

              <div class="tg-code">
                <span class="tg-lbl">{{
                  i18n.t.link_code || "Link Code"
                  }}</span>
                <div class="tg-box" @click="copyLinkCode">
                  <code class="tg-val">{{ displayLinkCode }}</code><button class="ic" aria-label="Copy link code">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="1.5">
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                    </svg>
                  </button>
                </div>
                <div v-if="copied" class="msg msg-s">{{ i18n.t.copied }}</div>
              </div>
              <details class="tg-guide" :open="!isLinked">
                <summary>{{ i18n.t.how_it_works || "How to connect" }}</summary>
                <div class="tg-steps">
                  <div class="tg-step">
                    <span class="step-n">1</span> {{ i18n.t.tg_step_open }}
                  </div>
                  <div class="tg-step">
                    <span class="step-n">2</span>
                    {{ i18n.t.tg_step_search_bot }}
                    <strong>@digital_menu_khmer_bot</strong>
                  </div>
                  <div class="tg-step">
                    <span class="step-n">3</span>
                    {{ i18n.t.tg_step_press_start }} <code>/start</code>
                  </div>
                  <div class="tg-step">
                    <span class="step-n">4</span>
                    {{ i18n.t.tg_step_send_link }}
                    <code>{{ displayLinkCode }}</code>
                  </div>
                  <div class="tg-step">
                    <span class="step-n">5</span> {{ i18n.t.tg_step_done }}
                  </div>
                </div>
              </details>
              <div v-if="isLinked" class="tg-linked">
                <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="1.5">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  {{ i18n.t.connected }}</span><button class="btn btn-g" @click="unlinkTelegram">
                  {{ i18n.t.unlink || "Unlink" }}
                </button>
              </div>
              <div v-else class="tg-warn">
                <AppIcon name="alert-circle" :size="14" /> {{ i18n.t.not_connected_yet }}
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Devices (access log) -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showDevices" class="overlay" @click.self="showDevices = false">
          <div class="sheet">
            <div class="sheet-h">
              <span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="1.5">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
                {{ i18n.t.device_list || "Devices with access" }}</span><button class="ic" aria-label="Close"
                @click="showDevices = false">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div class="sheet-b">
              <div v-if="devicesMsg" class="msg msg-s">
                {{ devicesMsg }}
              </div>
              <div v-if="devicesError" class="msg msg-e">
                {{ devicesError }}
              </div>
              <div class="dev-top">
                <span class="dev-count">{{ activeDevicesCount }}
                  {{ i18n.t.devices || "Devices" }}</span>
                <button class="btn btn-g btn-sm" :disabled="devicesLoading || activeDevicesCount <= 1"
                  @click="revokeAllOthers">
                  {{ i18n.t.sign_out_others || "Sign out other devices" }}
                </button>
              </div>
              <div v-if="devicesLoading" class="qr-saved-loading">
                <div class="spinner"></div>
              </div>
              <div v-else-if="!devicesList.length" class="qr-saved-empty">
                {{
                  i18n.t.device_none ||
                  "No devices have accessed this account yet"
                }}
              </div>
              <div v-else class="dev-list">
                <div v-for="device in devicesList" :key="device.id" class="dev-c" :class="{
                  current: device.isCurrent && !device.revoked,
                  revoked: device.revoked,
                }">
                  <div class="dev-icon">
                    <!-- smartphone for mobile, monitor for desktop/tablet -->
                    <svg v-if="device.deviceType === 'mobile'" width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" stroke-width="1.5">
                      <rect x="7" y="2" width="10" height="20" rx="2" ry="2" />
                      <line x1="11" y1="18" x2="13" y2="18" />
                    </svg>
                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="1.5">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                  </div>
                  <div class="dev-b">
                    <div class="dev-name">
                      <span class="dev-n">{{
                        device.deviceName || i18n.t.device_unknown
                        }}</span>
                      <span v-if="device.isCurrent && !device.revoked" class="dev-badge dev-badge-cur">{{
                        i18n.t.current_device }}</span>
                      <span v-else-if="device.revoked" class="dev-badge dev-badge-rev">{{ i18n.t.device_revoked_badge
                        }}</span>
                    </div>
                    <div class="dev-meta">
                      <span class="dev-kv">
                        <strong>{{ device.browser
                        }}{{
                            device.browserVersion
                              ? " " + device.browserVersion.split(".")[0]
                              : ""
                          }}</strong>
                        · {{ device.os
                        }}{{ device.osVersion ? " " + device.osVersion : "" }}
                        <template v-if="device.screen">· {{ device.screen }}</template>
                      </span>
                      <span class="dev-kv">
                        {{ i18n.t.device_ip }}:
                        <strong>{{
                          device.ipAddress || i18n.t.device_unknown
                          }}</strong>
                        <template v-if="device.city || device.region || device.country">
                          · {{ i18n.t.device_location }}:
                          <strong>{{
                            [device.city, device.region, device.country]
                              .filter(Boolean)
                              .join(", ")
                          }}</strong>
                        </template>
                        <template v-if="device.isp">· {{ device.isp }}</template>
                      </span>
                      <span class="dev-kv">
                        {{ i18n.t.device_first_seen }}:
                        <strong>{{
                          device.firstSeenAt
                            ? formatDate(device.firstSeenAt)
                            : i18n.t.device_unknown
                        }}</strong>
                        · {{ i18n.t.device_last_login }}:
                        <strong>{{
                          device.lastLoginAt
                            ? formatDate(device.lastLoginAt)
                            : i18n.t.device_unknown
                        }}</strong>
                      </span>
                      <span class="dev-kv">
                        {{ i18n.t.device_last_active }}:
                        <strong>{{
                          device.lastActiveAt
                            ? formatDate(device.lastActiveAt)
                            : i18n.t.device_unknown
                        }}</strong>
                        · {{ i18n.t.device_logins }}:
                        <strong>{{ device.loginCount || 1 }}</strong>
                      </span>
                      <span v-if="device.revoked" class="dev-kv dev-kv-rev">
                        {{ i18n.t.device_revoked_note }}:
                        {{ formatDate(device.revokedAt) }}
                      </span>
                      <span v-if="device.isProxy || device.isHosting" class="dev-flags">
                        <span v-if="device.isProxy" class="dev-flag">
                          <AppIcon name="alert-circle" :size="11" />
                          {{
                            i18n.t.device_vpn_flag || "VPN / Proxy"
                          }}
                        </span>
                        <span v-if="device.isHosting" class="dev-flag">
                          <AppIcon name="alert-circle" :size="11" />
                          {{
                            i18n.t.device_hosting_flag || "Server / Hosting IP"
                          }}
                        </span>
                      </span>
                    </div>
                    <button type="button" class="dev-details-btn" :aria-expanded="expandedDeviceId === device.id"
                      @click="toggleDeviceDetails(device.id)">
                      {{
                        expandedDeviceId === device.id
                          ? i18n.t.device_hide_details || "Hide details"
                          : i18n.t.device_more_details || "More details"
                      }}
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        :class="{ flip: expandedDeviceId === device.id }">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                    <div v-if="expandedDeviceId === device.id" class="dev-details">
                      <span v-if="device.platform" class="dev-kv">
                        {{ i18n.t.device_platform }}:
                        <strong>{{ device.platform }}</strong>
                      </span>
                      <span v-if="device.hardware" class="dev-kv">
                        {{ i18n.t.device_hardware }}:
                        <strong>{{ device.hardware }}</strong>
                      </span>
                      <span v-if="device.timezone || device.language" class="dev-kv">
                        <template v-if="device.timezone">{{ i18n.t.device_timezone }}:
                          <strong>{{ device.timezone }}</strong></template>
                        <template v-if="device.timezone && device.language">
                          · </template><template v-if="device.language">{{ i18n.t.device_language }}:
                          <strong>{{ device.language }}</strong></template>
                      </span>
                      <span v-if="device.latitude != null && device.longitude" class="dev-kv">
                        {{ i18n.t.device_coords }}:
                        <strong>{{ Number(device.latitude).toFixed(4) }},
                          {{ Number(device.longitude).toFixed(4) }}</strong>
                      </span>
                      <span v-if="device.asn || device.org" class="dev-kv">
                        <template v-if="device.asn">{{ i18n.t.device_asn }}:
                          <strong>{{ device.asn }}</strong></template>
                        <template v-if="device.asn && device.org"> · </template><template v-if="device.org"><strong>{{
                            device.org }}</strong></template>
                      </span>
                      <span class="dev-kv dev-kv-ua">
                        {{ i18n.t.device_user_agent }}:
                        <strong>{{ device.userAgent || i18n.t.device_unknown }}</strong>
                      </span>
                    </div>
                  </div>
                  <button v-if="!device.revoked" class="ic ic-sm ic-red"
                    :title="i18n.t.sign_out_device || 'Sign out device'" :aria-label="(i18n.t.sign_out_device || 'Sign out device') +
                      ' — ' +
                      (device.deviceName || device.id)
                      " :disabled="revokingDeviceId === device.id" @click="confirmRevokeDevice(device)">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="1.5">
                      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                      <line x1="12" y1="2" x2="12" y2="12" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- ─── LOGIN HISTORY (audit trail) ─── -->
              <div class="dev-hist">
                <div class="dev-hist-h">
                  <span>{{ i18n.t.login_history || "Login history" }}</span>
                  <button class="ic ic-sm" :title="i18n.t.refresh || 'Refresh'"
                    :aria-label="i18n.t.refresh || 'Refresh'" @click="fetchLoginHistory">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="1.5">
                      <polyline points="23 4 23 10 17 10" />
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                    </svg>
                  </button>
                </div>
                <div v-if="historyLoading" class="qr-saved-loading">
                  <div class="spinner"></div>
                </div>
                <div v-else-if="historyError" class="msg msg-e">
                  {{ historyError }}
                </div>
                <div v-else-if="!loginHistory.length" class="qr-saved-empty">
                  {{ i18n.t.history_empty || "No login events recorded yet" }}
                </div>
                <div v-else class="dev-hist-list">
                  <div v-for="h in loginHistory" :key="h.id" class="dev-hist-i">
                    <span class="dev-hist-dot" :class="'m-' + (h.method || 'email')"></span>
                    <div class="dev-hist-b">
                      <span class="dev-hist-l1">
                        <strong>{{
                          h.deviceName || i18n.t.device_unknown
                          }}</strong>
                        · {{ deviceMethodLabel(h.method) }}
                      </span>
                      <span class="dev-hist-l2">
                        {{ i18n.t.device_ip }}:
                        <strong>{{
                          h.ipAddress || i18n.t.device_unknown
                          }}</strong>
                        <template v-if="h.city || h.country">
                          ·
                          {{
                            [h.city, h.region, h.country]
                              .filter(Boolean)
                              .join(", ")
                          }}
                        </template>
                      </span>
                      <span class="dev-hist-l3">{{ h.browser || "" }}{{ h.os ? " · " + h.os : "" }} ·
                        {{ formatDate(h.at) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Sign out device (confirm) -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="deletingDevice" class="overlay" @click.self="deletingDevice = null">
          <div class="dlg">
            <div class="dlg-i dlg-i-r">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                <line x1="12" y1="2" x2="12" y2="12" />
              </svg>
            </div>
            <div class="dlg-t">
              {{ i18n.t.revoke_device_title || "Sign out this device?" }}
            </div>
            <div class="dlg-d">
              {{
                deletingDevice.deviceName ||
                deletingDevice.ipAddress ||
                deletingDevice.id
              }}
              <template v-if="deletingDevice.isCurrent">
                <br />{{
                  i18n.t.revoke_device_current_note ||
                  "You will be signed out on this device."
                }}
              </template>
            </div>
            <div class="dlg-acts">
              <button class="btn btn-g" @click="deletingDevice = null">
                {{ i18n.t.cancel }}</button><button class="btn btn-r" :disabled="revokingDeviceId"
                @click="doRevokeDevice">
                {{ revokingDeviceId ? i18n.t.loading : i18n.t.logout }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Category Form -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showCatForm" class="overlay" @click.self="showCatForm = false">
          <div class="sheet">
            <div class="sheet-h">
              <span>{{ editingCat ? "កែប្រែប្រភេទ" : "បន្ថែមប្រភេទ" }}</span><button class="ic" aria-label="Close"
                @click="showCatForm = false">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div class="sheet-b">
              <div v-if="catSuccess" class="msg msg-s">{{ catSuccess }}</div>
              <div class="fld">
                <label class="fld-l">{{ i18n.t.add_category || "Category Name" }} *</label>
                <input v-model="catLabelKm" class="fld-i" :class="{ err: catErrors }" :placeholder="i18n.t.category"
                  @input="catErrors = ''" />
                <div v-if="catErrors" class="fld-e">{{ catErrors }}</div>
              </div>
              <button class="btn btn-primary btn-b" :disabled="catSubmitting" @click="submitCategory">
                {{
                  catSubmitting
                    ? i18n.t.loading
                    : editingCat
                      ? i18n.t.save
                      : i18n.t.add
                }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Profile -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showProfile" class="overlay" @click.self="showProfile = false">
          <div class="sheet">
            <div class="sheet-h">
              <span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                {{ i18n.t.profile || "Profile" }}</span><button class="ic" aria-label="Close"
                @click="showProfile = false">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div class="sheet-b">
              <div v-if="profileSuccess" class="msg msg-s">
                {{ profileSuccess }}
              </div>
              <div v-if="profileError" class="msg msg-e">
                {{ profileError }}
              </div>
              <div class="prof-l">
                <div class="prof-p">
                  <img v-if="profileLogoPreview" :src="profileLogoPreview" alt="" />
                  <svg v-else width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <label class="prof-up"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="1.5">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  {{ i18n.t.change_logo || "Change" }}
                  <input type="file" accept="image/*" hidden @change="onLogoChange" /></label>
              </div>
              <div class="fld">
                <label class="fld-l">{{ i18n.t.restaurant_name }} *</label>
                <input v-model="profileName" class="fld-i" :placeholder="i18n.t.restaurant_name" />
              </div>

              <button class="btn btn-primary btn-b" :disabled="profileSubmitting" @click="submitProfile">
                {{ profileSubmitting ? i18n.t.loading : i18n.t.save }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <AdminSettingsModal
      :show="showSettings"
      :i18n="i18n"
      :has-restaurant="!!auth.restaurantId"
      v-model:settings-tab="settingsTab"
      :theme="theme"
      :on-preset-color="onPresetColor"
      :on-custom-color="onCustomColor"
      :apply-hex-input="applyHexInput"
      :reset-theme="resetTheme"
      :sidebar-position="sidebarPosition"
      :apply-sidebar-position="applySidebarPosition"
      :settings-currency-msg="settingsCurrencyMsg"
      :settings-currency-error="settingsCurrencyError"
      v-model:profile-currency="profileCurrency"
      :currency-options="currencyOptions"
      v-model:profile-rate="profileRate"
      :save-currency="saveCurrency"
      :currency-submitting="currencySubmitting"
      :order-tracking="orderTracking"
      :tracking-submitting="trackingSubmitting"
      :tracking-msg="trackingMsg"
      :tracking-error="trackingError"
      :toggle-order-tracking="toggleOrderTracking"
      :push-state="pushState"
      :push-state-label="pushStateLabel"
      :push-busy="pushBusy"
      :toggle-push="togglePush"
      :push-error="pushError"
      :account-success="accountSuccess"
      :account-error="accountError"
      v-model:account-email="accountEmail"
      v-model:account-current-password="accountCurrentPassword"
      v-model:account-new-password="accountNewPassword"
      :auth="auth"
      :account-submitting="accountSubmitting"
      :save-account="saveAccount"
      @close="showSettings = false"
      @add-restaurant="openAddRestaurantFromSettings"
    />

    <!-- ═══ INSTALL APP (PWA download for owners) ═══
         Android / desktop: fires the native install dialog.
         iOS Safari: shows Add-to-Home-Screen steps. -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showInstallModal" class="overlay" @click.self="showInstallModal = false">
          <div class="sheet">
            <div class="sheet-h">
              <span>
                <AppIcon name="download" :size="16" />
                {{ i18n.t.install_app }}
              </span><button class="ic" aria-label="Close" @click="showInstallModal = false">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div class="sheet-b">
              <p class="ins-desc">{{ i18n.t.install_desc }}</p>

              <!-- installability requires HTTPS or localhost -->
              <div v-if="insecureContext" class="msg msg-e">
                <AppIcon name="alert-circle" :size="14" />
                {{ i18n.t.install_needs_https }}
              </div>

              <!-- already installed on this device (running standalone, just
                   installed, or remembered from a previous visit) — TELL the
                   owner, and still let them install again: the one-tap dialog
                   whenever the browser offers one, otherwise the steps below
                   (Chromium only: Refresh re-arms the dialog). -->
              <template v-if="isInstalled">
                <div class="msg msg-s">
                  <AppIcon name="check-circle" :size="14" />
                  {{ i18n.t.install_done }}
                </div>

                <button v-if="canNativeInstall" class="btn btn-primary btn-b" @click="installApp">
                  <AppIcon name="download" :size="15" />
                  {{ i18n.t.install_again }}
                </button>
                <div v-else-if="manualInstallHint" class="msg msg-i">
                  {{ manualInstallHint }}
                </div>
              </template>

              <!-- Browsers WITHOUT a one-tap install dialog at all: Safari
                   (macOS “Add to Dock”, iOS Share sheet) and Firefox (cannot
                   install web apps). They never fire beforeinstallprompt, so
                   the right steps are shown at once — no waiting, no Refresh. -->
              <template v-else-if="needsManualInstall">
                <div v-if="manualInstallHint" class="msg msg-i">
                  {{ manualInstallHint }}
                </div>
              </template>

              <!-- Chromium / Edge: the browser is NOT offering the one-click
                   dialog right now (never fired yet, or it is backing off
                   after a dismissal) — the menu steps below always work and
                   Refresh re-arms the dialog. -->
              <template v-else-if="installDismissed || installWaitExpired">
                <div class="msg msg-i">
                  {{
                    installDismissed
                      ? i18n.t.install_dismissed
                      : i18n.t.install_wait_hint
                  }}
                </div>
                <div v-if="!installDismissed" class="ins-wait">
                  <button class="btn btn-g btn-sm" @click="reloadPage">
                    {{ i18n.t.refresh || "Refresh" }}
                  </button>
                </div>
              </template>

              <!-- Android / desktop Chrome — one-click install button.
                   `canNativeInstall` is true only while the captured
                   beforeinstallprompt event is still unused. -->
              <template v-else-if="canNativeInstall">
                <button class="btn btn-primary btn-b" @click="installApp">
                  <AppIcon name="download" :size="15" />
                  {{ i18n.t.install_now }}
                </button>
              </template>

              <!-- Waiting for the browser — short grace period only (the
                   service worker may still be activating on a first visit). -->
              <template v-else>
                <button class="btn btn-primary btn-b" disabled>
                  <span class="spinner ins-spin"></span>
                  {{ i18n.t.install_wait }}
                </button>
              </template>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useFoodsStore } from "@/stores/foods";
import { useI18nStore } from "@/stores/i18n";
import FoodCard from "@/components/FoodCard.vue";
import FoodFormModal from "@/components/FoodFormModal.vue";
import AppSelect from "@/components/AppSelect.vue";
import AppIcon from "@/components/AppIcon.vue";
import NotificationBell from "@/components/NotificationBell.vue";
import ShareGrid from "@/components/ShareGrid.vue";
import AdminMobileBar from "@/components/admin/AdminMobileBar.vue";
import AdminOrdersSection from "@/components/admin/AdminOrdersSection.vue";
import AdminCallsSection from "@/components/admin/AdminCallsSection.vue";
import { fetchCalls } from "@/composables/useAdminCalls";
import AdminReportsSection from "@/components/admin/AdminReportsSection.vue";
import AdminSettingsModal from "@/components/admin/AdminSettingsModal.vue";
import { useThemeStore } from "@/stores/theme";
import { useNotificationsStore } from "@/stores/notifications";
import { useCurrencyStore } from "@/stores/currency";
import {
  getPushState,
  enablePush,
  disablePush,
} from "@/utils/pushNotifications";
import { buildShareLinks } from "@/utils/share.mjs";
import { usePwaInstall } from "@/utils/pwaInstall";
import { useInstallUi } from "@/composables/useInstallUi";
import { useAdminTab } from "@/composables/useAdminTab";
import { useAdminFoods } from "@/composables/useAdminFoods";
import { useAdminCategories } from "@/composables/useAdminCategories";
import { useAdminOrders } from "@/composables/useAdminOrders";
import { useAdminStats } from "@/composables/useAdminStats";
import { useAdminQr } from "@/composables/useAdminQr";
import { useAdminDevices } from "@/composables/useAdminDevices";
import { useAdminReports } from "@/composables/useAdminReports";
import { useAdminStream } from "@/composables/useAdminStream";
import { useAdminRestaurant } from "@/composables/useAdminRestaurant";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;
const router = useRouter();
const auth = useAuthStore();
const foods = useFoodsStore();
const i18n = useI18nStore();
const theme = useThemeStore();
const notifications = useNotificationsStore();
const currencyStore = useCurrencyStore();

// ─── DASHBOARD DOMAINS ─────────────────────────────────────
// State + actions live in @/composables/useAdmin* (verbatim extracts).
// Singleton refs: the sidebar, the SSE stream and every tab share one source.
const { adminTab } = useAdminTab();
const { curCat, searchQ, showForm, editingFood, deletingFood, menuCreating, load, openAdd, confirmDel, doDelete } = useAdminFoods();
const { showCatForm, editingCat, catSubmitting, catSuccess, catErrors, catLabelKm, deletingCat, openCatForm, submitCategory, confirmDelCat, doDeleteCat } = useAdminCategories();
const { orders, ordersLoading, fetchOrders, updateOrderStatus, expandedDays, toggleDay, orderSections, dayLabel, searchDate, searchActive, searchDateOrders, clearDateSearch, scheduleNewDayCheck, stopNewDayCheck } = useAdminOrders();
const { stats, fetchStats } = useAdminStats();
const { showQR, qrTableNumber, qrCodeDataUrl, qrLoading, qrError, qrInfo, savedQrs, qrSearch, qrListLoading, qrListError, selectedSavedNo, deletingQr, filteredSavedQrs, openQR, generateQR, previewSavedQr, downloadSavedQr, formatQrDate, confirmDelQr, doDeleteQr, downloadQR } = useAdminQr();
const { showDevices, devicesList, devicesLoading, devicesError, devicesMsg, deletingDevice, revokingDeviceId, expandedDeviceId, loginHistory, historyLoading, historyError, activeDevicesCount, openDevices, confirmRevokeDevice, doRevokeDevice, revokeAllOthers, fetchLoginHistory, toggleDeviceDetails, deviceMethodLabel } = useAdminDevices();
const { report, reportLoading, reportError, reportGroup, reportPreset, reportStartDate, reportEndDate, reportDataset, reportFormat, reportExporting, reportExportMsg, reportExportError, reportPresets, reportGroups, reportDatasets, reportFormats, applyReportPreset, openReports, fetchReport, exportReport, reportSeriesPoints, reportHourPoints, chartColor, fmtAxis, topItemWidth, tableBarWidth, statusBarWidth } = useAdminReports();
const { connectOrderStream, disconnectOrderStream } = useAdminStream();
const { showAddRestaurant, addRestaurantName, addRestaurantSubmitting, addRestaurantMsg, addRestaurantError, openAddRestaurant, submitAddRestaurant, onSwitchRestaurant, initForRestaurant, ensureDefaultMenu, refreshCurrentMenuSelection, loadCategories, syncRestaurantTheme, showDeleteRestaurant, deleteRestaurantConfirm, deleteRestaurantSubmitting, deleteRestaurantMsg, deleteRestaurantError, openDeleteRestaurant, submitDeleteRestaurant } = useAdminRestaurant();
// ─── RESET ON EVERY MOUNT ──────────────────────────────────
// The domain composables keep their state in module-level singletons so
// every part of the dashboard shares it. The original view owned per-instance
// refs, so each visit started clean — restore that exact behavior here
// (runs during setup, before the first render, exactly like a fresh ref).
function resetSingletonState() {
  curCat.value = "";
  searchQ.value = "";
  showForm.value = false;
  editingFood.value = null;
  deletingFood.value = null;

  showCatForm.value = false;
  editingCat.value = null;
  catSubmitting.value = false;
  catSuccess.value = "";
  catErrors.value = "";
  catLabelKm.value = "";
  deletingCat.value = null;

  showQR.value = false;
  qrTableNumber.value = "";
  qrCodeDataUrl.value = "";
  qrLoading.value = false;
  qrError.value = "";
  qrInfo.value = "";
  qrSearch.value = "";
  qrListLoading.value = false;
  qrListError.value = "";
  selectedSavedNo.value = null;
  deletingQr.value = null;

  showDevices.value = false;
  devicesLoading.value = false;
  devicesError.value = "";
  devicesMsg.value = "";
  deletingDevice.value = null;
  revokingDeviceId.value = null;
  expandedDeviceId.value = null;
  historyLoading.value = false;
  historyError.value = "";

  showAddRestaurant.value = false;
  addRestaurantSubmitting.value = false;
  addRestaurantMsg.value = "";
  addRestaurantError.value = "";

  showDeleteRestaurant.value = false;
  deleteRestaurantConfirm.value = "";
  deleteRestaurantSubmitting.value = false;
  deleteRestaurantMsg.value = "";
  deleteRestaurantError.value = "";

  searchDate.value = "";
  expandedDays.value = {};

  // data refs start empty and are refetched on mount (same as before)
  orders.value = [];
  ordersLoading.value = false;
  report.value = {};
  reportLoading.value = false;
  devicesList.value = [];
  loginHistory.value = [];
  stats.value = { totalRevenue: 0, totalOrders: 0, daily: [] };
}
resetSingletonState();

const loggingOut = ref(false);
const showMobile = ref(false);
let desktopBreakpointQuery = null;
const showTelegramSettings = ref(false);
const showProfile = ref(false);
const showSettings = ref(false);
const settingsTab = ref("appearance");
const settingsCurrencyMsg = ref("");
const settingsCurrencyError = ref("");
const currencySubmitting = ref(false);
const profileMenuOpen = ref(false);
const profileWrap = ref(null);
// Sticky page header (see .hdr in the stylesheet). Its measured height is
// published as --hdr-h on .main so the sticky Reports filter panel
// (.rep-side) can park exactly underneath it.
const hdrEl = ref(null);
let hdrResizeObserver = null;
const profileName = ref("");
const profileCurrency = ref("KHR");
const profileRate = ref(4100);
const profileLogoFile = ref(null);
const profileLogoPreview = ref(null);
const profileSubmitting = ref(false);
const profileSuccess = ref("");
const profileError = ref("");
// ─── Account (email / password) editing ─────────
const accountEmail = ref("");
const accountCurrentPassword = ref("");
const accountNewPassword = ref("");
const accountSubmitting = ref(false);
const accountSuccess = ref("");
const accountError = ref("");
// Set when the restaurant logo URL fails to load → templates fall back
// to the default SVG icon. Reset whenever the logo URL changes.
const logoLoadError = ref(false);

const tgSubmitting = ref(false);
const tgSuccess = ref("");
const tgError = ref("");
const copied = ref(false);
const tgLoading = ref(false);
const displayLinkCode = computed(() => `/link ${auth.linkCode || "------"}`);
const isLinked = computed(() => auth.isTelegramLinked);

// Direct chat with our Telegram bot — the "Open Telegram" button in the
// Telegram settings modal opens this in a new tab. The web-client form
// works in any desktop/mobile browser (Telegram shows "Open in app" on
// mobile); the app-first equivalent is https://t.me/digital_menu_khmer_bot
const TELEGRAM_BOT_URL = "https://web.telegram.org/a/#8731785855";

const previewLinkCopied = ref(false);
const previewMenuUrl = computed(() => {
  if (!auth.restaurantId) return "#";
  return `${window?.location?.origin || ""}/menu?restaurant_id=${auth.restaurantId
    }`;
});
// Restaurant logo URL — empty when unset (templates show a default
// SVG icon) or when the current URL failed to load (logoLoadError).
const restaurantLogo = computed(() => {
  if (logoLoadError.value) return "";
  return auth.restaurant?.logoUrl || "";
});
watch(
  () => auth.restaurant?.logoUrl,
  () => {
    logoLoadError.value = false;
  }
);

// ─── SHARING (every platform) ─────────────────────────────
// `shareLinks.shareUrl` is the crawler-friendly preview card: Facebook,
// Messenger, Telegram, WhatsApp, Instagram, WeChat, LinkedIn … all show the
// restaurant name + logo instead of the generic app card.
const showShare = ref(false);
const shareLinks = computed(() =>
  buildShareLinks({ restaurantId: auth.restaurantId }),
);
const shareText = computed(() =>
  String(i18n.t.share_menu_message || "{name}").replace(
    "{name}",
    auth.restaurant?.name || profileName.value || i18n.t.app_name,
  ),
);
const shareImage = computed(() => restaurantLogo.value || "");

const currencyOptions = computed(() => [
  { value: "KHR", label: i18n.t.currency_khr || "៛ KHR" },
  { value: "USD", label: i18n.t.currency_usd || "$ USD" },
]);

function openProfile() {
  profileName.value = auth.restaurant?.name || "";
  profileLogoFile.value = null;
  profileLogoPreview.value = null;
  profileSuccess.value = "";
  profileError.value = "";
  showProfile.value = true;
}

// ─── SETTINGS (account email / password) ───────────────────
// Opened from the avatar dropdown; moved out of the Profile modal so the
// profile sheet stays focused on the restaurant (name / logo / theme).
function openSettings() {
  settingsTab.value = "appearance";
  accountEmail.value = auth.user?.email || "";
  accountCurrentPassword.value = "";
  accountNewPassword.value = "";
  accountSuccess.value = "";
  accountError.value = "";
  settingsCurrencyMsg.value = "";
  settingsCurrencyError.value = "";
  profileCurrency.value = auth.restaurant?.currency || "KHR";
  profileRate.value = Number(auth.restaurant?.exchangeRate) || 4100;
  orderTracking.value = Boolean(auth.restaurant?.orderTracking ?? 0);
  trackingMsg.value = "";
  trackingError.value = "";
  syncRestaurantTheme();
  refreshPushState();
  showSettings.value = true;
}

// ─── SETTINGS › CURRENCY ───────────────────────────────────
// Saves the display-currency choice (៛ / $) + exchange rate.
async function saveCurrency() {
  if (currencySubmitting.value) return;
  if (!auth.restaurantId) {
    settingsCurrencyError.value =
      i18n.t.need_restaurant || "Create a restaurant first";
    return;
  }
  currencySubmitting.value = true;
  settingsCurrencyMsg.value = "";
  settingsCurrencyError.value = "";
  try {
    await axios.patch(`${API_BASE}/api/auth/currency`, {
      currency: profileCurrency.value,
      exchangeRate: Number(profileRate.value) || 4100,
      restaurant_id: auth.restaurantId,
    });
    if (auth.restaurant) {
      auth.restaurant.currency = profileCurrency.value;
      auth.restaurant.exchangeRate = Number(profileRate.value) || 4100;
      auth.saveToStorage();
    }
    currencyStore.setFrom(auth.restaurant);
    settingsCurrencyMsg.value = i18n.t.saved_success || "Saved successfully!";
    setTimeout(() => {
      settingsCurrencyMsg.value = "";
    }, 2500);
  } catch (err) {
    settingsCurrencyError.value =
      err?.response?.data?.error || i18n.t.generic_error || "Error";
  } finally {
    currencySubmitting.value = false;
  }
}

// ─── WEB PUSH (this device) ────────────────────────────────
// Toggle lives in Settings → "Push notifications". The subscription is
// per-browser; the backend stores it and pushes on every new order.
const pushState = ref("unsupported");
const pushBusy = ref(false);
const pushError = ref("");

const pushStateLabel = computed(() => {
  const t = i18n.t;
  switch (pushState.value) {
    case "enabled":
      // The bell is an SVG <AppIcon> in the template (see push-state span)
      return t.push_on || "On";
    case "blocked":
      return t.push_blocked || "Blocked by browser";
    case "unsupported":
      return t.push_unsupported || "Not supported on this browser";
    case "not_configured":
      return t.push_not_configured || "Not configured on server";
    default:
      return t.push_off || "Off";
  }
});

async function refreshPushState() {
  try {
    pushState.value = (await getPushState(auth.token)).state;
  } catch {
    pushState.value = "unsupported";
  }
}

function pushReasonText(reason) {
  const t = i18n.t;
  if (reason === "denied")
    return t.push_denied || "Permission denied — allow notifications in your browser settings.";
  if (reason === "not_configured")
    return t.push_not_configured || "Not configured on server";
  return t.push_enable_failed || "Could not enable push notifications";
}

async function togglePush() {
  pushBusy.value = true;
  pushError.value = "";
  try {
    if (pushState.value === "enabled") {
      await disablePush(auth.token);
      pushState.value = "disabled";
    } else {
      const res = await enablePush(auth.token);
      if (!res.ok) {
        pushError.value = pushReasonText(res.reason);
        await refreshPushState();
      } else {
        pushState.value = "enabled";
      }
    }
  } catch (err) {
    console.error("Push toggle error:", err);
    pushError.value = i18n.t.generic_error || "Something went wrong";
  } finally {
    pushBusy.value = false;
  }
}

// ─── GUEST ORDER TRACKING (Settings → Orders) ──────────────
// Owner switch for the public /track page: ON = new orders get a track
// token and guests follow them live; OFF = no token is issued (the cart
// never offers the link) and old links answer 404 on the tracker.
// Same optimistic flip + revert-on-error pattern as the push toggle.
// Default OFF: guests can only track after the owner turns this on.
const orderTracking = ref(false);
const trackingSubmitting = ref(false);
const trackingMsg = ref("");
const trackingError = ref("");

async function toggleOrderTracking() {
  const next = !orderTracking.value;
  if (!auth.restaurantId) {
    trackingError.value =
      i18n.t.need_restaurant || "Create a restaurant first";
    return;
  }
  orderTracking.value = next; // optimistic — reverted below on failure
  trackingSubmitting.value = true;
  trackingMsg.value = "";
  trackingError.value = "";
  try {
    await axios.patch(`${API_BASE}/api/auth/tracking`, {
      orderTracking: next,
      restaurant_id: auth.restaurantId,
    });
    if (auth.restaurant) {
      auth.restaurant.orderTracking = next;
      auth.saveToStorage();
    }
    trackingMsg.value = i18n.t.saved_success || "Saved successfully!";
    setTimeout(() => {
      trackingMsg.value = "";
    }, 2500);
  } catch (err) {
    orderTracking.value = !next;
    trackingError.value =
      err?.response?.data?.error || i18n.t.generic_error || "Error";
  } finally {
    trackingSubmitting.value = false;
  }
}

// ─── STICKY PAGE HEADER HEIGHT ────────────────────────────
// `.hdr` is stuck to the top of the scroll area and `.rep-side` parks right
// below it, so the header's own height must be known in CSS. It is measured
// here (and kept in sync by a ResizeObserver — Khmer web fonts change their
// line metrics once they finish loading, which changes the height) and
// exposed as --hdr-h on .main, the shared parent of both elements.
function syncHdrHeight() {
  const el = hdrEl.value;
  const parent = el?.parentElement;
  if (!el || !parent) return;
  const next = `${el.offsetHeight}px`;
  if (parent.style.getPropertyValue("--hdr-h") === next) return;
  parent.style.setProperty("--hdr-h", next);
}

// ─── HEADER PROFILE MENU ─────────────────────────────────
// Toggle the avatar dropdown that replaces the old one-off header
// buttons (QR / Devices / Telegram / Preview) — every action now
// lives behind a single "profile & settings" entry point.
function toggleProfileMenu() {
  profileMenuOpen.value = !profileMenuOpen.value;
}
function closeProfileMenu() {
  profileMenuOpen.value = false;
}
function runProfileAction(fn) {
  closeProfileMenu();
  if (typeof fn === "function") fn();
}
function onProfileMenuDocClick(e) {
  if (profileWrap.value && !profileWrap.value.contains(e.target)) {
    closeProfileMenu();
  }
}
// Auto-listen for outside clicks only while the menu is open
watch(profileMenuOpen, (open) => {
  if (open) document.addEventListener("click", onProfileMenuDocClick);
  else document.removeEventListener("click", onProfileMenuDocClick);
});

// ─── THEME COLOR PICKER ─────────────────────────────────────
// Applies the color live, keeps the per-user editor preference, updates the
// cached restaurant AND debounce-saves to the server so the customer-facing
// menu / preview page uses the same color.
const themeSaveTimer = ref(null);

function applyThemeColor(color, opts = {}) {
  if (!theme.setPrimary(color)) return false;
  if (auth.restaurant) {
    auth.restaurant.themeColor = color;
    auth.saveToStorage();
  }
  if (opts.debounce !== false) {
    clearTimeout(themeSaveTimer.value);
    themeSaveTimer.value = setTimeout(() => saveThemeToServer(color), 400);
  }
  return true;
}
async function saveThemeToServer(color) {
  if (!auth.restaurantId) return; // no restaurant on this account — nothing to persist
  try {
    await axios.patch(`${API_BASE}/api/auth/theme`, {
      themeColor: color,
      restaurant_id: auth.restaurantId,
    });
  } catch (err) {
    // Surface the server's reason — a bare AxiosError only reports the status.
    console.error(
      "Failed to save theme to server:",
      err?.response?.data?.error || err.message,
    );
  }
}
function onCustomColor(e) {
  applyThemeColor(e.target.value);
}
function onPresetColor(color) {
  applyThemeColor(color);
}
function applyHexInput(e) {
  const raw = (e.target?.value || "").trim();
  const norm = raw.startsWith("#") ? raw : "#" + raw;
  // Invalid hex → revert the field to the current color
  if (!applyThemeColor(norm)) e.target.value = theme.primary;
}
function resetTheme() {
  theme.reset();
  if (auth.restaurant) {
    auth.restaurant.themeColor = theme.primary;
    auth.saveToStorage();
  }
  clearTimeout(themeSaveTimer.value);
  saveThemeToServer(theme.primary);
}
// ─── SIDEBAR POSITION (owner-selectable layout) ─────────────
const sidebarSaveTimer = ref(null);
const sidebarPosition = computed(() => auth.restaurant?.sidebarPosition || "left");
function applySidebarPosition(pos) {
  if (!["left", "right", "top", "bottom"].includes(pos)) return;
  if (auth.restaurant) {
    auth.restaurant.sidebarPosition = pos;
    auth.saveToStorage();
  }
  clearTimeout(sidebarSaveTimer.value);
  sidebarSaveTimer.value = setTimeout(() => saveSidebarToServer(pos), 400);
}
// Delete-restaurant modal: the button unlocks only when the typed name
// matches the current restaurant exactly (case-insensitive) — so a mis-click
// can never wipe a restaurant.
const deleteRestaurantConfirmMatches = computed(() => {
  const current = String(auth.restaurant?.name || "").trim().toLowerCase();
  return (
    !!current &&
    deleteRestaurantConfirm.value.trim().toLowerCase() === current
  );
});

// From the settings modal: close it and open the create-restaurant dialog —
// per-restaurant settings need a restaurant to write into.
function openAddRestaurantFromSettings() {
  showSettings.value = false;
  openAddRestaurant();
}

async function saveSidebarToServer(pos) {
  // The settings modal disables these controls while the account has no
  // restaurant (the setting is stored per restaurant, so the backend would
  // 404); keep the guard as a safety net for other callers.
  if (!auth.restaurantId) return;
  try {
    await axios.patch(`${API_BASE}/api/auth/sidebar`, {
      sidebarPosition: pos,
      restaurant_id: auth.restaurantId,
    });
  } catch (err) {
    // Surface the server's reason — a bare AxiosError only reports the status.
    console.error(
      "Failed to save sidebar position:",
      err?.response?.data?.error || err.message,
    );
  }
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
    profileError.value = i18n.t.restaurant_name_required;
    return;
  }
  profileSubmitting.value = true;
  profileSuccess.value = "";
  profileError.value = "";
  try {
    const formData = new FormData();
    formData.append("name", profileName.value.trim());
    if (profileLogoFile.value) formData.append("logo", profileLogoFile.value);
    const res = await axios.patch(`${API_BASE}/api/auth/restaurant`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (res.data.restaurant) {
      auth.restaurant.name = res.data.restaurant.name;
      auth.restaurant.logoUrl = res.data.restaurant.logoUrl;
      auth.saveToStorage();
    }
    profileSuccess.value = i18n.t.saved_success;
    setTimeout(() => {
      showProfile.value = false;
    }, 1200);
  } catch (err) {
    profileError.value =
      err.response?.data?.code === "DUPLICATE_RESTAURANT"
        ? i18n.t.dup_restaurant || "You already have a restaurant with this name"
        : err.response?.data?.error || i18n.t.generic_error;
  } finally {
    profileSubmitting.value = false;
  }
}

// Save the logged-in user's own email and/or password changes.
// The backend verifies the current password (unless the account is Google-only).
async function saveAccount() {
  const email = accountEmail.value.trim();
  const newPw = accountNewPassword.value;
  const wantsEmail =
    email && email.toLowerCase() !== (auth.user?.email || "").trim().toLowerCase();
  const wantsPassword = !!newPw;
  if (!wantsEmail && !wantsPassword) {
    accountError.value = i18n.t.no_changes || "No changes requested";
    return;
  }
  accountSubmitting.value = true;
  accountSuccess.value = "";
  accountError.value = "";
  try {
    const payload = {};
    if (accountCurrentPassword.value)
      payload.currentPassword = accountCurrentPassword.value;
    if (wantsEmail) payload.email = email;
    if (wantsPassword) payload.newPassword = newPw;
    const data = await auth.updateAccount(payload);
    accountCurrentPassword.value = "";
    accountNewPassword.value = "";
    // If the email changed, `auth.user.email` already refetched — reflect it
    // in the header/dropdown immediately via the store's updated `user`.
    accountSuccess.value =
      data.message || i18n.t.saved_success || "Saved successfully!";
    setTimeout(() => {
      accountSuccess.value = "";
    }, 3500);
  } catch (err) {
    accountError.value =
      err.response?.data?.error || i18n.t.generic_error;
  } finally {
    accountSubmitting.value = false;
  }
}

async function openTelegramSettings() {
  showTelegramSettings.value = true;
  tgLoading.value = true;
  tgSuccess.value = "";
  tgError.value = "";
  try {
    const res = await axios.get(`${API_BASE}/api/auth/me`);
    if (res.data.restaurant) {
      auth.restaurant = res.data.restaurant;
      auth.saveToStorage();
    }
  } catch (err) {
    console.error(
      "Failed to refresh restaurant data:",
      err?.response?.data?.error || err.message,
    );
  } finally {
    tgLoading.value = false;
  }
}
async function copyLinkCode() {
  try {
    await navigator.clipboard.writeText(`/link ${auth.linkCode || ""}`);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    const el = document.createElement("textarea");
    el.value = `/link ${auth.linkCode || ""}`;
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
  if (!confirm(i18n.t.tg_unlink_confirm)) return;
  try {
    await axios.patch(`${API_BASE}/api/auth/unlink-telegram`);
    if (auth.restaurant) {
      auth.restaurant.telegramChatId = null;
      auth.saveToStorage();
    }
    tgSuccess.value = i18n.t.tg_unlinked;
    setTimeout(() => {
      tgSuccess.value = "";
    }, 2000);
  } catch (err) {
    tgError.value = err.response?.data?.error || i18n.t.generic_error;
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
  // Locale-aware order-status text (i18n order_st_*). The glyph that used to
  // be baked into these labels (hourglass / chef / plate / check / cross) is
  // now an SVG <AppIcon> rendered next to this text via statusIcon() below.
  const labels = {
    pending: i18n.t.order_st_pending,
    confirmed: i18n.t.order_st_confirmed,
    preparing: i18n.t.order_st_preparing,
    ready: i18n.t.order_st_ready,
    served: i18n.t.order_st_served,
    cancelled: i18n.t.order_st_cancelled,
  };
  return labels[status] || status;
}
// AppIcon name for an order status (dashboard order cards + status buttons).
function statusIcon(status) {
  const icons = {
    pending: "clock",
    confirmed: "clock-check",
    preparing: "chef",
    ready: "plate",
    served: "check-circle",
    cancelled: "x-circle",
  };
  return icons[status] || "clock";
}
function getStatusOptions(currentStatus) {
  // Show ALL statuses (except current) so admin can change to any status directly
  const allStatuses = ["preparing", "ready", "served", "cancelled"];
  return allStatuses.filter((s) => s !== currentStatus);
}
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString(i18n.locale === "km" ? "km-KH" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
// Share sheet: the public menu link (preview card) to any platform
function openShare() {
  showShare.value = true;
}

// KDS runs on its own screen/tab — never inside the dashboard SPA
function openKds() {
  window.open("/kds", "_blank", "noopener");
}
function confirmLogout() {
  auth.logout();
  router.push("/login");
}
function handleEscKey(e) {
  if (e.key !== "Escape") return;
  if (profileMenuOpen.value) {
    profileMenuOpen.value = false;
  } else if (showAddRestaurant.value) showAddRestaurant.value = false;
  else if (showDeleteRestaurant.value) showDeleteRestaurant.value = false;
  else if (showForm.value) {
    showForm.value = false;
    editingFood.value = null;
  } else if (deletingFood.value) deletingFood.value = null;
  else if (deletingCat.value) deletingCat.value = null;
  else if (deletingQr.value) deletingQr.value = null;
  else if (showShare.value) showShare.value = false;
  else if (showQR.value) showQR.value = false;
  else if (deletingDevice.value) deletingDevice.value = null;
  else if (showDevices.value) showDevices.value = false;
  else if (showTelegramSettings.value) showTelegramSettings.value = false;
  else if (loggingOut.value) loggingOut.value = false;
  else if (showCatForm.value) showCatForm.value = false;
  else if (showProfile.value) showProfile.value = false;
  else if (showSettings.value) showSettings.value = false;
  else if (showInstallModal.value) showInstallModal.value = false;
}

// ─── REAL-TIME NEW ORDER ALERT (TTS 🔊) ───
// Clicking a notification jumps straight to the Orders tab.
// A notification belongs to a specific restaurant (multi-restaurant owners),
// so when it is NOT the restaurant currently selected we switch to it first —
// otherwise the Orders tab would show another restaurant's orders and the
// alert would look like it had no data.
async function onNotificationSelect(notification) {
  adminTab.value = "orders";
  showMobile.value = false;

  const targetId = Number(notification?.restaurantId ?? 0);
  const owned =
    targetId > 0 &&
    auth.restaurants.some((r) => Number(r.id) === targetId);

  if (owned && targetId !== Number(auth.restaurantId)) {
    // Switch restaurant, then reload menus/categories/foods/orders and
    // reconnect the SSE stream for it (initForRestaurant does all of that).
    auth.setCurrentRestaurant(targetId);
    syncRestaurantTheme();
    curCat.value = "";
    searchQ.value = "";
    await initForRestaurant();
  } else {
    // Same restaurant (or unknown) → just make sure the list is fresh.
    await fetchOrders();
    // A "call the owner" notification points at the Guest requests panel
    // above the orders — refresh it too so the row is already there.
    if (notification?.type === "table-call") fetchCalls();
  }
}

// Shared message builder for order notifications. The SSE payload uses
// camelCase (tableNo); DB rows fetched from /api/orders use snake_case
// (table_no) — accept both.
onMounted(async () => {
  // Refresh restaurants list (in case a new one was added elsewhere).
  // A failed refresh must not abort the rest of the mount work (menus,
  // categories, orders, SSE) — keep the cached session and carry on.
  try {
    await auth.fetchMe();
  } catch (err) {
    console.warn("[AdminView] Could not refresh session:", err?.message);
  }
  // Load the persisted notification history for this user (bell dropdown)
  notifications.load(auth.user?.id ?? null);
  syncRestaurantTheme();
  currencyStore.setFrom(auth.restaurant);
  await foods.fetchMenus();
  refreshCurrentMenuSelection();
  await loadCategories();
  if (foods.categories.length) curCat.value = foods.categories[0].id;
  await load();
  // Fetch orders on mount: powers the Orders tab AND backfills the
  // notification bell with the most recent orders
  // (see seedNotificationsFromOrders).
  await fetchOrders();
  fetchStats();
  window.addEventListener("keydown", handleEscKey);
  connectOrderStream();
  scheduleNewDayCheck();

  // Publish the sticky header height (--hdr-h) and keep it in sync when the
  // Khmer font finishes loading or the header wraps on a narrow viewport.
  syncHdrHeight();
  if (typeof ResizeObserver !== "undefined" && hdrEl.value) {
    hdrResizeObserver = new ResizeObserver(syncHdrHeight);
    hdrResizeObserver.observe(hdrEl.value);
  }

  // When the viewport crosses back above the mobile breakpoint, close the
  // drawer so the layout doesn't carry a stuck "open" state into desktop.
  const mq = window.matchMedia("(min-width: 901px)");
  const onDesktopBreakpoint = (e) => {
    if (e.matches) showMobile.value = false;
  };
  if (mq.addEventListener) mq.addEventListener("change", onDesktopBreakpoint);
  else mq.addListener(onDesktopBreakpoint);
  desktopBreakpointQuery = { mq, onDesktopBreakpoint };
});
// ─── PWA INSTALL ("download the web as an app") ────────────
// Owners can install Digital Menu from the profile dropdown. Android /
// desktop Chrome get the native `beforeinstallprompt` dialog; iOS Safari
// has no install event, so we show Add-to-Home-Screen steps instead.
// When the app already runs standalone (installed), the item hides itself.
//
// The browser event itself is captured in @/utils/pwaInstall (attached from
// main.js BEFORE the app mounts): Chrome fires `beforeinstallprompt` once per
// page load, usually BEFORE this lazily-loaded view mounts — a listener
// registered here would miss it and the "Preparing…" button would spin
// forever with no way to recover.
const {
  canNativeInstall,
  isInstalled,
  needsManualInstall,
  insecureContext,
  installDismissed,
  installAvailable,
} = usePwaInstall();
// Modal open/close state, wait-timer logic and labels — shared singleton
// with the mobile bar and the profile menu (see @/composables/useInstallUi)
const {
  showInstallModal,
  installWaitExpired,
  manualInstallSteps,
  manualInstallHint,
  showInstallSteps,
  openInstall,
  installApp,
  reloadPage,
} = useInstallUi();

// Labels / manual steps / actions come from @/composables/useInstallUi.
onUnmounted(() => {
  window.removeEventListener("keydown", handleEscKey);
  document.removeEventListener("click", onProfileMenuDocClick);
  disconnectOrderStream();
  stopNewDayCheck(); // midnight timer lives in useAdminOrders now
  // Closing the shared modal also clears the composable's wait timer and
  // resets the state for the next mount (HEAD kept both in this component).
  showInstallModal.value = false;
  // The beforeinstallprompt / appinstalled listeners stay attached for the
  // whole app lifetime (attached once from main.js) — nothing to remove here.
  if (hdrResizeObserver) {
    hdrResizeObserver.disconnect();
    hdrResizeObserver = null;
  }
  if (desktopBreakpointQuery) {
    const { mq, onDesktopBreakpoint } = desktopBreakpointQuery;
    if (mq.removeEventListener) mq.removeEventListener("change", onDesktopBreakpoint);
    else mq.removeListener(onDesktopBreakpoint);
    desktopBreakpointQuery = null;
  }
});
</script>

<style>
:root {
  --primary: #0f766e;
  --primary-dark: #0d5e57;
  --primary-light: #14b8a6;
  --primary-glow: rgba(15, 118, 110, 0.15);
  --primary-glow-strong: rgba(15, 118, 110, 0.25);
  --green: #22c55e;
  --green-dark: #16a34a;
  --green-light: #86efac;
  --green-glow: rgba(34, 197, 94, 0.2);
  --amber: #f59e0b;
  --amber-light: #fbbf24;
  --red: #c62828;
  --red-dark: #b71c1c;
  --blue: #2563eb;
  --ink: #14532d;
  --ink-light: #1a7a4a;
  --muted: #6b7280;
  --muted-light: #9ca3af;
  --text: #0f172a;
  --surface: #ffffff;
  --surface-green: #f0fdf4;
  --border: #e2e8f0;
  --border-green: #bbf7d0;
}
</style>

<style scoped>
/* Responsive layout */
.root {
  --sidebar: 240px;
  display: grid;
  grid-template-columns: var(--sidebar) 1fr;
  background: #f8fafc;
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ─── SIDEBAR POSITIONS (owner-selectable) — DESKTOP ONLY ───
   On mobile (≤900px) the layout always falls back to the left
   slide-in drawer, so these rules only apply on wider screens.
   NOTE: sticky can't travel inside a grid row that is exactly
   the bar's own height, so top/bottom bars use position:fixed
   (pinned to the viewport) + compensating padding on .main. */
@media (min-width: 901px) {
  .root {
    min-height: 100vh;
  }

  /* ── LEFT (default) ── */
  .root.layout-left {
    grid-template-columns: var(--sidebar) 1fr;
  }

  /* ── RIGHT ── */
  .root.layout-right {
    grid-template-columns: 1fr var(--sidebar);
  }

  .root.layout-right .side {
    order: 2;
    min-width: 0;
    border-right: none;
    border-left: 1px solid var(--border);
  }

  /* ── shared horizontal-bar sizing (top & bottom) ── */
  .root.layout-top,
  .root.layout-bottom {
    --hbar-h: 56px;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
  }

  /* ── TOP ── */
  .root.layout-top .side {
    order: 0;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: auto;
    flex-direction: row;
    align-items: center;
    height: var(--hbar-h);
    min-width: 0;
    z-index: 150;
    border-right: none;
    border-bottom: 1px solid var(--border);
  }

  .root.layout-top .main {
    padding-top: calc(var(--hbar-h) + 0px);
  }

  /* ── BOTTOM ── */
  .root.layout-bottom .side {
    order: 2;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    top: auto;
    flex-direction: row;
    align-items: center;
    height: var(--hbar-h);
    min-width: 0;
    z-index: 150;
    border-right: none;
    border-top: 1px solid var(--border);
  }

  .root.layout-bottom .main {
    padding-bottom: calc(var(--hbar-h) + 24px);
  }

  /* the sticky page header parks right below the fixed sidebar bar */
  .root.layout-top .main {
    --hdr-stick-top: var(--hbar-h, 0px);
  }

  /* ── shared horizontal-bar cells (top & bottom) ── */
  .root.layout-top .side-top,
  .root.layout-bottom .side-top {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    height: 100%;
    padding: 0 12px;
    border-bottom: none;
    border-right: 1px solid var(--border);
    flex: 0 0 auto;
    min-width: 0;
  }

  .root.layout-top .side-rest,
  .root.layout-bottom .side-rest {
    margin-top: 0;
    min-width: 150px;
  }

  .root.layout-top .side-add-rest,
  .root.layout-bottom .side-add-rest {
    width: auto;
    margin-top: 0;
    min-height: 30px;
    padding: 4px 12px;
    white-space: nowrap;
  }

  .root.layout-top .side-del-rest,
  .root.layout-bottom .side-del-rest {
    width: auto;
    margin-top: 0;
    min-height: 30px;
    padding: 4px 12px;
    white-space: nowrap;
  }

  .root.layout-top .side-nav,
  .root.layout-bottom .side-nav {
    flex-direction: row;
    align-items: center;
    gap: 4px;
    height: 100%;
    padding: 0 10px;
    flex: 1 1 auto;
    min-width: 0;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .root.layout-top .side-nav .nav-i,
  .root.layout-bottom .side-nav .nav-i {
    min-height: 32px;
    padding: 6px 12px;
    white-space: nowrap;
  }

  .root.layout-top .side-foot,
  .root.layout-bottom .side-foot {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
    height: 100%;
    border-top: none;
    border-left: 1px solid var(--border);
    padding: 0 10px;
    flex: 0 0 auto;
  }

  .root.layout-top .side-foot .lang,
  .root.layout-top .side-foot .logout,
  .root.layout-bottom .side-foot .lang,
  .root.layout-bottom .side-foot .logout {
    min-height: 32px;
    padding: 5px 10px;
  }
}

/* ─── SIDEBAR ─── */
.side {
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  z-index: 100;
  transition: transform 0.3s ease;
}

.side-top {
  padding: 24px 20px 16px;
  border-bottom: 1px solid var(--border);
  background: linear-gradient(135deg,
      var(--surface-green) 0%,
      var(--surface) 100%);
}

/* Restaurant switcher (one account → many restaurants) */
.side-rest {
  margin-top: 14px;
}

.rest-switch {
  width: 100%;
  min-height: 36px;
  padding: 8px 10px;
  border: 1px solid var(--border-green);
  border-radius: 8px;
  background-color: var(--surface);
  color: var(--ink);
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rest-switch:focus {
  border-color: var(--primary-strong, var(--primary));
  box-shadow: 0 0 0 3px var(--primary-glow);
}

/* ── Restaurant-switcher options (the dropdown list) ──────────
   Built on top of the shared .app-select option design, tuned
   for the sidebar. Chrome/Edge/Safari render these; Firefox
   uses its native list.                                          */
.rest-switch option {
  background-color: var(--surface);
  color: var(--text);
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 500;
  padding: 9px 12px;
  line-height: 1.45;
}

.rest-switch option:hover,
.rest-switch option:active,
.rest-switch option:focus {
  background-color: var(--surface-green);
  color: var(--primary-strong, var(--primary));
}

.rest-switch option:checked {
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  color: var(--on-primary, #fff);
  font-weight: 600;
}

.rest-switch option:disabled,
.rest-switch option[value=""] {
  color: var(--muted-light);
  font-style: italic;
}

.side-add-rest {
  width: 100%;
  margin-top: 10px;
  min-height: 34px;
  padding: 7px 10px;
  border: 1px dashed var(--primary-strong, var(--primary));
  border-radius: 8px;
  background: transparent;
  color: var(--primary-strong, var(--primary));
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.side-add-rest:hover {
  background: var(--surface-green);
  border-color: var(--primary-dark);
  border-style: solid;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px var(--primary-glow);
}

.side-del-rest {
  width: 100%;
  margin-top: 8px;
  min-height: 32px;
  padding: 6px 10px;
  border: 1px dashed var(--red, #ef4444);
  border-radius: 8px;
  background: transparent;
  color: var(--red, #ef4444);
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.side-del-rest:hover {
  background: rgba(239, 68, 68, 0.08);
  border-style: solid;
  transform: translateY(-1px);
}

.del-rest-warn {
  margin: 0 0 14px;
  padding: 10px 12px;
  border: 1px solid rgba(239, 68, 68, 0.35);
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.07);
  color: var(--red, #ef4444);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.5;
}

.side-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.side-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  overflow: hidden;
  background: var(--surface-green);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 2px solid var(--border-green);
  color: var(--primary);
}

.side-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.side-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.side-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--ink);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.side-role {
  font-size: 10.5px;
  color: var(--primary-strong, var(--primary));
  font-weight: 600;
}

.side-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 10px;
  flex: 1;
  overflow-y: auto;
}

.nav-i {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: none;
  background: none;
  border-radius: 8px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  color: var(--muted);
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  min-height: 42px;
  flex-shrink: 0;
}

.nav-i:hover {
  background: var(--surface-green);
  color: var(--text);
}

.nav-i.active {
  background: var(--surface-green);
  color: var(--primary-strong, var(--primary));
  font-weight: 600;
  box-shadow: inset 3px 0 0 var(--primary-strong, var(--primary));
}

.nav-i svg {
  flex-shrink: 0;
}

.nav-i.active svg {
  color: var(--primary-strong, var(--primary));
}

.nav-badge {
  margin-left: auto;
  background: var(--primary);
  color: var(--on-primary, #fff);
  font-size: 10px;
  font-weight: 700;
  padding: 1px 8px;
  border-radius: 999px;
  flex-shrink: 0;
  animation: pulse-badge 2s ease-in-out infinite;
}

@keyframes pulse-badge {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}

.side-foot {
  display: flex;
  gap: 8px;
  padding: 16px 14px 20px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

.lang,
.logout {
  flex: 1;
  padding: 0px 12px;
  border-radius: 8px;
  font-size: 11px;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.lang {
  width: 36px;
  height: 36px;
  background: var(--surface-green);
  color: var(--ink);
  border: 1px solid var(--border-green);
  border-radius: 50%;
}

.lang:hover {
  border-color: var(--primary-strong, var(--primary));
  background: var(--tint-hover, #dcfce7);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(15, 118, 110, 0.1);
}

.logout {
  background: none;
  border: 1px solid transparent;
  color: var(--red);
  min-height: 36px;
  background: #fef2f2;
}

.logout:hover {
  background: #fef2f2;
  border-color: #fecaca;
  transform: translateY(-1px);
}

/* ─── MOBILE ─── */
.scrim {
  display: none;
  opacity: 0;
  transition: opacity 0.2s ease;
}

/* ─── MAIN ─── */
.main {
  padding: 0px 32px 60px;
  /* max-width: 1320px; */
  width: 100%;
  min-width: 0;
  /* `clip` and NOT `hidden`: `overflow-x: hidden` implicitly computes
     overflow-y to `auto`, which turns .main into a scroll container and
     silently breaks `position: sticky` on every descendant (the Reports
     filter panel `.rep-side` relies on it). `clip` still hides horizontal
     overflow but never creates a scroll container, so sticky keeps working
     against the viewport. The `hidden` line stays as a fallback for engines
     that do not support `clip` yet (they simply keep today's behaviour). */
  overflow-x: hidden;
  overflow-x: clip;
}

/* Header — pinned to the top so the page title (with its notification bell
   and avatar) stays visible while the tab content scrolls underneath.
   `--hdr-stick-top` is re-pointed below the fixed sidebar bars
   (layout-top / layout-bottom) and below the mobile bar so the header can
   never slide under them. `--hdr-h` carries the measured height (written by
   the ResizeObserver in <script setup>) and is what lets the sticky Reports
   filter panel park itself exactly underneath this header.
   The bottom rule is drawn with ::before instead of border-bottom, and the
   old margin-bottom gap became padding: that way the header's opaque
   background covers the whole band, so cards scrolling past cannot show
   through the strip below the rule. */
.hdr {
  position: sticky;
  top: var(--hdr-stick-top, 0px);
  z-index: 60;
  /* above the tab content, below .side (100) and the modals */
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0;
  padding-bottom: 16px;
  /* 20px visual gap + the former 24px margin */
  border-bottom: none;
  flex-wrap: wrap;
  padding-top: 20px;
  gap: 10px;
}

.hdr::before {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0px;
  /* leaves 24px of header background below the rule */
  height: 2px;
  background: var(--border-green);
}

.hdr-l {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 150px;
}

.hdr-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 24px;
  font-weight: 700;
  color: var(--ink);
  margin: 0;
  letter-spacing: -0.3px;
}

/* Header title glyph — SVG <AppIcon name="sparkle"> (replaces the old
   glyph drawn with a CSS `content:` pseudo-element) */
.hdr-title-i {
  color: var(--primary-strong, var(--primary));
}

.hdr-sub {
  font-size: 12px;
  color: var(--muted-light);
  margin-top: 2px;
}

.hdr-r {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.hdr-dot {
  position: absolute;
  top: 0px;
  right: 0px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: green;
  border: 2px solid var(--surface);
  animation: blink-dot 1.5s ease-in-out infinite;
}

@keyframes blink-dot {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.3;
  }
}

.hdr-hide {
  display: inline;
}

/* Action Buttons */
.ac {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  position: relative;
  min-height: 36px;
  min-width: 36px;
  flex-shrink: 0;
  line-height: 1.2;
  border: none;
}

.ac-ghost {
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border);
}

.ac-ghost:hover {
  border-color: var(--primary-strong, var(--primary));
  background: var(--surface-green);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px var(--primary-glow);
}

.ac-primary {
  background: var(--primary);
  color: var(--on-primary, #fff);
  border: 1px solid var(--primary-strong, var(--primary));
}

.ac-primary:hover {
  background: var(--primary-dark);
  border-color: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px var(--primary-glow-strong);
}

.ac-avatar {
  padding: 8px;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  justify-content: center;
  min-width: 36px;
}

.ac-icon-only {
  padding: 8px 10px;
}

.ac:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ac span {
  display: inline-block;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Header profile dropdown (avatar → settings menu) ─────── */
.profile-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.profile-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 250px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
  z-index: 120;
  /* above sidebar (90-100), below modals (200+) */
  overflow: hidden;
  animation: pm-pop 0.16s ease;
}

@keyframes pm-pop {
  from {
    opacity: 0;
    transform: translateY(-4px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.pm-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 14px 12px;
  border-bottom: 1px solid var(--border);
  background: var(--surface-green);
}

.pm-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--on-primary, #fff);
  font-weight: 700;
}

.pm-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.pm-info strong {
  font-size: 13px;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pm-info span {
  font-size: 11px;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pm-body {
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.pm-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 10px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 12.5px;
  font-family: inherit;
  font-weight: 500;
  color: var(--text);
  cursor: pointer;
  text-align: left;
  transition: background 0.15s ease, color 0.15s ease;
}

.pm-item:hover {
  background: var(--surface-green);
  color: var(--primary-strong, var(--primary));
}

/* "Install app" row once the app is installed: the label stays fully clickable
   ("Install again") with a small "already installed" note underneath */
.pm-label {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.pm-note {
  font-size: 10px;
  font-style: normal;
  font-weight: 500;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pm-item svg {
  flex-shrink: 0;
}

.pm-item>span:not(.pm-dot) {
  flex: 1;
}

.pm-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--amber);
  animation: blink-dot 1.5s ease-in-out infinite;
  flex-shrink: 0;
}

.pm-sep {
  height: 1px;
  background: var(--border);
  margin: 6px 8px;
}

.pm-danger {
  color: var(--red);
}

.pm-danger:hover {
  background: rgba(198, 40, 40, 0.08);
  color: var(--red-dark);
}

/* ── Settings category tabs (Appearance/Currency/Notify/Account) ── */
.st-tabs {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding-bottom: 2px;
}

.st-tab {
  padding: 7px 13px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  color: var(--muted);
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.st-tab:hover {
  border-color: var(--primary-strong, var(--primary));
  color: var(--primary-strong, var(--primary));
  background: var(--surface-green);
}

.st-tab.active {
  background: var(--primary);
  border-color: var(--primary-strong, var(--primary));
  color: var(--on-primary, #fff);
  box-shadow: 0 2px 8px var(--primary-glow);
}

/* Metrics */
.metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-top: 20px;
  margin-bottom: 28px;
}

.metric {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px 18px;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

.metric::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--primary);
  opacity: 0;
  transition: opacity 0.25s ease;
}

.metric:hover::before {
  opacity: 1;
}

.metric:hover {
  /* no translateY: the metric cards must stay level with each other */
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.metric-teal::before {
  background: var(--primary);
}

.metric-green::before {
  background: var(--green);
}

.metric-amber::before {
  background: var(--amber);
}

.metric-glow {
  position: absolute;
  top: -50%;
  right: -20%;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  opacity: 0.05;
  pointer-events: none;
  transition: all 0.25s ease;
}

.metric-teal .metric-glow {
  background: var(--primary);
}

.metric-green .metric-glow {
  background: var(--green);
}

.metric-amber .metric-glow {
  background: var(--amber);
}

.metric:hover .metric-glow {
  opacity: 0.1;
  transform: scale(1.2);
}

.metric-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.mi-teal {
  background: var(--tint-hover, #ccfbf1);
  color: var(--primary-strong, var(--primary));
}

.mi-green {
  background: var(--tint-hover, #dcfce7);
  color: var(--green-dark);
}

.mi-amber {
  background: #fef3c7;
  color: var(--amber);
}

.metric-b {
  display: flex;
  flex-direction: column;
  gap: 4px;
  /* value → label breathing room */
  min-width: 0;
}

.metric-v {
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  line-height: 1.15;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.metric-l {
  font-size: 11px;
  line-height: 1.35;
  color: var(--muted);
  font-weight: 500;
  /* letter-spacing 0: tracking inserts visible gaps between Khmer glyphs */
  letter-spacing: 0;
}

/* Menu selector strip (restaurant → menu gating) */
.menustrip {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 18px;
  padding: 10px 14px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
}

.menustrip-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--primary-strong, var(--primary));
  flex-shrink: 0;
  padding-right: 10px;
  border-right: 1px solid var(--border);
}

.menustrip-empty {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--muted);
}

.menustrip-tabs {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
}

.menu-single {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.menu-single-name {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  border-radius: 999px;
  background: var(--primary);
  border: 1px solid var(--primary-strong, var(--primary));
  color: var(--on-primary, #fff);
  font-size: 12px;
  font-weight: 600;
  min-height: 28px;
}

.menutab {
  padding: 6px 14px;
  border: 1px solid var(--border-green);
  border-radius: 999px;
  background: var(--surface-green);
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  color: var(--ink);
  cursor: pointer;
  white-space: nowrap;
  min-height: 30px;
  transition: all 0.2s ease;
}

.menutab:hover {
  border-color: var(--primary-strong, var(--primary));
  transform: translateY(-1px);
  box-shadow: 0 2px 8px var(--primary-glow);
}

.menutab.active {
  background: var(--primary);
  border-color: var(--primary-strong, var(--primary));
  color: var(--on-primary, #fff);
  box-shadow: 0 4px 12px var(--primary-glow-strong);
}

.menutab-add {
  background: transparent;
  border: 1px dashed var(--primary-strong, var(--primary));
  color: var(--primary-strong, var(--primary));
}

.menutab-add:hover {
  background: var(--surface-green);
  border-style: solid;
}

/* Toolbar */
.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.bar-scroll {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;
  flex: 1;
  padding: 2px 0;
  min-width: 100px;
}

.bar-scroll::-webkit-scrollbar {
  display: none;
}

.bar-acts {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.bar-count {
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
  flex-shrink: 0;
}

.chip {
  padding: 6px 14px;
  background: var(--surface);
  border-radius: 999px;
  font-size: 11px;
  font-family: inherit;
  font-weight: 500;
  color: var(--muted);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  border: 1px solid var(--border);
  min-height: 30px;
  flex-shrink: 0;
}

.chip:hover {
  border-color: var(--primary-strong, var(--primary));
  color: var(--text);
  transform: translateY(-1px);
}

.chip.active {
  background: var(--primary);
  color: var(--on-primary, #fff);
  border-color: var(--primary-strong, var(--primary));
}

.srch {
  position: relative;
  min-width: 150px;
  flex: 1;
  max-width: 280px;
}

.srch input {
  width: 100%;
  padding: 6px 24px 6px 30px;
  border: 1px solid var(--border);
  border-radius: 999px;
  font-size: 12px;
  font-family: inherit;
  color: var(--text);
  background: var(--surface);
  outline: none;
  transition: all 0.2s ease;
  min-height: 32px;
}

.srch input:focus {
  border-color: var(--primary-strong, var(--primary));
  box-shadow: 0 0 0 3px var(--primary-glow);
}

.srch-i {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--muted-light);
  pointer-events: none;
}

.srch-x {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: none;
  background: var(--surface-green);
  color: var(--muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  padding: 0;
}

.srch-x:hover {
  background: var(--border-green);
  color: var(--text);
}

/* Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

/* Categories */
.cat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
}

.cat-c {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 14px;
  transition: all 0.2s ease;
}

.cat-c:hover {
  /* no translateY: keeps every category card in line */
  border-color: var(--primary-strong, var(--primary));
  box-shadow: 0 2px 12px var(--primary-glow);
}

.cat-n {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.cat-acts {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.ic {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--surface);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.ic:hover {
  border-color: var(--primary-strong, var(--primary));
  background: var(--surface-green);
  color: var(--primary-strong, var(--primary));
}

.ic-sm {
  width: 26px;
  height: 26px;
}

.ic-red {
  color: var(--red);
}

.ic-red:hover {
  background: #fef2f2;
  border-color: #fecaca;
  color: var(--red-dark);
}

/* Orders */
.order-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}

/* ── Order day sections — today's orders in one active list, previous days
   grouped under their order date (collapsed history). Frontend only. ── */
.order-days {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.day-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.day-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 14px;
  border-radius: 10px;
  background: var(--surface);
  border: 1px solid var(--border);
  font-size: 13px;
  font-weight: 800;
  color: var(--primary);
  box-sizing: border-box;
}

.day-section:not(.day-today) .day-head {
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  width: 100%;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.day-section:not(.day-today) .day-head:hover {
  border-color: var(--primary);
  box-shadow: 0 2px 10px var(--primary-glow);
}

.day-title {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}

.day-meta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  opacity: 0.75;
  font-size: 12px;
  font-weight: 700;
}

.day-chev {
  flex-shrink: 0;
  transition: transform 0.18s ease;
}

.day-head.open .day-chev {
  transform: rotate(180deg);
}

.day-empty-note {
  margin: 0;
  padding: 18px 14px;
  text-align: center;
  color: var(--text-dim, #6b7280);
  font-size: 13px;
  border: 1px dashed var(--border);
  border-radius: 10px;
}

/* ── Orders bar: date search + uniform control sizes ────────
   All three controls (date picker, Clear, Refresh) share ONE size
   token --ob-h so they are EXACTLY equal on every breakpoint and in
   both languages. The picker lives inside the AppDatePicker child
   component, so it can only be reached with :deep() (scoped CSS). */
.orders-bar {
  --ob-h: 36px;
}

.orders-bar .bar-acts {
  width: 100%;
}

.orders-bar .bar-refresh {
  margin-left: auto;
  /* Refresh pinned to the end (right side) */
}

.ods-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 700;
  color: var(--muted, #6b7280);
  white-space: nowrap;
}

.orders-date-search {
  display: inline-flex;
  align-items: center;
}

.orders-date-search .dp {
  width: auto;
  height: var(--ob-h);
}

.orders-date-search :deep(.dp-field) {
  width: auto;
  min-width: 160px;
  height: var(--ob-h);
  min-height: var(--ob-h);
  box-sizing: border-box;
}

/* Clear + Refresh: identical boxes in both languages */
.orders-bar .ac {
  width: 120px;
  height: var(--ob-h);
  min-height: var(--ob-h);
  min-width: 0;
  box-sizing: border-box;
  justify-content: center;
}

.ods-clear {
  padding: 0 12px;
}

@media (max-width: 900px) {
  .orders-bar {
    --ob-h: 32px;
  }

  /* small screens: Refresh joins the group on the left
     (margin-left:auto only makes sense on one desktop row) */
  .orders-bar .bar-refresh {
    margin-left: 0;
  }

  .lang {
    width: 32px;
    height: 32px;
  }
}

@media (max-width: 480px) {
  .orders-bar {
    --ob-h: 30px;
  }

  .ods-label {
    width: 100%;
  }
}

/* Search results panel — same header style as day sections */
.order-search {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.search-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 14px;
  border-radius: 10px;
  background: var(--surface);
  border: 1px solid var(--primary);
  font-size: 13px;
  font-weight: 800;
  color: var(--primary);
  box-sizing: border-box;
}

.search-count {
  opacity: 0.75;
  font-size: 12px;
  font-weight: 700;
}

.order-c {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px;
  transition: all 0.25s ease;
}

.order-c:hover {
  /* no translateY: keeps every order card in line */
  border-color: var(--primary-strong, var(--primary));
  box-shadow: 0 4px 16px var(--primary-glow);
}

.order-h {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.order-hl {
  display: flex;
  align-items: center;
  gap: 6px;
}

.order-id {
  font-size: 14px;
  font-weight: 700;
  color: var(--ink);
  /* The clipboard glyph is now an SVG <AppIcon> inside the span */
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.order-t {
  font-size: 11px;
  color: var(--muted);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.order-m {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

.order-time {
  font-size: 10px;
  color: var(--muted-light);
  white-space: nowrap;
}

.order-st {
  font-size: 10px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  flex-shrink: 0;
  white-space: nowrap;
  letter-spacing: 0.2px;
  /* SVG status icon + label */
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.order-st.pending {
  background: #fef3c7;
  color: #92400e;
}

.order-st.confirmed {
  background: #dbeafe;
  color: #1e40af;
}

.order-st.preparing {
  background: #fce7f3;
  color: #9d174d;
}

.order-st.ready {
  background: var(--tint-hover, #dcfce7);
  color: var(--green-dark);
}

.order-st.served {
  background: #d1fae5;
  color: #065f46;
}

.order-st.cancelled {
  background: #fbe9e7;
  color: var(--red);
}

.order-items {
  border-top: 1px solid var(--border-green);
  padding-top: 6px;
}

.order-i {
  display: flex;
  justify-content: space-between;
  padding: 3px 0;
  font-size: 11px;
}

.order-p {
  color: var(--muted);
  font-weight: 600;
}

.order-n {
  margin-top: 4px;
  font-size: 10px;
  color: var(--muted);
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 4px;
}

.order-total {
  margin-top: 6px;
  font-size: 12px;
  color: var(--ink);
}

.order-status-actions {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed var(--border);
}

.order-status-label {
  display: block;
  font-size: 10px;
  font-weight: 600;
  color: var(--muted);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.order-status-btns {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.order-status-btn {
  flex: 1;
  min-width: 0;
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-height: 30px;
  background: var(--surface);
  color: var(--text);
  /* SVG status icon + label */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.order-status-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.order-status-btn.st-preparing {
  background: #fce7f3;
  color: #9d174d;
  border-color: #fbcfe8;
}

.order-status-btn.st-preparing:hover {
  background: #fbcfe8;
  border-color: #f9a8d4;
}

.order-status-btn.st-ready {
  background: var(--tint-hover, #dcfce7);
  color: var(--green-dark);
  border-color: var(--border-green, #bbf7d0);
}

.order-status-btn.st-ready:hover {
  background: var(--border-green, #bbf7d0);
  border-color: #86efac;
}

.order-status-btn.st-served {
  background: #d1fae5;
  color: #065f46;
  border-color: #a7f3d0;
}

.order-status-btn.st-served:hover {
  background: #a7f3d0;
  border-color: #6ee7b7;
}

.order-status-btn.st-cancelled {
  background: #fbe9e7;
  color: var(--red);
  border-color: #fecaca;
}

.order-status-btn.st-cancelled:hover {
  background: #fecaca;
  border-color: #fca5a5;
}

/* ═══ REPORTS TAB ═══ */
/* Filter panel (left) + summary cards (right) — stacks when resized */
.rep-top {
  display: grid;
  grid-template-columns: minmax(250px, 300px) 1fr;
  gap: 16px;
  align-items: start;
  margin-bottom: 16px;
}

.rep-side {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

/* Keep the filter panel pinned in place while the reports column scrolls.
   Desktop-only (the 2-column layout): below 1281px .rep-top stacks into one
   column, and a stuck panel would end up covering the cards underneath.
   `align-items: start` on .rep-top (already set) makes the grid item only as
   tall as its content, which is what gives sticky any room to travel inside
   its much taller grid area. The dropdowns inside teleport to <body>, so the
   max-height / overflow safeguard below cannot clip them. */
@media (min-width: 1281px) {
  .rep-side {
    position: sticky;
    /* clears the sticky header (--hdr-h is its measured height) and, when the
       sidebar is a fixed top/bottom bar, that bar as well (--hdr-stick-top) */
    top: calc(var(--hdr-stick-top, 0px) + var(--hdr-h, 0px) + 16px);
    align-self: start;
    max-height: calc(100vh - var(--hdr-stick-top, 0px) - var(--hdr-h, 0px) - 32px);
    overflow-y: auto;
    overscroll-behavior: contain;
    /* room for the scrollbar so the panel border is never overlapped */
    scrollbar-gutter: stable;
  }

  /* pinned filter panel: surface the card border so the sticky panel reads
     as a self-contained card even when it's flush with the viewport top */
  .rep-side .bar {
    margin: 0;
    padding: 14px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
  }

  /* tighter gap inside the pinned panel */
  .rep-side .rep-controls {
    gap: 12px;
  }
}

.rep-main-col {
  min-width: 0;
}

/* panel card (applies to the .bar inside .rep-side at every breakpoint) */
.rep-side .bar {
  flex-direction: column;
  align-items: stretch;
  gap: 14px;
  margin-bottom: 0;
  padding: 14px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
}

/* segmented controls (presets + groups) */
.rep-presets,
.rep-groups {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  background: #eef2f7;
  padding: 4px;
  border-radius: 12px;
}

.rep-presets .chip,
.rep-groups .chip {
  border: none;
  background: transparent;
  border-radius: 9px;
  min-height: 34px;
  padding: 6px 4px;
  font-size: 11px;
  font-weight: 600;
  color: var(--muted);
  text-align: center;
}

.rep-presets .chip:hover,
.rep-groups .chip:hover {
  transform: none;
  box-shadow: none;
  color: var(--text);
}

.rep-presets .chip.active {
  background: var(--primary);
  border-color: transparent;
  color: #fff;
}

.rep-groups .chip.active {
  background: var(--primary);
  border-color: transparent;
  color: #fff;
}

.rep-controls {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
}

.rep-date {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rep-date span {
  font-size: 10.5px;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0;
  /* keeps Khmer labels tight (no visible gaps) */
}

.rep-date .dp {
  width: 100%;
}

.rep-export {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
}

.rep-export .as-root {
  min-width: 0;
  width: 100%;
}

.rep-export .ac {
  width: 100%;
  justify-content: center;
}

.rep-msg {
  margin: 0;
}

.rep-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  /* breathing room between the summary cards and the chart panel below —
     .rep-panel only carries a bottom margin, so without this the cancelled
     card visually collides with the "ចំណូលតាមរយៈពេល" panel. */
  margin-bottom: 16px;
}

/* the cancelled card spans the full row */
.rep-cards .rep-card:last-child {
  grid-column: 1 / -1;
}

.rep-card {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 100%;
  /* equal height with the sibling card in the row */
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px 16px;
  transition: all 0.25s ease;
}

.rep-card:hover {
  /* no translateY: hovering must not shift the card out of line */
  border-color: var(--primary-strong, var(--primary));
  box-shadow: 0 4px 16px var(--primary-glow);
}

.rep-card-dim {
  opacity: 0.75;
}

.rep-card-i {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.rep-i-teal {
  background: var(--tint-hover, #ccfbf1);
  color: var(--primary-strong, var(--primary));
}

.rep-i-green {
  background: var(--tint-hover, #dcfce7);
  color: var(--green-dark);
}

.rep-i-blue {
  background: #dbeafe;
  color: #1d4ed8;
}

.rep-i-amber {
  background: #fef3c7;
  color: var(--amber);
}

.rep-i-red {
  background: #fee2e2;
  color: var(--red);
}

.rep-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px 18px;
  margin-bottom: 16px;
  min-width: 0;
}

.rep-panel-h {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.rep-panel-h>span:first-child {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
}

.rep-panel-sub {
  font-size: 10.5px;
  color: var(--muted);
}

.rep-two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.rep-two .rep-panel {
  margin-bottom: 16px;
}

.rep-empty {
  font-size: 12px;
  color: var(--muted);
  text-align: center;
  padding: 18px 0;
}

.rep-rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rep-row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.rep-rank {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--surface-green);
  border: 1px solid var(--border-green);
  color: var(--primary-strong, var(--primary));
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.rep-row-b {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rep-row-l {
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rep-row-bar {
  height: 6px;
  border-radius: 999px;
  background: var(--surface-green);
  overflow: hidden;
}

.rep-row-bar span {
  display: block;
  height: 100%;
  min-width: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg,
      var(--primary-strong, var(--primary)),
      var(--primary-light, #14b8a6));
  transition: width 0.4s ease;
}

.rep-row-v {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-shrink: 0;
  justify-content: flex-end;
}

.rep-row-v strong {
  font-size: 12.5px;
  color: var(--ink);
}

.rep-row-v em {
  font-size: 9px;
  font-style: normal;
  color: var(--muted-light);
  text-transform: uppercase;
}

.rep-row-v b {
  font-size: 11px;
  font-weight: 600;
  color: var(--muted);
  white-space: nowrap;
}

/* Empty */
.empty {
  text-align: center;
  padding: 56px 20px;
  color: var(--muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.empty p {
  margin: 0;
  font-size: 13px;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2.5px solid var(--border);
  border-top-color: var(--primary-strong, var(--primary));
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ═══ MODALS ═══ */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.dlg {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 320px;
  padding: 24px 20px;
  text-align: center;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--border-green);
}

.sheet {
  background: var(--surface);
  border-radius: 16px;
  width: 100%;
  max-width: 440px;
  overflow: hidden;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--border-green);
  max-height: 90vh;
  overflow-y: auto;
}

.sheet-h {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid var(--border);
  font-size: 14px;
  font-weight: 700;
  color: var(--ink);
  background: var(--surface-green);
  position: sticky;
  top: 0;
  z-index: 1;
}

.sheet-h span {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--primary-strong, var(--primary));
}

.sheet-b {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.dlg-i {
  color: var(--red);
  margin-bottom: 8px;
  display: flex;
  justify-content: center;
}

.dlg-i-r {
  color: var(--red-dark);
}

.dlg-t {
  font-size: 15px;
  font-weight: 700;
  color: var(--red);
  margin-bottom: 4px;
}

.dlg-d {
  font-size: 12px;
  color: #374151;
  margin-bottom: 16px;
  line-height: 1.5;
}

.dlg-acts {
  display: flex;
  gap: 8px;
}

.dlg-acts .btn {
  flex: 1;
  justify-content: center;
}

.btn {
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;
  min-height: 36px;
  min-width: 70px;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Disabled buttons (e.g. "Installed" in the install-app modal) — clearly not
   clickable, identical treatment to the .ac buttons */
.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn:disabled:hover {
  transform: none;
  box-shadow: none;
}

.btn-g {
  background: var(--surface-green);
  color: var(--ink);
  border: 1px solid var(--border-green);
}

.btn-g:hover {
  background: var(--tint-hover, #dcfce7);
}

.btn-r {
  background: var(--red);
  color: white;
}

.btn-r:hover {
  background: var(--red-dark);
}

.btn-primary {
  background: var(--primary);
  color: var(--on-primary, #fff);
}

.btn-primary:hover {
  background: var(--primary-dark);
  box-shadow: 0 4px 16px var(--primary-glow-strong);
}

.btn-b {
  width: 100%;
  justify-content: center;
}

.btn-sm {
  min-height: 28px;
  min-width: 0;
  padding: 4px 12px;
  font-size: 11px;
  border-radius: 6px;
}

/* Form */
.fld {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.fld-l {
  font-size: 11px;
  font-weight: 600;
  color: var(--muted);
}

.fld-i {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 12px;
  font-family: inherit;
  outline: none;
  color: var(--text);
  transition: all 0.2s ease;
  background: var(--surface);
  box-sizing: border-box;
  min-height: 36px;
}

.fld-i:focus {
  border-color: var(--primary-strong, var(--primary));
  box-shadow: 0 0 0 3px var(--primary-glow);
}

.fld-i.err {
  border-color: var(--red);
  background: #fff8f8;
}

.fld-hint {
  font-size: 11px;
  line-height: 1.5;
  color: var(--muted);
  margin: 6px 0 0;
}

.fld-e {
  font-size: 10px;
  color: var(--red);
}

.msg {
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.msg-s {
  background: var(--surface-green);
  color: var(--green-dark);
  border: 1px solid var(--border-green);
}

.msg-e {
  background: #fef2f2;
  color: var(--red);
  border: 1px solid #fecaca;
}

/* QR */
.qr-r {
  display: flex;
  gap: 8px;
}

.qr-inp {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 999px;
  font-size: 12px;
  font-family: inherit;
  background: var(--surface);
  outline: none;
  transition: all 0.2s ease;
  min-height: 36px;
}

.qr-inp:focus {
  border-color: var(--primary-strong, var(--primary));
  box-shadow: 0 0 0 3px var(--primary-glow);
}

.qr-p {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.qr-p img {
  height: 160px;
  border-radius: 10px;
  border: 2px solid var(--border-green);
  object-fit: contain;
}

.qr-l {
  font-size: 13px;
  font-weight: 700;
  color: var(--ink);
}

.msg-i {
  background: #eff6ff;
  color: var(--blue);
  border: 1px solid #bfdbfe;
}

/* Saved QR list (already "made done" table QRs) */
.qr-saved {
  border-top: 1px dashed var(--border);
  padding-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.qr-saved-h {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--muted);
}

.qr-saved-count {
  background: var(--surface-green);
  border: 1px solid var(--border-green);
  color: var(--primary-strong, var(--primary));
  border-radius: 999px;
  padding: 0 8px;
  font-size: 10px;
  line-height: 18px;
}

.qr-srch {
  max-width: none;
}

.qr-saved-loading {
  display: flex;
  justify-content: center;
  padding: 14px 0;
}

.qr-saved-empty {
  font-size: 11px;
  color: var(--muted);
  text-align: center;
  padding: 12px 0;
  background: var(--surface);
  border: 1px dashed var(--border);
  border-radius: 8px;
}

.qr-saved-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 8px;
  max-height: 264px;
  overflow-y: auto;
}

.qr-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  transition: all 0.2s ease;
}

.qr-item:hover {
  border-color: var(--primary-strong, var(--primary));
  box-shadow: 0 2px 8px var(--primary-glow);
  transform: scale(0.95);
}

.qr-item.active {
  border-color: var(--primary-strong, var(--primary));
  background: var(--surface-green);
}

.qr-item-thumb {
  width: 100%;
  aspect-ratio: 1 / 1;
  min-height: 72px;
  border-radius: 8px;
  border: 1px solid var(--border-green);
  background: var(--surface-green);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  color: var(--primary-strong, var(--primary));
}

.qr-item-thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.qr-item-no {
  font-size: 11px;
  font-weight: 700;
  color: var(--ink);
  white-space: nowrap;
}

.qr-item-date {
  font-size: 9px;
  color: var(--muted-light);
  white-space: nowrap;
}

.qr-item-acts {
  display: flex;
  gap: 4px;
}

/* Profile */
.prof-l {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.prof-p {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid var(--border-green);
  background: var(--surface-green);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
}

.prof-p img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.prof-up {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  background: var(--surface-green);
  border: 1px solid var(--border-green);
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  min-height: 28px;
}

.prof-up:hover {
  background: var(--tint-hover, #dcfce7);
  transform: translateY(-1px);
}

/* Theme color picker */
.swatches {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.layout-options {
  display: flex;
  gap: 8px;
}

.layout-opt {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 9px 4px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--muted);
  cursor: pointer;
  font-family: inherit;
  font-size: 10px;
  font-weight: 600;
  transition: all 0.15s ease;
}

.layout-opt:hover {
  border-color: var(--primary-strong, var(--primary));
  color: var(--primary-strong, var(--primary));
  transform: translateY(-1px);
}

.layout-opt.active {
  border-color: var(--primary-strong, var(--primary));
  background: var(--surface-green);
  color: var(--primary-strong, var(--primary));
  box-shadow: 0 0 0 3px var(--primary-glow);
}

.layout-opt svg {
  flex-shrink: 0;
}

.layout-opt span {
  white-space: nowrap;
}

.swatch {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid var(--border);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.15s ease;
  flex-shrink: 0;
  color: #fff;
}

.swatch:hover {
  transform: scale(1.12);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.18);
}

.swatch.active {
  border-color: var(--ink);
  box-shadow: 0 0 0 3px var(--primary-glow-strong);
  color: var(--on-primary, #fff);
}

.swatch-custom {
  position: relative;
  background: conic-gradient(#ef4444,
      #f59e0b,
      #22c55e,
      #06b6d4,
      #6366f1,
      #ec4899,
      #ef4444);
  color: #fff;
  overflow: hidden;
}

.swatch-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.swatch-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hex-in {
  max-width: 110px;
  font-family: "SFMono-Regular", Consolas, monospace;
  text-transform: lowercase;
}

/* Telegram */
.tg-c {
  background: #fefce8;
  border: 1px solid #fde68a;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 11px;
  color: #92400e;
  line-height: 1.6;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* "Open Telegram" — <a> reusing the primary-button styling; opens the bot
   chat in a new tab (anchors are underlined by default → remove that) */
.tg-open {
  text-decoration: none;
}

.tg-code {
  text-align: center;
}

.tg-lbl {
  font-size: 10px;
  font-weight: 600;
  color: var(--muted);
  margin-bottom: 4px;
  display: block;
}

.tg-box {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--surface-green);
  border: 2px dashed var(--primary-strong, var(--primary));
  border-radius: 8px;
  padding: 6px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tg-box:hover {
  background: var(--tint-hover, #dcfce7);
  border-color: var(--primary-dark);
  transform: scale(1.02);
}

.tg-val {
  font-size: 18px;
  font-weight: 800;
  color: var(--ink);
  letter-spacing: 2px;
  font-family: "SFMono-Regular", Consolas, monospace;
}

.tg-guide {
  font-size: 11px;
  color: var(--primary-strong, var(--primary));
}

.tg-guide summary {
  cursor: pointer;
  font-weight: 600;
  padding: 3px 0;
}

.tg-guide summary:hover {
  color: var(--primary-dark);
}

.tg-steps {
  background: var(--surface-green);
  border: 1px solid var(--border-green);
  border-radius: 8px;
  padding: 10px;
  margin-top: 4px;
}

.tg-step {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
  font-size: 11px;
  color: var(--text);
}

.tg-step:last-child {
  margin-bottom: 0;
}

.step-n {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--primary);
  color: var(--on-primary, #fff);
  font-size: 8px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tg-step code {
  background: var(--surface-green);
  padding: 1px 4px;
  border-radius: 4px;
  color: var(--primary-strong, var(--primary));
}

.tg-linked {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--surface-green);
  border: 1px solid var(--border-green);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 11px;
  color: var(--green-dark);
  flex-wrap: wrap;
  gap: 8px;
}

.tg-linked span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tg-warn {
  background: #fefce8;
  border: 1px solid #fde68a;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 11px;
  color: #92400e;
  text-align: center;
}

/* Devices (access log) */
.dev-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.dev-count {
  font-size: 12px;
  font-weight: 700;
  color: var(--ink);
}

.dev-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dev-c {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 10px 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  transition: all 0.2s ease;
}

.dev-c:hover {
  border-color: var(--primary-strong, var(--primary));
  box-shadow: 0 2px 8px var(--primary-glow);
}

.dev-c.current {
  border-color: var(--border-green);
  background: var(--surface-green);
}

.dev-c.revoked {
  opacity: 0.6;
}

.dev-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: var(--tint-hover, #ccfbf1);
  color: var(--primary-strong, var(--primary));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dev-b {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dev-name {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.dev-n {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--ink);
}

.dev-badge {
  font-size: 9px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
}

.dev-badge-cur {
  background: var(--primary);
  color: var(--on-primary, #fff);
}

.dev-badge-rev {
  background: #fef2f2;
  color: var(--red);
  border: 1px solid #fecaca;
}

.dev-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dev-kv {
  font-size: 10.5px;
  color: var(--muted);
  line-height: 1.5;
  word-break: break-word;
}

.dev-kv strong {
  color: var(--text);
  font-weight: 600;
}

.dev-kv-rev {
  color: var(--red);
}

.dev-c .ic {
  flex-shrink: 0;
}

/* Security flags (VPN / hosting IP) */
.dev-flags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.dev-flag {
  font-size: 9px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fde68a;
  flex-shrink: 0;
  /* SVG warning icon + label */
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

/* Details toggle + expanded forensic details */
.dev-details-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  align-self: flex-start;
  padding: 3px 8px;
  border: 1px solid var(--border-green);
  border-radius: 6px;
  background: var(--surface-green);
  color: var(--primary-strong, var(--primary));
  font-family: inherit;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dev-details-btn:hover {
  background: var(--tint-hover, #dcfce7);
}

.dev-details-btn svg {
  transition: transform 0.2s ease;
}

.dev-details-btn svg.flip {
  transform: rotate(180deg);
}

.dev-details {
  display: flex;
  flex-direction: column;
  gap: 3px;
  background: var(--surface-green);
  border: 1px dashed var(--border-green);
  border-radius: 8px;
  padding: 8px 10px;
}

.dev-kv-ua strong {
  font-family: "SFMono-Regular", Consolas, monospace;
  font-weight: 500;
  font-size: 9px;
}

/* Login history (audit trail) */
.dev-hist {
  border-top: 1px dashed var(--border);
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dev-hist-h {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--muted);
}

.dev-hist-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 220px;
  overflow-y: auto;
}

.dev-hist-i {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 7px 9px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.dev-hist-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 4px;
  flex-shrink: 0;
  background: var(--primary);
}

.dev-hist-dot.m-google {
  background: #db4437;
}

.dev-hist-b {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.dev-hist-l1 {
  font-size: 11px;
  color: var(--text);
}

.dev-hist-l2,
.dev-hist-l3 {
  font-size: 10px;
  color: var(--muted);
}

.dev-hist-l3 {
  color: var(--muted-light);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
}

/* ════════════════════════════════════════════════
   RESPONSIVE BREAKPOINTS
   ════════════════════════════════════════════════ */

/* Tablets and smaller desktops */
@media (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .metrics {
    gap: 10px;
  }

  .main {
    padding: 0px 24px 50px;
  }
}

/* Tablets and large phones */
@media (max-width: 900px) {
  .root {
    grid-template-columns: 1fr;
    --mob-h: 48px;
    /* reduced from 53px for tighter mobile header */
    /* the sticky page header parks right below the mobile bar */
    --hdr-stick-top: var(--mob-h);
  }

  /* Mobile Header styles moved to @/components/admin/AdminMobileBar.vue */

  /* Sidebar - Slide out */
  .side {
    position: fixed;
    left: 0;
    top: 0;
    width: 260px;
    /* reduced from 280px */
    max-width: 85vw;
    z-index: 220;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    height: 100vh;
    border-right: 1px solid var(--border);
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.08);
  }

  .nav-open .side {
    transform: translateX(0);
  }

  .nav-open .scrim {
    display: block;
    opacity: 1;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 210;
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
  }

  .main {
    padding: 12px 14px 32px;
    /* reduced horizontal padding, tighter bottom */
  }

  /* Hide text on small screens */
  .hdr-hide {
    display: none;
  }

  /* Metrics - 2 columns with tighter spacing */
  .metrics {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    /* reduced from 10px */
    margin-bottom: 16px;
    /* reduced from 28px */
  }

  .metric {
    padding: 12px 14px;
    /* reduced from 14px 16px */
  }

  .metric-icon {
    width: 32px;
    /* reduced from 36px */
    height: 32px;
    /* reduced from 36px */
  }

  .metric-v {
    font-size: 17px;
    /* reduced from 18px */
  }

  /* Grid - 3 columns */
  .grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    /* reduced from 10px */
  }

  /* Toolbar - stack with tighter gaps */
  .bar {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
    /* reduced from 8px */
    margin-bottom: 12px;
    /* reduced from 18px */
  }

  .bar-acts {
    flex-wrap: wrap;
  }

  .bar-scroll {
    order: 2;
  }

  .srch {
    min-width: 0;
    flex: 1;
    max-width: none;
  }

  /* Orders - 1 column */
  .order-grid {
    grid-template-columns: 1fr;
    gap: 8px;
    /* reduced from 12px */
  }

  /* Categories */
  .cat-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    /* reduced minmax */
    gap: 8px;
    /* reduced from 10px */
  }

  /* Buttons - smaller on mobile */
  .ac {
    padding: 5px 10px;
    /* reduced from 6px 12px */
    font-size: 10px;
    /* reduced from 11px */
    min-height: 28px;
    /* reduced from 32px */
    min-width: 28px;
    /* reduced from 32px */
  }

  .hdr-r .ac {
    padding: 5px 8px;
    /* reduced from 6px 10px */
  }

  .ac span {
    max-width: 70px;
    /* reduced from 80px */
  }

  .hdr-r .ac-avatar {
    width: 32px;
    /* reduced from 32px */
    height: 32px;
    /* reduced from 32px */
    min-width: 28px;
    /* reduced from 32px */
    padding: 5px;
    /* reduced from 6px */
  }

  .ac-icon-only {
    padding: 5px 6px;
    /* reduced from 6px 8px */
  }

  .btn {
    min-height: 30px;
    /* reduced from 34px */
    min-width: 50px;
    /* reduced from 60px */
    font-size: 10px;
    /* reduced from 11px */
    padding: 5px 10px;
    /* reduced from 6px 12px */
  }

  /* Header — tighter spacing to reduce top space */
  .hdr {
    padding: 12px 0 16px;
    /* reduced from 14px 0px 40px */
    margin-bottom: 12px;
    /* reduced from 16px */
    align-items: flex-start;
    /* changed from stretch for better alignment */
    gap: 6px;
    /* reduced from 8px */
  }

  .hdr-title {
    font-size: 18px;
    /* reduced from 20px */
  }

  .hdr-r {
    flex-wrap: wrap;
    gap: 4px;
    /* reduced from 6px */
  }

  /* Menu strip tighter on mobile */
  .menustrip {
    padding: 8px 12px;
    /* reduced from 10px 14px */
    margin-bottom: 12px;
    /* reduced from 18px */
  }
}

/* Small phones */
@media (max-width: 480px) {
  .main {
    padding: 10px 10px 24px;
    /* reduced from 12px 10px 32px */
  }

  .hdr-title {
    font-size: 16px;
    /* reduced from 18px */
  }

  .hdr {
    padding: 10px 0 12px;
    /* reduced for very small screens */
    margin-bottom: 10px;
    /* reduced from 12px */
  }

  /* Metrics - 1 column on very small screens */
  .metrics {
    grid-template-columns: 1fr;
    gap: 6px;
    /* reduced from 8px */
    margin-bottom: 12px;
    /* reduced from 16px */
  }

  .metric {
    padding: 10px 12px;
    /* reduced from 12px 14px */
  }

  .metric-v {
    font-size: 16px;
    /* reduced from 17px */
  }

  /* Grid - 2 columns */
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
    /* reduced from 8px */
  }

  /* Categories - 1 column */
  .cat-grid {
    grid-template-columns: 1fr;
    gap: 6px;
    /* reduced from 8px */
  }

  /* Orders */
  .order-c {
    padding: 10px;
    /* reduced from 12px */
  }

  /* Modals - full width */
  .sheet {
    max-width: 100%;
    margin: 6px;
    /* reduced from 8px */
    border-radius: 10px;
    /* reduced from 12px */
  }

  .sheet-h {
    padding: 12px 14px;
    /* reduced from 14px 16px */
    font-size: 12px;
    /* reduced from 13px */
  }

  .sheet-b {
    padding: 12px;
    /* reduced from 14px */
    gap: 10px;
    /* reduced from 12px */
  }

  .dlg {
    padding: 16px 14px;
    /* reduced from 20px 16px */
  }

  /* QR */
  .qr-r {
    flex-direction: column;
    gap: 6px;
    /* reduced from 8px */
  }

  .qr-p img {
    width: 120px;
    /* reduced from 140px */
    height: 120px;
    /* reduced from 140px */
  }

  /* Chips - wrap */
  .bar-scroll {
    gap: 4px;
  }

  .chip {
    padding: 3px 8px;
    /* reduced from 4px 10px */
    font-size: 9px;
    /* reduced from 10px */
    min-height: 24px;
    /* reduced from 26px */
  }

  /* Buttons - even smaller */
  .ac {
    padding: 3px 8px;
    /* reduced from 4px 10px */
    font-size: 9px;
    /* reduced from 10px */
    min-height: 24px;
    /* reduced from 28px */
    min-width: 24px;
    /* reduced from 28px */
  }

  .ac span {
    max-width: 50px;
    /* reduced from 60px */
  }

  .hdr-r .ac-avatar {
    width: 32px;
    /* reduced from 28px */
    height: 32px;
    /* reduced from 28px */
    min-width: 32px;
    /* reduced from 28px */
    padding: 3px;
    /* reduced from 4px */
  }

  .ac-icon-only {
    padding: 3px 4px;
    /* reduced from 4px 6px */
  }

  .btn {
    min-height: 26px;
    /* reduced from 30px */
    min-width: 40px;
    /* reduced from 50px */
    font-size: 9px;
    /* reduced from 10px */
    padding: 3px 8px;
    /* reduced from 4px 10px */
  }

  .fld-i {
    min-height: 28px;
    /* reduced from 32px */
    font-size: 10px;
    /* reduced from 11px */
    padding: 5px 6px;
    /* reduced from 6px 8px */
  }

  .qr-inp {
    min-height: 28px;
    /* reduced from 32px */
    font-size: 10px;
    /* reduced from 11px */
    padding: 5px 8px;
    /* reduced from 6px 10px */
  }

  /* Menu strip tighter on small phones */
  .menustrip {
    padding: 6px 10px;
    /* reduced from 8px 12px */
    margin-bottom: 8px;
    /* reduced from 12px */
  }
}

/* Very small phones */
@media (max-width: 380px) {
  .main {
    padding: 8px 6px 20px;
    /* reduced from 10px 10px 24px */
  }

  .grid {
    grid-template-columns: 1fr;
    gap: 4px;
    /* reduced from 6px */
  }

  .hdr-r {
    gap: 2px;
    /* reduced from 4px */
  }

  .ac span {
    max-width: 35px;
    /* reduced from 40px */
  }

  .metrics {
    gap: 4px;
    /* reduced from 6px */
  }

  .metric {
    padding: 8px 10px;
    /* reduced from 10px 12px */
  }
}

/* Landscape phones */
@media (max-height: 600px) and (orientation: landscape) {
  .side {
    padding-bottom: 6px;
    /* reduced from 10px */
  }

  .side-top {
    padding: 8px 12px 6px;
    /* reduced from 12px 16px 10px */
  }

  .side-nav {
    padding: 4px 6px;
    /* reduced from 6px 8px */
    gap: 0px;
    /* reduced from 1px */
  }

  .nav-i {
    padding: 4px 8px;
    /* reduced from 6px 10px */
    min-height: 26px;
    /* reduced from 32px */
    font-size: 11px;
    /* reduced from 12px */
  }

  .side-foot {
    padding: 6px 10px 8px;
    /* reduced from 8px 12px 12px */
  }

  .main {
    padding: 8px 12px 20px;
    /* reduced from 0px 16px 30px */
  }

  .metrics {
    gap: 4px;
    /* reduced from 6px */
    margin-bottom: 10px;
    /* reduced from 16px */
  }

  .metric {
    padding: 8px 10px;
    /* reduced from 10px 12px */
  }

  .metric-icon {
    width: 26px;
    /* reduced from 30px */
    height: 26px;
    /* reduced from 30px */
  }

  .metric-v {
    font-size: 14px;
    /* reduced from 16px */
  }

  .hdr {
    padding: 8px 0 10px;
    /* tighter header for landscape */
    margin-bottom: 8px;
    /* reduced from 12px */
  }

  .hdr-title {
    font-size: 16px;
    /* reduced from 18px */
  }
}

/* ─── PWA install (owners "download the web as an app") ─── */
.ins-desc {
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--muted);
  margin: 0;
}

.ins-steps {
  background: var(--surface-green);
  border: 1px solid var(--border-green);
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* waiting state while the browser readies beforeinstallprompt */
.ins-spin {
  width: 14px;
  height: 14px;
  border-width: 2px;
}

.ins-wait {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 11.5px;
  color: var(--muted);
}

.ins-hint {
  font-size: 11.5px;
  color: var(--muted);
  text-align: center;
  padding: 8px 0 2px;
}

/* --- Settings > Push notifications (this device) --- */
.push-fld {
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border, #e2e8e2);
  margin-bottom: 14px;
}

.push-desc {
  font-size: 11.5px;
  color: var(--text-light, #6a8f6a);
  line-height: 1.5;
  margin: 4px 0 10px;
}

.push-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.push-state {
  font-size: 12px;
  font-weight: 700;
  /* SVG bell icon (enabled state) + label */
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.push-st-enabled {
  color: var(--green-mid, #2d7a2d);
}

.push-st-disabled,
.push-st-unsupported,
.push-st-not_configured {
  color: var(--text-light, #6a8f6a);
}

.push-st-blocked {
  color: var(--red, #ef4444);
}

/* ─── Reports tab: responsive ─── */
@media (max-width: 1280px) {

  /* narrow: filters stack above the cards (like the resized mock) */
  .rep-top {
    grid-template-columns: 1fr;
  }

  .rep-main-col {
    border-top: 1px dashed var(--border);
    padding-top: 14px;
  }
}

@media (max-width: 900px) {
  .rep-two {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .main {
    padding: 0px 16px 40px;
  }
}

@media (max-width: 420px) {
  .rep-cards {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .rep-cards .rep-card:last-child {
    grid-column: auto;
  }

  .rep-panel {
    padding: 14px;
  }
}
</style>
