// Shared palette tokens derived from a restaurant's primary theme color
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
  "--glow-soft",
  "--glow-strong",
  "--shadow-tint",
  "--shadow-tint-soft",
  "--modal-overlay",
];

// Returns a map of CSS custom-property → color, or null when input is invalid
export function buildThemePalette(input) {
  const hex = normalizeHex(input);
  if (!hex) return null;
  const strong = strongColor(hex);
  return {
    "--green-mid": hex,
    "--green-light": lighten(hex, 0.18),
    "--green-dark": darken(hex, 0.28),
    "--green-soft": lighten(hex, 0.66),
    "--green-pale": lighten(hex, 0.93),
    "--green-strong": strong,
    "--on-primary": onColor(hex),
    "--header-fg": onColor(hex),
    "--header-blob2": hexToRgba(darken(hex, 0.3), 0.25),
    "--glow-soft": hexToRgba(strong, 0.16),
    "--glow-strong": hexToRgba(strong, 0.3),
    "--shadow-tint": hexToRgba(darken(hex, 0.3), 0.16),
    "--shadow-tint-soft": hexToRgba(darken(hex, 0.3), 0.08),
    "--modal-overlay": hexToRgba(darken(hex, 0.55), 0.55),
  };
}
