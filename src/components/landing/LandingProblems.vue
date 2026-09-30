<template>
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
</template>

<script setup>
import { useI18nStore } from "@/stores/i18n";
import { ownerBenefits } from "@/data/landing";

const i18n = useI18nStore();
</script>
<style scoped>
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
  border: 1.5px solid transparent;
  /* keeps size stable when the outline appears */
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
  border-radius: 20px 0 0 20px;
  /* follows the card's rounded corners */
}

/* mono green number */
.problem-card-num {
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 15px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.08em;
  color: #22c55e;
  margin-bottom: 12px;
  /* number → title */
}

.problem-card h3 {
  margin: 0 0 8px;
  /* title → description */
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
</style>
