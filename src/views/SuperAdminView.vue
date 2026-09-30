<!-- Super Admin dashboard — platform-wide users, owners, super admins,
     restaurants, the global order feed and the access/audit trail.
     Structure: shell → sidebar | main (stats grid + one AdminList per tab)
     plus teleported drawers, dialogs and toasts. -->
<template>
  <div class="shell" :class="{ 'nav-open': mobileNavOpen }">
    <!-- ─── MOBILE TOP BAR ─────────────────────────────────── -->
    <div class="mobile-bar">
      <div class="mark"><img :src="BRAND_LOGO" width="40" alt="" /></div>
      <span class="mobile-bar-title">{{ pageTitle }}</span>
      <button class="icon-btn" :aria-label="t.toggle_nav" @click="mobileNavOpen = !mobileNavOpen">
        <AppIcon name="menu" :size="18" />
      </button>
    </div>

    <!-- ─── SIDEBAR ────────────────────────────────────────── -->
    <aside class="sidebar">
      <div class="brand-area">
        <div class="brand-glow"></div>
        <div class="brand-content">
          <div class="mark"><img :src="BRAND_LOGO" width="40" alt="" /></div>
          <span class="brand-name">{{ t.super_admin }}</span>
        </div>
      </div>

      <nav class="nav">
        <button v-for="item in navItems" :key="item.tab" class="nav-item" :class="{ active: tab === item.tab }"
          :title="item.label" @click="selectTab(item.tab)">
          <AppIcon :name="item.icon" :size="18" />
          <span class="nav-label">{{ item.label }}</span>
        </button>
      </nav>

      <div class="sidebar-footer">
        <button class="lang-btn" @click="toggleLocale">
          {{ locale === "km" ? "English" : "ភាសាខ្មែរ" }}
        </button>
        <button class="logout-link" @click="showLogoutConfirm = true">
          <AppIcon name="lock" :size="15" /> {{ t.logout }}
        </button>
      </div>
    </aside>
    <div class="nav-scrim" @click="mobileNavOpen = false"></div>

    <!-- ─── MAIN ───────────────────────────────────────────── -->
    <main class="main">
      <!-- Header: title + subtitle only (refresh moved to the slim bar below) -->
      <header class="topbar">
        <div>
          <h1 class="page-title"><AppIcon name="sparkle" :size="18" class="hdr-title-i" /> {{ pageTitle }}</h1>
          <p class="page-sub">{{ t.super_admin }} · {{ t.manage_system }}</p>
        </div>
      </header>

      <!-- Slim bar: one line of figures for the current tab + a quiet refresh -->
      <div class="tab-bar">
        <SummaryStrip v-if="tab !== 'dashboard'" :items="summaryItems" />
        <button class="icon-refresh" :class="{ spinning: loading }" :disabled="loading" :title="t.refresh"
          :aria-label="t.refresh" @click="refreshAll">
          <AppIcon name="refresh" :size="16" />
        </button>
      </div>

      <!-- ─── DASHBOARD (the only tab with the full stats grid) ── -->
      <template v-if="tab === 'dashboard'">
        <SuperAdminStatsGrid :admin-stats="adminStats" :stats="stats" :t="t" :format-money="formatMoney"
          @go-to-tab="selectTab" />

        <div class="dash-grid">
          <!-- latest orders -->
          <AdminList :title="t.latest_orders" icon="orders" :items="orders.slice(0, 5)" :count="orders.length"
            :loading="loading" :empty-text="t.no_data" empty-icon="orders">
            <template #tools>
              <button class="link-btn" @click="selectTab('orders')">{{ t.view_all }}</button>
            </template>
            <template #row="{ item }">
              <UserRow :title="`#${item.id} · ${item.restaurant_name}`"
                :subtitle="`${item.tableNo} · ${item.customerName || '—'}`" icon="orders" tone="amber" square
                :hint="t.view" @select="openOrderDetail(item)">
                <template #meta>
                  <span class="os" :class="`os-${item.status}`"><i></i>{{ orderStatusLabel(item.status) }}</span>
                </template>
              </UserRow>
            </template>
          </AdminList>

          <!-- latest logins -->
          <AdminList :title="t.latest_logins" icon="activity" :items="accessLogins.slice(0, 5)"
            :count="accessLogins.length" :loading="loading" :empty-text="t.no_access_yet" empty-icon="activity">
            <template #tools>
              <button class="link-btn" @click="selectTab('access')">{{ t.view_all }}</button>
            </template>
            <template #row="{ item }">
              <UserRow :title="item.fullName || item.email || '—'" :subtitle="deviceOf(item)"
                :initial="initialOf(item)" :clickable="false">
                <template #meta>
                  <span class="os" :class="item.method === 'google' ? 'os-served' : 'os-preparing'">
                    <i></i>{{ item.method === "google" ? t.google_method : t.email_method }}
                  </span>
                  <span class="row-time">{{ formatDateTime(item.createdAt) }}</span>
                </template>
              </UserRow>
            </template>
          </AdminList>
        </div>
      </template>

      <!-- ─── USERS ────────────────────────────────────────── -->
      <AdminList v-else-if="tab === 'users'" :title="t.users" icon="users" :items="filteredUsers"
        :count="filteredUsers.length" :loading="loading" searchable :search="userSearch" :placeholder="t.search"
        :chips="userRoleFilters" :active-chip="userRoleFilter" :empty-text="listEmptyText('users')"
        empty-icon="category" :empty-action-label="emptyActionLabel('users')" @empty-action="runEmptyAction('users')"
        @update:search="userSearch = $event" @update:active-chip="userRoleFilter = $event">
        <template #tools>
          <AppSelect size="sm" variant="teal" min-width="110px" :model-value="userSort" :options="sortOptions"
            @update:model-value="userSort = $event" />
        </template>
        <template #row="{ item }">
          <!-- 3 pieces only: name · email · status. Role = avatar tone + tooltip,
               everything else lives in the drawer -->
          <UserRow :title="displayName(item)" :subtitle="item.email" :initial="initialOf(item)"
            :tone="item.role === 'super_admin' ? 'amber' : 'teal'" :hint="t.view"
            :tooltip="item.role === 'super_admin' ? t.super_admin_label : t.owner"
            @select="openUserDetail(item)">
            <template #meta>
              <span class="pill" :class="`pill-${item.status}`"><i></i>{{ statusLabel(item.status) }}</span>
            </template>
          </UserRow>
        </template>
      </AdminList>

      <!-- ─── ADMINS (owners) ──────────────────────────────── -->
      <AdminList v-else-if="tab === 'admins'" :title="t.admins" icon="users" :items="filteredOwners"
        :count="filteredOwners.length" :loading="memberLoading.owner" searchable :search="ownerSearch"
        :placeholder="t.search" :status="ownerStatusFilter" :status-options="statusFilterOptions"
        :add-label="t.add_admin" :empty-text="listEmptyText('owners')" empty-icon="users"
        :empty-action-label="emptyActionLabel('owners')" @empty-action="runEmptyAction('owners')"
        @update:search="ownerSearch = $event" @update:status="ownerStatusFilter = $event"
        @add="openCreateModal('owner')">
        <template #row="{ item }">
          <!-- 3 pieces only: name · email · status (restaurants, verified, last
               login and the status control live in the drawer) -->
          <UserRow :title="displayName(item)" :subtitle="item.email" :initial="initialOf(item)" tone="teal"
            :hint="t.view" @select="openMemberDetail(item)">
            <template #meta>
              <span class="pill" :class="`pill-${item.status}`"><i></i>{{ statusLabel(item.status) }}</span>
            </template>
          </UserRow>
        </template>
      </AdminList>

      <!-- ─── SUPER ADMINS ─────────────────────────────────── -->
      <AdminList v-else-if="tab === 'super-admins'" tone="amber" :title="t.super_admins" icon="shield"
        :items="filteredSuperAdmins" :count="filteredSuperAdmins.length" :loading="memberLoading.super_admin"
        searchable :search="superAdminSearch" :placeholder="t.search" :status="superAdminStatusFilter"
        :status-options="statusFilterOptions" :add-label="t.add_super_admin"
        :empty-text="listEmptyText('super-admins')" empty-icon="shield"
        :empty-action-label="emptyActionLabel('super-admins')" @empty-action="runEmptyAction('super-admins')"
        @update:search="superAdminSearch = $event" @update:status="superAdminStatusFilter = $event"
        @add="openCreateModal('super-admin')">
        <template #row="{ item }">
          <UserRow :title="displayName(item)" :subtitle="item.email" :initial="initialOf(item)" tone="amber"
            :hint="t.view" @select="openMemberDetail(item)">
            <template #meta>
              <span class="pill" :class="`pill-${item.status}`"><i></i>{{ statusLabel(item.status) }}</span>
            </template>
          </UserRow>
        </template>
      </AdminList>

      <!-- ─── RESTAURANTS ──────────────────────────────────── -->
      <AdminList v-else-if="tab === 'restaurants'" :title="t.restaurants" icon="store" :items="filteredRestaurants"
        :count="filteredRestaurants.length" :loading="loading" searchable :search="restaurantSearch"
        :placeholder="t.search" :chips="statusFilterOptions" :active-chip="restStatusFilter"
        :empty-text="listEmptyText('restaurants')" empty-icon="category"
        :empty-action-label="emptyActionLabel('restaurants')" @empty-action="runEmptyAction('restaurants')"
        @update:search="restaurantSearch = $event" @update:active-chip="restStatusFilter = $event">
        <template #tools>
          <AppSelect size="sm" variant="teal" min-width="110px" :model-value="restSort" :options="restSortOptions"
            @update:model-value="restSort = $event" />
        </template>
        <template #row="{ item }">
          <!-- 3 pieces only: name · owner · status (counts, telegram code and
               the created date live in the drawer) -->
          <UserRow :title="item.name" :subtitle="item.owner_email" icon="store" tone="amber" square
            :hint="t.view" @select="openRestaurantDetail(item)">
            <template #meta>
              <span class="pill" :class="`pill-${item.status}`"><i></i>{{ statusLabel(item.status) }}</span>
            </template>
          </UserRow>
        </template>
      </AdminList>

      <!-- ─── ORDERS (global feed, every restaurant) ───────── -->
      <AdminList v-else-if="tab === 'orders'" :title="t.orders" icon="orders" :items="orders" :count="orders.length"
        :loading="loading" :chips="orderStatusChips" :active-chip="orderStatusFilter"
        :empty-text="listEmptyText('orders')" empty-icon="orders"
        :empty-action-label="emptyActionLabel('orders')" @empty-action="runEmptyAction('orders')"
        @update:active-chip="setOrderFilter">
        <template #row="{ item }">
          <!-- 3 pieces only: order · table/customer · status (items, total and
               the created date live in the drawer) -->
          <UserRow :title="`#${item.id} · ${item.restaurant_name}`"
            :subtitle="`${item.tableNo} · ${item.customerName || '—'}`" icon="orders" tone="amber" square
            :hint="t.view" :tooltip="formatMoney(item.total)" @select="openOrderDetail(item)">
            <template #meta>
              <span class="os" :class="`os-${item.status}`"><i></i>{{ orderStatusLabel(item.status) }}</span>
            </template>
          </UserRow>
        </template>
      </AdminList>

      <!-- ─── ACCESS / AUDIT (who used the platform) ──────────
           The four live figures are the tab-bar summary above; the lists
           below are the logs themselves. -->
      <template v-else-if="tab === 'access'">
        <AdminList :title="t.access_logs" icon="activity" :items="filteredAccessLogins"
          :count="filteredAccessLogins.length" :loading="loading" searchable :search="accessSearch"
          :placeholder="t.search" :chips="accessMethodFilters" :active-chip="accessMethodFilter"
          :empty-text="listEmptyText('access')" empty-icon="activity"
          :empty-action-label="emptyActionLabel('access')" @empty-action="runEmptyAction('access')"
          @update:search="accessSearch = $event" @update:active-chip="accessMethodFilter = $event">
          <template #row="{ item }">
            <!-- who · device · how · when (IP and city stay in the payload) -->
            <UserRow :title="item.fullName || item.email || '—'" :subtitle="deviceOf(item)"
              :initial="initialOf(item)" :clickable="false" :tooltip="loginSubtitle(item)">
              <template #meta>
                <span class="os" :class="item.method === 'google' ? 'os-served' : 'os-preparing'">
                  <i></i>{{ item.method === "google" ? t.google_method : t.email_method }}
                </span>
                <span class="row-time">{{ formatDateTime(item.createdAt) }}</span>
              </template>
            </UserRow>
          </template>
        </AdminList>

        <div class="stack">
          <!-- live sessions -->
          <AdminList :title="t.sessions_label" icon="clock" :items="accessSessions" :count="accessSessions.length"
            :loading="loading" :empty-text="t.no_data" empty-icon="lock"
            :empty-action-label="emptyActionLabel('sessions')" @empty-action="runEmptyAction('sessions')">
            <template #row="{ item }">
              <UserRow :title="item.fullName || item.email || '—'" :subtitle="deviceOf(item)"
                :initial="initialOf(item)" :tone="isOnline(item.lastActiveAt) ? 'amber' : 'teal'"
                :clickable="false" :tooltip="`${item.loginCount ?? 0} ${t.logins_count}`">
                <template #meta>
                  <span class="pill" :class="isOnline(item.lastActiveAt) ? 'pill-active' : 'pill-inactive'">
                    <i></i>{{ isOnline(item.lastActiveAt) ? t.online : t.offline }}
                  </span>
                  <span class="row-time">{{ formatDateTime(item.lastActiveAt) }}</span>
                </template>
              </UserRow>
            </template>
          </AdminList>

          <!-- actions feed (audit trail) -->
          <AdminList :title="t.actions_feed" icon="clipboard" :items="accessActivities"
            :count="accessActivities.length" :loading="loading" :empty-text="t.no_data" empty-icon="clipboard"
            :empty-action-label="emptyActionLabel('activities')" @empty-action="runEmptyAction('activities')">
            <template #row="{ item }">
              <UserRow :title="item.action" :subtitle="item.email || '—'" icon="clipboard" square
                :clickable="false" :tooltip="item.description || ''">
                <template #meta>
                  <span class="row-time">{{ formatDateTime(item.createdAt) }}</span>
                </template>
              </UserRow>
            </template>
          </AdminList>
        </div>
      </template>
    </main>

    <!-- ─── MEMBER DETAIL (owner / super admin) ─────────────── -->
    <DetailDrawer :open="!!selectedMember" :title="displayName(selectedMember)"
      :subtitle="selectedMember?.email || ''" :initial="initialOf(selectedMember)"
      :tone="selectedMember?.role === 'super_admin' ? 'amber' : 'teal'" :close-label="t.close"
      @close="selectedMember = null">
      <div v-if="selectedMember" class="field-grid">
        <div class="field">
          <span class="field-label">{{ t.id }}</span>
          <span class="field-value">#{{ selectedMember.id }}</span>
        </div>
        <div class="field">
          <span class="field-label">{{ t.role }}</span>
          <span class="tag" :class="selectedMember.role === 'super_admin' ? 'tag-amber' : 'tag-teal'">
            {{ selectedMember.role === "super_admin" ? t.super_admin_label : t.owner }}
          </span>
        </div>
        <div class="field">
          <span class="field-label">{{ t.status }}</span>
          <span class="status-dot" :class="`sd-${selectedMember.status}`">
            <i></i>{{ statusLabel(selectedMember.status) }}
          </span>
        </div>
        <div class="field">
          <span class="field-label">{{ t.email_verified }}</span>
          <span class="status-dot" :class="selectedMember.verified ? 'sd-verified' : 'sd-pending'">
            <i></i>{{ selectedMember.verified ? t.email_verified : t.not_verified }}
          </span>
        </div>
        <div class="field">
          <span class="field-label">{{ t.restaurants }}</span>
          <span class="field-value">{{ selectedMember.restaurantCount }}</span>
        </div>
        <div class="field">
          <span class="field-label">{{ t.created_at }}</span>
          <span class="field-value">{{ formatDate(selectedMember.createdAt) }}</span>
        </div>
        <div class="field field-full">
          <span class="field-label">{{ t.restaurant_name }}</span>
          <span class="field-value">{{ selectedMember.restaurantName || "—" }}</span>
        </div>
        <div class="field field-full">
          <span class="field-label">{{ t.last_login }}</span>
          <span class="field-value">
            {{ selectedMember.lastLoginAt ? formatDateTime(selectedMember.lastLoginAt) : t.never }}
          </span>
        </div>
      </div>

      <template #actions>
        <AppSelect v-if="selectedMember" block size="sm" variant="teal" :model-value="selectedMember.status"
          :options="statusSelectOptions" @update:model-value="(v) => setMemberStatus(selectedMember, v)" />
        <button v-if="selectedMember && selectedMember.id !== auth.user?.id" class="btn btn-red"
          @click="confirmDeleteMember">
          <AppIcon name="trash" :size="14" /> {{ t.delete_user }}
        </button>
        <button class="btn btn-ghost" @click="selectedMember = null">{{ t.close }}</button>
      </template>
    </DetailDrawer>

    <!-- ─── USER DETAIL (with login history) ────────────────── -->
    <DetailDrawer :open="!!selectedUser" :title="displayName(selectedUser)"
      :subtitle="selectedUser?.email || ''" :initial="initialOf(selectedUser)"
      :tone="selectedUser?.role === 'super_admin' ? 'amber' : 'teal'" :close-label="t.close"
      @close="selectedUser = null">
      <div v-if="selectedUser" class="field-grid">
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
          <span class="status-dot" :class="`sd-${selectedUser.status}`">
            <i></i>{{ statusLabel(selectedUser.status) }}
          </span>
        </div>
        <div class="field">
          <span class="field-label">{{ t.email_verified }}</span>
          <span class="status-dot" :class="selectedUser.verified ? 'sd-verified' : 'sd-pending'">
            <i></i>{{ selectedUser.verified ? t.email_verified : t.not_verified }}
          </span>
        </div>
        <div class="field">
          <span class="field-label">{{ t.restaurants }}</span>
          <span class="field-value">{{ selectedUser.restaurantName || "—" }}</span>
        </div>
        <div class="field">
          <span class="field-label">{{ t.created_at }}</span>
          <span class="field-value">{{ formatDate(selectedUser.createdAt) }}</span>
        </div>
        <div class="field field-full">
          <span class="field-label">{{ t.last_login }}</span>
          <span class="field-value">
            {{ selectedUser.lastLoginAt ? formatDateTime(selectedUser.lastLoginAt) : t.never }}
          </span>
        </div>
      </div>

      <div v-if="selectedUser" class="logins-block">
        <div class="logins-title">
          <AppIcon name="clock" :size="12" /> {{ t.recent_logins }}
        </div>
        <div v-if="selectedUser.loginHistory?.length" class="logins">
          <div v-for="h in selectedUser.loginHistory" :key="h.id" class="login-item">
            <div class="login-main">
              <strong>{{ h.deviceName || "—" }}</strong>
              <span>{{ t.via }} {{ h.method === "google" ? t.google_method : t.email_method }} ·
                {{ placeOf(h, ["city", "region", "country"]) }}</span>
            </div>
            <div class="login-side">
              <span v-if="h.os" class="row-muted" :title="t.device">{{ h.os }}</span>
              <code v-if="h.ipAddress" class="code" :title="t.ip">{{ h.ipAddress }}</code>
              <span class="os" :class="h.method === 'google' ? 'os-served' : 'os-preparing'">
                <i></i>{{ h.method === "google" ? t.google_method : t.email_method }}
              </span>
              <span class="row-muted">{{ formatDateTime(h.createdAt) }}</span>
            </div>
          </div>
        </div>
        <div v-else class="logins-empty">{{ t.no_logins_yet }}</div>
      </div>

      <template #actions>
        <AppSelect v-if="selectedUser" block size="sm" variant="teal" :model-value="selectedUser.status"
          :options="statusSelectOptions" @update:model-value="(v) => setUserStatus(selectedUser, v)" />

        <AppSelect v-if="selectedUser" block size="sm" variant="teal" :model-value="selectedUser.role"
          :disabled="selectedUser.id === auth.user?.id" :title="t.change_role" :options="userRoleOptions"
          @update:model-value="changeUserRole" />

        <button v-if="selectedUser && !selectedUser.verified" class="btn btn-green" @click="verifySelectedUser">
          <AppIcon name="check" :size="14" /> {{ t.verify_email_btn }}
        </button>
        <button v-if="selectedUser && !selectedUser.verified" class="btn btn-blue" @click="resendSelectedVerification">
          <AppIcon name="mail" :size="14" /> {{ t.resend_verification }}
        </button>
        <button v-if="selectedUser" class="btn btn-blue" @click="confirmResetPassword">
          <AppIcon name="key" :size="14" /> {{ t.reset_password }}
        </button>
        <button v-if="selectedUser && selectedUser.id !== auth.user?.id" class="btn btn-red" @click="confirmDeleteUser">
          <AppIcon name="trash" :size="14" /> {{ t.delete_user }}
        </button>
        <button class="btn btn-ghost" @click="selectedUser = null">{{ t.close }}</button>
      </template>
    </DetailDrawer>

    <!-- ─── RESTAURANT DETAIL ───────────────────────────────── -->
    <DetailDrawer :open="!!selectedRestaurant" :title="selectedRestaurant?.name || ''"
      :subtitle="selectedRestaurant?.owner_email || ''" icon="store" tone="amber" square :close-label="t.close"
      @close="selectedRestaurant = null">
      <div v-if="selectedRestaurant" class="field-grid">
        <div class="field">
          <span class="field-label">{{ t.id }}</span>
          <span class="field-value">#{{ selectedRestaurant.id }}</span>
        </div>
        <div class="field">
          <span class="field-label">{{ t.status }}</span>
          <span class="status-dot" :class="`sd-${selectedRestaurant.status}`">
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
        <div class="field field-full">
          <span class="field-label">{{ t.link_code }}</span>
          <span class="field-value link-row">
            <code class="code">{{ selectedRestaurant.telegram_link_code || "—" }}</code>
            <button v-if="selectedRestaurant.telegram_link_code" class="copy-btn"
              @click="copyText(selectedRestaurant.telegram_link_code)">
              <AppIcon name="copy" :size="12" /> {{ t.copy_link }}
            </button>
          </span>
        </div>
      </div>

      <template #actions>
        <AppSelect v-if="selectedRestaurant" block size="sm" variant="teal" :model-value="selectedRestaurant.status"
          :options="statusSelectOptions"
          @update:model-value="(v) => setRestaurantStatus(selectedRestaurant, v)" />
        <button class="btn btn-ghost" @click="selectedRestaurant = null">{{ t.close }}</button>
      </template>
    </DetailDrawer>

    <!-- ─── ORDER DETAIL (any restaurant) ───────────────────── -->
    <DetailDrawer :open="!!selectedOrder" :title="`#${selectedOrder?.id ?? ''} · ${selectedOrder?.restaurant_name ?? ''}`"
      :subtitle="`${t.table_no} ${selectedOrder?.tableNo ?? ''}`" icon="orders" tone="amber" square
      :close-label="t.close" @close="selectedOrder = null">
      <div v-if="selectedOrder" class="field-grid">
        <div class="field">
          <span class="field-label">{{ t.status }}</span>
          <span class="os" :class="`os-${selectedOrder.status}`">
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

      <div v-if="selectedOrder" class="logins-block">
        <div class="logins-title">{{ t.order_items }}</div>
        <div class="logins">
          <div v-for="(item, i) in selectedOrder.items" :key="i" class="login-item">
            <div class="login-main">
              <strong>{{ item.name }}</strong>
              <span class="row-muted">{{ item.qty }} × {{ formatMoney(item.price) }}</span>
            </div>
            <div class="login-side">
              <code class="code">
                {{ t.subtotal }}: {{ formatMoney((Number(item.price) || 0) * (Number(item.qty) || 0)) }}
              </code>
            </div>
          </div>
        </div>
        <div class="order-total-row">
          <span>{{ t.total }}:</span>
          <strong>{{ formatMoney(selectedOrder.total) }}</strong>
        </div>
      </div>

      <template #actions>
        <AppSelect v-if="selectedOrder" block size="sm" variant="teal" :model-value="selectedOrder.status"
          :options="orderStatusOptions" @update:model-value="setOrderStatus" />
        <button class="btn btn-ghost" @click="selectedOrder = null">{{ t.close }}</button>
      </template>
    </DetailDrawer>

    <!-- ─── LOGOUT ──────────────────────────────────────────── -->
    <ConfirmModal :open="showLogoutConfirm" :title="t.logout" :message="t.confirm_logout" icon="lock" danger
      :confirm-label="t.logout" :cancel-label="t.cancel" @confirm="confirmLogout"
      @cancel="showLogoutConfirm = false" />

    <!-- ─── GENERIC CONFIRM (delete / role change / reset) ──── -->
    <ConfirmModal :open="!!confirm" :title="confirm?.title || ''" :message="confirm?.message || ''"
      :icon="confirm?.danger ? 'trash' : 'check'" :danger="!!confirm?.danger"
      :confirm-label="confirm?.confirmLabel || t.confirm" :cancel-label="t.cancel" @confirm="runConfirm"
      @cancel="confirm = null" />

    <!-- ─── TEMPORARY PASSWORD (copy once) ──────────────────── -->
    <ConfirmModal :open="!!tempPw" :title="t.temp_password" :message="tempPw?.email || ''" icon="key" hide-confirm
      :cancel-label="t.close" @cancel="tempPw = null">
      <div v-if="tempPw" class="temp-pw-row">
        <code class="code temp-pw">{{ tempPw.password }}</code>
        <button class="btn btn-ghost" @click="copyText(tempPw.password)">{{ t.copy }}</button>
      </div>
    </ConfirmModal>

    <!-- ─── CREATE ADMIN / SUPER ADMIN ──────────────────────── -->
    <CreateAdminModal :open="showCreateModal" :variant="createVariant" :loading="creating"
      @close="showCreateModal = false" @invalid="pushToast($event, 'error')" @submit="createMember" />

    <!-- ─── TOASTS ──────────────────────────────────────────── -->
    <ToastStack :toasts="toasts" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useI18nStore } from "@/stores/i18n";
import AppIcon from "@/components/AppIcon.vue";
import AppSelect from "@/components/AppSelect.vue";
import SuperAdminStatsGrid from "@/components/admin/SuperAdminStatsGrid.vue";
import AdminList from "@/components/admin/AdminList.vue";
import UserRow from "@/components/admin/UserRow.vue";
import DetailDrawer from "@/components/admin/DetailDrawer.vue";
import ConfirmModal from "@/components/admin/ConfirmModal.vue";
import CreateAdminModal from "@/components/admin/CreateAdminModal.vue";
import SummaryStrip from "@/components/admin/SummaryStrip.vue";
import ToastStack from "@/components/admin/ToastStack.vue";
import { useSuperAdminApi } from "@/composables/useSuperAdminApi";
import { getErrorMessage } from "@/utils/apiErrors";
import { formatMoney } from "@/utils/currency.mjs";
import { parseItems } from "@/utils/orderFormat.mjs";

const BRAND_LOGO =
  "https://res.cloudinary.com/daji2ml3y/image/upload/v1783262055/ChatGPT_Image_Jul_5_2026_09_32_32_PM_c6ziic.png";

const router = useRouter();
const auth = useAuthStore();
// storeToRefs keeps `t` reactive: the whole dashboard re-translates on toggle
const i18n = useI18nStore();
const { t, locale } = storeToRefs(i18n);
const { toggleLocale } = i18n;
const api = useSuperAdminApi();

/* ── STORES: navigation ──────────────────────────────────── */
// The dashboard tab owns the full stats grid; the rest are plain lists
const tab = ref("dashboard"); // dashboard | users | admins | super-admins | restaurants | orders | access
const mobileNavOpen = ref(false);

/* ── STATE: lists + dashboard counts ─────────────────────── */
const users = ref([]);
const owners = ref([]);
const superAdmins = ref([]);
const restaurants = ref([]);
const orders = ref([]);
const stats = ref({});
const adminStats = ref({
  byRole: { owner: { total: 0, active: 0 }, super_admin: { total: 0, active: 0 } },
  totalRestaurants: 0,
  totalOrders: 0,
  activeSessions: 0,
});

/* ── STATE: access / audit ───────────────────────────────── */
const accessStats = ref({});
const accessSessions = ref([]);
const accessLogins = ref([]);
const accessActivities = ref([]);

/* ── STATE: loading ──────────────────────────────────────── */
const loading = ref(false);
const memberLoading = ref({ owner: false, super_admin: false });
const creating = ref(false);

/* ── STATE: filters ──────────────────────────────────────── */
const userSearch = ref("");
const userRoleFilter = ref("");
const userSort = ref("newest");
const ownerSearch = ref("");
const ownerStatusFilter = ref("");
const superAdminSearch = ref("");
const superAdminStatusFilter = ref("");
const restaurantSearch = ref("");
const restStatusFilter = ref("");
const restSort = ref("newest");
const orderStatusFilter = ref("");
const accessSearch = ref("");
const accessMethodFilter = ref("");

/* ── STATE: drawers + dialogs ────────────────────────────── */
const selectedUser = ref(null);
const selectedMember = ref(null);
const selectedRestaurant = ref(null);
const selectedOrder = ref(null);
const confirm = ref(null); // { title, message, confirmLabel, danger, onConfirm }
const tempPw = ref(null); // { email, password }
const showLogoutConfirm = ref(false);
const showCreateModal = ref(false);
const createVariant = ref("owner"); // owner | super-admin
const toasts = ref([]);

/* ── HELPERS: client-side search / sort shared by every list ── */
const USER_FIELDS = ["fullName", "email", "restaurantName"];

function searchRows(rows, query, fields) {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter((row) =>
    fields.some((field) => String(row[field] || "").toLowerCase().includes(q)),
  );
}

function sortRows(rows, mode, nameOf) {
  const list = [...rows];
  if (mode === "name") return list.sort((a, b) => nameOf(a).localeCompare(nameOf(b)));
  return list.sort((a, b) => {
    const ta = new Date(a.createdAt || a.created_at || 0).getTime();
    const tb = new Date(b.createdAt || b.created_at || 0).getTime();
    return mode === "oldest" ? ta - tb : tb - ta;
  });
}

/* ── COMPUTED: navigation ────────────────────────────────── */
// Labels are the SHORT ones (nav_*): the sidebar is narrow, especially in Khmer
const navItems = computed(() => [
  { tab: "dashboard", icon: "chart", label: t.value.nav_dashboard },
  { tab: "users", icon: "users", label: t.value.nav_users },
  { tab: "admins", icon: "user", label: t.value.nav_admins },
  { tab: "super-admins", icon: "shield", label: t.value.nav_super_admins },
  { tab: "restaurants", icon: "store", label: t.value.nav_restaurants },
  { tab: "orders", icon: "orders", label: t.value.nav_orders },
  { tab: "access", icon: "activity", label: t.value.nav_logs },
]);

const pageTitle = computed(
  () => navItems.value.find((item) => item.tab === tab.value)?.label || "",
);

// One-line figures for the slim tab bar (the dashboard shows the full grid)
const summaryItems = computed(() => {
  const byRole = adminStats.value?.byRole || {};
  const maps = {
    users: [
      { value: stats.value.totalUsers ?? 0, label: t.value.users },
      { value: byRole.owner?.total ?? 0, label: t.value.owners },
      { value: byRole.super_admin?.total ?? 0, label: t.value.super_admins },
    ],
    admins: [
      { value: byRole.owner?.total ?? 0, label: t.value.admins },
      { value: byRole.owner?.active ?? 0, label: t.value.activate },
    ],
    "super-admins": [
      { value: byRole.super_admin?.total ?? 0, label: t.value.super_admins },
      { value: byRole.super_admin?.active ?? 0, label: t.value.activate },
    ],
    restaurants: [
      {
        value: adminStats.value?.totalRestaurants ?? stats.value.totalRestaurants ?? 0,
        label: t.value.restaurants,
      },
      { value: stats.value.totalFoods ?? 0, label: t.value.foods },
    ],
    orders: [
      { value: stats.value.totalOrders ?? 0, label: t.value.orders },
      { value: stats.value.todayOrders ?? 0, label: t.value.orders_today },
      { value: stats.value.pendingOrders ?? 0, label: t.value.pending },
      { value: formatMoney(stats.value.revenue ?? 0), label: t.value.revenue_label },
    ],
    access: [
      { value: accessStats.value.usersToday ?? 0, label: t.value.unique_users_today },
      { value: accessStats.value.onlineNow ?? 0, label: t.value.online_now },
      { value: accessStats.value.loginsToday ?? 0, label: t.value.logins_today },
      { value: accessStats.value.activeSessions ?? 0, label: t.value.active_sessions },
    ],
  };
  return maps[tab.value] || [];
});

/* ── COMPUTED: select + chip options ─────────────────────── */
const statusFilterOptions = computed(() => [
  { value: "", label: t.value.all },
  { value: "active", label: t.value.activate },
  { value: "suspended", label: t.value.suspend },
  { value: "inactive", label: t.value.inactive },
]);

// Same options without the "all" entry — the row status selects
const statusSelectOptions = computed(() => statusFilterOptions.value.slice(1));

const userRoleOptions = computed(() => [
  { value: "owner", label: t.value.owner },
  { value: "super_admin", label: t.value.super_admin_label },
]);

const sortOptions = computed(() => [
  { value: "newest", label: t.value.sort_newest },
  { value: "oldest", label: t.value.sort_oldest },
  { value: "name", label: t.value.sort_name },
]);

const restSortOptions = computed(() => [
  ...sortOptions.value,
  { value: "orders", label: t.value.sort_orders },
]);

const userRoleFilters = computed(() => [
  { value: "", label: t.value.all_users },
  { value: "owner", label: t.value.owners },
  { value: "super_admin", label: t.value.admins },
]);

const accessMethodFilters = computed(() => [
  { value: "", label: t.value.all },
  { value: "email", label: t.value.email_method },
  { value: "google", label: t.value.google_method },
]);

// Order statuses accepted by PATCH /api/orders/:id/status
const ORDER_STATUSES = ["pending", "confirmed", "preparing", "ready", "served", "cancelled"];

const orderStatusChips = computed(() => [
  { value: "", label: t.value.all },
  ...ORDER_STATUSES.map((status) => ({ value: status, label: orderStatusLabel(status) })),
]);

const orderStatusOptions = computed(() =>
  ORDER_STATUSES.map((status) => ({ value: status, label: orderStatusLabel(status) })),
);

/* ── COMPUTED: visible rows (search + status + sort) ─────── */
const filteredUsers = computed(() => {
  let list = users.value;
  if (userRoleFilter.value) {
    list = list.filter((user) => user.role === userRoleFilter.value);
  }
  return sortRows(searchRows(list, userSearch.value, USER_FIELDS), userSort.value, displayName);
});

const filteredOwners = computed(() => {
  const list = searchRows(owners.value, ownerSearch.value, USER_FIELDS);
  return ownerStatusFilter.value
    ? list.filter((member) => member.status === ownerStatusFilter.value)
    : list;
});

const filteredSuperAdmins = computed(() => {
  const list = searchRows(superAdmins.value, superAdminSearch.value, USER_FIELDS);
  return superAdminStatusFilter.value
    ? list.filter((member) => member.status === superAdminStatusFilter.value)
    : list;
});

const filteredRestaurants = computed(() => {
  let list = searchRows(restaurants.value, restaurantSearch.value, ["name", "owner_email"]);
  if (restStatusFilter.value) {
    list = list.filter((r) => r.status === restStatusFilter.value);
  }
  if (restSort.value === "orders") {
    return [...list].sort((a, b) => (b.orders_count || 0) - (a.orders_count || 0));
  }
  return sortRows(list, restSort.value, (r) => r.name || "");
});

const filteredAccessLogins = computed(() => {
  let list = accessLogins.value;
  if (accessMethodFilter.value) {
    list = list.filter((hit) => hit.method === accessMethodFilter.value);
  }
  return searchRows(list, accessSearch.value, [
    "email",
    "fullName",
    "ipAddress",
    "deviceName",
    "browser",
  ]);
});

/* ── API: loaders ────────────────────────────────────────── */
function applyAccess(access) {
  accessStats.value = access.stats;
  accessSessions.value = access.sessions;
  accessLogins.value = access.logins;
  accessActivities.value = access.activities;
}

async function refreshAll() {
  loading.value = true;
  memberLoading.value.owner = true;
  memberLoading.value.super_admin = true;
  try {
    const [
      dashboardStats,
      userRows,
      restaurantRows,
      orderRows,
      access,
      ownerRows,
      superAdminRows,
      memberStats,
    ] = await Promise.all([
      api.fetchDashboardStats(),
      api.fetchUsers(),
      api.fetchRestaurants(),
      api.fetchOrders(orderStatusFilter.value),
      api.fetchAccess(),
      api.fetchMembers("owner"),
      api.fetchMembers("super_admin"),
      api.fetchMemberStats(),
    ]);

    stats.value = dashboardStats || {};
    users.value = userRows;
    restaurants.value = restaurantRows;
    orders.value = orderRows;
    applyAccess(access);
    owners.value = ownerRows;
    superAdmins.value = superAdminRows;
    if (memberStats) adminStats.value = memberStats;
  } catch (err) {
    toastError(err);
  } finally {
    loading.value = false;
    memberLoading.value.owner = false;
    memberLoading.value.super_admin = false;
  }
}

async function loadUsers() {
  loading.value = true;
  try {
    users.value = await api.fetchUsers();
  } catch (err) {
    toastError(err);
  } finally {
    loading.value = false;
  }
}

async function loadRestaurants() {
  loading.value = true;
  try {
    restaurants.value = await api.fetchRestaurants();
  } catch (err) {
    toastError(err);
  } finally {
    loading.value = false;
  }
}

async function loadOrders() {
  loading.value = true;
  try {
    orders.value = await api.fetchOrders(orderStatusFilter.value);
  } catch (err) {
    toastError(err);
  } finally {
    loading.value = false;
  }
}

async function loadAccess() {
  loading.value = true;
  try {
    applyAccess(await api.fetchAccess());
  } catch (err) {
    toastError(err);
  } finally {
    loading.value = false;
  }
}

async function loadMembers(role) {
  memberLoading.value[role] = true;
  try {
    const rows = await api.fetchMembers(role);
    if (role === "super_admin") superAdmins.value = rows;
    else owners.value = rows;
  } catch (err) {
    toastError(err);
  } finally {
    memberLoading.value[role] = false;
  }
}

async function loadMemberStats() {
  try {
    const memberStats = await api.fetchMemberStats();
    if (memberStats) adminStats.value = memberStats;
  } catch (err) {
    toastError(err);
  }
}

/* ── ACTIONS: navigation ─────────────────────────────────── */
const TAB_LOADERS = {
  users: loadUsers,
  admins: () => loadMembers("owner"),
  "super-admins": () => loadMembers("super_admin"),
  restaurants: loadRestaurants,
  orders: loadOrders,
  access: loadAccess,
};

// Each tab fetches only the list it shows (the dashboard loads once on mount)
function selectTab(name) {
  tab.value = name;
  mobileNavOpen.value = false;
  TAB_LOADERS[name]?.();
}

// The global order feed is filtered by the backend
function setOrderFilter(status) {
  orderStatusFilter.value = status;
  loadOrders();
}

function openCreateModal(variant) {
  createVariant.value = variant;
  showCreateModal.value = true;
}

onMounted(refreshAll);

/* ── ACTIONS: status changes ─────────────────────────────── */
async function setUserStatus(user, status) {
  if (!user || status === user.status) return;
  try {
    await api.setUserStatus(user.id, status);
    user.status = status; // rows and the open drawer share the same object
    pushToast(t.value.status_updated);
  } catch (err) {
    toastError(err);
  }
}

async function setMemberStatus(member, status) {
  if (!member || status === member.status) return;
  try {
    await api.setMemberStatus(member.id, status);
    member.status = status;
    const userRow = users.value.find((user) => user.id === member.id);
    if (userRow) userRow.status = status;
    pushToast(t.value.status_updated);
  } catch (err) {
    toastError(err);
  }
}

async function setRestaurantStatus(restaurant, status) {
  if (!restaurant || status === restaurant.status) return;
  try {
    await api.setRestaurantStatus(restaurant.id, status);
    restaurant.status = status;
    pushToast(t.value.status_updated);
  } catch (err) {
    toastError(err);
  }
}

async function setOrderStatus(status) {
  const order = selectedOrder.value;
  if (!order || status === order.status) return;
  try {
    await api.setOrderStatus(order.id, status);
    order.status = status;
    const row = orders.value.find((o) => o.id === order.id);
    if (row) row.status = status;
    pushToast(t.value.status_updated);
  } catch (err) {
    toastError(err);
  }
}

/* ── ACTIONS: open a drawer ──────────────────────────────── */
function openUserDetail(user) {
  selectedUser.value = { ...user, loginHistory: [] };
  loadLoginHistory(user.id);
}

async function loadLoginHistory(userId) {
  try {
    const history = await api.fetchLoginHistory(userId);
    // the drawer may have been closed / re-opened for someone else meanwhile
    if (selectedUser.value?.id === userId) selectedUser.value.loginHistory = history;
  } catch (err) {
    toastError(err);
  }
}

function openMemberDetail(member) {
  selectedMember.value = { ...member };
}

function openRestaurantDetail(restaurant) {
  selectedRestaurant.value = { ...restaurant };
}

function openOrderDetail(order) {
  selectedOrder.value = { ...order, items: orderItems(order) };
}

// `items` arrives as a JSON string from /admin/orders — never trust it blindly
function orderItems(order) {
  return parseItems(order?.items) || [];
}

/* ── ACTIONS: verify / resend / role ─────────────────────── */
function markUserVerified(user) {
  const rows = [user, users.value.find((u) => u.id === user.id)];
  rows.forEach((row) => {
    if (!row) return;
    row.verified = true;
    if (row.status !== "active") row.status = "active"; // verify activates the account
  });
}

async function verifySelectedUser() {
  const user = selectedUser.value;
  if (!user) return;
  try {
    await api.verifyUser(user.id);
    markUserVerified(user);
    pushToast(t.value.email_verified_ok);
  } catch (err) {
    toastError(err);
  }
}

async function resendSelectedVerification() {
  const user = selectedUser.value;
  if (!user) return;
  try {
    await api.resendVerification(user.id);
    pushToast(t.value.verification_sent);
  } catch (err) {
    toastError(err);
  }
}

// Role change asks for confirmation and is never allowed on your own account
function changeUserRole(newRole) {
  const user = selectedUser.value;
  if (!user || newRole === user.role) return;
  if (user.id === auth.user?.id) {
    pushToast(t.value.cannot_change_own_role, "error");
    return;
  }
  const roleLabel = newRole === "super_admin" ? t.value.super_admin_label : t.value.owner;
  askConfirm({
    title: t.value.change_role,
    message: `${t.value.confirm_role_to} "${roleLabel}"?`,
    confirmLabel: t.value.confirm,
    onConfirm: async () => {
      try {
        await api.setUserRole(user.id, newRole);
        user.role = newRole;
        const row = users.value.find((u) => u.id === user.id);
        if (row && row !== user) row.role = newRole;
        pushToast(t.value.role_updated);
      } catch (err) {
        toastError(err);
      }
    },
  });
}

/* ── ACTIONS: password reset / delete / create / logout ──── */
function confirmResetPassword() {
  const user = selectedUser.value;
  if (!user) return;
  askConfirm({
    title: t.value.reset_password,
    message: `${user.email}?`,
    confirmLabel: t.value.reset_password,
    danger: true,
    onConfirm: async () => {
      try {
        const password = await api.resetUserPassword(user.id);
        tempPw.value = { email: user.email, password };
        // best effort: also copy it so it can be pasted straight away
        navigator.clipboard?.writeText(password).catch(() => {});
      } catch (err) {
        toastError(err);
      }
    },
  });
}

function confirmDeleteUser() {
  const user = selectedUser.value;
  if (!user || user.id === auth.user?.id) return;
  askConfirm({
    title: t.value.delete_user,
    message: t.value.confirm_delete_user,
    confirmLabel: t.value.delete_user,
    danger: true,
    onConfirm: async () => {
      try {
        await api.deleteUser(user.id);
        users.value = users.value.filter((u) => u.id !== user.id);
        selectedUser.value = null;
        pushToast(t.value.user_deleted);
      } catch (err) {
        toastError(err);
      }
    },
  });
}

function confirmDeleteMember() {
  const member = selectedMember.value;
  if (!member || member.id === auth.user?.id) return;
  askConfirm({
    title: t.value.delete_user,
    message: t.value.confirm_delete_user,
    confirmLabel: t.value.delete_user,
    danger: true,
    onConfirm: async () => {
      try {
        await api.deleteMember(member.id);
        const bucket = member.role === "super_admin" ? superAdmins : owners;
        bucket.value = bucket.value.filter((m) => m.id !== member.id);
        users.value = users.value.filter((u) => u.id !== member.id);
        selectedMember.value = null;
        pushToast(
          member.role === "super_admin" ? t.value.super_admin_deleted : t.value.admin_deleted,
        );
        loadMemberStats();
      } catch (err) {
        toastError(err);
      }
    },
  });
}

async function createMember(payload) {
  creating.value = true;
  try {
    await api.createMember(payload);
    pushToast(payload.role === "super_admin" ? t.value.super_admin_created : t.value.admin_created);
    showCreateModal.value = false;
    await Promise.all([
      loadMembers(payload.role === "super_admin" ? "super_admin" : "owner"),
      loadMemberStats(),
    ]);
  } catch (err) {
    toastError(err);
  } finally {
    creating.value = false;
  }
}

function confirmLogout() {
  showLogoutConfirm.value = false;
  auth.logout();
  router.push("/login");
}

/* ── HELPERS: toasts / confirm / clipboard ───────────────── */
function pushToast(message, type = "success") {
  const id = Date.now() + Math.random();
  toasts.value.push({ id, message, type });
  setTimeout(() => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id);
  }, 3200);
}

// One bilingual message for every failed request (Khmer / English)
function toastError(err) {
  pushToast(getErrorMessage(err, locale.value, t.value.error), "error");
}

function askConfirm({ title, message, confirmLabel = t.value.confirm, danger = false, onConfirm }) {
  confirm.value = { title, message, confirmLabel, danger, onConfirm };
}

function runConfirm() {
  const pending = confirm.value;
  confirm.value = null;
  pending?.onConfirm?.();
}

async function copyText(text) {
  try {
    if (!navigator.clipboard?.writeText) throw new Error("clipboard unavailable");
    await navigator.clipboard.writeText(text);
    pushToast(t.value.link_copied);
  } catch {
    pushToast(t.value.error, "error");
  }
}

/* ── HELPERS: labels + formatting ────────────────────────── */
// Name shown in lists and drawers: full name → own restaurant → email
function displayName(member) {
  if (!member) return "";
  if (member.fullName) return member.fullName;
  if (member.role === "super_admin") return t.value.super_admin_label;
  return member.restaurantName || member.email || "";
}

function initialOf(member) {
  const source = member?.fullName || member?.email || "?";
  return String(source).charAt(0).toUpperCase();
}

function statusLabel(status) {
  if (status === "active") return t.value.activate;
  if (status === "suspended") return t.value.suspend;
  if (status === "inactive") return t.value.inactive;
  return status;
}

function orderStatusLabel(status) {
  const labels = {
    pending: t.value.pending,
    confirmed: t.value.confirmed,
    preparing: t.value.preparing,
    ready: t.value.ready,
    served: t.value.served,
    cancelled: t.value.cancelled,
  };
  return labels[status] || status;
}

// A session counts as online while its heartbeat is younger than 15 minutes
function isOnline(lastActiveAt) {
  if (!lastActiveAt) return false;
  return Date.now() - new Date(lastActiveAt).getTime() < 15 * 60 * 1000;
}

function localeTag() {
  return locale.value === "km" ? "km-KH" : "en-US";
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString(localeTag());
}

function formatDateTime(value) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return t.value.never;
  return date.toLocaleString(localeTag(), {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Device / location / login-method text shared by the access lists + drawers
// "Chrome 154 on macOS 10.15.7" already contains the OS — never repeat it
function deviceOf(entry) {
  const device = entry.deviceName || entry.browser || "";
  const os = entry.os || "";
  if (!device) return os || "—";
  if (!os || device.toLowerCase().includes(os.toLowerCase())) return device;
  return `${device} · ${os}`;
}

function placeOf(entry, fields = ["city", "country"]) {
  return fields.map((field) => entry[field]).filter(Boolean).join(", ") || "—";
}

function loginSubtitle(hit) {
  const role = hit.role === "super_admin" ? ` · ${t.value.super_admin_label}` : "";
  return `${hit.email || "—"}${role}`;
}

// ── UI only: empty-state CTAs ─────────────────────────────
// "Clear filters" when a search/filter is narrowing the list, "Refresh" otherwise
const FILTERS = {
  users: () => [userSearch, userRoleFilter],
  owners: () => [ownerSearch, ownerStatusFilter],
  "super-admins": () => [superAdminSearch, superAdminStatusFilter],
  restaurants: () => [restaurantSearch, restStatusFilter],
  orders: () => [orderStatusFilter],
  access: () => [accessSearch, accessMethodFilter],
};

function hasFilters(kind) {
  const refs = FILTERS[kind]?.() || [];
  return refs.some((source) => Boolean(source.value));
}

function clearFilters(kind) {
  (FILTERS[kind]?.() || []).forEach((source) => {
    source.value = "";
  });
  if (kind === "orders") setOrderFilter(""); // the feed is filtered server-side
}

function emptyActionLabel(kind) {
  return hasFilters(kind) ? t.value.clear_filters : t.value.refresh;
}

function runEmptyAction(kind) {
  if (hasFilters(kind)) clearFilters(kind);
  else refreshAll();
}

// Empty state wording: "no results" only when a search/filter is narrowing the list
const EMPTY_TEXT = {
  users: () => (hasFilters("users") ? t.value.no_results : t.value.no_data),
  owners: () => (hasFilters("owners") ? t.value.no_results : t.value.no_admins),
  "super-admins": () => (hasFilters("super-admins") ? t.value.no_results : t.value.no_super_admins),
  restaurants: () => (hasFilters("restaurants") ? t.value.no_results : t.value.no_data),
  orders: () => (hasFilters("orders") ? t.value.no_results : t.value.no_data),
  access: () => (hasFilters("access") ? t.value.no_results : t.value.no_access_yet),
};

function listEmptyText(kind) {
  return EMPTY_TEXT[kind]?.() || t.value.no_data;
}
</script>

<style>
/* Global on purpose: drawers, confirm dialogs and toasts are teleported to <body>.
   The login palette below is IDENTICAL to your login tokens, so the login page is
   unaffected. The old tokens (--teal, --ink, …) are kept so AdminView / landing /
   child components keep working. New admin-only tokens use the --sa- prefix so
   nothing can collide with login. */
:root {
  /* login palette (unchanged) */
  --green-dark: #1a4a1a;
  --green-mid: #2d7a2d;
  --green-light: #4caf50;
  --green-pale: #e8f5e9;
  --green-soft: #c8e6c9;
  --green-accent: #81c784;
  --cream: #fafdf6;
  --text-dark: #1b2e1b;
  --text-mid: #3a5a3a;
  --text-light: #6a8f6a;
  --white: #fff;
  --shadow: rgba(45, 122, 45, 0.18);
  --orange: #e65100;
  --radius-card: 16px;
  --radius-btn: 20px;

  /* previous dashboard tokens (kept for shared components) */
  --teal: #0f766e;
  --teal-dark: #0d5e57;
  --green: #22c55e;
  --green-soft-legacy: #86efac;
  --amber: #f59e0b;
  --amber-soft: #fbbf24;
  --red: #c62828;
  --red-deep: #b71c1c;
  --blue: #2563eb;
  --ink: #14532d;
  --muted: #6b7280;
  --muted-light: #9ca3af;
  --text: #374151;
  --surface: #ffffff;
  --surface-soft: #f8fdf9;
  --surface-warm: #f0fdf4;
  --border: #e2e8f0;
  --border-light: #e6f3e8;

  /* admin-only tokens */
  --sa-canvas: #f3f7f1;
  --sa-line: #dfeadc;
  --sa-shadow-sm: 0 1px 2px rgba(26, 74, 26, 0.06), 0 1px 3px rgba(26, 74, 26, 0.05);
  --sa-shadow-md: 0 4px 6px -1px rgba(26, 74, 26, 0.07), 0 10px 24px -8px rgba(45, 122, 45, 0.16);
  --sa-ease: cubic-bezier(0.2, 0.7, 0.2, 1);
}
</style>

<style scoped>
/* ════════════════════════════════════════════════════════════
   SHELL — dark forest sidebar (the one bold move) on a calm canvas
   ════════════════════════════════════════════════════════════ */
.shell {
  display: grid;
  grid-template-columns: 252px 1fr;
  min-height: 100vh;
  background: var(--sa-canvas);
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-dark);
  -webkit-font-smoothing: antialiased;
}

/* ─── SIDEBAR ────────────────────────────────────────────── */
.sidebar {
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  background: var(--green-dark);
  color: var(--green-pale);
  z-index: 220;
}

.brand-area {
  position: relative;
  display: flex;
  align-items: center;
  height: 76px;
  padding: 0 20px;
  border-bottom: 1px solid rgba(200, 230, 201, 0.12);
  overflow: hidden;
}

.brand-glow {
  position: absolute;
  top: -50px;
  right: -40px;
  width: 130px;
  height: 130px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(129, 199, 132, 0.28), transparent 70%);
  pointer-events: none;
}

.brand-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--cream);
  box-shadow: 0 0 0 3px rgba(129, 199, 132, 0.25);
  overflow: hidden;
  flex-shrink: 0;
}

.mark img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.brand-name {
  font-family: "Hanuman", serif;
  font-size: 15.5px;
  font-weight: 700;
  color: var(--white);
  line-height: 1.5;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  padding: 16px 12px;
  overflow-y: auto;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
  padding: 12px 14px;
  border: none;
  border-radius: 12px;
  background: none;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--green-soft);
  text-align: left;
  cursor: pointer;
  transition: background 0.18s var(--sa-ease), color 0.18s var(--sa-ease);
}

/* Short labels only — truncate instead of wrapping to two lines */
.nav-label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-item:hover {
  background: rgba(200, 230, 201, 0.09);
  color: var(--white);
}

.nav-item.active {
  background: var(--cream);
  color: var(--green-dark);
  font-weight: 700;
  box-shadow: 0 6px 16px -6px rgba(0, 0, 0, 0.35);
}

.nav-item.active :deep(svg) {
  color: var(--green-mid);
}

.nav-item:focus-visible,
.lang-btn:focus-visible,
.logout-link:focus-visible,
.btn:focus-visible,
.copy-btn:focus-visible,
.mobile-bar .icon-btn:focus-visible {
  outline: 2px solid var(--green-accent);
  outline-offset: 2px;
}

.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 14px 20px;
  border-top: 1px solid rgba(200, 230, 201, 0.12);
}

.lang-btn {
  min-height: 44px;
  padding: 11px 14px;
  border: 1px solid rgba(200, 230, 201, 0.25);
  border-radius: var(--radius-btn);
  background: transparent;
  color: var(--green-soft);
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s var(--sa-ease), color 0.18s var(--sa-ease);
}

.lang-btn:hover {
  background: rgba(200, 230, 201, 0.12);
  color: var(--white);
}

.logout-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 11px 14px;
  border: 1px solid transparent;
  border-radius: var(--radius-btn);
  background: rgba(230, 81, 0, 0.14);
  color: #ffb98a;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s var(--sa-ease);
}

.logout-link:hover {
  background: rgba(230, 81, 0, 0.26);
}

/* ─── MAIN + HEADER ──────────────────────────────────────── */
.main {
  width: 100%;
  max-width: 1240px;
  padding: 32px 40px 72px;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
}

.page-title {
  margin: 0;
  font-family: "Hanuman", serif;
  font-size: 26px;
  font-weight: 700;
  color: var(--green-dark);
  line-height: 1.7; /* Khmer glyphs need the extra room */
}

.page-sub {
  margin: 0;
  font-size: 13.5px;
  color: var(--text-light);
}

/* ─── SLIM TAB BAR + QUIET REFRESH ───────────────────────── */
.tab-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  min-height: 44px;
  margin-bottom: 14px;
}

/* the summary text takes the left half, the refresh stays right */
.tab-bar :deep(.summary) {
  margin-right: auto;
}

.icon-refresh {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 1px solid var(--sa-line);
  border-radius: 12px;
  background: var(--white);
  color: var(--green-mid);
  box-shadow: var(--sa-shadow-sm);
  cursor: pointer;
  transition: background 0.18s var(--sa-ease), border-color 0.18s var(--sa-ease);
}

.icon-refresh:hover:not(:disabled) {
  background: var(--green-pale);
  border-color: var(--green-accent);
}

.icon-refresh:disabled {
  opacity: 0.6;
  cursor: default;
}

.icon-refresh.spinning :deep(svg) {
  animation: spin 0.8s linear infinite;
}

/* Text button used in list headers ("View all") */
.link-btn {
  padding: 8px 10px;
  border: none;
  border-radius: 8px;
  background: none;
  color: var(--green-mid);
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s var(--sa-ease);
}

.link-btn:hover {
  background: var(--green-pale);
}

/* Dashboard: two compact preview panels under the stats grid */
.dash-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 24px;
}

/* ─── MOBILE BAR + SCRIM (shown ≤900px) ──────────────────── */
.mobile-bar {
  display: none;
  height: 70px;
}

.nav-scrim {
  display: none;
}

/* (the stat cards moved to the Dashboard tab — see <SuperAdminStatsGrid />,
   every other tab shows the 1-line <SummaryStrip /> instead) */

/* ═══ ATOMS — tags, status dots, code, muted text ═══ */
.tag {
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.tag-teal {
  background: var(--green-pale);
  color: var(--green-mid);
}

.tag-amber {
  background: #fff1e0;
  color: var(--orange);
}

.tag-blue {
  background: #e0ecff;
  color: #1e40af;
}

/* The single badge a list row is allowed to carry */
.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border: 1px solid transparent;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
  white-space: nowrap;
}

.pill i {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.pill-active {
  background: var(--green-pale);
  border-color: var(--green-soft);
  color: var(--green-dark);
}

.pill-active i {
  background: var(--green-light);
}

.pill-suspended {
  background: #fdecea;
  border-color: #f8c9c4;
  color: var(--red);
}

.pill-suspended i {
  background: var(--red);
}

.pill-inactive {
  background: #f1f5f1;
  border-color: var(--sa-line);
  color: var(--text-mid);
}

.pill-inactive i {
  background: var(--text-light);
}

/* Timestamps in log rows — small, right aligned, tabular */
.row-time {
  font-size: 13px;
  color: var(--text-mid);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.status-dot {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13.5px;
  line-height: 1.6;
  font-weight: 500;
  color: var(--text-dark);
  white-space: nowrap;
}

.status-dot i {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.sd-active i,
.sd-verified i {
  background: var(--green-light);
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.18);
}

.sd-suspended i {
  background: var(--red);
  box-shadow: 0 0 0 3px rgba(198, 40, 40, 0.14);
}

.sd-inactive i,
.sd-lastlogin i {
  background: var(--muted-light);
}

.sd-pending i {
  background: var(--amber);
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.18);
}

/* Order status badge (feed + drawer) */
.os {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 11px 4px 9px;
  border-radius: 999px;
  background: var(--surface-soft);
  border: 1px solid var(--sa-line);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
  color: var(--text-mid);
  white-space: nowrap;
}

.os i {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.os-pending i {
  background: var(--amber);
}

.os-confirmed i {
  background: var(--blue);
}

.os-preparing i {
  background: #7c3aed;
}

.os-ready i {
  background: var(--green-mid);
}

.os-served i {
  background: var(--green-light);
}

.os-cancelled i {
  background: var(--red);
}

.row-muted {
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--text-mid);
  white-space: nowrap;
}

.code {
  padding: 3px 10px;
  border: 1px solid var(--green-soft);
  border-radius: 8px;
  background: var(--green-pale);
  color: var(--green-dark);
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 13px;
}

.swatch {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 1px solid var(--sa-line);
  border-radius: 50%;
  vertical-align: middle;
}

.copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border: 1px solid var(--sa-line);
  border-radius: 999px;
  background: var(--white);
  color: var(--green-mid);
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s var(--sa-ease);
}

.copy-btn:hover {
  background: var(--green-pale);
  border-color: var(--green-accent);
}

.link-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

/* ═══ DRAWER CONTENT — field grid, login history, order items ═══ */
.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  border: 1px solid var(--sa-line);
  border-radius: 14px;
  background: var(--cream);
}

.field-full {
  grid-column: 1 / -1;
}

.field-label {
  font-size: 13px;
  font-weight: 500;
  line-height: 1.6;
  color: var(--text-mid);
}

.field-value {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-dark);
}

.note-text {
  display: block;
  white-space: pre-wrap;
  word-break: break-word;
}

.logins-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
  padding: 14px 16px;
  border: 1px solid var(--sa-line);
  border-radius: var(--radius-card);
  background: var(--cream);
}

.logins-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: var(--green-mid);
}

.logins {
  display: flex;
  flex-direction: column;
}

/* Login history / order items: text on top, meta wrapped underneath.
   A single flex row let long device strings squeeze the text into one word
   per line and pushed the IP chip outside the drawer. */
.login-item {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 6px;
  padding: 12px 0;
  border-bottom: 1px solid var(--sa-line);
}

.login-item:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.login-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.login-main strong {
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1.6;
  color: var(--green-dark);
  overflow-wrap: anywhere;
}

.login-main span {
  font-size: 13px;
  line-height: 1.7;
  color: var(--text-mid);
  overflow-wrap: anywhere;
}

.login-side {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px 8px;
  min-width: 0;
}

/* Inside a drawer row the meta may wrap (nowrap is for list rows only) */
.logins-block .row-muted {
  white-space: normal;
  overflow-wrap: anywhere;
}

.logins-empty {
  padding: 12px;
  font-size: 13px;
  color: var(--text-light);
  text-align: center;
}

.order-total-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px dashed var(--green-accent);
  font-size: 14px;
  color: var(--text-mid);
}

.order-total-row strong {
  font-size: 18px;
  color: var(--green-mid);
}

/* Temporary password dialog (inside ConfirmModal) */
.temp-pw-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}

.temp-pw {
  padding: 8px 14px;
  font-size: 15px;
  letter-spacing: 0.5px;
}

/* ═══ BUTTONS ═══ */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 10px 18px;
  border: 1px solid transparent;
  border-radius: var(--radius-btn);
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.18s var(--sa-ease), border-color 0.18s var(--sa-ease),
    transform 0.12s var(--sa-ease);
}

.btn:active {
  transform: scale(0.97);
}

.btn-ghost {
  background: var(--green-pale);
  color: var(--green-dark);
}

.btn-ghost:hover {
  background: var(--green-soft);
}

.btn-green {
  background: var(--green-mid);
  color: var(--white);
}

.btn-green:hover {
  background: var(--green-dark);
}

.btn-blue {
  background: #e0ecff;
  color: #1e40af;
  border-color: #bfd4ff;
}

.btn-blue:hover {
  background: #cfe0ff;
}

.btn-red {
  background: #fdecea;
  color: var(--red);
  border-color: #f8c9c4;
}

.btn-red:hover {
  background: #fad6d2;
}

/* ════════════════════════════════════════════════════════════
   RESPONSIVE — tablet (≤900px) and phone (≤480px)
   ════════════════════════════════════════════════════════════ */
@media (max-width: 900px) {
  .shell {
    grid-template-columns: 1fr;
  }

  .mobile-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    height: 68px;
    padding: 0 16px;
    background: var(--green-dark);
    color: var(--white);
    position: sticky;
    top: 0;
    z-index: 90;
    box-shadow: 0 4px 16px -6px rgba(0, 0, 0, 0.35);
  }

  .mobile-bar-title {
    flex: 1;
    font-family: "Hanuman", serif;
    font-size: 15px;
    font-weight: 700;
  }

  .mobile-bar .icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border: 1px solid rgba(200, 230, 201, 0.3);
    border-radius: 12px;
    background: rgba(200, 230, 201, 0.1);
    color: var(--white);
    cursor: pointer;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: -280px;
    width: 252px;
    height: 100vh;
    transition: left 0.24s var(--sa-ease);
  }

  .nav-open .sidebar {
    left: 0;
    box-shadow: 8px 0 32px rgba(0, 0, 0, 0.28);
  }

  .nav-open .nav-scrim {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(26, 74, 26, 0.45);
    backdrop-filter: blur(2px);
    z-index: 210;
  }

  .main {
    padding: 20px 16px 56px;
  }

  .topbar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  /* Summary wraps under the title; the refresh keeps its 44px hit area */
  .tab-bar {
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 10px;
  }

  .tab-bar :deep(.summary) {
    flex-basis: 100%;
    margin-right: 0;
  }

  .dash-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .field-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 21px;
  }

  /* Log rows: keep the timestamp on the same line as the badge */
  .row-time {
    font-size: 12.5px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .icon-refresh.spinning :deep(svg),
  .sidebar,
  .link-btn {
    animation: none;
    transition: none;
  }
}
</style>