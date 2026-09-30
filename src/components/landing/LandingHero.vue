<template>
      <section class="hero">
        <div class="hero-bg-shapes" aria-hidden="true">
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                  stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </router-link>
              <a href="#demo-menu" class="hero-secondary" @click.prevent="router.push('/demo')">
                <svg class="hero-play" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
                </svg>
                {{ i18n.t.try_demo }}
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
                <span class="hero-card-table">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
                    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                    <path d="M14 14h3v3h-3zM19 19h2v2h-2z" />
                  </svg>
                  {{ i18n.t.table_no }} 05
                </span>
                <span class="hero-card-live"><i class="hero-live-dot" aria-hidden="true"></i>Live</span>
              </div>
              <div class="hero-card-body">
                <div class="hero-order-restaurant">
                  <div class="hero-order-avatar"><img
                      src="https://res.cloudinary.com/daji2ml3y/image/upload/v1783262055/ChatGPT_Image_Jul_5_2026_09_32_32_PM_c6ziic.png"
                      width="40" height="40" alt=""></div>
                  <div>
                    <strong>Digital Menu</strong>
                    <span>Table QR checkout</span>
                  </div>
                </div>
                <div class="hero-order-items">
                  <div v-for="food in heroFoods" :key="food.id" class="hero-order-item">
                    <div class="hero-order-img" :style="{ backgroundImage: `url(${food.img})` }"></div>
                    <span class="hero-order-name">{{ food.name }}</span>
                    <span class="hero-order-price">{{ Number(food.price).toLocaleString() }}៛</span>
                  </div>
                </div>
                <div class="hero-order-total">
                  <span>{{ i18n.t.total }}</span>
                  <strong>{{ heroTotal.toLocaleString() }}៛</strong>
                </div>
              </div>
            </div>
            <div class="hero-floating hero-floating-1" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div class="hero-floating hero-floating-2" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" />
              </svg>
            </div>
            <div class="hero-floating hero-floating-3" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18" />
              </svg>
            </div>
          </aside>
        </div>
        <div class="hero-scroll-hint" aria-hidden="true">
          <span class="hero-scroll-mouse"><span></span></span>
        </div>
      </section>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useI18nStore } from "@/stores/i18n";
import { stats, sampleFoods } from "@/data/landing";
import { vTilt } from "@/composables/useTilt3D";

const i18n = useI18nStore();
const router = useRouter();

// Foods + total shown inside the hero "live order" preview card.
// Derived from the demo menu so the amount always matches the visible rows.
const heroFoods = computed(() => sampleFoods.slice(0, 3));
const heroTotal = computed(() =>
  heroFoods.value.reduce((sum, food) => sum + Number(food.price || 0), 0)
);
</script>
<style scoped>
/* ============================================================
   HERO
   ============================================================ */
.hero {
  position: relative;
  isolation: isolate;
  /* keeps scrim + shapes behind the content */
  min-height: 100vh;
  /* fallback for browsers without svh */
  min-height: 100svh;
  /* mobile: no jump when the browser bars collapse */
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: clamp(96px, 13vh, 132px) clamp(18px, 4vw, 32px) clamp(56px, 9vh, 88px);
  background: linear-gradient(160deg, rgba(240, 253, 244, 0.5) 0%, rgba(220, 252, 231, 0.42) 30%, rgba(240, 253, 244, 0.5) 60%, rgba(232, 245, 233, 0.55) 100%);
}

/* readability scrim: strongest behind the copy (left), fading out to the
   right so the WebGL scene stays visible while text keeps its contrast */
.hero::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(115% 85% at 0% 45%, rgba(248, 251, 249, 0.92) 0%, rgba(248, 251, 249, 0.62) 42%, rgba(248, 251, 249, 0) 72%),
    linear-gradient(180deg, rgba(248, 251, 249, 0) 62%, rgba(248, 251, 249, 0.82) 100%);
}

.hero-bg-shapes {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.shape {
  position: absolute;
  border-radius: 50%;
}

.shape-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(34, 197, 94, 0.08), transparent 70%);
  top: -120px;
  right: -80px;
  animation: floatSlow 8s ease-in-out infinite;
}

.shape-2 {
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, rgba(22, 101, 52, 0.06), transparent 70%);
  bottom: 10%;
  left: -100px;
  animation: floatSlow 10s ease-in-out infinite reverse;
}

.shape-3 {
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(34, 197, 94, 0.05), transparent 70%);
  top: 40%;
  right: 20%;
  animation: floatSlow 7s ease-in-out infinite 2s;
}

.shape-4 {
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(251, 146, 60, 0.06), transparent 70%);
  bottom: 20%;
  right: 35%;
  animation: floatSlow 9s ease-in-out infinite 1s;
}

@keyframes floatSlow {

  0%,
  100% {
    transform: translateY(0) scale(1);
  }

  50% {
    transform: translateY(-20px) scale(1.05);
  }
}

/* staggered entrance — hero copy and card rise into place on first paint */
.hero-content>* {
  animation: hero-rise 0.75s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.hero-content>*:nth-child(2) {
  animation-delay: 0.1s;
}

.hero-content>*:nth-child(3) {
  animation-delay: 0.18s;
}

.hero-content>*:nth-child(4) {
  animation-delay: 0.26s;
}

.hero-content>*:nth-child(5) {
  animation-delay: 0.34s;
}

.hero-visual {
  animation: hero-rise 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.18s both;
}

@keyframes hero-rise {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

.hero-inner {
  position: relative;
  z-index: 2;
  width: min(1180px, 100%);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(330px, 440px);
  gap: clamp(28px, 4.5vw, 56px);
  align-items: center;
}

.hero-content {
  min-width: 0;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0;
  text-transform: uppercase;
  color: #166534;
  background: rgba(255, 255, 255, 0.62);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
  padding: 0.42rem 0.95rem;
  border-radius: 100px;
  margin-bottom: clamp(16px, 2.4vw, 24px);
  border: 1px solid rgba(34, 197, 94, 0.22);
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.16);
}

.hero-badge::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
  animation: hero-live-ping 2s ease-out infinite;
}

.hero-title {
  margin: 0;
  font-size: 60px;
  font-weight: 900;
  /* Khmer diacritics need more leading than the default 1.15 */
  line-height: 1.3;
  letter-spacing: 0;
  color: #14532d;
  overflow-wrap: break-word;
  text-wrap: balance;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.45);
}

.hero-subtitle {
  max-width: 54ch;
  margin: clamp(14px, 2vw, 18px) 0 0;
  color: #4a6650;
  font-size: 17px;
  line-height: 1.8;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: clamp(24px, 3.2vw, 34px);
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
  box-shadow: 0 4px 16px rgba(22, 101, 52, 0.3);
  transition: all 0.25s;
}

.hero-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(22, 101, 52, 0.35);
}

.hero-primary:active {
  transform: translateY(0) scale(0.98);
}

.hero-primary svg {
  transition: transform 0.25s ease;
}

.hero-primary:hover svg {
  transform: translateX(3px);
}

.hero-secondary {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 14px 26px;
  border-radius: 12px;
  border: 1.5px solid #d1d5db;
  background: rgba(255, 255, 255, 0.78);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
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

.hero-secondary .hero-play {
  color: #16a34a;
  flex-shrink: 0;
  transition: transform 0.25s ease;
}

.hero-secondary:hover .hero-play {
  transform: scale(1.08);
}

.hero-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: clamp(28px, 3.6vw, 40px);
}

.hero-stat {
  padding: 15px 20px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.68);
  border: 1px solid rgba(0, 0, 0, 0.04);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.hero-stat:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(22, 101, 52, 0.1);
}

.hero-stat-value {
  display: block;
  font-size: 23px;
  font-weight: 900;
  line-height: 1.1;
  color: #166534;
}

.hero-stat-label {
  display: block;
  margin-top: 3px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
  color: #6b806e;
}

/* Hero visual card */
.hero-visual {
  position: relative;
  width: 100%;
  min-width: 0;
}

.hero-card {
  max-width: 100%;
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
  gap: 10px;
  padding: 13px 18px;
  border-bottom: 1px solid #f3f4f6;
}

.hero-card-dots {
  display: flex;
  gap: 6px;
}

.hero-card-dots span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.hero-card-dots span:nth-child(1) {
  background: #ef4444;
}

.hero-card-dots span:nth-child(2) {
  background: #eab308;
}

.hero-card-dots span:nth-child(3) {
  background: #22c55e;
}

/* table chip — pushes itself next to the Live badge on the right */
.hero-card-table {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  padding: 3px 9px;
  border-radius: 999px;
  background: #f0fdf4;
  border: 1px solid rgba(34, 197, 94, 0.28);
  color: #15803d;
  font-size: 10.5px;
  font-weight: 800;
  line-height: 1.7;
  white-space: nowrap;
}

.hero-card-live {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 700;
  color: #22c55e;
  white-space: nowrap;
}

.hero-live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
  animation: hero-live-ping 2s ease-out infinite;
}

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
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
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
  width: 44px;
  height: 44px;
  border-radius: 10px;
  color: #fff;
  background: #fff;
  border: 1px solid rgba(34, 197, 94, 0.6);
  font-weight: 800;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.hero-order-avatar img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  border-radius: 9px;
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
  width: 44px;
  height: 36px;
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
  border: 1px solid rgba(34, 197, 94, 0.14);
  box-shadow: 0 6px 18px rgba(20, 83, 45, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #22c55e;
  animation: floatElement 4s ease-in-out infinite;
}

.hero-floating-1 {
  top: -16px;
  right: -12px;
  animation-delay: 0s;
}

.hero-floating-2 {
  bottom: 30px;
  left: -20px;
  animation-delay: 1.5s;
  font-size: 18px;
}

.hero-floating-3 {
  bottom: -10px;
  right: 30px;
  animation-delay: 3s;
  width: 38px;
  height: 38px;
}

@keyframes floatElement {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-8px);
  }
}

/* ── scroll hint (decorative; only when the hero fits on one screen) ── */
.hero-scroll-hint {
  position: absolute;
  left: 50%;
  bottom: clamp(14px, 3vh, 26px);
  z-index: 2;
  display: none;
  transform: translateX(-50%);
  pointer-events: none;
}

.hero-scroll-mouse {
  position: relative;
  display: block;
  width: 22px;
  height: 34px;
  border: 2px solid rgba(22, 101, 52, 0.32);
  border-radius: 999px;
}

.hero-scroll-mouse span {
  position: absolute;
  top: 6px;
  left: 50%;
  width: 4px;
  height: 7px;
  margin-left: -2px;
  border-radius: 999px;
  background: #22c55e;
  animation: hero-wheel 1.9s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes hero-wheel {
  0% {
    transform: translateY(0);
    opacity: 0;
  }

  22% {
    opacity: 1;
  }

  70% {
    transform: translateY(11px);
    opacity: 0;
  }

  100% {
    transform: translateY(11px);
    opacity: 0;
  }
}

@media (min-width: 1121px) {
  .hero-scroll-hint {
    display: block;
  }
}

/* ── ≤1120px: keep both columns, but give the copy more room ── */
@media (max-width: 1120px) {
  .hero-inner {
    grid-template-columns: minmax(0, 1fr) minmax(300px, 380px);
    gap: 32px;
  }

  .hero-title {
    font-size: 46px;
  }

  .hero-stat {
    padding: 14px 16px;
  }

  .hero-stat-value {
    font-size: 21px;
  }
}

/* ── ≤980px: stack — copy first, preview card underneath ── */
@media (max-width: 980px) {
  .hero {
    align-items: flex-start;
    padding-top: clamp(96px, 15vh, 122px);
  }

  /* the 3D scene sits behind the copy on stacked layouts → stronger scrim */
  .hero::before {
    background: linear-gradient(180deg, rgba(248, 251, 249, 0.9) 0%, rgba(248, 251, 249, 0.72) 45%, rgba(248, 251, 249, 0.88) 100%);
  }

  .hero-inner {
    grid-template-columns: 1fr;
    gap: 34px;
  }

  .hero-visual {
    max-width: 460px;
    margin-inline: auto;
  }

  .hero-title {
    font-size: 40px;
  }

  .hero-subtitle {
    max-width: 60ch;
  }

  .hero-badge {
    margin-bottom: 16px;
  }

  .hero-floating-1 {
    top: -14px;
    right: -6px;
  }

  .hero-floating-2 {
    bottom: 24px;
    left: -8px;
  }

  .hero-floating-3 {
    bottom: -10px;
    right: 18px;
  }
}

/* ── ≤640px: phone tuning ── */
@media (max-width: 640px) {
  .hero {
    padding: 88px 16px 46px;
  }

  .hero-title {
    font-size: 32px;
    line-height: 1.36;
  }

  .hero-subtitle {
    font-size: 15px;
    line-height: 1.72;
  }

  .hero-badge {
    font-size: 11px;
    letter-spacing: 0;
    padding: 0.36rem 0.8rem;
    background: rgba(255, 255, 255, 0.74);
  }

  /* full-width, easy-to-tap CTAs instead of ragged wrapping */
  .hero-actions {
    gap: 10px;
  }

  .hero-primary,
  .hero-secondary {
    flex: 1 1 100%;
    justify-content: center;
    padding: 13px 20px;
  }

  /* stats: two tiles + one wide bar (no lonely 2 + 1 wrap) */
  .hero-stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-top: 26px;
  }

  .hero-stat {
    padding: 12px 14px;
    border-radius: 12px;
  }

  .hero-stat:last-child {
    grid-column: 1 / -1;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .hero-stat:last-child .hero-stat-label {
    margin-top: 0;
  }

  .hero-stat-value {
    font-size: 19px;
  }

  .hero-stat-label {
    font-size: 12px;
  }

  .hero-card {
    border-radius: 18px;
  }

  .hero-card-header {
    padding: 12px 14px;
  }

  .hero-card-body {
    padding: 14px;
  }

  .hero-card-table {
    font-size: 10px;
    padding: 2px 7px;
  }

  .hero-order-item {
    gap: 8px;
    padding: 9px 10px;
  }

  .hero-order-img {
    width: 40px;
    height: 34px;
  }

  .hero-order-name {
    font-size: 11.5px;
  }

  .hero-order-total strong {
    font-size: 16px;
  }

  /* decorative blobs: smaller and pulled out of the text column */
  .shape-1 {
    width: 300px;
    height: 300px;
    top: -110px;
    right: -90px;
  }

  .shape-2 {
    width: 220px;
    height: 220px;
    left: -90px;
  }

  .shape-3,
  .shape-4 {
    display: none;
  }
}

/* ── ≤380px: one stat per row, tighter card rows ── */
@media (max-width: 380px) {
  .hero-stats {
    grid-template-columns: 1fr;
  }

  .hero-stat:last-child {
    grid-column: auto;
    display: block;
  }

  .hero-stat:last-child .hero-stat-label {
    margin-top: 3px;
  }

  .hero-order-price {
    font-size: 11.5px;
  }
}

/* touch devices: skip the pointer tilt + glare while scrolling */
@media (hover: none) {

  .hero-card,
  .hero-card.is-tilt {
    transform: none;
  }

  .hero-card::after {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {

  .shape,
  .hero-floating,
  .hero-live-dot,
  .hero-scroll-mouse span {
    animation: none;
  }

  .hero-content>*,
  .hero-visual {
    animation: none;
  }
}

</style>
