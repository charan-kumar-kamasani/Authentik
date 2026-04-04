const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");

/**
 * Fetch a remote image (e.g. brand logo from Cloudinary) and return it as a Buffer.
 * Returns null on any error so callers can gracefully skip the logo overlay.
 */
const fetchImageBuffer = async (url) => {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  }
};

/**
 * Core PDF building logic. Returns a PDFDocument instance.
 * Note: Caller is responsible for calling doc.end() when finished.
 */
const buildQrPdf = async (products, options = {}) => {
  /** ─── PAGE SIZE — A3 Plus (13 × 19 inches) ─── **/
  const widthPts = 13 * 72; // 936 pts  ≈ 330.2 mm
  const heightPts = 19 * 72; // 1368 pts ≈ 482.6 mm

  /** ─── CELL SIZE — 20 mm wide × 25 mm tall ─── **/
  const MM = 2.83465; // 1 mm ≈ 2.835 pts
  const cellWidth = 20 * MM; // ~56.69 pts
  const cellHeight = 25 * MM; // ~70.87 pts

  /** ─── GRID — 15 cols × 18 rows = 270 per page ─── **/
  const cols = 15;
  const rows = 18;
  const perPage = cols * rows; // 270 — all cells used

  /** ─── MARGINS — exactly centred on the page ─── **/
  const gridWidth = cols * cellWidth;
  const gridHeight = rows * cellHeight;
  const marginLeft = (widthPts - gridWidth) / 2;
  const marginTop = (heightPts - gridHeight) / 2;

  /** ─── STICKER INTERNAL ZONES ─── **/
  const brandColor = "#FFFFFF";
  const headerHeight = cellHeight * 0.2; // ~20% for "Scratch & Scan"
  const footerBannerH = cellHeight * 0.2; // ~20% for "Authentiks.in"
  const qrAreaHeight = cellHeight - headerHeight - footerBannerH; // ~60% QR

  const totalPages = Math.ceil(products.length / perPage);

  /** ─── FETCH AUTHENTIKS LOGO ─── **/
  let logoBuffer = null;
  try {
    const logoPath = path.join(__dirname, "../assets/logo.png");
    logoBuffer = fs.readFileSync(logoPath);
  } catch (e) {
    console.error("Failed to read logo.png", e);
  }

  const doc = new PDFDocument({
    size: [widthPts, heightPts],
    margin: 0,
    autoFirstPage: false,
  });

  for (let page = 0; page < totalPages; page++) {
    const start = page * perPage;
    const end = Math.min(start + perPage, products.length);
    if (start >= end) break;

    doc.addPage({ size: [widthPts, heightPts], margin: 0 });

    /** OPTIONAL SCORING / CUT LINES **/
    if (options.scoring !== false) {
      doc.save().strokeColor("#E0E0E0").lineWidth(0.3);

      for (let c = 0; c <= cols; c++) {
        const x = marginLeft + c * cellWidth;
        doc
          .moveTo(x, marginTop)
          .lineTo(x, marginTop + gridHeight)
          .stroke();
      }

      for (let r = 0; r <= rows; r++) {
        const y = marginTop + r * cellHeight;
        doc
          .moveTo(marginLeft, y)
          .lineTo(marginLeft + gridWidth, y)
          .stroke();
      }

      doc.restore();
    }

    // Start from cell index 0 (use all 270 cells)
    let idx = 0;

    for (let i = start; i < end; i++) {
      const row = Math.floor(idx / cols);
      const col = idx % cols;

      const x = marginLeft + col * cellWidth;
      const y = marginTop + row * cellHeight;

      /** ── HEADER — white band with "Scratch & Scan" ── **/
      doc.rect(x, y, cellWidth, headerHeight).fill(brandColor);

      doc
        .fillColor("#000")
        .font("Helvetica-Bold")
        .fontSize(6.5)
        .text("Scratch & Scan", x, y + headerHeight / 2 - 3, {
          width: cellWidth,
          align: "center",
          lineBreak: false,
        });

      /** ── QR CODE — white area ── **/
      const qrY = y + headerHeight;
      doc.rect(x, qrY, cellWidth, qrAreaHeight).fill("#FFFFFF");

      // Generate QR code with full URL including the code parameter
      const qrUrl = `https://authentiks.in/scan?code=${encodeURIComponent(
        products[i].qrCode || ""
      )}`;

      if (!products[i].qrCode) {
        console.warn(`[pdfGenerator] Missing qrCode for product at index ${i}`);
      }

      const qrBuffer = await QRCode.toBuffer(qrUrl, {
        errorCorrectionLevel: "M", // Reduced from H to M to make QR less dense/simpler (Req 8)
        scale: 8, 
        margin: 1,
      });

      // QR image size increased
      const qrSide = 13 * MM;
      const qrX = x + (cellWidth - qrSide) / 2;
      const qrImgY = qrY + (qrAreaHeight - qrSide) / 2;

      doc.image(qrBuffer, qrX, qrImgY, {
        width: qrSide,
        height: qrSide,
      });


      // /** ── COMPANY LOGO OVERLAY — centred on QR ── **/
      // if (logoBuffer) {
      //   const logoSize = qrSide * 0.2;
      //   const bgPadding = logoSize * 0.35;
      //   const bgSize = logoSize + bgPadding * 2;
      //   const bgX = qrX + (qrSide - bgSize) / 2;
      //   const bgY = qrImgY + (qrSide - bgSize) / 2;
      //   const cornerRadius = bgSize * 0.18;

      //   doc
      //     .save()
      //     .roundedRect(bgX, bgY, bgSize, bgSize, cornerRadius)
      //     .fill("#FFFFFF");

      //   doc
      //     .roundedRect(bgX, bgY, bgSize, bgSize, cornerRadius)
      //     .lineWidth(0.6)
      //     .strokeColor("#E0E0E0")
      //     .stroke();
      //   doc.restore();

      //   const logoX = bgX + bgPadding;
      //   const logoY = bgY + bgPadding;

      //   try {
      //     doc.image(logoBuffer, logoX, logoY, {
      //       fit: [logoSize, logoSize],
      //       align: "center",
      //       valign: "center",
      //     });
      //   } catch (imageErr) {
      //     console.warn(
      //       "Primary logo render failed, trying default fallback:",
      //       imageErr.message
      //     );
      //     try {
      //       const defaultLogoPath = path.join(__dirname, "../assets/logo.png");
      //       const defaultLogoBuffer = fs.readFileSync(defaultLogoPath);
      //       doc.image(defaultLogoBuffer, logoX, logoY, {
      //         fit: [logoSize, logoSize],
      //         align: "center",
      //         valign: "center",
      //       });
      //     } catch (fallbackErr) {
      //       console.error(
      //         "Default logo fallback also failed:",
      //         fallbackErr.message
      //       );
      //     }
      //   }
      // }

      /** ── FOOTER BANNER — white band with "Authentiks.in" ── **/
      const footerY = qrY + qrAreaHeight;
      doc.rect(x, footerY, cellWidth, footerBannerH).fill(brandColor);

      doc
        .fillColor("#000")
        .font("Helvetica-Bold")
        .fontSize(6.5)
        .text("Authentiks.in", x, footerY + footerBannerH / 2 - 3, {
          width: cellWidth,
          align: "center",
          lineBreak: false,
        });

      doc.fillColor("#000");

      /** Cell border for scoring **/
      if (options.scoring !== false) {
        doc
          .save()
          .strokeColor("#E0E0E0")
          .lineWidth(0.3)
          .rect(x, y, cellWidth, cellHeight)
          .stroke()
          .restore();
      }

      idx++;
    }

    /** PAGE FOOTER — info **/
    const orderId = options.orderId || products[start]?.orderId || "N/A";
    const brand = products[start]?.brand || options.brand || "N/A";

    const pageFooterY = marginTop + gridHeight + 4;
    doc.font("Helvetica-Bold").fontSize(8);

    const footerWidth = gridWidth;
    const colW = footerWidth / 3;

    doc.text(`${orderId}`, marginLeft, pageFooterY, {
      width: colW,
      align: "left",
    });

    doc.text(`${brand}`, marginLeft + colW, pageFooterY, {
      width: colW,
      align: "center",
    });

    doc.text(
      `Page ${page + 1} of ${totalPages}`,
      marginLeft + colW * 2,
      pageFooterY,
      {
        width: colW,
        align: "right",
      }
    );
  }

  return doc;
};

/**
 * Legacy: returns Base64 string.
 * Warning: may fail with ERR_STRING_TOO_LONG for many pages.
 */
const generateQrPdf = async (products, creatorEmail, options = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = await buildQrPdf(products, options);
      const buffers = [];
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => {
        try {
          const finalBuffer = Buffer.concat(buffers);
          // Node.js string length limit is usually ~512MB (0x1fffffe8 chars in Base64 is even less)
          // To be safe, we check if the buffer is too large for toString('base64')
          if (finalBuffer.length > 0x1fffffe8 * 0.75) {
             return reject(new Error("PDF is too large for Base64 (memory limit). Please use streaming download from the Order Management page."));
          }
          resolve(finalBuffer.toString("base64"));
        } catch (base64Err) {
          reject(new Error("PDF too large for Base64 conversion (ERR_STRING_TOO_LONG). Please use streaming download from the Order Management page."));
        }
      });
      doc.on("error", (err) => reject(err));
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * New: Streams the PDF directly to a writable stream (e.g. res).
 */
const generateQrPdfStream = async (products, writableStream, options = {}) => {
  try {
    const doc = await buildQrPdf(products, options);
    doc.pipe(writableStream);
    doc.end();
  } catch (err) {
    console.error("PDF Streaming Error:", err);
    throw err;
  }
};

module.exports = { generateQrPdf, generateQrPdfStream };
