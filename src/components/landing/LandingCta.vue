<template>
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
              stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </router-link>
        </div>
      </section>
</template>

<script setup>
import { useI18nStore } from "@/stores/i18n";

const i18n = useI18nStore();
</script>
<style scoped>
/* ============================================================
   CTA SECTION — white rounded card, mint corner circles,
   green arcs peeking from the section corners, pill button
   ============================================================ */
.cta-section {
  position: relative;
  padding: 90px 24px;
  text-align: center;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(248, 251, 249, 0.8) 0%, rgba(240, 253, 244, 0.68) 100%);
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
  font-size: 34px;
  font-weight: 900;
  line-height: 1.4;
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
  border-radius: 999px;
  /* pill, like the mock */
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

  .cta-inner h2 {
    font-size: 26px;
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

</style>
