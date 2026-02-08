const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");

const generateQrPdf = async (products, creatorEmail, options = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      /** PAGE SIZE **/
      const widthPts = 13 * 72;
      const heightPts = 19 * 72;

      /** MARGINS **/
      const marginLeft = 0.5 * 72;
      const marginRight = 0.5 * 72;
      const marginTop = 0.25 * 72;
      const marginBottom = 0.25 * 72;

      /** CELL SIZE (FIXED) **/
      const cellWidth = 1.2 * 72;
      const cellHeight = 1.5 * 72;

      /** BANNER (INSIDE CELL) **/
      const bannerHeight = 0.35 * 72; // ~0.35 inch
      const qrHeight = cellHeight - bannerHeight;

      /** FOOTER **/
      const footerHeight = marginBottom;

      const usableWidth = widthPts - marginLeft - marginRight;
      const usableHeight = heightPts - marginTop - marginBottom - footerHeight;

      const cols = Math.floor(usableWidth / cellWidth);
      const rows = Math.floor(usableHeight / cellHeight);
      const perPage = cols * rows;

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

        /** OPTIONAL SCORING **/
        if (options.scoring !== false) {
          doc.save().strokeColor("#E0E0E0").lineWidth(0.3);

          for (let c = 0; c <= cols; c++) {
            const x = marginLeft + c * cellWidth;
            doc
              .moveTo(x, marginTop)
              .lineTo(x, marginTop + rows * cellHeight)
              .stroke();
          }

          for (let r = 0; r <= rows; r++) {
            const y = marginTop + r * cellHeight;
            doc
              .moveTo(marginLeft, y)
              .lineTo(marginLeft + cols * cellWidth, y)
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

          /** QR **/
          const qrBuffer = await QRCode.toBuffer(products[i].qrCode, {
            scale: 8,
            margin: 10,
          });

          doc.image(qrBuffer, x, y, {
            width: cellWidth,
            height: qrHeight,
          });

          /** BANNER **/
          const bannerY = y + qrHeight;

          doc
            .rect(x, bannerY, cellWidth, bannerHeight)
            .fill(options.bannerColor || "#0F4160");

          const centerY = bannerY + bannerHeight / 2;

          /** First part */
          doc
            .fillColor("#FFF")
            .font("Helvetica-Bold")
            .fontSize(6)
            .text("Buy, Scratch & Scan on", x, centerY - 7, {
              width: cellWidth,
              align: "center",
              lineBreak: false,
            });

          /** Bigger domain */
          doc
            .fontSize(8.2) // 👈 slightly bigger
            .text("Authentiks.in", x, centerY + 2, {
              width: cellWidth,
              align: "center",
              lineBreak: false,
            });

          doc.fillColor("#000");

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

  /** FOOTER **/
  // Prefer the product's own brand/company when present, then fall back to options
  const orderId = options.orderId || products[start]?.orderId || "N/A";
  const brand = products[start]?.brand || options.brand || "N/A";
  const company = products[start]?.company || options.company || "N/A";

        const footerY = heightPts - marginBottom - 20;

        doc.font("Helvetica-Bold").fontSize(14);

        const footerWidth = usableWidth;
        const colWidth = footerWidth / 3;

        /** LEFT */
        doc.text(`${orderId}`, marginLeft, footerY, {
          width: colWidth,
          align: "left",
        });

        /** CENTER */
        doc.text(`${brand}`, marginLeft + colWidth, footerY, {
          width: colWidth,
          align: "center",
        });

        /** RIGHT */
        doc.text(
          `Page ${page + 1} of ${totalPages}`,
          marginLeft + colWidth * 2,
          footerY,
          {
            width: colWidth,
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
