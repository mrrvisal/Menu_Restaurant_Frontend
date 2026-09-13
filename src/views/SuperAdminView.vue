<template>
  <div class="shell" :class="{ 'nav-open': mobileNavOpen }">
    <!-- MOBILE TOP BAR -->
    <div class="mobile-bar sel-light">
      <div class="mark "><img width="40" src="https://res.cloudinary.com/daji2ml3y/image/upload/v1783262055/ChatGPT_Image_Jul_5_2026_09_32_32_PM_c6ziic.png" alt=""></div>
      <span class="mobile-bar-title">{{ t.super_admin }}</span>
      <button class="icon-btn" @click="mobileNavOpen = !mobileNavOpen" :aria-label="t.toggle_nav">
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
        <button
          class="nav-item"
          :class="{ active: tab === 'orders' }"
          @click="tab = 'orders'; fetchOrders(); mobileNavOpen = false"
        >
          <AppIcon name="orders" :size="18" />
          <span>{{ t.orders }}</span>
        </button>
        <button
          class="nav-item"
          :class="{ active: tab === 'access' }"
          @click="tab = 'access'; fetchAccess(); mobileNavOpen = false"
        >
          <AppIcon name="activity" :size="18" />
          <span>{{ t.access_logs }}</span>
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
          <h1 class="page-title">{{ tab === 'users' ? t.users : tab === 'orders' ? t.orders : tab === 'access' ? t.access_logs : t.restaurants }}</h1>
          <p class="page-sub">{{ t.super_admin }} · {{ t.manage_system }}</p>
        </div>
        <button
          class="btn btn-refresh"
          :class="{ spinning: loading }"
          :disabled="loading"
          @click="refreshAll"
        >
          <AppIcon name="refresh" :size="15" /> {{ t.refresh }}
        </button>
      </header>

      <!-- STATS -->
      <section class="stats-grid">
        <div class="stat-card stat-click" role="button" :title="t.users" @click="goToTab('users')">
          <div class="stat-icon-wrap icon-teal"><AppIcon name="users" :size="20" /></div>
          <div class="stat-body">
            <span class="stat-num">{{ stats.totalUsers }}</span>
            <span class="stat-label">{{ t.total_users }}</span>
          </div>
          <div class="stat-spark teal"></div>
        </div>
        <div class="stat-card stat-click" role="button" :title="t.restaurants" @click="goToTab('restaurants')">
          <div class="stat-icon-wrap icon-amber"><AppIcon name="store" :size="20" /></div>
          <div class="stat-body">
            <span class="stat-num">{{ stats.totalRestaurants }}</span>
            <span class="stat-label">{{ t.total_restaurants }}</span>
          </div>
          <div class="stat-spark amber"></div>
        </div>
        <div class="stat-card stat-click" role="button" :title="t.orders" @click="goToTab('orders')">
          <div class="stat-icon-wrap icon-blue"><AppIcon name="clipboard" :size="20" /></div>
          <div class="stat-body">
            <span class="stat-num">{{ stats.totalOrders }}</span>
            <span class="stat-label">{{ t.total_orders }}</span>
          </div>
          <div class="stat-spark blue"></div>
        </div>
        <div class="stat-card stat-click" role="button" :title="t.foods" @click="goToTab('restaurants')">
          <div class="stat-icon-wrap icon-green"><AppIcon name="food" :size="20" /></div>
          <div class="stat-body">
            <span class="stat-num">{{ stats.totalFoods }}</span>
            <span class="stat-label">{{ t.total_foods }}</span>
          </div>
          <div class="stat-spark green"></div>
        </div>
        <div class="stat-card stat-click" role="button" :title="t.orders_today" @click="goToTab('orders')">
          <div class="stat-icon-wrap icon-blue"><AppIcon name="orders" :size="20" /></div>
          <div class="stat-body">
            <span class="stat-num">{{ stats.todayOrders ?? 0 }}</span>
            <span class="stat-label">{{ t.orders_today }}</span>
          </div>
          <div class="stat-spark blue"></div>
        </div>
        <div class="stat-card stat-click" role="button" :title="t.unverified_users" @click="goToTab('users')">
          <div class="stat-icon-wrap icon-teal"><AppIcon name="tick-circle" :size="20" /></div>
          <div class="stat-body">
            <span class="stat-num">{{ stats.unverifiedUsers ?? 0 }}</span>
            <span class="stat-label">{{ t.unverified_users }}</span>
          </div>
          <div class="stat-spark teal"></div>
        </div>
        <div class="stat-card stat-click" role="button" :title="t.pending" @click="goToTab('orders')">
          <div class="stat-icon-wrap icon-amber"><AppIcon name="clock" :size="20" /></div>
          <div class="stat-body">
            <span class="stat-num">{{ stats.pendingOrders ?? 0 }}</span>
            <span class="stat-label">{{ t.pending }}</span>
          </div>
          <div class="stat-spark amber"></div>
        </div>
        <div class="stat-card stat-click" role="button" :title="t.revenue_label" @click="goToTab('orders')">
          <div class="stat-icon-wrap icon-green"><AppIcon name="cart" :size="20" /></div>
          <div class="stat-body">
            <span class="stat-num">{{ formatMoney(stats.revenue ?? 0) }}</span>
            <span class="stat-label">{{ t.revenue_label }}</span>
          </div>
          <div class="stat-spark green"></div>
        </div>
      </section>

      <!-- USERS -->
      <section v-if="tab === 'users'" class="panel">
        <div class="panel-head">
          <span class="panel-title"><AppIcon name="users" :size="16" /> {{ t.users }}</span>
          <div class="panel-tools">
            <div class="search-box">
              <AppIcon name="search" :size="14" />
              <input v-model="userSearch" class="search-input" :placeholder="t.search" />
            </div>
            <AppSelect
              size="sm"
              variant="teal"
              min-width="110px"
              :model-value="userSort"
              :options="userSortOptions"
              @update:model-value="userSort = $event"
            />
            <span class="panel-count">{{ filteredUsers.length }}</span>
          </div>
        </div>

        <div class="order-chips">
          <button
            v-for="s in userRoleFilters"
            :key="s.value"
            class="chip"
            :class="{ 'chip-active': userRoleFilter === s.value }"
            @click="userRoleFilter = s.value"
          >
            {{ s.label }}
          </button>
        </div>

        <div v-if="loading && !users.length" class="rows">
          <div v-for="i in 3" :key="i" class="skel-row">
            <span class="skel skel-avatar"></span>
            <span class="skel skel-line"></span>
            <span class="skel skel-line short"></span>
          </div>
        </div>
        <div v-else-if="filteredUsers.length" class="rows">
          <div
            v-for="user in filteredUsers"
            :key="user.id"
            class="row"
            @click="openUserDetail(user)"
          >
            <div class="row-main">
              <div class="avatar" :class="user.role === 'super_admin' ? 'avatar-amber' : 'avatar-teal'">
                {{ (user.full_name || user.email || '?').charAt(0).toUpperCase() }}
              </div>
              <div class="row-text">
                <span class="row-muted">{{ user.restaurant_name || t.super_admin_label }}</span>
                <span class="row-sub">{{ user.email }}</span>
              </div>
            </div>

            <div class="row-meta">
              <span class="tag" :class="user.role === 'super_admin' ? 'tag-amber' : 'tag-blue'">
                {{ user.role === "super_admin" ? t.super_admin_label : t.owner }}
              </span>
              <span class="status-dot" :class="'sd-' + user.status">
                <i></i>{{ statusLabel(user.status) }}
              </span>
              <span class="status-dot" :class="user.email_verified_at ? 'sd-verified' : 'sd-pending'">
                <i></i>{{ user.email_verified_at ? t.email_verified : t.not_verified }}
              </span>
              <span class="status-dot sd-lastlogin" :title="t.last_login">
                <i></i>{{ user.last_login_at ? formatDate(user.last_login_at) : t.never }}
              </span>
            </div>

            <div class="row-actions" @click.stop>
              <AppSelect
                size="sm"
                variant="teal"
                min-width="110px"
                :model-value="user.status"
                :options="[
                  { value: 'active', label: t.activate },
                  { value: 'suspended', label: t.suspend },
                  { value: 'inactive', label: t.inactive },
                ]"
                @update:model-value="(v) => updateUserStatus(user.id, v)"
              />
            </div>
          </div>
        </div>
        <div v-else class="empty">
          <AppIcon name="category" :size="34" />
          <p>{{ (userSearch || userRoleFilter) ? t.no_results : t.no_data }}</p>
        </div>
      </section>

      <!-- RESTAURANTS -->
      <section v-if="tab === 'restaurants'" class="panel">
        <div class="panel-head">
          <span class="panel-title"><AppIcon name="store" :size="16" /> {{ t.restaurants }}</span>
          <div class="panel-tools">
            <div class="search-box">
              <AppIcon name="search" :size="14" />
              <input v-model="restaurantSearch" class="search-input" :placeholder="t.search" />
            </div>
            <AppSelect
              size="sm"
              variant="teal"
              min-width="110px"
              :model-value="restSort"
              :options="restSortOptions"
              @update:model-value="restSort = $event"
            />
            <span class="panel-count">{{ filteredRestaurants.length }}</span>
          </div>
        </div>

        <div class="order-chips">
          <button
            v-for="s in restStatusFilters"
            :key="s.value"
            class="chip"
            :class="{ 'chip-active': restStatusFilter === s.value }"
            @click="restStatusFilter = s.value"
          >
            {{ s.label }}
          </button>
        </div>

        <div v-if="loading && !restaurants.length" class="rows">
          <div v-for="i in 3" :key="i" class="skel-row">
            <span class="skel skel-avatar"></span>
            <span class="skel skel-line"></span>
            <span class="skel skel-line short"></span>
          </div>
        </div>
        <div v-else-if="filteredRestaurants.length" class="rows">
          <div
            v-for="r in filteredRestaurants"
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
                <i></i>{{ statusLabel(r.status) }}
              </span>
              <span class="row-muted" v-if="r.orders_count != null">
                {{ r.orders_count }} {{ t.orders }} · {{ r.foods_count }} {{ t.foods }}
              </span>
              <code class="code" v-if="r.telegram_link_code">{{ r.telegram_link_code }}</code>
              <span class="row-muted">{{ formatDate(r.created_at) }}</span>
            </div>

            <div class="row-actions" @click.stop>
              <AppSelect
                size="sm"
                variant="teal"
                min-width="110px"
                :model-value="r.status"
                :options="[
                  { value: 'active', label: t.activate },
                  { value: 'suspended', label: t.suspend },
                  { value: 'inactive', label: t.inactive },
                ]"
                @update:model-value="(v) => updateRestaurantStatus(r.id, v)"
              />
            </div>
          </div>
        </div>
        <div v-else class="empty">
          <AppIcon name="category" :size="34" />
          <p>{{ (restaurantSearch || restStatusFilter) ? t.no_results : t.no_data }}</p>
        </div>
      </section>

      <!-- ORDERS (global feed all restaurants -->
      <section v-if="tab === 'orders'" class="panel">
        <div class="panel-head">
          <span class="panel-title"><AppIcon name="orders" :size="16" /> {{ t.orders }}</span>
          <span class="panel-count">{{ orders.length }}</span>
        </div>

        <div class="order-chips">
          <button
            v-for="s in orderStatuses"
            :key="s.value"
            class="chip"
            :class="{ 'chip-active': orderStatusFilter === s.value }"
            @click="orderStatusFilter = s.value; fetchOrders()"
          >
            {{ s.label }}
          </button>
        </div>

        <div v-if="loading && !orders.length" class="rows">
          <div v-for="i in 3" :key="i" class="skel-row">
            <span class="skel skel-avatar"></span>
            <span class="skel skel-line"></span>
            <span class="skel skel-line short"></span>
          </div>
        </div>
        <div v-else-if="orders.length" class="rows">
          <div
            v-for="o in orders"
            :key="o.id"
            class="row"
            @click="openOrderDetail(o)"
          >
            <div class="row-main">
              <div class="avatar avatar-amber avatar-square"><AppIcon name="orders" :size="16" /></div>
              <div class="row-text">
                <span class="row-title">#{{ o.id }} · {{ o.restaurant_name }}</span>
                <span class="row-sub">{{ o.tableNo }} · {{ o.customerName || "—" }}</span>
              </div>
            </div>

            <div class="row-meta">
              <span class="os" :class="'os-' + o.status">
                <i></i>{{ orderStatusLabel(o.status) }}
              </span>
              <span class="row-muted">{{ o.items.length }} {{ t.order_items }} · {{ formatMoney(o.total) }}</span>
              <span class="row-muted">{{ formatDateTime(o.createdAt) }}</span>
            </div>
          </div>
        </div>
        <div v-else class="empty">
          <AppIcon name="orders" :size="34" />
          <p>{{ orderStatusFilter ? t.no_results : t.no_data }}</p>
        </div>
      </section>

      <!-- ACCESS / AUDIT -->
      <template v-if="tab === 'access'">
        <section class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon-wrap icon-teal"><AppIcon name="users" :size="20" /></div>
            <div class="stat-body">
              <span class="stat-num">{{ accessStats.usersToday ?? 0 }}</span>
              <span class="stat-label">{{ t.unique_users_today }}</span>
            </div>
            <div class="stat-spark teal"></div>
          </div>
          <div class="stat-card">
            <div class="stat-icon-wrap icon-green"><AppIcon name="activity" :size="20" /></div>
            <div class="stat-body">
              <span class="stat-num">{{ accessStats.onlineNow ?? 0 }}</span>
              <span class="stat-label">{{ t.online_now }}</span>
            </div>
            <div class="stat-spark green"></div>
          </div>
          <div class="stat-card">
            <div class="stat-icon-wrap icon-blue"><AppIcon name="key" :size="20" /></div>
            <div class="stat-body">
              <span class="stat-num">{{ accessStats.loginsToday ?? 0 }}</span>
              <span class="stat-label">{{ t.logins_today }}</span>
            </div>
            <div class="stat-spark blue"></div>
          </div>
          <div class="stat-card">
            <div class="stat-icon-wrap icon-amber"><AppIcon name="lock" :size="20" /></div>
            <div class="stat-body">
              <span class="stat-num">{{ accessStats.activeSessions ?? 0 }}</span>
              <span class="stat-label">{{ t.active_sessions }}</span>
            </div>
            <div class="stat-spark amber"></div>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <span class="panel-title"><AppIcon name="activity" :size="16" /> {{ t.access_logs }}</span>
            <div class="panel-tools">
              <div class="search-box">
                <AppIcon name="search" :size="14" />
                <input v-model="accessSearch" class="search-input" :placeholder="t.search" />
              </div>
              <span class="panel-count">{{ filteredAccessLogins.length }}</span>
            </div>
          </div>

          <div class="order-chips">
            <button
              v-for="s in accessMethodFilters"
              :key="s.value"
              class="chip"
              :class="{ 'chip-active': accessMethodFilter === s.value }"
              @click="accessMethodFilter = s.value"
            >
              {{ s.label }}
            </button>
          </div>

          <div v-if="loading && !accessLogins.length" class="rows">
            <div v-for="i in 3" :key="i" class="skel-row">
              <span class="skel skel-avatar"></span>
              <span class="skel skel-line"></span>
              <span class="skel skel-line short"></span>
            </div>
          </div>
          <div v-else-if="filteredAccessLogins.length" class="rows">
            <div v-for="h in filteredAccessLogins" :key="h.id" class="row">
              <div class="row-main">
                <div class="avatar avatar-teal">{{ (h.email || "?").charAt(0).toUpperCase() }}</div>
                <div class="row-text">
                  <span class="row-title">{{ h.fullName || h.email || "—" }}</span>
                  <span class="row-sub">{{ h.email }}{{ h.role === "super_admin" ? " · " + t.super_admin_label : "" }}</span>
                </div>
              </div>

              <div class="row-meta">
                <span class="os" :class="h.method === 'google' ? 'os-served' : 'os-preparing'">
                  <i></i>{{ h.method === 'google' ? t.google_method : t.email_method }}
                </span>
                <span class="row-muted" :title="t.device">{{ h.deviceName || h.browser || "—" }}{{ h.os ? " · " + h.os : "" }}</span>
                <code class="code" v-if="h.ipAddress" :title="t.ip">{{ h.ipAddress }}</code>
                <span class="row-muted" :title="t.location">{{ [h.city, h.country].filter(Boolean).join(", ") || "—" }}</span>
                <span class="row-muted">{{ formatDateTime(h.createdAt) }}</span>
              </div>
            </div>
          </div>
          <div v-else class="empty">
            <AppIcon name="activity" :size="34" />
            <p>{{ (accessSearch || accessMethodFilter) ? t.no_results : t.no_access_yet }}</p>
          </div>
        </section>

        <!-- live sessions -->
        <section class="panel" style="margin-top: 20px">
          <div class="panel-head">
            <span class="panel-title"><AppIcon name="clock" :size="16" /> {{ t.sessions_label }}</span>
            <span class="panel-count">{{ accessSessions.length }}</span>
          </div>

          <div v-if="accessSessions.length" class="rows">
            <div v-for="s in accessSessions" :key="s.id" class="row">
              <div class="row-main">
                <div class="avatar" :class="isOnline(s.lastActiveAt) ? 'avatar-amber' : 'avatar-teal'">
                  {{ (s.email || "?").charAt(0).toUpperCase() }}
                </div>
                <div class="row-text">
                  <span class="row-title">{{ s.fullName || s.email || "—" }}</span>
                  <span class="row-sub">{{ s.email }}</span>
                </div>
              </div>

              <div class="row-meta">
                <span class="status-dot" :class="isOnline(s.lastActiveAt) ? 'sd-verified' : 'sd-inactive'">
                  <i></i>{{ isOnline(s.lastActiveAt) ? t.online : t.offline }}
                </span>
                <span class="row-muted">{{ s.deviceName || s.browser || "—" }}{{ s.os ? " · " + s.os : "" }}</span>
                <code class="code" v-if="s.ipAddress">{{ s.ipAddress }}</code>
                <span class="row-muted">{{ s.loginCount ?? 0 }} {{ t.logins_count }}</span>
                <span class="row-muted" :title="t.last_active">{{ formatDateTime(s.lastActiveAt) }}</span>
              </div>
            </div>
          </div>
          <div v-else class="empty">
            <AppIcon name="lock" :size="34" />
            <p>{{ t.no_data }}</p>
          </div>
        </section>

        <!-- actions feed -->
        <section class="panel" style="margin-top: 20px">
          <div class="panel-head">
            <span class="panel-title"><AppIcon name="clipboard" :size="16" /> {{ t.actions_feed }}</span>
            <span class="panel-count">{{ accessActivities.length }}</span>
          </div>

          <div v-if="accessActivities.length" class="rows">
            <div v-for="a in accessActivities" :key="a.id" class="row">
              <div class="row-main">
                <div class="avatar avatar-teal avatar-square"><AppIcon name="clipboard" :size="15" /></div>
                <div class="row-text">
                  <span class="row-title">{{ a.action }}</span>
                  <span class="row-sub">{{ a.description || "—" }}</span>
                </div>
              </div>
              <div class="row-meta">
                <span class="row-muted">{{ a.email || "—" }}</span>
                <code class="code" v-if="a.ipAddress">{{ a.ipAddress }}</code>
                <span class="row-muted">{{ formatDateTime(a.createdAt) }}</span>
              </div>
            </div>
          </div>
          <div v-else class="empty">
            <AppIcon name="clipboard" :size="34" />
            <p>{{ t.no_data }}</p>
          </div>
        </section>
      </template>
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
              <button class="icon-btn" @click="selectedUser = null" :aria-label="t.close"><AppIcon name="x" :size="16" /></button>
            </div>

            <div class="drawer-body">
              <div class="field-grid">
                <div class="field">
                  <span class="field-label">{{ t.id }}</span>
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
                  <span class="status-dot" :class="'sd-' + selectedUser.status"><i></i>{{ statusLabel(selectedUser.status) }}</span>
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
                <div class="field">
                  <span class="field-label">{{ t.last_login }}</span>
                  <span class="field-value">{{ selectedUser.last_login_at ? formatDateTime(selectedUser.last_login_at) : t.never }}</span>
                </div>
              </div>

              <div class="logins-block">
                <div class="logins-title"><AppIcon name="clock" :size="12" /> {{ t.recent_logins }}</div>
                <div v-if="selectedUser.loginHistory?.length" class="logins">
                  <div v-for="h in selectedUser.loginHistory" :key="h.id" class="login-item">
                    <div class="login-main">
                      <strong>{{ h.deviceName || "—" }}</strong>
                      <span>{{ t.via }} {{ h.method === 'google' ? t.google_method : t.email_method }} · {{ [h.city, h.region, h.country].filter(Boolean).join(", ") || "—" }}</span>
                    </div>
                    <div class="login-side">
                      <span class="row-muted" :title="t.device">{{ h.browser || "—" }}{{ h.os ? " · " + h.os : "" }}</span>
                      <code class="code" v-if="h.ipAddress" :title="t.ip">{{ h.ipAddress }}</code>
                      <span class="os" :class="h.method === 'google' ? 'os-served' : 'os-preparing'">
                        <i></i>{{ h.method === 'google' ? t.google_method : t.email_method }}
                      </span>
                      <span class="row-muted" :title="t.location">{{ formatDateTime(h.createdAt) }}</span>
                    </div>
                  </div>
                </div>
                <div v-else class="logins-empty">{{ t.no_logins_yet }}</div>
              </div>

              <div class="drawer-actions">
                <AppSelect
                  block
                  size="sm"
                  variant="teal"
                  :model-value="selectedUser.status"
                  :options="[
                    { value: 'active', label: t.activate },
                    { value: 'suspended', label: t.suspend },
                    { value: 'inactive', label: t.inactive },
                  ]"
                  @update:model-value="updateModalUserStatus"
                />

                <AppSelect
                  block
                  size="sm"
                  variant="teal"
                  :model-value="selectedUser.role"
                  :disabled="selectedUser.id === auth.user?.id"
                  :title="t.change_role"
                  :options="[
                    { value: 'owner', label: t.owner },
                    { value: 'super_admin', label: t.super_admin_label },
                  ]"
                  @update:model-value="changeUserRole"
                />

                <button
                  v-if="!selectedUser.email_verified_at"
                  class="btn btn-green"
                  @click="verifyUserEmail(selectedUser.id)"
                >
                  <AppIcon name="check" :size="14" /> {{ t.verify_email_btn }}
                </button>
                <button
                  v-if="!selectedUser.email_verified_at"
                  class="btn btn-blue"
                  @click="resendVerification(selectedUser.id)"
                >
                  <AppIcon name="mail" :size="14" /> {{ t.resend_verification }}
                </button>
                <button class="btn btn-blue" @click="resetUserPassword(selectedUser)">
                  <AppIcon name="key" :size="14" /> {{ t.reset_password }}
                </button>
                <button
                  v-if="selectedUser.id !== auth.user?.id"
                  class="btn btn-red"
                  @click="deleteUser(selectedUser)"
                >
                  <AppIcon name="trash" :size="14" /> {{ t.delete_user }}
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
              <button class="icon-btn" @click="selectedRestaurant = null" :aria-label="t.close"><AppIcon name="x" :size="16" /></button>
            </div>

            <div class="drawer-body">
              <div class="field-grid">
                <div class="field">
                  <span class="field-label">{{ t.id }}</span>
                  <span class="field-value">#{{ selectedRestaurant.id }}</span>
                </div>
                <div class="field">
                  <span class="field-label">{{ t.restaurant_name }}</span>
                  <span class="field-value">{{ selectedRestaurant.name }}</span>
                </div>
                <div class="field">
                  <span class="field-label">{{ t.status }}</span>
                  <span class="status-dot" :class="'sd-' + selectedRestaurant.status">
                    <i></i>{{ statusLabel(selectedRestaurant.status) }}
                  </span>
                </div>
                <div class="field">
                  <span class="field-label">{{ t.default_language }}</span>
                  <span class="field-value">{{ (selectedRestaurant.default_language || "km").toUpperCase() }}</span>
                </div>
                <div class="field">
                  <span class="field-label">{{ t.theme_color }}</span>
                  <span class="field-value">
                    <span class="swatch" :style="{ background: selectedRestaurant.theme_color || '#0f766e' }"></span>
                    {{ selectedRestaurant.theme_color || "—" }}
                  </span>
                </div>
                <div class="field">
                  <span class="field-label">{{ t.telegram }}</span>
                  <span class="status-dot" :class="selectedRestaurant.telegram_chat_id ? 'sd-verified' : 'sd-pending'">
                    <i></i>{{ selectedRestaurant.telegram_chat_id ? t.linked : t.not_linked }}
                  </span>
                </div>
                <div class="field">
                  <span class="field-label">{{ t.telegram_link_code || t.link_code }}</span>
                  <span class="field-value link-row">
                    <code class="code">{{ selectedRestaurant.telegram_link_code || "—" }}</code>
                    <button
                      v-if="selectedRestaurant.telegram_link_code"
                      class="copy-btn"
                      @click="copyText(selectedRestaurant.telegram_link_code)"
                    >
                      <AppIcon name="copy" :size="12" /> {{ t.copy_link }}
                    </button>
                  </span>
                </div>
                <div class="field">
                  <span class="field-label">{{ t.orders }}</span>
                  <span class="field-value">{{ selectedRestaurant.orders_count ?? 0 }}</span>
                </div>
                <div class="field">
                  <span class="field-label">{{ t.foods }}</span>
                  <span class="field-value">{{ selectedRestaurant.foods_count ?? 0 }}</span>
                </div>
                <div class="field">
                  <span class="field-label">{{ t.created_at }}</span>
                  <span class="field-value">{{ formatDate(selectedRestaurant.created_at) }}</span>
                </div>
              </div>

              <div class="drawer-actions">
                <AppSelect
                  block
                  size="sm"
                  variant="teal"
                  :model-value="selectedRestaurant.status"
                  :options="[
                    { value: 'active', label: t.activate },
                    { value: 'suspended', label: t.suspend },
                    { value: 'inactive', label: t.inactive },
                  ]"
                  @update:model-value="(v) => updateRestaurantStatus(selectedRestaurant.id, v)"
                />
                <button class="btn btn-ghost" @click="selectedRestaurant = null">{{ t.close }}</button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ORDER DETAIL DRAWER (all restaurants) -->
    <Teleport to="body">
      <Transition name="drawer">
        <div v-if="selectedOrder" class="drawer-overlay" @click.self="selectedOrder = null">
          <div class="drawer">
            <div class="drawer-head">
              <div class="drawer-id">
                <div class="avatar avatar-lg avatar-amber avatar-square"><AppIcon name="orders" :size="20" /></div>
                <div>
                  <div class="drawer-title">#{{ selectedOrder.id }} · {{ selectedOrder.restaurant_name }}</div>
                  <div class="drawer-sub">{{ t.table_no }} {{ selectedOrder.tableNo }}</div>
                </div>
              </div>
              <button class="icon-btn" @click="selectedOrder = null" :aria-label="t.close"><AppIcon name="x" :size="16" /></button>
            </div>

            <div class="drawer-body">
              <div class="field-grid">
                <div class="field">
                  <span class="field-label">{{ t.status }}</span>
                  <span class="os" :class="'os-' + selectedOrder.status">
                    <i></i>{{ orderStatusLabel(selectedOrder.status) }}
                  </span>
                </div>
                <div class="field">
                  <span class="field-label">{{ t.customer }}</span>
                  <span class="field-value">{{ selectedOrder.customerName || "—" }}</span>
                </div>
                <div class="field">
                  <span class="field-label">{{ t.total_revenue }}</span>
                  <span class="field-value">{{ formatMoney(selectedOrder.total) }}</span>
                </div>
                <div class="field">
                  <span class="field-label">{{ t.created_at }}</span>
                  <span class="field-value">{{ formatDateTime(selectedOrder.createdAt) }}</span>
                </div>
                <div class="field field-full">
                  <span class="field-label">{{ t.note }}</span>
                  <span class="field-value note-text">{{ selectedOrder.note || t.no_note }}</span>
                </div>
              </div>

              <div class="logins-block">
                <div class="logins-title">{{ t.order_items }}</div>
                <div class="logins">
                  <div
                    v-for="(item, i) in selectedOrder.items"
                    :key="i"
                    class="login-item"
                  >
                    <div class="login-main">
                      <strong>{{ item.name }}</strong>
                      <span class="row-muted">{{ item.qty }} × {{ formatMoney(item.price) }}</span>
                    </div>
                    <div class="login-side">
                      <code class="code">{{ t.subtotal }}: {{ formatMoney((Number(item.price) || 0) * (Number(item.qty) || 0)) }}</code>
                    </div>
                  </div>
                </div>
                <div class="order-total-row">
                  <span>{{ t.total }}:</span>
                  <strong>{{ formatMoney(selectedOrder.total) }}</strong>
                </div>
              </div>

              <div class="drawer-actions">
                <AppSelect
                  block
                  size="sm"
                  variant="teal"
                  :model-value="selectedOrder.status"
                  :options="orderStatusOptions"
                  @update:model-value="updateOrderStatus"
                />
                <button class="btn btn-ghost" @click="selectedOrder = null">{{ t.close }}</button>
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

    <!-- TOASTS -->
    <Teleport to="body">
      <div class="toast-stack">
        <TransitionGroup name="toast">
          <div v-for="toast in toasts" :key="toast.id" class="toast" :class="'toast-' + toast.type">
            <AppIcon :name="toast.type === 'error' ? 'x-octagon' : 'tick-circle'" :size="15" />
            <span>{{ toast.message }}</span>
          </div>
        </TransitionGroup>
      </div>
    </Teleport>

    <!-- CUSTOM CONFIRM -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="confirmState" class="modal-overlay" @click.self="closeConfirm">
          <div class="confirm-box pop-in">
            <div class="confirm-icon"><AppIcon :name="confirmState.danger ? 'trash' : 'check'" :size="36" /></div>
            <div class="confirm-title" :class="{ 'confirm-title--red': confirmState.danger }">{{ confirmState.title }}</div>
            <div class="confirm-name">{{ confirmState.message }}</div>
            <div class="confirm-btns">
              <button class="confirm-cancel" @click="closeConfirm">{{ t.cancel }}</button>
              <button class="confirm-logout" :class="{ 'confirm-danger': confirmState.danger }" @click="runConfirm">
                {{ confirmState.confirmLabel }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- TEMP PASSWORD -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="tempPw" class="modal-overlay" @click.self="tempPw = null">
          <div class="confirm-box pop-in">
            <div class="confirm-icon"><AppIcon name="key" :size="36" /></div>
            <div class="confirm-title confirm-title--blue">{{ t.temp_password }}</div>
            <div class="confirm-name">{{ tempPw.email }}</div>
            <div class="temp-pw-row">
              <code class="code temp-pw">{{ tempPw.password }}</code>
              <button class="btn btn-ghost" @click="copyText(tempPw.password)">{{ t.copy }}</button>
            </div>
            <div class="confirm-btns">
              <button class="confirm-cancel" @click="tempPw = null">{{ t.close }}</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useI18nStore } from "@/stores/i18n";
import AppIcon from "@/components/AppIcon.vue";
import AppSelect from "@/components/AppSelect.vue";
import axios from "axios";

const router = useRouter();
const auth = useAuthStore();
// Destructuring a Pinia store loses reactivity — use storeToRefs so `t` and
// `locale` stay reactive and the UI re-translates when the language toggles.
const i18n = useI18nStore();
const { t, locale } = storeToRefs(i18n);
const { toggleLocale } = i18n;
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

// Loading + search state
const loading = ref(false);
const userSearch = ref("");
const restaurantSearch = ref("");

// Filters, sort, toast / confirm / temp-password state
const userRoleFilter = ref("");
const userSort = ref("newest");
const restStatusFilter = ref("");
const restSort = ref("newest");
const toasts = ref([]);
const confirmState = ref(null);
const tempPw = ref(null);

// Orders (global feed) + order detail drawer
const orders = ref([]);
const orderStatusFilter = ref("");
const selectedOrder = ref(null);

// Access / audit (who accessed the site)
const accessStats = ref({});
const accessSessions = ref([]);
const accessLogins = ref([]);
const accessActivities = ref([]);
const accessSearch = ref("");
const accessMethodFilter = ref("");

const accessMethodFilters = computed(() => [
  { value: "", label: t.value.all },
  { value: "email", label: t.value.email_method },
  { value: "google", label: t.value.google_method },
]);

const filteredAccessLogins = computed(() => {
  let list = accessLogins.value;
  if (accessMethodFilter.value) {
    list = list.filter((h) => h.method === accessMethodFilter.value);
  }
  const q = accessSearch.value.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (h) =>
        (h.email || "").toLowerCase().includes(q) ||
        (h.fullName || "").toLowerCase().includes(q) ||
        (h.ipAddress || "").toLowerCase().includes(q) ||
        (h.deviceName || "").toLowerCase().includes(q) ||
        (h.browser || "").toLowerCase().includes(q),
    );
  }
  return list;
});

// A session is "online" if it sent a heartbeat within the last 15 minutes
function isOnline(lastActiveAt) {
  if (!lastActiveAt) return false;
  return Date.now() - new Date(lastActiveAt).getTime() < 15 * 60 * 1000;
}

async function fetchAccess() {
  try {
    const res = await axios.get(`${API_BASE}/api/admin/access`);
    accessStats.value = res.data.stats || {};
    accessSessions.value = res.data.sessions || [];
    accessLogins.value = res.data.logins || [];
    accessActivities.value = res.data.activities || [];
  } catch (err) {
    console.error(err);
  }
}

const filteredUsers = computed(() => {
  let list = users.value;
  if (userRoleFilter.value) {
    list = list.filter((u) => u.role === userRoleFilter.value);
  }
  const q = userSearch.value.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (u) =>
        (u.full_name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.restaurant_name || "").toLowerCase().includes(q),
    );
  }
  const s = userSort.value;
  return [...list].sort((a, b) => {
    if (s === "name") {
      return (a.full_name || a.email || "").localeCompare(b.full_name || b.email || "");
    }
    const ta = new Date(a.created_at || 0).getTime();
    const tb = new Date(b.created_at || 0).getTime();
    return s === "oldest" ? ta - tb : tb - ta;
  });
});

const filteredRestaurants = computed(() => {
  let list = restaurants.value;
  if (restStatusFilter.value) {
    list = list.filter((r) => r.status === restStatusFilter.value);
  }
  const q = restaurantSearch.value.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (r) =>
        (r.name || "").toLowerCase().includes(q) ||
        (r.owner_email || "").toLowerCase().includes(q),
    );
  }
  const s = restSort.value;
  return [...list].sort((a, b) => {
    if (s === "name") {
      return (a.name || "").localeCompare(b.name || "");
    }
    if (s === "orders") {
      return (b.orders_count || 0) - (a.orders_count || 0);
    }
    const ta = new Date(a.created_at || 0).getTime();
    const tb = new Date(b.created_at || 0).getTime();
    return s === "oldest" ? ta - tb : tb - ta;
  });
});

const userSortOptions = computed(() => [
  { value: "newest", label: t.value.sort_newest },
  { value: "oldest", label: t.value.sort_oldest },
  { value: "name", label: t.value.sort_name },
]);

const restSortOptions = computed(() => [
  { value: "newest", label: t.value.sort_newest },
  { value: "oldest", label: t.value.sort_oldest },
  { value: "name", label: t.value.sort_name },
  { value: "orders", label: t.value.sort_orders },
]);

const userRoleFilters = computed(() => [
  { value: "", label: t.value.all_users },
  { value: "owner", label: t.value.owners },
  { value: "super_admin", label: t.value.admins },
]);

const restStatusFilters = computed(() => [
  { value: "", label: t.value.all },
  { value: "active", label: t.value.activate },
  { value: "suspended", label: t.value.suspend },
  { value: "inactive", label: t.value.inactive },
]);

// Translate raw enum status values for display
function statusLabel(s) {
  if (s === "active") return t.value.activate;
  if (s === "suspended") return t.value.suspend;
  if (s === "inactive") return t.value.inactive;
  return s;
}

function orderStatusLabel(s) {
  const labels = {
    pending: t.value.pending,
    confirmed: t.value.confirmed,
    preparing: t.value.preparing,
    ready: t.value.ready,
    served: t.value.served,
    cancelled: t.value.cancelled,
  };
  return labels[s] || s;
}

const ORDER_STATUS_VALUES = ["pending", "confirmed", "preparing", "ready", "served", "cancelled"];

const orderStatuses = computed(() => [
  { value: "", label: t.value.all },
  ...ORDER_STATUS_VALUES.map((s) => ({ value: s, label: orderStatusLabel(s) })),
]);

const orderStatusOptions = computed(() =>
  ORDER_STATUS_VALUES.map((s) => ({ value: s, label: orderStatusLabel(s) })),
);

async function refreshAll() {
  loading.value = true;
  try {
    const [s, u, r, o, a] = await Promise.all([
      axios.get(`${API_BASE}/api/admin/stats`),
      axios.get(`${API_BASE}/api/admin/users`),
      axios.get(`${API_BASE}/api/admin/restaurants`),
      axios.get(`${API_BASE}/api/admin/orders`),
      axios.get(`${API_BASE}/api/admin/access`),
    ]);
    stats.value = s.data;
    users.value = u.data;
    restaurants.value = r.data;
    orders.value = o.data || [];
    accessStats.value = a.data.stats || {};
    accessSessions.value = a.data.sessions || [];
    accessLogins.value = a.data.logins || [];
    accessActivities.value = a.data.activities || [];
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
}

onMounted(refreshAll);

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

async function fetchOrders() {
  try {
    const res = await axios.get(`${API_BASE}/api/admin/orders`, {
      params: { status: orderStatusFilter.value || undefined },
    });
    orders.value = res.data || [];
  } catch (err) {
    console.error(err);
  }
}

function openOrderDetail(o) {
  let items = o.items;
  if (typeof items === "string") {
    try { items = JSON.parse(items); } catch (e) { items = []; }
  }
  selectedOrder.value = { ...o, items: items || [] };
}

async function updateOrderStatus(status) {
  if (!selectedOrder.value) return;
  try {
    await axios.patch(`${API_BASE}/api/orders/${selectedOrder.value.id}/status`, { status });
    selectedOrder.value.status = status;
    const row = orders.value.find((x) => x.id === selectedOrder.value.id);
    if (row) row.status = status;
    pushToast(t.value.status_updated);
  } catch (err) {
    pushToast(err.response?.data?.error || t.value.error, "error");
  }
}

async function loadLoginHistory(userId) {
  try {
    const res = await axios.get(`${API_BASE}/api/admin/users/${userId}/login-history`);
    if (selectedUser.value && selectedUser.value.id === userId) {
      selectedUser.value.loginHistory = res.data || [];
    }
  } catch (err) {
    console.error(err);
  }
}

async function resetUserPassword(u) {
  askConfirm({
    title: t.value.reset_password,
    message: `${u.email}?`,
    confirmLabel: t.value.reset_password,
    danger: true,
    onConfirm: async () => {
      try {
        const res = await axios.post(`${API_BASE}/api/admin/users/${u.id}/reset-password`);
        const pw = res.data.tempPassword || "";
        tempPw.value = { email: u.email, password: pw };
        if (navigator.clipboard?.writeText) {
          try { await navigator.clipboard.writeText(pw); } catch (e) { /* noop */ }
        }
      } catch (err) {
        pushToast(err.response?.data?.error || t.value.error, "error");
      }
    },
  });
}

async function deleteUser(u) {
  if (u.id === auth.user?.id) return;
  askConfirm({
    title: t.value.delete_user,
    message: t.value.confirm_delete_user,
    confirmLabel: t.value.delete_user,
    danger: true,
    onConfirm: async () => {
      try {
        await axios.delete(`${API_BASE}/api/admin/users/${u.id}`);
        users.value = users.value.filter((x) => x.id !== u.id);
        if (selectedUser.value?.id === u.id) selectedUser.value = null;
        pushToast(t.value.user_deleted);
      } catch (err) {
        pushToast(err.response?.data?.error || t.value.error, "error");
      }
    },
  });
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
    pushToast(t.value.status_updated);
  } catch (err) {
    pushToast(err.response?.data?.error || t.value.error, "error");
  }
}

async function updateRestaurantStatus(restaurantId, status) {
  try {
    await axios.patch(
      `${API_BASE}/api/admin/restaurants/${restaurantId}/status`,
      { status },
    );
    const r = restaurants.value.find((x) => x.id === restaurantId);
    if (r) r.status = status;
    if (selectedRestaurant.value && selectedRestaurant.value.id === restaurantId) {
      selectedRestaurant.value.status = status;
    }
    pushToast(t.value.status_updated);
  } catch (err) {
    pushToast(err.response?.data?.error || t.value.error, "error");
  }
}

// Role change with explicit confirmation; never allowed on your own account
async function changeUserRole(newRole) {
  const u = selectedUser.value;
  if (!u || newRole === u.role) return;
  const prev = u.role;
  if (u.id === auth.user?.id) {
    pushToast(t.value.cannot_change_own_role, "error");
    u.role = prev;
    return;
  }
  const roleLabel = newRole === "super_admin" ? t.value.super_admin_label : t.value.owner;
  askConfirm({
    title: t.value.change_role,
    message: `${t.value.confirm_role_to} "${roleLabel}"?`,
    confirmLabel: t.value.confirm,
    onConfirm: async () => {
      try {
        await axios.patch(`${API_BASE}/api/admin/users/${u.id}/role`, {
          role: newRole,
        });
        u.role = newRole;
        const row = users.value.find((x) => x.id === u.id);
        if (row) row.role = newRole;
        pushToast(t.value.role_updated);
      } catch (err) {
        u.role = prev;
        pushToast(err.response?.data?.error || t.value.error, "error");
      }
    },
  });
}

function openUserDetail(user) {
  selectedUser.value = { ...user, loginHistory: [] };
  loadLoginHistory(user.id);
}

function openRestaurantDetail(restaurant) {
  selectedRestaurant.value = { ...restaurant };
}

// ─── TOASTS / CONFIRMS / SHORTCUTS ─────────────────────────
function pushToast(message, type = "success") {
  const id = Date.now() + Math.random();
  toasts.value.push({ id, message, type });
  setTimeout(() => {
    toasts.value = toasts.value.filter((x) => x.id !== id);
  }, 3200);
}

function askConfirm({ title, message, confirmLabel = t.value.confirm, danger = false, onConfirm }) {
  confirmState.value = { title, message, confirmLabel, danger, onConfirm };
}
function closeConfirm() { confirmState.value = null; }
function runConfirm() {
  const c = confirmState.value;
  if (!c) return;
  confirmState.value = null;
  c.onConfirm && c.onConfirm();
}

function goToTab(name) {
  tab.value = name;
  if (name === "users") fetchUsers();
  else if (name === "restaurants") fetchRestaurants();
  else if (name === "orders") fetchOrders();
  else if (name === "access") fetchAccess();
}

async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
    pushToast(t.value.link_copied);
  } catch (e) {
    pushToast(t.value.error, "error");
  }
}

function localeTag() {
  return locale.value === "km" ? "km-KH" : "en-US";
}

function updateModalUserStatus(status) {
  if (selectedUser.value) {
    updateUserStatus(selectedUser.value.id, status);
  }
}

async function verifyUserEmail(userId) {
  try {
    await axios.post(`${API_BASE}/api/admin/users/${userId}/verify`);
    if (selectedUser.value && selectedUser.value.id === userId) {
      selectedUser.value.email_verified_at = new Date().toISOString();
    }
    const user = users.value.find(u => u.id === userId);
    if (user) user.email_verified_at = new Date().toISOString();
    pushToast(t.value.email_verified_ok);
  } catch (err) {
    pushToast(err.response?.data?.error || t.value.error, "error");
  }
}

async function resendVerification(userId) {
  try {
    await axios.post(`${API_BASE}/api/admin/users/${userId}/resend-verification`);
    pushToast(t.value.verification_sent);
  } catch (err) {
    pushToast(err.response?.data?.error || t.value.error, "error");
  }
}

function formatDate(d) {
  return new Date(d).toLocaleDateString(localeTag());
}

function formatDateTime(d) {
  if (!d) return t.value.never;
  return new Date(d).toLocaleString(localeTag(), {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Money matches the rest of the app: Riel, grouped, no decimals shown.
function formatMoney(n) {
  return `${Number(n || 0).toLocaleString()}៛`;
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
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}
.btn-refresh {
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--ink);
}
.btn-refresh:hover:not(:disabled) {
  background: var(--surface-warm);
  border-color: var(--green-soft);
}
.btn-refresh:disabled { opacity: 0.6; cursor: default; }
.btn-refresh.spinning :deep(svg) { animation: spin 0.8s linear infinite; }
@keyframes spin {
  to { transform: rotate(360deg); }
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
.panel-tools {
  display: flex;
  align-items: center;
  gap: 10px;
}
.search-box {
  display: flex;
  align-items: center;
  gap: 7px;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 9px;
  padding: 6px 10px;
  color: var(--muted);
  transition: border-color 0.15s, box-shadow 0.15s;
}
.search-box:focus-within {
  border-color: var(--green);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.12);
}
.search-input {
  border: none;
  outline: none;
  background: transparent;
  font-family: inherit;
  font-size: 12px;
  color: var(--text);
  width: 170px;
}
.search-input::placeholder { color: var(--muted-light); }

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

/* ═══ ORDER CHIPS (status filter) ═══ */
.order-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  padding:  14px 20px;
  border-bottom: 1px solid #f1f5f9;
}
.chip {
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--muted);
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 600;
  padding: 5px 14px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.15s;
}
.chip:hover { border-color: var(--green-soft); color: var(--ink); }
.chip-active {
  background: linear-gradient(135deg, var(--teal), var(--green));
  border-color: transparent;
  color: white;
}

/* ═══ ORDER STATUS BADGES ═══ */
.os {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}
.os i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
}
.os-pending i { background: #f59e0b; box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.15); }
.os-confirmed i { background: #2563eb; }
.os-preparing i { background: #7c3aed; }
.os-ready i { background: #0f766e; }
.os-served i { background: #16a34a; }
.os-cancelled i { background: var(--red); }

/* ═══ LOGINS LIST (user drawer) ═══ */
.logins-block {
  background: var(--surface-soft);
  border-radius: 13px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.logins-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--muted-light);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.logins {
  display: flex;
  flex-direction: column;
}
.login-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-light);
}
.login-item:last-child { border-bottom: none; padding-bottom: 0; }
.login-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.login-main strong {
  font-size: 12.5px;
  color: var(--ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.login-main span { font-size: 11.5px; color: var(--muted); }
.login-side {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.logins-empty {
  font-size: 12px;
  color: var(--muted);
  text-align: center;
  padding: 10px;
}

/* ═══ DANGER BUTTON ═══ */
.btn-red { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }
.btn-red:hover { background: #fecaca; }

/* ═══ CLICKABLE STAT CARDS ═══ */
.stat-click { cursor: pointer; }

/* ═══ SKELETON LOADING ═══ */
.skel-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid #f1f5f9;
}
.skel {
  display: inline-block;
  background: linear-gradient(90deg, #eef2f0, #f6faf7, #eef2f0);
  background-size: 200% 100%;
  animation: skel-shimmer 1.2s ease-in-out infinite;
  border-radius: 8px;
}
@keyframes skel-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.skel-avatar { width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0; }
.skel-line { flex: 1; height: 12px; max-width: 220px; }
.skel-line.short { max-width: 120px; }

/* ═══ TOASTS ═══ */
.toast-stack {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 3000;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.toast {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-left: 4px solid var(--green);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  max-width: 320px;
}
.toast-error { border-left-color: var(--red); color: var(--red-deep); }
.toast-enter-active, .toast-leave-active { transition: opacity 0.18s, transform 0.18s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(-8px); }

/* ═══ CONFIRM DANGER + TEMP PASSWORD ═══ */
.confirm-title--red { color: var(--red); }
.confirm-danger { background: var(--red-deep); }
.confirm-danger:hover { background: #8f1d1d; }
.temp-pw-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}
.temp-pw { font-size: 14px; padding: 6px 12px; letter-spacing: 0.5px; }

/* ═══ ORDER TOTAL ═══ */
.order-total-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid var(--border-light);
  font-size: 13px;
  color: var(--text);
}
.order-total-row strong { font-size: 15px; color: var(--teal); }

/* ═══ FIELD EXTRAS ═══ */
.field-full { grid-column: 1 / -1; }
.note-text { white-space: pre-wrap; word-break: break-word; }

/* ═══ LINK COPY + COLOR SWATCH ═══ */
.link-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.copy-btn {
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--teal);
  border-radius: 8px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.copy-btn:hover { background: var(--surface-warm); border-color: var(--green-soft); }
.swatch {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid var(--border);
  vertical-align: middle;
}

/* ═══ LOGIN HISTORY METHOD BADGE ═══ */
.logins-title { display: flex; align-items: center; gap: 5px; }

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
.sd-lastlogin i { background: var(--muted-light); }

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
  background-color: var(--surface);
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

  /* Topbar + search stack on mobile */
  .topbar { flex-direction: column; align-items: stretch; gap: 10px; }
  .btn-refresh { align-self: flex-start; }
  .panel-tools { width: 100%; justify-content: space-between; }
  .search-box { flex: 1; }
  .search-input { width: 100%; min-width: 0; }

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