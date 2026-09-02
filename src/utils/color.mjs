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
