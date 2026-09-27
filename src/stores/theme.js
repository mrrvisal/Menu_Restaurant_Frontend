import { defineStore } from "pinia";
import { ref } from "vue";
import {
  mix,
  hexToRgba,
  normalizeHex,
  isValidHex,
  onColor,
  strongColor,
} from "@/utils/color.mjs";

// Ready-made theme color presets
export const THEME_PRESETS = [
  { name: "Teal", value: "#0f766e" },
  { name: "Green", value: "#16a34a" },
  { name: "Blue", value: "#2563eb" },
  { name: "Purple", value: "#7c3aed" },
  { name: "Rose", value: "#e11d48" },
  { name: "Orange", value: "#ea580c" },
];

const DEFAULT_COLOR = THEME_PRESETS[0].value;

// Per-user storage key so each account keeps its own theme color
function userStorageKey() {
  try {
    const user = JSON.parse(localStorage.getItem("admin_user") || "null");
    return user && user.id ? `theme_color_user_${user.id}` : "theme_color_user";
  } catch {
    return "theme_color_user";
  }
}

// Push palette as inline CSS variables on <html>
function applyToDocument(hex) {
  if (typeof document === "undefined") return;
  const s = document.documentElement.style;
  const strong = strongColor(hex);
  s.setProperty("--primary", hex);
  s.setProperty("--primary-dark", mix(hex, "#000000", 0.18));
  s.setProperty("--primary-light", mix(hex, "#ffffff", 0.28));
  s.setProperty("--primary-glow", hexToRgba(strong, 0.15));
  s.setProperty("--primary-glow-strong", hexToRgba(strong, 0.25));
  s.setProperty("--on-primary", onColor(hex));
  s.setProperty("--primary-strong", strong);
  s.setProperty("--ink", mix(hex, "#03150d", 0.74));
  s.setProperty("--ink-light", mix(hex, "#000000", 0.35));
  s.setProperty("--surface-green", mix(hex, "#ffffff", 0.94));
  s.setProperty("--border-green", mix(hex, "#ffffff", 0.76));
  s.setProperty("--tint-hover", mix(hex, "#ffffff", 0.85));
}

export const useThemeStore = defineStore("theme", () => {
  const primary = ref(DEFAULT_COLOR);

  function setPrimary(hex, { persist = true } = {}) {
    const norm = normalizeHex(hex);
    if (!isValidHex(norm)) return false;
    primary.value = norm;
    applyToDocument(primary.value);
    if (persist) {
      try {
        localStorage.setItem(userStorageKey(), primary.value);
      } catch {
        // Theme still applies in-memory even if storage is unavailable
      }
    }
    return true;
  }

  // Restore saved color for the active user account
  function load() {
    try {
      const saved = localStorage.getItem(userStorageKey());
      setPrimary(saved || DEFAULT_COLOR, { persist: false });
    } catch {
      // Ignore storage errors
    }
  }

  // Reset to original brand color
  function reset({ persist = true } = {}) {
    setPrimary(DEFAULT_COLOR, { persist });
  }

  return { primary, presets: THEME_PRESETS, setPrimary, load, reset };
});
