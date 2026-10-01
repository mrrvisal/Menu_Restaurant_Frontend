<template>
  <div class="landing">
    <!-- 3D WebGL stage (fixed full-viewport background) -->
    <Hero3D />

    <!-- NAVBAR -->
    <LandingNavbar :scrolled="scrolled" v-model:active-section="activeSection" v-model:mobile-open="mobileOpen" />

    <main>
      <!-- HERO -->
      <LandingHero />

      <!-- OWNER PROBLEMS -->
      <LandingProblems />

      <!-- FEATURES -->
      <LandingFeatures />

      <!-- DEMO PREVIEW -->
      <LandingDemoPreview />

      <!-- HOW IT WORKS -->
      <LandingSteps />

      <!-- FAQ -->
      <LandingFaq />

      <!-- CTA -->
      <LandingCta />
    </main>

    <!-- FOOTER -->
    <LandingFooter />

    <!-- SCROLL TO TOP — appears after scrolling down, one tap returns to the hero -->
    <Transition name="to-top">
      <ScrollToTopButton :show-to-top="showToTop" @click="scrollToTop" />
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, defineAsyncComponent } from "vue";
import { demoBlogPosts } from "@/data/demo";
import AppIcon from "@/components/AppIcon.vue";
import LandingNavbar from "@/components/landing/LandingNavbar.vue";
import LandingHero from "@/components/landing/LandingHero.vue";
import LandingProblems from "@/components/landing/LandingProblems.vue";
import LandingFeatures from "@/components/landing/LandingFeatures.vue";
import LandingDemoPreview from "@/components/landing/LandingDemoPreview.vue";
import LandingSteps from "@/components/landing/LandingSteps.vue";
import LandingFaq from "@/components/landing/LandingFaq.vue";
import LandingCta from "@/components/landing/LandingCta.vue";
import LandingFooter from "@/components/landing/LandingFooter.vue";
import ScrollToTopButton from "@/components/landing/ScrollToTopButton.vue";
import { useScrollSpy } from "@/composables/useScrollSpy";
import { useScrollToTop } from "@/composables/useScrollToTop";
import { useTopFade } from "@/composables/useTopFade";

// Three.js is heavy (~500 kB) — load the WebGL background as its own async chunk
// so the landing page content paints first and the 3D scene fades in when ready.
const Hero3D = defineAsyncComponent(() => import("@/components/Hero3D.vue"));

const mobileOpen = ref(false);
const scrolled = ref(false);

// ─── SCROLL-SPY: navbar "stands on" the section being viewed ──
// Logic lives in @/composables/useScrollSpy (URL-hash restore + link highlight).
const { activeSection, updateActiveSection, scrollToHash } = useScrollSpy();

// ─── SCROLL-TO-TOP BUTTON ──────────────────────────────────
// Logic lives in @/composables/useScrollToTop (clears the section hash).
const { showToTop, TO_TOP_AFTER, scrollToTop } = useScrollToTop(activeSection);

// ─── PROGRESSIVE TOP FADE (instant, covers cards too) ──────
// Logic lives in @/composables/useTopFade (mask fade above FADE_LINE).
const { collectFadeTargets, applyFade, requestFade, destroy: destroyFade } = useTopFade();

const blogPosts = demoBlogPosts;

const logoInitials = "DM";

let screenHandler = null;
let scrollHandler = null;

onMounted(() => {
  collectFadeTargets();
  applyFade();
  scrollHandler = () => {
    scrolled.value = window.scrollY > 40; // navbar background (unchanged)
    showToTop.value = window.scrollY > TO_TOP_AFTER; // floating top button
    updateActiveSection(); // scroll-spy follows the viewed section
    requestFade();
  };
  window.addEventListener("scroll", scrollHandler, { passive: true });
  screenHandler = () => {
    if (window.innerWidth > 820) mobileOpen.value = false;
    collectFadeTargets();
    applyFade();
  };
  window.addEventListener("resize", screenHandler, { passive: true });
  // Refresh / shared link with a #section hash → restore that position
  // (one frame later so the DOM + 3D hero have settled)
  if (window.location.hash) {
    requestAnimationFrame(() => scrollToHash(window.location.hash));
  }
  updateActiveSection();
});

onUnmounted(() => {
  destroyFade(); // cancels a pending fade frame (was cancelAnimationFrame(fadeRaf))
  if (scrollHandler) window.removeEventListener("scroll", scrollHandler);
  if (screenHandler) window.removeEventListener("resize", screenHandler);
});
</script>

<style>
/* ============================================================
   CROSS-CUTTING BASE — intentionally UNSCOPED.
   These rules must reach INTO the child components (navbar, sections…).
   Keeping them unscoped preserves the exact original selectors,
   specificity and matched element set; every selector is prefixed with
   .landing — a class that only exists on this page — so nothing leaks
   into other views (RegisterView defines its own .section-* rules).
   ============================================================ */
.landing :where(a, button) {
  transition: transform 0.2s ease, box-shadow 0.2s ease, color 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}

.landing :where(a, button):focus-visible {
  outline: 3px solid rgba(34, 197, 94, 0.35);
  outline-offset: 3px;
}

/* was scoped to the view's template; .landing keeps the identical element set */
.landing [id] {
  scroll-margin-top: 80px;
}
</style>

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
/* ============================================================
   SHARED SECTION HEADING — used by Problems / Features / Demo /
   Steps / FAQ. Kept here and reached with :deep() so the five sections
   share ONE source. Class names are unchanged; scoping stays on this
   page only (RegisterView has its own .section-* rules).
   ============================================================ */
:deep(.section-tag) {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
  color: #15803d;
  background: rgba(255, 255, 255, 0.75);
  padding: 6px 12px;
  border-radius: 100px;
  margin-bottom: 16px;
  border: 1px solid rgba(34, 197, 94, 0.25);
}

:deep(.section-tag::before) {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
  animation: hero-live-ping 2s ease-out infinite;
}

/* referenced by .section-tag::before above (scoped keyframes don't cross components) */
@keyframes hero-live-ping {
  0% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5);
  }

  70% {
    box-shadow: 0 0 0 7px rgba(34, 197, 94, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.3);
    opacity: 0.5;
  }
}

:deep(.section-title) {
  margin: 0 0 14px;
  font-size: 34px;
  font-weight: 800;
  line-height: 1.4;
  color: #14532d;
}

:deep(.section-text) {
  color: #4a6650;
  font-size: 16px;
  line-height: 1.8;
}

:deep(.section-text.centered) {
  max-width: 640px;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
}

:deep(.section-header) {
  text-align: center;
  margin-bottom: 40px;
}

:deep(.problem-card h3),
:deep(.feature-card h3),
:deep(.step-card h3) {
  font-size: 18px;
  line-height: 1.45;
  letter-spacing: 0;
}

:deep(.problem-card p),
:deep(.feature-card p),
:deep(.step-card p) {
  font-size: 15px;
  line-height: 1.75;
}

@media (max-width: 820px) {
  :deep(.section-title) {
    font-size: 30px;
  }

  :deep(.problems-section),
  :deep(.features-section),
  :deep(.demo-section),
  :deep(.steps-section),
  :deep(.faq-section) {
    padding-block: 60px;
  }
}

@media (max-width: 480px) {
  :deep(.section-title) {
    font-size: 25px;
  }

  :deep(.section-text) {
    font-size: 15px;
  }

  :deep(.section-header) {
    margin-bottom: 30px;
  }

  :deep(.problems-section),
  :deep(.features-section),
  :deep(.demo-section),
  :deep(.steps-section),
  :deep(.faq-section) {
    padding: 48px 18px;
  }
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

@media (max-width: 920px) {
  .blog-preview-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 560px) {
  .blog-preview-grid {
    grid-template-columns: 1fr;
  }
}
</style>
