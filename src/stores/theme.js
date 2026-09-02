// frontend/src/stores/theme.js
// Dynamic theme color — the user picks a primary color (preset or custom)
// and every derived shade (dark/light/glow/ink/tints) is applied instantly
// as CSS variables on <html>, persisted per account in localStorage.
import { defineStore } from "pinia";
import { ref } from "vue";
import { mix, hexToRgba, normalizeHex, isValidHex } from "@/utils/color.mjs";

// 6 ready-made colors (first one = original brand default)
export const THEME_PRESETS = [
  { name: "Teal", value: "#0f766e" },
  { name: "Green", value: "#16a34a" },
  { name: "Blue", value: "#2563eb" },
  { name: "Purple", value: "#7c3aed" },
  { name: "Rose", value: "#e11d48" },
  { name: "Orange", value: "#ea580c" },
];

const DEFAULT_COLOR = THEME_PRESETS[0].value;

// Per-user storage key so each account keeps its own color
function userStorageKey() {
  try {
    const user = JSON.parse(localStorage.getItem("admin_user") || "null");
    return user && user.id ? `theme_color_user_${user.id}` : "theme_color_user";
  } catch {
    return "theme_color_user";
  }
}

// Push the whole palette as inline CSS variables on <html> —
// inline styles win over any stylesheet :root definition.
function applyToDocument(hex) {
  if (typeof document === "undefined") return;
  const s = document.documentElement.style;
  s.setProperty("--primary", hex);
  s.setProperty("--primary-dark", mix(hex, "#000000", 0.18));
  s.setProperty("--primary-light", mix(hex, "#ffffff", 0.28));
  s.setProperty("--primary-glow", hexToRgba(hex, 0.15));
  s.setProperty("--primary-glow-strong", hexToRgba(hex, 0.25));
  // Headings & tinted surfaces follow the theme so the whole UI recolors
  s.setProperty("--ink", mix(hex, "#03150d", 0.74));
  s.setProperty("--ink-light", mix(hex, "#000000", 0.35));
  s.setProperty("--surface-green", mix(hex, "#ffffff", 0.94));
  s.setProperty("--border-green", mix(hex, "#ffffff", 0.76));
  s.setProperty("--tint-hover", mix(hex, "#ffffff", 0.85));
}

export const useThemeStore = defineStore("theme", () => {
  const primary = ref(DEFAULT_COLOR);

  // Returns true when the color was valid & applied
  function setPrimary(hex, { persist = true } = {}) {
    const norm = normalizeHex(hex);
    if (!isValidHex(norm)) return false;
    primary.value = norm;
    applyToDocument(primary.value);
    if (persist) {
      try {
        localStorage.setItem(userStorageKey(), primary.value);
      } catch {
        /* storage unavailable — theme still applies for this session */
      }
    }
    return true;
  }

  // Restore the saved color for the logged-in account (call on app start)
  function load() {
    try {
      const saved = localStorage.getItem(userStorageKey());
      if (saved) setPrimary(saved, { persist: false });
    } catch {
      /* ignore */
    }
  }

  function reset() {
    setPrimary(DEFAULT_COLOR);
  }

  return { primary, presets: THEME_PRESETS, setPrimary, load, reset };
});
