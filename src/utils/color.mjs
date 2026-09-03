// frontend/src/utils/color.mjs
// Pure color helpers used by the dynamic theme (stores/theme.js).
// .mjs so they can also be unit-tested directly with Node.

export function hexToRgb(hex) {
  const h = normalizeHex(hex);
  if (!h) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(h.slice(1, 3), 16),
    g: parseInt(h.slice(3, 5), 16),
    b: parseInt(h.slice(5, 7), 16),
  };
}

export function rgbToHex(r, g, b) {
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
  const to2 = (v) => clamp(v).toString(16).padStart(2, "0");
  return `#${to2(r)}${to2(g)}${to2(b)}`;
}

// Accepts "#abc", "abc", "#aabbcc", "AABBCC" → "#aabbcc", or null when invalid
export function normalizeHex(input) {
  if (typeof input !== "string") return null;
  let hex = input.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;
  return `#${hex.toLowerCase()}`;
}

export function isValidHex(hex) {
  return typeof hex === "string" && /^#[0-9a-f]{6}$/.test(hex);
}

// Blend two colors. t = 0 → hexA, t = 1 → hexB
export function mix(hexA, hexB, t = 0.5) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const ch = (x, y) => Math.round(x + (y - x) * t);
  return rgbToHex(ch(a.r, b.r), ch(a.g, b.g), ch(a.b, b.b));
}

export function hexToRgba(hex, alpha = 1) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Lighten toward white (t = 0..1)
export function lighten(hex, t) {
  return mix(hex, "#ffffff", t);
}

// Darken toward black (t = 0..1)
export function darken(hex, t) {
  return mix(hex, "#000000", t);
}

// WCAG-relative luminance of a hex color (0 = black … 1 = white)
export function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const toLin = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
}

// True when a color is light enough that white text on it would be unreadable
export function isLightColor(hex) {
  return relativeLuminance(hex) > 0.6;
}

// Foreground color to place ON a primary-colored background.
// Dark primaries → white text; light/white primaries → dark text.
export function onColor(hex) {
  if (!isValidHex(normalizeHex(hex))) return "#ffffff";
  return isLightColor(hex) ? darken(hex, 0.8) : "#ffffff";
}

// An accent/border/icon variant that is always visible on white surfaces.
// Light primaries get darkened just enough to read; dark primaries pass through.
export function strongColor(hex) {
  if (!isValidHex(normalizeHex(hex))) return hex;
  return isLightColor(hex) ? darken(hex, 0.55) : hex;
}
