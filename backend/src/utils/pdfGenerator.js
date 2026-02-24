const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");

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

const generateQrPdf = async (products, creatorEmail, options = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      /** ─── PAGE SIZE — A3 Plus (13 × 19 inches) ─── **/
      const widthPts = 13 * 72;   // 936 pts  ≈ 330.2 mm
      const heightPts = 19 * 72;  // 1368 pts ≈ 482.6 mm

      /** ─── CELL SIZE — 20 mm wide × 25 mm tall ─── **/
      const MM = 2.83465;         // 1 mm ≈ 2.835 pts
      const cellWidth = 20 * MM;  // ~56.69 pts
      const cellHeight = 25 * MM; // ~70.87 pts

      /** ─── GRID — 15 cols × 18 rows = 270 per page ─── **/
      const cols = 15;
      const rows = 18;
      const perPage = cols * rows - 1; // 269 — first cell left blank for paper cut

      /** ─── MARGINS — exactly centred on the page ─── **/
      // Width:  20mm × 15 = 300mm.  Paper ≈ 330.2mm.  Remaining ≈ 30.2mm → 15.1mm each side
      // Height: 25mm × 18 = 450mm.  Paper ≈ 482.6mm.  Remaining ≈ 32.6mm → 16.3mm each side
      const gridWidth = cols * cellWidth;
      const gridHeight = rows * cellHeight;
      const marginLeft = (widthPts - gridWidth) / 2;
      const marginTop = (heightPts - gridHeight) / 2;

      /** ─── STICKER INTERNAL ZONES ─── **/
      const brandColor = options.bannerColor || "#283890";
      const headerHeight = cellHeight * 0.20;  // ~20% for "Scratch & Scan"
      const footerBannerH = cellHeight * 0.20; // ~20% for "Authentiks.in"
      const qrAreaHeight = cellHeight - headerHeight - footerBannerH; // ~60% QR

      const totalPages = Math.ceil(products.length / perPage);

      /** ─── FETCH BRAND LOGO (if provided) ─── **/
      let logoBuffer = null;
      if (options.brandLogo) {
        logoBuffer = await fetchImageBuffer(options.brandLogo);
      }

      const doc = new PDFDocument({
        size: [widthPts, heightPts],
        margin: 0,
        autoFirstPage: false,
      });

      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers).toString("base64")));

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

        // Start from cell index 1 (skip first cell — left blank for paper cut alignment)
        let idx = 1;

        for (let i = start; i < end; i++) {
          const row = Math.floor(idx / cols);
          const col = idx % cols;

          const x = marginLeft + col * cellWidth;
          const y = marginTop + row * cellHeight;

          /** ── HEADER — dark blue band with "Scratch & Scan" ── **/
          doc
            .rect(x, y, cellWidth, headerHeight)
            .fill(brandColor);

          doc
            .fillColor("#FFF")
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

          const qrBuffer = await QRCode.toBuffer(products[i].qrCode, {
            errorCorrectionLevel: 'H', // Use High error correction to allow logo overlay
            scale: 8, // Increase scale for sharper output
            margin: 1,
          });

          // QR image is exactly 9mm × 9mm, centred in the QR area
          const qrSide = 10 * MM; // 9mm
          const qrX = x + (cellWidth - qrSide) / 2;
          const qrImgY = qrY + (qrAreaHeight - qrSide) / 2;

          doc.image(qrBuffer, qrX, qrImgY, {
            width: qrSide,
            height: qrSide,
          });

          /** ── COMPANY LOGO OVERLAY — PayPal-style centred on QR ── **/
          if (logoBuffer) {
            // Logo at ~20% of QR side for visibility while staying scannable with Level H error correction
            const logoSize = qrSide * 0.20;
            // Background area: logo + generous padding (like PayPal's clean white box)
            const bgPadding = logoSize * 0.35;
            const bgSize = logoSize + bgPadding * 2;
            const bgX = qrX + (qrSide - bgSize) / 2;
            const bgY = qrImgY + (qrSide - bgSize) / 2;
            const cornerRadius = bgSize * 0.18; // Rounded corners

            // White rounded-rectangle background
            doc
              .save()
              .roundedRect(bgX, bgY, bgSize, bgSize, cornerRadius)
              .fill("#FFFFFF");

            // Subtle border around the white box
            doc
              .roundedRect(bgX, bgY, bgSize, bgSize, cornerRadius)
              .lineWidth(0.6)
              .strokeColor("#E0E0E0")
              .stroke();
            doc.restore();

            // Logo image centred inside the white box
            const logoX = bgX + bgPadding;
            const logoY = bgY + bgPadding;
            doc.image(logoBuffer, logoX, logoY, {
              fit: [logoSize, logoSize],
              align: "center",
              valign: "center",
            });
          }

          /** ── FOOTER BANNER — dark blue band with "Authentiks.in" ── **/
          const footerY = qrY + qrAreaHeight;
          doc
            .rect(x, footerY, cellWidth, footerBannerH)
            .fill(brandColor);

          doc
            .fillColor("#FFF")
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

        /** PAGE FOOTER — order / brand / page info **/
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
          },
        );
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generateQrPdf };
