const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const { Worker } = require("worker_threads");
const os = require("os");

const workerCode = `
  const { parentPort } = require('worker_threads');
  const QRCode = require('qrcode');
  parentPort.on('message', async (task) => {
    try {
      const buffer = await QRCode.toBuffer(task.url, task.options);
      parentPort.postMessage({ id: task.id, buffer, error: null });
    } catch (err) {
      parentPort.postMessage({ id: task.id, buffer: null, error: err.message });
    }
  });
`;

async function generateQrsClustered(urls, options) {
  const numCPUs = Math.max(1, os.cpus().length);
  const workers = [];
  for (let i = 0; i < numCPUs; i++) {
    workers.push(new Worker(workerCode, { eval: true }));
  }

  let currentIndex = 0;
  let completed = 0;
  const results = new Array(urls.length);

  return new Promise((resolve, reject) => {
    if (urls.length === 0) return resolve(results);

    const assignWork = (worker) => {
      if (currentIndex >= urls.length) return;
      const id = currentIndex++;
      worker.postMessage({ id, url: urls[id], options });
    };

    workers.forEach(worker => {
      worker.on('message', (msg) => {
        if (msg.error) {
          reject(new Error(msg.error));
        } else {
          results[msg.id] = Buffer.from(msg.buffer);
          completed++;
          if (completed === urls.length) {
            workers.forEach(w => w.terminate());
            resolve(results);
          } else {
            assignWork(worker);
          }
        }
      });
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
      });
      assignWork(worker);
    });
  });
}

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

const formatSN = (num) => {
  const q = Math.floor(num / 50000) + 26;
  const r = num % 50000;
  let prefix = "";
  let temp = q;
  do {
    prefix = String.fromCharCode((temp % 26) + 65) + prefix;
    temp = Math.floor(temp / 26) - 1;
  } while (temp >= 0);
  return `${prefix}-${r.toString().padStart(5, '0')}`;
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

  /** ─── GRID — 15 cols × 17 rows = 250 per page ─── **/
  const cols = 15;
  const rows = options.isBlankQr ? 17 : 18;
  const perPage = options.isBlankQr ? 250 : cols * rows; // 250 exact for blank QRs

  // To achieve exactly 15mm margin on A3+ height (482.6mm):
  // 17 rows * 25mm = 425mm content height
  // 482.6mm - 425mm - 30mm (15mm top + 15mm bottom margin) = 27.6mm for gaps
  // 27.6mm / 16 gaps = 1.725mm gap. 1.725 * 2.83465 = 4.88977 pts
  const rowGap = options.isBlankQr ? 4.88977 : 0; 

  /** ─── MARGINS — exactly centred on the page (creates ~15mm margins) ─── **/
  const gridWidth = cols * cellWidth;
  const gridHeight = rows * cellHeight + (rows > 0 ? (rows - 1) * rowGap : 0);
  const marginLeft = (widthPts - gridWidth) / 2;
  const marginTop = Math.max(0, (heightPts - gridHeight) /2);

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

  /** ─── FONT PATHS (Vercel Fix) ─── **/
  const BOLD_FONT = path.join(__dirname, "../assets/fonts/Roboto-Bold.ttf");
  const REGULAR_FONT = path.join(__dirname, "../assets/fonts/Roboto-Regular.ttf");

  const doc = new PDFDocument({
    size: [widthPts, heightPts],
    margin: 0,
    autoFirstPage: false,
  });

  /** ─── PRE-GENERATE QRs IN CLUSTER (WORKER THREADS) ─── **/
  const baseUrl = process.env.FRONTEND_URL || 'https://authentiks.in';
  const qrUrls = products.map((p, index) => {
    if (!p.qrCode) console.warn(`[pdfGenerator] Missing qrCode for product at index ${index}`);
    return `${baseUrl}/scan?code=${encodeURIComponent(p.qrCode || "")}`;
  });

  const allQrBuffers = await generateQrsClustered(qrUrls, {
    errorCorrectionLevel: "L",
    scale: 8,
    margin: 1,
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

      for (let r = 0; r < rows; r++) {
        const topY = marginTop + r * (cellHeight + rowGap);
        const bottomY = topY + cellHeight;
        doc
          .moveTo(marginLeft, topY)
          .lineTo(marginLeft + gridWidth, topY)
          .stroke();
        doc
          .moveTo(marginLeft, bottomY)
          .lineTo(marginLeft + gridWidth, bottomY)
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
      const y = marginTop + row * (cellHeight + rowGap);

      /** ── HEADER — white band with "Scratch & Scan" ── **/
      doc.rect(x, y, cellWidth, headerHeight).fill(brandColor);

      doc
        .fillColor("#000")
        .font(BOLD_FONT)
        .fontSize(6.5)
        .text("Scratch & Win", x, y + headerHeight / 2 - 3, {
          width: cellWidth,
          align: "center",
          lineBreak: false,
        });

      /** ── QR CODE — white area ── **/
      const qrY = y + headerHeight;
      doc.rect(x, qrY, cellWidth, qrAreaHeight).fill("#FFFFFF");

      const qrBuffer = allQrBuffers[i];

      // QR image size increased
      const qrSide = 13 * MM;
      const qrX = x + (cellWidth - qrSide) / 2;
      const qrImgY = qrY + (qrAreaHeight - qrSide) / 2;

      doc.image(qrBuffer, qrX, qrImgY, {
        width: qrSide,
        height: qrSide,
      });

      /** ── SERIAL NUMBER (If exists) ── **/
      if (products[i].serialNumber && rowGap > 0) {
        doc
          .fillColor("#666")
          .font(BOLD_FONT)
          .fontSize(4)
          .text(
            `${formatSN(products[i].serialNumber)}`,
            x,
            y + cellHeight + 0.5,
            {
              width: cellWidth,
              align: "center",
              lineBreak: false,
            }
          );
      }




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
        .font(BOLD_FONT)
        .fontSize(6.5)
        .text("Use Coin/Key", x, footerY + footerBannerH / 2 - 3, {
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
    let brand = products[start]?.brand || options.brand || "N/A";

    if (options.isBlankQr) {
      const pageStartSN = products[start]?.serialNumber;
      const pageEndSN = products[end - 1]?.serialNumber;
      if (pageStartSN && pageEndSN) {
        brand = `${formatSN(pageStartSN)} to ${formatSN(pageEndSN)}`;
      }
    }

    // Push the footer securely to the bottom of the page, avoiding the grid
    const pageFooterY = heightPts - 25;
    doc.font(BOLD_FONT).fontSize(8);

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
