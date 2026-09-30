<template>
    <nav class="navbar" :class="{ 'navbar-scrolled': scrolled }">
      <div class="nav-inner">
        <router-link to="/" class="brand" aria-label="Digital Menu home">
          <div class="brand-icon">
            <img
              src="https://res.cloudinary.com/daji2ml3y/image/upload/v1783262055/ChatGPT_Image_Jul_5_2026_09_32_32_PM_c6ziic.png"
              width="40" alt="">
          </div>
          <span class="brand-name">{{ i18n.t.app_name }}</span>
        </router-link>

        <div class="nav-links">
          <a href="#features" class="nav-link" :class="{ active: activeSection === 'features' }"
            @click="$emit('update:activeSection', 'features')">{{ i18n.t.features }}</a>
          <a href="#how-it-works" class="nav-link" :class="{ active: activeSection === 'how-it-works' }"
            @click="$emit('update:activeSection', 'how-it-works')">{{ i18n.t.how_it_works }}</a>
          <a href="#demo-menu" class="nav-link" :class="{ active: activeSection === 'demo-menu' }"
            @click="$emit('update:activeSection', 'demo-menu')">{{ i18n.t.menu }}</a>
        </div>

        <div class="nav-links">
          <button class="lang-btn" type="button" @click="i18n.toggleLocale"
            :title="i18n.locale === 'km' ? 'Switch to English' : 'ប្តូរទៅភាសាខ្មែរ'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path
                d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span>{{ i18n.locale === "km" ? "EN" : "ខ្មែរ" }}</span>
          </button>
          <router-link to="/login" class="login-btn">{{ i18n.t.login }}</router-link>
          <router-link to="/register" class="primary-btn">{{ i18n.t.get_started }}</router-link>
        </div>

        <div class="nav-actions">
          <button class="lang-btn btn-show" type="button" @click="i18n.toggleLocale"
            :title="i18n.locale === 'km' ? 'Switch to English' : 'ប្តូរទៅភាសាខ្មែរ'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path
                d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span>{{ i18n.locale === "km" ? "EN" : "ខ្មែរ" }}</span>
          </button>
          <router-link to="/register" class="primary-btn btn-show-register ">{{ i18n.t.get_started }}</router-link>
          <button class="mobile-menu-btn" @click="$emit('update:mobileOpen', !mobileOpen)" aria-label="Toggle menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      <Transition name="mobile-slide">
        <div v-if="mobileOpen" class="mobile-nav">
          <a href="#features" class="mobile-link" :class="{ active: activeSection === 'features' }"
            @click="$emit('update:activeSection', 'features'); $emit('update:mobileOpen', false)">{{ i18n.t.features }}</a>
          <a href="#how-it-works" class="mobile-link" :class="{ active: activeSection === 'how-it-works' }"
            @click="$emit('update:activeSection', 'how-it-works'); $emit('update:mobileOpen', false)">{{ i18n.t.how_it_works }}</a>
          <a href="#demo-menu" class="mobile-link" :class="{ active: activeSection === 'demo-menu' }"
            @click="$emit('update:activeSection', 'demo-menu'); $emit('update:mobileOpen', false)">{{ i18n.t.menu }}</a>
          <router-link to="/login" class="mobile-btn" @click="$emit('update:mobileOpen', false)">{{ i18n.t.login }}</router-link>
          <router-link to="/register" class="mobile-btn mobile-btn-solid btn-show-register-reverse"
            @click="$emit('update:mobileOpen', false)">{{ i18n.t.get_started }}</router-link>
        </div>
      </Transition>
    </nav>
</template>

<script setup>
import { useI18nStore } from "@/stores/i18n";

const i18n = useI18nStore();

// State lives in the parent (scroll-spy + resize handler) and syncs back
// through update:* events — markup is unchanged from the original view.
defineProps({
  scrolled: { type: Boolean, default: false },
  activeSection: { type: String, default: "" },
  mobileOpen: { type: Boolean, default: false },
});
defineEmits(["update:activeSection", "update:mobileOpen"]);
</script>
<style scoped>
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
  letter-spacing: 0;
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

/* scroll-spy: the link of the section currently in view */
.nav-link.active {
  background: rgba(34, 197, 94, 0.12);
  color: #15803d;
  font-weight: 700;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
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

  .nav-link,
  .lang-btn,
  .login-btn,
  .primary-btn {
    display: none;
  }

  .btn-show,
  .btn-show-register {
    display: flex;
  }

  .mobile-menu-btn {
    display: flex;
  }

  .btn-show-register-reverse {
    display: none;
  }
}

@media (min-width: 820px) {
  .nav-actions {
    display: none;
  }
}

@media (max-width: 400px) {
  .btn-show-register {
    display: none;
  }

  .btn-show-register-reverse {
    display: block;
  }
}

/* Mobile nav */
.mobile-slide-enter-active,
.mobile-slide-leave-active {
  transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-slide-enter-from,
.mobile-slide-leave-to {
  opacity: 0;
  max-height: 0;
  overflow: hidden;
}

.mobile-slide-enter-to,
.mobile-slide-leave-from {
  max-height: 340px;
  opacity: 1;
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 24px 16px;
  background: rgba(255, 255, 255, 0.55);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid #e5e7eb;
  border-top: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 0 0 12px 12px;
}

.mobile-link,
.mobile-btn {
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  color: #374151;
  transition: background 0.15s;
}

.mobile-link:hover,
.mobile-btn:hover {
  background: #f0fdf4;
}

.mobile-link.active {
  background: #f0fdf4;
  color: #15803d;
  font-weight: 700;
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

</style>
