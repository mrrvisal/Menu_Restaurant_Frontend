<template>
      <div class="header sel-light">
        <div class="header-bg-overlay"></div>
        <div class="header-bg-pattern"></div>
        <div class="header-blob header-blob-1"></div>
        <div class="header-blob header-blob-2"></div>
        <div class="header-content">
          <span class="header-demo-chip">
            <AppIcon name="rocket" :size="12" /> {{ i18n.t.demo_badge }}
          </span>
          <div class="header-logo-ring">
            <img :src="DEMO_LOGO_URL" class="header-logo" alt="restaurant logo" />
          </div>
          <div class="header-text">
            <h1 class="header-title">{{ i18n.locale === "km" ? "ម្លប់ព្រឹកដាលីន" : "Mlob Pring Dalin" }}</h1>
            <p class="header-tagline">{{ i18n.t.demo_restaurant_tagline }}</p>
          </div>
          <router-link to="/register" class="header-cta">{{ i18n.t.get_started_free }}</router-link>
        </div>
      </div>
</template>

<script setup>
import { useI18nStore } from "@/stores/i18n";
import { DEMO_LOGO_URL } from "@/data/demo";
import AppIcon from "@/components/AppIcon.vue";

const i18n = useI18nStore();
</script>
<style scoped>
/* HEADER — MenuView layered animated gradient */
.header {
  position: relative;
  background: var(--header-grad,
      linear-gradient(145deg, #0f766e 0%, #22c55e 55%, #16a34a 100%));
  background-size: 200% 200%;
  animation: headerGradientShift 8s ease-in-out infinite;
  padding: 40px 20px 56px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 190px;
  border-radius: 0 0 32px 32px;
}

@keyframes headerGradientShift {

  0%,
  100% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }
}

@media (max-width: 480px) {
  .header {
    padding: 30px 16px 44px;
    min-height: 160px;
    border-radius: 0 0 24px 24px;
  }
}

.header-bg-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.12) 0%, transparent 62%);
  pointer-events: none;
}

.header-bg-pattern {
  position: absolute;
  inset: -28px;
  opacity: 0.08;
  background-image: radial-gradient(circle, #fff 1.5px, transparent 1.5px);
  background-size: 28px 28px;
  pointer-events: none;
  animation: patternDrift 12s linear infinite;
}

@keyframes patternDrift {
  from {
    transform: translate(0, 0);
  }

  to {
    transform: translate(-28px, -28px);
  }
}

.header-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(30px);
  pointer-events: none;
}

.header-blob-1 {
  width: 180px;
  height: 180px;
  background: rgba(255, 255, 255, 0.14);
  top: -90px;
  right: -50px;
  animation: floatBlob1 7s ease-in-out infinite;
}

.header-blob-2 {
  width: 140px;
  height: 140px;
  background: var(--header-blob2, rgba(20, 83, 45, 0.25));
  bottom: -80px;
  left: -40px;
  animation: floatBlob2 9s ease-in-out infinite;
}

@keyframes floatBlob1 {

  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }

  50% {
    transform: translate(-16px, 18px) scale(1.08);
  }
}

@keyframes floatBlob2 {

  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }

  50% {
    transform: translate(14px, -14px) scale(1.06);
  }
}

.header-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  max-width: 400px;
  width: 100%;
  animation: headerContentIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes headerContentIn {
  from {
    opacity: 0;
    transform: translateY(14px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header-demo-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  backdrop-filter: blur(4px);
}

.header-logo-ring {
  width: 100px;
  height: 100px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 3px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 0 0 8px rgba(255, 255, 255, 0.1), 0 10px 28px rgba(0, 0, 0, 0.18);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(6px);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation:
    logoPopIn 0.6s 0.1s cubic-bezier(0.34, 1.56, 0.64, 1) both,
    logoFloat 4.5s 0.7s ease-in-out infinite;
}

@keyframes logoPopIn {
  from {
    opacity: 0;
    transform: scale(0.6) rotate(-8deg);
  }

  to {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

@keyframes logoFloat {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-6px);
  }
}

@media (max-width: 480px) {
  .header-logo-ring {
    width: 76px;
    height: 76px;
  }
}

.header-logo-ring:hover {
  transform: scale(1.05) rotate(1deg);
  animation-play-state: paused;
}

.header-logo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header-text {
  text-align: center;
}

.header-title {
  color: var(--header-fg, #fff);
  font-size: 23px;
  font-weight: 800;
  margin: 0;
  line-height: 1.3;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  animation: titleFadeUp 0.6s 0.25s ease both;
}

@keyframes titleFadeUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header-tagline {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  margin: 4px 0 0;
  animation: titleFadeUp 0.6s 0.32s ease both;
}

.header-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 22px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.92);
  color: var(--green-dark, #14532d);
  font-size: 13px;
  font-weight: 800;
  text-decoration: none;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
  transition: all 0.2s;
  animation: titleFadeUp 0.6s 0.4s ease both;
}

.header-cta:hover {
  transform: translateY(-2px);
  background: #fff;
}

@media (max-width: 480px) {
  .header-title {
    font-size: 19px;
  }
}

</style>
