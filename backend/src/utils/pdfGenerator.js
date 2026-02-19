const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");

const generateQrPdf = async (products, creatorEmail, options = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      /** PAGE SIZE — A3 Plus (13 × 19 inches) **/
      const widthPts = 13 * 72;   // 936 pts
      const heightPts = 19 * 72;  // 1368 pts

      /** CELL SIZE — 20 mm wide × 25 mm tall (portrait) **/
      const MM = 2.83465;         // 1 mm ≈ 2.835 pts
      const cellWidth = 20 * MM;  // ~56.69 pts
      const cellHeight = 25 * MM; // ~70.87 pts

      /** GRID — 15 cols × 18 rows = 270 per page **/
      const cols = 15;
      const rows = 18;
      const perPage = cols * rows; // 270

      /** MARGINS — 10 mm left/right, vertically centred **/
      const sideMargin = 10 * MM; // ~28.35 pts
      const gridWidth = cols * cellWidth;
      const gridHeight = rows * cellHeight;
      const marginLeft = sideMargin;
      const marginTop = (heightPts - gridHeight) / 2;

      /** STICKER INTERNAL ZONES **/
      const brandColor = options.bannerColor || "#283890";
      const headerHeight = cellHeight * 0.20;  // ~20 % for "Scratch & Scan"
      const footerBannerH = cellHeight * 0.20; // ~20 % for "Authentiks.in"
      const qrAreaHeight = cellHeight - headerHeight - footerBannerH; // ~60 % QR

      const totalPages = Math.ceil(products.length / perPage);

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

        let idx = 0;

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
            .fontSize(5)
            .text("Scratch & Scan", x, y + headerHeight / 2 - 3, {
              width: cellWidth,
              align: "center",
              lineBreak: false,
            });

          /** ── QR CODE — white area ── **/
          const qrY = y + headerHeight;
          doc.rect(x, qrY, cellWidth, qrAreaHeight).fill("#FFFFFF");

          const qrBuffer = await QRCode.toBuffer(products[i].qrCode, {
            scale: 6,
            margin: 1,
          });

          // Fit QR square within the available area with small padding
          const qrPad = 2;
          const qrSide = Math.min(cellWidth, qrAreaHeight) - qrPad * 2;
          const qrX = x + (cellWidth - qrSide) / 2;
          const qrImgY = qrY + (qrAreaHeight - qrSide) / 2;

          doc.image(qrBuffer, qrX, qrImgY, {
            width: qrSide,
            height: qrSide,
          });

          /** ── FOOTER BANNER — dark blue band with "Authentiks.in" ── **/
          const footerY = qrY + qrAreaHeight;
          doc
            .rect(x, footerY, cellWidth, footerBannerH)
            .fill(brandColor);

          doc
            .fillColor("#FFF")
            .font("Helvetica-Bold")
            .fontSize(5.5)
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
