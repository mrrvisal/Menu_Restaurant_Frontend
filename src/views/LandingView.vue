<template>
  <div class="landing">
    <!-- 3D WebGL stage (fixed full-viewport background) -->
    <Hero3D />

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
          <router-link to="/demo" class="mobile-link demo-link-hot" @click="mobileOpen = false">{{ i18n.t.demo_menu }}</router-link>
          <router-link to="/blog" class="mobile-link" @click="mobileOpen = false">{{ i18n.t.blog }}</router-link>
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
              <a href="#demo-menu" class="hero-secondary" @click.prevent="router.push('/demo')">
                {{ i18n.t.try_demo }}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 18"/><line x1="6" y1="12" x2="18" y2="12"/></svg>
              </a>
            </div>
            <div class="hero-stats">
              <div class="hero-stat" v-for="stat in stats" :key="stat.value">
                <span class="hero-stat-value">{{ stat.value }}</span>
                <span class="hero-stat-label">{{ i18n.t[stat.label] }}</span>
              </div>
            </div>
          </div>
          <aside class="hero-visual">
            <div class="hero-card" v-tilt="{ max: 14, translate: 12 }">
              <div class="hero-card-header">
                <div class="hero-card-dots">
                  <span></span><span></span><span></span>
                </div>
                <span class="hero-card-live">● Live</span>
              </div>
              <div class="hero-card-body">
                <div class="hero-order-restaurant">
                  <div class="hero-order-avatar"><img src="https://res.cloudinary.com/daji2ml3y/image/upload/v1783262055/ChatGPT_Image_Jul_5_2026_09_32_32_PM_c6ziic.png" width="40" alt=""></div>
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
            <div class="hero-floating hero-floating-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z"/></svg>
            </div>
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
          <article v-for="feature in features" :key="feature.key" class="feature-card">
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
              <span>{{ i18n.t.live_table_qr }}</span>
              <span>{{ i18n.t.fast_checkout }}</span>
              <span>{{ i18n.t.photo_menu }}</span>
            </div>
            <div class="demo-cta-row">
              <router-link to="/demo" class="demo-cta-btn">
                {{ i18n.t.try_demo_menu }}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </router-link>
            </div>
          </div>
          <div class="phone-mockup" v-tilt="{ max: 10, translate: 10 }">
            <div class="phone-notch sel-light"></div>
            <div class="phone-header sel-light">
              <div class="phone-restaurant">
                <div class="phone-restaurant-avatar"><img data-v-6b7d1e37="" src="https://res.cloudinary.com/daji2ml3y/image/upload/v1777712294/ChatGPT_Image_May_2_2026_03_39_44_PM-Picsart-BackgroundRemover_1_x4yi9t.png" width="60" alt=""></div>
                <div>
                  <strong>ម្លប់ព្រឹកដាលីន</strong>
                  <span>Mlob Pring Dalin</span>
                </div>
              </div>
            </div>
            <div class="phone-categories">
              <button class="phone-cat active">{{ i18n.t.general_foods }}</button>
              <button class="phone-cat">{{ i18n.t.drinks }}</button>
              <button class="phone-cat">{{ i18n.t.dessert }}</button>
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
          <div v-for="(step, index) in steps" :key="step.title" class="step-card sel-light" :style="{ '--i': index }">
            <div class="step-number">{{ String(index + 1).padStart(2, "0") }}</div>
            <div class="step-connector" v-if="index < steps.length - 1"></div>
            <h3>{{ i18n.t[step.title] }}</h3>
            <p>{{ i18n.t[step.desc] }}</p>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="cta-section">
        <div class="cta-inner">
          <div class="cta-bg-shapes">
            <div class="cta-shape cta-shape-1"></div>
            <div class="cta-shape cta-shape-2"></div>
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
    <footer class="footer sel-light">
      <div class="footer-bottom">
        <p>&copy; {{ new Date().getFullYear() }} {{ i18n.t.app_name }}. {{ i18n.t.all_rights_reserved }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useI18nStore } from "@/stores/i18n";
import { demoBlogPosts } from "@/data/demo";
import Hero3D from "@/components/Hero3D.vue";
import AppIcon from "@/components/AppIcon.vue";
import { vTilt } from "@/composables/useTilt3D";

const i18n = useI18nStore();
const router = useRouter();
const mobileOpen = ref(false);
const scrolled = ref(false);

const blogPosts = demoBlogPosts;

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
    name: "ត្រីបំពង",
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
/* ------------------------------------------------------------
   PROGRESSIVE TOP FADE (instant, covers cards too)
   When content scrolls up and crosses a line FADE_LINE px from
   the top of the screen, the part above that line becomes opacity
   0 immediately — for text AND for the card/container elements
   (hero card, feature cards, phone mockup, step cards, images…).
   FADE_BAND = 0 gives a hard instant cut (no trailing fade).
   ------------------------------------------------------------ */
const FADE_LINE = 60; // px from top of screen where content disappears
const FADE_BAND = 0;  // 0 = instant hide. Increase (e.g. 40) for a softer fade

let screenHandler = null;
let scrollHandler = null;
let fadeRaf = null;
let fadeTargets = [];

// Everything that fades: all text AND the card/container elements themselves.
const FADE_SELECTOR =
  "h1, h2, h3, p, strong, a, button, span, img, li, " +
  ".hero-badge, .hero-title, .hero-subtitle, .hero-primary, .hero-secondary, .hero-stat, .hero-actions, " +
  ".hero-card, .hero-order-restaurant, .hero-order-items, .hero-order-item, .hero-order-img, .hero-order-total, .hero-floating, " +
  ".problem-card, .feature-card, .feature-icon, " +
  ".phone-mockup, .phone-header, .phone-restaurant, .phone-restaurant-avatar, .phone-categories, .phone-cat, " +
  ".phone-foods, .phone-food-item, .phone-food-img, .phone-food-info, " +
  ".demo-tags span, .demo-cta-btn, " +
  ".blog-preview-card, .blog-preview-img, .blog-preview-body, .blog-preview-tag, .blog-view-all-btn, " +
  ".step-card, .step-number, .step-connector, " +
  ".cta-inner, .cta-icon-wrapper, .cta-btn";

function collectFadeTargets() {
  const mainEl = document.querySelector(".landing main");
  fadeTargets = mainEl ? Array.from(mainEl.querySelectorAll(FADE_SELECTOR)) : [];
}

function clearMask(el) {
  el.style.maskImage = "";
  el.style.webkitMaskImage = "";
}

function applyFade() {
  for (let i = 0; i < fadeTargets.length; i++) {
    const el = fadeTargets[i];
    const top = el.getBoundingClientRect().top;
    const crossed = FADE_LINE - top; // px of this element already above the line

    if (crossed <= 0) {
      // Fully below the line — keep it 100% visible
      if (!el.style.maskImage) continue;
      clearMask(el);
      continue;
    }

    const start = Math.min(crossed, el.offsetHeight || 1);
    const end = start + FADE_BAND;
    const grad = `linear-gradient(to bottom, transparent 0, transparent ${start}px, #000 ${end}px, #000 100%)`;
    el.style.webkitMaskImage = grad;
    el.style.maskImage = grad;
  }
}

function requestFade() {
  if (fadeRaf) return;
  fadeRaf = requestAnimationFrame(() => {
    fadeRaf = null;
    applyFade();
  });
}

onMounted(() => {
  collectFadeTargets();
  applyFade();
  scrollHandler = () => {
    scrolled.value = window.scrollY > 40; // navbar background (unchanged)
    requestFade();
  };
  window.addEventListener("scroll", scrollHandler, { passive: true });
  screenHandler = () => {
    if (window.innerWidth > 820) mobileOpen.value = false;
    collectFadeTargets();
    applyFade();
  };
  window.addEventListener("resize", screenHandler, { passive: true });
});

onUnmounted(() => {
  if (fadeRaf) cancelAnimationFrame(fadeRaf);
  if (scrollHandler) window.removeEventListener("scroll", scrollHandler);
  if (screenHandler) window.removeEventListener("resize", screenHandler);
});
</script>

<style scoped>
/* ============================================================
   BASE
   ============================================================ */
.landing {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(180deg, rgba(248, 251, 249, 0.72) 0%, rgba(240, 253, 244, 0.6) 50%, rgba(248, 251, 249, 0.72) 100%);
  color: #1a2e1e;
  font-family: "Kantumruy Pro", "Hanuman", "Noto Sans Khmer", system-ui, sans-serif;
}

/* Keep DOM content above the fixed WebGL stage */
.landing main {
  position: relative;
  z-index: 1;
}
.problems-section,
.features-section,
.steps-section {
  background: linear-gradient(180deg, rgba(248, 251, 249, 0.8) 0%, rgba(240, 253, 244, 0.68) 100%);
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
  max-width: calc(100% - 48px);
  margin: auto;
  border-radius: clamp(0px, 2vw, 20px);
  background: rgba(255, 255, 255, 0.7);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  backdrop-filter: blur(16px) saturate(180%);
  padding: 10px 0;
  

  width: 95%;
  max-width: 1200px;
  margin: 12px auto;
}
.nav-inner {
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 12px;
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
      background: linear-gradient(135deg, #166534, #22c55e);
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
  background: rgba(255, 255, 255, 0.55);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid #e5e7eb;
  border-top: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 0 0 12px 12px;
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
  background: linear-gradient(160deg, rgba(240, 253, 244, 0.5) 0%, rgba(220, 252, 231, 0.42) 30%, rgba(240, 253, 244, 0.5) 60%, rgba(232, 245, 233, 0.55) 100%);
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
  display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #166534;
      background: transparent;
      padding: 0.4rem 0.95rem;
      border-radius: 100px;
      margin-bottom: 1.5rem;
      border: 1px solid rgba(34, 197, 94, 0.2);
      box-shadow: 0 0 10px rgba(34, 197, 94, 0.2);
}
.hero-badge::before {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #22c55e;
      box-shadow: 0 0 10px #22c55e, 0 0 20px #22c55e;
      animation: pulse 1.5s infinite;
    }
.hero-title {
  margin: 0;
  font-size: clamp(32px, 6.5vw, 68px);
  font-weight: 900;
  line-height: 1.15;
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
  gap:10px;
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
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08), 0 8px 24px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.04);
  overflow: hidden;
  position: relative;
  transform: perspective(1000px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translate3d(var(--tx, 0px), var(--ty, 0px), 0);
  transition: transform 0.5s cubic-bezier(0.2, 0.7, 0.2, 1), box-shadow 0.3s ease;
  will-change: transform;
}
.hero-card.is-tilt {
  transition: transform 90ms linear, box-shadow 0.3s ease;
}
/* cursor-tracking glare */
.hero-card::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 5;
  border-radius: inherit;
  background: radial-gradient(70% 60% at var(--mx, 50%) var(--my, 50%), rgba(255, 255, 255, 0.5), transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}
.hero-card.is-tilt::after {
  opacity: 1;
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
  transform: translate3d(calc(var(--tx, 0px) * -0.35), calc(var(--ty, 0px) * -0.35), 0);
  transition: transform 0.5s cubic-bezier(0.2, 0.7, 0.2, 1);
}
.hero-order-avatar {
  width: 44px; height: 44px;
  border-radius: 10px;
  /* background: linear-gradient(135deg, #166534, #22c55e); */
  color: #fff;
  border: 1px solid #22c55e;
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
  transform: translate3d(calc(var(--tx, 0px) * 0.3), calc(var(--ty, 0px) * 0.3), 0);
  transition: transform 0.5s cubic-bezier(0.2, 0.7, 0.2, 1);
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
.section-tag {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.72rem;
      font-weight: 600;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #15803d;
      background: transparent;
      padding: 0.4rem 0.95rem;
      border-radius: 100px;
      margin-bottom: 1.5rem;
      border: 1px solid rgba(34, 197, 94, 0.35);
      box-shadow: 0 0 10px rgba(34, 197, 94, 0.2);
    }
.section-tag::before {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #22c55e;
      box-shadow: 0 0 10px #22c55e, 0 0 20px #22c55e;
      animation: pulse 1.5s ease-in-out infinite;
    }
@keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.3); opacity: 0.5; }
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

/* ── problem card: green accent bar (short) + green outline on hover ── */
.problem-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 28px 28px 28px 44px;
  border-radius: 20px;
  background: #fff;
  border: 1.5px solid transparent; /* keeps size stable when the outline appears */
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  /* No transform and no hover-lift: every card keeps the exact same size and
     position, so the row never looks uneven. Grid stretch equalises heights. */
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
}

/* left accent bar — short strip next to the number by default */
.problem-card::before {
  content: "";
  position: absolute;
  left: 0;
  top: 24px;
  width: 4px;
  height: 52px;
  background: linear-gradient(180deg, #22c55e, #16a34a);
  border-radius: 0 3px 3px 0;
  transition:
    top 0.45s cubic-bezier(0.2, 0.7, 0.2, 1),
    height 0.45s cubic-bezier(0.2, 0.7, 0.2, 1),
    border-radius 0.45s cubic-bezier(0.2, 0.7, 0.2, 1);
}

/* hover: green outline around the card + bar stretches to full height */
.problem-card:hover {
  border-color: #22c55e;
  box-shadow: 0 10px 24px rgba(34, 197, 94, 0.13);
}
.problem-card:hover::before {
  top: 0;
  height: 100%;
  border-radius: 20px 0 0 20px; /* follows the card's rounded corners */
}

/* mono green number */
.problem-card-num {
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 15px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.08em;
  color: #22c55e;
  margin-bottom: 12px; /* number → title */
}
.problem-card h3 {
  margin: 0 0 8px; /* title → description */
  font-size: 19px;
  font-weight: 800;
  line-height: 1.25;
  color: #14532d;
}
.problem-card p {
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
  color: #4a6650;
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

/* ── feature card: ICON CIRCLE OVERLAP design ── */
.feature-card {
  position: relative;
  display: flex;
  flex-direction: column;
  margin-top: 38px; /* head-room so the badge can overlap above the card */
  padding: 58px 26px 28px;
  border-radius: 24px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  /* No transform and no hover-lift: all cards in the row stay identical. */
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
}
.feature-card:hover {
  box-shadow: 0 14px 32px rgba(34, 197, 94, 0.13);
  border-color: rgba(34, 197, 94, 0.25);
}

/* the overlapping badge — sticks out of the card's top-left corner */
.feature-icon {
  position: absolute;
  top: -34px;
  left: 26px;
  width: 68px;
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 22px; /* squircle, like the mock */
  background: linear-gradient(135deg, #34d399 0%, #16a34a 100%);
  color: #fff;
  border: 4px solid #fff; /* white ring that separates it from the card */
  box-shadow:
    0 5px 14px rgba(34, 197, 94, 0.35),
    0 2px 6px rgba(0, 0, 0, 0.06);
  z-index: 2;
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
}
.feature-card:hover .feature-icon {
  transform: translateY(-4px) scale(1.06);
}
.feature-icon :deep(svg) {
  width: 30px;
  height: 30px;
}
@media (max-width: 480px) {
  .feature-card {
    margin-top: 34px;
    padding: 54px 22px 26px;
  }
  .feature-icon {
    top: -30px;
    left: 22px;
    width: 60px;
    height: 60px;
    border-radius: 19px;
  }
}
.feature-card h3 {
  margin: 0 0 8px;
  font-size: 19px;
  font-weight: 800;
  line-height: 1.25;
  color: #14532d;
}
.feature-card p {
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
  color: #6b7280;
}

/* ============================================================
   DEMO SECTION
   ============================================================ */
.demo-section {
  padding: 80px 24px;
  background: rgba(240, 253, 244, 0.45);
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
  padding: 10px 16px;
  border-radius: 20px;
  background: #fff;
  border: 1px solid rgba(26, 193, 0, 0.4);
  font-size: 12px;
  font-weight: 700;
  color: #374151;
  box-shadow: 0 2px 6px rgba(0,0,0,0.02);
}

/* Phone mockup */
.phone-mockup {
  max-width: 580px;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.04);
  overflow: hidden;
  position: relative;
  transform: perspective(1100px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translate3d(var(--tx, 0px), var(--ty, 0px), 0);
  transition: transform 0.5s cubic-bezier(0.2, 0.7, 0.2, 1), box-shadow 0.3s ease;
  will-change: transform;
}
.phone-mockup.is-tilt {
  transition: transform 90ms linear, box-shadow 0.3s ease;
}
.phone-mockup::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 5;
  border-radius: inherit;
  background: radial-gradient(70% 60% at var(--mx, 50%) var(--my, 50%), rgba(255, 255, 255, 0.35), transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}
.phone-mockup.is-tilt::after {
  opacity: 1;
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
  background: linear-gradient(135deg, #166534, #22c55e);
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
  background: linear-gradient(135deg, #166534, #22c55e);
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

/* Demo nav highlight */
.nav-link-demo {
  color: #15803d;
  border: 1.5px solid rgba(34, 197, 94, 0.45);
  background: rgba(34, 197, 94, 0.06);
}
.mobile-link.demo-link-hot {
  color: #15803d;
}

/* Demo CTA */
.demo-cta-row {
  margin-top: 26px;
}
.demo-cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 26px;
  border-radius: 12px;
  background: linear-gradient(135deg, #166534, #22c55e);
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  text-decoration: none;
  box-shadow: 0 6px 18px rgba(22, 101, 52, 0.28);
  transition: transform 0.22s, box-shadow 0.22s;
}
.demo-cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 26px rgba(22, 101, 52, 0.34);
}

/* ============================================================
   BLOG PREVIEW SECTION
   ============================================================ */
.blog-section {
  padding: 80px 24px;
  background: rgba(240, 253, 244, 0.45);
}
.blog-preview-grid {
  width: min(1180px, 100%);
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.blog-preview-card {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
}
.blog-preview-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(20, 83, 45, 0.1);
  border-color: rgba(34, 197, 94, 0.2);
}
.blog-preview-img {
  height: 160px;
  background-size: cover;
  background-position: center;
  background-color: #f0fdf4;
}
.blog-preview-body {
  padding: 18px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}
.blog-preview-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.blog-preview-tag {
  font-size: 11px;
  font-weight: 800;
  color: #15803d;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  padding: 3px 10px;
  border-radius: 20px;
}
.blog-preview-read {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
  color: #8a9a8e;
}
.blog-preview-body h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 900;
  color: #14532d;
  line-height: 1.4;
}
.blog-preview-body p {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.65;
  color: #5b6f60;
  flex: 1;
}
.blog-preview-more {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12.5px;
  font-weight: 800;
  color: #166534;
  text-decoration: none;
}
.blog-preview-more:hover {
  text-decoration: underline;
}
.blog-view-all {
  width: min(1180px, 100%);
  margin: 26px auto 0;
  text-align: center;
}
.blog-view-all-btn {
  display: inline-block;
  padding: 12px 26px;
  border-radius: 12px;
  border: 1.5px solid #d1d5db;
  background: #fff;
  color: #166534;
  font-size: 13px;
  font-weight: 800;
  text-decoration: none;
  transition: all 0.22s;
}
.blog-view-all-btn:hover {
  border-color: #22c55e;
  background: #f0fdf4;
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
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 28px;
  perspective: 1200px; /* depth for the cards' translateZ children */
}

/* tokens — light theme to match the rest of the landing page */
.step-card {
  --card: #ffffff;
  --card-2: #f0fdf4;
  --line: rgba(0, 0, 0, 0.05);
  --accent: #22c55e;
  --accent-2: #86efac;
  --muted: #6b7280;

  position: relative;
  padding: 30px 26px 28px;
  border-radius: 18px;
  background: linear-gradient(160deg, var(--card) 0%, var(--card-2) 100%);
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  transform: perspective(900px); /* depth for the translateZ children only */
  transform-style: preserve-3d; /* required for the translateZ children */
  isolation: isolate;
  transition: border-color 0.35s ease, box-shadow 0.35s ease;
  animation: step-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(var(--i, 0) * 110ms);
}

/* gradient border that fades in on hover */
.step-card::before {
  content: "";
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.35s ease;
  pointer-events: none;
}
.step-card:hover::before {
  opacity: 1;
}
.step-card:hover {
  border-color: rgba(34, 197, 94, 0.2);
  box-shadow: 0 12px 32px rgba(20, 83, 45, 0.1);
}

/* number */
.step-number {
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: 44px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.04em;
  background: linear-gradient(135deg, #166534, var(--accent));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  opacity: 0.9;
  margin-bottom: 18px;
  transform: translateZ(38px);
  transition: transform 0.35s ease;
}
.step-card:hover .step-number {
  transform: translateZ(52px) scale(1.04);
}

/* dashed connector to the next card */
.step-connector {
  position: absolute;
  top: 44px;
  right: -28px; /* must match .steps-timeline gap */
  width: 28px;
  height: 2px;
  background: repeating-linear-gradient(90deg, rgba(34, 197, 94, 0.35) 0 6px, transparent 6px 12px);
}
.step-connector::after {
  content: "";
  position: absolute;
  right: -1px;
  top: 50%;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  transform: translateY(-50%);
  background: var(--accent);
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.2);
}

/* text */
.step-card h3 {
  margin: 0 0 10px;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #14532d;
  transform: translateZ(24px);
}
.step-card p {
  margin: 0;
  font-size: 13px;
  line-height: 1.65;
  color: var(--muted);
  transform: translateZ(14px);
}

@keyframes step-in {
  from {
    opacity: 0;
    transform: translateY(22px);
  }
  /* no transform in `to` so the card keeps its own perspective transform */
  to {
    opacity: 1;
  }
}

@media (max-width: 820px) {
  .steps-timeline {
    grid-template-columns: repeat(2, 1fr);
  }
  .step-connector {
    display: none;
  }
}

/* stacked layout — connector turns vertical */
@media (max-width: 640px) {
  .steps-timeline {
    grid-template-columns: 1fr;
    gap: 34px;
  }
  .step-connector {
    display: block;
    top: auto;
    bottom: -34px;
    right: auto;
    left: 40px;
    width: 2px;
    height: 34px;
    background: repeating-linear-gradient(180deg, rgba(34, 197, 94, 0.35) 0 6px, transparent 6px 12px);
  }
  .step-connector::after {
    right: auto;
    left: 50%;
    top: auto;
    bottom: -1px;
    transform: translateX(-50%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .step-card {
    animation: none;
  }
}

/* ============================================================
   CTA SECTION — white rounded card, mint corner circles,
   green arcs peeking from the section corners, pill button
   ============================================================ */
.cta-section {
  position: relative;
  padding: 90px 24px;
  text-align: center;
  overflow: hidden;
}

/* thin green arcs peeking from the section corners */
.cta-section::before,
.cta-section::after {
  content: "";
  position: absolute;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  border: 2.5px solid rgba(34, 197, 94, 0.4);
  pointer-events: none;
  z-index: 0;
}
.cta-section::before {
  top: -135px;
  right: -135px;
}
.cta-section::after {
  bottom: -135px;
  left: -135px;
}

/* the big white card */
.cta-inner {
  position: relative;
  z-index: 1;
  max-width: 1180px;
  margin: 0 auto;
  padding: 70px 32px;
  border-radius: 36px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.03);
  box-shadow:
    0 24px 60px rgba(20, 83, 45, 0.08),
    0 6px 18px rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

/* soft mint circles clipped inside the card corners */
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
  width: 380px;
  height: 380px;
  background: radial-gradient(circle at 35% 35%, #dcf8ea, #b6ebcc);
  top: -190px;
  right: -120px;
}
.cta-shape-2 {
  width: 320px;
  height: 320px;
  background: radial-gradient(circle at 60% 60%, #dcf8ea, #c0eed4);
  bottom: -170px;
  left: -110px;
}

.cta-inner h2 {
  position: relative;
  margin: 0 0 14px;
  font-size: clamp(24px, 4vw, 34px);
  font-weight: 900;
  line-height: 1.15;
  color: #14532d;
}
.cta-inner p {
  position: relative;
  color: #6b7280;
  font-size: 15px;
  line-height: 1.7;
  margin-bottom: 34px;
}
.cta-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 18px 44px;
  border-radius: 999px; /* pill, like the mock */
  background: #15803d;
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  text-decoration: none;
  box-shadow: 0 10px 26px rgba(21, 128, 61, 0.35);
  transition: transform 0.25s, box-shadow 0.25s, background 0.25s;
}
.cta-btn:hover {
  background: #166534;
  transform: translateY(-2px);
  box-shadow: 0 16px 34px rgba(21, 128, 61, 0.42);
}
.cta-btn svg {
  transition: transform 0.25s ease;
}
.cta-btn:hover svg {
  transform: translateX(3px);
}

@media (max-width: 640px) {
  .cta-section {
    padding: 50px 14px;
  }
  .cta-inner {
    padding: 64px 20px;
    border-radius: 26px;
  }
  .cta-shape-1 {
    width: 260px;
    height: 260px;
    top: -140px;
    right: -90px;
  }
  .cta-shape-2 {
    width: 220px;
    height: 220px;
    bottom: -120px;
    left: -80px;
  }
}

/* ============================================================
   FOOTER — rounded inset card, centered brand, socials
   ============================================================ */
.footer {
  position: relative;
  z-index: 1;
  margin: 0 12px 12px;
  padding: 20px 32px 20px;
  border-radius: 24px;
  background: linear-gradient(135deg, #166534 0%, #1f9a4a 55%, #22c55e 100%);
  overflow: hidden;
}
.footer-bottom {
  position: relative;
  z-index: 2;
  width: min(1180px, 100%);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}
.footer-bottom p {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
}
@media (max-width: 640px) {
  .footer {
    margin: 0 8px 8px;
    padding: 44px 20px 16px;
    border-radius: 20px;
  }
  .footer-name {
    font-size: 22px;
  }
  .footer-bottom {
    flex-direction: column;
    justify-content: center;
    text-align: center;
  }
  .footer-nav {
    justify-content: center;
    gap: 20px;
  }
}
@media (max-width: 920px) {
  .blog-preview-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 560px) {
  .blog-preview-grid {
    grid-template-columns: 1fr;
  }
}</style>