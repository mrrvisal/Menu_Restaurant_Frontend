import { ref } from "vue";

// ─── SCROLL-SPY: navbar "stands on" the section being viewed ──
// Tracks which landing section (#features / #demo-menu / #how-it-works)
// is currently in view and highlights its navbar link. The section is
// also stored in the URL hash, so a page refresh (or a shared link)
// restores the exact same position instead of jumping back to the hero.
export function useScrollSpy() {
  const SECTION_IDS = ["features", "demo-menu", "how-it-works"];
  const activeSection = ref("");

  function updateActiveSection() {
    const offset = 140; // navbar height + breathing room
    let current = "";
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= offset) current = id;
    }
    activeSection.value = current;
  }

  function scrollToHash(hash) {
    if (!hash) return;
    const el = document.querySelector(hash);
    if (el) el.scrollIntoView(); // instant — feels like a real restore
  }

  return { activeSection, updateActiveSection, scrollToHash };
}
