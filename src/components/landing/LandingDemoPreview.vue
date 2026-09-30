<template>
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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                  stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </router-link>
            </div>
          </div>
          <div class="phone-mockup" v-tilt="{ max: 10, translate: 10 }">
            <div class="phone-notch sel-light"></div>
            <div class="phone-header sel-light">
              <div class="phone-restaurant">
                <div class="phone-restaurant-avatar"><img data-v-6b7d1e37=""
                    src="https://res.cloudinary.com/daji2ml3y/image/upload/v1777712294/ChatGPT_Image_May_2_2026_03_39_44_PM-Picsart-BackgroundRemover_1_x4yi9t.png"
                    width="60" alt=""></div>
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
</template>

<script setup>
import { useI18nStore } from "@/stores/i18n";
import { sampleFoods } from "@/data/landing";
import { vTilt } from "@/composables/useTilt3D";

const i18n = useI18nStore();
</script>
<style scoped>
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
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
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
  background: rgba(255, 255, 255, 0.15);
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
  width: 44px;
  height: 44px;
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
  color: rgba(255, 255, 255, 0.7);
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

.phone-food-info>span {
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

</style>
