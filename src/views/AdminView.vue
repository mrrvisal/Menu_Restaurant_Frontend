<!-- ═══════════════════════════════════════════════════════════
   AdminView — v3.3 Fully Responsive
   Fix: Complete responsive redesign
   ═══════════════════════════════════════════════════════════ -->
<template>
  <div
    class="root"
    :class="['layout-' + (sidebarPosition || 'left'), { 'nav-open': showMobile }]"
  >
    <!-- ─── MOBILE BAR ─── -->
    <header class="mob">
      <div class="mob-info">
        <div class="mob-av"><img :src="restaurantLogo" alt="" /></div>
        <span class="mob-label">{{
          auth.restaurant?.name || "ភោជនីយដ្ឋាន"
        }}</span>
      </div>
      <button
        class="mob-btn"
        @click="showMobile = !showMobile"
        aria-label="Menu"
        :aria-expanded="showMobile"
        aria-controls="admin-sidebar"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
    </header>

    <!-- ─── SIDEBAR ─── -->
    <aside class="side" id="admin-sidebar">
      <div class="side-top">
        <div class="side-brand">
          <div class="side-icon"><img :src="restaurantLogo" alt="" /></div>
          <div class="side-meta">
            <span class="side-name">{{
              auth.restaurant?.name || "ភោជនីយដ្ឋាន"
            }}</span>
          </div>
        </div>

        <!-- Restaurant Switcher (one account may manage many restaurants) -->
        <div class="side-rest" v-if="auth.restaurants.length > 1">
          <AppSelect
            block
            size="sm"
            tone="soft"
            variant="teal"
            :model-value="auth.restaurantId"
            :options="auth.restaurants"
            option-value="id"
            option-label="name"
            @update:model-value="onSwitchRestaurant"
          />
        </div>
        <button class="side-add-rest" @click="openAddRestaurant">
          + {{ i18n.t.add_restaurant || "បន្ថែមភោជនីយដ្ឋាន" }}
        </button>
      </div>

      <nav class="side-nav">
        <button
          class="nav-i"
          :class="{ active: adminTab === 'foods' }"
          @click="
            adminTab = 'foods';
            showMobile = false;
          "
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              d="M3 11h18M3 11v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8M3 11V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"
            />
          </svg>
          <span>{{ i18n.t.foods }}</span>
        </button>
        <button
          class="nav-i"
          :class="{ active: adminTab === 'categories' }"
          @click="
            adminTab = 'categories';
            showMobile = false;
          "
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v11z"
            />
          </svg>
          <span>{{ i18n.t.categories }}</span>
        </button>
        <button
          class="nav-i"
          :class="{ active: adminTab === 'orders' }"
          @click="
            adminTab = 'orders';
            fetchOrders();
            showMobile = false;
          "
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
            />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          </svg>
          <span>{{ i18n.t.orders }}</span>
          <span v-if="orders.length" class="nav-badge">{{
            orders.length
          }}</span>
        </button>
      </nav>

      <div class="side-foot">
        <button class="lang" @click="i18n.toggleLocale">
          {{ i18n.locale === "km" ? "EN" : "ខ្មែរ" }}
        </button>
        <button class="logout" @click="loggingOut = true">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
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
      <!-- Header -->
      <div class="hdr">
        <div class="hdr-l">
          <h1 class="hdr-title">
            {{
              adminTab === "foods"
                ? i18n.t.foods
                : adminTab === "categories"
                ? i18n.t.categories
                : i18n.t.orders
            }}
          </h1>
        </div>
        <div class="hdr-r">
          <button
            class="ac ac-ghost ac-icon-only"
            @click="openQR"
            :title="i18n.t.generate_qr"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
            <span class="hdr-hide">{{ i18n.t.generate_qr }}</span>
          </button>
          <button
            class="ac ac-ghost ac-icon-only"
            @click="openDevices"
            :title="i18n.t.devices"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path
                d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
              />
              <polyline points="9 12 11 14 15 10" />
            </svg>
            <span class="hdr-hide">{{ i18n.t.devices }}</span>
          </button>
          <button
            class="ac ac-ghost ac-icon-only"
            @click="openTelegramSettings()"
            :title="i18n.t.telegram"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path d="m21 4-4.5 16-5.2-5.1L7 19l1.2-6L3 10.8 21 4Z" />
            </svg>
            <span v-if="!isLinked" class="hdr-dot"></span>
            <span class="hdr-hide">{{ i18n.t.telegram }}</span>
          </button>
          <button class="ac ac-primary" @click="openPreview">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span class="hdr-hide">{{ i18n.t.owner_preview }}</span>
          </button>
          <button
            class="ac ac-primary ac-avatar"
            @click="openProfile"
            :title="i18n.t.profile"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Metrics -->
      <div class="metrics">
        <div class="metric metric-teal">
          <div class="metric-icon mi-teal">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path d="M3 3v18h18" />
              <path d="M18 17V9" />
              <path d="M13 17V5" />
              <path d="M8 17v-3" />
            </svg>
          </div>
          <div class="metric-b">
            <span class="metric-v"
              >{{ Number(stats.totalRevenue || 0).toLocaleString() }}៛</span
            >
            <span class="metric-l">{{ i18n.t.revenue }}</span>
          </div>
          <div class="metric-glow"></div>
        </div>
        <div class="metric metric-green">
          <div class="metric-icon mi-green">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path
                d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
              />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            </svg>
          </div>
          <div class="metric-b">
            <span class="metric-v">{{ stats.totalOrders || 0 }}</span>
            <span class="metric-l">{{ i18n.t.orders }}</span>
          </div>
          <div class="metric-glow"></div>
        </div>
        <div class="metric metric-amber">
          <div class="metric-icon mi-amber">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
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
            <button
              class="btn btn-primary btn-sm"
              :disabled="menuCreating"
              @click="ensureDefaultMenu()"
            >
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
            <button
              v-for="cat in foods.categories"
              :key="cat.id"
              class="chip"
              :class="{ active: curCat === cat.id }"
              @click="
                curCat = cat.id;
                load();
              "
            >
              {{ cat.label_km }}
            </button>
          </div>
          <div class="bar-acts">
            <div class="srch">
              <svg
                class="srch-i"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                v-model="searchQ"
                :placeholder="i18n.t.search"
                @input="load()"
              />
              <button
                v-if="searchQ"
                class="srch-x"
                aria-label="Clear search"
                @click="
                  searchQ = '';
                  load();
                "
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <button class="ac ac-primary" @click="openAdd">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
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
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1"
            opacity=".3"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <p>{{ searchQ ? "រកមិនឃើញ" : i18n.t.no_data }}</p>
          <button v-if="!searchQ" class="ac ac-primary" @click="openAdd">
            {{ i18n.t.add_food }}
          </button>
        </div>
        <div v-else class="grid">
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
      </template>

      <!-- ──────── CATEGORIES ──────── -->
      <template v-if="adminTab === 'categories'">
        <div class="bar">
          <div class="bar-acts">
            <button class="ac ac-primary" @click="openCatForm()">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              {{ i18n.t.add_category }}
            </button>
          </div>
        </div>
        <div v-if="!foods.categories.length" class="empty">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1"
            opacity=".3"
          >
            <path
              d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v11z"
            />
          </svg>
          <p>{{ i18n.t.no_data }}</p>
        </div>
        <div v-else class="cat-grid">
          <div v-for="cat in foods.categories" :key="cat.id" class="cat-c">
            <span class="cat-n">{{ cat.label_km }}</span>
            <div class="cat-acts">
              <button
                class="ic ic-sm"
                aria-label="Edit category"
                @click="openCatForm(cat)"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path
                    d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                  />
                  <path
                    d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                  />
                </svg>
              </button>
              <button
                class="ic ic-sm ic-red"
                aria-label="Delete category"
                @click="confirmDelCat(cat)"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path
                    d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- ──────── ORDERS ──────── -->
      <template v-if="adminTab === 'orders'">
        <div class="bar">
          <div class="bar-acts">
            <span class="bar-count"
              >{{ orders.length }} {{ i18n.t.orders }}</span
            >
            <button
              class="ac ac-ghost"
              :disabled="ordersLoading"
              @click="fetchOrders"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {{ ordersLoading ? i18n.t.loading : i18n.t.refresh || "Refresh" }}
            </button>
          </div>
        </div>
        <div v-if="ordersLoading" class="empty">
          <div class="spinner"></div>
          <p>{{ i18n.t.loading }}</p>
        </div>
        <div v-else-if="!orders.length" class="empty">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1"
            opacity=".3"
          >
            <path
              d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
            />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          </svg>
          <p>{{ i18n.t.no_data }}</p>
        </div>
        <div v-else class="order-grid">
          <div v-for="order in orders" :key="order.id" class="order-c">
            <div class="order-h">
              <div class="order-hl">
                <span class="order-id">#{{ order.id }}</span>
                <span class="order-t"
                  ><svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="9" y1="3" x2="9" y2="9" />
                  </svg>
                  {{ i18n.t.table }} {{ order.table_no }}</span
                >
              </div>
              <div class="order-m">
                <span class="order-st" :class="order.status">{{
                  statusLabel(order.status)
                }}</span>
                <span class="order-time">{{
                  formatDate(order.created_at)
                }}</span>
              </div>
            </div>
            <div class="order-items">
              <div
                v-for="(item, idx) in parseItems(order.items)"
                :key="idx"
                class="order-i"
              >
                <span>{{ item.name }}</span>
                <span class="order-p"
                  >{{ item.qty }} ×
                  {{ Number(item.price).toLocaleString() }}៛</span
                >
              </div>
            </div>
            <div v-if="order.note" class="order-n">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              {{ order.note }}
            </div>
            <div class="order-total">
              {{ i18n.t.total }}:
              <strong>{{ Number(order.total).toLocaleString() }}៛</strong>
            </div>
            <div v-if="getStatusOptions(order.status).length" class="order-status-actions">
              <span class="order-status-label">{{ i18n.t.change_status || "ប្តូរស្ថានភាព" }}:</span>
              <div class="order-status-btns">
                <button
                  v-for="s in getStatusOptions(order.status)"
                  :key="s"
                  class="order-status-btn"
                  :class="'st-' + s"
                  @click="updateOrderStatus(order.id, s)"
                >
                  {{ statusLabel(s) }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </main>

    <!-- ═══════ MODALS ═══════ -->

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

    <!-- Add Restaurant (one account → many restaurants) -->
    <Teleport to="body"
      ><Transition name="fade">
        <div
          v-if="showAddRestaurant"
          class="overlay"
          @click.self="showAddRestaurant = false"
        >
          <div class="sheet">
            <div class="sheet-h">
              <span
                ><svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path
                    d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4M9 11h.01M15 11h.01M9 15h.01M15 15h.01"
                  />
                </svg>
                {{ i18n.t.create_restaurant || "New Restaurant" }}</span
              ><button
                class="ic"
                aria-label="Close"
                @click="showAddRestaurant = false"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
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
                <label class="fld-l"
                  >{{ i18n.t.restaurant_name }} *</label
                >
                <input
                  v-model="addRestaurantName"
                  class="fld-i"
                  :placeholder="i18n.t.restaurant_name_ph || ''"
                  @keyup.enter="submitAddRestaurant"
                />
              </div>
              <button
                class="btn btn-primary btn-b"
                :disabled="addRestaurantSubmitting"
                @click="submitAddRestaurant"
              >
                {{
                  addRestaurantSubmitting
                    ? i18n.t.loading
                    : i18n.t.add_restaurant
                }}
              </button>
            </div>
          </div>
        </div>
      </Transition></Teleport
    >

    <!-- Delete Food -->
    <Teleport to="body"
      ><Transition name="fade">
        <div
          v-if="deletingFood"
          class="overlay"
          @click.self="deletingFood = null"
        >
          <div class="dlg">
            <div class="dlg-i">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <polyline points="3 6 5 6 21 6" />
                <path
                  d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                />
              </svg>
            </div>
            <div class="dlg-t">លុបម្ហូបនេះ?</div>
            <div class="dlg-d">{{ deletingFood.name }}</div>
            <div class="dlg-acts">
              <button class="btn btn-g" @click="deletingFood = null">
                {{ i18n.t.cancel }}</button
              ><button class="btn btn-r" @click="doDelete">
                {{ i18n.t.delete }}
              </button>
            </div>
          </div>
        </div>
      </Transition></Teleport
    >

    <!-- Delete Category -->
    <Teleport to="body"
      ><Transition name="fade">
        <div
          v-if="deletingCat"
          class="overlay"
          @click.self="deletingCat = null"
        >
          <div class="dlg">
            <div class="dlg-i">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <polyline points="3 6 5 6 21 6" />
                <path
                  d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                />
              </svg>
            </div>
            <div class="dlg-t">លុបប្រភេទនេះ?</div>
            <div class="dlg-d">{{ deletingCat.label_km }}</div>
            <div class="dlg-acts">
              <button class="btn btn-g" @click="deletingCat = null">
                {{ i18n.t.cancel }}</button
              ><button class="btn btn-r" @click="doDeleteCat">
                {{ i18n.t.delete }}
              </button>
            </div>
          </div>
        </div>
      </Transition></Teleport
    >

    <!-- Logout -->
    <Teleport to="body"
      ><Transition name="fade">
        <div v-if="loggingOut" class="overlay" @click.self="loggingOut = false">
          <div class="dlg">
            <div class="dlg-i dlg-i-r">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div class="dlg-t">{{ i18n.t.logout }}</div>
            <div class="dlg-d">{{ i18n.t.confirm_logout }}</div>
            <div class="dlg-acts">
              <button class="btn btn-g" @click="loggingOut = false">
                {{ i18n.t.cancel }}</button
              ><button class="btn btn-r" @click="confirmLogout">
                {{ i18n.t.logout }}
              </button>
            </div>
          </div>
        </div>
      </Transition></Teleport
    >

    <!-- QR -->
    <Teleport to="body"
      ><Transition name="fade">
        <div v-if="showQR" class="overlay" @click.self="showQR = false">
          <div class="sheet">
            <div class="sheet-h">
              <span
                ><svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
                {{ i18n.t.generate_qr }}</span
              ><button class="ic" aria-label="Close" @click="showQR = false">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div class="sheet-b">
              <div class="qr-r">
                <input
                  v-model="qrTableNumber"
                  type="number"
                  min="1"
                  :placeholder="i18n.t.table_no"
                  class="qr-inp"
                  @keyup.enter="generateQR"
                /><button
                  class="btn btn-primary"
                  :disabled="qrLoading"
                  @click="generateQR"
                >
                  {{ qrLoading ? i18n.t.generating : i18n.t.generate || "Generate" }}
                </button>
              </div>
              <div v-if="qrError" class="msg msg-e">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {{ qrError }}
              </div>
              <div v-if="qrInfo" class="msg msg-i">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                {{ qrInfo }}
              </div>
              <div v-if="qrCodeDataUrl" class="qr-p">
                <img :src="qrCodeDataUrl" :alt="'QR ' + qrTableNumber" /><span
                  class="qr-l"
                  >{{ i18n.t.table }} {{ qrTableNumber }}</span
                ><button class="btn btn-primary" @click="downloadQR">
                  {{ i18n.t.download_qr || "Download" }}
                </button>
              </div>

              <!-- ─── SAVED QR CODES (already "made done") ─── -->
              <div class="qr-saved">
                <div class="qr-saved-h">
                  <span>{{ i18n.t.saved_qr_list || "Saved QR codes" }}</span>
                  <span
                    v-if="!qrListLoading && savedQrs.length"
                    class="qr-saved-count"
                    >{{ savedQrs.length }}</span
                  >
                </div>
                <div class="srch qr-srch">
                  <svg
                    class="srch-i"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  <input
                    v-model="qrSearch"
                    :placeholder="
                      i18n.t.search_table || 'Search table number...'
                    "
                  />
                  <button
                    v-if="qrSearch"
                    class="srch-x"
                    aria-label="Clear table search"
                    @click="qrSearch = ''"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
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
                <div
                  v-else-if="!filteredSavedQrs.length"
                  class="qr-saved-empty"
                >
                  {{
                    qrSearch
                      ? i18n.t.no_search_result || "No results"
                      : i18n.t.no_saved_qr || "No saved QR codes yet"
                  }}
                </div>
                <div v-else class="qr-saved-grid">
                  <div
                    v-for="qr in filteredSavedQrs"
                    :key="qr.id"
                    class="qr-item"
                    :class="{ active: selectedSavedNo === qr.table_no }"
                  >
                    <div class="qr-item-thumb" @click="previewSavedQr(qr)">
                      <img
                        v-if="qr._dataUrl"
                        :src="qr._dataUrl"
                        :alt="'QR ' + qr.table_no"
                      />
                      <svg
                        v-else
                        width="26"
                        height="26"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                      >
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                      </svg>
                    </div>
                    <span class="qr-item-no"
                      >{{ i18n.t.table }} {{ qr.table_no }}</span
                    >
                    <span class="qr-item-date">{{
                      formatQrDate(qr.created_at)
                    }}</span>
                    <div class="qr-item-acts">
                      <button
                        class="ic ic-sm"
                        :title="i18n.t.preview || 'Preview'"
                        :aria-label="'Preview QR ' + qr.table_no"
                        @click="previewSavedQr(qr)"
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.5"
                        >
                          <path
                            d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"
                          />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                      <button
                        class="ic ic-sm"
                        :title="i18n.t.download_qr || 'Download'"
                        :aria-label="'Download QR ' + qr.table_no"
                        @click="downloadSavedQr(qr)"
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.5"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      </button>
                      <button
                        class="ic ic-sm ic-red"
                        :title="i18n.t.delete || 'Delete'"
                        :aria-label="'Delete QR ' + qr.table_no"
                        @click="confirmDelQr(qr)"
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.5"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path
                            d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition></Teleport
    >

    <!-- Delete QR -->
    <Teleport to="body"
      ><Transition name="fade">
        <div v-if="deletingQr" class="overlay" @click.self="deletingQr = null">
          <div class="dlg">
            <div class="dlg-i">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <polyline points="3 6 5 6 21 6" />
                <path
                  d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                />
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
                {{ i18n.t.cancel }}</button
              ><button class="btn btn-r" @click="doDeleteQr">
                {{ i18n.t.delete }}
              </button>
            </div>
          </div>
        </div>
      </Transition></Teleport
    >

    <!-- Telegram -->
    <Teleport to="body"
      ><Transition name="fade">
        <div
          v-if="showTelegramSettings"
          class="overlay"
          @click.self="showTelegramSettings = false"
        >
          <div class="sheet">
            <div class="sheet-h">
              <span
                ><svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path d="m21 4-4.5 16-5.2-5.1L7 19l1.2-6L3 10.8 21 4Z" />
                </svg>
                {{ i18n.t.telegram_settings }}</span
              ><button
                class="ic"
                aria-label="Close"
                @click="showTelegramSettings = false"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div class="sheet-b">
              <div v-if="tgSuccess" class="msg msg-s">{{ tgSuccess }}</div>
              <div v-if="tgError" class="msg msg-e">{{ tgError }}</div>
              <div class="tg-c">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {{ i18n.t.connect_telegram }}<br />
              </div>
              <div class="tg-code">
                <span class="tg-lbl">{{
                  i18n.t.link_code || "Link Code"
                }}</span>
                <div class="tg-box" @click="copyLinkCode">
                  <code class="tg-val">{{ displayLinkCode }}</code
                  ><button class="ic" aria-label="Copy link code">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                    >
                      <path
                        d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
                      />
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
                    <code>/link {{ displayLinkCode }}</code>
                  </div>
                  <div class="tg-step">
                    <span class="step-n">5</span> {{ i18n.t.tg_step_done }}
                  </div>
                </div>
              </details>
              <div v-if="isLinked" class="tg-linked">
                <span
                  ><svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  {{ i18n.t.connected }}</span
                ><button class="btn btn-g" @click="unlinkTelegram">
                  {{ i18n.t.unlink || "Unlink" }}
                </button>
              </div>
              <div v-else class="tg-warn"><AppIcon name="alert-circle" :size="14" /> {{ i18n.t.not_connected_yet }}</div>
            </div>
          </div>
        </div>
      </Transition></Teleport
    >

    <!-- Devices (access log) -->
    <Teleport to="body"
      ><Transition name="fade">
        <div
          v-if="showDevices"
          class="overlay"
          @click.self="showDevices = false"
        >
          <div class="sheet">
            <div class="sheet-h">
              <span
                ><svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
                {{ i18n.t.device_list || "Devices with access" }}</span
              ><button
                class="ic"
                aria-label="Close"
                @click="showDevices = false"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
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
                <span class="dev-count"
                  >{{ activeDevicesCount }}
                  {{ i18n.t.devices || "Devices" }}</span
                >
                <button
                  class="btn btn-g btn-sm"
                  :disabled="devicesLoading || activeDevicesCount <= 1"
                  @click="revokeAllOthers"
                >
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
                <div
                  v-for="device in devicesList"
                  :key="device.id"
                  class="dev-c"
                  :class="{
                    current: device.isCurrent && !device.revoked,
                    revoked: device.revoked,
                  }"
                >
                  <div class="dev-icon">
                    <!-- smartphone for mobile, monitor for desktop/tablet -->
                    <svg
                      v-if="device.deviceType === 'mobile'"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                    >
                      <rect x="7" y="2" width="10" height="20" rx="2" ry="2" />
                      <line x1="11" y1="18" x2="13" y2="18" />
                    </svg>
                    <svg
                      v-else
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                    >
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
                      <span
                        v-if="device.isCurrent && !device.revoked"
                        class="dev-badge dev-badge-cur"
                        >{{ i18n.t.current_device }}</span
                      >
                      <span
                        v-else-if="device.revoked"
                        class="dev-badge dev-badge-rev"
                        >{{ i18n.t.device_revoked_badge }}</span
                      >
                    </div>
                    <div class="dev-meta">
                      <span class="dev-kv">
                        <strong
                          >{{ device.browser
                          }}{{
                            device.browserVersion
                              ? " " + device.browserVersion.split(".")[0]
                              : ""
                          }}</strong
                        >
                        · {{ device.os
                        }}{{ device.osVersion ? " " + device.osVersion : "" }}
                        <template v-if="device.screen"
                          >· {{ device.screen }}</template
                        >
                      </span>
                      <span class="dev-kv">
                        {{ i18n.t.device_ip }}:
                        <strong>{{
                          device.ipAddress || i18n.t.device_unknown
                        }}</strong>
                        <template
                          v-if="device.city || device.region || device.country"
                        >
                          · {{ i18n.t.device_location }}:
                          <strong
                            >{{
                              [device.city, device.region, device.country]
                                .filter(Boolean)
                                .join(", ")
                            }}</strong
                          >
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
                      <span
                        v-if="device.isProxy || device.isHosting"
                        class="dev-flags"
                      >
                        <span v-if="device.isProxy" class="dev-flag">
                          ⚠ {{ i18n.t.device_vpn_flag || "VPN / Proxy" }}</span
                        >
                        <span v-if="device.isHosting" class="dev-flag">
                          ⚠
                          {{
                            i18n.t.device_hosting_flag || "Server / Hosting IP"
                          }}</span
                        >
                      </span>
                    </div>
                    <button
                      type="button"
                      class="dev-details-btn"
                      :aria-expanded="expandedDeviceId === device.id"
                      @click="toggleDeviceDetails(device.id)"
                    >
                      {{
                        expandedDeviceId === device.id
                          ? i18n.t.device_hide_details || "Hide details"
                          : i18n.t.device_more_details || "More details"
                      }}
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        :class="{ flip: expandedDeviceId === device.id }"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                    <div
                      v-if="expandedDeviceId === device.id"
                      class="dev-details"
                    >
                      <span v-if="device.platform" class="dev-kv">
                        {{ i18n.t.device_platform }}:
                        <strong>{{ device.platform }}</strong>
                      </span>
                      <span v-if="device.hardware" class="dev-kv">
                        {{ i18n.t.device_hardware }}:
                        <strong>{{ device.hardware }}</strong>
                      </span>
                      <span
                        v-if="device.timezone || device.language"
                        class="dev-kv"
                      >
                        <template v-if="device.timezone"
                          >{{ i18n.t.device_timezone }}:
                          <strong>{{ device.timezone }}</strong></template
                        >
                        <template v-if="device.timezone && device.language">
                          · </template
                        ><template v-if="device.language"
                          >{{ i18n.t.device_language }}:
                          <strong>{{ device.language }}</strong></template
                        >
                      </span>
                      <span
                        v-if="device.latitude != null && device.longitude"
                        class="dev-kv"
                      >
                        {{ i18n.t.device_coords }}:
                        <strong
                          >{{ Number(device.latitude).toFixed(4) }},
                          {{ Number(device.longitude).toFixed(4) }}</strong
                        >
                      </span>
                      <span v-if="device.asn || device.org" class="dev-kv">
                        <template v-if="device.asn"
                          >{{ i18n.t.device_asn }}:
                          <strong>{{ device.asn }}</strong></template
                        >
                        <template v-if="device.asn && device.org"> · </template
                        ><template v-if="device.org"
                          ><strong>{{ device.org }}</strong></template
                        >
                      </span>
                      <span class="dev-kv dev-kv-ua">
                        {{ i18n.t.device_user_agent }}:
                        <strong>{{ device.userAgent || i18n.t.device_unknown }}</strong>
                      </span>
                    </div>
                  </div>
                  <button
                    v-if="!device.revoked"
                    class="ic ic-sm ic-red"
                    :title="i18n.t.sign_out_device || 'Sign out device'"
                    :aria-label="
                      (i18n.t.sign_out_device || 'Sign out device') +
                      ' — ' +
                      (device.deviceName || device.id)
                    "
                    :disabled="revokingDeviceId === device.id"
                    @click="confirmRevokeDevice(device)"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                    >
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
                  <button
                    class="ic ic-sm"
                    :title="i18n.t.refresh || 'Refresh'"
                    :aria-label="i18n.t.refresh || 'Refresh'"
                    @click="fetchLoginHistory"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                    >
                      <polyline points="23 4 23 10 17 10" />
                      <path
                        d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"
                      />
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
                  <div
                    v-for="h in loginHistory"
                    :key="h.id"
                    class="dev-hist-i"
                  >
                    <span
                      class="dev-hist-dot"
                      :class="'m-' + (h.method || 'email')"
                    ></span>
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
                      <span class="dev-hist-l3"
                        >{{ h.browser || "" }}{{ h.os ? " · " + h.os : "" }} ·
                        {{ formatDate(h.at) }}</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition></Teleport
    >

    <!-- Sign out device (confirm) -->
    <Teleport to="body"
      ><Transition name="fade">
        <div
          v-if="deletingDevice"
          class="overlay"
          @click.self="deletingDevice = null"
        >
          <div class="dlg">
            <div class="dlg-i dlg-i-r">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
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
                {{ i18n.t.cancel }}</button
              ><button
                class="btn btn-r"
                :disabled="revokingDeviceId"
                @click="doRevokeDevice"
              >
                {{ revokingDeviceId ? i18n.t.loading : i18n.t.logout }}
              </button>
            </div>
          </div>
        </div>
      </Transition></Teleport
    >

    <!-- Category Form -->
    <Teleport to="body"
      ><Transition name="fade">
        <div
          v-if="showCatForm"
          class="overlay"
          @click.self="showCatForm = false"
        >
          <div class="sheet">
            <div class="sheet-h">
              <span>{{ editingCat ? "កែប្រែប្រភេទ" : "បន្ថែមប្រភេទ" }}</span
              ><button
                class="ic"
                aria-label="Close"
                @click="showCatForm = false"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div class="sheet-b">
              <div v-if="catSuccess" class="msg msg-s">{{ catSuccess }}</div>
              <div class="fld">
                <label class="fld-l"
                  >{{ i18n.t.add_category || "Category Name" }} *</label
                >
                <input
                  v-model="catLabelKm"
                  class="fld-i"
                  :class="{ err: catErrors }"
                  :placeholder="i18n.t.category"
                  @input="catErrors = ''"
                />
                <div v-if="catErrors" class="fld-e">{{ catErrors }}</div>
              </div>
              <button
                class="btn btn-primary btn-b"
                :disabled="catSubmitting"
                @click="submitCategory"
              >
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
      </Transition></Teleport
    >

    <!-- Profile -->
    <Teleport to="body"
      ><Transition name="fade">
        <div
          v-if="showProfile"
          class="overlay"
          @click.self="showProfile = false"
        >
          <div class="sheet">
            <div class="sheet-h">
              <span
                ><svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                {{ i18n.t.profile || "Profile" }}</span
              ><button
                class="ic"
                aria-label="Close"
                @click="showProfile = false"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
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
                  <img :src="profileLogoPreview || restaurantLogo" alt="" />
                </div>
                <label class="prof-up"
                  ><svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                  >
                    <path
                      d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                    />
                    <path
                      d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                    />
                  </svg>
                  {{ i18n.t.change_logo || "Change" }}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    @change="onLogoChange"
                /></label>
              </div>
              <div class="fld">
                <label class="fld-l">{{ i18n.t.restaurant_name }} *</label>
                <input
                  v-model="profileName"
                  class="fld-i"
                  :placeholder="i18n.t.restaurant_name"
                />
              </div>

              <!-- ─── THEME COLOR ─── -->
              <div class="fld">
                <label class="fld-l">{{ i18n.t.theme_color || "Theme color" }}</label>
                <div class="swatches">
                  <button
                    v-for="c in theme.presets"
                    :key="c.value"
                    type="button"
                    class="swatch"
                    :class="{ active: theme.primary === c.value }"
                    :style="{ background: c.value }"
                    :title="c.name"
                    :aria-label="c.name"
                    @click="onPresetColor(c.value)"
                  >
                    <svg
                      v-if="theme.primary === c.value"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </button>
                  <label
                    class="swatch swatch-custom"
                    :title="i18n.t.theme_custom || 'Pick any color'"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path
                        d="M12 2a10 10 0 0 0 0 20c1.1 0 2-.9 2-2v-1c0-1.1.9-2 2-2h1a4 4 0 0 0 4-4c0-6.08-4.92-11-9-11z"
                      />
                      <circle cx="7.5" cy="10.5" r="1" fill="currentColor" />
                      <circle cx="12" cy="7.5" r="1" fill="currentColor" />
                      <circle cx="16.5" cy="10.5" r="1" fill="currentColor" />
                    </svg>
                    <input
                      type="color"
                      class="swatch-input"
                      :value="theme.primary"
                      @input="onCustomColor"
                    />
                  </label>
                </div>
                <div class="swatch-meta">
                  <input
                    class="fld-i hex-in"
                    :value="theme.primary"
                    maxlength="7"
                    spellcheck="false"
                    placeholder="#0f766e"
                    @change="applyHexInput"
                    @keyup.enter="$event.target.blur()"
                  />
                  <button type="button" class="btn btn-g btn-sm" @click="resetTheme">
                    {{ i18n.t.theme_reset || "Reset" }}
                  </button>
                </div>
              </div>

              <!-- ─── SIDEBAR POSITION ─── -->
              <div class="fld">
                <label class="fld-l">{{ i18n.t.sidebar_position || "Sidebar position" }}</label>
                <div class="layout-options">
                  <button
                    v-for="pos in ['left', 'right', 'top', 'bottom']"
                    :key="pos"
                    type="button"
                    class="layout-opt"
                    :class="{ active: sidebarPosition === pos }"
                    :title="i18n.t['sb_' + pos] || pos"
                    @click="applySidebarPosition(pos)"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linejoin="round"
                    >
                      <template v-if="pos === 'left'">
                        <rect x="3" y="4" width="5" height="16" rx="1.5" />
                        <rect x="10" y="4" width="11" height="16" rx="1.5" />
                      </template>
                      <template v-else-if="pos === 'right'">
                        <rect x="3" y="4" width="11" height="16" rx="1.5" />
                        <rect x="16" y="4" width="5" height="16" rx="1.5" />
                      </template>
                      <template v-else-if="pos === 'top'">
                        <rect x="4" y="3" width="16" height="5" rx="1.5" />
                        <rect x="4" y="10" width="16" height="11" rx="1.5" />
                      </template>
                      <template v-else>
                        <rect x="4" y="3" width="16" height="11" rx="1.5" />
                        <rect x="4" y="16" width="16" height="5" rx="1.5" />
                      </template>
                    </svg>
                    <span>{{ i18n.t['sb_' + pos] || pos }}</span>
                  </button>
                </div>
              </div>

              <button
                class="btn btn-primary btn-b"
                :disabled="profileSubmitting"
                @click="submitProfile"
              >
                {{ profileSubmitting ? i18n.t.loading : i18n.t.save }}
              </button>
            </div>
          </div>
        </div>
      </Transition></Teleport
    >
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useFoodsStore } from "@/stores/foods";
import { useI18nStore } from "@/stores/i18n";
import FoodCard from "@/components/FoodCard.vue";
import FoodFormModal from "@/components/FoodFormModal.vue";
import AppSelect from "@/components/AppSelect.vue";
import AppIcon from "@/components/AppIcon.vue";
import { useThemeStore } from "@/stores/theme";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;
const router = useRouter();
const auth = useAuthStore();
const foods = useFoodsStore();
const i18n = useI18nStore();
const theme = useThemeStore();

const adminTab = ref("foods");
const curCat = ref("");
const searchQ = ref("");
const showForm = ref(false);
const editingFood = ref(null);
const deletingFood = ref(null);
const loggingOut = ref(false);
const showQR = ref(false);
const showMobile = ref(false);
let desktopBreakpointQuery = null;
const showTelegramSettings = ref(false);
const showCatForm = ref(false);
const editingCat = ref(null);
const catSubmitting = ref(false);
const catSuccess = ref("");
const catErrors = ref("");
const catLabelKm = ref("");
const deletingCat = ref(null);
const showProfile = ref(false);
const profileName = ref("");
const profileLogoFile = ref(null);
const profileLogoPreview = ref(null);
const profileSubmitting = ref(false);
const profileSuccess = ref("");
const profileError = ref("");

const tgSubmitting = ref(false);
const tgSuccess = ref("");
const tgError = ref("");
const copied = ref(false);
const tgLoading = ref(false);
const displayLinkCode = computed(() => auth.linkCode || "------");
const isLinked = computed(() => auth.isTelegramLinked);

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
  return `${window?.location?.origin || ""}/menu?restaurant_id=${
    auth.restaurantId
  }`;
});
const restaurantLogo = computed(
  () =>
    auth.restaurant?.logoUrl ||
    "https://res.cloudinary.com/daji2ml3y/image/upload/v1783262055/ChatGPT_Image_Jul_5_2026_09_32_32_PM_c6ziic.png"
);

const orders = ref([]);
const ordersLoading = ref(false);
const orderStream = ref(null);
const orderStreamError = ref("");
let streamRetryTimer = null;
let streamAttempts = 0;
const lastAlertedOrderId = ref(null);
const isSpeaking = ref(false);
const qrTableNumber = ref("");
const qrCodeDataUrl = ref("");
const qrLoading = ref(false);
const qrError = ref("");
const qrInfo = ref("");
// ─── SAVED TABLE QRs ("made done") ─────────────────────────
// Every generated table QR is stored server-side (qr_codes table). A table
// number already in this list can NOT be generated again — the stored QR is
// reused, and the owner can search / preview / download it below.
const savedQrs = ref([]);
const qrSearch = ref("");
const qrListLoading = ref(false);
const qrListError = ref("");
const selectedSavedNo = ref(null);
const deletingQr = ref(null);
const filteredSavedQrs = computed(() => {
  const q = qrSearch.value.trim();
  if (!q) return savedQrs.value;
  return savedQrs.value.filter((qr) => String(qr.table_no).includes(q));
});

// ─── DEVICE SESSIONS (access log for the account) ──────────
// Every device that logs in is recorded server-side (device_sessions
// table): device id/name/type, browser, OS, screen, timezone, language,
// IP + best-effort city/country, first seen, last login, last active.
// The owner can review ALL of them here and sign out any device (or all
// others at once) — the auth middleware then rejects that device's token.
const showDevices = ref(false);
const devicesList = ref([]);
const devicesLoading = ref(false);
const devicesError = ref("");
const devicesMsg = ref("");
const deletingDevice = ref(null);
const revokingDeviceId = ref(null);
const expandedDeviceId = ref(null);
const loginHistory = ref([]);
const historyLoading = ref(false);
const historyError = ref("");
const activeDevicesCount = computed(
  () => devicesList.value.filter((d) => !d.revoked).length
);
function openDevices() {
  devicesError.value = "";
  devicesMsg.value = "";
  showDevices.value = true;
  fetchDevices();
  fetchLoginHistory();
}
async function fetchDevices() {
  devicesLoading.value = true;
  devicesError.value = "";
  try {
    const res = await axios.get(`${API_BASE}/api/auth/devices`);
    devicesList.value = res.data || [];
  } catch (err) {
    devicesError.value =
      err.response?.data?.error || "មិនអាចផ្ទុកបញ្ជីឧបករណ៍បានទេ";
  } finally {
    devicesLoading.value = false;
  }
}
function confirmRevokeDevice(device) {
  deletingDevice.value = device;
}
async function doRevokeDevice() {
  const device = deletingDevice.value;
  if (!device || revokingDeviceId.value) return;
  revokingDeviceId.value = device.id;
  try {
    await axios.delete(`${API_BASE}/api/auth/devices/${device.id}`);
    deletingDevice.value = null;
    if (device.isCurrent) {
      // Revoking THIS device → sign out immediately
      auth.logout();
      window.location.href = "/login";
      return;
    }
    devicesMsg.value =
      i18n.t.device_signed_out_ok || "ឧបករណ៍ត្រូវបានចេញរួចរាល់!";
    setTimeout(() => {
      devicesMsg.value = "";
    }, 2500);
    await fetchDevices();
    await fetchLoginHistory();
  } catch (err) {
    devicesError.value =
      err.response?.data?.error || "មិនអាចចេញឧបករណ៍នេះបានទេ";
  } finally {
    revokingDeviceId.value = null;
  }
}
async function revokeAllOthers() {
  devicesError.value = "";
  try {
    const res = await axios.delete(`${API_BASE}/api/auth/devices`);
    devicesMsg.value =
      (i18n.t.sign_out_others_ok || "ឧបករណ៍ផ្សេងទាំងអស់ត្រូវបានចេញរួចរាល់!") +
      (res.data?.count ? ` (${res.data.count})` : "");
    setTimeout(() => {
      devicesMsg.value = "";
    }, 2500);
    await fetchDevices();
    await fetchLoginHistory();
  } catch (err) {
    devicesError.value =
      err.response?.data?.error || "មិនអាចចេញឧបករណ៍ផ្សេងបានទេ";
  }
}
async function fetchLoginHistory() {
  historyLoading.value = true;
  historyError.value = "";
  try {
    const res = await axios.get(`${API_BASE}/api/auth/devices/history`);
    loginHistory.value = res.data || [];
  } catch (err) {
    historyError.value =
      err.response?.data?.error || "មិនអាចផ្ទុកប្រវត្តិការចូលបានទេ";
  } finally {
    historyLoading.value = false;
  }
}
function toggleDeviceDetails(id) {
  expandedDeviceId.value = expandedDeviceId.value === id ? null : id;
}
function deviceMethodLabel(method) {
  const labels = {
    password: i18n.t.method_password || "Password",
    google: "Google",
  };
  return labels[method] || method || i18n.t.device_unknown;
}

function openProfile() {
  profileName.value = auth.restaurant?.name || "";
  profileLogoFile.value = null;
  profileLogoPreview.value = null;
  profileSuccess.value = "";
  profileError.value = "";
  syncRestaurantTheme();
  showProfile.value = true;
}

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
  try {
    await axios.patch(`${API_BASE}/api/auth/theme`, {
      themeColor: color,
      restaurant_id: auth.restaurantId,
    });
  } catch (err) {
    console.error("Failed to save theme to server:", err);
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
// The owner sees the color that their customers see (the restaurant's saved color)
function syncRestaurantTheme() {
  const c = auth.restaurant?.themeColor;
  if (c) theme.setPrimary(c, { persist: false });
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
async function saveSidebarToServer(pos) {
  try {
    await axios.patch(`${API_BASE}/api/auth/sidebar`, {
      sidebarPosition: pos,
      restaurant_id: auth.restaurantId,
    });
  } catch (err) {
    console.error("Failed to save sidebar position:", err);
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
    profileError.value = "សូមបញ្ចូលឈ្មោះហាង";
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
    console.error(err);
  } finally {
    tgLoading.value = false;
  }
}
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

async function fetchOrders() {
  ordersLoading.value = true;
  try {
    const res = await axios.get(`${API_BASE}/api/orders`);
    orders.value = res.data;
  } catch (err) {
    console.error(err);
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
  // Match Telegram bot status labels (Khmer)
  const labels = {
    pending: "⏳ រង់ចាំ",
    preparing: "👨‍🍳 កំពុងរៀបចំ",
    ready: "🍽️ រួចរាល់",
    served: "✔️ បានបម្រើ",
    cancelled: "❌ បោះបង់",
  };
  return labels[status] || status;
}
function getStatusOptions(currentStatus) {
  // Show ALL statuses (except current) so admin can change to any status directly
  const allStatuses = ["preparing", "ready", "served", "cancelled"];
  return allStatuses.filter((s) => s !== currentStatus);
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

function openQR() {
  qrError.value = "";
  qrInfo.value = "";
  qrCodeDataUrl.value = "";
  qrTableNumber.value = "";
  qrSearch.value = "";
  selectedSavedNo.value = null;
  savedQrs.value = [];
  showQR.value = true;
  fetchSavedQrs();
}
async function generateQR() {
  const num = parseInt(qrTableNumber.value);
  if (!num || num < 1) {
    qrError.value = "សូមបញ្ចូលលេខតុឲ្យបានត្រឹមត្រូវ";
    return;
  }
  qrLoading.value = true;
  qrError.value = "";
  qrInfo.value = "";
  try {
    let url = `${API_BASE}/api/qr/table/${num}`;
    if (auth.restaurantId) url += `?restaurant_id=${auth.restaurantId}`;
    // NOTE: deliberately NO force=1 — a table number whose QR was already
    // "made done" can not be made again. The server returns the stored QR
    // and this UI simply shows it (also searchable in the saved list below).
    const res = await axios.get(url);
    qrCodeDataUrl.value = res.data.qrCode;
    selectedSavedNo.value = res.data.tableNumber;
    upsertSavedQr({
      id: `table-${res.data.tableNumber}`,
      table_no: res.data.tableNumber,
      created_at: res.data.createdAt || new Date().toISOString(),
      _dataUrl: res.data.qrCode,
    });
    qrInfo.value = res.data.alreadyExists
      ? (
          i18n.t.qr_already_saved ||
          "តុលេខ {n} ត្រូវបានធ្វើរួចហើយ — បង្ហាញ QR ដែលបានរក្សាទុក"
        ).replace("{n}", res.data.tableNumber)
      : i18n.t.qr_created_success || "បង្កើត QR បានជោគជ័យ!";
  } catch (e) {
    qrError.value =
      "បង្កើត QR បរាជ័យ: " + (e.response?.data?.error || e.message);
  } finally {
    qrLoading.value = false;
  }
}
async function fetchSavedQrs() {
  qrListLoading.value = true;
  qrListError.value = "";
  try {
    let url = `${API_BASE}/api/qr/codes`;
    if (auth.restaurantId) url += `?restaurant_id=${auth.restaurantId}`;
    const res = await axios.get(url);
    savedQrs.value = (res.data || []).map((r) => ({ ...r, _dataUrl: "" }));
  } catch (err) {
    qrListError.value =
      err.response?.data?.error || "មិនអាចផ្ទុក QR ដែលបានធ្វើរួចបានទេ";
  } finally {
    qrListLoading.value = false;
  }
}
function upsertSavedQr(item) {
  const rest = savedQrs.value.filter((q) => q.table_no !== item.table_no);
  const idx = rest.findIndex((q) => q.table_no > item.table_no);
  if (idx === -1) rest.push(item);
  else rest.splice(idx, 0, item);
  savedQrs.value = rest;
}
async function loadSavedQrImage(qr) {
  if (qr._dataUrl) return qr._dataUrl;
  let url = `${API_BASE}/api/qr/codes/${qr.table_no}`;
  if (auth.restaurantId) url += `?restaurant_id=${auth.restaurantId}`;
  const res = await axios.get(url);
  qr._dataUrl = res.data.qr_data_url;
  return qr._dataUrl;
}
async function previewSavedQr(qr) {
  qrError.value = "";
  qrInfo.value = "";
  qrTableNumber.value = String(qr.table_no);
  selectedSavedNo.value = qr.table_no;
  try {
    qrCodeDataUrl.value = await loadSavedQrImage(qr);
  } catch (err) {
    qrError.value = err.response?.data?.error || "មិនអាចផ្ទុក QR បានទេ";
  }
}
async function downloadSavedQr(qr) {
  try {
    const dataUrl = await loadSavedQrImage(qr);
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `table-${qr.table_no}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    qrError.value = err.response?.data?.error || "មិនអាចទាញយក QR បានទេ";
  }
}
function formatQrDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("km-KH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
function confirmDelQr(qr) {
  deletingQr.value = qr;
}
async function doDeleteQr() {
  const qr = deletingQr.value;
  if (!qr) return;
  try {
    let url = `${API_BASE}/api/qr/codes/${qr.table_no}`;
    if (auth.restaurantId) url += `?restaurant_id=${auth.restaurantId}`;
    await axios.delete(url);
    // Remove from the saved list; that table number can be generated again
    savedQrs.value = savedQrs.value.filter((q) => q.table_no !== qr.table_no);
    // If the deleted QR was shown in the preview area, clear it
    if (selectedSavedNo.value === qr.table_no) {
      selectedSavedNo.value = null;
      qrCodeDataUrl.value = "";
      qrTableNumber.value = "";
    }
    qrError.value = "";
    qrInfo.value = i18n.t.qr_deleted || "លុប QR រួចរាល់!";
  } catch (err) {
    qrError.value = err.response?.data?.error || "លុប QR មិនបានជោគជ័យ";
  } finally {
    deletingQr.value = null;
  }
}
function downloadQR() {
  if (!qrCodeDataUrl.value) return;
  const link = document.createElement("a");
  link.href = qrCodeDataUrl.value;
  link.download = `table-${qrTableNumber.value}-qr.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
  if (auth.currentMenuId) params.menu_id = auth.currentMenuId;
  if (curCat.value) params.category = curCat.value;
  if (searchQ.value) params.search = searchQ.value;
  await foods.fetchFoods(params);
}

// ─── RESTAURANT SWITCHING / CREATION ───────────────────────
async function onSwitchRestaurant(value) {
  const id = Number(value);
  auth.setCurrentRestaurant(id);
  syncRestaurantTheme();
  curCat.value = "";
  searchQ.value = "";
  await initForRestaurant();
}

const showAddRestaurant = ref(false);
const addRestaurantName = ref("");
const addRestaurantSubmitting = ref(false);
const addRestaurantMsg = ref("");
const addRestaurantError = ref("");

function openAddRestaurant() {
  addRestaurantName.value = "";
  addRestaurantMsg.value = "";
  addRestaurantError.value = "";
  showAddRestaurant.value = true;
}

async function submitAddRestaurant() {
  addRestaurantError.value = "";
  addRestaurantMsg.value = "";
  if (!addRestaurantName.value.trim()) {
    addRestaurantError.value = "សូមបញ្ចូលឈ្មោះភោជនីយដ្ឋាន";
    return;
  }
  addRestaurantSubmitting.value = true;
  try {
    const res = await axios.post(
      `${API_BASE}/api/auth/restaurants`,
      { name: addRestaurantName.value.trim() }
    );
    // Refresh the restaurants list
    await auth.fetchMe();
    if (res.data.restaurant) auth.setCurrentRestaurant(res.data.restaurant.id);
    await initForRestaurant();
    addRestaurantMsg.value = "បង្កើតភោជនីយដ្ឋានបានជោគជ័យ!";
    setTimeout(() => {
      showAddRestaurant.value = false;
    }, 1100);
  } catch (err) {
    addRestaurantError.value =
      err.response?.data?.error || "មានបញ្ហា សូមព្យាយាមម្ដងទៀត";
  } finally {
    addRestaurantSubmitting.value = false;
  }
}

// ─── MENU HANDLING (one menu per restaurant) ───────────────
const menuCreating = ref(false);

async function ensureDefaultMenu() {
  if (!auth.restaurantId) return;
  if (menuCreating.value) return;
  menuCreating.value = true;
  try {
    const created = await foods.addMenu("Default Menu");
    auth.setCurrentMenu(created.id);
    await foods.fetchMenus();
    await refreshCurrentMenuSelection();
    await initForRestaurant();
  } catch (err) {
    console.error("Could not create menu:", err);
  } finally {
    menuCreating.value = false;
  }
}

// Ensure currentMenuId points to an existing menu; default to first.
function refreshCurrentMenuSelection() {
  if (
    !auth.currentMenuId ||
    !foods.menus.some((m) => m.id === auth.currentMenuId)
  ) {
    auth.setCurrentMenu(foods.menus.length ? foods.menus[0].id : null);
  }
}

async function loadCategories() {
  const params = {};
  if (auth.currentMenuId) params.menu_id = auth.currentMenuId;
  await foods.fetchCategories(params);
}

async function initForRestaurant() {
  // Load menus for the (new) current restaurant
  await foods.fetchMenus();
  refreshCurrentMenuSelection();
  // When switching restaurants, drop the previous menu's category selection
  curCat.value = "";
  searchQ.value = "";
  await loadCategories();
  await load();
  fetchStats();
  // Reconnect the order stream to the selected restaurant
  disconnectOrderStream();
  connectOrderStream();
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
function handleEscKey(e) {
  if (e.key !== "Escape") return;
  if (showAddRestaurant.value) showAddRestaurant.value = false;
  else if (showForm.value) {
    showForm.value = false;
    editingFood.value = null;
  } else if (deletingFood.value) deletingFood.value = null;
  else if (deletingCat.value) deletingCat.value = null;
  else if (deletingQr.value) deletingQr.value = null;
  else if (showQR.value) showQR.value = false;
  else if (deletingDevice.value) deletingDevice.value = null;
  else if (showDevices.value) showDevices.value = false;
  else if (showTelegramSettings.value) showTelegramSettings.value = false;
  else if (loggingOut.value) loggingOut.value = false;
  else if (showCatForm.value) showCatForm.value = false;
  else if (showProfile.value) showProfile.value = false;
}

// ─── REAL-TIME NEW ORDER ALERT (TTS 🔊) ───
function playOrderAlert(order) {
  if (!("speechSynthesis" in window)) {
    console.warn("Speech synthesis not supported in this browser");
    return;
  }
  // Cancel any previous speech
  window.speechSynthesis.cancel();

  const tableNo = order.tableNo || "1";
  const text = `ទទួលបានការកម្មង់ពីតុលេខ ${tableNo}`;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "km-KH";
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;

  // Try to pick a Khmer voice if available, otherwise use default
  const voices = window.speechSynthesis.getVoices();
  const kmVoice = voices.find(
    (v) => v.lang && v.lang.toLowerCase().startsWith("km")
  );
  if (kmVoice) utterance.voice = kmVoice;

  utterance.onstart = () => {
    isSpeaking.value = true;
  };
  utterance.onend = () => {
    isSpeaking.value = false;
  };
  utterance.onerror = () => {
    isSpeaking.value = false;
  };

  window.speechSynthesis.speak(utterance);
}

// Probe the stream endpoint once so the real HTTP status/error can be
// reported — EventSource hides response codes, which made production 404s
// (e.g. "Restaurant not found") impossible to diagnose. The SSE handler
// sends headers immediately on both success and error, so a short probe is
// enough; the probe connection is then aborted and EventSource takes over.
async function probeOrderStream(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const res = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        msg = (await res.json()).error || msg;
      } catch {
        /* non-JSON body — keep the generic message */
      }
      return { ok: false, status: res.status, msg };
    }
    return { ok: true };
  } finally {
    clearTimeout(timer);
    ctrl.abort(); // close the probe connection; EventSource opens its own
  }
}

function scheduleStreamRetry(delayMs) {
  clearTimeout(streamRetryTimer);
  streamRetryTimer = setTimeout(() => {
    streamRetryTimer = null;
    connectOrderStream();
  }, delayMs);
}

async function connectOrderStream() {
  if (!auth.token) return;
  if (orderStream.value) return; // Already connected
  clearTimeout(streamRetryTimer);
  streamRetryTimer = null;

  const params = new URLSearchParams({ token: auth.token });
  // Stream the restaurant the owner selected in the dashboard; when omitted,
  // the server streams every restaurant the account owns.
  if (auth.restaurant?.id) {
    params.set("restaurant_id", String(auth.restaurant.id));
  }
  const url = `${API_BASE}/api/orders/stream?${params.toString()}`;

  try {
    const probe = await probeOrderStream(url);
    if (!probe.ok) {
      orderStreamError.value = probe.msg;
      streamAttempts += 1;
      // A 404 here means the account has no (matching) restaurant in the
      // server's database — retry slowly in case one is created later.
      console.error(
        `Order stream unavailable (${probe.status}): ${probe.msg} — retrying in 60s`,
      );
      scheduleStreamRetry(60000);
      return;
    }
  } catch {
    /* probe couldn't finish (offline / server waking up) — let EventSource try */
  }

  const es = new EventSource(url);

  es.addEventListener("connected", () => {
    orderStreamError.value = "";
    streamAttempts = 0;
    console.log("🔊 Real-time order stream connected");
  });

  es.addEventListener("new-order", (event) => {
    try {
      const data = JSON.parse(event.data);
      if (!data.orderId || data.orderId === lastAlertedOrderId.value) return;
      lastAlertedOrderId.value = data.orderId;

      console.log("🛎️ New order received:", data);

      // 🔊 Play Khmer voice alert: "ទទួលបានការកម្មង់ពីតុលេខ X"
      playOrderAlert(data);

      // Auto-refresh orders list if on orders tab
      if (adminTab.value === "orders") {
        fetchOrders();
      }

      // Refresh stats so dashboard numbers stay current
      fetchStats();

      // Also refresh foods badge if pending orders exist
      const badgeEl = document.querySelector(".nav-badge");
      if (badgeEl) badgeEl.classList.add("pulse-fast");
    } catch (err) {
      console.error("Failed to parse new-order event:", err);
    }
  });

  es.addEventListener("order-status", (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("🔄 Order status changed:", data);

      // Update order status in the local list in real-time
      const idx = orders.value.findIndex((o) => o.id === data.orderId);
      if (idx !== -1) {
        orders.value[idx].status = data.status;
      }

      // Refresh stats so dashboard numbers stay current
      fetchStats();
    } catch (err) {
      console.error("Failed to parse order-status event:", err);
    }
  });

  es.onerror = () => {
    es.close();
    orderStream.value = null;
    streamAttempts += 1;
    // Backoff: 5s, 10s, 15s … capped at 60s. Render's free tier can sleep
    // the service, so keep retrying — just not every 5s forever.
    const delay = Math.min(60000, 5000 * streamAttempts);
    console.warn(`Order stream disconnected, retrying in ${delay / 1000}s…`);
    scheduleStreamRetry(delay);
  };

  orderStream.value = es;
}

function disconnectOrderStream() {
  clearTimeout(streamRetryTimer);
  streamRetryTimer = null;
  if (orderStream.value) {
    orderStream.value.close();
    orderStream.value = null;
  }
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

onMounted(async () => {
  // Refresh restaurants list (in case a new one was added elsewhere)
  await auth.fetchMe();
  syncRestaurantTheme();
  await foods.fetchMenus();
  refreshCurrentMenuSelection();
  await loadCategories();
  if (foods.categories.length) curCat.value = foods.categories[0].id;
  await load();
  fetchStats();
  window.addEventListener("keydown", handleEscKey);
  connectOrderStream();

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
onUnmounted(() => {
  window.removeEventListener("keydown", handleEscKey);
  disconnectOrderStream();
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
/* ═══════════════════════════════════════════════════════════
   ADMIN VIEW v3.3 — Fully Responsive
   ═══════════════════════════════════════════════════════════ */
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
    padding-top: calc(var(--hbar-h) + 18px);
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
  background: linear-gradient(
    135deg,
    var(--surface-green) 0%,
    var(--surface) 100%
  );
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
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 11px;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.lang {
  background: var(--surface-green);
  color: var(--ink);
  border: 1px solid var(--border-green);
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
  background: #fef2f2;
}
.logout:hover {
  background: #fef2f2;
  border-color: #fecaca;
  transform: translateY(-1px);
}

/* ─── MOBILE ─── */
.mob {
  display: none;
}
.scrim {
  display: none;
  opacity: 0;
  transition: opacity 0.2s ease;
}

/* ─── MAIN ─── */
.main {
  padding: 28px 32px 60px;
  /* max-width: 1320px; */
  width: 100%;
  min-width: 0;
  overflow-x: hidden;
}

/* Header */
.hdr {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 2px solid var(--border-green);
  flex-wrap: wrap;
  gap: 10px;
}
.hdr-l {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 150px;
}
.hdr-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--ink);
  margin: 0;
  letter-spacing: -0.3px;
}
.hdr-title::before {
  content: "✦ ";
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
  top: 3px;
  right: 3px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--amber);
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

/* Metrics */
.metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
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
  transform: translateY(-2px);
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
  gap: 2px;
  min-width: 0;
}
.metric-v {
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
.metric-l {
  font-size: 10px;
  color: var(--muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.4px;
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
  border-color: var(--primary-strong, var(--primary));
  box-shadow: 0 2px 12px var(--primary-glow);
  transform: translateY(-2px);
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
.order-c {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px;
  transition: all 0.25s ease;
}
.order-c:hover {
  border-color: var(--primary-strong, var(--primary));
  box-shadow: 0 4px 16px var(--primary-glow);
  transform: translateY(-2px);
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
}
.order-id::before {
  content: "📋 ";
  font-size: 12px;
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
  width: 160px;
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
  background: conic-gradient(
    #ef4444,
    #f59e0b,
    #22c55e,
    #06b6d4,
    #6366f1,
    #ec4899,
    #ef4444
  );
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
    padding: 20px 24px 50px;
  }
}

/* Tablets and large phones */
@media (max-width: 900px) {
  .root {
    grid-template-columns: 1fr;
  }

  /* Mobile Header */
  .mob {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    z-index: 90;
  }
  .mob-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--surface);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--ink);
    position: relative;
    flex-shrink: 0;
  }
  .mob-btn:hover {
    border-color: var(--primary-strong, var(--primary));
  }
  .mob-info {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    min-width: 0;
  }
  .mob-av {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid var(--border-green);
    flex-shrink: 0;
  }
  .mob-av img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .mob-label {
    font-size: 13px;
    font-weight: 700;
    color: var(--ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .mob-alert {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--amber);
    animation: blink-dot 1.5s ease-in-out infinite;
  }

  /* Sidebar - Slide out */
  .side {
    position: fixed;
    left: 0;
    top: 0;
    width: 280px;
    max-width: 80vw;
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
    padding: 16px 16px 40px;
  }

  /* Hide text on small screens */
  .hdr-hide {
    display: none;
  }
  .hdr-title::before {
    content: "✦ ";
  }

  /* Metrics - 2 columns */
  .metrics {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .metric {
    padding: 14px 16px;
  }
  .metric-icon {
    width: 36px;
    height: 36px;
  }
  .metric-v {
    font-size: 18px;
  }

  /* Grid - 3 columns */
  .grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  /* Toolbar - stack */
  .bar {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
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
  }

  /* Categories */
  .cat-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  /* Buttons - smaller on mobile */
  .ac {
    padding: 6px 12px;
    font-size: 11px;
    min-height: 32px;
    min-width: 32px;
  }
  .hdr-r .ac {
    padding: 6px 10px;
  }
  .ac span {
    max-width: 80px;
  }
  .ac-avatar {
    width: 32px;
    height: 32px;
    min-width: 32px;
    padding: 6px;
  }
  .ac-icon-only {
    padding: 6px 8px;
  }
  .btn {
    min-height: 34px;
    min-width: 60px;
    font-size: 11px;
    padding: 6px 12px;
  }

  /* Header */
  .hdr {
    padding-bottom: 14px;
    margin-bottom: 16px;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  .hdr-title {
    font-size: 20px;
  }
  .hdr-r {
    flex-wrap: wrap;
    gap: 6px;
  }
}

/* Small phones */
@media (max-width: 480px) {
  .main {
    padding: 12px 10px 32px;
  }

  .hdr-title {
    font-size: 18px;
  }

  /* Metrics - 1 column on very small screens */
  .metrics {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .metric {
    padding: 12px 14px;
  }
  .metric-v {
    font-size: 17px;
  }

  /* Grid - 2 columns */
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  /* Categories - 1 column */
  .cat-grid {
    grid-template-columns: 1fr;
  }

  /* Orders */
  .order-c {
    padding: 12px;
  }

  /* Modals - full width */
  .sheet {
    max-width: 100%;
    margin: 8px;
    border-radius: 12px;
  }
  .sheet-h {
    padding: 14px 16px;
    font-size: 13px;
  }
  .sheet-b {
    padding: 14px;
    gap: 12px;
  }
  .dlg {
    padding: 20px 16px;
  }

  /* QR */
  .qr-r {
    flex-direction: column;
  }
  .qr-p img {
    width: 140px;
    height: 140px;
  }

  /* Chips - wrap */
  .bar-scroll {
    gap: 4px;
  }
  .chip {
    padding: 4px 10px;
    font-size: 10px;
    min-height: 26px;
  }

  /* Buttons - even smaller */
  .ac {
    padding: 4px 10px;
    font-size: 10px;
    min-height: 28px;
    min-width: 28px;
  }
  .ac span {
    max-width: 60px;
  }
  .ac-avatar {
    width: 28px;
    height: 28px;
    min-width: 28px;
    padding: 4px;
  }
  .ac-icon-only {
    padding: 4px 6px;
  }
  .btn {
    min-height: 30px;
    min-width: 50px;
    font-size: 10px;
    padding: 4px 10px;
  }

  .order-sel {
    min-height: 30px;
    font-size: 10px;
    padding: 4px 8px;
  }
  .fld-i {
    min-height: 32px;
    font-size: 11px;
    padding: 6px 8px;
  }
  .qr-inp {
    min-height: 32px;
    font-size: 11px;
    padding: 6px 10px;
  }
}

/* Very small phones */
@media (max-width: 380px) {
  .grid {
    grid-template-columns: 1fr;
  }
  .hdr-r {
    gap: 4px;
  }
  .ac span {
    max-width: 40px;
  }
}

/* Landscape phones */
@media (max-height: 600px) and (orientation: landscape) {
  .side {
    padding-bottom: 10px;
  }
  .side-top {
    padding: 12px 16px 10px;
  }
  .side-nav {
    padding: 6px 8px;
    gap: 1px;
  }
  .nav-i {
    padding: 6px 10px;
    min-height: 32px;
    font-size: 12px;
  }
  .side-foot {
    padding: 8px 12px 12px;
  }
  .main {
    padding: 12px 16px 30px;
  }
  .metrics {
    gap: 6px;
  }
  .metric {
    padding: 10px 12px;
  }
  .metric-icon {
    width: 30px;
    height: 30px;
  }
  .metric-v {
    font-size: 16px;
  }
}
</style>