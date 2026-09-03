// frontend/src/utils/themePalette.mjs
// Shared palette derivation for the public menu theme.
// Given a restaurant's primary color, produces the tint tokens the menu uses.
import {
  normalizeHex,
  lighten,
  darken,
  hexToRgba,
  onColor,
  strongColor,
} from "./color.mjs";

export const THEME_VARS = [
  "--green-mid",
  "--green-light",
  "--green-dark",
  "--green-soft",
  "--green-pale",
  "--green-strong",
  "--on-primary",
  "--header-fg",
  "--header-blob2",
];

// Returns a map of CSS custom-property → color, or null when the input is invalid
export function buildThemePalette(input) {
  const hex = normalizeHex(input);
  if (!hex) return null;
  return {
    "--green-mid": hex,
    "--green-light": lighten(hex, 0.18),
    "--green-dark": darken(hex, 0.28),
    "--green-soft": lighten(hex, 0.66),
    "--green-pale": lighten(hex, 0.93),
    // Always-readable accent (price, icons, focus) — darkens light primaries
    "--green-strong": strongColor(hex),
    // Foreground to place on primary-colored buttons/tabs
    "--on-primary": onColor(hex),
    // Foreground for the header (white on dark headers, dark on light ones)
    "--header-fg": onColor(hex),
    "--header-blob2": hexToRgba(darken(hex, 0.3), 0.25),
  };
}