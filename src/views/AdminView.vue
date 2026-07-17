<!-- ═══════════════════════════════════════════════════════════
   AdminView — v3.3 Fully Responsive
   Fix: Complete responsive redesign
   ═══════════════════════════════════════════════════════════ -->
<template>
  <div class="root" :class="{ 'nav-open': showMobile }">

    <!-- ─── MOBILE BAR ─── -->
    <header class="mob">
      <div class="mob-info">
        <div class="mob-av"><img :src="restaurantLogo" alt="" /></div>
        <span class="mob-label">{{ auth.restaurant?.name || 'ភោជនីយដ្ឋាន' }}</span>
      </div>
      <button class="mob-btn" @click="showMobile = !showMobile" aria-label="Menu" :aria-expanded="showMobile" aria-controls="admin-sidebar">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
    </header>

    <!-- ─── SIDEBAR ─── -->
    <aside class="side" id="admin-sidebar">
      <div class="side-top">
        <div class="side-brand">
          <div class="side-icon"><img :src="restaurantLogo" alt="" /></div>
          <div class="side-meta">
            <span class="side-name">{{ auth.restaurant?.name || 'ភោជនីយដ្ឋាន' }}</span>
          </div>
        </div>
      </div>

      <nav class="side-nav">
        <button class="nav-i" :class="{ active: adminTab === 'foods' }" @click="adminTab = 'foods'; showMobile = false">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 11h18M3 11v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8M3 11V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"/></svg>
          <span>{{ i18n.t.foods }}</span>
        </button>
        <button class="nav-i" :class="{ active: adminTab === 'categories' }" @click="adminTab = 'categories'; showMobile = false">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v11z"/></svg>
          <span>{{ i18n.t.categories }}</span>
        </button>
        <button class="nav-i" :class="{ active: adminTab === 'orders' }" @click="adminTab = 'orders'; fetchOrders(); showMobile = false">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
          <span>{{ i18n.t.orders }}</span>
          <span v-if="orders.length" class="nav-badge">{{ orders.length }}</span>
        </button>
      </nav>

      <div class="side-foot">
        <button class="lang" @click="i18n.toggleLocale">{{ i18n.locale === 'km' ? 'EN' : 'ខ្មែរ' }}</button>
        <button class="logout" @click="loggingOut = true">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
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
          <h1 class="hdr-title">{{ adminTab === 'foods' ? i18n.t.foods : adminTab === 'categories' ? i18n.t.categories : i18n.t.orders }}</h1>
        </div>
        <div class="hdr-r">
          <button class="ac ac-ghost ac-icon-only" @click="openQR" :title="i18n.t.generate_qr">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            <span class="hdr-hide">{{ i18n.t.generate_qr }}</span>
          </button>
          <button class="ac ac-ghost ac-icon-only" @click="openTelegramSettings()" :title="i18n.t.telegram">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m21 4-4.5 16-5.2-5.1L7 19l1.2-6L3 10.8 21 4Z"/></svg>
            <span v-if="!isLinked" class="hdr-dot"></span>
            <span class="hdr-hide">{{ i18n.t.telegram }}</span>
          </button>
          <button class="ac ac-primary" @click="openPreview">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            <span class="hdr-hide">{{ i18n.t.owner_preview }}</span>
          </button>
          <button class="ac ac-primary ac-avatar" @click="openProfile" :title="i18n.t.profile">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </button>
        </div>
      </div>

      <!-- Metrics -->
      <div class="metrics">
        <div class="metric metric-teal">
          <div class="metric-icon mi-teal"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg></div>
          <div class="metric-b">
            <span class="metric-v">{{ Number(stats.totalRevenue || 0).toLocaleString() }}៛</span>
            <span class="metric-l">{{ i18n.t.revenue }}</span>
          </div>
          <div class="metric-glow"></div>
        </div>
        <div class="metric metric-green">
          <div class="metric-icon mi-green"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg></div>
          <div class="metric-b">
            <span class="metric-v">{{ stats.totalOrders || 0 }}</span>
            <span class="metric-l">{{ i18n.t.orders }}</span>
          </div>
          <div class="metric-glow"></div>
        </div>
        <div class="metric metric-amber">
          <div class="metric-icon mi-amber"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
          <div class="metric-b">
            <span class="metric-v">{{ foods.foods.length }}</span>
            <span class="metric-l">{{ i18n.t.foods }}</span>
          </div>
          <div class="metric-glow"></div>
        </div>
      </div>

      <!-- ──────── FOODS ──────── -->
      <template v-if="adminTab === 'foods'">
        <div class="bar">
          <div class="bar-scroll">
            <button v-for="cat in foods.categories" :key="cat.id" class="chip" :class="{ active: curCat === cat.id }" @click="curCat = cat.id; load()">{{ cat.label_km }}</button>
          </div>
          <div class="bar-acts">
            <div class="srch">
              <svg class="srch-i" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input v-model="searchQ" :placeholder="i18n.t.search" @input="load()" />
              <button v-if="searchQ" class="srch-x" aria-label="Clear search" @click="searchQ = ''; load()">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <button class="ac ac-primary" @click="openAdd">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              <span class="btn-text">{{ i18n.t.add_food }}</span>
            </button>
          </div>
        </div>

        <div v-if="foods.loading" class="empty"><div class="spinner"></div><p>{{ i18n.t.loading }}</p></div>
        <div v-else-if="!foods.foods.length" class="empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity=".3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <p>{{ searchQ ? 'រកមិនឃើញ' : i18n.t.no_data }}</p>
          <button v-if="!searchQ" class="ac ac-primary" @click="openAdd">{{ i18n.t.add_food }}</button>
        </div>
        <div v-else class="grid">
          <FoodCard v-for="food in foods.foods" :key="food.id" :food="food" is-admin
            @delete="confirmDel($event)" @toggle-status="foods.toggleStatus($event)"
            @detail="editingFood = $event; showForm = true" />
        </div>
      </template>

      <!-- ──────── CATEGORIES ──────── -->
      <template v-if="adminTab === 'categories'">
        <div class="bar"><div class="bar-acts"><button class="ac ac-primary" @click="openCatForm()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> {{ i18n.t.add_category }}</button></div></div>
        <div v-if="!foods.categories.length" class="empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity=".3"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v11z"/></svg>
          <p>{{ i18n.t.no_data }}</p>
        </div>
        <div v-else class="cat-grid">
          <div v-for="cat in foods.categories" :key="cat.id" class="cat-c">
            <span class="cat-n">{{ cat.label_km }}</span>
            <div class="cat-acts">
              <button class="ic ic-sm" aria-label="Edit category" @click="openCatForm(cat)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="ic ic-sm ic-red" aria-label="Delete category" @click="confirmDelCat(cat)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- ──────── ORDERS ──────── -->
      <template v-if="adminTab === 'orders'">
        <div class="bar">
          <div class="bar-acts">
            <span class="bar-count">{{ orders.length }} {{ i18n.t.orders }}</span>
            <button class="ac ac-ghost" :disabled="ordersLoading" @click="fetchOrders">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {{ ordersLoading ? i18n.t.loading : i18n.t.refresh || 'Refresh' }}
            </button>
          </div>
        </div>
        <div v-if="ordersLoading" class="empty"><div class="spinner"></div><p>{{ i18n.t.loading }}</p></div>
        <div v-else-if="!orders.length" class="empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity=".3"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
          <p>{{ i18n.t.no_data }}</p>
        </div>
        <div v-else class="order-grid">
          <div v-for="order in orders" :key="order.id" class="order-c">
            <div class="order-h">
              <div class="order-hl">
                <span class="order-id">#{{ order.id }}</span>
                <span class="order-t"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="9"/></svg> {{ i18n.t.table }} {{ order.table_no }}</span>
              </div>
              <div class="order-m">
                <span class="order-time">{{ formatDate(order.created_at) }}</span>
              </div>
            </div>
            <div class="order-items">
              <div v-for="(item, idx) in parseItems(order.items)" :key="idx" class="order-i">
                <span>{{ item.name }}</span>
                <span class="order-p">{{ item.qty }} × {{ Number(item.price).toLocaleString() }}៛</span>
              </div>
            </div>
            <div v-if="order.note" class="order-n"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> {{ order.note }}</div>
            <div class="order-total">{{ i18n.t.total }}: <strong>{{ Number(order.total).toLocaleString() }}៛</strong></div>
          </div>
        </div>
      </template>
    </main>

    <!-- ═══════ MODALS ═══════ -->

    <FoodFormModal :show="showForm" :edit-food="editingFood" :categories="foods.categories"
      @close="showForm = false; editingFood = null" @saved="load()" />

    <!-- Delete Food -->
    <Teleport to="body"><Transition name="fade">
      <div v-if="deletingFood" class="overlay" @click.self="deletingFood = null">
        <div class="dlg"><div class="dlg-i"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></div>
          <div class="dlg-t">លុបម្ហូបនេះ?</div>
          <div class="dlg-d">{{ deletingFood.name }}</div>
          <div class="dlg-acts"><button class="btn btn-g" @click="deletingFood = null">{{ i18n.t.cancel }}</button><button class="btn btn-r" @click="doDelete">{{ i18n.t.delete }}</button></div>
        </div>
      </div>
    </Transition></Teleport>

    <!-- Delete Category -->
    <Teleport to="body"><Transition name="fade">
      <div v-if="deletingCat" class="overlay" @click.self="deletingCat = null">
        <div class="dlg"><div class="dlg-i"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></div>
          <div class="dlg-t">លុបប្រភេទនេះ?</div>
          <div class="dlg-d">{{ deletingCat.label_km }}</div>
          <div class="dlg-acts"><button class="btn btn-g" @click="deletingCat = null">{{ i18n.t.cancel }}</button><button class="btn btn-r" @click="doDeleteCat">{{ i18n.t.delete }}</button></div>
        </div>
      </div>
    </Transition></Teleport>

    <!-- Logout -->
    <Teleport to="body"><Transition name="fade">
      <div v-if="loggingOut" class="overlay" @click.self="loggingOut = false">
        <div class="dlg"><div class="dlg-i dlg-i-r"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
          <div class="dlg-t">{{ i18n.t.logout }}</div>
          <div class="dlg-d">{{ i18n.t.confirm_logout }}</div>
          <div class="dlg-acts"><button class="btn btn-g" @click="loggingOut = false">{{ i18n.t.cancel }}</button><button class="btn btn-r" @click="confirmLogout">{{ i18n.t.logout }}</button></div>
        </div>
      </div>
    </Transition></Teleport>

    <!-- QR -->
    <Teleport to="body"><Transition name="fade">
      <div v-if="showQR" class="overlay" @click.self="showQR = false">
        <div class="sheet">
          <div class="sheet-h"><span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> {{ i18n.t.generate_qr }}</span><button class="ic" aria-label="Close" @click="showQR = false"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
          <div class="sheet-b">
            <div class="qr-r"><input v-model="qrTableNumber" type="number" min="1" :placeholder="i18n.t.table_no" class="qr-inp" @keyup.enter="generateQR" /><button class="btn btn-primary" :disabled="qrLoading" @click="generateQR">{{ qrLoading ? '' : i18n.t.generate || 'Generate' }}</button></div>
            <div v-if="qrError" class="msg msg-e"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> {{ qrError }}</div>
            <div v-if="qrCodeDataUrl" class="qr-p"><img :src="qrCodeDataUrl" :alt="'QR ' + qrTableNumber" /><span class="qr-l">{{ i18n.t.table }} {{ qrTableNumber }}</span><a :href="qrDownloadUrl" download class="btn btn-primary">{{ i18n.t.download_qr || 'Download' }}</a></div>
          </div>
        </div>
      </div>
    </Transition></Teleport>

    <!-- Telegram -->
    <Teleport to="body"><Transition name="fade">
      <div v-if="showTelegramSettings" class="overlay" @click.self="showTelegramSettings = false">
        <div class="sheet">
          <div class="sheet-h"><span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m21 4-4.5 16-5.2-5.1L7 19l1.2-6L3 10.8 21 4Z"/></svg> {{ i18n.t.telegram_settings }}</span><button class="ic" aria-label="Close" @click="showTelegramSettings = false"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
          <div class="sheet-b">
            <div v-if="tgSuccess" class="msg msg-s">{{ tgSuccess }}</div>
            <div v-if="tgError" class="msg msg-e">{{ tgError }}</div>
            <div class="tg-c"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> {{ i18n.t.connect_telegram }}<br/></div>
            <div class="tg-code"><span class="tg-lbl">{{ i18n.t.link_code || 'Link Code' }}</span>
              <div class="tg-box" @click="copyLinkCode"><code class="tg-val">{{ displayLinkCode }}</code><button class="ic" aria-label="Copy link code"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg></button></div>
              <div v-if="copied" class="msg msg-s">{{ i18n.t.copied }}</div></div>
            <details class="tg-guide" :open="!isLinked"><summary>{{ i18n.t.how_it_works || 'How to connect' }}</summary>
              <div class="tg-steps"><div class="tg-step"><span class="step-n">1</span> {{ i18n.t.tg_step_open }}</div>
                <div class="tg-step"><span class="step-n">2</span> {{ i18n.t.tg_step_search_bot }} <strong>@digital_menu_khmer_bot</strong></div>
                <div class="tg-step"><span class="step-n">3</span> {{ i18n.t.tg_step_press_start }} <code>/start</code></div>
                <div class="tg-step"><span class="step-n">4</span> {{ i18n.t.tg_step_send_link }} <code>/link {{ displayLinkCode }}</code></div>
                <div class="tg-step"><span class="step-n">5</span> {{ i18n.t.tg_step_done }}</div></div>
            </details>
            <div v-if="isLinked" class="tg-linked"><span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> {{ i18n.t.connected }}</span><button class="btn btn-g" @click="unlinkTelegram">{{ i18n.t.unlink || 'Unlink' }}</button></div>
            <div v-else class="tg-warn">{{ i18n.t.not_connected_yet }}</div>
          </div>
        </div>
      </div>
    </Transition></Teleport>

    <!-- Category Form -->
    <Teleport to="body"><Transition name="fade">
      <div v-if="showCatForm" class="overlay" @click.self="showCatForm = false">
        <div class="sheet">
          <div class="sheet-h"><span>{{ editingCat ? 'កែប្រែប្រភេទ' : 'បន្ថែមប្រភេទ' }}</span><button class="ic" aria-label="Close" @click="showCatForm = false"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
          <div class="sheet-b">
            <div v-if="catSuccess" class="msg msg-s">{{ catSuccess }}</div>
            <div class="fld"><label class="fld-l">{{ i18n.t.add_category || 'Category Name' }} *</label>
              <input v-model="catLabelKm" class="fld-i" :class="{ err: catErrors }" :placeholder="i18n.t.category" @input="catErrors = ''" />
              <div v-if="catErrors" class="fld-e">{{ catErrors }}</div></div>
            <button class="btn btn-primary btn-b" :disabled="catSubmitting" @click="submitCategory">{{ catSubmitting ? i18n.t.loading : editingCat ? i18n.t.save : i18n.t.add }}</button>
          </div>
        </div>
      </div>
    </Transition></Teleport>

    <!-- Profile -->
    <Teleport to="body"><Transition name="fade">
      <div v-if="showProfile" class="overlay" @click.self="showProfile = false">
        <div class="sheet">
          <div class="sheet-h"><span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> {{ i18n.t.profile || 'Profile' }}</span><button class="ic" aria-label="Close" @click="showProfile = false"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
          <div class="sheet-b">
            <div v-if="profileSuccess" class="msg msg-s">{{ profileSuccess }}</div>
            <div v-if="profileError" class="msg msg-e">{{ profileError }}</div>
            <div class="prof-l"><div class="prof-p"><img :src="profileLogoPreview || restaurantLogo" alt="" /></div>
              <label class="prof-up"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> {{ i18n.t.change_logo || 'Change' }}
                <input type="file" accept="image/*" hidden @change="onLogoChange" /></label></div>
            <div class="fld"><label class="fld-l">{{ i18n.t.restaurant_name }} *</label>
              <input v-model="profileName" class="fld-i" :placeholder="i18n.t.restaurant_name" /></div>
            <button class="btn btn-primary btn-b" :disabled="profileSubmitting" @click="submitProfile">{{ profileSubmitting ? i18n.t.loading : i18n.t.save }}</button>
          </div>
        </div>
      </div>
    </Transition></Teleport>

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
const showMobile = ref(false);
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
const statsStartDate = ref(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
const statsEndDate = ref(new Date().toISOString().slice(0, 10));
const previewLinkCopied = ref(false);
const previewMenuUrl = computed(() => { if (!auth.restaurantId) return "#"; return `${window?.location?.origin || ""}/menu?restaurant_id=${auth.restaurantId}`; });
const restaurantLogo = computed(() => auth.restaurant?.logoUrl || "https://res.cloudinary.com/daji2ml3y/image/upload/v1783262055/ChatGPT_Image_Jul_5_2026_09_32_32_PM_c6ziic.png");

const orders = ref([]);
const ordersLoading = ref(false);
const qrTableNumber = ref("");
const qrCodeDataUrl = ref("");
const qrLoading = ref(false);
const qrError = ref("");
const qrDownloadUrl = computed(() => { if (!qrTableNumber.value) return "#"; let url = `${API_BASE}/api/qr/table/${qrTableNumber.value}?format=png`; if (auth.restaurantId) url += `&restaurant_id=${auth.restaurantId}`; return url; });

function openProfile() { profileName.value = auth.restaurant?.name || ""; profileLogoFile.value = null; profileLogoPreview.value = null; profileSuccess.value = ""; profileError.value = ""; showProfile.value = true; }
function onLogoChange(e) { const file = e.target.files[0]; if (!file) return; profileLogoFile.value = file; const reader = new FileReader(); reader.onload = (ev) => { profileLogoPreview.value = ev.target.result; }; reader.readAsDataURL(file); }
async function submitProfile() { if (!profileName.value.trim()) { profileError.value = "សូមបញ្ចូលឈ្មោះហាង"; return; } profileSubmitting.value = true; profileSuccess.value = ""; profileError.value = ""; try { const formData = new FormData(); formData.append("name", profileName.value.trim()); if (profileLogoFile.value) formData.append("logo", profileLogoFile.value); const res = await axios.patch(`${API_BASE}/api/auth/restaurant`, formData, { headers: { "Content-Type": "multipart/form-data" } }); if (res.data.restaurant) { auth.restaurant.name = res.data.restaurant.name; auth.restaurant.logoUrl = res.data.restaurant.logoUrl; auth.saveToStorage(); } profileSuccess.value = "រក្សាទុកបានជោគជ័យ!"; setTimeout(() => { showProfile.value = false; }, 1200); } catch (err) { profileError.value = err.response?.data?.error || "មានបញ្ហា សូមព្យាយាមម្ដងទៀត"; } finally { profileSubmitting.value = false; } }

async function openTelegramSettings() { showTelegramSettings.value = true; tgLoading.value = true; tgSuccess.value = ""; tgError.value = ""; try { const res = await axios.get(`${API_BASE}/api/auth/me`); if (res.data.restaurant) { auth.restaurant = res.data.restaurant; auth.saveToStorage(); } } catch (err) { console.error(err); } finally { tgLoading.value = false; } }
async function copyLinkCode() { try { await navigator.clipboard.writeText(auth.linkCode || ""); copied.value = true; setTimeout(() => { copied.value = false; }, 2000); } catch { const el = document.createElement("textarea"); el.value = auth.linkCode || ""; document.body.appendChild(el); el.select(); document.execCommand("copy"); document.body.removeChild(el); copied.value = true; setTimeout(() => { copied.value = false; }, 2000); } }
async function unlinkTelegram() { if (!confirm("តើចង់លែងភ្ជាប់ Telegram មែនទេ?")) return; try { await axios.patch(`${API_BASE}/api/auth/unlink-telegram`); if (auth.restaurant) { auth.restaurant.telegramChatId = null; auth.saveToStorage(); } tgSuccess.value = "លែងភ្ជាប់ Telegram រួចរាល់!"; setTimeout(() => { tgSuccess.value = ""; }, 2000); } catch (err) { tgError.value = err.response?.data?.error || "មានបញ្ហា សូមព្យាយាមម្ដងទៀត"; } }

async function fetchOrders() { ordersLoading.value = true; try { const res = await axios.get(`${API_BASE}/api/orders`); orders.value = res.data; } catch (err) { console.error(err); } finally { ordersLoading.value = false; } }
function parseItems(items) { try { return typeof items === "string" ? JSON.parse(items) : items; } catch { return []; } }
function statusLabel(status) { const labels = { pending: "Pending", confirmed: "Confirmed", preparing: "Preparing", ready: "Ready", served: "Served", cancelled: "Cancelled" }; return labels[status] || status; }
function formatDate(dateStr) { const d = new Date(dateStr); return d.toLocaleString("km-KH", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); }
async function updateOrderStatus(orderId, status) { try { await axios.patch(`${API_BASE}/api/orders/${orderId}/status`, { status }); const idx = orders.value.findIndex((o) => o.id === orderId); if (idx !== -1) orders.value[idx].status = status; } catch (err) { alert("មិនអាចប្តូរស្ថានភាពកម្មង់បានទេ"); } }

function openCatForm(cat = null) { editingCat.value = cat; catSuccess.value = ""; catErrors.value = ""; catLabelKm.value = cat ? cat.label_km : ""; showCatForm.value = true; }
async function submitCategory() { catSuccess.value = ""; catErrors.value = ""; if (!catLabelKm.value.trim()) { catErrors.value = "សូមបញ្ចូលឈ្មោះប្រភេទ"; return; } catSubmitting.value = true; try { const data = { label_km: catLabelKm.value.trim() }; if (editingCat.value) { await foods.updateCategory(editingCat.value.id, data); catSuccess.value = "កែប្រែប្រភេទបានជោគជ័យ!"; setTimeout(() => { showCatForm.value = false; editingCat.value = null; catSuccess.value = ""; }, 1200); } else { await foods.addCategory(data); catSuccess.value = "បន្ថែមប្រភេទបានជោគជ័យ!"; catLabelKm.value = ""; setTimeout(() => { catSuccess.value = ""; }, 1500); } } catch (err) { catErrors.value = err.response?.data?.error || "មានបញ្ហា សូមព្យាយាមម្ដងទៀត"; } finally { catSubmitting.value = false; } }
function confirmDelCat(cat) { deletingCat.value = cat; }
async function doDeleteCat() { if (!deletingCat.value) return; try { await foods.deleteCategory(deletingCat.value.id); } catch (err) { alert(err.response?.data?.error || "លុបមិនបានជោគជ័យ"); } deletingCat.value = null; }

function openQR() { qrError.value = ""; qrCodeDataUrl.value = ""; qrTableNumber.value = ""; showQR.value = true; }
async function generateQR() { const num = parseInt(qrTableNumber.value); if (!num || num < 1) { qrError.value = "សូមបញ្ចូលលេខតុឲ្យបានត្រឹមត្រូវ"; return; } qrLoading.value = true; qrError.value = ""; try { let url = `${API_BASE}/api/qr/table/${num}`; if (auth.restaurantId) url += `?restaurant_id=${auth.restaurantId}`; const res = await axios.get(url); qrCodeDataUrl.value = res.data.qrCode; } catch (e) { qrError.value = "បង្កើត QR បរាជ័យ: " + (e.response?.data?.error || e.message); } finally { qrLoading.value = false; } }

async function fetchStats() { if (!auth.restaurantId) return; statsLoading.value = true; statsError.value = ""; try { const res = await axios.get(`${API_BASE}/api/orders/stats`, { params: { start_date: statsStartDate.value, end_date: statsEndDate.value } }); stats.value = res.data; } catch (err) { statsError.value = err.response?.data?.error || "Failed to load stats"; } finally { statsLoading.value = false; } }
function copyPreviewLink() { if (!navigator.clipboard || previewMenuUrl.value === "#") return; navigator.clipboard.writeText(previewMenuUrl.value); previewLinkCopied.value = true; setTimeout(() => { previewLinkCopied.value = false; }, 2000); }
function openPreview() { if (previewMenuUrl.value === "#") return; window.open(previewMenuUrl.value, "_blank"); }
async function load() { const params = {}; if (curCat.value) params.category = curCat.value; if (searchQ.value) params.search = searchQ.value; await foods.fetchFoods(params); }
function openAdd() { editingFood.value = null; showForm.value = true; }
function confirmDel(food) { deletingFood.value = food; }
async function doDelete() { if (!deletingFood.value) return; await foods.deleteFood(deletingFood.value.id); deletingFood.value = null; }
function confirmLogout() { auth.logout(); router.push("/login"); }
function handleEscKey(e) { if (e.key !== "Escape") return; if (showForm.value) { showForm.value = false; editingFood.value = null; } else if (deletingFood.value) deletingFood.value = null; else if (deletingCat.value) deletingCat.value = null; else if (showQR.value) showQR.value = false; else if (showTelegramSettings.value) showTelegramSettings.value = false; else if (loggingOut.value) loggingOut.value = false; else if (showCatForm.value) showCatForm.value = false; else if (showProfile.value) showProfile.value = false; }

onMounted(async () => { await foods.fetchCategories(); if (foods.categories.length) curCat.value = foods.categories[0].id; await load(); fetchStats(); window.addEventListener("keydown", handleEscKey); });
onUnmounted(() => { window.removeEventListener("keydown", handleEscKey); });
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
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
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
  background: linear-gradient(135deg, var(--surface-green) 0%, var(--surface) 100%);
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
  color: var(--primary);
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
  color: var(--primary);
  font-weight: 600;
  box-shadow: inset 3px 0 0 var(--primary);
}
.nav-i svg {
  flex-shrink: 0;
}
.nav-i.active svg {
  color: var(--primary);
}
.nav-badge {
  margin-left: auto;
  background: var(--primary);
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 8px;
  border-radius: 999px;
  flex-shrink: 0;
  animation: pulse-badge 2s ease-in-out infinite;
}
@keyframes pulse-badge {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
.side-foot {
  display: flex;
  gap: 8px;
  padding: 16px 14px 20px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}
.lang, .logout {
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
  border-color: var(--primary);
  background: #dcfce7;
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
.mob { display: none; }
.scrim { display: none; }

/* ─── MAIN ─── */
.main {
  padding: 28px 32px 60px;
  max-width: 1320px;
  width: 100%;
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
  color: var(--primary);
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
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
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
  border-color: var(--primary);
  background: var(--surface-green);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px var(--primary-glow);
}
.ac-primary {
  background: var(--primary);
  color: white;
  border: 1px solid var(--primary);
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
  content: '';
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
.metric-teal::before { background: var(--primary); }
.metric-green::before { background: var(--green); }
.metric-amber::before { background: var(--amber); }
.metric-glow {
  position: absolute;
  top: -50%;
  right: -20%;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  opacity: 0.05;
  pointer-events: none;
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
  background: #ccfbf1;
  color: var(--primary);
}
.mi-green {
  background: #dcfce7;
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
  border-color: var(--primary);
  color: var(--text);
  transform: translateY(-1px);
}
.chip.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
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
  border-color: var(--primary);
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
  border-color: var(--primary);
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
  border-color: var(--primary);
  background: var(--surface-green);
  color: var(--primary);
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
  border-color: var(--primary);
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
.order-hl{
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
  justify-content: flex-end;
}
.order-time {
  font-size: 10px;
  color: var(--muted-light);
}
.order-st {
  font-size: 9px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
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
  background: #dcfce7;
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
.order-sel {
  width: 100%;
  margin-top: 8px;
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 11px;
  font-family: inherit;
  background: var(--surface);
  outline: none;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 34px;
}
.order-sel:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-glow);
}
.order-sel:hover {
  border-color: var(--primary);
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
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  display: inline-block;
}
@keyframes spin {
  to { transform: rotate(360deg); }
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
  color: var(--primary);
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
  background: #dcfce7;
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
  color: white;
}
.btn-primary:hover {
  background: var(--primary-dark);
  box-shadow: 0 4px 16px var(--primary-glow-strong);
}
.btn-b {
  width: 100%;
  justify-content: center;
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
  border-color: var(--primary);
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
  border-color: var(--primary);
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
  background: #dcfce7;
  transform: translateY(-1px);
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
  border: 2px dashed var(--primary);
  border-radius: 8px;
  padding: 6px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.tg-box:hover {
  background: #dcfce7;
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
  color: var(--primary);
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
  color: white;
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
  color: var(--primary);
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

/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from, .fade-leave-to {
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
    border-color: var(--primary);
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