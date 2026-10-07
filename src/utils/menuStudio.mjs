// ─────────────────────────────────────────────────────────────
// Menu Studio — templates, sheet sizes and the design model.
//
// Pure data + helpers (no DOM, no Vue) so the same definitions drive the
// live preview, the exported PNG/PDF and the tiny template thumbnails.
//
// A "sheet" is described in its own units: print sizes in millimetres
// (A4 = 210 × 297 mm) and social sizes in pixels (1080 × 1080 px). The
// renderer scales the sheet to the target pixels, so one drawing routine
// covers both worlds.
// ─────────────────────────────────────────────────────────────

// Photo grid (blue) — the palette lives next to its custom painter in
// photoGridBlue.mjs; imported here only for the MENU_TEMPLATES registry
// that drives createDesign / withTemplate / thumbnails / the gallery.
import { PHOTO_GRID_BLUE_TEMPLATE } from "./photoGridBlue.mjs";

export const MM_PER_INCH = 25.4;
// Pixel presets are defined at this DPI (the classic CSS reference)
export const PX_DPI = 96;

// ─── SHEET SIZES ─────────────────────────────────────────────
export const SHEET_SIZES = [
  {
    key: "a4-portrait",
    kind: "print",
    w: 210,
    h: 297,
    unit: "mm",
    labelKey: "ms_size_a4",
    hintKey: "ms_size_a4_hint",
  },
  {
    key: "a4-landscape",
    kind: "print",
    w: 297,
    h: 210,
    unit: "mm",
    labelKey: "ms_size_a4_land",
    hintKey: "ms_size_a4_land_hint",
  },
  {
    key: "a3-portrait",
    kind: "print",
    w: 297,
    h: 420,
    unit: "mm",
    labelKey: "ms_size_a3",
    hintKey: "ms_size_a3_hint",
  },
  {
    key: "a5-portrait",
    kind: "print",
    w: 148,
    h: 210,
    unit: "mm",
    labelKey: "ms_size_a5",
    hintKey: "ms_size_a5_hint",
  },
  {
    key: "letter-portrait",
    kind: "print",
    w: 215.9,
    h: 279.4,
    unit: "mm",
    labelKey: "ms_size_letter",
    hintKey: "ms_size_letter_hint",
  },
  {
    key: "square",
    kind: "digital",
    w: 1080,
    h: 1080,
    unit: "px",
    labelKey: "ms_size_square",
    hintKey: "ms_size_square_hint",
  },
  {
    key: "post-portrait",
    kind: "digital",
    w: 1080,
    h: 1350,
    unit: "px",
    labelKey: "ms_size_post",
    hintKey: "ms_size_post_hint",
  },
  {
    key: "story",
    kind: "digital",
    w: 1080,
    h: 1920,
    unit: "px",
    labelKey: "ms_size_story",
    hintKey: "ms_size_story_hint",
  },
  {
    key: "wide",
    kind: "digital",
    w: 1920,
    h: 1080,
    unit: "px",
    labelKey: "ms_size_wide",
    hintKey: "ms_size_wide_hint",
  },
  {
    key: "custom",
    kind: "custom",
    w: 210,
    h: 297,
    unit: "mm",
    labelKey: "ms_size_custom",
    hintKey: "ms_size_custom_hint",
  },
];

// Export quality — print sheets use DPI, pixel sheets a multiplier
export const EXPORT_QUALITIES = [
  { key: "standard", labelKey: "ms_q_standard", dpi: 150, mult: 1 },
  { key: "high", labelKey: "ms_q_high", dpi: 300, mult: 2 },
  { key: "ultra", labelKey: "ms_q_ultra", dpi: 450, mult: 3 },
];

// Canvas safety limits (Chrome/Safari refuse very large bitmaps)
const MAX_SIDE = 8192;
const MAX_AREA = 40000000;

// ─── TEMPLATES ───────────────────────────────────────────────
// Every template = palette + font pairing + drawing strategy for the
// background decoration, the header, the section titles and the item rows.
// ORDER MATTERS: index 0 is the DEFAULT_DESIGN palette and the
// templateById() fallback for unknown ids — keep "classic" first.
export const MENU_TEMPLATES = [
  {
    id: "classic",
    nameKey: "ms_tpl_classic",
    descKey: "ms_tpl_classic_desc",
    font: "hanuman",
    columns: 2,
    images: false,
    colors: {
      bg: "#fdf8ef",
      panel: "#ffffff",
      ink: "#3a2f22",
      muted: "#8a7a63",
      accent: "#b8860b",
      line: "#e0d3ba",
    },
    style: {
      pattern: "none",
      frame: "double",
      header: "center",
      section: "label",
      item: "leader",
      radius: 0.4,
    },
  },
  {
    id: "modern",
    nameKey: "ms_tpl_modern",
    descKey: "ms_tpl_modern_desc",
    font: "kantumruy",
    columns: 2,
    images: false,
    colors: {
      bg: "#ffffff",
      panel: "#f8fafc",
      ink: "#0f172a",
      muted: "#64748b",
      accent: "#0f766e",
      line: "#e2e8f0",
    },
    style: {
      pattern: "dots",
      frame: "bar-top",
      header: "band",
      section: "bar",
      item: "pill",
      radius: 1,
      bandGradient: true,
      bandDecor: true,
      itemDivider: true,
    },
  },
  {
    id: "minimal",
    nameKey: "ms_tpl_minimal",
    descKey: "ms_tpl_minimal_desc",
    font: "kantumruy",
    columns: 2,
    images: false,
    colors: {
      bg: "#ffffff",
      panel: "#fafafa",
      ink: "#111111",
      muted: "#8a8a8a",
      accent: "#111111",
      line: "#e8e8e8",
    },
    style: {
      pattern: "none",
      frame: "none",
      header: "left",
      section: "hairline",
      item: "row",
      radius: 0,
    },
  },
  {
    id: "magazine",
    nameKey: "ms_tpl_magazine",
    descKey: "ms_tpl_magazine_desc",
    font: "mix",
    columns: 3,
    images: false,
    colors: {
      bg: "#fffbf5",
      panel: "#ffffff",
      ink: "#1c1917",
      muted: "#8b7d70",
      accent: "#e11d48",
      line: "#eadfd3",
    },
    style: {
      pattern: "none",
      frame: "double",
      header: "center",
      section: "numbered",
      item: "leader",
      radius: 0.3,
    },
  },
  {
    id: "neon",
    nameKey: "ms_tpl_neon",
    descKey: "ms_tpl_neon_desc",
    font: "kantumruy",
    columns: 2,
    images: false,
    colors: {
      bg: "#0b1020",
      panel: "#141b2f",
      ink: "#e8eefc",
      muted: "#93a2c4",
      accent: "#22d3ee",
      line: "#1e2740",
    },
    style: {
      pattern: "rays",
      frame: "none",
      header: "band",
      section: "chip",
      item: "card",
      radius: 1,
      glow: true,
      bandGradient: true,
    },
  },
  {
    id: "bloom",
    nameKey: "ms_tpl_bloom",
    descKey: "ms_tpl_bloom_desc",
    font: "kantumruy",
    columns: 2,
    images: false,
    colors: {
      bg: "#fff5f7",
      panel: "#ffffff",
      ink: "#3b1f2b",
      muted: "#9a7181",
      accent: "#db2777",
      line: "#fbd3e0",
    },
    style: {
      pattern: "rays",
      frame: "none",
      header: "badge",
      section: "chip",
      item: "pill",
      radius: 1,
      itemDivider: true,
    },
  },
  {
    id: "elegant",
    nameKey: "ms_tpl_elegant",
    descKey: "ms_tpl_elegant_desc",
    font: "mix",
    columns: 2,
    images: false,
    colors: {
      bg: "#14181f",
      panel: "#1c2230",
      ink: "#f5f1e8",
      muted: "#9aa4b2",
      accent: "#d4af37",
      line: "#2b3243",
    },
    style: {
      pattern: "none",
      frame: "thin",
      header: "center",
      section: "ornament",
      item: "row",
      radius: 0.4,
    },
  },
  {
    id: "fresh",
    nameKey: "ms_tpl_fresh",
    descKey: "ms_tpl_fresh_desc",
    font: "kantumruy",
    columns: 2,
    images: true,
    colors: {
      bg: "#f0fdf9",
      panel: "#ffffff",
      ink: "#0f2e2a",
      muted: "#5f7d78",
      accent: "#0d9488",
      line: "#ccece6",
    },
    style: {
      pattern: "rays",
      frame: "none",
      header: "badge",
      section: "chip",
      item: "photo",
      radius: 0.9,
    },
  },
  {
    id: "bistro",
    nameKey: "ms_tpl_bistro",
    descKey: "ms_tpl_bistro_desc",
    font: "mix",
    columns: 2,
    images: true,
    colors: {
      bg: "#fffaf4",
      panel: "#ffffff",
      ink: "#2b2018",
      muted: "#7c6f63",
      accent: "#c2410c",
      line: "#f0e2d2",
    },
    style: {
      pattern: "none",
      frame: "bar-top",
      header: "center",
      section: "bar",
      item: "photo-card",
      radius: 0.7,
    },
  },
  {
    id: "khmer",
    nameKey: "ms_tpl_khmer",
    descKey: "ms_tpl_khmer_desc",
    font: "hanuman",
    columns: 1,
    images: false,
    colors: {
      bg: "#fffdf5",
      panel: "#ffffff",
      ink: "#2f2a1e",
      muted: "#87795c",
      accent: "#b91c1c",
      line: "#e8dcbb",
    },
    style: {
      pattern: "kbach",
      frame: "ornate",
      header: "center",
      section: "ornament",
      item: "leader",
      radius: 0.4,
    },
  },
  {
    id: "modernKhmer",
    nameKey: "ms_tpl_modern_khmer",
    descKey: "ms_tpl_modern_khmer_desc",
    font: "hanuman",
    columns: 2,
    images: true,
    sizeKey: "a5-portrait",
    fontScale: 1,
    margins: 1,
    colors: {
      bg: "#ffffff",
      panel: "#ffffff",
      ink: "#242a29",
      muted: "#78817e",
      accent: "#287b69",
      line: "#b7d0c8",
      headerBg: "#ffffff",
      headerInk: "#242a29",
    },
    style: {
      pattern: "none",
      frame: "none",
      header: "center",
      section: "hairline",
      item: "row",
      radius: 0.6,
    },
  },
  {
    id: PHOTO_GRID_BLUE_TEMPLATE.id,
    nameKey: PHOTO_GRID_BLUE_TEMPLATE.nameKey,
    descKey: PHOTO_GRID_BLUE_TEMPLATE.descKey,
    tag: PHOTO_GRID_BLUE_TEMPLATE.tag,
    font: "kantumruy",
    columns: PHOTO_GRID_BLUE_TEMPLATE.defaults.columns,
    images: PHOTO_GRID_BLUE_TEMPLATE.defaults.showImages,
    fontScale: PHOTO_GRID_BLUE_TEMPLATE.defaults.fontScale,
    margins: PHOTO_GRID_BLUE_TEMPLATE.defaults.margins,
    colors: { ...PHOTO_GRID_BLUE_TEMPLATE.defaults.colors },
    style: {
      pattern: "none",
      frame: "none",
      header: "band",
      section: "bar",
      item: "photo-card",
      radius: 0.7,
    },
  },
  // ── New distinctive styles ──────────────────────────────────
  {
    id: "sunset",
    nameKey: "ms_tpl_sunset",
    descKey: "ms_tpl_sunset_desc",
    tag: "new",
    font: "kantumruy",
    columns: 2,
    images: false,
    colors: {
      bg: "#fff7ed",
      panel: "#ffffff",
      ink: "#431407",
      muted: "#9a3412",
      accent: "#ea580c",
      line: "#fed7aa",
    },
    style: {
      pattern: "rays",
      frame: "none",
      header: "badge",
      section: "chip",
      item: "pill",
      radius: 1,
      itemDivider: true,
    },
  },
  {
    id: "ocean",
    nameKey: "ms_tpl_ocean",
    descKey: "ms_tpl_ocean_desc",
    font: "kantumruy",
    columns: 2,
    images: false,
    colors: {
      bg: "#f0f9ff",
      panel: "#ffffff",
      ink: "#0c4a6e",
      muted: "#5280a3",
      accent: "#0284c7",
      line: "#bae6fd",
    },
    style: {
      pattern: "dots",
      frame: "thin",
      header: "band",
      section: "bar",
      item: "card",
      radius: 1,
      bandGradient: true,
    },
  },
  {
    id: "terracotta",
    nameKey: "ms_tpl_terracotta",
    descKey: "ms_tpl_terracotta_desc",
    font: "hanuman",
    columns: 1,
    images: false,
    colors: {
      bg: "#fdf1e7",
      panel: "#fffaf6",
      ink: "#3c1810",
      muted: "#8a5a44",
      accent: "#a0522d",
      line: "#ecd5c4",
    },
    style: {
      pattern: "dots",
      frame: "double",
      header: "left",
      section: "label",
      item: "leader",
      radius: 0.4,
    },
  },
  {
    id: "monochrome",
    nameKey: "ms_tpl_monochrome",
    descKey: "ms_tpl_monochrome_desc",
    font: "mix",
    columns: 3,
    images: false,
    colors: {
      bg: "#ffffff",
      panel: "#f5f5f5",
      ink: "#0a0a0a",
      muted: "#6b6b6b",
      accent: "#000000",
      line: "#d4d4d4",
    },
    style: {
      pattern: "none",
      frame: "double",
      header: "center",
      section: "numbered",
      item: "row",
      radius: 0,
    },
  },
  {
    id: "candy",
    nameKey: "ms_tpl_candy",
    descKey: "ms_tpl_candy_desc",
    font: "kantumruy",
    columns: 3,
    images: false,
    colors: {
      bg: "#fdf4ff",
      panel: "#ffffff",
      ink: "#4a044e",
      muted: "#86198f",
      accent: "#d946ef",
      line: "#f5d0fe",
    },
    style: {
      pattern: "rays",
      frame: "none",
      header: "center",
      section: "chip",
      item: "pill",
      radius: 1,
      glow: true,
    },
  },
  {
    id: "coffee",
    nameKey: "ms_tpl_coffee",
    descKey: "ms_tpl_coffee_desc",
    font: "mix",
    columns: 2,
    images: false,
    colors: {
      bg: "#f7f2ec",
      panel: "#ffffff",
      ink: "#2b1b10",
      muted: "#7a6455",
      accent: "#6f4e37",
      line: "#e3d5c8",
    },
    style: {
      pattern: "none",
      frame: "bar-top",
      header: "left",
      section: "bar",
      item: "leader",
      radius: 0.5,
      itemDivider: true,
    },
  },
  {
    id: "forest",
    nameKey: "ms_tpl_forest",
    descKey: "ms_tpl_forest_desc",
    tag: "new",
    font: "kantumruy",
    columns: 2,
    images: true,
    colors: {
      bg: "#f2f8f0",
      panel: "#ffffff",
      ink: "#14331c",
      muted: "#5c7a5f",
      accent: "#2f855a",
      line: "#cfe3cf",
    },
    style: {
      pattern: "rays",
      frame: "thin",
      header: "badge",
      section: "ornament",
      item: "photo",
      radius: 0.8,
    },
  },
  {
    id: "mint",
    nameKey: "ms_tpl_mint",
    descKey: "ms_tpl_mint_desc",
    font: "kantumruy",
    columns: 3,
    images: false,
    colors: {
      bg: "#effcf6",
      panel: "#ffffff",
      ink: "#0b3d31",
      muted: "#4f7a6c",
      accent: "#10b981",
      line: "#c3eee0",
    },
    style: {
      pattern: "dots",
      frame: "none",
      header: "band",
      section: "chip",
      item: "pill",
      radius: 1,
      bandGradient: true,
      bandDecor: true,
    },
  },
  {
    id: "royal",
    nameKey: "ms_tpl_royal",
    descKey: "ms_tpl_royal_desc",
    font: "mix",
    columns: 1,
    images: false,
    colors: {
      bg: "#faf7ff",
      panel: "#ffffff",
      ink: "#2b1a5e",
      muted: "#6f63a3",
      accent: "#6d28d9",
      line: "#ddd3f7",
    },
    style: {
      pattern: "kbach",
      frame: "ornate",
      header: "center",
      section: "ornament",
      item: "leader",
      radius: 0.5,
    },
  },
  {
    id: "noir",
    nameKey: "ms_tpl_noir",
    descKey: "ms_tpl_noir_desc",
    font: "kantumruy",
    columns: 2,
    images: false,
    colors: {
      bg: "#0c0c0e",
      panel: "#17171a",
      ink: "#f4f4f5",
      muted: "#a1a1aa",
      accent: "#f5c518",
      line: "#2a2a2e",
    },
    style: {
      pattern: "rays",
      frame: "thin",
      header: "band",
      section: "numbered",
      item: "card",
      radius: 0.6,
      glow: true,
      bandGradient: true,
    },
  },
  {
    id: "sakura",
    nameKey: "ms_tpl_sakura",
    descKey: "ms_tpl_sakura_desc",
    tag: "new",
    font: "kantumruy",
    columns: 2,
    images: false,
    colors: {
      bg: "#fff5f7",
      panel: "#ffffff",
      ink: "#5c1a2e",
      muted: "#a8707f",
      accent: "#f472b6",
      line: "#f9d5e0",
    },
    style: {
      pattern: "dots",
      frame: "double",
      header: "badge",
      section: "hairline",
      item: "pill",
      radius: 1,
      itemDivider: true,
    },
  },
  {
    id: "retro",
    nameKey: "ms_tpl_retro",
    descKey: "ms_tpl_retro_desc",
    font: "hanuman",
    columns: 2,
    images: false,
    colors: {
      bg: "#fdf6e3",
      panel: "#fffaf0",
      ink: "#3f3218",
      muted: "#8f7f52",
      accent: "#d97706",
      line: "#ecd9a8",
    },
    style: {
      pattern: "kbach",
      frame: "double",
      header: "center",
      section: "label",
      item: "leader",
      radius: 0.3,
    },
  },
  {
    id: "harbor",
    nameKey: "ms_tpl_harbor",
    descKey: "ms_tpl_harbor_desc",
    font: "kantumruy",
    columns: 3,
    images: false,
    colors: {
      bg: "#f4f7fa",
      panel: "#ffffff",
      ink: "#1b2a3a",
      muted: "#5f7183",
      accent: "#334155",
      line: "#d5dfea",
    },
    style: {
      pattern: "none",
      frame: "bar-top",
      header: "band",
      section: "bar",
      item: "row",
      radius: 0.7,
      bandDecor: true,
      itemDivider: true,
    },
  },
  {
    id: "amber",
    nameKey: "ms_tpl_amber",
    descKey: "ms_tpl_amber_desc",
    tag: "new",
    font: "mix",
    columns: 2,
    images: false,
    colors: {
      bg: "#fff7e6",
      panel: "#ffffff",
      ink: "#451a03",
      muted: "#92600a",
      accent: "#f59e0b",
      line: "#fcd34d",
    },
    style: {
      pattern: "rays",
      frame: "ornate",
      header: "badge",
      section: "chip",
      item: "pill",
      radius: 1,
      glow: true,
    },
  },
  {
    id: "glacier",
    nameKey: "ms_tpl_glacier",
    descKey: "ms_tpl_glacier_desc",
    font: "kantumruy",
    columns: 3,
    images: false,
    colors: {
      bg: "#f0fbff",
      panel: "#ffffff",
      ink: "#082f49",
      muted: "#5e8aa4",
      accent: "#06b6d4",
      line: "#cdeefb",
    },
    style: {
      pattern: "dots",
      frame: "thin",
      header: "band",
      section: "hairline",
      item: "card",
      radius: 0.9,
      bandGradient: true,
    },
  },
  {
    id: "curry",
    nameKey: "ms_tpl_curry",
    descKey: "ms_tpl_curry_desc",
    font: "hanuman",
    columns: 1,
    images: false,
    colors: {
      bg: "#fef9c3",
      panel: "#fffdf5",
      ink: "#422006",
      muted: "#8a5a06",
      accent: "#ca8a04",
      line: "#fde047",
    },
    style: {
      pattern: "kbach",
      frame: "double",
      header: "left",
      section: "numbered",
      item: "row",
      radius: 0.4,
      itemDivider: true,
    },
  },
  {
    id: "lavender",
    nameKey: "ms_tpl_lavender",
    descKey: "ms_tpl_lavender_desc",
    font: "kantumruy",
    columns: 2,
    images: false,
    colors: {
      bg: "#f5f3ff",
      panel: "#ffffff",
      ink: "#2e1065",
      muted: "#7c6ba8",
      accent: "#a78bfa",
      line: "#ddd6fe",
    },
    style: {
      pattern: "none",
      frame: "bar-top",
      header: "center",
      section: "bar",
      item: "pill",
      radius: 1,
      bandGradient: true,
    },
  },
  {
    id: "berry",
    nameKey: "ms_tpl_berry",
    descKey: "ms_tpl_berry_desc",
    tag: "new",
    font: "mix",
    columns: 2,
    images: false,
    colors: {
      bg: "#fff1f5",
      panel: "#ffffff",
      ink: "#4c0519",
      muted: "#9d174d",
      accent: "#e11d48",
      line: "#fecdd3",
    },
    style: {
      pattern: "kbach",
      frame: "thin",
      header: "badge",
      section: "ornament",
      item: "leader",
      radius: 0.6,
    },
  },
  {
    id: "carnival",
    nameKey: "ms_tpl_carnival",
    descKey: "ms_tpl_carnival_desc",
    tag: "new",
    font: "kantumruy",
    columns: 3,
    images: false,
    colors: {
      bg: "#fffde7",
      panel: "#ffffff",
      ink: "#1e1b4b",
      muted: "#6d28d9",
      accent: "#e11d48",
      line: "#fde047",
    },
    style: {
      pattern: "rays",
      frame: "none",
      header: "band",
      section: "chip",
      item: "row",
      radius: 0.8,
      bandDecor: true,
      glow: true,
    },
  },
  {
    id: "arcade",
    nameKey: "ms_tpl_arcade",
    descKey: "ms_tpl_arcade_desc",
    tag: "new",
    font: "kantumruy",
    columns: 2,
    images: false,
    colors: {
      bg: "#150b2e",
      panel: "#1f1140",
      ink: "#f5d0fe",
      muted: "#c4b5fd",
      accent: "#22d3ee",
      line: "#3b1d75",
    },
    style: {
      pattern: "dots",
      frame: "thin",
      header: "band",
      section: "chip",
      item: "card",
      radius: 0.9,
      glow: true,
      bandGradient: true,
    },
  },
];

export const FONT_OPTIONS = [
  { key: "hanuman", labelKey: "ms_font_hanuman" },
  { key: "kantumruy", labelKey: "ms_font_kantumruy" },
  { key: "mix", labelKey: "ms_font_mix" },
  { key: "battambang", labelKey: "ms_font_battambang" },
  { key: "koulen", labelKey: "ms_font_koulen" },
  { key: "moul", labelKey: "ms_font_moul" },
  { key: "siemreap", labelKey: "ms_font_siemreap" },
];

export const COLOR_FIELDS = [
  { key: "bg", labelKey: "ms_color_bg" },
  { key: "panel", labelKey: "ms_color_panel" },
  { key: "accent", labelKey: "ms_color_accent" },
  { key: "ink", labelKey: "ms_color_ink" },
  { key: "muted", labelKey: "ms_color_muted" },
  { key: "line", labelKey: "ms_color_line" },
];

export function templateById(id) {
  return MENU_TEMPLATES.find((t) => t.id === id) || MENU_TEMPLATES[0];
}

export function sizeByKey(key) {
  return SHEET_SIZES.find((s) => s.key === key) || SHEET_SIZES[0];
}

// ─── DESIGN MODEL ────────────────────────────────────────────
// Everything the editor remembers. Persisted as JSON (server + localStorage).
export const DEFAULT_DESIGN = {
  version: 1,
  template: "classic",
  sizeKey: "a4-portrait",
  orientation: "portrait",
  custom: { w: 210, h: 297, unit: "mm" },
  colors: { ...MENU_TEMPLATES[0].colors },
  font: "hanuman",
  columns: 2,
  fontScale: 1,
  titleScale: 1,
  categoryScale: 1,
  itemScale: 1,
  logoScale: 1,
  itemImageScale: 1,
  qrScale: 1,
  margins: 1,
  showLogo: true,
  logoShape: "circle",
  showImages: false,
  showPrice: true,
  showQr: true,
  showBrand: false,
  hideUnavailable: true,
  currency: "auto",
  quality: "high",
  title: "",
  subtitle: "",
  contact: "",
  footerNote: "",
  categoryIds: [],
};

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const clamp = (n, min, max, fallback) => {
  const v = Number(n);
  if (!Number.isFinite(v)) return fallback;
  return Math.min(max, Math.max(min, v));
};
const oneOf = (value, list, fallback) =>
  list.includes(value) ? value : fallback;
const hex = (value, fallback) =>
  typeof value === "string" && HEX_RE.test(value.trim())
    ? value.trim().toLowerCase()
    : fallback;

// A brand-new design for a template (palette/font/columns come from it)
export function createDesign(templateId = "classic") {
  const tpl = templateById(templateId);
  return {
    ...DEFAULT_DESIGN,
    template: tpl.id,
    sizeKey: tpl.sizeKey || DEFAULT_DESIGN.sizeKey,
    colors: { ...tpl.colors },
    font: tpl.font,
    columns: tpl.columns,
    fontScale: tpl.fontScale ?? DEFAULT_DESIGN.fontScale,
    margins: tpl.margins ?? DEFAULT_DESIGN.margins,
    showImages: tpl.images,
    custom: { ...DEFAULT_DESIGN.custom },
    categoryIds: [],
  };
}

// Switching template keeps the owner's own texts / size / toggles and only
// swaps the look (palette, font pairing, layout strategy).
export function withTemplate(design, templateId) {
  const tpl = templateById(templateId);
  return {
    ...design,
    template: tpl.id,
    colors: { ...tpl.colors },
    font: tpl.font,
    columns: tpl.columns,
    showImages: tpl.images,
  };
}

// Any stored / incoming design passes through here before it is used, so a
// broken or outdated payload can never crash the renderer.
export function normalizeDesign(raw) {
  const base = createDesign(raw?.template);
  const src = raw && typeof raw === "object" ? raw : {};
  const tpl = templateById(src.template || base.template);

  const colors = {};
  for (const [key, value] of Object.entries(base.colors)) {
    colors[key] = hex(src.colors?.[key], value);
  }

  const unit = oneOf(src.custom?.unit, ["mm", "cm", "in", "px"], "mm");
  const maxW = unit === "px" ? 8000 : unit === "in" ? 80 : 2000;
  const minW = unit === "px" ? 200 : 3;

  return {
    version: 1,
    template: tpl.id,
    sizeKey: oneOf(
      src.sizeKey,
      SHEET_SIZES.map((s) => s.key),
      tpl.sizeKey || "a4-portrait",
    ),
    orientation: oneOf(src.orientation, ["portrait", "landscape"], "portrait"),
    custom: {
      w: clamp(src.custom?.w, minW, maxW, 210),
      h: clamp(src.custom?.h, minW, maxW, 297),
      unit,
    },
    colors,
    font: oneOf(
      src.font,
      FONT_OPTIONS.map((f) => f.key),
      tpl.font,
    ),
    columns: Math.round(clamp(src.columns, 1, 5, tpl.columns)),
    fontScale: clamp(src.fontScale, 0.7, 1.5, 1),
    titleScale: clamp(src.titleScale, 0.3, 1.5, 1),
    categoryScale: clamp(src.categoryScale, 0.3, 1.5, 1),
    itemScale: clamp(src.itemScale, 0.3, 1.5, 1),
    logoScale: clamp(src.logoScale, 0.3, 1.5, 1),
    itemImageScale: clamp(src.itemImageScale, 0.3, 1.5, 1),
    qrScale: clamp(src.qrScale, 0.3, 1.5, 1),
    margins: clamp(src.margins, 0.5, 1.8, 1),
    showLogo: src.showLogo !== false,
    logoShape: oneOf(src.logoShape, ["circle", "square", "none"], "circle"),
    showImages: src.showImages === true,
    showPrice: src.showPrice !== false,
    showQr: src.showQr === true,
    showBrand: src.showBrand === true,
    hideUnavailable: src.hideUnavailable !== false,
    currency: oneOf(src.currency, ["auto", "KHR", "USD"], "auto"),
    quality: oneOf(
      src.quality,
      EXPORT_QUALITIES.map((q) => q.key),
      "high",
    ),
    title: String(src.title || "").slice(0, 120),
    subtitle: String(src.subtitle || "").slice(0, 160),
    contact: String(src.contact || "").slice(0, 200),
    footerNote: String(src.footerNote || "").slice(0, 200),
    categoryIds: Array.isArray(src.categoryIds)
      ? src.categoryIds.map((id) => String(id)).slice(0, 60)
      : [],
  };
}

export function qualityByKey(key) {
  return EXPORT_QUALITIES.find((q) => q.key === key) || EXPORT_QUALITIES[1];
}

// ─── SHEET MATH ──────────────────────────────────────────────
// "Sheet" = the physical/logical page the menu is drawn on:
//   { w, h, unit: 'mm' | 'px', kind: 'print' | 'digital' | 'custom' }
// Orientation rotates print presets (a custom size is taken as typed).
export function resolveSheet(design) {
  const preset = sizeByKey(design?.sizeKey);
  const isCustom = preset.kind === "custom";

  let w = isCustom ? Number(design?.custom?.w) : preset.w;
  let h = isCustom ? Number(design?.custom?.h) : preset.h;
  let unit = isCustom ? design?.custom?.unit || "mm" : preset.unit;
  if (!Number.isFinite(w) || w <= 0) w = preset.w;
  if (!Number.isFinite(h) || h <= 0) h = preset.h;

  const wantsLandscape = design?.orientation === "landscape";
  const isLandscape = w > h;
  if (wantsLandscape !== isLandscape) [w, h] = [h, w];

  // Normalise to millimetres + pixels so the renderer only sees one world
  const factor = unit === "mm" ? 1 : unit === "cm" ? 10 : unit === "in" ? 25.4 : 0;
  const inMm = unit === "px" ? false : true;
  const wMm = inMm ? w * factor : (w / PX_DPI) * MM_PER_INCH;
  const hMm = inMm ? h * factor : (h / PX_DPI) * MM_PER_INCH;

  return {
    key: preset.key,
    kind: preset.kind,
    unit,
    // the numbers the owner typed / picked (mm, cm, in or px)
    w,
    h,
    wMm,
    hMm,
    landscape: wantsLandscape,
    ratio: w / h,
  };
}

// Pixel size of a rendered sheet (preview or export)
export function sheetPixels(sheet, qualityKey = "high") {
  const q = qualityByKey(qualityKey);
  let w, h;
  if (sheet.unit === "px") {
    w = Math.round(sheet.w * q.mult);
    h = Math.round(sheet.h * q.mult);
  } else {
    w = Math.round((sheet.wMm / MM_PER_INCH) * q.dpi);
    h = Math.round((sheet.hMm / MM_PER_INCH) * q.dpi);
  }

  // Keep the bitmap inside the browser's canvas limits
  let capped = false;
  const sideScale = Math.min(1, MAX_SIDE / Math.max(w, h));
  const areaScale = Math.min(1, Math.sqrt(MAX_AREA / (w * h)));
  const scale = Math.min(sideScale, areaScale);
  if (scale < 1) {
    w = Math.max(1, Math.floor(w * scale));
    h = Math.max(1, Math.floor(h * scale));
    capped = true;
  }
  return { w, h, capped };
}

// ─── FONTS ───────────────────────────────────────────────────
// Fonts are loaded by index.html (Google Fonts). Khmer needs a Khmer-capable
// family — the fallback chain keeps it readable offline.
const KH = '"Hanuman","Kantumruy Pro","Noto Sans Khmer","Khmer OS",sans-serif';
const KH_MODERN = '"Kantumruy Pro","Hanuman","Noto Sans Khmer",sans-serif';
const KH_BATTAMBANG = '"Battambang","Hanuman","Noto Sans Khmer",sans-serif';
const KH_KOULEN = '"Koulen","Hanuman","Noto Sans Khmer",sans-serif';
const KH_MOUL = '"Moul","Hanuman","Noto Sans Khmer",sans-serif';
const KH_SIEMREAP = '"Siemreap","Hanuman","Noto Sans Khmer",sans-serif';

export const MENU_FONT_STACKS = {
  hanuman: { heading: KH, body: KH },
  kantumruy: { heading: KH_MODERN, body: KH_MODERN },
  mix: { heading: KH, body: KH_MODERN },
  battambang: { heading: KH_BATTAMBANG, body: KH_BATTAMBANG },
  koulen: { heading: KH_KOULEN, body: KH_KOULEN },
  moul: { heading: KH_MOUL, body: KH_MOUL },
  siemreap: { heading: KH_SIEMREAP, body: KH_SIEMREAP },
};

export function fontStack(design, kind = "body") {
  const pair = MENU_FONT_STACKS[design?.font] || MENU_FONT_STACKS.hanuman;
  return kind === "heading" ? pair.heading : pair.body;
}

// ─── COLOUR HELPERS ──────────────────────────────────────────
export function hexToRgb(value) {
  let v = String(value || "").replace("#", "").trim();
  if (v.length === 3)
    v = v
      .split("")
      .map((c) => c + c)
      .join("");
  if (v.length !== 6 || /[^0-9a-f]/i.test(v)) return { r: 0, g: 0, b: 0 };
  const n = parseInt(v, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function withAlpha(value, alpha) {
  const { r, g, b } = hexToRgb(value);
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, alpha))})`;
}

// Mix `a` towards `b` by `t` (0..1) — used for soft tints of the accent
export function mixHex(a, b, t) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  const p = Math.max(0, Math.min(1, t));
  const to = (x, y) => Math.round(x + (y - x) * p);
  const toHex = (n) => n.toString(16).padStart(2, "0");
  return `#${toHex(to(A.r, B.r))}${toHex(to(A.g, B.g))}${toHex(to(A.b, B.b))}`;
}

export function isLight(value) {
  const { r, g, b } = hexToRgb(value);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62;
}

// Readable text colour on top of `bg`
export function onColor(bg, dark = "#111827", light = "#ffffff") {
  return isLight(bg) ? dark : light;
}

// ─── LOCAL STORAGE (draft per restaurant) ────────────────────
const draftKey = (restaurantId) =>
  `menu_studio_design_${restaurantId || "default"}`;

export function loadDraft(restaurantId) {
  try {
    const raw = localStorage.getItem(draftKey(restaurantId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveDraft(restaurantId, design) {
  try {
    localStorage.setItem(draftKey(restaurantId), JSON.stringify(design));
  } catch {
    /* storage full / private mode — the draft simply is not cached */
  }
}

export function clearDraft(restaurantId) {
  try {
    localStorage.removeItem(draftKey(restaurantId));
  } catch {
    /* ignore */
  }
}

// ─── MISC ────────────────────────────────────────────────────
export function slugify(value, fallback = "menu") {
  const s = String(value || "")
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return s || fallback;
}
