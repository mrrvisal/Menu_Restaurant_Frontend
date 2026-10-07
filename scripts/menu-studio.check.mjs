// ─────────────────────────────────────────────────────────────
// Menu Studio engine smoke test (no browser needed).
//
//   node scripts/menu-studio.check.mjs
//
// Renders every template × every sheet size on a mock 2D canvas, then checks
// the design normaliser, the sheet math and the PDF builder. Run it after
// touching src/utils/menu{Studio,Render,Export}.mjs or the template list.
// ─────────────────────────────────────────────────────────────
import assert from "node:assert";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const src = (file) => resolve(here, "../src/utils", file);

const {
  MENU_TEMPLATES,
  SHEET_SIZES,
  createDesign,
  normalizeDesign,
  resolveSheet,
  sheetPixels,
  withTemplate,
  templateById,
} = await import(src("menuStudio.mjs"));
const { renderMenuToCanvas } = await import(src("menuRender.mjs"));
const { buildPdfFromJpeg } = await import(src("menuExport.mjs"));

// ── mock canvas 2D context ───────────────────────────────────
function mockCanvas(w = 100, h = 100) {
  let font = "10px sans-serif";
  const ctx = {
    canvas: { width: 0, height: 0 },
    fillStyle: "#000",
    strokeStyle: "#000",
    lineWidth: 1,
    textAlign: "left",
    textBaseline: "alphabetic",
    shadowColor: "",
    shadowBlur: 0,
    get font() {
      return font;
    },
    set font(v) {
      font = v;
    },
    measureText(text) {
      const m = /(\d+(?:\.\d+)?)px/.exec(font);
      const size = m ? parseFloat(m[1]) : 10;
      return { width: String(text || "").length * size * 0.55 };
    },
    save() {},
    restore() {},
    beginPath() {},
    closePath() {},
    moveTo() {},
    lineTo() {},
    arcTo() {},
    arc() {},
    quadraticCurveTo() {},
    bezierCurveTo() {},
    ellipse() {},
    rect() {},
    fill() {},
    stroke() {},
    clip() {},
    fillRect() {},
    strokeRect() {},
    clearRect() {},
    setTransform() {},
    translate() {},
    scale() {},
    fillText() {},
    strokeText() {},
    setLineDash() {},
    drawImage() {},
    createLinearGradient() {
      return { addColorStop() {} };
    },
    createRadialGradient() {
      return { addColorStop() {} };
    },
  };
  const canvas = { width: w, height: h, getContext: () => ctx };
  ctx.canvas = canvas;
  return canvas;
}

function sampleData(n = 12) {
  const cats = [];
  for (let c = 1; c <= 3; c++) {
    const items = [];
    for (let i = 1; i <= n; i++) {
      items.push({
        id: c * 100 + i,
        name:
          i % 3 === 0
            ? `មុខម្ហូបឈ្មោះវែងណាស់ណាស់ណាស់បំពេញប្រអប់តូច ${c}-${i}`
            : `Dish ${c}-${i}`,
        priceText: `${(i * 5000).toLocaleString()}៛`,
        img: "",
        available: true,
      });
    }
    cats.push({ id: c, label: `Category ${c}`, items });
  }
  return {
    restaurantName: "ភោជនីយដ្ឋាន ម្លប់",
    logoUrl: "",
    categories: cats,
    qrUrl: "",
    qrCaption: "Scan for the live menu",
    brandText: "Made with Digital Menu",
  };
}

// ── 1. every template × every preset size renders ────────────
{
  let renders = 0;
  for (const tpl of MENU_TEMPLATES) {
    for (const size of SHEET_SIZES) {
      const design = createDesign(tpl.id);
      design.sizeKey = size.key;
      design.showImages = tpl.images;
      const sheet = resolveSheet(design);
      const out = renderMenuToCanvas(mockCanvas(), {
        design,
        sheet,
        data: sampleData(8),
        images: new Map(),
        pxPerUnit: 1.5,
        allowTainted: true,
      });
      assert.ok(out && out.layout, `${tpl.id}/${size.key}: no layout`);
      assert.ok(
        out.fit >= 0.6 && out.fit <= 1.001,
        `${tpl.id}/${size.key}: fit=${out.fit}`,
      );
      renders++;
    }
  }
  console.log(
    `✓ rendered ${renders} combinations (${MENU_TEMPLATES.length} templates × ${SHEET_SIZES.length} sizes)`,
  );
}

// ── 1b. body must start below the painted header (logo stacks above
//        the title — a max() vs add() mismatch once let columns paint
//        straight over the restaurant name) ──────────────────────
{
  const templatesWithBody = ["photoGridBlue", "modernKhmer"]; // custom painters, own geometry
  for (const tpl of MENU_TEMPLATES) {
    if (templatesWithBody.includes(tpl.id)) continue;
    const design = createDesign(tpl.id);
    design.subtitle = "";
    design.contact = "";
    const sheet = resolveSheet(design);
    const out = renderMenuToCanvas(mockCanvas(), {
      design,
      sheet,
      // logo present but not preloaded: paintHeader still reserves the
      // stacked logo box (cy += size + S(2.8)) even before the img loads
      data: { ...sampleData(3), logoUrl: "logo.png" },
      images: new Map(),
      pxPerUnit: 1,
      allowTainted: true,
    });
    const title = (out.hotspots || []).find((h) => h.key === "title");
    if (!title) continue; // band headers paint the title inside the band
    const bodyY = out.layout.content.y;
    assert.ok(
      bodyY >= title.y + title.h - 0.01,
      `${tpl.id}: body starts inside the header ` +
        `(content.y=${bodyY.toFixed(2)}, title bottom=${(title.y + title.h).toFixed(2)})`,
    );
  }
  console.log("✓ body starts below the painted header (logo + left/center/badge headers)");
}

// ── 1c. an explicit shared fit scale keeps paginated sheets consistent ──
{
  for (const template of ["classic", "modernKhmer", "photoGridBlue"]) {
    const design = createDesign(template);
    design.sizeKey = "a5-portrait";
    design.columns = 1;
    const sheet = resolveSheet(design);
    const dense = renderMenuToCanvas(mockCanvas(), {
      design,
      sheet,
      data: sampleData(24),
      images: new Map(),
      pxPerUnit: 1,
    });
    assert.ok(
      dense.fit < 0.99,
      `${template}: dense page should require a smaller fit, got ${dense.fit}`,
    );
    const sparse = renderMenuToCanvas(mockCanvas(), {
      design,
      sheet,
      data: sampleData(1),
      images: new Map(),
      pxPerUnit: 1,
      fitScale: dense.fit,
    });
    assert.ok(
      Math.abs(sparse.fit - dense.fit) < 0.001,
      `${template}: sparse page fit=${sparse.fit}, dense page fit=${dense.fit}`,
    );
  }
  console.log("✓ shared fit scale stays consistent across menu pages");
}

// ── 1d. regular menu columns fill vertically before advancing ──
{
  const design = createDesign("classic");
  design.columns = 2;
  design.sizeKey = "letter-portrait";
  const out = renderMenuToCanvas(mockCanvas(), {
    design,
    sheet: resolveSheet(design),
    data: sampleData(12),
    images: new Map(),
    pxPerUnit: 1,
  });
  assert.ok(out.layout.columns[1].h > 0, "items should continue to column two");
  assert.ok(
    out.layout.columns[0].h > out.layout.content.h * 0.75,
    "column one should fill most of its height before advancing",
  );
  console.log("✓ regular menu columns fill vertically before advancing");
}

// ── 2. overflow triggers auto-fit (many items on A5) ─────────
{
  const design = createDesign("classic");
  design.sizeKey = "a5-portrait";
  design.columns = 1;
  const out = renderMenuToCanvas(mockCanvas(), {
    design,
    sheet: resolveSheet(design),
    data: sampleData(40),
    images: new Map(),
    pxPerUnit: 1,
  });
  assert.ok(out.fit < 1 || out.overflow, "auto-fit should shrink or warn");
  console.log(
    `✓ auto-fit with 120 items on A5 → fit=${out.fit.toFixed(2)} overflow=${out.overflow}`,
  );
}

// ── 3. design normalisation is bullet-proof ──────────────────
{
  const garbage = normalizeDesign({
    template: "nope",
    columns: 99,
    fontScale: "abc",
    categoryScale: 9,
    colors: { bg: "red" },
  });
  assert.strictEqual(garbage.template, "classic");
  assert.strictEqual(garbage.columns, 5); // 99 clamps to the 1–5 max
  assert.strictEqual(garbage.fontScale, 1);
  assert.strictEqual(garbage.categoryScale, 1.5);
  assert.strictEqual(garbage.colors.bg, "#fdf8ef");
  const swapped = withTemplate(createDesign("classic"), "neon");
  assert.strictEqual(swapped.template, "neon");
  assert.strictEqual(swapped.colors.bg, "#0b1020");
  assert.strictEqual(templateById("khmer").id, "khmer");
  for (const tpl of MENU_TEMPLATES) {
    const d = createDesign(tpl.id);
    assert.strictEqual(d.template, tpl.id);
    assert.ok(d.colors.accent.startsWith("#"), `${tpl.id}: accent`);
  }
  console.log(
    `✓ normalizeDesign / withTemplate (${MENU_TEMPLATES.length} templates)`,
  );
}

// ── 3c. every adjustable display size can be set to 30% ─────
{
  const design = normalizeDesign({
    titleScale: 0.3,
    categoryScale: 0.3,
    itemScale: 0.3,
    logoScale: 0.3,
    itemImageScale: 0.3,
    qrScale: 0.3,
  });
  for (const key of [
    "titleScale",
    "categoryScale",
    "itemScale",
    "logoScale",
    "itemImageScale",
    "qrScale",
  ]) {
    assert.strictEqual(design[key], 0.3, `${key} should support 30%`);
  }
  console.log("✓ all display-size settings support a 30% minimum");
}

// ── 3b. category size setting changes regular menu section sizing ──
{
  const design = createDesign("classic");
  const sheet = resolveSheet(design);
  const data = sampleData(1);
  const normalCanvas = mockCanvas();
  const normalFonts = [];
  const normalFillText = normalCanvas.getContext("2d").fillText;
  normalCanvas.getContext("2d").fillText = function (...args) {
    if (String(args[0]).toLowerCase() === "category 1") normalFonts.push(this.font);
    normalFillText.apply(this, args);
  };
  const normal = renderMenuToCanvas(normalCanvas, {
    design,
    sheet,
    data,
    images: new Map(),
    pxPerUnit: 1,
  });
  const largerCanvas = mockCanvas();
  const largerFonts = [];
  const largerFillText = largerCanvas.getContext("2d").fillText;
  largerCanvas.getContext("2d").fillText = function (...args) {
    if (String(args[0]).toLowerCase() === "category 1") largerFonts.push(this.font);
    largerFillText.apply(this, args);
  };
  const larger = renderMenuToCanvas(largerCanvas, {
    design: { ...design, categoryScale: 1.5 },
    sheet,
    data,
    images: new Map(),
    pxPerUnit: 1,
  });
  const sectionHeight = (out) =>
    out.layout.columns.flatMap((column) => column.blocks)
      .find((block) => block.kind === "section").h;
  assert.ok(
    sectionHeight(larger) > sectionHeight(normal),
    "larger category text should reserve more section height",
  );
  const fontSize = (font) => Number(/(\d+(?:\.\d+)?)px/.exec(font)?.[1]);
  assert.ok(normalFonts.length && largerFonts.length, "category labels should paint");
  assert.ok(
    fontSize(largerFonts[0]) > fontSize(normalFonts[0]),
    "larger category setting should paint larger visible text",
  );
  console.log("✓ category text size updates regular menu section layout and font");
}

// ── 3d. QR footer paints its image and reserves wrapped caption height ──
{
  const design = createDesign("classic");
  design.qrScale = 0.3;
  const canvas = mockCanvas();
  let imagesDrawn = 0;
  canvas.getContext("2d").drawImage = () => {
    imagesDrawn += 1;
  };
  const out = renderMenuToCanvas(canvas, {
    design,
    sheet: resolveSheet(design),
    data: {
      ...sampleData(1),
      qrUrl: "data:image/png;base64,qr",
      qrCaption: "ស្កេនដើម្បីមើលមីនុយ និងតម្លៃអាហាររបស់ភោជនីយដ្ឋាន",
    },
    images: new Map([
      ["data:image/png;base64,qr", { img: { width: 32, height: 32 } }],
    ]),
    pxPerUnit: 1,
  });
  assert.ok(imagesDrawn > 0, "the generated QR image should be painted");
  assert.ok(
    out.layout.footer.qrCaption.lines.length > 1,
    "small QR captions should wrap into multiple lines",
  );
  assert.ok(
    out.layout.footer.qrBlock >=
      out.layout.footer.qrSize +
        out.layout.footer.capLH * out.layout.footer.qrCaption.lines.length,
    "footer should reserve enough room for all caption lines",
  );
  assert.ok(
    out.layout.footer.qrCaption.lines.every((line) => !/^\p{Mark}/u.test(line)),
    "wrapped Khmer text should not start with a detached combining mark",
  );
  console.log("✓ QR image paints and Khmer caption wraps without clipping");
}

// ── 3e. Modern Khmer category labels stay shaped as a complete text run ──
{
  const categoryLabel = "ម្ហូបពិសេស";
  const data = {
    ...sampleData(1),
    categories: [{ label: categoryLabel, items: sampleData(1).categories[0].items }],
  };
  const painted = [];
  const canvas = mockCanvas();
  canvas.getContext("2d").fillText = (text) => painted.push(String(text));
  const design = createDesign("modernKhmer");
  renderMenuToCanvas(canvas, {
    design,
    sheet: resolveSheet(design),
    data,
    images: new Map(),
    pxPerUnit: 1,
  });
  assert.ok(
    painted.includes(categoryLabel),
    "Modern Khmer should paint a Khmer category label in one shaped text run",
  );
  console.log("✓ Modern Khmer category text preserves Khmer shaping");
}

// ── 3f. photo-card item name and price share one text row ──────────
{
  const positions = new Map();
  const canvas = mockCanvas();
  canvas.getContext("2d").fillText = (text, x, y) => {
    positions.set(String(text), { x, y });
  };
  const design = createDesign("bistro");
  const out = renderMenuToCanvas(canvas, {
    design,
    sheet: resolveSheet(design),
    data: {
      ...sampleData(1),
      categories: [sampleData(1).categories[0]],
    },
    images: new Map(),
    pxPerUnit: 1,
  });
  const name = positions.get("Dish 1-1");
  const price = positions.get("5,000៛");
  assert.ok(name && price, "photo card should paint its name and price");
  assert.ok(
    Math.abs(price.y - name.y) < 0.01,
    "item name and price should share one baseline",
  );
  assert.ok(
    name.x < price.x,
    "item name should be on the left and price on the right",
  );
  console.log("✓ photo-card item name and price share one row");
}

// ── 4. sheet math: mm presets, px presets, orientation ───────
{
  const a4 = resolveSheet({
    sizeKey: "a4-portrait",
    orientation: "portrait",
    custom: {},
  });
  assert.strictEqual(a4.w, 210);
  assert.strictEqual(a4.h, 297);
  const land = resolveSheet({
    sizeKey: "a4-portrait",
    orientation: "landscape",
    custom: {},
  });
  assert.strictEqual(land.w, 297);
  assert.strictEqual(land.h, 210);
  const square = resolveSheet({
    sizeKey: "square",
    orientation: "portrait",
    custom: {},
  });
  assert.strictEqual(square.w, 1080);
  assert.ok(Math.abs(square.wMm - 285.75) < 0.01, `square mm = ${square.wMm}`);
  const px300 = sheetPixels(a4, "high"); // 300 DPI
  assert.ok(Math.abs(px300.w - 2480) <= 2, `A4@300dpi width = ${px300.w}`);
  assert.strictEqual(sheetPixels(square, "high").w, 2160); // 2× on px presets
  const custom = resolveSheet({
    sizeKey: "custom",
    orientation: "portrait",
    custom: { w: 100, h: 200, unit: "mm" },
  });
  assert.strictEqual(custom.w, 100);
  console.log("✓ sheet math (mm / px / orientation / quality)");
}

// ── 5. gallery thumbnails (the path MenuStudioView uses at 96px) ─
{
  for (const tpl of MENU_TEMPLATES) {
    const design = createDesign(tpl.id);
    const sheet = resolveSheet(design);
    const out = renderMenuToCanvas(mockCanvas(), {
      design,
      sheet,
      data: sampleData(3),
      images: new Map(),
      pxPerUnit: 96 / sheet.w,
      allowTainted: true,
    });
    assert.ok(out.fit >= 0.6, `${tpl.id}: thumb fit=${out.fit}`);
  }
  console.log(`✓ gallery thumbnails render at 96px (${MENU_TEMPLATES.length} templates)`);
}

// ── 6. PDF builder produces a structurally valid file ────────
{
  const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 0xff, 0xd9]);
  const pdf = buildPdfFromJpeg(
    { data: jpeg, width: 2480, height: 3508 },
    210,
    297,
    "Test menu",
  );
  const body = new TextDecoder("latin1").decode(pdf);
  assert.ok(body.startsWith("%PDF-1.4"), `header = ${body.slice(0, 9)}`);
  assert.ok(body.slice(-20).includes("%%EOF"), "must end with %%EOF");
  assert.ok(body.includes("/MediaBox [0 0 595.28 841.89]"), "A4 in points");
  assert.ok(body.includes("/Filter /DCTDecode"), "JPEG embedded");
  const off = Number(/startxref\n(\d+)\n/.exec(body)[1]);
  assert.strictEqual(body.slice(off, off + 4), "xref", "startxref → xref");
  for (const m of body.matchAll(/^(\d{10}) 00000 n $/gm)) {
    const o = Number(m[1]);
    assert.ok(
      /^\d+ 0 obj/.test(body.slice(o, o + 14)),
      `offset ${o} → ${JSON.stringify(body.slice(o, o + 14))}`,
    );
  }
  console.log(`✓ valid single-page PDF (${pdf.length} bytes)`);
}

console.log("\nALL MENU STUDIO ENGINE TESTS PASSED");
