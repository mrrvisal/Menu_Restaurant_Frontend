<template>
  <div class="landing">
    <!-- NAVBAR -->
    <nav class="navbar" :class="{ 'navbar-scrolled': scrolled }">
      <div class="nav-inner">
        <router-link to="/" class="brand" aria-label="Digital Menu home">
          <div class="brand-icon">
            <img src="https://res.cloudinary.com/daji2ml3y/image/upload/v1783262055/ChatGPT_Image_Jul_5_2026_09_32_32_PM_c6ziic.png" width="40" alt="">
          </div>
          <span class="brand-name">{{ i18n.t.app_name }}</span>
        </router-link>

        <div class="nav-links">
          <a href="#features" class="nav-link">{{ i18n.t.features }}</a>
          <a href="#how-it-works" class="nav-link">{{ i18n.t.how_it_works }}</a>
          <a href="#demo-menu" class="nav-link">{{ i18n.t.menu }}</a>
          <button class="lang-btn" type="button" @click="i18n.toggleLocale" :title="i18n.locale === 'km' ? 'Switch to English' : 'ប្តូរទៅភាសាខ្មែរ'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <span>{{ i18n.locale === "km" ? "EN" : "ខ្មែរ" }}</span>
          </button>
          <router-link to="/login" class="login-btn">{{ i18n.t.login }}</router-link>
          <router-link to="/register" class="primary-btn">{{ i18n.t.get_started }}</router-link>
        </div>

        <button class="mobile-menu-btn" @click="mobileOpen = !mobileOpen" aria-label="Toggle menu">
          <span></span><span></span><span></span>
        </button>
      </div>

      <!-- Mobile menu -->
      <Transition name="mobile-slide">
        <div v-if="mobileOpen" class="mobile-nav">
          <a href="#features" class="mobile-link" @click="mobileOpen = false">{{ i18n.t.features }}</a>
          <a href="#how-it-works" class="mobile-link" @click="mobileOpen = false">{{ i18n.t.how_it_works }}</a>
          <a href="#demo-menu" class="mobile-link" @click="mobileOpen = false">{{ i18n.t.menu }}</a>
          <button class="mobile-lang" @click="i18n.toggleLocale">
            {{ i18n.locale === "km" ? "English" : "ភាសាខ្មែរ" }}
          </button>
          <router-link to="/login" class="mobile-btn" @click="mobileOpen = false">{{ i18n.t.login }}</router-link>
          <router-link to="/register" class="mobile-btn mobile-btn-solid" @click="mobileOpen = false">{{ i18n.t.get_started }}</router-link>
        </div>
      </Transition>
    </nav>

    <main>
      <!-- HERO -->
      <section class="hero">
        <div class="hero-bg-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
          <div class="shape shape-4"></div>
        </div>
        <div class="hero-inner">
          <div class="hero-content">
            <div class="hero-badge">{{ i18n.t.owner_badge }}</div>
            <h1 class="hero-title">{{ i18n.t.hero_title }}</h1>
            <p class="hero-subtitle">{{ i18n.t.hero_subtitle }}</p>
            <div class="hero-actions">
              <router-link to="/register" class="hero-primary">
                {{ i18n.t.get_started_free }}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </router-link>
              <a href="#demo-menu" class="hero-secondary">{{ i18n.t.learn_more }}</a>
            </div>
            <div class="hero-stats">
              <div class="hero-stat" v-for="stat in stats" :key="stat.value">
                <span class="hero-stat-value">{{ stat.value }}</span>
                <span class="hero-stat-label">{{ i18n.t[stat.label] }}</span>
              </div>
            </div>
          </div>
          <aside class="hero-visual">
            <div class="hero-card">
              <div class="hero-card-header">
                <div class="hero-card-dots">
                  <span></span><span></span><span></span>
                </div>
                <span class="hero-card-live">● Live</span>
              </div>
              <div class="hero-card-body">
                <div class="hero-order-restaurant">
                  <div class="hero-order-avatar">{{ logoInitials }}</div>
                  <div>
                    <strong>Digital Menu</strong>
                    <span>Table QR checkout</span>
                  </div>
                </div>
                <div class="hero-order-items">
                  <div v-for="food in sampleFoods.slice(0, 3)" :key="food.id" class="hero-order-item">
                    <div class="hero-order-img" :style="{ backgroundImage: `url(${food.img})` }"></div>
                    <span class="hero-order-name">{{ food.name }}</span>
                    <span class="hero-order-price">{{ Number(food.price).toLocaleString() }}៛</span>
                  </div>
                </div>
                <div class="hero-order-total">
                  <span>Total</span>
                  <strong>60,000៛</strong>
                </div>
              </div>
            </div>
            <div class="hero-floating hero-floating-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <div class="hero-floating hero-floating-2">✦</div>
            <div class="hero-floating hero-floating-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/></svg>
            </div>
          </aside>
        </div>
      </section>

      <!-- OWNER PROBLEMS -->
      <section class="problems-section">
        <div class="problems-inner">
          <div class="problems-copy">
            <span class="section-tag">{{ i18n.t.owner_badge }}</span>
            <h2 class="section-title">{{ i18n.t.owner_problem_title }}</h2>
            <p class="section-text">{{ i18n.t.owner_problem_desc }}</p>
          </div>
          <div class="problems-grid">
            <article v-for="benefit in ownerBenefits" :key="benefit.title" class="problem-card">
              <div class="problem-card-num">{{ benefit.value }}</div>
              <h3>{{ i18n.t[benefit.title] }}</h3>
              <p>{{ i18n.t[benefit.desc] }}</p>
            </article>
          </div>
        </div>
      </section>

      <!-- FEATURES -->
      <section id="features" class="features-section">
        <div class="section-header">
          <span class="section-tag">{{ i18n.t.features }}</span>
          <h2 class="section-title">{{ i18n.t.why_choose_us }}</h2>
          <p class="section-text centered">{{ i18n.t.why_choose_us_desc }}</p>
        </div>
        <div class="features-grid">
          <article v-for="feature in features" :key="feature.key" class="feature-card" :style="{ '--delay': `${features.indexOf(feature) * 0.06}s` }">
            <div class="feature-icon" v-html="feature.icon"></div>
            <h3>{{ i18n.t[feature.key + "_title"] }}</h3>
            <p>{{ i18n.t[feature.key + "_desc"] }}</p>
          </article>
        </div>
      </section>

      <!-- DEMO PREVIEW -->
      <section id="demo-menu" class="demo-section">
        <div class="demo-inner">
          <div class="demo-copy">
            <span class="section-tag">{{ i18n.t.sample_menu_title }}</span>
            <h2 class="section-title">{{ i18n.t.sample_menu_title }}</h2>
            <p class="section-text">{{ i18n.t.sample_menu_desc }}</p>
            <div class="demo-tags">
              <span><AppIcon name="qr" :size="14" /> Live table QR</span>
              <span><AppIcon name="activity" :size="14" /> Fast checkout</span>
              <span><AppIcon name="phone" :size="14" /> Photo menu</span>
            </div>
          </div>
          <div class="phone-mockup">
            <div class="phone-notch"></div>
            <div class="phone-header">
              <div class="phone-restaurant">
                <div class="phone-restaurant-avatar">{{ logoInitials }}</div>
                <div>
                  <strong>ម្លប់ព្រឹក ដាលីន</strong>
                  <span>Mlob Pring Dalin Restaurant</span>
                </div>
              </div>
            </div>
            <div class="phone-categories">
              <button class="phone-cat active">Hot dishes</button>
              <button class="phone-cat">Drinks</button>
              <button class="phone-cat">Dessert</button>
            </div>
            <div class="phone-foods">
              <div v-for="food in sampleFoods" :key="food.id" class="phone-food-item">
                <div class="phone-food-img" :style="{ backgroundImage: `url(${food.img})` }"></div>
                <div class="phone-food-info">
                  <strong>{{ food.name }}</strong>
                  <span>{{ food.name_en }}</span>
                  <span class="phone-food-price">{{ Number(food.price).toLocaleString() }}៛</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- HOW IT WORKS -->
      <section id="how-it-works" class="steps-section">
        <div class="section-header">
          <span class="section-tag">{{ i18n.t.how_it_works }}</span>
          <h2 class="section-title">{{ i18n.t.how_it_works }}</h2>
          <p class="section-text centered">{{ i18n.t.how_it_works_desc }}</p>
        </div>
        <div class="steps-timeline">
          <div v-for="(step, index) in steps" :key="step.title" class="step-card" :style="{ '--i': index }">
            <div class="step-number">{{ String(index + 1).padStart(2, "0") }}</div>
            <div class="step-connector" v-if="index < steps.length - 1"></div>
            <h3>{{ i18n.t[step.title] }}</h3>
            <p>{{ i18n.t[step.desc] }}</p>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="cta-section">
        <div class="cta-bg-shapes">
          <div class="cta-shape cta-shape-1"></div>
          <div class="cta-shape cta-shape-2"></div>
        </div>
        <div class="cta-inner">
          <div class="cta-icon-wrapper">
            <svg viewBox="0 0 32 32" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 4C9 4 5 9 5 14c0 6 5 8 11 12 6-4 11-6 11-12 0-5-4-10-11-10Z"/>
              <circle cx="16" cy="13" r="3"/>
            </svg>
          </div>
          <h2>{{ i18n.t.cta_title }}</h2>
          <p>{{ i18n.t.cta_subtitle }}</p>
          <router-link to="/register" class="cta-btn">
            {{ i18n.t.get_started_free }}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </router-link>
        </div>
      </section>
    </main>

    <!-- FOOTER -->
    <footer class="footer">
      <div class="footer-bg-overlay"></div>
      <div class="footer-inner">
        <div class="footer-brand">
          <div class="footer-logo-wrapper">
            <img src="https://res.cloudinary.com/daji2ml3y/image/upload/v1783262055/ChatGPT_Image_Jul_5_2026_09_32_32_PM_c6ziic.png" width="32" height="32" alt="" style="border-radius: 8px; object-fit: cover;" />
          </div>
          <div class="footer-brand-text">
            <strong>{{ i18n.t.app_name }}</strong>
            <p>{{ i18n.t.footer_desc }}</p>
          </div>
        </div>
        <div class="footer-links">
          <div class="footer-col">
            <h4>{{ i18n.t.product || 'Product' }}</h4>
            <a href="#features">{{ i18n.t.features }}</a>
            <a href="#how-it-works">{{ i18n.t.how_it_works }}</a>
            <a href="#demo-menu">{{ i18n.t.menu }}</a>
          </div>
          <div class="footer-col">
            <h4>{{ i18n.t.support || 'Support' }}</h4>
            <router-link to="/register">{{ i18n.t.register }}</router-link>
          </div>
        </div>
      </div>
      <div class="footer-divider"></div>
      <div class="footer-bottom">
        <p>&copy; {{ new Date().getFullYear() }} {{ i18n.t.app_name }}. {{ i18n.t.all_rights_reserved }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useI18nStore } from "@/stores/i18n";

const i18n = useI18nStore();
const mobileOpen = ref(false);
const scrolled = ref(false);

const logoInitials = "DM";

const stats = [
  { value: "0៛", label: "owner_no_printing" },
  { value: "1 min", label: "owner_fast_update" },
  { value: "QR", label: "owner_less_mistake" },
];

const ownerBenefits = [
  { value: "01", title: "owner_reprint_title", desc: "owner_reprint_desc" },
  { value: "02", title: "owner_order_title", desc: "owner_order_desc" },
  { value: "03", title: "owner_telegram_title", desc: "owner_telegram_desc" },
  { value: "04", title: "owner_guest_title", desc: "owner_guest_desc" },
];

const features = [
  { key: "digital_menu", icon: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><path d='M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm2 4h6M9 11h6M9 15h4'/></svg>" },
  { key: "qr_code", icon: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><path d='M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm11 1h2v2h-2v-2Zm3 3h2v2h-2v-2Zm-4 0h2v2h-2v-2Z'/></svg>" },
  { key: "telegram", icon: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><path d='m21 4-4.5 16-5.2-5.1L7 19l1.2-6L3 10.8 21 4Z'/></svg>" },
  { key: "bilingual", icon: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><path d='M4 5h9M9 3v2m1 0c-.5 4-2.4 7-6 9m3.2-5.2c1 1.9 2.7 3.6 5 5.2M14 21l1.2-3h4.6L21 21m-4-7-1.8 4h4.6L18 14Z'/></svg>" },
  { key: "multi_restaurant", icon: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><path d='M4 10h16l-1-5H5l-1 5Zm1 0v10h14V10M8 20v-6h4v6m4 0v-6h2'/></svg>" },
  { key: "analytics", icon: "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'><path d='M4 19V5m0 14h17M8 16v-5m5 5V8m5 8v-7'/></svg>" },
];

const steps = [
  { title: "register_acc_title", desc: "register_acc_desc" },
  { title: "setup_menu_title", desc: "setup_menu_desc" },
  { title: "qr_code_title", desc: "qr_code_desc" },
  { title: "receive_orders_title", desc: "receive_orders_desc" },
];

const sampleFoods = [
  {
    id: 1,
    name: "ស្ងោរជ្រក់មាន់",
    price: 30000,
    img: "https://res.cloudinary.com/daji2ml3y/image/upload/v1783249185/560052334_1491890335269845_8989493767183977872_n_v6osxh.jpg",
  },
  {
    id: 2,
    name: "ត្ត្រីបំពង",
    price: 20000,
    img: "https://res.cloudinary.com/daji2ml3y/image/upload/v1783249185/560100192_1294493769028479_7023791370470250097_n_q8rlo8.jpg",
  },
  {
    id: 3,
    name: "កង្កែបបោក",
    price: 10000,
    img: "https://res.cloudinary.com/daji2ml3y/image/upload/v1783249185/maxresdefault_7_dn2dax.jpg",
  },
  {
    id: 4,
    name: "ភ្លៅមាន់បំពង",
    price: 5000,
    img: "https://res.cloudinary.com/daji2ml3y/image/upload/v1783249572/DSC_0039_pnh4pf.jpg",
  },
  {
    id: 5,
    name: "ត្រីងៀតបំពង",
    price: 4000,
    img: "https://res.cloudinary.com/daji2ml3y/image/upload/v1783249572/79600669_1434979050004558_994592641955921920_n_nbkm2a.jpg",
  },
  {
    id: 6,
    name: "បុកអំបិល",
    price: 3000,
    img: "https://res.cloudinary.com/daji2ml3y/image/upload/v1783249571/images_1_khv5yn.jpg",
  },
];

let scrollHandler = null;
onMounted(() => {
  scrollHandler = () => {
    scrolled.value = window.scrollY > 40;
  };
  window.addEventListener("scroll", scrollHandler, { passive: true });
});

onUnmounted(() => {
  if (scrollHandler) window.removeEventListener("scroll", scrollHandler);
});
</script>

<style scoped>
/* ============================================================
   BASE
   ============================================================ */
.landing {
  min-height: 100vh;
  background: #f8fbf9;
  color: #1a2e1e;
  font-family: "Kantumruy Pro", "Hanuman", "Noto Sans Khmer", system-ui, sans-serif;
}
.landing :where(a, button) {
  transition: transform 0.2s ease, box-shadow 0.2s ease, color 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}
.landing :where(a, button):focus-visible {
  outline: 3px solid rgba(34, 197, 94, 0.35);
  outline-offset: 3px;
}
[id] {
  scroll-margin-top: 80px;
}

/* ============================================================
   NAVBAR
   ============================================================ */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 14px 0;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.navbar-scrolled {
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(16px) saturate(180%);
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06), 0 4px 20px rgba(0, 0, 0, 0.04);
  padding: 8px 0;
}
.nav-inner {
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #166534;
}
.brand-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.brand-name {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 8px;
}
.nav-link {
  color: #4a6650;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  padding: 7px 14px;
  border-radius: 8px;
  transition: background 0.2s;
}
.nav-link:hover {
  background: rgba(34, 197, 94, 0.08);
  color: #166534;
}
.lang-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  background: transparent;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 700;
  color: #4a6650;
  cursor: pointer;
  transition: all 0.2s;
}
.lang-btn:hover {
  border-color: #22c55e;
  color: #166534;
  background: rgba(34, 197, 94, 0.06);
}
.login-btn {
  color: #166534;
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 8px;
  transition: background 0.2s;
}
.login-btn:hover {
  background: rgba(34, 197, 94, 0.08);
}
.primary-btn {
  background: #166534;
  color: #fff;
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
  padding: 9px 20px;
  border-radius: 10px;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(22, 101, 52, 0.2);
}
.primary-btn:hover {
  background: #15803d;
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(22, 101, 52, 0.3);
}
.mobile-menu-btn {
  display: none;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
}
.mobile-menu-btn span {
  width: 22px;
  height: 2.5px;
  background: #166534;
  border-radius: 2px;
  transition: 0.2s;
}

@media (max-width: 820px) {
  .nav-link, .lang-btn, .login-btn, .primary-btn {
    display: none;
  }
  .mobile-menu-btn {
    display: flex;
  }
}

/* Mobile nav */
.mobile-slide-enter-active, .mobile-slide-leave-active {
  transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}
.mobile-slide-enter-from, .mobile-slide-leave-to {
  opacity: 0;
  max-height: 0;
  overflow: hidden;
}
.mobile-slide-enter-to, .mobile-slide-leave-from {
  max-height: 340px;
  opacity: 1;
}
.mobile-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 24px 20px;
  background: rgba(255,255,255,0.96);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #e5e7eb;
}
.mobile-link, .mobile-btn {
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  color: #374151;
  transition: background 0.15s;
}
.mobile-link:hover, .mobile-btn:hover {
  background: #f0fdf4;
}
.mobile-lang {
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  color: #374151;
  transition: background 0.15s;
}
.mobile-lang:hover {
  background: #f0fdf4;
}
.mobile-btn-solid {
  background: #166534;
  color: #fff !important;
  text-align: center;
  margin-top: 4px;
}
.mobile-btn-solid:hover {
  background: #15803d;
}

/* ============================================================
   HERO
   ============================================================ */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: 100px 24px 60px;
  background: linear-gradient(160deg, #f0fdf4 0%, #dcfce7 30%, #f0fdf4 60%, #e8f5e9 100%);
}
.hero-bg-shapes {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}
.shape {
  position: absolute;
  border-radius: 50%;
}
.shape-1 {
  width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(34,197,94,0.08), transparent 70%);
  top: -120px; right: -80px;
  animation: floatSlow 8s ease-in-out infinite;
}
.shape-2 {
  width: 350px; height: 350px;
  background: radial-gradient(circle, rgba(22,101,52,0.06), transparent 70%);
  bottom: 10%; left: -100px;
  animation: floatSlow 10s ease-in-out infinite reverse;
}
.shape-3 {
  width: 200px; height: 200px;
  background: radial-gradient(circle, rgba(34,197,94,0.05), transparent 70%);
  top: 40%; right: 20%;
  animation: floatSlow 7s ease-in-out infinite 2s;
}
.shape-4 {
  width: 120px; height: 120px;
  background: radial-gradient(circle, rgba(251,146,60,0.06), transparent 70%);
  bottom: 20%; right: 35%;
  animation: floatSlow 9s ease-in-out infinite 1s;
}
@keyframes floatSlow {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(1.05); }
}

.hero-inner {
  position: relative;
  z-index: 2;
  width: min(1180px, 100%);
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr minmax(360px, 460px);
  gap: 50px;
  align-items: center;
}

.hero-content {
  min-width: 0;
}

.hero-badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 20px;
  background: rgba(34,197,94,0.1);
  color: #15803d;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
  margin-bottom: 20px;
}
.hero-title {
  margin: 0;
  font-size: clamp(32px, 6.5vw, 68px);
  font-weight: 900;
  line-height: 1.08;
  letter-spacing: -0.02em;
  color: #14532d;
}
.hero-subtitle {
  max-width: 560px;
  margin: 18px 0 0;
  color: #4a6650;
  font-size: clamp(14px, 1.8vw, 18px);
  line-height: 1.7;
}
.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 30px;
}
.hero-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: 12px;
  background: linear-gradient(135deg, #166534, #22c55e);
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  text-decoration: none;
  box-shadow: 0 4px 16px rgba(22,101,52,0.3);
  transition: all 0.25s;
}
.hero-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(22,101,52,0.35);
}
.hero-secondary {
  display: inline-flex;
  align-items: center;
  padding: 14px 28px;
  border-radius: 12px;
  border: 1.5px solid #d1d5db;
  background: rgba(255,255,255,0.7);
  color: #374151;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.25s;
}
.hero-secondary:hover {
  border-color: #22c55e;
  background: #fff;
  color: #166534;
}

.hero-stats {
  display: flex;
  gap: 12px;
  margin-top: 40px;
}
.hero-stat {
  padding: 16px 20px;
  border-radius: 14px;
  background: rgba(255,255,255,0.65);
  border: 1px solid rgba(0,0,0,0.04);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}
.hero-stat-value {
  display: block;
  font-size: 24px;
  font-weight: 900;
  color: #166534;
}
.hero-stat-label {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  font-weight: 600;
  color: #6b806e;
}

/* Hero visual card */
.hero-visual {
  position: relative;
}
.hero-card {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04);
  border: 1px solid rgba(0,0,0,0.04);
  overflow: hidden;
  transform: translateZ(0);
}
.hero-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid #f3f4f6;
}
.hero-card-dots {
  display: flex;
  gap: 6px;
}
.hero-card-dots span {
  width: 10px; height: 10px;
  border-radius: 50%;
}
.hero-card-dots span:nth-child(1) { background: #ef4444; }
.hero-card-dots span:nth-child(2) { background: #eab308; }
.hero-card-dots span:nth-child(3) { background: #22c55e; }
.hero-card-live {
  font-size: 11px;
  font-weight: 700;
  color: #22c55e;
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.hero-card-body {
  padding: 18px;
}
.hero-order-restaurant {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px 14px;
  border-radius: 12px;
  background: #f0fdf4;
}
.hero-order-avatar {
  width: 44px; height: 44px;
  border-radius: 10px;
  background: linear-gradient(135deg, #166534, #22c55e);
  color: #fff;
  font-weight: 800;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.hero-order-restaurant strong {
  display: block;
  font-size: 14px;
  color: #14532d;
}
.hero-order-restaurant span {
  font-size: 11px;
  color: #6b7280;
}
.hero-order-items {
  display: grid;
  gap: 8px;
  margin-top: 14px;
}
.hero-order-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #f9fafb;
  transition: background 0.15s;
}
.hero-order-item:hover {
  background: #f0fdf4;
}
.hero-order-img {
  width: 44px; height: 36px;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
}
.hero-order-name {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  font-weight: 700;
  color: #374151;
}
.hero-order-price {
  font-size: 12px;
  font-weight: 800;
  color: #166534;
  white-space: nowrap;
}
.hero-order-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #f3f4f6;
  font-size: 13px;
  color: #6b7280;
  font-weight: 600;
}
.hero-order-total strong {
  font-size: 18px;
  color: #166534;
}

/* Floating icons */
.hero-floating {
  position: absolute;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #22c55e;
  animation: floatElement 4s ease-in-out infinite;
}
.hero-floating-1 {
  top: -16px; right: -12px;
  animation-delay: 0s;
}
.hero-floating-2 {
  bottom: 30px; left: -20px;
  animation-delay: 1.5s;
  font-size: 18px;
}
.hero-floating-3 {
  bottom: -10px; right: 30px;
  animation-delay: 3s;
  width: 38px; height: 38px;
}
@keyframes floatElement {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@media (max-width: 920px) {
  .hero-inner {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  .hero-visual {
    max-width: 500px;
    margin: 0 auto;
  }
}
@media (max-width: 640px) {
  .hero {
    padding: 90px 16px 50px;
  }
  .hero-stats {
    flex-wrap: wrap;
  }
  .hero-stat {
    flex: 1;
    min-width: calc(50% - 6px);
    padding: 14px;
  }
  .hero-stat-value {
    font-size: 20px;
  }
}

/* ============================================================
   PROBLEMS SECTION
   ============================================================ */
.problems-section {
  padding: 60px 24px;
}
.problems-inner {
  width: min(1180px, 100%);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(280px, 0.75fr) 1fr;
  gap: 30px;
  align-items: start;
}
.problems-copy {
  position: sticky;
  top: 100px;
}
.section-tag {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 20px;
  background: rgba(34,197,94,0.1);
  color: #15803d;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  margin-bottom: 14px;
}
.section-title {
  margin: 0 0 14px;
  font-size: clamp(22px, 3vw, 34px);
  font-weight: 900;
  line-height: 1.15;
  color: #14532d;
}
.section-text {
  color: #4a6650;
  font-size: 14px;
  line-height: 1.7;
}
.section-text.centered {
  max-width: 640px;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
}
.problems-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}
.problem-card {
  padding: 24px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid rgba(0,0,0,0.04);
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  transition: all 0.25s;
}
.problem-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.05);
  border-color: rgba(34,197,94,0.2);
}
.problem-card-num {
  width: 36px; height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #f0fdf4;
  color: #166534;
  font-size: 12px;
  font-weight: 900;
  margin-bottom: 16px;
}
.problem-card h3 {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 800;
  color: #14532d;
}
.problem-card p {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: #6b7280;
}
@media (max-width: 820px) {
  .problems-inner {
    grid-template-columns: 1fr;
  }
  .problems-copy {
    position: static;
  }
  .problems-grid {
    grid-template-columns: 1fr;
  }
}

/* ============================================================
   FEATURES SECTION
   ============================================================ */
.features-section {
  padding: 80px 24px;
}
.section-header {
  text-align: center;
  margin-bottom: 48px;
}
.features-grid {
  width: min(1180px, 100%);
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}
.feature-card {
  padding: 28px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid rgba(0,0,0,0.04);
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.06);
  border-color: rgba(34,197,94,0.15);
}
.feature-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #f0fdf4;
  color: #22c55e;
  margin-bottom: 18px;
}
.feature-icon :deep(svg) {
  width: 24px;
  height: 24px;
}
.feature-card h3 {
  margin: 0 0 8px;
  font-size: 17px;
  font-weight: 800;
  color: #14532d;
}
.feature-card p {
  margin: 0;
  font-size: 13px;
  line-height: 1.65;
  color: #6b7280;
}

/* ============================================================
   DEMO SECTION
   ============================================================ */
.demo-section {
  padding: 80px 24px;
  background: #f0fdf4;
}
.demo-inner {
  width: min(1180px, 100%);
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 50px;
  align-items: center;
}
.demo-copy {
  max-width: 480px;
}
.demo-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
}
.demo-tags span {
  padding: 8px 14px;
  border-radius: 20px;
  background: #fff;
  border: 1px solid rgba(0,0,0,0.04);
  font-size: 12px;
  font-weight: 700;
  color: #374151;
  box-shadow: 0 2px 6px rgba(0,0,0,0.02);
}

/* Phone mockup */
.phone-mockup {
  max-width: 560px;
  margin-left: auto;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 20px 60px rgba(0,0,0,0.08);
  border: 1px solid rgba(0,0,0,0.04);
  overflow: hidden;
  position: relative;
}
.phone-notch {
  height: 24px;
  background: #14532d;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.phone-notch::after {
  content: '';
  width: 100px;
  height: 6px;
  border-radius: 999px;
  background: rgba(255,255,255,0.15);
}
.phone-header {
  padding: 16px;
  background: linear-gradient(135deg, #14532d, #166534);
}
.phone-restaurant {
  display: flex;
  gap: 12px;
  align-items: center;
}
.phone-restaurant-avatar {
  width: 44px; height: 44px;
  border-radius: 10px;
  background: #f0fdf4;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 14px;
  color: #166534;
}
.phone-restaurant strong {
  display: block;
  color: #fff;
  font-size: 14px;
}
.phone-restaurant span {
  display: block;
  color: rgba(255,255,255,0.7);
  font-size: 11px;
  margin-top: 2px;
}
.phone-categories {
  display: flex;
  gap: 6px;
  padding: 14px 16px;
  border-bottom: 1px solid #f3f4f6;
  overflow-x: auto;
}
.phone-cat {
  padding: 7px 14px;
  border-radius: 20px;
  border: none;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}
.phone-cat.active {
  background: #166534;
  color: #fff;
}
.phone-foods {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 12px;
}
.phone-food-item {
  display: flex;
  gap: 8px;
  padding: 10px;
  border-radius: 12px;
  background: #f9fafb;
  transition: background 0.15s;
}
.phone-food-item:hover {
  background: #f0fdf4;
}
.phone-food-img {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
}
.phone-food-info {
  min-width: 0;
}
.phone-food-info strong {
  display: block;
  font-size: 12px;
  color: #14532d;
  line-height: 1.3;
}
.phone-food-info > span {
  display: block;
  font-size: 10px;
  color: #9ca3af;
  margin-top: 1px;
}
.phone-food-price {
  display: block;
  font-size: 12px;
  font-weight: 800;
  color: #166534;
  margin-top: 4px;
}

@media (max-width: 860px) {
  .demo-inner {
    grid-template-columns: 1fr;
  }
  .demo-copy {
    max-width: none;
  }
  .phone-mockup {
    margin: 0;
    max-width: none;
  }
}
@media (max-width: 480px) {
  .phone-foods {
    grid-template-columns: 1fr;
  }
}

/* ============================================================
   STEPS / HOW IT WORKS
   ============================================================ */
.steps-section {
  padding: 80px 24px;
}
.steps-timeline {
  width: min(1180px, 100%);
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.step-card {
  position: relative;
  padding: 28px;
  border-radius: 16px;
  background: linear-gradient(135deg, #14532d, #166534);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.step-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(22,101,52,0.25);
}
.step-number {
  font-size: 28px;
  font-weight: 900;
  color: rgba(255,255,255,0.15);
  margin-bottom: 20px;
  line-height: 1;
}
.step-card h3 {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 800;
  color: #fff;
}
.step-card p {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: rgba(255,255,255,0.7);
}
.step-connector {
  position: absolute;
  top: 40px;
  right: -12px;
  width: 12px;
  height: 2px;
  background: rgba(34,197,94,0.3);
}
@media (max-width: 820px) {
  .steps-timeline {
    grid-template-columns: repeat(2, 1fr);
  }
  .step-connector { display: none; }
}
@media (max-width: 500px) {
  .steps-timeline { grid-template-columns: 1fr; }
}

/* ============================================================
   CTA SECTION
   ============================================================ */
.cta-section {
  position: relative;
  padding: 100px 24px;
  background: linear-gradient(160deg, #f0fdf4 0%, #dcfce7 30%, #f0fdf4 60%, #e8f5e9 100%);
  text-align: center;
  overflow: hidden;
}
.cta-bg-shapes {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.cta-shape {
  position: absolute;
  border-radius: 50%;
}
.cta-shape-1 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(255,255,255,0.03), transparent 70%);
  top: -100px; right: -80px;
}
.cta-shape-2 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(255,255,255,0.03), transparent 70%);
  bottom: -80px; left: -60px;
}
.cta-inner {
  position: relative;
  z-index: 2;
  max-width: 640px;
  margin: 0 auto;
}
.cta-icon-wrapper {
  width: 72px;
  height: 72px;
  margin: 0 auto 20px;
  border-radius: 18px;
  background: rgba(34,197,94,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #14532d;
}
.cta-inner h2 {
  margin: 0 0 14px;
  font-size: clamp(24px, 4vw, 38px);
  font-weight: 900;
  line-height: 1.15;
  color: #14532d;
}
.cta-inner p {
  color: #4a6650;
  font-size: 15px;
  line-height: 1.7;
  margin-bottom: 30px;
}
.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 15px 34px;
  border-radius: 12px;
  background: #fff;
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  text-decoration: none;
  transition: all 0.25s;
  background: linear-gradient(135deg, #166534, #22c55e);
}
.cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

/* ============================================================
   FOOTER
   ============================================================ */
.footer {
  position: relative;
  padding: 50px 24px 24px;
  background: linear-gradient(135deg, #0f766e 0%, #22c55e 50%, #16a34a 100%);
  overflow: hidden;
}
.footer-bg-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.06) 0%, transparent 60%);
  pointer-events: none;
}
.footer-inner {
  position: relative;
  z-index: 2;
  width: min(1180px, 100%);
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  gap: 40px;
  flex-wrap: wrap;
}
.footer-brand {
  max-width: 320px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
}
.footer-brand-text {
  flex: 1;
}
.footer-logo-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.15);
}
.footer-brand strong {
  display: block;
  font-size: 16px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 4px;
}
.footer-brand p {
  margin: 0;
  font-size: 13px;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.6);
}
.footer-links {
  display: flex;
  gap: 48px;
}
.footer-col h4 {
  margin: 0 0 14px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(255, 255, 255, 0.5);
}
.footer-col a {
  display: block;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 13px;
  margin-bottom: 8px;
  transition: color 0.15s;
}
.footer-col a:hover {
  color: #fff;
}
.footer-divider {
  position: relative;
  z-index: 2;
  width: min(1180px, 100%);
  margin: 36px auto 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}
.footer-bottom {
  position: relative;
  z-index: 2;
  width: min(1180px, 100%);
  margin: 16px auto 0;
  text-align: center;
}
.footer-bottom p {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
}
@media (max-width: 640px) {
  .footer-inner {
    flex-direction: column;
  }
  .footer-links {
    gap: 32px;
  }
}
</style>