import { ref } from "vue";

// ─── SCROLL-TO-TOP BUTTON ──────────────────────────────────
// Floating button that fades in once the visitor has scrolled past the
// hero; one tap smoothly returns to the top and clears the section hash
// (so a later refresh starts from the hero, not the old section).
// `activeSection` is the ref from useScrollSpy — scrollToTop resets it.
export function useScrollToTop(activeSection) {
  const showToTop = ref(false);
  const TO_TOP_AFTER = 500; // px of scroll before the button appears

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
    activeSection.value = "";
    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }

  return { showToTop, TO_TOP_AFTER, scrollToTop };
}
