// ─────────────────────────────────────────────────────────────
// Menu Studio — export helpers.
//
// Everything here works without any external library:
//   • PNG / JPEG      → canvas.toBlob
//   • PDF             → a minimal PDF 1.4 file that embeds the JPEG
//                       pages (each output page is exactly the selected size)
//   • Print           → a hidden iframe with an @page rule in mm
// ─────────────────────────────────────────────────────────────

const MM_PER_INCH = 25.4;

export function canvasToBlob(canvas, type = "image/png", quality) {
  return new Promise((resolve) => {
    if (canvas.toBlob) canvas.toBlob((blob) => resolve(blob), type, quality);
    else resolve(dataUrlToBlob(canvas.toDataURL(type, quality)));
  });
}

export function dataUrlToBlob(dataUrl) {
  const [head, body] = String(dataUrl).split(",");
  const mime = /:(.*?);/.exec(head)?.[1] || "application/octet-stream";
  const bin = atob(body);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function downloadDataUrl(dataUrl, filename) {
  downloadBlob(dataUrlToBlob(dataUrl), filename);
}

export async function copyCanvasToClipboard(canvas) {
  try {
    if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined")
      return false;
    const blob = await canvasToBlob(canvas, "image/png");
    if (!blob) return false;
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return true;
  } catch {
    return false;
  }
}

export function dataUrlToBytes(dataUrl) {
  const body = String(dataUrl).split(",")[1] || "";
  const bin = atob(body);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

// Keep PDF strings simple/safe (text is optional metadata only)
function pdfString(value) {
  return String(value).replace(/[\\()]/g, " ").slice(0, 120);
}


// ─── MINIMAL PDF (one JPEG per page) ──────────────────────────
export function buildPdfFromJpegs(jpegs, widthMm, heightMm, title = "Menu") {
  if (!jpegs.length) throw new Error("PDF requires at least one page");
  const enc = new TextEncoder();
  const wPt = (Number(widthMm) / MM_PER_INCH) * 72;
  const hPt = (Number(heightMm) / MM_PER_INCH) * 72;

  const parts = [];
  const offsets = [];
  let length = 0;
  const write = (chunk) => {
    const bytes = typeof chunk === "string" ? enc.encode(chunk) : chunk;
    parts.push(bytes);
    length += bytes.length;
  };

  write("%PDF-1.4\n");
  // binary marker in the header comment — identifies the file as binary
  write(new Uint8Array([0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]));

  const object = (n, body) => {
    offsets[n] = length;
    write(`${n} 0 obj\n`);
    write(body);
    write("\nendobj\n");
  };

  object(1, "<< /Type /Catalog /Pages 2 0 R >>");
  const pageRefs = jpegs.map((_, index) => `${3 + index * 3} 0 R`).join(" ");
  object(2, `<< /Type /Pages /Kids [${pageRefs}] /Count ${jpegs.length} >>`);

  jpegs.forEach((jpeg, index) => {
    const pageId = 3 + index * 3;
    const imageId = pageId + 1;
    const contentId = pageId + 2;
    object(
      pageId,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${wPt.toFixed(
        2,
      )} ${hPt.toFixed(2)}] /Resources << /XObject << /Im0 ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`,
    );
    offsets[imageId] = length;
    write(`${imageId} 0 obj\n`);
    write(
      `<< /Type /XObject /Subtype /Image /Width ${Math.round(
        jpeg.width,
      )} /Height ${Math.round(
        jpeg.height,
      )} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${
        jpeg.data.length
      } >>\nstream\n`,
    );
    write(jpeg.data);
    write("\nendstream\nendobj\n");

    const content = `q ${wPt.toFixed(2)} 0 0 ${hPt.toFixed(2)} 0 0 cm /Im0 Do Q`;
    object(
      contentId,
      `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    );
  });

  const infoId = 3 + jpegs.length * 3;
  object(
    infoId,
    `<< /Title (${pdfString(title)}) /Producer (Digital Menu) /Creator (Digital Menu) >>`,
  );

  const count = infoId + 1;
  const xrefStart = length;
  let xref = `xref\n0 ${count}\n0000000000 65535 f \n`;
  for (let i = 1; i < count; i++) {
    xref += `${String(offsets[i] || 0).padStart(10, "0")} 00000 n \n`;
  }
  write(xref);
  write(`trailer\n<< /Size ${count} /Root 1 0 R /Info ${infoId} 0 R >>\n`);
  write(`startxref\n${xrefStart}\n%%EOF\n`);

  const out = new Uint8Array(length);
  let cursor = 0;
  for (const part of parts) {
    out.set(part, cursor);
    cursor += part.length;
  }
  return out;
}

export function buildPdfFromJpeg(jpeg, widthMm, heightMm, title = "Menu") {
  return buildPdfFromJpegs([jpeg], widthMm, heightMm, title);
}

/**
 * Canvases (JPEG pages) → PDF Blob at the exact sheet size.
 * @param {HTMLCanvasElement} canvas
 * @param {{ widthMm:number, heightMm:number, title?:string }} size
 */
export function jpegsToPdfBlob(jpegs, { widthMm, heightMm, title }) {
  const pdf = buildPdfFromJpegs(jpegs, widthMm, heightMm, title);
  return new Blob([pdf], { type: "application/pdf" });
}

export async function canvasesToPdfBlob(canvases, { widthMm, heightMm, title }) {
  const jpegs = [];
  for (const canvas of canvases) {
    const blob = await canvasToBlob(canvas, "image/jpeg", 0.95);
    const data = blob
      ? new Uint8Array(await blob.arrayBuffer())
      : dataUrlToBytes(canvas.toDataURL("image/jpeg", 0.95));
    jpegs.push({ data, width: canvas.width, height: canvas.height });
  }
  return jpegsToPdfBlob(jpegs, { widthMm, heightMm, title });
}

export async function canvasToPdfBlob(canvas, size) {
  return canvasesToPdfBlob([canvas], size);
}

// ─── PRINT (browser dialog, paper size preset) ───────────────
// A hidden iframe keeps the app state intact (popup blockers would silence
// window.open, an iframe is never blocked).
export function printSheets(dataUrls, { widthMm, heightMm, title = "Menu" }) {
  const pages = Array.isArray(dataUrls) ? dataUrls : [dataUrls];
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
  document.body.appendChild(frame);

  const doc = frame.contentDocument;
  if (!doc) {
    frame.remove();
    return false;
  }
  doc.open();
  doc.write(
    `<!doctype html><html><head><meta charset="utf-8"><title>${pdfString(
      title,
    )}</title><style>
      @page { size: ${widthMm}mm ${heightMm}mm; margin: 0; }
      html, body { margin: 0; padding: 0; }
      .page { width: ${widthMm}mm; height: ${heightMm}mm; page-break-after: always; break-after: page; }
      .page:last-child { page-break-after: auto; break-after: auto; }
      img { width: ${widthMm}mm; height: ${heightMm}mm; display: block; }
    </style></head><body>${pages.map((dataUrl) =>
      `<div class="page"><img src="${dataUrl}" alt=""></div>`,
    ).join("")}</body></html>`,
  );
  doc.close();

  const fire = () => {
    try {
      frame.contentWindow.focus();
      frame.contentWindow.print();
    } finally {
      setTimeout(() => frame.remove(), 1500);
    }
  };

  const imgs = [...doc.querySelectorAll("img")];
  const waitForImages = Promise.all(
    imgs.map((img) => img.complete
      ? Promise.resolve()
      : new Promise((resolve) => {
          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
        }),
    ),
  );
  waitForImages.then(() => setTimeout(fire, 80));
  return true;
}

export function printSheet(dataUrl, options) {
  return printSheets([dataUrl], options);
}
