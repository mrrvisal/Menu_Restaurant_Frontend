/* ------------------------------------------------------------
   PROGRESSIVE TOP FADE (instant, covers cards too)
   When content scrolls up and crosses a line FADE_LINE px from
   the top of the screen, the part above that line becomes opacity
   0 immediately — for text AND for the card/container elements
   (hero card, feature cards, phone mockup, step cards, images…).
   FADE_BAND = 0 gives a hard instant cut (no trailing fade).
   ------------------------------------------------------------ */
export function useTopFade() {
  const FADE_LINE = 60; // px from top of screen where content disappears
  const FADE_BAND = 0;  // 0 = instant hide. Increase (e.g. 40) for a softer fade

  let fadeRaf = null;
  let fadeTargets = [];

  // Everything that fades: all text AND the card/container elements themselves.
  const FADE_SELECTOR =
    "h1, h2, h3, p, strong, a, button, span, img, li, " +
    ".hero-badge, .hero-title, .hero-subtitle, .hero-primary, .hero-secondary, .hero-stat, .hero-actions, " +
    ".hero-card, .hero-card-header, .hero-card-table, .hero-live-dot, .hero-scroll-hint, " +
    ".hero-order-restaurant, .hero-order-items, .hero-order-item, .hero-order-img, .hero-order-total, .hero-floating, " +
    ".problem-card, .feature-card, .feature-icon, " +
    ".phone-mockup, .phone-header, .phone-restaurant, .phone-restaurant-avatar, .phone-categories, .phone-cat, " +
    ".phone-foods, .phone-food-item, .phone-food-img, .phone-food-info, " +
    ".demo-tags span, .demo-cta-btn, " +
    ".faq-list, .faq-item, .faq-question, .faq-question-text, .faq-toggle, .faq-answer, " +
    ".blog-preview-card, .blog-preview-img, .blog-preview-body, .blog-preview-tag, .blog-view-all-btn, " +
    ".step-card, .step-number, .step-connector, " +
    ".cta-inner, .cta-icon-wrapper, .cta-btn";

  // Targets are queried from the DOM, so component boundaries don't matter.
  function collectFadeTargets() {
    const mainEl = document.querySelector(".landing main");
    fadeTargets = mainEl ? Array.from(mainEl.querySelectorAll(FADE_SELECTOR)) : [];
  }

  function clearMask(el) {
    el.style.maskImage = "";
    el.style.webkitMaskImage = "";
  }

  function applyFade() {
    for (let i = 0; i < fadeTargets.length; i++) {
      const el = fadeTargets[i];
      const top = el.getBoundingClientRect().top;
      const crossed = FADE_LINE - top; // px of this element already above the line

      if (crossed <= 0) {
        // Fully below the line — keep it 100% visible
        if (!el.style.maskImage) continue;
        clearMask(el);
        continue;
      }

      const start = Math.min(crossed, el.offsetHeight || 1);
      const end = start + FADE_BAND;
      const grad = `linear-gradient(to bottom, transparent 0, transparent ${start}px, #000 ${end}px, #000 100%)`;
      el.style.webkitMaskImage = grad;
      el.style.maskImage = grad;
    }
  }

  function requestFade() {
    if (fadeRaf) return;
    fadeRaf = requestAnimationFrame(() => {
      fadeRaf = null;
      applyFade();
    });
  }

  // Called from onUnmounted — cancels a pending animation frame.
  function destroy() {
    if (fadeRaf) {
      cancelAnimationFrame(fadeRaf);
      fadeRaf = null;
    }
  }

  return { collectFadeTargets, applyFade, requestFade, destroy };
}
