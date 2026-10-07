// ─────────────────────────────────────────────────────────────
// Menu Studio — canvas renderer.
//
// Draws a whole menu sheet (background, header, category sections, item
// rows, footer + QR) from a design + menu data. The same routine paints the
// live preview and the exported PNG/JPEG, so what the owner sees is exactly
// what is downloaded/printed.
//
// All coordinates are expressed in the sheet's own unit (mm for print
// sizes, px for social sizes); the canvas transform scales them to the
// requested pixel size. Everything else (type, spacing) is relative to the
// sheet's short side, so an A5 flyer and a 1080×1080 post look alike.
// ─────────────────────────────────────────────────────────────
import {
  fontStack,
  mixHex,
  withAlpha,
  isLight,
  onColor,
  templateById,
} from "./menuStudio.mjs";
import { renderPhotoGridBlue } from "./photoGridBlue.mjs";

// ─── LOW-LEVEL HELPERS ───────────────────────────────────────
const graphemeSegmenter =
  typeof Intl !== "undefined" && Intl.Segmenter
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2));
  ctx.beginPath();
  if (rr <= 0.01) ctx.rect(x, y, w, h);
  else {
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.arcTo(x + w, y, x + w, y + rr, rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.arcTo(x + w, y + h, x + w - rr, y + h, rr);
    ctx.lineTo(x + rr, y + h);
    ctx.arcTo(x, y + h, x, y + h - rr, rr);
    ctx.lineTo(x, y + rr);
    ctx.arcTo(x, y, x + rr, y, rr);
    ctx.closePath();
  }
}

function circle(ctx, cx, cy, r) {
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(0.1, r), 0, Math.PI * 2);
  ctx.closePath();
}

function setFont(ctx, size, weight, design, kind = "body") {
  ctx.font = `${weight} ${size}px ${fontStack(design, kind)}`;
}

// Split `text` into lines that fit `maxW`. Long unbroken runs (Khmer has no
// spaces between many words) are broken by character so nothing can ever
// overflow the sheet. Results are memoised per render pass.
function wrapText(ctx, text, maxW, maxLines, cache, cacheKey) {
  const key = `${cacheKey}|${maxW.toFixed(2)}|${ctx.font}|${text}`;
  if (cache && cache.has(key)) return cache.get(key);

  const words = String(text ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ");
  const lines = [];
  let current = "";
  let truncated = false;

  const pushLong = (word) => {
    const graphemes = graphemeSegmenter
      ? [...graphemeSegmenter.segment(word)].map(({ segment }) => segment)
      : Array.from(word);
    let chunk = "";
    for (const ch of graphemes) {
      if (ctx.measureText(chunk + ch).width <= maxW) chunk += ch;
      else {
        if (chunk) lines.push(chunk);
        chunk = ch;
        if (lines.length >= maxLines) break;
      }
    }
    return chunk;
  };

  for (const word of words) {
    if (!word) continue;
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxW) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      if (lines.length >= maxLines) {
        truncated = true;
        current = "";
        break;
      }
      if (ctx.measureText(word).width <= maxW) current = word;
      else current = pushLong(word);
      if (lines.length >= maxLines) {
        truncated = true;
        current = "";
        break;
      }
    }
  }
  if (current && lines.length < maxLines) lines.push(current);

  const result = { lines: lines.length ? lines : [""], truncated };
  if (cache) cache.set(key, result);
  return result;
}

// One paragraph of text; returns the y after the last drawn line
function paintLines(ctx, lines, x, y, lineH, align) {
  ctx.textAlign = align;
  let cursor = y;
  for (const line of lines) {
    ctx.fillText(line, x, cursor + lineH * 0.78);
    cursor += lineH;
  }
  ctx.textAlign = "left";
  return cursor;
}

// ─── EDITABLE-TEXT HOTSPOTS ──────────────────────────────────
// Canva-style click-to-edit: wherever the renderer paints the title /
// subtitle / contact it also records the exact box (canvas pixel
// coordinates) so the UI can lay an invisible <input> over it.
export function addHotspot(hotspots, key, x, y, w, h, fs, align, color, font) {
  hotspots.push({ key, x, y, w, h, fs, align, color, font });
}

// ─── PUBLIC API ──────────────────────────────────────────────
/**
 * Paint a menu onto `canvas`.
 * @returns {{ fit:number, overflow:boolean, layout:object }}
 */
export function renderMenuToCanvas(canvas, options) {
  const {
    design,
    sheet,
    data,
    images = new Map(),
    pxPerUnit = 1,
    allowTainted = true,
    fitScale = 1,
  } = options;

  const ctx = canvas.getContext("2d");
  const pw = Math.max(2, Math.round(sheet.w * pxPerUnit));
  const ph = Math.max(2, Math.round(sheet.h * pxPerUnit));
  if (canvas.width !== pw) canvas.width = pw;
  if (canvas.height !== ph) canvas.height = ph;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, pw, ph);
  ctx.fillStyle = design.colors.bg;
  ctx.fillRect(0, 0, pw, ph);
  ctx.setTransform(pxPerUnit, 0, 0, pxPerUnit, 0, 0);
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";

  // Custom painters: templates that lay themselves out (their own geometry,
  // hotspots in canvas pixels) receive the raw options and bypass the generic
  // pipeline below. `layout` is part of the public result shape — the smoke
  // test and the preview rely on it being present for every template.
  if (design.template === "photoGridBlue") {
    const out = renderPhotoGridBlue(canvas, {
      design,
      sheet,
      data,
      images,
      pxPerUnit,
      allowTainted,
      fitScale,
    });
    return { ...out, layout: out.layout || { custom: "photoGridBlue" } };
  }

  const env = {
    ctx,
    design,
    sheet,
    data,
    images,
    allowTainted,
    tpl: templateById(design.template),
    cache: new Map(),
    hotspots: [], // editable title / subtitle / contact boxes (see addHotspot)
  };
  env.style = env.tpl.style;

  if (design.template === "modernKhmer") {
    return drawModernKhmer(ctx, {
      design,
      sheet,
      data,
      images,
      pxPerUnit,
      allowTainted,
      fitScale,
    });
  }

  // Auto-fit: shrink the type until everything fits on the sheet (a menu
  // that needs four pages is useless as a poster — the owner sees the
  // warning instead and can pick a bigger sheet or fewer items).
  let fit = Math.max(0.6, Math.min(1, Number(fitScale) || 1));
  let layout = null;
  for (let step = 0; step <= 10; step++) {
    layout = layoutMenu(env, fit);
    if (!layout.overflow || fit <= 0.6) break;
    fit = Math.max(0.6, Number((fit - 0.04).toFixed(2)));
  }

  paintBackground(env, layout);
  paintHeader(env, layout);
  if (layout.grid) paintGridBody(env, layout);
  else paintColumnBody(env, layout);
  paintFooter(env, layout);

  return { fit, overflow: layout.overflow, layout, hotspots: env.hotspots };
}

function drawModernKhmer(
  ctx,
  { design, sheet, data, images, pxPerUnit, allowTainted = true, fitScale = 1 },
) {
  const k = Math.min(sheet.w, sheet.h) / 100;
  const columns = Math.max(1, Math.min(5, Number(design.columns) || 1));
  const margin = k * 5.2 * design.margins;
  const columnGap = k * 4.2;
  const contentW = Math.max(k * 24, sheet.w - margin * 2);
  const columnW = (contentW - columnGap * (columns - 1)) / columns;
  const titleText = String(design.title || data.restaurantName || "").trim();
  const logo = design.showLogo && design.logoShape !== "none"
    ? pickImage({ images, allowTainted }, data.logoUrl)
    : null;
  const hasLogo = !!logo;
  const qr = design.showQr;
  const qrScale = Math.max(0.3, Math.min(1.5, Number(design.qrScale) || 1));
  const qrSize = qr ? Math.min(k * 13.5 * qrScale, contentW * 0.22) : 0;
  const footerH = (qr ? qrSize + k * 3.2 : 0) + k * 7.2;
  const baseScale = Math.max(0.7, Math.min(1.5, Number(design.fontScale) || 1));
  const titleScale = Math.max(0.3, Math.min(1.5, Number(design.titleScale) || 1));
  const categoryScale = Math.max(0.3, Math.min(1.5, Number(design.categoryScale) || 1));
  const itemScale = Math.max(0.3, Math.min(1.5, Number(design.itemScale) || 1));
  const hair = Math.max(0.08, 1 / Math.max(0.1, pxPerUnit));
  const renderEnv = { images, allowTainted, cache: new Map() };
  const hotspots = []; // editable title / subtitle / contact boxes

  const buildLayout = (fit, itemGap) => {
    const scale = baseScale * fit;
    // Auto-fit the restaurant name: shrink until it wraps in ≤2 lines
    // (the wrap loop itself runs below, once headerMaxW/wrap exist)
    let titleSize = k * 6.0 * scale * titleScale;
    const subtitleSize = k * 2.65 * scale;
    const contactSize = k * 1.9 * scale;
    const sectionSize = k * 2.2 * scale * categoryScale;
    const itemSize = k * 2.45 * scale * itemScale;
    const descSize = k * 1.65 * scale;
    const itemLine = itemSize * 1.28;
    const descLine = descSize * 1.35;
    const headerMaxW = contentW - (hasLogo ? k * 17 : 0);
    const wrap = (text, maxW, maxLines, key, size, weight = "400") => {
      setFont(ctx, size, weight, design, weight === "700" ? "heading" : "body");
      return wrapText(ctx, text, maxW, maxLines, renderEnv.cache, key);
    };
    const title = (() => {
      const full = titleSize;
      let guard = 0;
      let t = wrap(titleText, headerMaxW, 2, "mkh-title", titleSize, "700");
      while (t.truncated && titleSize > full * 0.62 && guard++ < 12) {
        titleSize *= 0.94;
        t = wrap(titleText, headerMaxW, 2, "mkh-title", titleSize, "700");
      }
      return t;
    })();
    const subtitle = design.subtitle
      ? wrap(design.subtitle, contentW, 1, "mkh-sub", subtitleSize)
      : { lines: [] };
    const contact = design.contact
      ? wrap(design.contact, contentW, 1, "mkh-contact", contactSize)
      : { lines: [] };
    const headerH =
      (hasLogo ? k * 13.5 + k * 2.2 : 0) +
      title.lines.length * titleSize * 1.2 +
      (subtitle.lines.length ? k * 0.8 + subtitle.lines.length * subtitleSize * 1.25 : 0) +
      (contact.lines.length ? k * 0.5 + contact.lines.length * contactSize * 1.3 : 0) +
      k * 3.6;
    const bodyTop = margin + headerH;
    const bodyBottom = sheet.h - margin - footerH;
    const bodyH = Math.max(0, bodyBottom - bodyTop);
    const columnsLayout = Array.from({ length: columns }, (_, i) => ({
      x: margin + i * (columnW + columnGap),
      y: bodyTop,
      blocks: [],
    }));

    const sectionH = sectionSize * 1.35 + k * 2.1;
    const categoryPlans = (data.categories || []).map((category, categoryIndex) => {
      const section = wrap(
        String(category.label || "").toLocaleUpperCase(),
        columnW,
        1,
        `mkh-section-${categoryIndex}`,
        sectionSize,
        "700",
      ).lines[0];
      const items = (category.items || []).map((item, itemIndex) => {
        const price = design.showPrice ? String(item.priceText || "") : "";
        const thumb = design.showImages && item.img
          ? k * 9.45 * Math.max(0.3, Math.min(1.5, Number(design.itemImageScale) || 1))
          : 0;
        setFont(ctx, itemSize * 0.92, "600", design, "body");
        const priceW = price ? tabularTextWidth(ctx, price) : 0;
        setFont(ctx, itemSize, "600", design, "heading");
        const nameW = Math.max(
          k * 8,
          columnW - thumb - (thumb ? k * 1.5 : 0) - (priceW ? priceW + k * 1.6 : 0),
        );
        const name = wrap(item.name, nameW, 3, `mkh-name-${categoryIndex}-${itemIndex}`, itemSize, "600");
        const description = item.description
          ? wrap(
              item.description,
              Math.max(k * 8, columnW - thumb - (thumb ? k * 1.5 : 0)),
              2,
              `mkh-desc-${categoryIndex}-${itemIndex}`,
              descSize,
            )
          : { lines: [] };
        const textH =
          name.lines.length * itemLine +
          (description.lines.length
            ? k * 0.35 + description.lines.length * descLine
            : 0);
        return {
          kind: "item",
          item,
          name,
          description,
          price,
          priceW,
          thumb,
          itemSize,
          descSize,
          itemLine,
          descLine,
          h: Math.max(thumb, textH) + itemGap,
        };
      });
      return {
        kind: "category",
        label: section,
        sectionSize,
        sectionH,
        items,
        h: sectionH + items.reduce((sum, item) => sum + item.h, 0),
      };
    });

    // Place each complete category in the currently shortest column.
    for (const category of categoryPlans) {
      const target = columnsLayout.reduce(
        (shortest, column) => (column.y < shortest.y ? column : shortest),
        columnsLayout[0],
      );
      target.blocks.push(category);
      target.y += category.h;
    }
    const overflow = columnsLayout.some((column) => column.y > bodyBottom + hair);
    return {
      scale,
      titleSize,
      subtitleSize,
      contactSize,
      title,
      subtitle,
      contact,
      headerH,
      bodyTop,
      bodyBottom,
      bodyH,
      columnsLayout,
      overflow,
    };
  };

  let fit = Math.max(0.6, Math.min(1, Number(fitScale) || 1));
  let itemGap = k * 1.35 * baseScale;
  let layout = buildLayout(fit, itemGap);
  const minGap = k * 0.35;
  while (layout.overflow && itemGap > minGap) {
    itemGap = Math.max(minGap, itemGap - k * 0.2);
    renderEnv.cache.clear();
    layout = buildLayout(fit, itemGap);
  }
  while (layout.overflow && fit > 0.6) {
    fit = Math.max(0.6, Number((fit - 0.04).toFixed(2)));
    renderEnv.cache.clear();
    layout = buildLayout(fit, itemGap);
  }

  const C = design.colors;
  const centerX = sheet.w / 2;
  let headerY = margin;
  if (hasLogo) {
    const logoSize = k * 13.5 * Math.max(0.3, Math.min(1.5, Number(design.logoScale) || 1));
    const logoShape = design.logoShape === "circle" ? "circle" : "rect";
    drawCover(
      ctx,
      logo,
      margin,
      headerY,
      logoSize,
      logoSize,
      logoSize * 0.18,
      logoShape,
    );
    headerY += logoSize + k * 2.2;
  }
  ctx.fillStyle = C.ink;
  setFont(ctx, layout.titleSize, "700", design, "heading");
  const titleBoxW = contentW - (hasLogo ? k * 17 : 0);
  addHotspot(
    hotspots,
    "title", centerX - titleBoxW / 2, headerY, titleBoxW,
    layout.title.lines.length * layout.titleSize * 1.2,
    layout.titleSize, "center", C.ink, ctx.font,
  );
  headerY = paintLines(
    ctx,
    layout.title.lines,
    centerX,
    headerY,
    layout.titleSize * 1.2,
    "center",
  );
  if (layout.subtitle.lines.length) {
    headerY += k * 0.8;
    ctx.fillStyle = C.muted;
    setFont(ctx, layout.subtitleSize, "400", design, "body");
    addHotspot(
      hotspots,
      "subtitle", margin, headerY, contentW,
      layout.subtitle.lines.length * layout.subtitleSize * 1.25,
      layout.subtitleSize, "center", C.muted, ctx.font,
    );
    headerY = paintLines(ctx, layout.subtitle.lines, centerX, headerY, layout.subtitleSize * 1.25, "center");
  }
  if (layout.contact.lines.length) {
    headerY += k * 0.5;
    ctx.fillStyle = C.muted;
    setFont(ctx, layout.contactSize, "400", design, "body");
    addHotspot(
      hotspots,
      "contact", margin, headerY, contentW,
      layout.contact.lines.length * layout.contactSize * 1.3,
      layout.contactSize, "center", C.muted, ctx.font,
    );
    headerY = paintLines(ctx, layout.contact.lines, centerX, headerY, layout.contactSize * 1.3, "center");
  }
  const headerRuleY = margin + layout.headerH - k * 1.7;
  ctx.strokeStyle = C.accent;
  ctx.lineWidth = hair;
  ctx.beginPath();
  ctx.moveTo(margin + contentW * 0.3, headerRuleY);
  ctx.lineTo(margin + contentW * 0.7, headerRuleY);
  ctx.stroke();

  ctx.save();
  ctx.beginPath();
  ctx.rect(margin, layout.bodyTop, contentW, Math.max(0, layout.bodyH));
  ctx.clip();
  for (const column of layout.columnsLayout) {
    let y = layout.bodyTop;
    for (const category of column.blocks) {
      ctx.fillStyle = C.accent;
      setFont(ctx, category.sectionSize, "700", design, "heading");
      ctx.fillText(category.label, column.x, y + category.sectionSize);
      y += category.sectionSize * 1.35;
      ctx.strokeStyle = C.accent;
      ctx.lineWidth = hair;
      ctx.beginPath();
      ctx.moveTo(column.x, y);
      ctx.lineTo(column.x + columnW, y);
      ctx.stroke();
      y += category.sectionH - category.sectionSize * 1.35;

      for (const row of category.items) {
        const image = row.thumb ? pickImage(renderEnv, row.item.img) : null;
        const rowTextX = column.x + (row.thumb ? row.thumb + k * 1.5 : 0);
        const rowTextW = columnW - (row.thumb ? row.thumb + k * 1.5 : 0);
        const nameY = y + row.itemSize;
        if (image) {
          drawCover(
            ctx,
            image,
            column.x,
            y + Math.max(0, (row.h - itemGap - row.thumb) / 2),
            row.thumb,
            row.thumb,
            k * 0.9,
          );
        }
        ctx.fillStyle = C.ink;
        setFont(ctx, row.itemSize, "600", design, "heading");
        ctx.textAlign = "left";
        row.name.lines.forEach((line, index) => {
          ctx.fillText(line, rowTextX, nameY + index * row.itemLine);
        });
        if (row.price) {
          setFont(ctx, row.itemSize, "600", design, "heading");
          const nameEndX = rowTextX + ctx.measureText(row.name.lines[0] || "").width;
          setFont(ctx, row.itemSize * 0.92, "600", design, "body");
          ctx.fillStyle = C.accent || C.muted;
          const priceX = column.x + columnW;
          const priceY = nameY;
          const priceStartX = priceX - tabularTextWidth(ctx, row.price);
          if (priceStartX - nameEndX >= 40 / Math.max(pxPerUnit, 0.1)) {
            ctx.save();
            ctx.strokeStyle = withAlpha(C.muted, 0.55);
            ctx.lineWidth = hair;
            ctx.setLineDash([hair, hair * 2.2]);
            ctx.beginPath();
            ctx.moveTo(nameEndX + k * 0.8, priceY - row.itemSize * 0.35);
            ctx.lineTo(priceStartX - k * 0.8, priceY - row.itemSize * 0.35);
            ctx.stroke();
            ctx.restore();
          }
          paintTabularText(ctx, row.price, priceX, priceY, "right");
        }
        if (row.description.lines.length) {
          const descY = nameY + row.name.lines.length * row.itemLine + k * 0.15;
          ctx.fillStyle = C.muted;
          setFont(ctx, row.descSize, "400", design, "body");
          row.description.lines.forEach((line, index) => {
            ctx.fillText(line, rowTextX, descY + index * row.descLine);
          });
        }
        y += row.h;
        if (y >= layout.bodyBottom) break;
      }
    }
  }
  ctx.restore();

  const footerTop = sheet.h - margin - footerH;
  ctx.strokeStyle = withAlpha(C.line, 0.9);
  ctx.lineWidth = hair;
  ctx.beginPath();
  ctx.moveTo(margin, footerTop);
  ctx.lineTo(margin + contentW, footerTop);
  ctx.stroke();

  const footerText = [design.contact, design.footerNote].filter(Boolean).join(" · ");
  if (footerText) {
    setFont(ctx, k * 1.55 * layout.scale, "400", design, "body");
    ctx.fillStyle = C.muted;
    const availableW = contentW - (qr ? qrSize + k * 3 : 0);
    const lines = wrapText(ctx, footerText, availableW, 2, renderEnv.cache, "mkh-footer");
    paintLines(ctx, lines.lines, margin + availableW / 2, footerTop + k * 2.7, k * 2.0 * layout.scale, "center");
  }
  if (qr) {
    const qrX = sheet.w - margin - qrSize;
    const qrY = sheet.h - margin - qrSize - k * 2.7;
    const qrImage = pickImage(renderEnv, data.qrUrl);
    if (qrImage) ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
    else {
      ctx.strokeStyle = C.line;
      ctx.lineWidth = hair;
      ctx.strokeRect(qrX, qrY, qrSize, qrSize);
    }
    if (data.qrCaption) {
      setFont(ctx, k * 1.2 * layout.scale, "500", design, "body");
      ctx.fillStyle = C.muted;
      const caption = fitOneLine(ctx, data.qrCaption, qrSize + k * 1.5, renderEnv.cache, "mkh-qr-caption");
      ctx.textAlign = "center";
      ctx.fillText(caption, qrX + qrSize / 2, qrY + qrSize + k * 1.8);
      ctx.textAlign = "left";
    }
  }

  return {
    fit,
    overflow: layout.overflow,
    layout: { content: { x: margin, y: layout.bodyTop, w: contentW, h: layout.bodyH }, columns: layout.columnsLayout },
    hotspots,
  };
}

function tabularTextWidth(ctx, text) {
  const digitWidths = Array.from({ length: 10 }, (_, i) =>
    ctx.measureText(String(i)).width,
  );
  const digitW = Math.max(...digitWidths);
  return Array.from(String(text)).reduce(
    (width, char) =>
      width + (/\d/.test(char) ? digitW : ctx.measureText(char).width),
    0,
  );
}

function paintTabularText(ctx, text, x, y, align) {
  const digitW = Math.max(
    ...Array.from({ length: 10 }, (_, i) => ctx.measureText(String(i)).width),
  );
  const chars = Array.from(String(text));
  const width = chars.reduce(
    (sum, char) =>
      sum + (/\d/.test(char) ? digitW : ctx.measureText(char).width),
    0,
  );
  let cursor = align === "right" ? x - width : x;
  for (const char of chars) {
    const charW = /\d/.test(char) ? digitW : ctx.measureText(char).width;
    if (/\d/.test(char)) {
      ctx.textAlign = "center";
      ctx.fillText(char, cursor + charW / 2, y);
    } else {
      ctx.textAlign = "left";
      ctx.fillText(char, cursor, y);
    }
    cursor += charW;
  }
  ctx.textAlign = "left";
}

function drawTrackedText(ctx, text, x, y, spacing) {
  let cursor = x;
  for (const char of Array.from(String(text))) {
    ctx.fillText(char, cursor, y);
    cursor += ctx.measureText(char).width + spacing;
  }
}

// ─── IMAGE HELPERS ───────────────────────────────────────────
function pickImage(env, url) {
  if (!url) return null;
  const entry = env.images.get(url);
  if (!entry || !entry.img) return null;
  if (!env.allowTainted && entry.corsOk === false) return null;
  return entry.img;
}

// Draw an image "cover"-cropped inside a box (optionally circular)
function drawCover(ctx, img, x, y, w, h, radius, shape = "rect") {
  ctx.save();
  if (shape === "circle") circle(ctx, x + w / 2, y + h / 2, Math.min(w, h) / 2);
  else roundRect(ctx, x, y, w, h, radius);
  ctx.clip();
  const ratio = img.width / img.height || 1;
  const box = w / h;
  let dw = w;
  let dh = h;
  let dx = x;
  let dy = y;
  if (ratio > box) {
    dh = h;
    dw = h * ratio;
    dx = x - (dw - w) / 2;
  } else {
    dw = w;
    dh = w / ratio;
    dy = y - (dh - h) / 2;
  }
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}
// ─── ONE-LINE TEXT (with ellipsis) ───────────────────────────
function fitOneLine(ctx, text, maxW, cache, cacheKey) {
  const key = `1|${maxW.toFixed(2)}|${ctx.font}|${text}`;
  if (cache && cache.has(key)) return cache.get(key);
  let value = String(text ?? "").replace(/\s+/g, " ").trim();
  if (ctx.measureText(value).width <= maxW) {
    if (cache) cache.set(key, value);
    return value;
  }
  const ellipsis = "…";
  let lo = 0;
  let hi = value.length;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (ctx.measureText(value.slice(0, mid) + ellipsis).width <= maxW) lo = mid;
    else hi = mid - 1;
  }
  value = value.slice(0, Math.max(1, lo)).trimEnd() + ellipsis;
  if (cache) cache.set(key, value);
  return value;
}

// ─── HEADER ──────────────────────────────────────────────────
function measureHeader(env, m) {
  const { design, data, sheet, style, ctx, cache } = env;
  const contentW = sheet.w - m.margin * 2;
  const centered = style.header !== "left" && style.header !== "band";
  const wantsLogo = design.showLogo && design.logoShape !== "none" && !!data.logoUrl;
  const logoSize = wantsLogo ? m.logo : 0;
  const logoImg = wantsLogo ? pickImage(env, data.logoUrl) : null;

  const titleText = String(design.title || data.restaurantName || "").trim();
  const textW =
    style.header === "band"
      ? contentW - m.pad * 2 - (logoSize ? logoSize + m.S(3) : 0)
      : contentW;

  // Auto-fit the restaurant name: shrink the title until it fits within
  // 2 lines instead of truncating (down to 62% of the metric size).
  let titleSize = m.title;
  setFont(ctx, titleSize, "700", design, "heading");
  let title = wrapText(ctx, titleText, textW, 2, cache, "h1");
  let titleGuard = 0;
  while (title.truncated && titleSize > m.title * 0.62 && titleGuard++ < 12) {
    titleSize *= 0.94;
    setFont(ctx, titleSize, "700", design, "heading");
    title = wrapText(ctx, titleText, textW, 2, cache, "h1");
  }
  setFont(ctx, m.subtitle, "400", design, "body");
  const subtitle = design.subtitle
    ? wrapText(ctx, design.subtitle, textW, 2, cache, "h2")
    : { lines: [], truncated: false };
  const contact = design.contact
    ? wrapText(ctx, design.contact, textW, 2, cache, "h3")
    : { lines: [], truncated: false };

  const titleLH = titleSize * 1.3; // same ratio as m.lineH(6.6) at full size
  const subLH = m.lineH(2.6);
  const contactLH = m.lineH(2.0);

  let textH = title.lines.length * titleLH;
  if (subtitle.lines.length) textH += m.S(1.3) + subtitle.lines.length * subLH;
  if (style.header === "band" && contact.lines.length)
    textH += m.S(1.0) + contact.lines.length * contactLH;

  const base = {
    type: style.header,
    centered,
    logoSize,
    logoImg,
    title,
    subtitle,
    contact,
    titleSize, // auto-fitted title size (may be < m.title)
    titleLH,
    subLH,
    contactLH,
    contentW,
  };

  if (style.header === "band") {
    const padY = m.S(3.6);
    return {
      ...base,
      h: Math.max(logoSize, textH) + padY * 2,
      padY,
      padX: m.pad,
    };
  }

  // Non-band headers (center / badge / left) all draw the logo ABOVE the
  // text — paintHeader advances cy by logoSize + m.S(2.8) before the title —
  // so the two heights ADD. The old else-branch used max(logoSize, textH),
  // which under-measured "left" headers by ~one logo height and let the
  // first body section paint on top of the restaurant title.
  let h = 0;
  if (logoImg || logoSize) h += logoSize + m.S(2.8);
  h += textH;
  if (contact.lines.length) h += m.S(1.8) + contact.lines.length * contactLH;
  h += m.S(2.6);
  return { ...base, h };
}

// ─── HEADER PAINTING ─────────────────────────────────────────
function paintHeader(env, layout) {
  const { ctx, design, style } = env;
  const { m, header, sheet } = layout;
  const C = design.colors;
  const x = m.margin;
  const y = m.margin;
  const w = header.contentW;
  const hair = Math.max(0.12, m.k * 0.16);

  // Solid accent band with the name inside it (the modern "hero" header)
  if (header.type === "band") {
    const radius = m.S(2.4) * Math.max(0.4, style.radius || 1) * 2;

    ctx.save();
    if (style.glow) {
      ctx.shadowColor = withAlpha(C.accent, 0.55);
      ctx.shadowBlur = m.S(3.2);
    }
    if (style.bandGradient) {
      // accent → darker accent: reads as a subtle brand gradient
      const grad = ctx.createLinearGradient(x, y, x + w, y + header.h);
      grad.addColorStop(0, C.accent);
      grad.addColorStop(1, mixHex(C.accent, C.ink, 0.35));
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = C.accent;
    }
    roundRect(ctx, x, y, w, header.h, radius);
    ctx.fill();
    ctx.restore();

    // soft decorative bubbles (modern / neon) — clipped inside the band
    if (style.bandDecor) {
      ctx.save();
      roundRect(ctx, x, y, w, header.h, radius);
      ctx.clip();
      ctx.fillStyle = withAlpha("#ffffff", 0.12);
      circle(ctx, x + w * 0.86, y + header.h * 0.16, header.h * 0.55);
      ctx.fill();
      ctx.fillStyle = withAlpha("#ffffff", 0.08);
      circle(ctx, x + w * 0.99, y + header.h * 0.9, header.h * 0.42);
      ctx.fill();
      ctx.restore();
    }

    const textColor = onColor(C.accent);
    let tx = x + m.pad * 1.2;
    if (header.logoSize) {
      const size = header.logoSize;
      const ly = y + header.h / 2 - size / 2;
      // respect the circle / square toggle (was hard-coded to a rounded rect)
      const circleLogo = design.logoShape === "circle";
      ctx.fillStyle = withAlpha("#ffffff", 0.95);
      if (circleLogo) circle(ctx, tx + size / 2, ly + size / 2, size / 2);
      else roundRect(ctx, tx, ly, size, size, size * 0.26);
      ctx.fill();
      if (header.logoImg)
        drawCover(
          ctx,
          header.logoImg,
          tx + size * 0.06,
          ly + size * 0.06,
          size * 0.88,
          size * 0.88,
          size * 0.2,
          circleLogo ? "circle" : "rect",
        );
      tx += size + m.S(3);
    }
    let cy = y + header.padY;
    const bandTextW =
      w - m.pad * 2 - (header.logoSize ? header.logoSize + m.S(3) : 0);
    ctx.fillStyle = textColor;
    setFont(ctx, header.titleSize, "700", design, "heading");
    addHotspot(
      env.hotspots,
      "title", tx, cy, bandTextW,
      header.title.lines.length * header.titleLH,
      header.titleSize, "left", textColor, ctx.font,
    );
    cy = paintLines(ctx, header.title.lines, tx, cy, header.titleLH, "left");
    if (header.subtitle.lines.length) {
      cy += m.S(0.8);
      ctx.fillStyle = withAlpha(textColor, 0.86);
      setFont(ctx, m.subtitle, "400", design, "body");
      addHotspot(
        env.hotspots,
        "subtitle", tx, cy, bandTextW,
        header.subtitle.lines.length * header.subLH,
        m.subtitle, "left", ctx.fillStyle, ctx.font,
      );
      cy = paintLines(ctx, header.subtitle.lines, tx, cy, header.subLH, "left");
    }
    if (header.contact.lines.length) {
      cy += m.S(0.6);
      ctx.fillStyle = withAlpha(textColor, 0.86);
      setFont(ctx, m.contact, "400", design, "body");
      addHotspot(
        env.hotspots,
        "contact", tx, cy, bandTextW,
        header.contact.lines.length * header.contactLH,
        m.contact, "left", ctx.fillStyle, ctx.font,
      );
      paintLines(ctx, header.contact.lines, tx, cy, header.contactLH, "left");
    }
    return;
  }

  const center = header.centered;
  const cx = x + w / 2;
  let cy = y;

  if (header.logoSize) {
    const size = header.logoSize;
    const lx = center ? cx - size / 2 : x;
    const circleLogo = design.logoShape === "circle";
    if (style.header === "badge") {
      // soft accent halo behind the logo — follows the circle/square toggle
      ctx.fillStyle = withAlpha(C.accent, 0.14);
      if (circleLogo) circle(ctx, lx + size / 2, cy + size / 2, size * 0.6);
      else roundRect(ctx, lx - size * 0.1, cy - size * 0.1, size * 1.2, size * 1.2, size * 0.34);
      ctx.fill();
      ctx.strokeStyle = withAlpha(C.accent, 0.6);
      ctx.lineWidth = hair * 1.5;
      if (circleLogo) circle(ctx, lx + size / 2, cy + size / 2, size * 0.55);
      else roundRect(ctx, lx - size * 0.05, cy - size * 0.05, size * 1.1, size * 1.1, size * 0.3);
      ctx.stroke();
    }
    if (header.logoImg) {
      // NOTE: "square" used to pass radius size*0.6, which roundRect clamps to
      // size/2 — i.e. it rendered a circle and the toggle appeared broken.
      drawCover(
        ctx,
        header.logoImg,
        lx,
        cy,
        size,
        size,
        circleLogo ? size / 2 : size * 0.18,
        circleLogo ? "circle" : "rect",
      );
    }
    cy += size + m.S(2.8);
  }

  ctx.fillStyle = C.ink;
  setFont(ctx, header.titleSize, "700", design, "heading");
  addHotspot(
    env.hotspots,
    "title", x, cy, w,
    header.title.lines.length * header.titleLH,
    header.titleSize, center ? "center" : "left", C.ink, ctx.font,
  );
  cy = paintLines(
    ctx,
    header.title.lines,
    center ? cx : x,
    cy,
    header.titleLH,
    center ? "center" : "left",
  );

  if (header.subtitle.lines.length) {
    cy += m.S(1.1);
    ctx.fillStyle = C.accent;
    setFont(ctx, m.subtitle, "500", design, "body");
    addHotspot(
      env.hotspots,
      "subtitle", x, cy, w,
      header.subtitle.lines.length * header.subLH,
      m.subtitle, center ? "center" : "left", C.accent, ctx.font,
    );
    cy = paintLines(
      ctx,
      header.subtitle.lines,
      center ? cx : x,
      cy,
      header.subLH,
      center ? "center" : "left",
    );
  }

  if (header.contact.lines.length) {
    cy += m.S(1.4);
    ctx.fillStyle = C.muted;
    setFont(ctx, m.contact, "400", design, "body");
    addHotspot(
      env.hotspots,
      "contact", x, cy, w,
      header.contact.lines.length * header.contactLH,
      m.contact, center ? "center" : "left", C.muted, ctx.font,
    );
    cy = paintLines(
      ctx,
      header.contact.lines,
      center ? cx : x,
      cy,
      header.contactLH,
      center ? "center" : "left",
    );
  }

  // Divider: short accent rule under the header (with a small diamond for
  // the "badge" look) — decorative, keeps every template heading anchored.
  cy += m.S(1.3);
  const ruleW = center ? Math.min(w * 0.5, m.S(48)) : w * 0.3;
  const rx = center ? cx - ruleW / 2 : x;
  ctx.strokeStyle = withAlpha(C.accent, 0.85);
  ctx.lineWidth = hair * 1.6;
  ctx.beginPath();
  ctx.moveTo(rx, cy);
  ctx.lineTo(rx + ruleW, cy);
  ctx.stroke();

  if (style.header === "badge") {
    const d = m.S(0.9);
    ctx.fillStyle = C.accent;
    ctx.beginPath();
    ctx.moveTo(rx + ruleW / 2, cy - d);
    ctx.lineTo(rx + ruleW / 2 + d, cy);
    ctx.lineTo(rx + ruleW / 2, cy + d);
    ctx.lineTo(rx + ruleW / 2 - d, cy);
    ctx.closePath();
    ctx.fill();
  }
}

// ─── LAYOUT ──────────────────────────────────────────────────
function layoutMenu(env, fit) {
  const { sheet } = env;
  const m = metrics(env, fit);
  const header = measureHeader(env, m);
  const footer = measureFooter(env, m);

  const contentTop = m.margin + header.h + m.S(3.4);
  const contentBottom = sheet.h - m.margin - footer.h;
  const content = {
    x: m.margin,
    y: contentTop,
    w: Math.max(m.S(24), sheet.w - m.margin * 2),
    h: Math.max(m.S(12), contentBottom - contentTop),
  };

  const grid = env.style.item === "photo-card";
  const body = grid
    ? layoutGrid(env, m, content)
    : layoutColumns(env, m, content);

  return { env, m, fit, sheet: env.sheet, header, footer, content, grid, ...body };
}
function metrics(env, fit) {
  const { sheet, design } = env;
  const k = Math.min(sheet.w, sheet.h) / 100;
  const fs = design.fontScale * fit;
  const titleScale = Math.max(0.3, Math.min(1.5, Number(design.titleScale) || 1));
  const categoryScale = Math.max(0.3, Math.min(1.5, Number(design.categoryScale) || 1));
  const itemScale = Math.max(0.3, Math.min(1.5, Number(design.itemScale) || 1));
  const logoScale = Math.max(0.3, Math.min(1.5, Number(design.logoScale) || 1));
  const itemImageScale = Math.max(0.3, Math.min(1.5, Number(design.itemImageScale) || 1));
  const S = (coef) => coef * k * fs;
  return {
    k,
    fs,
    S,
    lineH: (coef) => S(coef) * 1.3,
    title: S(6.6) * titleScale,
    subtitle: S(2.6),
    contact: S(2.0),
    section: S(3.0),
    category: Math.max(0.3, Math.min(1.5, Number(design.categoryScale) || 1)),
    item: S(2.6) * itemScale,
    small: S(1.9),
    micro: S(1.6),
    margin: S(6.2) * design.margins,
    colGap: S(5),
    itemGap: S(1.9),
    sectionTop: S(4.0),
    sectionBottom: S(1.6),
    logo: S(13) * logoScale,
    thumb: S(11) * itemImageScale,
    qr: S(15),
    pad: S(2.2),
  };
}

// ─── FOOTER ──────────────────────────────────────────────────
function measureFooter(env, m) {
  const { design, sheet, ctx, cache, data } = env;
  const contentW = sheet.w - m.margin * 2;
  const qrSize = design.showQr ? m.qr * Math.max(0.3, Math.min(1.5, Number(design.qrScale) || 1)) : 0;
  const noteW = Math.max(m.S(24), contentW - (qrSize ? qrSize + m.S(3) : 0));

  setFont(ctx, m.small, "500", design, "body");
  const note = design.footerNote
    ? wrapText(ctx, design.footerNote, noteW, 3, cache, "ft1")
    : { lines: [], truncated: false };

  const noteLH = m.lineH(1.9);
  const capLH = m.lineH(1.6);
  const qrCaption = qrSize && data.qrCaption
    ? (() => {
        setFont(ctx, m.micro, "600", design, "body");
        return wrapText(
          ctx,
          data.qrCaption,
          qrSize + m.S(4),
          2,
          cache,
          "qrc",
        );
      })()
    : { lines: [] };
  const qrBlock = qrSize
    ? qrSize + (qrCaption.lines.length ? qrCaption.lines.length * capLH + m.S(0.4) : 0)
    : 0;
  const leftBlock = note.lines.length ? note.lines.length * noteLH : 0;
  const brand = design.showBrand ? m.lineH(1.6) + m.S(1.6) : 0;

  return {
    h: Math.max(qrBlock, leftBlock) + brand + m.S(2.2),
    qrSize,
    qrBlock,
    note,
    noteLH,
    capLH,
    qrCaption,
    brand,
    noteW,
  };
}

function paintFooter(env, layout) {
  const { ctx, design, data } = env;
  const { m, footer, sheet } = layout;
  const C = design.colors;
  const x = m.margin;
  const w = sheet.w - m.margin * 2;
  const top = sheet.h - m.margin - footer.h + m.S(2.2);

  // thin separator above the footer
  ctx.strokeStyle = withAlpha(C.line, 0.95);
  ctx.lineWidth = Math.max(0.1, m.k * 0.14);
  ctx.beginPath();
  ctx.moveTo(x, top - m.S(1.6));
  ctx.lineTo(x + w, top - m.S(1.6));
  ctx.stroke();

  if (footer.note.lines.length) {
    ctx.fillStyle = C.muted;
    setFont(ctx, m.small, "500", design, "body");
    paintLines(ctx, footer.note.lines, x, top, footer.noteLH, "left");
  }

  if (footer.qrSize) {
    const size = footer.qrSize;
    const qx = x + w - size;
    const qy = top;
    ctx.fillStyle = "#ffffff";
    roundRect(
      ctx,
      qx - m.S(0.6),
      qy - m.S(0.6),
      size + m.S(1.2),
      size + m.S(1.2),
      m.S(1),
    );
    ctx.fill();
    const qrImg = pickImage(env, data.qrUrl);
    if (qrImg) ctx.drawImage(qrImg, qx, qy, size, size);
    else {
      // placeholder while the QR is still being generated
      ctx.strokeStyle = withAlpha(C.line, 1);
      ctx.lineWidth = Math.max(0.1, m.k * 0.12);
      ctx.strokeRect(qx, qy, size, size);
    }
    if (footer.qrCaption.lines.length) {
      ctx.fillStyle = C.muted;
      setFont(ctx, m.micro, "600", design, "body");
      paintLines(
        ctx,
        footer.qrCaption.lines,
        qx + size / 2,
        qy + size + m.S(0.4),
        footer.capLH,
        "center",
      );
      ctx.textAlign = "left";
    }
  }

  if (footer.brand && data.brandText) {
    ctx.fillStyle = withAlpha(C.muted, 0.9);
    setFont(ctx, m.micro, "500", design, "body");
    ctx.textAlign = "center";
    ctx.fillText(data.brandText, x + w / 2, sheet.h - m.margin - m.S(0.2));
    ctx.textAlign = "left";
  }
}



// ─── SECTION TITLES ──────────────────────────────────────────
function measureSection(env, m, cat, colW, index = 0) {
  const { ctx, design, style } = env;
  const sectionSize = m.section * m.category;
  const size = style.section === "hairline" ? sectionSize * 0.82 : sectionSize;
  setFont(ctx, size, "700", design, "heading");
  const label = fitOneLine(
    ctx,
    cat.label,
    Math.max(m.S(20), colW - m.S(8)),
    env.cache,
    "sec",
  );
  // One line of this label (a paragraph's height is 1.3 × the font size)
  const lineH = size * 1.3;
  const h = style.section === "hairline" ? lineH * 0.95 : lineH;
  let extra = m.S(1.1);
  if (style.section === "bar" || style.section === "chip") extra = m.S(1.8);
  else if (style.section === "hairline") extra = m.S(1.5);
  else if (style.section === "numbered") extra = m.S(1.2);
  return {
    kind: "section",
    label,
    index,
    number: String(index + 1).padStart(2, "0"),
    countText: cat.items.length ? String(cat.items.length) : "",
    h: h + extra + m.sectionBottom,
  };
}

function paintSection(env, layout, block, x, y, colW) {
  const { ctx, design, style } = env;
  const { m } = layout;
  const C = design.colors;
  const sectionSize = m.section * m.category;
  const size = style.section === "hairline" ? sectionSize * 0.82 : sectionSize;
  const lineH = size * 1.3;
  const hair = Math.max(0.12, m.k * 0.16);
  setFont(ctx, size, "700", design, "heading");
  const label = block.label;
  const textW = ctx.measureText(label).width;

  // "hairline" — small quiet label over a full-width rule (minimal look)
  if (style.section === "hairline") {
    ctx.fillStyle = C.ink;
    ctx.fillText(label, x, y + lineH * 0.8);
    if (block.countText) {
      ctx.fillStyle = withAlpha(C.muted, 1);
      setFont(ctx, m.micro, "600", design, "body");
      ctx.fillText(
        block.countText,
        x + colW - ctx.measureText(block.countText).width,
        y + lineH * 0.8,
      );
    }
    const uy = y + lineH + m.S(0.7);
    ctx.strokeStyle = withAlpha(C.ink, 0.85);
    ctx.lineWidth = hair * 1.6;
    ctx.beginPath();
    ctx.moveTo(x, uy);
    ctx.lineTo(x + colW, uy);
    ctx.stroke();
    return;
  }

  // "numbered" — editorial "01 / Category" with a rule running to the end
  if (style.section === "numbered") {
    ctx.fillStyle = C.accent;
    setFont(ctx, size * 0.8, "700", design, "heading");
    const numW = ctx.measureText(block.number).width;
    ctx.fillText(block.number, x, y + lineH * 0.78);

    setFont(ctx, size, "700", design, "heading");
    ctx.fillStyle = C.ink;
    ctx.fillText(label, x + numW + m.S(1.8), y + lineH * 0.78);

    const startX = x + numW + m.S(1.8) + textW + m.S(1.8);
    const endX = x + colW;
    if (endX > startX) {
      ctx.strokeStyle = withAlpha(C.line, 1);
      ctx.lineWidth = hair;
      ctx.beginPath();
      ctx.moveTo(startX, y + lineH * 0.55);
      ctx.lineTo(endX, y + lineH * 0.55);
      ctx.stroke();
    }
    return;
  }

  if (style.section === "bar") {
    const barH = lineH + m.S(0.9);
    const barY = y + m.S(0.2);
    const radius = Math.min(m.S(0.8), barH / 2);

    // tinted rounded bar with a leading accent stripe + a count chip
    ctx.save();
    if (style.glow) {
      ctx.shadowColor = withAlpha(C.accent, 0.45);
      ctx.shadowBlur = m.S(2.4);
    }
    ctx.fillStyle = withAlpha(C.accent, style.glow ? 0.2 : 0.13);
    roundRect(ctx, x - m.S(1), barY, colW + m.S(2), barH, radius);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = C.accent;
    roundRect(ctx, x - m.S(1), barY, m.S(1.1), barH, radius);
    ctx.fill();

    ctx.fillStyle = onColor(C.bg);
    ctx.fillText(label, x + m.S(1.9), barY + lineH * 0.78);

    if (block.countText) {
      setFont(ctx, m.micro, "700", design, "body");
      const chipPad = m.S(1.2);
      const chipW = ctx.measureText(block.countText).width + chipPad * 2;
      const chipH = lineH * 0.78;
      const chipX = x + colW + m.S(1) - chipW;
      const chipY = barY + (barH - chipH) / 2;
      ctx.fillStyle = withAlpha(C.accent, 0.22);
      roundRect(ctx, chipX, chipY, chipW, chipH, chipH / 2);
      ctx.fill();
      ctx.fillStyle = C.accent;
      ctx.fillText(
        block.countText,
        chipX + chipPad,
        chipY + chipH * 0.78,
      );
    }
    return;
  }

  if (style.section === "chip") {
    const padX = m.S(2.4);
    const pillH = lineH + m.S(0.8);
    ctx.save();
    if (style.glow) {
      ctx.shadowColor = withAlpha(C.accent, 0.5);
      ctx.shadowBlur = m.S(2.6);
    }
    ctx.fillStyle = C.accent;
    roundRect(ctx, x, y + m.S(0.2), textW + padX * 2, pillH, pillH / 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = onColor(C.accent);
    ctx.fillText(label, x + padX, y + m.S(0.2) + lineH * 0.78);
    if (block.countText) {
      setFont(ctx, m.micro, "700", design, "body");
      const chipPad = m.S(1.1);
      const chipW = ctx.measureText(block.countText).width + chipPad * 2;
      const chipH = lineH * 0.74;
      const chipX = x + textW + padX * 2 + m.S(1.6);
      const chipY = y + m.S(0.2) + (pillH - chipH) / 2;
      ctx.fillStyle = withAlpha(C.accent, 0.18);
      roundRect(ctx, chipX, chipY, chipW, chipH, chipH / 2);
      ctx.fill();
      ctx.fillStyle = C.accent;
      ctx.fillText(block.countText, chipX + chipPad, chipY + chipH * 0.78);
    }
    return;
  }

  if (style.section === "ornament") {
    const cx = x + colW / 2;
    ctx.fillStyle = C.ink;
    ctx.textAlign = "center";
    ctx.fillText(label, cx, y + m.S(0.1) + lineH * 0.78);
    ctx.textAlign = "left";
    const ruleW = Math.min(colW * 0.2, m.S(20));
    const ry = y + m.S(0.1) + lineH * 0.45;
    ctx.strokeStyle = withAlpha(C.accent, 0.75);
    ctx.lineWidth = hair * 1.2;
    ctx.beginPath();
    ctx.moveTo(x, ry);
    ctx.lineTo(x + colW * 0.34 - ruleW, ry);
    ctx.moveTo(x + colW * 0.66 + ruleW, ry);
    ctx.lineTo(x + colW, ry);
    ctx.stroke();
    const d = m.S(0.7);
    for (const dx of [
      x + colW * 0.34 - ruleW + m.S(1),
      x + colW * 0.66 + ruleW - m.S(1),
    ]) {
      ctx.fillStyle = C.accent;
      ctx.beginPath();
      ctx.moveTo(dx, ry - d);
      ctx.lineTo(dx + d, ry);
      ctx.lineTo(dx, ry + d);
      ctx.lineTo(dx - d, ry);
      ctx.closePath();
      ctx.fill();
    }
    return;
  }

  // "label" (default): accent text + thin underline across the column
  ctx.fillStyle = C.accent;
  ctx.fillText(label, x, y + lineH * 0.78);
  if (block.countText) {
    ctx.fillStyle = C.muted;
    setFont(ctx, m.micro, "600", design, "body");
    ctx.fillText(block.countText, x + textW + m.S(1.6), y + lineH * 0.78);
  }
  const uy = y + lineH + m.S(0.3);
  ctx.strokeStyle = withAlpha(C.line, 1);
  ctx.lineWidth = hair;
  ctx.beginPath();
  ctx.moveTo(x, uy);
  ctx.lineTo(x + colW, uy);
  ctx.stroke();
}

// ─── ITEM ROWS ───────────────────────────────────────────────
function measureItem(env, m, item, colW) {
  const { ctx, design, style } = env;
  const lh = m.lineH(2.6);
  const priceText = design.showPrice ? item.priceText || "" : "";

  setFont(ctx, m.item, "700", design, "heading");
  const rawPriceW = priceText ? ctx.measureText(priceText).width : 0;

  // "photo" puts the price on its own line under the name,
  // "pill" wraps it in a rounded chip inside the row
  const pill = style.item === "pill";
  const pillH = lh * 0.95;
  const priceW = pill && priceText ? rawPriceW + m.S(3) : rawPriceW;
  const thumb =
    style.item === "photo" && design.showImages && item.img ? m.thumb : 0;
  const textW = Math.max(
    m.S(10),
    colW - thumb - (thumb ? m.S(2.4) : priceW ? priceW + m.S(2.4) : 0),
  );

  setFont(ctx, m.item, "600", design, "heading");
  const nameLines = wrapText(
    ctx,
    item.name,
    textW,
    2,
    env.cache,
    `n${item.id}`,
  );

  let h;
  if (style.item === "photo") {
    h = Math.max(thumb, nameLines.lines.length * lh + (priceText ? lh * 0.85 : 0));
  } else if (pill) {
    h = Math.max(nameLines.lines.length * lh, pillH);
  } else {
    h = nameLines.lines.length * lh;
    if (style.item === "card") h += m.pad * 2;
  }

  return {
    kind: "item",
    item,
    nameLines,
    priceText,
    priceW,
    rawPriceW,
    pillH,
    textW,
    thumb,
    lh,
    h: h + m.itemGap,
  };
}

// Items are drawn by `paintItemBody`; this thin wrapper adds the optional
// hairline between rows (modern / bloom) once, for every item style.
function paintItem(env, layout, block, x, y, colW) {
  paintItemBody(env, layout, block, x, y, colW);

  if (env.style.itemDivider) {
    const { m } = layout;
    const dy = y + block.h - m.itemGap * 0.5;
    const ctx = env.ctx;
    ctx.strokeStyle = withAlpha(env.design.colors.line, 1);
    ctx.lineWidth = Math.max(0.08, m.k * 0.1);
    ctx.beginPath();
    ctx.moveTo(x, dy);
    ctx.lineTo(x + colW, dy);
    ctx.stroke();
  }
}

function paintItemBody(env, layout, block, x, y, colW) {
  const { ctx, design, style } = env;
  const { m } = layout;
  const C = design.colors;
  const item = block.item;
  const hair = Math.max(0.1, m.k * 0.14);

  // "pill" — the modern row: name on the left, price inside a rounded chip
  if (style.item === "pill") {
    ctx.fillStyle = C.ink;
    setFont(ctx, m.item, "600", design, "heading");
    paintLines(ctx, block.nameLines.lines, x, y, block.lh, "left");

    if (block.priceText) {
      const pillW = block.priceW;
      const pillH = block.pillH;
      const px = x + colW - pillW;
      const py = y + (block.lh - pillH) / 2;

      ctx.save();
      if (style.glow) {
        ctx.shadowColor = withAlpha(C.accent, 0.4);
        ctx.shadowBlur = m.S(1.6);
      }
      ctx.fillStyle = withAlpha(C.accent, 0.14);
      roundRect(ctx, px, py, pillW, pillH, pillH / 2);
      ctx.fill();
      ctx.restore();

      setFont(ctx, m.item * 0.92, "700", design, "heading");
      ctx.fillStyle = C.accent;
      ctx.textAlign = "center";
      ctx.fillText(block.priceText, px + pillW / 2, py + pillH * 0.74);
      ctx.textAlign = "left";
    }
    return;
  }

  if (style.item === "photo") {
    if (block.thumb) {
      const img = pickImage(env, item.img);
      const r = design.logoShape === "circle" ? block.thumb / 2 : block.thumb * 0.35;
      if (img)
        drawCover(
          ctx,
          img,
          x,
          y + m.S(0.4),
          block.thumb,
          block.thumb,
          r,
          design.logoShape === "circle" ? "circle" : "rect",
        );
      else {
        ctx.fillStyle = withAlpha(C.accent, 0.12);
        roundRect(ctx, x, y + m.S(0.4), block.thumb, block.thumb, r);
        ctx.fill();
      }
    }
    const tx = x + (block.thumb ? block.thumb + m.S(2.4) : 0);
    ctx.fillStyle = C.ink;
    setFont(ctx, m.item, "600", design, "heading");
    let cy = paintLines(ctx, block.nameLines.lines, tx, y, block.lh, "left");
    if (block.priceText) {
      ctx.fillStyle = C.accent;
      setFont(ctx, m.item * 0.92, "700", design, "heading");
      cy = paintLines(
        ctx,
        [block.priceText],
        tx,
        cy + m.S(0.2),
        block.lh * 0.9,
        "left",
      );
    }
    return;
  }

  if (style.item === "card") {
    const h = block.h - m.itemGap;
    ctx.save();
    if (style.glow) {
      ctx.shadowColor = withAlpha(C.accent, 0.35);
      ctx.shadowBlur = m.S(2.2);
    }
    ctx.fillStyle = C.panel;
    roundRect(ctx, x - m.S(0.8), y, colW + m.S(1.6), h, m.S(1.4) * (style.radius || 1));
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = withAlpha(style.glow ? C.accent : C.line, style.glow ? 0.45 : 1);
    ctx.lineWidth = hair;
    ctx.stroke();

    ctx.fillStyle = C.ink;
    setFont(ctx, m.item, "600", design, "heading");
    paintLines(
      ctx,
      block.nameLines.lines,
      x + m.pad * 0.7,
      y + m.pad * 0.75,
      block.lh,
      "left",
    );
    if (block.priceText) {
      // price as a tinted chip inside the card
      setFont(ctx, m.item * 0.92, "700", design, "heading");
      const chipPad = m.S(1.2);
      const chipW = ctx.measureText(block.priceText).width + chipPad * 2;
      const chipH = block.lh * 0.85;
      const chipX = x + colW - m.pad * 0.4 - chipW;
      const chipY = y + m.pad * 0.75 + (block.lh - chipH) / 2;
      ctx.fillStyle = withAlpha(C.accent, 0.16);
      roundRect(ctx, chipX, chipY, chipW, chipH, chipH / 2);
      ctx.fill();
      ctx.fillStyle = C.accent;
      ctx.fillText(block.priceText, chipX + chipPad, chipY + chipH * 0.76);
    }
    return;
  }

  // leader (dotted price leader) and row (plain, right-aligned price)
  ctx.fillStyle = C.ink;
  setFont(ctx, m.item, "600", design, "heading");
  const firstLine = block.nameLines.lines[0] || "";
  ctx.fillText(firstLine, x, y + block.lh * 0.78);
  if (block.nameLines.lines.length > 1) {
    let cy = y + block.lh;
    for (let i = 1; i < block.nameLines.lines.length; i++) {
      ctx.fillText(block.nameLines.lines[i], x, cy + block.lh * 0.78);
      cy += block.lh;
    }
  }
  if (!block.priceText) return;

  const px = x + colW;
  setFont(ctx, m.item, "700", design, "heading");
  ctx.fillStyle = C.accent;
  ctx.textAlign = "right";
  ctx.fillText(block.priceText, px, y + block.lh * 0.78);
  ctx.textAlign = "left";

  if (style.item === "leader") {
    const nameW = ctx.measureText(firstLine).width;
    const startX = x + nameW + m.S(1.2);
    const endX = px - block.priceW - m.S(1.2);
    if (endX > startX) {
      ctx.save();
      ctx.strokeStyle = withAlpha(C.muted, 0.55);
      ctx.lineWidth = hair;
      ctx.setLineDash([hair * 0.6, hair * 2.2]);
      ctx.beginPath();
      ctx.moveTo(startX, y + block.lh * 0.62);
      ctx.lineTo(endX, y + block.lh * 0.62);
      ctx.stroke();
      ctx.restore();
    }
  }
}

// ─── BODY — BALANCED COLUMNS ─────────────────────────────────
// Section titles + item rows flow top-to-bottom into 1-5 balanced columns.
function layoutColumns(env, m, content) {
  const { design, data } = env;
  const cols = Math.max(1, Math.min(5, design.columns));
  const colW = (content.w - m.colGap * (cols - 1)) / cols;

  const blocks = [];
  data.categories.forEach((cat, index) => {
    blocks.push(measureSection(env, m, cat, colW, index));
    for (const item of cat.items) blocks.push(measureItem(env, m, item, colW));
  });

  const columns = [];
  for (let i = 0; i < cols; i++) {
    columns.push({
      x: content.x + i * (colW + m.colGap),
      w: colW,
      blocks: [],
      h: 0,
    });
  }

  let ci = 0;
  for (const block of blocks) {
    const col = columns[ci];
    const canAdvance = ci < cols - 1 && col.h > 0;
    if (canAdvance && col.h + block.h > content.h) {
      // Never leave a category title dangling at the bottom of a column
      const last = col.blocks[col.blocks.length - 1];
      if (last && last.kind === "section" && col.blocks.length > 1) {
        col.blocks.pop();
        col.h -= last.h;
        ci += 1;
        columns[ci].blocks.push(last);
        columns[ci].h += last.h;
      } else {
        ci += 1;
      }
    }
    columns[ci].blocks.push(block);
    columns[ci].h += block.h;
  }

  let overflow = false;
  for (const col of columns) {
    if (col.h - m.itemGap > content.h + m.S(0.4)) overflow = true;
  }
  return { columns, overflow };
}

function paintColumnBody(env, layout) {
  const { ctx } = env;
  const { m, content, columns } = layout;

  // Clip so a slightly overflowing last row can never bleed into the footer.
  ctx.save();
  ctx.beginPath();
  ctx.rect(content.x - m.S(1), content.y, content.w + m.S(2), content.h + m.S(0.6));
  ctx.clip();

  for (const col of columns) {
    let y = content.y;
    for (const block of col.blocks) {
      if (block.kind === "section")
        paintSection(env, layout, block, col.x, y, col.w);
      else paintItem(env, layout, block, col.x, y, col.w);
      y += block.h;
      if (y > content.y + content.h + m.S(1)) break;
    }
  }
  ctx.restore();
}

// ─── BODY — PHOTO CARD GRID ──────────────────────────────────
// Used by photo-first templates: category titles span the full width and the
// dishes are laid out as picture cards underneath.
function layoutGrid(env, m, content) {
  const { design, data } = env;
  const cols = Math.max(1, Math.min(5, design.columns));
  const gap = m.colGap;
  const cardW = (content.w - gap * (cols - 1)) / cols;
  // Image height scales with the auto-fit factor too, otherwise photo
  // templates could never shrink enough to fit a crowded sheet.
  const imgH = cardW * 0.56 * Math.min(1, m.fs);
  const nameLineH = m.item * 1.3;
  const priceFontSize = m.item * 0.95;
  const textPad = m.pad * 0.7;
  const cardH = imgH + textPad * 2 + nameLineH;

  const rows = [];
  let y = content.y;
  data.categories.forEach((cat, index) => {
    const sec = measureSection(env, m, cat, content.w, index);
    rows.push({ kind: "section", block: sec, x: content.x, y, w: content.w, h: sec.h });
    y += sec.h;
    let col = 0;
    let rowY = y;
    for (const item of cat.items) {
      rows.push({
        kind: "card",
        item,
        x: content.x + col * (cardW + gap),
        y: rowY,
        w: cardW,
        h: cardH,
        imgH: imgH,
      });
      col += 1;
      if (col === cols) {
        col = 0;
        rowY += cardH + gap;
      }
    }
    if (col !== 0) rowY += cardH + gap;
    y = rowY;
  });

  const overflow = y - gap > content.y + content.h + m.S(0.4);
  return { rows, overflow };
}

function paintGridBody(env, layout) {
  const { ctx, design } = env;
  const { m, content, rows } = layout;
  const C = design.colors;
  const style = env.style;
  const hair = Math.max(0.1, m.k * 0.14);

  ctx.save();
  ctx.beginPath();
  ctx.rect(content.x - m.S(1), content.y, content.w + m.S(2), content.h + m.S(0.6));
  ctx.clip();

  for (const row of rows) {
    if (row.kind === "section") {
      paintSection(env, layout, row.block, row.x, row.y, row.w);
      continue;
    }
    const item = row.item;
    const textPad = m.pad * 0.7;
    const priceFontSize = m.item * 0.95;
    const gap = m.pad * 0.5;
    let nameW = row.w - textPad * 2;
    let priceW = 0;
    if (design.showPrice && item.priceText) {
      setFont(ctx, priceFontSize, "700", design, "heading");
      priceW = ctx.measureText(item.priceText).width;
      nameW = Math.max(m.S(8), nameW - priceW - gap);
    }

    const radius = m.S(1.6) * (style.radius || 1);
    ctx.fillStyle = C.panel;
    roundRect(ctx, row.x, row.y, row.w, row.h, radius);
    ctx.fill();
    ctx.strokeStyle = withAlpha(C.line, 1);
    ctx.lineWidth = hair;
    ctx.stroke();

    const img = design.showImages ? pickImage(env, item.img) : null;
    if (img) {
      drawCover(ctx, img, row.x, row.y, row.w, row.imgH, radius);
    } else {
      ctx.fillStyle = withAlpha(C.accent, 0.14);
      roundRect(ctx, row.x, row.y, row.w, row.imgH, radius);
      ctx.fill();
    }

    setFont(ctx, m.item, "600", design, "heading");
    ctx.fillStyle = C.ink;
    const name = fitOneLine(
      ctx,
      item.name,
      nameW,
      env.cache,
      `c${item.id}`,
    );
    const textX = row.x + textPad;
    const nameY = row.y + row.imgH + textPad + m.item;
    ctx.fillText(name, textX, nameY);

    if (design.showPrice && item.priceText) {
      const priceX = row.x + row.w - textPad;
      let priceSize = priceFontSize;
      setFont(ctx, priceSize, "700", design, "heading");
      while (
        ctx.measureText(item.priceText).width > priceW &&
        priceSize > priceFontSize * 0.6
      ) {
        priceSize *= 0.9;
        setFont(ctx, priceSize, "700", design, "heading");
      }
      ctx.fillStyle = C.accent;
      ctx.textAlign = "right";
      ctx.fillText(
        item.priceText,
        priceX,
        nameY,
      );
      ctx.textAlign = "left";
    }
  }
  ctx.restore();
}

// ─── BACKGROUND DECORATION ───────────────────────────────────
// Template-specific texture + frame. Drawn before anything else so the
// content always sits on top of it.
function paintBackground(env, layout) {
  const { ctx, design, sheet, style } = env;
  const { m } = layout;
  const C = design.colors;
  const k = m.k;
  const W = sheet.w;
  const H = sheet.h;

  if (style.pattern === "dots") {
    const step = m.S(4.2);
    const r = Math.max(0.1, k * 0.16);
    ctx.fillStyle = withAlpha(C.line, 0.9);
    for (let y = step; y < H; y += step) {
      for (let x = step; x < W; x += step) {
        circle(ctx, x, y, r);
        ctx.fill();
      }
    }
  } else if (style.pattern === "rays") {
    const soft = isLight(C.bg) ? 0.16 : 0.24;
    const g1 = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(W, H) * 0.9);
    g1.addColorStop(0, withAlpha(C.accent, soft));
    g1.addColorStop(1, withAlpha(C.accent, 0));
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);

    const g2 = ctx.createRadialGradient(W, H, 0, W, H, Math.max(W, H) * 0.7);
    g2.addColorStop(0, withAlpha(C.accent, soft * 0.7));
    g2.addColorStop(1, withAlpha(C.accent, 0));
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, H);
  } else if (style.pattern === "kbach") {
    // Khmer-inspired corner motifs + ticked edges (subtle, print friendly)
    const ink = withAlpha(C.accent, isLight(C.bg) ? 0.32 : 0.45);
    const size = m.S(9);
    ctx.strokeStyle = ink;
    ctx.fillStyle = ink;
    ctx.lineWidth = Math.max(0.12, k * 0.18);

    const corner = (cx, cy, sx, sy) => {
      for (let i = 0; i < 3; i++) {
        const s = size * (1 - i * 0.28);
        ctx.beginPath();
        ctx.moveTo(cx + sx * s, cy + sy * size * 0.1);
        ctx.quadraticCurveTo(
          cx + sx * s * 0.45,
          cy + sy * s * 0.45,
          cx + sx * size * 0.1,
          cy + sy * s,
        );
        ctx.stroke();
      }
      const d = size * 0.16;
      ctx.beginPath();
      ctx.moveTo(cx + sx * size * 0.55, cy + sy * size * 0.12);
      ctx.lineTo(cx + sx * (size * 0.55 + d), cy + sy * size * 0.12);
      ctx.lineTo(cx + sx * size * 0.55, cy + sy * (size * 0.12 + d));
      ctx.closePath();
      ctx.fill();
    };
    corner(m.margin * 0.45, m.margin * 0.45, 1, 1);
    corner(W - m.margin * 0.45, m.margin * 0.45, -1, 1);
    corner(m.margin * 0.45, H - m.margin * 0.45, 1, -1);
    corner(W - m.margin * 0.45, H - m.margin * 0.45, -1, -1);
  }

  if (style.frame === "bar-top") {
    ctx.fillStyle = C.accent;
    ctx.fillRect(0, 0, W, m.S(2.2));
  } else if (style.frame === "thin") {
    const inset = m.margin * 0.42;
    ctx.strokeStyle = withAlpha(C.accent, 0.5);
    ctx.lineWidth = Math.max(0.12, k * 0.18);
    ctx.strokeRect(inset, inset, W - inset * 2, H - inset * 2);
  } else if (style.frame === "double") {
    const a = m.margin * 0.34;
    const b = m.margin * 0.5;
    ctx.strokeStyle = withAlpha(C.accent, 0.55);
    ctx.lineWidth = Math.max(0.14, k * 0.28);
    ctx.strokeRect(a, a, W - a * 2, H - a * 2);
    ctx.strokeStyle = withAlpha(C.accent, 0.35);
    ctx.lineWidth = Math.max(0.08, k * 0.12);
    ctx.strokeRect(b, b, W - b * 2, H - b * 2);
  } else if (style.frame === "ornate") {
    const inset = m.margin * 0.4;
    const len = m.S(12);
    ctx.strokeStyle = withAlpha(C.accent, 0.75);
    ctx.lineWidth = Math.max(0.14, k * 0.26);
    const pts = [
      [inset, inset, 1, 1],
      [W - inset, inset, -1, 1],
      [inset, H - inset, 1, -1],
      [W - inset, H - inset, -1, -1],
    ];
    for (const [px, py, sx, sy] of pts) {
      ctx.beginPath();
      ctx.moveTo(px + sx * len, py);
      ctx.lineTo(px, py);
      ctx.lineTo(px, py + sy * len);
      ctx.stroke();
    }
  }
}
