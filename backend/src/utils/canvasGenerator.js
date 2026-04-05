const { createCanvas, loadImage, registerFont } = require('canvas');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

/**
 * Register embedded fonts at module-load time (BEFORE any canvas is created).
 * This fixes blank/tofu text on Vercel where system fonts are missing.
 */
const BOLD_FONT_PATH = path.join(__dirname, '../assets/fonts/Roboto-Bold.ttf');
const REGULAR_FONT_PATH = path.join(__dirname, '../assets/fonts/Roboto-Regular.ttf');

try {
  if (fs.existsSync(BOLD_FONT_PATH)) {
    registerFont(BOLD_FONT_PATH, { family: 'Roboto', weight: 'bold' });
  }
  if (fs.existsSync(REGULAR_FONT_PATH)) {
    registerFont(REGULAR_FONT_PATH, { family: 'Roboto', weight: 'normal' });
  }
  console.log('[canvasGenerator] Roboto fonts registered successfully');
} catch (e) {
  console.warn('[canvasGenerator] Font registration failed, falling back to sans-serif:', e.message);
}

/**
 * Canvas-based QR image page generator.
 * Layout is an EXACT 1:1 clone of pdfGenerator.js so PNG/JPG output
 * looks identical to the PDF download.
 */

const generateQrImagePages = async (products, format = 'png', options = {}) => {
  /** ─── PAGE SIZE — A3 Plus (13 × 19 inches), same as PDF ─── **/
  const MM = 2.83465;
  const widthPts  = 13 * 72; // 936 pts
  const heightPts = 19 * 72; // 1368 pts

  /** ─── CELL SIZE — 20 mm × 25 mm, same as PDF ─── **/
  const cellWidth  = 20 * MM; // ~56.69 pts
  const cellHeight = 25 * MM; // ~70.87 pts

  /** ─── GRID — 15 cols × 18 rows = 270 per page ─── **/
  const cols = 15;
  const rows = 18;
  const perPage = cols * rows;
  const totalPages = Math.ceil(products.length / perPage);

  /** ─── STICKER INTERNAL ZONES (same ratios as PDF) ─── **/
  const headerHeight  = cellHeight * 0.2;
  const footerBannerH = cellHeight * 0.2;
  const qrAreaHeight  = cellHeight - headerHeight - footerBannerH;

  /** ─── MARGINS — exactly centred on the page ─── **/
  const gridWidth  = cols * cellWidth;
  const gridHeight = rows * cellHeight;
  const marginLeft = (widthPts - gridWidth) / 2;
  const marginTop  = (heightPts - gridHeight) / 2;

  /** ─── QR IMAGE SIZE ─── **/
  const qrSide = 13 * MM;

  /** ─── RENDER SCALE (higher = crisper output) ─── **/
  const SCALE = 3;

  const pages = [];

  for (let page = 0; page < totalPages; page++) {
    const start = page * perPage;
    const end   = Math.min(start + perPage, products.length);
    if (start >= end) break;

    console.log(`[canvasGenerator] Rendering page ${page + 1}/${totalPages} (${end - start} QR codes)`);

    // Create high-res canvas
    const canvas = createCanvas(Math.round(widthPts * SCALE), Math.round(heightPts * SCALE));
    const ctx = canvas.getContext('2d');
    ctx.scale(SCALE, SCALE);

    // White background for entire page
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, widthPts, heightPts);

    // ─── SCORING / CUT LINES ───
    if (options.scoring !== false) {
      ctx.strokeStyle = '#E0E0E0';
      ctx.lineWidth = 0.3;

      for (let c = 0; c <= cols; c++) {
        const x = marginLeft + c * cellWidth;
        ctx.beginPath();
        ctx.moveTo(x, marginTop);
        ctx.lineTo(x, marginTop + gridHeight);
        ctx.stroke();
      }
      for (let r = 0; r <= rows; r++) {
        const y = marginTop + r * cellHeight;
        ctx.beginPath();
        ctx.moveTo(marginLeft, y);
        ctx.lineTo(marginLeft + gridWidth, y);
        ctx.stroke();
      }
    }

    // ─── RENDER EACH QR STICKER ───
    let idx = 0;
    for (let i = start; i < end; i++) {
      const row = Math.floor(idx / cols);
      const col = idx % cols;

      const x = marginLeft + col * cellWidth;
      const y = marginTop  + row * cellHeight;

      // ── HEADER — white band with "Scratch & Scan" ──
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x, y, cellWidth, headerHeight);

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 6.5px Roboto';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Scratch & Scan', x + cellWidth / 2, y + headerHeight / 2);

      // ── QR CODE — white area ──
      const qrY = y + headerHeight;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x, qrY, cellWidth, qrAreaHeight);

      const qrUrl = `https://authentiks.in/scan?code=${encodeURIComponent(products[i].qrCode || '')}`;

      try {
        const qrDataUrl = await QRCode.toDataURL(qrUrl, {
          errorCorrectionLevel: 'M',
          margin: 1,
          width: 400,
        });
        const qrImage = await loadImage(qrDataUrl);

        const qrX    = x   + (cellWidth  - qrSide) / 2;
        const qrImgY = qrY + (qrAreaHeight - qrSide) / 2;

        ctx.drawImage(qrImage, qrX, qrImgY, qrSide, qrSide);
      } catch (qrErr) {
        console.error('[canvasGenerator] QR render error:', qrErr.message);
      }

      // ── FOOTER BANNER — white band with "Authentiks.in" ──
      const footerY = qrY + qrAreaHeight;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x, footerY, cellWidth, footerBannerH);

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 6.5px Roboto';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Authentiks.in', x + cellWidth / 2, footerY + footerBannerH / 2);

      // ── Cell border ──
      if (options.scoring !== false) {
        ctx.strokeStyle = '#E0E0E0';
        ctx.lineWidth = 0.3;
        ctx.strokeRect(x, y, cellWidth, cellHeight);
      }

      idx++;
    }

    // ─── PAGE FOOTER INFO ───
    const orderId = options.orderId || products[start]?.orderId || 'N/A';
    const brand   = products[start]?.brand || options.brand || 'N/A';

    const pageFooterY = marginTop + gridHeight + 4;
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 8px Roboto';
    ctx.textBaseline = 'top';

    const colW = gridWidth / 3;

    ctx.textAlign = 'left';
    ctx.fillText(orderId, marginLeft, pageFooterY);

    ctx.textAlign = 'center';
    ctx.fillText(brand, marginLeft + colW * 1.5, pageFooterY);

    ctx.textAlign = 'right';
    ctx.fillText(`Page ${page + 1} of ${totalPages}`, marginLeft + gridWidth, pageFooterY);

    // ─── EXPORT BUFFER ───
    const mimeType = (format === 'jpeg' || format === 'jpg') ? 'image/jpeg' : 'image/png';
    const ext      = (format === 'jpeg' || format === 'jpg') ? 'jpg' : 'png';

    const buffer = mimeType === 'image/jpeg'
      ? canvas.toBuffer(mimeType, { quality: 1.0 })
      : canvas.toBuffer(mimeType);

    pages.push({ buffer, filename: `Page_${page + 1}.${ext}` });
  }

  return pages;
};

module.exports = { generateQrImagePages };
