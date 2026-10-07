// ─────────────────────────────────────────────────────────────
// Menu Studio — the "generate menu" editor state.
//
// Builds the menu data from the foods store, keeps the design (draft in
// localStorage, saved copies on the server), loads every asset the renderer
// needs (fonts + photos + poster QR) and runs the export actions.
// Module-level refs = one shared source, same pattern as useAdmin*.
// ─────────────────────────────────────────────────────────────
import { ref, computed, watch } from "vue";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { useFoodsStore } from "@/stores/foods";
import { useI18nStore } from "@/stores/i18n";
import { useCurrencyStore } from "@/stores/currency";
import { formatMoney } from "@/utils/currency.mjs";
import {
  createDesign,
  normalizeDesign,
  withTemplate,
  resolveSheet,
  sheetPixels,
  loadDraft,
  saveDraft,
  clearDraft,
  slugify,
} from "@/utils/menuStudio.mjs";
import { renderMenuToCanvas } from "@/utils/menuRender.mjs";
import {
  canvasToBlob,
  dataUrlToBytes,
  downloadBlob,
  jpegsToPdfBlob,
  printSheets,
  copyCanvasToClipboard,
} from "@/utils/menuExport.mjs";
import { buildShareLinks } from "@/utils/share.mjs";

const API_BASE = import.meta.env.VITE_API_URL;
const auth = useAuthStore();
const foods = useFoodsStore();
const i18n = useI18nStore();
const currencyStore = useCurrencyStore();

// ─── STATE ───────────────────────────────────────────────────
export const design = ref(createDesign());
export const menuData = ref({
  restaurantName: "",
  logoUrl: "",
  categories: [],
  qrUrl: "",
  qrCaption: "",
  brandText: "",
});

export const dataLoading = ref(false);
export const assetsReady = ref(false);
export const assetTick = ref(0);
export const fitState = ref({ fit: 1, overflow: false });
export const menuPages = ref([]);
export const currentPage = ref(0);
const menuPageFitScale = ref(1);

export const designs = ref([]);
export const designsLoading = ref(false);
export const designsError = ref("");
export const designName = ref("");
export const activeDesignId = ref(null);
export const savingDesign = ref(false);
export const saveMsg = ref("");
export const saveError = ref("");

export const exporting = ref(false);
export const exportMsg = ref("");
export const exportError = ref("");

const qrDataUrl = ref("");
const qrFor = ref("");
const images = new Map();
let draftTimer = null;
let initializedFor = null;

// ─── DERIVED ─────────────────────────────────────────────────
export const sheet = computed(() => resolveSheet(design.value));
export const exportSize = computed(
  () => sheetPixels(sheet.value, design.value.quality),
);

// ─── PRICE + DATA ────────────────────────────────────────────
function formatPrice(value) {
  const cur = design.value.currency;
  if (cur === "auto") return currencyStore.fmt(value);
  return formatMoney(value, cur, currencyStore.rate);
}

function buildData() {
  const d = design.value;
  const allowed = new Set((d.categoryIds || []).map(String));
  const categories = [];

  for (const cat of foods.categories) {
    if (allowed.size && !allowed.has(String(cat.id))) continue;
    const items = foods.foods
      .filter((f) => String(f.category) === String(cat.id))
      .filter((f) => !(d.hideUnavailable && f.status === "unavailable"))
      .map((f) => ({
        id: f.id,
        name: f.name,
        priceText: formatPrice(Number(f.price) || 0),
        img: f.img_url || f.img || "",
        available: f.status !== "unavailable",
      }));
    if (items.length) {
      categories.push({
        id: cat.id,
        label: cat.label_km || cat.label || cat.name || "",
        items,
      });
    }
  }

  menuData.value = {
    restaurantName: auth.restaurant?.name || "",
    logoUrl: auth.restaurant?.logoUrl || "",
    categories,
    qrUrl: d.showQr ? qrDataUrl.value : "",
    qrCaption: i18n.t.ms_qr_caption || "Scan for the live menu",
    brandText: d.showBrand
      ? i18n.t.ms_powered_by || "Made with Digital Menu"
      : "",
  };
}

// ─── IMAGE / FONT LOADING ────────────────────────────────────
// ImageKit delivers resized copies through ?tr=w-N — smaller bitmaps keep
// the editor (and the export) fast.
function thumbUrl(url, width = 520) {
  if (!/^https?:\/\/ik\.imagekit\.io\//i.test(url)) return url;
  return url.includes("?") ? `${url}&tr=w-${width}` : `${url}?tr=w-${width}`;
}

// Try a CORS-clean load first (needed for the canvas export). If the host
// refuses CORS we keep the image for the preview only and skip it on export
// — the menu still exports, just without that photo.
function loadEntry(url) {
  const src = thumbUrl(url);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve({ img, corsOk: true });
    img.onerror = () => {
      const plain = new Image();
      plain.onload = () => resolve({ img: plain, corsOk: false });
      plain.onerror = () => resolve(null);
      plain.src = src;
    };
    img.src = src;
  });
}

async function loadImages(list) {
  const pending = list.filter((url) => url && !images.has(url));
  if (!pending.length) {
    assetTick.value += 1;
    return;
  }
  const results = await Promise.all(pending.map((url) => loadEntry(url)));
  results.forEach((entry, index) => {
    if (entry) images.set(pending[index], entry);
  });
  assetTick.value += 1;
}

async function ensureFonts() {
  if (typeof document === "undefined" || !document.fonts) return;
  const samples = [
    '700 48px "Hanuman"',
    '400 32px "Hanuman"',
    '500 32px "Hanuman"',
    '400 32px "Kantumruy Pro"',
    '500 32px "Kantumruy Pro"',
    '600 32px "Kantumruy Pro"',
    '700 32px "Kantumruy Pro"',
    '400 32px "Battambang"',
    '700 32px "Battambang"',
    '400 32px "Koulen"',
    '400 32px "Moul"',
    '400 32px "Siemreap"',
  ];
  try {
    await Promise.all(samples.map((s) => document.fonts.load(s, "កម្ពុជា")));
    await document.fonts.ready;
  } catch {
    /* offline / blocked webfonts → fall back to the system Khmer font */
  }
}

// Assets the current design needs, loaded in the background
async function ensureAssets() {
  const d = design.value;
  const urls = [];
  if (d.showLogo && auth.restaurant?.logoUrl) urls.push(auth.restaurant.logoUrl);
  if (d.showImages) {
    for (const cat of menuData.value.categories)
      for (const item of cat.items) if (item.img) urls.push(item.img);
  }
  if (d.showQr && qrDataUrl.value) urls.push(qrDataUrl.value);
  await loadImages(urls);
  assetsReady.value = true;
}

// ─── PERSISTENCE (draft in localStorage, copies on the server) ─
function persistDraft() {
  saveDraft(auth.restaurantId, design.value);
}

function loadDraftForRestaurant() {
  const draft = loadDraft(auth.restaurantId);
  design.value = draft ? normalizeDesign(draft) : createDesign();
  activeDesignId.value = null;
  designName.value = "";
  currentPage.value = 0;
}

// ─── DESIGN ACTIONS ──────────────────────────────────────────
export function applyTemplate(templateId) {
  design.value = normalizeDesign(withTemplate(design.value, templateId));
  currentPage.value = 0;
}

export function patchDesign(patch) {
  design.value = normalizeDesign({ ...design.value, ...patch });
}

export function resetDesign() {
  const tpl = design.value.template;
  design.value = createDesign(tpl);
  activeDesignId.value = null;
  designName.value = "";
  currentPage.value = 0;
}

export function setSize(sizeKey) {
  patchDesign({ sizeKey });
}

// ─── RENDERING ───────────────────────────────────────────────
function defaultPreviewWidth(s) {
  // ~2× the CSS size of the sheet, capped so big sheets stay responsive
  const cssWidth = (s.wMm / 25.4) * 96;
  return Math.min(2400, Math.max(420, Math.round(cssWidth * 1.6)));
}

export function renderToCanvas(canvas, opts = {}) {
  if (!canvas) return null;
  const s = opts.sheet || sheet.value;
  const d = opts.design || design.value;
  let data = opts.data || menuData.value;
  if (!opts.data) {
    const pagination = paginateMenuData(data, d, s);
    menuPages.value = pagination.pages;
    menuPageFitScale.value = pagination.fitScale;
    currentPage.value = Math.min(currentPage.value, menuPages.value.length - 1);
    data = menuPages.value[currentPage.value] || data;
  }
  const widthPx = opts.widthPx || defaultPreviewWidth(s);
  const result = renderMenuToCanvas(canvas, {
    design: d,
    sheet: s,
    data,
    images,
    pxPerUnit: widthPx / s.w,
    allowTainted: opts.allowTainted !== false,
    fitScale: opts.fitScale ?? menuPageFitScale.value,
  });
  if (opts.trackFit !== false) {
    fitState.value = { fit: result.fit, overflow: result.overflow };
  }
  return result;
}

function paginateMenuData(data, d, s) {
  const items = (data.categories || []).flatMap((category, categoryIndex) =>
    (category.items || []).map((item) => ({ categoryIndex, item })),
  );
  if (!items.length || typeof document === "undefined")
    return { pages: [data], fitScale: 1 };

  const canvas = document.createElement("canvas");
  const pxPerUnit = Math.min(1, 720 / s.w);
  const buildPage = (start, end) => {
    const categories = [];
    for (let i = start; i < end; i += 1) {
      const { categoryIndex, item } = items[i];
      const sourceCategory = data.categories[categoryIndex];
      let category = categories[categories.length - 1];
      if (!category || category.sourceIndex !== categoryIndex) {
        category = { ...sourceCategory, items: [], sourceIndex: categoryIndex };
        categories.push(category);
      }
      category.items.push(item);
    }
    return {
      ...data,
      categories: categories.map(({ sourceIndex, ...category }) => category),
    };
  };
  const renderPage = (pageData) =>
    renderMenuToCanvas(canvas, {
      design: d,
      sheet: s,
      data: pageData,
      images,
      pxPerUnit,
      allowTainted: true,
    });
  const fits = (start, end) => !renderPage(buildPage(start, end)).overflow;

  if (fits(0, items.length)) {
    return { pages: [data], fitScale: renderPage(data).fit };
  }

  const pages = [];
  let fitScale = 1;
  let start = 0;
  while (start < items.length) {
    let low = start + 1;
    let high = items.length;
    let best = start;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (fits(start, mid)) {
        best = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    // Keep a single oversized item rather than dropping it or looping forever.
    if (best === start) best = start + 1;
    const page = buildPage(start, best);
    fitScale = Math.min(fitScale, renderPage(page).fit);
    pages.push(page);
    start = best;
  }
  return { pages, fitScale };
}

// Off-screen canvas at the export resolution (no foreign images: the PNG
// would otherwise be tainted and unreadable).
async function renderExportCanvas(data = menuData.value, fitScale = menuPageFitScale.value) {
  const s = sheet.value;
  const px = sheetPixels(s, design.value.quality);
  const canvas = document.createElement("canvas");
  const result = renderMenuToCanvas(canvas, {
    design: design.value,
    sheet: s,
    data,
    images,
    pxPerUnit: px.w / s.w,
    allowTainted: false,
    fitScale,
  });
  return { canvas, result, px };
}

function getMenuPages() {
  const pagination = paginateMenuData(menuData.value, design.value, sheet.value);
  menuPages.value = pagination.pages;
  menuPageFitScale.value = pagination.fitScale;
  currentPage.value = Math.min(currentPage.value, pagination.pages.length - 1);
  return pagination.pages;
}

function exportBaseName() {
  const s = sheet.value;
  const name = designName.value || auth.restaurant?.name || "menu";
  const size = s.key === "custom" ? `${Math.round(s.w)}x${Math.round(s.h)}` : s.key;
  return `${slugify(name, "menu")}-${size}`;
}

function resolveMm() {
  const s = sheet.value;
  return { widthMm: s.wMm, heightMm: s.hMm };
}

// ─── EXPORTS ─────────────────────────────────────────────────
export async function exportPng() {
  if (exporting.value) return;
  exporting.value = true;
  exportMsg.value = "";
  exportError.value = "";
  try {
    const pages = getMenuPages();
    const { canvas } = await renderExportCanvas(pages[currentPage.value]);
    const blob = await canvasToBlob(canvas, "image/png");
    if (!blob) throw new Error("PNG");
    const suffix = pages.length > 1
      ? `-page-${currentPage.value + 1}-of-${pages.length}`
      : "";
    downloadBlob(blob, `${exportBaseName()}${suffix}.png`);
    exportMsg.value = i18n.t.ms_png_saved || "PNG downloaded";
  } catch (err) {
    console.error("PNG export failed:", err);
    exportError.value = i18n.t.ms_export_failed || "Export failed";
  } finally {
    exporting.value = false;
  }
}

export async function exportPdf() {
  if (exporting.value) return;
  exporting.value = true;
  exportMsg.value = "";
  exportError.value = "";
  try {
    const pages = getMenuPages();
    const { widthMm, heightMm } = resolveMm();
    const jpegs = [];
    for (const page of pages) {
      const { canvas } = await renderExportCanvas(page);
      const jpegBlob = await canvasToBlob(canvas, "image/jpeg", 0.95);
      jpegs.push({
        data: jpegBlob
          ? new Uint8Array(await jpegBlob.arrayBuffer())
          : dataUrlToBytes(canvas.toDataURL("image/jpeg", 0.95)),
        width: canvas.width,
        height: canvas.height,
      });
      canvas.width = 0;
      canvas.height = 0;
    }
    const blob = jpegsToPdfBlob(jpegs, {
      widthMm,
      heightMm,
      title: designName.value || auth.restaurant?.name || "Menu",
    });
    downloadBlob(blob, `${exportBaseName()}.pdf`);
    exportMsg.value = i18n.t.ms_pdf_saved || "PDF downloaded";
  } catch (err) {
    console.error("PDF export failed:", err);
    exportError.value = i18n.t.ms_export_failed || "Export failed";
  } finally {
    exporting.value = false;
  }
}

export async function printMenu() {
  if (exporting.value) return;
  exporting.value = true;
  exportMsg.value = "";
  exportError.value = "";
  try {
    const pages = getMenuPages();
    const { widthMm, heightMm } = resolveMm();
    const pageImages = [];
    for (const page of pages) {
      const { canvas } = await renderExportCanvas(page);
      pageImages.push(canvas.toDataURL("image/jpeg", 0.95));
      canvas.width = 0;
      canvas.height = 0;
    }
    const ok = printSheets(pageImages, {
        widthMm,
        heightMm,
        title: designName.value || auth.restaurant?.name || "Menu",
      });
    if (!ok) throw new Error("print");
    exportMsg.value = i18n.t.ms_print_hint || "Choose “Save as PDF” in the dialog";
  } catch (err) {
    console.error("Print failed:", err);
    exportError.value = i18n.t.ms_export_failed || "Export failed";
  } finally {
    exporting.value = false;
  }
}

export async function copyPng() {
  if (exporting.value) return;
  exporting.value = true;
  exportMsg.value = "";
  exportError.value = "";
  try {
    const pages = getMenuPages();
    const { canvas } = await renderExportCanvas(pages[currentPage.value]);
    const ok = await copyCanvasToClipboard(canvas);
    if (!ok) throw new Error("clipboard");
    exportMsg.value = i18n.t.ms_copied || "Copied to clipboard";
  } catch (err) {
    console.error("Copy failed:", err);
    exportError.value = i18n.t.ms_copy_failed || "Could not copy the image";
  } finally {
    exporting.value = false;
  }
}



// Everything in the design that changes WHAT is on the menu (as opposed to
// how it looks) — used to rebuild the data only when needed.
const dataKey = computed(() =>
  JSON.stringify([
    design.value.currency,
    design.value.hideUnavailable,
    design.value.showQr,
    design.value.showBrand,
    design.value.showImages,
    design.value.categoryIds,
  ]),
);

// ─── POSTER QR (footer "scan for the live menu") ─────────────
async function ensurePosterQr() {
  if (!design.value.showQr || !auth.restaurantId) {
    qrDataUrl.value = "";
    return;
  }
  const url = buildShareLinks({ restaurantId: auth.restaurantId }).spaUrl;
  if (!url) return;
  const dark = design.value.colors.ink;
  const light = design.value.colors.panel;
  const key = `${url}|${dark}|${light}`;
  if (qrFor.value === key) return;
  qrFor.value = key;
  try {
    const res = await axios.post(
      `${API_BASE}/api/menu-designs/qr`,
      { url, dark, light },
      { params: { restaurant_id: auth.restaurantId || undefined } },
    );
    if (qrFor.value !== key) return;
    qrDataUrl.value = res.data.qrCode || "";
    buildData();
    await loadImages([qrDataUrl.value]);
  } catch (err) {
    console.warn("[MenuStudio] Poster QR failed:", err?.response?.data?.error || err.message);
    if (qrFor.value === key) {
      qrDataUrl.value = "";
      buildData();
      assetTick.value += 1;
    }
  }
}

// ─── SAVED DESIGNS (server) ──────────────────────────────────
export async function fetchDesigns() {
  if (!auth.restaurantId) {
    designs.value = [];
    return;
  }
  designsLoading.value = true;
  designsError.value = "";
  try {
    const res = await axios.get(`${API_BASE}/api/menu-designs`, {
      params: { restaurant_id: auth.restaurantId },
    });
    designs.value = res.data || [];
  } catch (err) {
    // 503 = the migration was not run yet; the studio keeps working with
    // the local draft, it just cannot list saved copies.
    designsError.value =
      err?.response?.data?.error || i18n.t.ms_load_failed || "Could not load designs";
    designs.value = [];
  } finally {
    designsLoading.value = false;
  }
}

async function submitDesign() {
  const payload = {
    restaurant_id: auth.restaurantId,
    name:
      designName.value.trim() ||
      `${auth.restaurant?.name || "Menu"} — ${new Date().toLocaleDateString()}`,
    template: design.value.template,
    size_key: design.value.sizeKey,
    design: design.value,
  };
  if (activeDesignId.value) {
    const res = await axios.patch(
      `${API_BASE}/api/menu-designs/${activeDesignId.value}`,
      payload,
    );
    upsertDesign(res.data);
    return res.data;
  }
  const res = await axios.post(`${API_BASE}/api/menu-designs`, payload);
  activeDesignId.value = res.data.id;
  designName.value = res.data.name;
  upsertDesign(res.data);
  return res.data;
}

function upsertDesign(row) {
  const list = designs.value.filter((d) => d.id !== row.id);
  list.unshift(row);
  designs.value = list;
}

export async function saveDesign() {
  if (savingDesign.value) return;
  if (!auth.restaurantId) {
    saveError.value = i18n.t.need_restaurant || "Create a restaurant first";
    return;
  }
  savingDesign.value = true;
  saveMsg.value = "";
  saveError.value = "";
  try {
    await submitDesign();
    saveMsg.value = i18n.t.saved_success || "Saved successfully!";
    setTimeout(() => {
      saveMsg.value = "";
    }, 3000);
    await fetchDesigns();
  } catch (err) {
    saveError.value =
      err?.response?.data?.error || i18n.t.ms_save_failed || "Could not save";
  } finally {
    savingDesign.value = false;
  }
}

export function openSaved(row) {
  design.value = normalizeDesign(row.design);
  activeDesignId.value = row.id;
  designName.value = row.name;
  currentPage.value = 0;
  saveMsg.value = "";
  saveError.value = "";
}

export async function deleteSaved(row) {
  saveError.value = "";
  try {
    await axios.delete(`${API_BASE}/api/menu-designs/${row.id}`);
    designs.value = designs.value.filter((d) => d.id !== row.id);
    if (activeDesignId.value === row.id) activeDesignId.value = null;
  } catch (err) {
    saveError.value =
      err?.response?.data?.error || i18n.t.ms_delete_failed || "Could not delete";
  }
}

// ─── INIT + WATCHERS ────────────────────────────────────────
export async function initStudio() {
  loadDraftForRestaurant();
  await ensureFonts();
  try {
    if (!foods.categories.length) await foods.fetchCategories({});
    if (!foods.foods.length) {
      dataLoading.value = true;
      await foods.fetchFoods({});
    }
  } catch (err) {
    // The workspace shows its own "add dishes first" empty state
    console.warn("[MenuStudio] could not load menu data:", err?.message);
  } finally {
    dataLoading.value = false;
  }
  try {
    buildData();
  } catch (err) {
    console.warn("[MenuStudio] buildData:", err?.message);
  }
  void ensurePosterQr();
  await fetchDesigns();
  await ensureAssets().catch(() => {});
  assetTick.value += 1;
}

// Rebuild the rendered menu data when "what" changes
watch(dataKey, () => {
  buildData();
  void ensureAssets().catch((err) => {
    console.warn("[MenuStudio] could not load menu images:", err?.message);
  });
  void ensurePosterQr();
  assetTick.value += 1;
});

// Keep the draft in sync (debounced — every slider move would be wasteful).
// The poster QR follows ink/panel colours, so it is re-checked here too
// (ensurePosterQr no-ops when nothing relevant changed).
watch(
  design,
  () => {
    clearTimeout(draftTimer);
    draftTimer = setTimeout(() => {
      persistDraft();
      ensurePosterQr().catch(() => {});
    }, 400);
  },
  { deep: true },
);

// Switching restaurant reloads that restaurant's draft + data
watch(
  () => auth.restaurantId,
  async () => {
    loadDraftForRestaurant();
    buildData();
    qrFor.value = "";
    qrDataUrl.value = "";
    void ensurePosterQr();
    await ensureAssets();
    await fetchDesigns();
  },
);

export function useMenuStudio() {
  return {
    design,
    menuData,
    sheet,
    exportSize,
    fitState,
    menuPages,
    currentPage,
    dataLoading,
    assetsReady,
    assetTick,
    designs,
    designsLoading,
    designsError,
    designName,
    activeDesignId,
    savingDesign,
    saveMsg,
    saveError,
    exporting,
    exportMsg,
    exportError,
    applyTemplate,
    patchDesign,
    resetDesign,
    setSize,
    renderToCanvas,
    initStudio,
    fetchDesigns,
    saveDesign,
    openSaved,
    deleteSaved,
    exportPng,
    exportPdf,
    printMenu,
    copyPng,
  };
}
