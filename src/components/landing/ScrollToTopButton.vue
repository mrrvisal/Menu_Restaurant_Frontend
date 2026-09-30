<template>
      <button v-if="showToTop" class="to-top-btn" type="button" :title="i18n.t.back_to_top || 'Back to top'"
        :aria-label="i18n.t.back_to_top || 'Back to top'" @click="$emit('click')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
      </button>
</template>

<script setup>
import { useI18nStore } from "@/stores/i18n";

const i18n = useI18nStore();

// Shows/hides via the parent's Transition (v-if lives in LandingView).
defineProps({ showToTop: { type: Boolean, default: false } });
defineEmits(["click"]);
</script>
<style scoped>
/* ============================================================
   SCROLL-TO-TOP — floating pill, fades in after the hero
   ============================================================ */
.to-top-btn {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 90;
  /* below the navbar (100), above all page content */
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #166534, #22c55e);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(22, 101, 52, 0.35);
  transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
}

.to-top-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 32px rgba(22, 101, 52, 0.42);
}

.to-top-btn:active {
  transform: translateY(-1px) scale(0.96);
}

.to-top-btn svg {
  transition: transform 0.25s ease;
}

.to-top-btn:hover svg {
  transform: translateY(-2px);
}

/* fade + rise in/out */
.to-top-enter-active,
.to-top-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.to-top-enter-from,
.to-top-leave-to {
  opacity: 0;
  transform: translateY(14px) scale(0.9);
}

@media (max-width: 640px) {
  .to-top-btn {
    right: 16px;
    bottom: 16px;
    width: 44px;
    height: 44px;
  }
}

@media (prefers-reduced-motion: reduce) {

  .to-top-enter-active,
  .to-top-leave-active,
  .to-top-btn,
  .to-top-btn svg {
    transition: none;
  }
}
</style>
