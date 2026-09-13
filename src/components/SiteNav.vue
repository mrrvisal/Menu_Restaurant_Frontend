<template>
  <header class="site-nav" :class="{ 'site-nav-scrolled': scrolled }">
    <div class="site-nav-inner">
      <router-link to="/" class="site-nav-brand" aria-label="Digital Menu home">
        <img
          :src="DEMO_LOGO_URL"
          width="34"
          height="34"
          alt=""
          style="border-radius: 9px; object-fit: cover;"
        />
        <span class="site-nav-name">{{ i18n.t.app_name }}</span>
      </router-link>

      <nav class="site-nav-links">
        <router-link to="/" class="site-nav-link">{{ i18n.t.home }}</router-link>
        <button
          class="site-nav-lang"
          type="button"
          @click="i18n.toggleLocale"
          :title="i18n.locale === 'km' ? 'Switch to English' : 'ប្តូរទៅភាសាខ្មែរ'"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span>{{ i18n.locale === "km" ? "EN" : "ខ្មែរ" }}</span>
        </button>
        <router-link to="/login" class="site-nav-login">{{ i18n.t.login }}</router-link>
        <router-link to="/register" class="site-nav-cta">{{ i18n.t.get_started_free }}</router-link>
      </nav>

      <button
        class="site-nav-burger"
        :class="{ 'is-open': open }"
        @click="open = !open"
        aria-label="Toggle menu"
      >
        <span></span><span></span><span></span>
      </button>
    </div>

    <Transition name="site-slide">
      <div v-if="open" class="site-nav-mobile">
        <router-link to="/" class="site-nav-mlink" @click="open = false">{{ i18n.t.home }}</router-link>
        <router-link to="/demo" class="site-nav-mlink site-nav-mlink-hot" @click="open = false">{{ i18n.t.demo_menu }}</router-link>
        <router-link to="/blog" class="site-nav-mlink" @click="open = false">{{ i18n.t.blog }}</router-link>
        <button class="site-nav-mlang" @click="i18n.toggleLocale">
          {{ i18n.locale === "km" ? "English" : "ភាសាខ្មែរ" }}
        </button>
        <router-link to="/login" class="site-nav-mbtn" @click="open = false">{{ i18n.t.login }}</router-link>
        <router-link to="/register" class="site-nav-mbtn site-nav-mbtn-solid" @click="open = false">{{ i18n.t.get_started_free }}</router-link>
      </div>
    </Transition>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useI18nStore } from "@/stores/i18n";
import { DEMO_LOGO_URL } from "@/data/demo";

const i18n = useI18nStore();
const open = ref(false);
const scrolled = ref(false);

let onScroll = () => {
  scrolled.value = window.scrollY > 20;
  if (window.innerWidth > 820) open.value = false;
};

onMounted(() => window.addEventListener("scroll", onScroll, { passive: true }));
onUnmounted(() => window.removeEventListener("scroll", onScroll));
</script>

<style scoped>
.site-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.72);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  backdrop-filter: blur(18px) saturate(180%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
.site-nav-scrolled {
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);
}
.site-nav-inner {
  max-width: 1180px;
  margin: 0 auto;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.site-nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--green-dark, #166534);
}
.site-nav-name {
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.02em;
  white-space: nowrap;
}
.site-nav-links {
  display: flex;
  align-items: center;
  gap: 6px;
}
.site-nav-link {
  color: #4a6650;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 13px;
  border-radius: 9px;
  transition: background 0.2s, color 0.2s;
}
.site-nav-link:hover {
  background: rgba(34, 197, 94, 0.08);
  color: #166534;
}
.site-nav-link-hot {
  color: #15803d;
  border: 1.5px solid rgba(34, 197, 94, 0.45);
}
.site-nav-lang {
  display: flex;
  align-items: center;
  gap: 5px;
  background: transparent;
  border: 1.5px solid #d1d5db;
  border-radius: 9px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 700;
  color: #4a6650;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}
.site-nav-lang:hover {
  border-color: #22c55e;
  color: #166534;
}
.site-nav-login {
  color: #166534;
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
  padding: 8px 14px;
  border-radius: 9px;
  transition: background 0.2s;
}
.site-nav-login:hover {
  background: rgba(34, 197, 94, 0.08);
}
.site-nav-cta {
  background: linear-gradient(135deg, #166534, #22c55e);
  color: #fff;
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
  padding: 9px 18px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(22, 101, 52, 0.22);
  transition: transform 0.2s, box-shadow 0.2s;
}
.site-nav-cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(22, 101, 52, 0.3);
}
.site-nav-burger {
  display: none;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
}
.site-nav-burger span {
  width: 22px;
  height: 2.5px;
  background: #166534;
  border-radius: 2px;
  transition: transform 0.2s, opacity 0.2s;
}
.site-nav-burger.is-open span:nth-child(1) {
  transform: translateY(6.5px) rotate(45deg);
}
.site-nav-burger.is-open span:nth-child(2) {
  opacity: 0;
}
.site-nav-burger.is-open span:nth-child(3) {
  transform: translateY(-6.5px) rotate(-45deg);
}

@media (max-width: 820px) {
  .site-nav-links {
    display: none;
  }
  .site-nav-burger {
    display: flex;
  }
}
.site-slide-enter-active,
.site-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.site-slide-enter-from,
.site-slide-leave-to {
  opacity: 0;
  max-height: 0;
  overflow: hidden;
}
.site-slide-enter-to,
.site-slide-leave-from {
  max-height: 380px;
  opacity: 1;
}
.site-nav-mobile {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 20px 18px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}
.site-nav-mlink,
.site-nav-mbtn {
  padding: 11px 12px;
  border-radius: 9px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  color: #374151;
  transition: background 0.15s;
}
.site-nav-mlink:hover,
.site-nav-mbtn:hover {
  background: #f0fdf4;
}
.site-nav-mlink-hot {
  color: #15803d;
}
.site-nav-mlang {
  padding: 11px 12px;
  border-radius: 9px;
  font-size: 14px;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  color: #374151;
}
.site-nav-mbtn-solid {
  background: #166534;
  color: #fff !important;
  text-align: center;
  margin-top: 4px;
}
.site-nav-mbtn-solid:hover {
  background: #15803d;
}
</style>