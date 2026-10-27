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
          <div class="brand-text">
            <span class="brand-name">{{ t.super_admin }}</span>
            <!-- Fixed role badge — the same for every super admin, so it stays a
                 literal string (amber, uppercase, wide tracking) instead of i18n. -->
            <span class="brand-role" aria-hidden="true">SUPER ADMIN</span>
          </div>
        </div>
      </div>

      <nav class="nav" role="navigation" :aria-label="t.super_admin">
        <button v-for="item in navItems" :key="item.tab" class="nav-item" :class="{ active: tab === item.tab }"
          :title="item.label" :aria-current="tab === item.tab ? 'page' : undefined" @click="selectTab(item.tab)">
          <AppIcon :name="item.icon" :size="18" />
          <span class="nav-label">{{ item.label }}</span>
        </button>
      </nav>

      <div class="sidebar-footer">
        <!-- Segmented locale control: the active segment is visible at a glance.
             The label is the language NAME it switches TO (kept as before). -->
        <div class="lang-seg" role="group" :aria-label="t.super_admin">
          <button class="lang-seg-btn" :class="{ on: locale !== 'km' }" @click="locale !== 'en' && toggleLocale()">EN</button>
          <button class="lang-seg-btn" :class="{ on: locale === 'km' }" @click="locale === 'km' || toggleLocale()">ខ្មែរ</button>
        </div>
        <button class="logout-link" :aria-label="t.logout" :title="t.logout" @click="showLogoutConfirm = true">
          <AppIcon name="lock" :size="15" /> {{ t.logout }}
        </button>
      </div>
    </aside>
    <!-- Tap closes the drawer; a left-swipe also closes it. The swipe needs no
         script state: the start X is stashed on the element's dataset inline. -->
    <div class="nav-scrim" @click="mobileNavOpen = false"
      @touchstart="$event.currentTarget.dataset.swipeX = $event.touches[0].clientX"
      @touchend="(Number($event.currentTarget.dataset.swipeX) - $event.changedTouches[0].clientX) > 60 && (mobileNavOpen = false)">
    </div>

    <!-- ─── MAIN ───────────────────────────────────────────── -->
    <main class="main">
      <!-- Header: breadcrumb + title + subtitle (refresh + last-refreshed live
           in the right cluster, aligned to the title baseline) -->
      <header class="topbar">
        <div class="topbar-id">
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <span class="crumb-root">{{ t.super_admin }}</span>
            <span class="crumb-sep" aria-hidden="true"></span>
            <span class="crumb-current">{{ pageTitle }}</span>
          </nav>
          <h1 class="page-title"><AppIcon name="sparkle" :size="18" class="hdr-title-i" /> {{ pageTitle }}</h1>
          <p class="page-sub u-muted">{{ t.super_admin }} · {{ t.manage_system }}</p>
        </div>
        <div class="tab-bar">
          <button class="icon-refresh" :class="{ spinning: loading }" :disabled="loading" :title="t.refresh"
            :aria-label="t.refresh" @click="refreshAll">
            <AppIcon name="refresh" :size="16" />
          </button>
        </div>
      </header>

      <!-- Slim bar: one line of figures for the current tab (refresh already lives
           in the header's right cluster, so only the strip remains here) -->
      <div v-if="tab !== 'dashboard'" class="tab-bar">
        <SummaryStrip v-if="tab !== 'dashboard'" :items="summaryItems" />
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
          <AdminList :title="t.sessions_label" icon="clock" :items="sortedSessions" :count="accessSessions.length"
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
          <AdminList :title="t.actions_feed" icon="clipboard" :items="sortedActivities"
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
        <div class="field-group">
          <span class="field-group-title">{{ t.role }}</span>
          <dl class="field-dl">
            <div class="field">
              <span class="field-label">{{ t.id }}</span>
              <span class="field-value u-num">#{{ selectedMember.id }}</span>
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
          </dl>
        </div>

        <div class="field-group">
          <span class="field-group-title">{{ t.profile }}</span>
          <dl class="field-dl">
            <div class="field">
              <span class="field-label">{{ t.restaurants }}</span>
              <span class="field-value u-num">{{ selectedMember.restaurantCount }}</span>
            </div>
            <div class="field">
              <span class="field-label">{{ t.created_at }}</span>
              <span class="field-value u-num">{{ formatDate(selectedMember.createdAt) }}</span>
            </div>
            <div class="field field-full">
              <span class="field-label">{{ t.restaurant_name }}</span>
              <span class="field-value">{{ selectedMember.restaurantName || "—" }}</span>
            </div>
            <div class="field field-full">
              <span class="field-label">{{ t.last_login }}</span>
              <span class="field-value u-num">
                {{ selectedMember.lastLoginAt ? formatDateTime(selectedMember.lastLoginAt) : t.never }}
              </span>
            </div>
          </dl>
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
        <div class="field-group">
          <span class="field-group-title">{{ t.role }}</span>
          <dl class="field-dl">
            <div class="field">
              <span class="field-label">{{ t.id }}</span>
              <span class="field-value u-num">#{{ selectedUser.id }}</span>
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
          </dl>
        </div>

        <div class="field-group">
          <span class="field-group-title">{{ t.profile }}</span>
          <dl class="field-dl">
            <div class="field">
              <span class="field-label">{{ t.restaurants }}</span>
              <span class="field-value">{{ selectedUser.restaurantName || "—" }}</span>
            </div>
            <div class="field">
              <span class="field-label">{{ t.created_at }}</span>
              <span class="field-value u-num">{{ formatDate(selectedUser.createdAt) }}</span>
            </div>
            <div class="field field-full">
              <span class="field-label">{{ t.last_login }}</span>
              <span class="field-value u-num">
                {{ selectedUser.lastLoginAt ? formatDateTime(selectedUser.lastLoginAt) : t.never }}
              </span>
            </div>
          </dl>
        </div>
      </div>

      <div v-if="selectedUser" class="logins-block">
        <div class="logins-title">
          <AppIcon name="clock" :size="12" /> {{ t.recent_logins }}
        </div>
        <div v-if="selectedUser.loginHistory?.length" class="logins">
          <div v-for="h in selectedUser.loginHistory" :key="h.id" class="login-item u-hairline">
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
            <details class="login-details">
              <summary>{{ t.device_more_details || "Full device details" }}</summary>
              <dl class="login-detail-grid">
                <div v-if="h.deviceType">
                  <dt>{{ t.device_type || "Device type" }}</dt>
                  <dd>{{ h.deviceType }}</dd>
                </div>
                <div v-if="h.browser || h.browserVersion">
                  <dt>{{ t.device_browser || "Browser" }}</dt>
                  <dd>{{ h.browser || "—" }}{{ h.browserVersion ? ` ${h.browserVersion}` : "" }}</dd>
                </div>
                <div v-if="h.os || h.osVersion">
                  <dt>{{ t.device_os }}</dt>
                  <dd>{{ h.os || "—" }}{{ h.osVersion ? ` ${h.osVersion}` : "" }}</dd>
                </div>
                <div v-if="h.screen">
                  <dt>{{ t.device_screen || "Screen" }}</dt>
                  <dd>{{ h.screen }}</dd>
                </div>
                <div v-if="h.ipAddress">
                  <dt>{{ t.device_ip }}</dt>
                  <dd>{{ h.ipAddress }}</dd>
                </div>
                <div v-if="h.city || h.region || h.country">
                  <dt>{{ t.device_location }}</dt>
                  <dd>{{ placeOf(h, ["city", "region", "country"]) }}</dd>
                </div>
                <div v-if="h.isp">
                  <dt>{{ t.device_isp || "Internet provider" }}</dt>
                  <dd>{{ h.isp }}</dd>
                </div>
                <div v-if="h.platform">
                  <dt>{{ t.device_platform }}</dt>
                  <dd>{{ h.platform }}</dd>
                </div>
                <div v-if="h.hardware">
                  <dt>{{ t.device_hardware }}</dt>
                  <dd>{{ h.hardware }}</dd>
                </div>
                <div v-if="h.timezone">
                  <dt>{{ t.device_timezone }}</dt>
                  <dd>{{ h.timezone }}</dd>
                </div>
                <div v-if="h.language">
                  <dt>{{ t.device_language }}</dt>
                  <dd>{{ h.language }}</dd>
                </div>
                <div v-if="h.latitude != null && h.longitude != null">
                  <dt>{{ t.device_coords }}</dt>
                  <dd>{{ Number(h.latitude).toFixed(4) }}, {{ Number(h.longitude).toFixed(4) }}</dd>
                </div>
                <div v-if="h.asn || h.org">
                  <dt>{{ t.device_asn }}</dt>
                  <dd>{{ [h.asn, h.org].filter(Boolean).join(" · ") }}</dd>
                </div>
                <div v-if="h.isProxy || h.isHosting">
                  <dt>{{ t.device_network_flags || "Network flags" }}</dt>
                  <dd>{{ [h.isProxy && (t.device_vpn_flag || "VPN / Proxy"), h.isHosting && (t.device_hosting_flag || "Server / Hosting IP")].filter(Boolean).join(" · ") }}</dd>
                </div>
                <div v-if="h.loginCount">
                  <dt>{{ t.device_logins }}</dt>
                  <dd>{{ h.loginCount }}</dd>
                </div>
                <div v-if="h.lastActiveAt">
                  <dt>{{ t.device_last_active }}</dt>
                  <dd>{{ formatDateTime(h.lastActiveAt) }}</dd>
                </div>
                <div v-if="h.revokedAt">
                  <dt>{{ t.device_revoked_note }}</dt>
                  <dd>{{ formatDateTime(h.revokedAt) }}</dd>
                </div>
                <div v-if="h.userAgent" class="login-detail-full">
                  <dt>{{ t.device_user_agent }}</dt>
                  <dd>{{ h.userAgent }}</dd>
                </div>
              </dl>
            </details>
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
        <div class="field-group">
          <span class="field-group-title">{{ t.restaurants }}</span>
          <dl class="field-dl">
            <div class="field">
              <span class="field-label">{{ t.id }}</span>
              <span class="field-value u-num">#{{ selectedRestaurant.id }}</span>
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
              <span class="field-value u-num">{{ selectedRestaurant.orders_count ?? 0 }}</span>
            </div>
            <div class="field">
              <span class="field-label">{{ t.foods }}</span>
              <span class="field-value u-num">{{ selectedRestaurant.foods_count ?? 0 }}</span>
            </div>
            <div class="field">
              <span class="field-label">{{ t.created_at }}</span>
              <span class="field-value u-num">{{ formatDate(selectedRestaurant.created_at) }}</span>
            </div>
            <div class="field field-full">
              <span class="field-label">{{ t.link_code }}</span>
              <span class="field-value link-row">
                <code class="code">{{ `/link ${selectedRestaurant.telegram_link_code || "—"}` }}</code>
                <button v-if="selectedRestaurant.telegram_link_code" class="copy-btn"
                  @click="copyText(`/link ${selectedRestaurant.telegram_link_code}`)">
                  <AppIcon name="copy" :size="12" /> {{ t.copy_link }}
                </button>
              </span>
            </div>
          </dl>
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
        <div class="field-group">
          <span class="field-group-title">{{ t.orders }}</span>
          <dl class="field-dl">
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
              <span class="field-value u-num">{{ formatMoney(selectedOrder.total) }}</span>
            </div>
            <div class="field">
              <span class="field-label">{{ t.created_at }}</span>
              <span class="field-value u-num">{{ formatDateTime(selectedOrder.createdAt) }}</span>
            </div>
            <div class="field field-full">
              <span class="field-label">{{ t.note }}</span>
              <span class="field-value note-text">{{ selectedOrder.note || t.no_note }}</span>
            </div>
          </dl>
        </div>
      </div>

      <div v-if="selectedOrder" class="logins-block">
        <div class="logins-title">{{ t.order_items }}</div>
        <div class="logins">
          <div v-for="(item, i) in selectedOrder.items" :key="i" class="login-item u-hairline">
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
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
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

/* ── STATE: "last refreshed Xs ago" micro-label (display only, ticks 10s) ── */
const lastRefreshedAt = ref(Date.now());
const nowTick = ref(Date.now()); // bumped by setInterval to re-render the label

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

/* ── COMPUTED: access-tab secondary lists ────────────────── */
// Live sessions sorted online-first, then most-recently-active: the raw API
// order made the "who is online right now" rows hard to find. The computed
// also reads nowTick (bumped every 10s) so the online/offline pills and the
// amber/teal avatars re-evaluate live without refetching anything.
const sortedSessions = computed(() => {
  void nowTick.value;
  return [...accessSessions.value].sort((a, b) => {
    const live = Number(isOnline(b.lastActiveAt)) - Number(isOnline(a.lastActiveAt));
    if (live) return live;
    return new Date(b.lastActiveAt || 0) - new Date(a.lastActiveAt || 0);
  });
});

// Audit trail always newest-first, whatever order the API happens to return
const sortedActivities = computed(() =>
  [...accessActivities.value].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
  ),
);

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
    lastRefreshedAt.value = Date.now(); // feeds the "last refreshed Xs ago" label
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

// The dashboard loads once on mount; a display-only 10s ticker re-renders the
// "last refreshed Xs ago" micro-label (it never refetches — just re-reads the clock).
let refreshTicker = null;
onMounted(() => {
  refreshAll();
  refreshTicker = setInterval(() => {
    nowTick.value = Date.now();
  }, 10000);
});
onBeforeUnmount(() => {
  if (refreshTicker) clearInterval(refreshTicker);
});

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
/* Global on purpose: drawers, confirm dialogs and toasts are teleported to <body>,
   so their own <style scoped> rules can never reach this view — they are refined
   here instead. The login palette below is IDENTICAL to the login tokens, so the
   login page is unaffected. The old tokens (--teal, --ink, …) are kept so AdminView /
   landing / child components keep working. New admin-only tokens use the --sa- prefix
   so nothing can collide with login. */
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
  --text-mid: #2f4a2f; /* bumped from #3a5a3a: clears 4.5:1 on --cream */
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

  /* Three-level elevation, used consistently: lists = raised, drawers = floating,
     inline chips = flat. Tokens (not literals) so AdminList / DetailDrawer can opt in. */
  --sa-elev-flat: none;
  --sa-elev-raised: var(--sa-shadow-sm);
  --sa-elev-floating: 0 18px 48px -12px rgba(20, 60, 30, 0.28), 0 2px 8px rgba(20, 60, 30, 0.1);

  /* Sidebar widths — the full rail and the 72px icon rail it collapses to (pure CSS) */
  --sa-sidebar: 252px;
  --sa-rail: 72px;

  /* Barely-visible grain for the sidebar edge + the faint dotted canvas grid.
     A tiny inline SVG keeps this dependency-free and crisp on any DPR. */
  --sa-noise: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
  --sa-dot: rgba(45, 122, 45, 0.03);

  /* Static sparkline path used as a CSS mask on the stat cards — pure SVG, no
     data fetching. One shared shape keeps the grid lively without new requests. */
  --sa-spark: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 28' preserveAspectRatio='none'%3E%3Cpolyline points='0,20 12,16 24,18 36,10 48,13 60,6 72,9 84,3 100,7' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
}

/* ════════════════════════════════════════════════════════════
   TELEPORTED CHILDREN — drawers, confirm dialogs, toasts.
   These live on <body>; the scoped block below cannot reach them,
   and they are exclusive to this console, so they are tuned here.
   ════════════════════════════════════════════════════════════ */

/* DetailDrawer — keep the identity header pinned while long login history /
   order items scroll, and pin the action footer above a hairline. */
.drawer .drawer-head {
  position: sticky;
  top: 0;
  z-index: 2;
  box-shadow: var(--sa-elev-floating);
}

/* The action footer sticks to the bottom of the scrolling drawer with a hairline. */
.drawer .drawer-actions {
  position: sticky;
  bottom: 0;
  margin: 8px -22px -30px;
  padding: 14px 22px;
  background: var(--surface);
  border-top: 1px solid var(--sa-line);
}

/* Focus ring on the drawer close button (teleported, so it can't be scoped) */
.drawer .icon-btn:focus-visible {
  outline: 2px solid var(--green-accent);
  outline-offset: 2px;
}

/* Open: gentle 16px slide + fade over 220ms (respects prefers-reduced-motion below) */
.drawer-enter-active .drawer,
.drawer-leave-active .drawer {
  transition: transform 0.22s var(--sa-ease), opacity 0.22s var(--sa-ease);
}

.drawer-enter-from .drawer,
.drawer-leave-to .drawer {
  transform: translateX(16px);
  opacity: 0;
}

/* Toasts — slide in from the right (auto-dismiss is handled by the view) */
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s var(--sa-ease), transform 0.2s var(--sa-ease);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(24px);
}

.toast:focus-visible {
  outline: 2px solid var(--green-accent);
  outline-offset: 2px;
}

/* Confirms — keep the friendly pop, just soften the danger shadow to the palette */
.confirm-logout.is-danger {
  box-shadow: 0 6px 16px -6px rgba(183, 28, 28, 0.4);
}

@media (max-width: 480px) {
  /* Full-width, stacked drawer action buttons with an 8px gap on small phones */
  .drawer .drawer-actions {
    margin: 8px -16px -24px;
    padding: 14px 16px;
  }

  /* NOTE: this is the unscoped <style> block — :deep() is ignored here, so the
     plain descendant selector is required to reach the teleported drawer buttons. */
  .drawer .drawer-actions .btn {
    flex: 1 1 100%;
    min-width: 0;
  }
}

@media (prefers-reduced-motion: reduce) {

  .drawer-enter-active .drawer,
  .drawer-leave-active .drawer,
  .toast-enter-active,
  .toast-leave-active {
    transition: none;
  }

  .drawer-enter-from .drawer,
  .drawer-leave-to .drawer,
  .toast-enter-from,
  .toast-leave-to {
    transform: none;
  }
}
</style>

<style scoped>
/* ════════════════════════════════════════════════════════════
   UTILITIES — atoms repeated across the view (kept in this file on purpose;
   the admin components are exclusive to this console so nothing collides).
   ════════════════════════════════════════════════════════════ */

/* Every numeric display — stats, money, order totals, timestamps. Tabular
   figures stop the classic "1s / 1m" jitter when a list re-orders live. */
.u-num {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" 1;
}

/* Secondary text: same colour everywhere, one declaration to adjust later.
   --text-mid is #2f4a2f on purpose: 7.1:1 on --cream (≥4.5:1, WCAG AA). */
.u-muted {
  color: var(--text-mid);
}

/* A 1px hairline row separator — one declaration for every stacked log/item list */
.u-hairline {
  border: 0;
  border-bottom: 1px solid var(--sa-line);
  margin: 0;
}

/* ════════════════════════════════════════════════════════════
   SHELL — dark forest sidebar (the one bold move) on a calm canvas
   ════════════════════════════════════════════════════════════ */
.shell {
  display: grid;
  grid-template-columns: var(--sa-sidebar) minmax(0, 1fr);
  min-width: 0;
  /* Layered canvas so the sidebar reads as floating rather than glued to flat
     green: a soft green wash in the top-left + a 1px dotted grid at 3%. */
  background-color: var(--sa-canvas);
  background-image: radial-gradient(1200px 600px at 15% -10%, rgba(200, 230, 201, 0.55), transparent 70%),
    radial-gradient(900px 500px at 100% 0%, rgba(129, 199, 132, 0.18), transparent 65%);
  background-attachment: fixed;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-dark);
  -webkit-font-smoothing: antialiased;
}

/* The 1px dotted grid is its own layer so it can sit at 3% over the wash
   without a second gradient() call every time the shell re-renders. */
.shell::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image: radial-gradient(var(--sa-dot) 1px, transparent 1px);
  background-size: 22px 22px;
}

/* ─── SIDEBAR ────────────────────────────────────────────── */
.sidebar {
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  z-index: 220;
  color: var(--green-pale);
  background-color: var(--green-dark);
  /* Barely-visible grain: imperceptible on flat panels, but it kills the
     "clean vector" look and makes the rail feel like a material. */
  background-image: var(--sa-noise);
  background-blend-mode: soft-light;
  /* Soft inner right-edge highlight — the seam where the rail meets the canvas */
  box-shadow: inset -1px 0 0 rgba(200, 230, 201, 0.16), inset 0 1px 0 rgba(200, 230, 201, 0.08);
  /* isolate keeps the fixed dotted-grid layer (z-index 0) behind the rail */
  isolation: isolate;
}


.brand-area {
  position: relative;
  display: flex;
  align-items: center;
  height: 84px;
  padding: 0 18px;
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
  min-width: 0;
}

/* Brand text stacks the Khmer name over the fixed amber role badge */
.brand-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
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
  /* No ellipsis here: the Khmer name must never be truncated without a tooltip,
     and it fits the 252px rail at this size. */
}

/* Role badge — amber, uppercase, wide tracking. It is a fixed string (the same
   for every super admin) so it deliberately skips the Hanuman line-height room
   and the i18n keys. */
.brand-role {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: var(--amber-soft);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  padding: 14px 10px;
  overflow-y: auto;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px; /* 18px icon + 10px gap + label, per spec */
  min-height: 44px;
  padding: 10px 14px;
  border: none;
  border-radius: 10px;
  background: none;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--green-soft);
  text-align: left;
  cursor: pointer;
  /* 120ms background fade; the icon translate is on the SVG below */
  transition: background 0.12s var(--sa-ease), color 0.12s var(--sa-ease);
}

/* Short labels only — truncate instead of wrapping to two lines. The nav item
   already carries :title, so the ellipsis always has a native tooltip fallback. */
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

/* Icon nudges 2px right on hover (180ms) — a quiet "this is tappable" cue */
.nav-item :deep(svg) {
  flex-shrink: 0;
  transition: transform 0.18s var(--sa-ease), color 0.12s var(--sa-ease);
}

.nav-item:hover :deep(svg) {
  transform: translateX(2px);
}

/* Active item: a 3px green-accent bar on the left edge replaces the old filled
   pill, so several items can read as "current section" without shouting. */
.nav-item.active {
  background: rgba(200, 230, 201, 0.14);
  color: var(--white);
  font-weight: 700;
}

.nav-item.active::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 26px;
  border-radius: 0 3px 3px 0;
  background: var(--green-accent);
}

.nav-item.active :deep(svg) {
  color: var(--green-accent);
}

.nav-item:focus-visible,
.lang-seg-btn:focus-visible,
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

/* Segmented locale control — the active language is visible at a glance */
.lang-seg {
  display: flex;
  gap: 4px;
  padding: 4px;
  border: 1px solid rgba(200, 230, 201, 0.22);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.18);
}

.lang-seg-btn {
  flex: 1;
  min-height: 36px;
  border: none;
  border-radius: 9px;
  background: transparent;
  color: var(--green-soft);
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 700;
  letter-spacing: 0.2px;
  cursor: pointer;
  transition: background 0.15s var(--sa-ease), color 0.15s var(--sa-ease);
}

.lang-seg-btn:hover {
  color: var(--white);
}

.lang-seg-btn.on {
  background: var(--cream);
  color: var(--green-dark);
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
  min-width: 0;
  padding: 32px 40px 72px;
  overflow-x: clip;
}

.topbar {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
}

/* Left cluster: breadcrumb → title → subtitle → last-refreshed, stacked so the
   title baseline lines up with the refresh button in .tab-bar on the right. */
.topbar-id {
  min-width: 0;
}

/* Breadcrumb — Super Admin / <Tab Label>, 12px + muted, sitting above the H1. */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 4px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--text-light);
}

.crumb-current {
  font-weight: 600;
  color: var(--green-mid);
}

/* A tiny chevron built from a rotated border — no icon font dependency */
.crumb-sep {
  width: 6px;
  height: 6px;
  border-top: 1.5px solid var(--green-accent);
  border-right: 1.5px solid var(--green-accent);
  transform: rotate(45deg);
}

/* "last refreshed Xs ago" — display only (never refetches). The green dot turns
   static grey while a load is in flight, then pops back on completion. */
.refreshed-line {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 6px;
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--text-mid);
}

.refreshed-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--muted-light);
  transition: background 0.2s var(--sa-ease), box-shadow 0.2s var(--sa-ease);
}

.refreshed-dot.live {
  background: var(--green-mid);
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.18);
}

.refreshed-num {
  font-weight: 600;
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

/* A single 360° turn on press — a satisfying "yep, refreshing" tap. The infinite
   .spinning loop above keeps running for the duration of the actual load. */
.icon-refresh:active:not(:disabled) :deep(svg) {
  animation: spin 0.6s var(--sa-ease);
}

.icon-refresh:focus-visible {
  outline: 2px solid var(--green-accent);
  outline-offset: 2px;
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
  /* min(340px, 100%): a hard 340px floor would overflow a 320px phone */
  grid-template-columns: repeat(auto-fit, minmax(min(340px, 100%), 1fr));
  gap: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Expanding ring behind the "online" dot in the live-sessions list */
@keyframes sa-live-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.45);
  }

  60% {
    box-shadow: 0 0 0 5px rgba(76, 175, 80, 0);
  }
}

/* Access tab: the two SECONDARY lists (live sessions + audit trail) sit SIDE
   BY SIDE instead of stacking — same auto-fit pattern as .dash-grid, so they
   collapse to one column on narrow screens. `align-items: start` keeps each
   panel at its natural height instead of stretching the shorter one to match. */
.stack {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(340px, 100%), 1fr));
  gap: 16px;
  margin-top: 16px;
  align-items: start;
}

/* Cap the secondary lists with an internal scroll so the whole access tab fits
   in roughly one screen — an unbounded audit trail used to push everything
   below an endless page. Overscroll containment stops the wheel from scrolling
   the page once a list hits its end. */
.stack :deep(.rows) {
  max-height: 250px;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
}

/* "Online" dot breathes while the session is live (killed by reduced motion) */
.stack :deep(.pill-active i) {
  animation: sa-live-pulse 2.2s var(--sa-ease) infinite;
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

/* ═══ DRAWER CONTENT — definition list, login history, order items ═══
   The drawer data reads as a proper definition list: one titled section per
   group, then full-width rows (label left · value right) on a subtle alternating
   wash — far cleaner than bordered cards or a cramped 2-up grid. */
.field-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

/* Section header ("Identity" / "Access" / "History") — uses existing t.* keys,
   so it reuses whatever Khmer/English wording the list already ships. */
.field-group-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: var(--green-mid);
}

.field-dl {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 0;
}

/* One row = label · value. The value hugs the right edge so the eye scans a
   clean column of answers straight down the drawer. Rows are full-width inside a
   ~440px drawer, so space-between reads naturally without the label drifting
   too far from its value. */
.field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 11px 14px;
  border-radius: 10px;
  background: var(--surface-soft);
}

/* Alternating bands — full-width rows wash pale green every other line, so the
   list reads like a ledger instead of a checkerboard. */
.field:nth-child(even) {
  background: var(--green-pale);
}

.field-label {
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.6;
  color: var(--text-mid);
}

.field-value {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 0;
  margin-left: auto; /* keeps the value right-aligned even as content wraps */
  font-size: 14px;
  font-weight: 600;
  line-height: 1.6; /* Khmer values (names, roles) need the room */
  color: var(--text-dark);
  text-align: right;
}

/* Full-width rows (a long restaurant name, a note, the link code) drop the
   side-by-side layout and stack the value under its label, so nothing gets
   squeezed or awkwardly right-aligned. */
.field-full {
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.field-full .field-value {
  justify-content: flex-start;
  text-align: left;
  width: 100%;
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
  /* the 1px separator comes from the .u-hairline utility on the element */
}

.login-item:last-child {
  padding-bottom: 0;
  border-bottom: none; /* beats .u-hairline via :last-child specificity */
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

.login-details {
  border-top: 1px solid var(--sa-line);
  padding-top: 7px;
  color: var(--text-mid);
  font-size: 12px;
}

.login-details summary {
  cursor: pointer;
  color: var(--green-mid);
  font-weight: 600;
}

.login-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 12px;
  margin: 10px 0 0;
}

.login-detail-grid > div {
  min-width: 0;
}

.login-detail-grid dt {
  color: var(--text-light);
  font-size: 11px;
}

.login-detail-grid dd {
  margin: 2px 0 0;
  overflow-wrap: anywhere;
  color: var(--text-dark);
}

.login-detail-full {
  grid-column: 1 / -1;
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
   INLINE CHILD COMPONENTS — AdminList / UserRow / SuperAdminStatsGrid.
   They render inside .main (not teleported), so the scoped block reaches
   them with :deep(). These admin components are exclusive to this console,
   so refining them here keeps every list on one design system.
   ════════════════════════════════════════════════════════════ */

/* ─── LIST PANEL (AdminList) ───────────────────────────── */
/* "raised" elevation — the panel floats just off the layered canvas */
.main :deep(.panel) {
  border-color: var(--sa-line);
  border-radius: 18px;
  box-shadow: var(--sa-elev-raised);
}

/* Quick-filter chips: flat elevation (they sit on the panel, not above it) */
.main :deep(.chip) {
  box-shadow: var(--sa-elev-flat);
}

.main :deep(.chip:focus-visible),
.main :deep(.btn-add:focus-visible) {
  outline: 2px solid var(--green-accent);
  outline-offset: 2px;
}

/* Empty state: bigger icon in a soft circle + the CTA becomes a primary button */
.main :deep(.empty-icon) {
  width: 48px;
  height: 48px;
  background: var(--green-pale);
}

.main :deep(.empty-action) {
  background: var(--green-mid);
  border-color: transparent;
  color: var(--white);
  box-shadow: var(--sa-shadow-sm);
}

.main :deep(.empty-action:hover) {
  background: var(--green-dark);
  border-color: transparent;
}

/* ─── LIST ROW (UserRow) ───────────────────────────────── */
/* 64px rows on a 1px hairline; a 2px tone accent slides in on hover. */
.main :deep(.row) {
  position: relative;
  min-height: 64px;
  border-bottom: 1px solid var(--sa-line);
  transition: background 0.1s ease;
}

/* The hover accent reads the row's own avatar tone (teal / amber) */
.main :deep(.row)::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: transparent;
  transition: background 0.1s ease;
}

.main :deep(.row.is-clickable:hover) {
  /* --green-pale at ~60% so the hairline stays the strongest line */
  background: color-mix(in srgb, var(--green-pale) 60%, transparent);
}

.main :deep(.row.is-clickable:hover)::before {
  background: var(--teal);
}

.main :deep(.row.is-clickable:has(.avatar.tone-amber):hover)::before {
  background: var(--amber);
}

/* Avatars: 1px inner ring + a soft outer shadow so they lift off the row */
.main :deep(.row .avatar) {
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.35), 0 2px 6px rgba(20, 60, 30, 0.18);
}

/* Super admins (amber) get a gradient ring instead of the plain inner ring */
.main :deep(.row .avatar.tone-amber) {
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.45), 0 0 0 2px var(--amber-soft),
    0 3px 8px rgba(245, 158, 11, 0.28);
}

/* ─── STATUS PILLS (authored in this view, tightened) ──── */
/* dot + text only, 12px, tighter padding — they must never out-shout the name */
.pill {
  padding: 3px 10px 3px 8px;
  font-size: 12px;
}

.pill i {
  width: 6px;
  height: 6px;
}

/* Order-status pill matches the status-pill rhythm */
.os {
  padding: 3px 9px 3px 7px;
  font-size: 12px;
}

.os i {
  width: 6px;
  height: 6px;
}

/* ─── STATS GRID (SuperAdminStatsGrid) ─────────────────── */
/* 20px radius + a 1px gradient border (white padding-box over a green border-box) */
.main :deep(.stat-card) {
  border: 1px solid transparent;
  border-radius: 20px;
  background:
    linear-gradient(var(--white), var(--white)) padding-box,
    linear-gradient(135deg, var(--green-soft), transparent) border-box;
  box-shadow: var(--sa-elev-raised);
}

.main :deep(.stat-num) {
  font-size: 28px;
  font-weight: 700;
  color: var(--green-dark);
  font-variant-numeric: tabular-nums;
}

/* Static sparkline placeholder — the shared SVG path masked over the card's
   bottom edge. No data fetching; it just keeps the grid feeling alive. */
.main :deep(.stat-spark) {
  height: 26px;
  top: auto;
  bottom: 4px;
  background: none;
  opacity: 0.5;
  -webkit-mask: var(--sa-spark) no-repeat center / 100% 100%;
  mask: var(--sa-spark) no-repeat center / 100% 100%;
}

.main :deep(.stat-spark.teal) {
  background-color: var(--green-mid);
}

.main :deep(.stat-spark.amber) {
  background-color: var(--orange);
}

.main :deep(.stat-spark.blue) {
  background-color: var(--blue);
}

.main :deep(.stat-spark.green) {
  background-color: var(--green-light);
}

/* ════════════════════════════════════════════════════════════
   RESPONSIVE — tablet (≤900px) and phone (≤480px)
   ════════════════════════════════════════════════════════════ */
@media (max-width: 900px) {
  .shell {
    grid-template-columns: minmax(0, 1fr);
    min-width: 0;
  }

  .mobile-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 68px;
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
    width: 44px;
    height: 44px;
    flex: 0 0 44px;
    border: 1px solid rgba(200, 230, 201, 0.3);
    border-radius: 12px;
    background: rgba(200, 230, 201, 0.1);
    color: var(--white);
    cursor: pointer;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: min(280px, calc(100vw - 48px));
    height: 100vh;
    height: 100dvh;
    transform: translateX(-100%);
    transition: transform 0.24s var(--sa-ease);
  }

  .nav-open .sidebar {
    transform: translateX(0);
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
    min-width: 0;
    padding: 20px clamp(12px, 3.5vw, 24px) 56px;
  }

  .topbar {
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 22px;
  }

  .topbar-id {
    flex: 1 1 auto;
  }

  .topbar > .tab-bar {
    flex: 0 0 auto;
    min-height: 44px;
    margin: 0;
  }

  /* Summary wraps under the title; the refresh keeps its 44px hit area */
  .tab-bar {
    min-width: 0;
    justify-content: space-between;
    gap: 10px;
  }

  .tab-bar :deep(.summary) {
    flex-basis: 100%;
    margin-right: 0;
  }

  /* Filter chips scroll horizontally on narrow screens; a soft fade on both
     edges signals there is more to reach without adding a scrollbar. */
  .main :deep(.chips) {
    flex-wrap: nowrap;
    overflow-x: auto;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    -webkit-mask-image: linear-gradient(90deg, transparent, #000 16px, #000 calc(100% - 16px), transparent);
    mask-image: linear-gradient(90deg, transparent, #000 16px, #000 calc(100% - 16px), transparent);
  }

  .main :deep(.chips)::-webkit-scrollbar {
    display: none;
  }

  .main :deep(.chip) {
    flex: 0 0 auto;
  }

  .main :deep(.stats-grid) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .main :deep(.stat-card) {
    min-width: 0;
    gap: 10px;
    padding: 12px;
  }

  .main :deep(.stat-body) {
    min-width: 0;
  }

  .main :deep(.stat-num) {
    overflow-wrap: anywhere;
    font-size: clamp(16px, 2.4vw, 20px);
  }

  .main :deep(.stat-label) {
    overflow-wrap: anywhere;
    font-size: 12px;
  }

  .dash-grid {
    grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
    gap: 14px;
  }

  .main :deep(.panel-head) {
    flex-wrap: wrap;
    align-items: center;
  }

  .main :deep(.panel-title) {
    min-width: 0;
  }

  .main :deep(.panel-tools) {
    min-width: 0;
  }

  .main :deep(.search-box) {
    min-width: 0;
  }

  .main :deep(.search-input) {
    min-width: 0;
  }

  .main :deep(.rows) {
    max-height: min(60vh, 480px);
  }

  .main :deep(.rows > .row) {
    flex-shrink: 0;
    min-width: 0;
  }

  .main :deep(.row-main),
  .main :deep(.row-meta),
  .main :deep(.row-actions) {
    width: 100%;
    min-width: 0;
  }

  .main :deep(.row-meta) {
    flex: none;
  }

  .stack {
    grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
  }
}

/* ════════════════════════════════════════════════════════════
   ICON RAIL — between 900 and 1100px the sidebar collapses to a
   72px icon-only rail (pure CSS, no JS state). Labels are hidden,
   so each item leans on the :title tooltip it already carries.
   ════════════════════════════════════════════════════════════ */
@media (min-width: 901px) and (max-width: 1100px) {
  .shell {
    grid-template-columns: var(--sa-rail) minmax(0, 1fr);
  }

  .brand-area {
    justify-content: center;
    padding: 0;
  }

  /* Centre the logo, drop the wordmark + role badge */
  .brand-content {
    justify-content: center;
  }

  .brand-text {
    display: none;
  }

  .nav-item {
    justify-content: center;
    gap: 0;
    padding: 12px;
  }

  .nav-item.active::before {
    height: 22px;
  }

  /* Labels collapse to nothing — the native :title becomes the tooltip */
  .nav-label {
    display: none;
  }

  /* Locale toggle stacks its two segments vertically to fit the rail */
  .lang-seg {
    flex-direction: column;
  }

  .logout-link {
    width: 44px;
    height: 44px;
    min-height: 44px;
    margin-inline: auto;
    padding: 0;
    gap: 0;
    font-size: 0;
  }

  .logout-link :deep(svg) {
    flex-shrink: 0;
  }
}

/* ≤600px: the one-line summary strip stops wrapping and becomes a snap-scrolled
   rail, so a long figure list stays one readable band instead of stacking. */
@media (max-width: 600px) {
  .tab-bar {
    display: block;
  }

  .tab-bar :deep(.summary) {
    flex-wrap: nowrap;
    overflow-x: auto;
    scroll-snap-type: x proximity;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 2px;
    -webkit-mask-image: linear-gradient(90deg, transparent, #000 12px, #000 calc(100% - 12px), transparent);
    mask-image: linear-gradient(90deg, transparent, #000 12px, #000 calc(100% - 12px), transparent);
  }

  .tab-bar :deep(.summary::-webkit-scrollbar) {
    display: none;
  }

  .tab-bar :deep(.summary-item) {
    scroll-snap-align: start;
  }

  .topbar {
    gap: 8px;
    margin-bottom: 18px;
  }

  .topbar > .tab-bar {
    display: flex;
  }

  .main :deep(.panel-head) {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
    padding: 14px;
  }

  .main :deep(.panel-head.panel-head-simple) {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .main :deep(.panel-head.panel-head-inline-tools) {
    grid-template-columns: minmax(0, 1fr) auto auto;
  }

  .main :deep(.panel-head > .panel-title) {
    grid-column: 1;
  }

  .main :deep(.panel-head > .panel-count) {
    grid-column: 2;
    grid-row: 1;
    margin: 0;
  }

  .main :deep(.panel-head > .panel-tools) {
    grid-column: 1 / -1;
    width: 100%;
    min-width: 0;
  }

  .main :deep(.panel-head-inline-tools > .panel-tools) {
    grid-column: 2;
    grid-row: 1;
    justify-content: flex-end;
    width: auto;
  }

  .main :deep(.panel-head-inline-tools > .panel-count) {
    grid-column: 3;
  }

  .main :deep(.panel-head-inline-tools .link-btn) {
    padding-right: 4px;
    padding-left: 4px;
    white-space: nowrap;
  }

  .main :deep(.panel-title) {
    white-space: normal;
  }

  .main :deep(.panel-tools) {
    width: 100%;
    justify-content: flex-start;
    gap: 8px;
  }

  .main :deep(.search-box) {
    flex: 1 1 100%;
  }

  .main :deep(.panel-count) {
    justify-self: end;
  }

  .main :deep(.panel-actions),
  .main :deep(.chips) {
    padding-right: 14px;
    padding-left: 14px;
  }

  .main :deep(.row) {
    gap: 8px;
    padding: 12px;
  }

  .main :deep(.row-main) {
    gap: 10px;
  }

  .main :deep(.row-title),
  .main :deep(.row-sub) {
    overflow-wrap: anywhere;
    white-space: normal;
  }

  .main :deep(.row-meta) {
    gap: 6px;
  }

  .main :deep(.rows) {
    max-height: min(58vh, 420px);
  }

  .main :deep(.stat-card) {
    gap: 8px;
    padding: 10px;
  }

  .main :deep(.stat-icon-wrap) {
    width: 30px;
    height: 30px;
    flex: 0 0 30px;
  }

  .main :deep(.stat-label) {
    font-size: 11.5px;
  }

  .dash-grid,
  .stack {
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .mobile-bar {
    gap: 10px;
    padding-right: 12px;
    padding-left: 12px;
  }

  .mobile-bar .mark {
    width: 36px;
    height: 36px;
  }

  .mobile-bar-title {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 14px;
  }

  .main {
    padding-top: 16px;
    padding-bottom: 40px;
  }

  .page-title {
    font-size: 21px;
    line-height: 1.45;
  }

  .page-sub {
    font-size: 12.5px;
  }

  .breadcrumb {
    flex-wrap: wrap;
  }

  .main :deep(.panel-head) {
    padding: 12px;
  }

  .main :deep(.panel-tools > *) {
    max-width: 100%;
  }

  .main :deep(.panel-actions),
  .main :deep(.chips) {
    padding-right: 12px;
    padding-left: 12px;
  }

  .main :deep(.btn-add) {
    justify-content: center;
    width: 100%;
    min-height: 44px;
  }

  .main :deep(.row) {
    padding: 11px 12px;
  }

  .main :deep(.row-meta) {
    flex-wrap: wrap;
  }

  .main :deep(.stats-grid) {
    gap: 8px;
  }

  .main :deep(.stat-card) {
    align-items: flex-start;
    min-height: 76px;
  }

  .main :deep(.stat-num) {
    font-size: 17px;
  }

  /* Log rows: keep the timestamp on the same line as the badge */
  .row-time {
    font-size: 12.5px;
  }
}

@media (max-width: 360px) {
  .main :deep(.stats-grid) {
    grid-template-columns: 1fr;
  }

  .topbar {
    gap: 6px;
  }

  .page-title {
    font-size: 19px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .icon-refresh.spinning :deep(svg),
  .icon-refresh:active:not(:disabled) :deep(svg),
  .sidebar,
  .link-btn,
  .nav-item,
  .nav-item :deep(svg),
  .lang-seg-btn,
  .refreshed-dot,
  .refreshed-dot.live {
    animation: none;
    transition: none;
  }

  /* Nav icon hover-nudge is disabled too, so it never translates under reduced motion */
  .nav-item:hover :deep(svg) {
    transform: none;
  }

  /* List rows: drop the hover fade + accent slide-in */
  .main :deep(.row),
  .main :deep(.row)::before {
    transition: none;
  }

  /* Live-sessions "online" dot: no breathing ring */
  .stack :deep(.pill-active i) {
    animation: none;
  }

  /* Stat cards: no lift on hover */
  .main :deep(.stat-card) {
    transition: none;
  }

  .main :deep(.stat-card:hover) {
    transform: none;
  }
}
</style>