// composables/useFocusTrap.js
// Pure Vue 3 focus trap. Works with Teleported content because the listeners
// live on `document`, and queries focusable elements on every Tab press
// (so dynamic content needs no MutationObserver).
//
// Usage:
//   const el = ref(null);
//   const { activate, deactivate, isActive } = useFocusTrap(el);
//
// Esc is intentionally NOT handled here – keep a single Esc handler in the view.
import { ref, onBeforeUnmount } from "vue";

const FOCUSABLE =
  'a[href],button,input,select,textarea,summary,[tabindex],[contenteditable="true"]';

export function useFocusTrap(elRef) {
  const isActive = ref(false);
  let previouslyFocused = null;

  function focusables() {
    const root = elRef.value;
    if (!root) return [];
    return [...root.querySelectorAll(FOCUSABLE)].filter((el) => {
      if (el.disabled || el.hidden || el.type === "hidden") return false;
      if (el.getAttribute("tabindex") === "-1") return false;
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") return false;
      return el.getClientRects().length > 0;
    });
  }

  function onKeydown(e) {
    if (e.key !== "Tab" || !elRef.value) return;
    const list = focusables();
    if (!list.length) {
      e.preventDefault();
      elRef.value.focus();
      return;
    }
    const first = list[0];
    const last = list[list.length - 1];
    const a = document.activeElement;
    const inside = elRef.value.contains(a);
    if (e.shiftKey && (a === first || !inside)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (a === last || !inside)) {
      e.preventDefault();
      first.focus();
    }
  }

  // Safety net: focus escaped (backdrop click, screen-reader jump) → pull it back
  function onFocusIn(e) {
    if (elRef.value && !elRef.value.contains(e.target)) {
      (focusables()[0] || elRef.value).focus();
    }
  }

  function activate() {
    if (isActive.value || !elRef.value) return;
    previouslyFocused = document.activeElement;
    isActive.value = true;
    document.addEventListener("keydown", onKeydown, true);
    document.addEventListener("focusin", onFocusIn);
    (focusables()[0] || elRef.value).focus();
  }

  function deactivate() {
    if (!isActive.value) return;
    isActive.value = false;
    document.removeEventListener("keydown", onKeydown, true);
    document.removeEventListener("focusin", onFocusIn);
    if (previouslyFocused && document.contains(previouslyFocused)) {
      previouslyFocused.focus();
    }
    previouslyFocused = null;
  }

  onBeforeUnmount(deactivate);

  return { activate, deactivate, isActive };
}
