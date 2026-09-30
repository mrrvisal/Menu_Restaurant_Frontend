<template>
      <section id="faq" class="faq-section">
        <div class="section-header">
          <span class="section-tag">{{ i18n.t.faq }}</span>
          <h2 class="section-title">{{ i18n.t.faq_title }}</h2>
          <p class="section-text centered">{{ i18n.t.faq_desc }}</p>
        </div>
        <div class="faq-list">
          <article v-for="(item, index) in faqs" :key="item.q" class="faq-item"
            :class="{ open: openFaqs.includes(index) }">
            <button class="faq-question" type="button" :aria-expanded="openFaqs.includes(index)"
              :aria-controls="`faq-answer-${index}`" @click="toggleFaq(index)">
              <span class="faq-question-text">{{ i18n.t[item.q] }}</span>
              <span class="faq-toggle" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                  stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </span>
            </button>
            <div :id="`faq-answer-${index}`" class="faq-answer-wrap">
              <div class="faq-answer-inner">
                <p class="faq-answer">{{ i18n.t[item.a] }}</p>
              </div>
            </div>
          </article>
        </div>
      </section>
</template>

<script setup>
import { ref } from "vue";
import { useI18nStore } from "@/stores/i18n";
import { faqs } from "@/data/landing";

const i18n = useI18nStore();

// ─── FAQ accordion ────────────────────────────────────────
// Multiple items can stay open at once (matches the reference design
// where every card shows its answer with an × toggle on the right).
const openFaqs = ref([]); // all expanded by default

function toggleFaq(index) {
  openFaqs.value = openFaqs.value.includes(index)
    ? openFaqs.value.filter((i) => i !== index)
    : [...openFaqs.value, index];
}
</script>
<style scoped>
/* ============================================================
   FAQ SECTION — stacked question cards + rotating toggle
   ============================================================ */
.faq-section {
  padding: 80px 24px;
  background: rgba(240, 253, 244, 0.45);
}

.faq-list {
  width: min(860px, 100%);
  margin: 0 auto;
  display: grid;
  gap: 16px;
}

.faq-item {
  border-radius: 20px;
  background: #fff;
  border: 1.5px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.faq-item:hover {
  border-color: rgba(34, 197, 94, 0.35);
  box-shadow: 0 10px 26px rgba(34, 197, 94, 0.1);
}

.faq-item.open {
  border-color: #22c55e;
}

.faq-question {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 24px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
}

.faq-question:focus-visible {
  outline: 3px solid rgba(34, 197, 94, 0.35);
  outline-offset: -3px;
  border-radius: 20px;
}

.faq-question-text {
  font-size: 16px;
  font-weight: 800;
  line-height: 1.4;
  color: #14532d;
}

.faq-toggle {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    background 0.25s ease, color 0.25s ease, border-color 0.25s ease,
    box-shadow 0.25s ease;
}

.faq-item.open .faq-toggle {
  transform: rotate(45deg);
  /* + becomes × like the reference design */
  background: linear-gradient(135deg, #166534, #22c55e);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 4px 12px rgba(22, 101, 52, 0.28);
}

/* grid-rows trick: smooth height animation without measuring pixels */
.faq-answer-wrap {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.faq-item.open .faq-answer-wrap {
  grid-template-rows: 1fr;
}

.faq-answer-inner {
  overflow: hidden;
  min-height: 0;
}

.faq-answer {
  margin: 0;
  padding: 0 24px 24px;
  font-size: 14px;
  line-height: 1.75;
  color: #4a6650;
}

@media (max-width: 480px) {
  .faq-section {
    padding: 60px 16px;
  }

  .faq-question {
    padding: 18px 18px;
  }

  .faq-question-text {
    font-size: 15px;
  }

  .faq-toggle {
    width: 32px;
    height: 32px;
    border-radius: 10px;
  }

  .faq-answer {
    padding: 0 18px 20px;
  }
}

@media (prefers-reduced-motion: reduce) {

  .faq-answer-wrap,
  .faq-toggle {
    transition: none;
  }
}

</style>
