// src/composables/useTilt3D.js
// ----------------------------------------------------------------------------
// v-tilt — a pointer-driven 3D tilt directive for Vue 3.
//
// On pointermove it writes CSS custom properties onto the element:
//   --rx  degrees to rotate around X
//   --ry  degrees to rotate around Y
//   --px, --py normalized pointer position (-0.5 .. 0.5)
//   --tx, --ty small translation so the card follows the cursor slightly
//   --mx, --my glare highlight center (percentages)
// and toggles an `.is-tilt` class while the pointer is over the element.
//
// Your CSS is responsible for turning those variables into a transform, e.g.
//   .card {
//     transform: perspective(900px) rotateX(var(--rx, 0deg))
//                rotateY(var(--ry, 0deg)) translate3d(var(--tx, 0px), var(--ty, 0px), 0);
//     transition: transform 0.4s cubic-bezier(0.2, 0.7, 0.2, 1);
//   }
//   .card.is-tilt { transition-duration: 80ms; }
//
// Usage in <script setup>:  import { vTilt } from "@/composables/useTilt3D";
// Then in the template:     <div v-tilt="{ max: 12, translate: 14 }">
// ----------------------------------------------------------------------------

const cleanups = new WeakMap();

function applyTilt(el, opts) {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const max = opts.max ?? 12;
  const translate = opts.translate ?? 14;

  const resetVars = () => {
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--px", "0");
    el.style.setProperty("--py", "0");
    el.style.setProperty("--tx", "0px");
    el.style.setProperty("--ty", "0px");
    el.style.setProperty("--mx", "50%");
    el.style.setProperty("--my", "50%");
  };

  const onMove = (e) => {
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    // Normalized pointer position within the element: -0.5 .. 0.5
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;

    el.style.setProperty("--rx", `${(-py * max).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(px * max).toFixed(2)}deg`);
    el.style.setProperty("--px", px.toFixed(3));
    el.style.setProperty("--py", py.toFixed(3));
    el.style.setProperty("--tx", `${(px * translate).toFixed(1)}px`);
    el.style.setProperty("--ty", `${(py * translate).toFixed(1)}px`);
    el.style.setProperty("--mx", `${((px + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty("--my", `${((py + 0.5) * 100).toFixed(1)}%`);
    el.classList.add("is-tilt");
  };

  const onLeave = () => {
    el.classList.remove("is-tilt");
    resetVars();
  };

  resetVars();
  el.addEventListener("pointermove", onMove, { passive: true });
  el.addEventListener("pointerleave", onLeave, { passive: true });

  cleanups.set(el, () => {
    el.removeEventListener("pointermove", onMove);
    el.removeEventListener("pointerleave", onLeave);
    resetVars();
    el.classList.remove("is-tilt");
    cleanups.delete(el);
  });
}

export const vTilt = {
  mounted: (el, binding) => applyTilt(el, binding.value || {}),
  updated: (el, binding) => {
    // Re-apply when the directive binding value changes.
    const cleanup = cleanups.get(el);
    if (cleanup) {
      cleanup();
      applyTilt(el, binding.value || {});
    }
  },
  unmounted: (el) => {
    cleanups.get(el)?.();
  },
};