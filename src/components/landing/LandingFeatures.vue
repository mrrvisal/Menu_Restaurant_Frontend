<template>
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
</template>

<script setup>
import { useI18nStore } from "@/stores/i18n";
import { features } from "@/data/landing";

const i18n = useI18nStore();
</script>
<style scoped>
/* ============================================================
   FEATURES SECTION
   ============================================================ */
.features-section {
  padding: 80px 24px;
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
  margin-top: 38px;
  /* head-room so the badge can overlap above the card */
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
  border-radius: 22px;
  /* squircle, like the mock */
  background: linear-gradient(135deg, #34d399 0%, #16a34a 100%);
  color: #fff;
  border: 4px solid #fff;
  /* white ring that separates it from the card */
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
</style>
