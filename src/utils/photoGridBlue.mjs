export const PHOTO_GRID_BLUE_TEMPLATE = {
  id: "photoGridBlue",
  nameKey: "ms_tpl_photo_grid_blue",
  descKey: "ms_tpl_photo_grid_blue_d",
  tag: "new",
  // Merge these into createDesign() defaults for this template id
  defaults: {
    columns: 3, // photo columns (1–5, follows design.columns)
    fontScale: 1,
    margins: 1,
    showImages: true,
    showPrice: true,
    colors: {
      bg: "#2f7fc1",
      panel: "#1e5f9c",
      ink: "#ffffff",
      muted: "#dbeafe",
      accent: "#d6f04a", // footer address colour
      line: "#ffffff",
      headerBg: "#1e5f9c",
      headerInk: "#ffffff",
    },
  },
};

const FALLBACK_FAMILY =
  "'Hanuman','Kantumruy Pro','Noto Sans Khmer',sans-serif";

// Mirrors MENU_FONT_STACKS in menuStudio.mjs (kept local so this module has
// no import cycle with the registry that loads it). Maps the Studio's font
// key — hanuman / kantumruy / mix — onto a canvas family string.
const FONT_FAMILIES = {
  hanuman: "'Hanuman','Kantumruy Pro','Noto Sans Khmer',sans-serif",
  kantumruy: "'Kantumruy Pro','Hanuman','Noto Sans Khmer',sans-serif",
  mix: "'Hanuman','Kantumruy Pro','Noto Sans Khmer',sans-serif",
  battambang: "'Battambang','Hanuman','Noto Sans Khmer',sans-serif",
  koulen: "'Koulen','Hanuman','Noto Sans Khmer',sans-serif",
  moul: "'Moul','Hanuman','Noto Sans Khmer',sans-serif",
  siemreap: "'Siemreap','Hanuman','Noto Sans Khmer',sans-serif",
};

// Split text into at most `maxLines` lines that fit `maxW`.
// Uses graphemes (Khmer has no spaces) and prefers breaking at spaces.
function wrapText(ctx, text, maxW, maxLines) {
  const str = String(text ?? "").trim();
  if (!str) return [];
  const segs =
    typeof Intl !== "undefined" && Intl.Segmenter
      ? [
          ...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(
            str,
          ),
        ].map((s) => s.segment)
      : [...str];
  const lines = [];
  let cur = "";
  for (let i = 0; i < segs.length; i++) {
    const next = cur + segs[i];
    if (ctx.measureText(next).width > maxW && cur) {
      lines.push(cur.trim());
      cur = segs[i] === " " ? "" : segs[i];
      if (lines.length === maxLines) break;
    } else {
      cur = next;
    }
  }
  if (lines.length < maxLines && cur.trim()) lines.push(cur.trim());
  if (
    lines.length === maxLines &&
    segs.join("").trim() !== lines.join("").replace(/\s+/g, " ").trim()
  ) {
    // truncated → ellipsis on the last line
    let last = lines[maxLines - 1];
    while (last.length > 1 && ctx.measureText(last + "…").width > maxW)
      last = last.slice(0, -1);
    lines[maxLines - 1] = last + "…";
  }
  return lines;
}

function fitFontSize(ctx, text, weight, family, size, maxW, minSize) {
  let s = size;
  ctx.font = `${weight} ${s}px ${family}`;
  while (s > minSize && ctx.measureText(text).width > maxW) {
    s -= 0.5;
    ctx.font = `${weight} ${s}px ${family}`;
  }
  return s;
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

// object-fit: cover
function drawCover(ctx, img, x, y, w, h) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return false;
  const r = Math.max(w / iw, h / ih);
  const sw = w / r;
  const sh = h / r;
  ctx.drawImage(img, (iw - sw) / 2, (ih - sh) / 2, sw, sh, x, y, w, h);
  return true;
}

// The Studio's image Map stores { img, corsOk } entries keyed by URL (see
// useMenuStudio.loadEntry) — unwrap them, and skip CORS-unclean bitmaps when
// rendering an export (allowTainted=false) so the canvas never taints.
function unwrapEntry(entry, allowTainted = true) {
  if (!entry) return null;
  const img = entry.img || entry; // entry form, or a bare HTMLImageElement
  if (!img) return null;
  if (!allowTainted && entry.corsOk === false) return null;
  return img.complete === undefined || img.complete ? img : null;
}

function getImage(images, item, allowTainted = true) {
  if (!images || !item) return null;
  const entry =
    (item.img && images.get(item.img)) || images.get(item.id) || null;
  return unwrapEntry(entry, allowTainted);
}

export function renderPhotoGridBlue(canvas, opts) {
  const {
    design,
    sheet,
    data,
    images,
    pxPerUnit,
    allowTainted = true,
    fitScale = 1,
  } = opts;
  const W = Math.max(1, Math.round(sheet.w * pxPerUnit));
  const H = Math.max(1, Math.round(sheet.h * pxPerUnit));
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  const c = {
    ...PHOTO_GRID_BLUE_TEMPLATE.defaults.colors,
    ...(design.colors || {}),
  };
  const family =
    FONT_FAMILIES[design.font] || design.fontFamily || FALLBACK_FAMILY;
  const fs = Number(design.fontScale) || 1;
  const titleScale = Math.max(0.3, Math.min(1.5, Number(design.titleScale) || 1));
  const itemScale = Math.max(0.3, Math.min(1.5, Number(design.itemScale) || 1));
  const logoScale = Math.max(0.3, Math.min(1.5, Number(design.logoScale) || 1));
  const itemImageScale = Math.max(0.3, Math.min(1.5, Number(design.itemImageScale) || 1));
  const qrScale = Math.max(0.3, Math.min(1.5, Number(design.qrScale) || 1));
  const hotspots = [];

  // ── base unit: everything scales from the sheet's shorter side ──
  const base = Math.min(W, H);
  const margin = base * 0.03 * (Number(design.margins) || 1);
  const gap = base * 0.012;
  const rowGap = base * 0.01;

  // sheet background + inner frame
  ctx.fillStyle = c.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = c.line;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = Math.max(1, base * 0.002);
  roundRect(
    ctx,
    margin * 0.4,
    margin * 0.4,
    W - margin * 0.8,
    H - margin * 0.8,
    base * 0.01,
  );
  ctx.stroke();
  ctx.globalAlpha = 1;

  const innerX = margin;
  const innerW = W - margin * 2;

  // ── header strip: contact | title | subtitle ──
  const hdrH = base * 0.055 * Math.max(0.85, fs);
  const hdrY = margin;
  ctx.fillStyle = c.headerBg;
  roundRect(ctx, innerX, hdrY, innerW, hdrH, base * 0.008);
  ctx.fill();

  const hdrFs = hdrH * 0.46;
  const pad = hdrH * 0.4;
  let leftX = innerX + pad;

  if (design.showLogo && data.logoUrl) {
    const logo = unwrapEntry(images && images.get(data.logoUrl), allowTainted);
    if (logo) {
      const ls = hdrH * Math.min(0.92, 0.78 * logoScale);
      ctx.save();
      if (design.logoShape === "square")
        roundRect(ctx, leftX, hdrY + (hdrH - ls) / 2, ls, ls, ls * 0.12);
      else {
        ctx.beginPath();
        ctx.arc(leftX + ls / 2, hdrY + hdrH / 2, ls / 2, 0, Math.PI * 2);
      }
      ctx.clip();
      drawCover(ctx, logo, leftX, hdrY + (hdrH - ls) / 2, ls, ls);
      ctx.restore();
      leftX += ls + pad * 0.6;
    }
  }

  const colW = (innerW - pad * 2) / 3;
  const textTop = hdrY;
  const drawHdr = (key, text, align, x, w) => {
    const maxSize = key === "title" ? hdrFs * titleScale : hdrFs;
    const minSize = key === "title" ? hdrFs * titleScale * 0.6 : hdrFs * 0.6;
    const s = fitFontSize(ctx, text || " ", 700, family, maxSize, w, minSize);
    ctx.fillStyle = c.headerInk;
    ctx.textBaseline = "middle";
    ctx.textAlign = align;
    ctx.font = `700 ${s}px ${family}`;
    const ax = align === "left" ? x : align === "right" ? x + w : x + w / 2;
    ctx.fillText(text || "", ax, textTop + hdrH / 2);
    hotspots.push({
      key,
      x,
      y: textTop + hdrH * 0.1,
      w,
      h: hdrH * 0.8,
      fs: s,
      align,
      font: `700 ${s}px ${family}`,
    });
  };
  drawHdr(
    "contact",
    design.contact || "",
    "left",
    leftX,
    colW - (leftX - innerX - pad),
  );
  drawHdr(
    "title",
    design.title || data.restaurantName || "",
    "center",
    innerX + pad + colW,
    colW,
  );
  drawHdr(
    "subtitle",
    design.subtitle || "",
    "right",
    innerX + pad + colW * 2,
    colW,
  );

  // ── footer banner ──
  const hasFooter = design.footerNote || (design.showBrand && data.brandText);
  const ftrH = hasFooter ? base * 0.1 : 0;
  const ftrY = H - margin - ftrH;

  // ── grid geometry ──
  const cols = Math.max(1, Math.min(5, Number(design.columns) || 3)); // design.columns 1–5 → 1–5 photo columns
  const gridTop = hdrY + hdrH + gap * 1.5;
  const gridBottom = hasFooter ? ftrY - gap * 1.5 : H - margin;
  const availH = Math.max(1, gridBottom - gridTop);
  const cellW = (innerW - gap * (cols - 1)) / cols;

  // rows = category band rows + item rows
  const cats = (data.categories || []).filter(
    (cat) => (cat.items || []).length,
  );
  const showImgs = design.showImages !== false;
  const nameFs0 = Math.min(cellW * 0.115, base * 0.026) * fs * itemScale;
  const priceFs0 = nameFs0 * 0.95;
  const photoH0 = showImgs ? cellW * 0.68 * itemImageScale : 0;
  const bandH0 = base * 0.04 * Math.max(0.9, fs);
  const rows = [];
  ctx.font = `700 ${nameFs0}px ${family}`;
  for (const cat of cats) {
    if (cats.length > 1 || design.categoryIds?.length === 1)
      rows.push({ type: "cat", label: cat.label, h: bandH0 });
    for (let i = 0; i < cat.items.length; i += cols) {
      const items = cat.items.slice(i, i + cols);
      const maxNameLines = Math.max(
        1,
        ...items.map((item) => wrapText(ctx, item.name, cellW - 4, 2).length),
      );
      const textH =
        maxNameLines * nameFs0 * 1.35 +
        (design.showPrice !== false ? priceFs0 * 1.25 : 0) +
        rowGap * 0.2;
      rows.push({
        type: "items",
        items,
        h: photoH0 + textH + rowGap * 0.4,
      });
    }
  }
  const needed = rows.reduce(
    (sum, row) => sum + row.h + rowGap,
    0,
  );
  const ratio = needed > 0 ? availH / needed : 1;
  // Engine contract (menu-studio.check.mjs): `fit` is always within
  // [0.6, 1] — below that the sheet genuinely cannot hold the content, so
  // the owner gets the `overflow` warning instead of a microscopic menu.
  // `sc` (the scale actually painted) follows the same floor, so the flag
  // and what's on the canvas always agree.
  const fit = Math.max(0.6, Math.min(1, ratio, Number(fitScale) || 1));
  const overflow = ratio < fit;
  const sc = fit;

  // clip so an overflowing menu never paints over the footer
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, gridTop, W, availH + 1);
  ctx.clip();

  let y = gridTop;
  for (const row of rows) {
    if (row.type === "cat") {
      const bh = bandH0 * sc;
      ctx.fillStyle = c.headerBg;
      roundRect(ctx, innerX, y, innerW, bh, bh * 0.25);
      ctx.fill();
      const s = fitFontSize(
        ctx,
        row.label || " ",
        700,
        family,
        bh * 0.5,
        innerW - pad * 2,
        bh * 0.3,
      );
      ctx.fillStyle = c.accent;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `700 ${s}px ${family}`;
      ctx.fillText(row.label || "", innerX + innerW / 2, y + bh / 2);
      y += bh + rowGap * sc;
      continue;
    }

    const photoH = photoH0 * sc;
    const nameFs = nameFs0 * sc;
    const priceFs = priceFs0 * sc;
    row.items.forEach((item, ci) => {
      const x = innerX + ci * (cellW + gap);
      let cy = y;

      if (showImgs) {
        // white photo frame
        ctx.fillStyle = "#ffffff";
        roundRect(ctx, x, cy, cellW, photoH, base * 0.004);
        ctx.fill();
        const inset = Math.max(2, cellW * 0.025);
        const img = getImage(images, item, allowTainted);
        ctx.save();
        roundRect(
          ctx,
          x + inset,
          cy + inset,
          cellW - inset * 2,
          photoH - inset * 2,
          base * 0.003,
        );
        ctx.clip();
        if (
          !img ||
          !drawCover(
            ctx,
            img,
            x + inset,
            cy + inset,
            cellW - inset * 2,
            photoH - inset * 2,
          )
        ) {
          ctx.fillStyle = "#e8eef5";
          ctx.fillRect(
            x + inset,
            cy + inset,
            cellW - inset * 2,
            photoH - inset * 2,
          );
        }
        ctx.restore();
        cy += photoH + rowGap * 1 * sc;
      }

      // name (≤ 2 lines, centred, white)
      ctx.fillStyle = c.ink;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.font = `700 ${nameFs}px ${family}`;
      const lines = wrapText(ctx, item.name, cellW - 4, 2);
      lines.forEach((ln, li) =>
        ctx.fillText(ln, x + cellW / 2, cy + li * nameFs * 1.35),
      );
      cy += nameFs * 1.35 * Math.max(1, lines.length) + rowGap * 0.2 * sc;

      // price(s): "a / b" stays on one line, shrinking to fit
      if (design.showPrice !== false && item.priceText) {
        const ptxt = String(item.priceText);
        const s = fitFontSize(
          ctx,
          ptxt,
          600,
          family,
          priceFs,
          cellW - 2,
          priceFs * 0.6,
        );
        ctx.fillStyle = c.muted;
        ctx.font = `600 ${s}px ${family}`;
        ctx.fillText(ptxt, x + cellW / 2, cy);
      }
    });
    y += row.h * sc + rowGap * sc;
  }
  ctx.restore();

  // ── footer ──
  if (hasFooter) {
    ctx.fillStyle = c.headerBg;
    roundRect(ctx, innerX, ftrY, innerW, ftrH, base * 0.008);
    ctx.fill();

    // optional QR (bottom-right)
    let qrW = 0;
    const qr =
      design.showQr &&
      data.qrUrl &&
      unwrapEntry(images && images.get(data.qrUrl), allowTainted);
    if (qr) {
      qrW = ftrH * Math.min(0.95, 0.84 * qrScale);
      ctx.fillStyle = "#fff";
      ctx.fillRect(
        innerX + innerW - qrW - pad,
        ftrY + (ftrH - qrW) / 2,
        qrW,
        qrW,
      );
      drawCover(
        ctx,
        qr,
        innerX + innerW - qrW - pad + 2,
        ftrY + (ftrH - qrW) / 2 + 2,
        qrW - 4,
        qrW - 4,
      );
    }
    const tw = innerW - pad * 2 - (qrW ? qrW + pad : 0);
    const cx = innerX + pad + tw / 2;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const line1 = design.footerNote || "";
    const line2 = design.showBrand ? data.brandText || "" : "";
    const rowsN = (line1 ? 1 : 0) + (line2 ? 1 : 0);
    const lh = ftrH / (rowsN + 1);
    let ly = ftrY + lh;
    if (line1) {
      const s = fitFontSize(
        ctx,
        line1,
        700,
        family,
        ftrH * 0.3,
        tw,
        ftrH * 0.16,
      );
      ctx.fillStyle = c.accent;
      ctx.font = `700 ${s}px ${family}`;
      ctx.fillText(line1, cx, ly);
      hotspots.push({
        key: "footerNote",
        x: innerX + pad,
        y: ly - s,
        w: tw,
        h: s * 2,
        fs: s,
        align: "center",
        font: `700 ${s}px ${family}`,
      });
      ly += lh;
    }
    if (line2) {
      const s = fitFontSize(
        ctx,
        line2,
        600,
        family,
        ftrH * 0.26,
        tw,
        ftrH * 0.14,
      );
      ctx.fillStyle = c.ink;
      ctx.font = `600 ${s}px ${family}`;
      ctx.fillText(line2, cx, ly);
    }
  }

  return { fit, overflow, hotspots };
}
