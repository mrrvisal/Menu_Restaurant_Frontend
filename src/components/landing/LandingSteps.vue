<template>
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
</template>

<script setup>
import { useI18nStore } from "@/stores/i18n";
import { steps } from "@/data/landing";

const i18n = useI18nStore();
</script>
<style scoped>
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
  perspective: 1200px;
  /* depth for the cards' translateZ children */
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
  transform: perspective(900px);
  /* depth for the translateZ children only */
  transform-style: preserve-3d;
  /* required for the translateZ children */
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
  letter-spacing: 0;
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
  right: -28px;
  /* must match .steps-timeline gap */
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
  letter-spacing: 0;
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
</style>
