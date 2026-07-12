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
  /** ─── PAGE SIZE — A3 Plus Horizontal (19 × 13 inches) ─── **/
  const widthPts = 19 * 72; // 1368 pts ≈ 482.6 mm
  const heightPts = 13 * 72; // 936 pts  ≈ 330.2 mm

  /** ─── CELL SIZE — 20 mm wide × 27 mm tall (includes 1mm right/bottom margins) ─── **/
  const MM = 2.83465; // 1 mm ≈ 2.835 pts
  const cellWidth = 20 * MM;
  const cellHeight = 27 * MM;
  
  const contentWidth = 19 * MM;
  const contentHeight = 26 * MM;

  /** ─── GRID — 23 cols × 11 rows = 253 per page ─── **/
  const cols = 23;
  const rows = 11;
  const perPage = 250; // Exactly 250 per page (leaves 3 empty cells at the end of the page)

  const rowGap = 0; 

  /** ─── MARGINS — exactly centred on the page ─── **/
  const gridWidth = cols * cellWidth;
  const gridHeight = rows * cellHeight;
  const marginLeft = (widthPts - gridWidth) / 2;
  const marginTop = Math.max(0, (heightPts - gridHeight) / 2);

  /** ─── STICKER INTERNAL ZONES ─── **/
  const brandColor = "#0b1b36"; // Dark navy blue
  const topRibbonH = 6 * MM;
  const midSectionH = 13 * MM;
  const bottomRibbonH = 7 * MM;
  const qrSize = 11 * MM;

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
      const y = marginTop + row * cellHeight;

      /** ── TOP RIBBON (6mm) ── **/
      doc.rect(x, y, contentWidth, topRibbonH).fill(brandColor);

      const str1 = "VERIFY & ";
      const str2 = "WIN";
      doc.font(BOLD_FONT).fontSize(6.5);
      const w1 = doc.widthOfString(str1);
      const w2 = doc.widthOfString(str2);
      const totalW = w1 + w2;
      const startX = x + (contentWidth - totalW) / 2;
      
      doc.fillColor("#FFFFFF").text(str1, startX, y + (topRibbonH - 6.5) / 2 + 0.5, { lineBreak: false });
      doc.fillColor("#8CB4D6").text(str2, startX + w1, y + (topRibbonH - 6.5) / 2 + 0.5, { lineBreak: false });

      /** ── QR CODE SECTION (13mm) ── **/
      const midY = y + topRibbonH;
      doc.rect(x, midY, contentWidth, midSectionH).fill("#FFFFFF");

      const qrBuffer = allQrBuffers[i];
      const qrX = x + (contentWidth - qrSize) / 2;
      // 1mm gap top and bottom means centering an 11mm QR in a 13mm section = exactly 1mm padding.
      const qrImgY = midY + (midSectionH - qrSize) / 2;

      doc.image(qrBuffer, qrX, qrImgY, {
        width: qrSize,
        height: qrSize,
      });

      /** ── BOTTOM RIBBON (7mm) ── **/
      const bottomY = midY + midSectionH;
      doc.rect(x, bottomY, contentWidth, bottomRibbonH).fill(brandColor);

      // "Use a Coin"
      doc
        .fillColor("#FFFFFF")
        .font(BOLD_FONT)
        .fontSize(6.5)
        .text("Use a Coin", x, bottomY + 3.5, {
          width: contentWidth,
          align: "center",
          lineBreak: false,
        });

      /** ── SERIAL NUMBER ── **/
      if (products[i].serialNumber !== undefined) {
        doc
          .fillColor("#FFFFFF")
          .font(BOLD_FONT)
          .fontSize(4.5)
          .text(
            `${formatSN(products[i].serialNumber)}`,
            x,
            bottomY + 11.5,
            {
              width: contentWidth,
              align: "center",
              lineBreak: false,
            }
          );
      }

      /** Cell border for scoring (outline the whole cell including margin) **/
      if (options.scoring !== false) {
        doc
          .save()
          .strokeColor("#E0E0E0")
          .lineWidth(0.3)
          .rect(x, y, cellWidth, cellHeight) // including the 1mm margin area
          .stroke()
          .restore();
      }

      idx++;
    }

    /** PAGE FOOTER — info **/
    const orderId = options.orderId || products[start]?.orderId || "N/A";
    const brand = products[start]?.brand || options.brand || "Authentiks";

    let qrRange = "";
    const pageStartSN = products[start]?.serialNumber;
    // The actual last item processed on this page is start + idx - 1
    const actualEndIdx = start + idx - 1;
    const pageEndSN = products[actualEndIdx]?.serialNumber;
    
    if (pageStartSN !== undefined && pageEndSN !== undefined) {
      qrRange = `QR Range: ${formatSN(pageStartSN)} to ${formatSN(pageEndSN)}`;
    }

    // Render footer vertically on the right margin
    doc.save();
    doc.translate(widthPts - 15, marginTop);
    doc.rotate(90);
    
    doc.fillColor("#000000").font(BOLD_FONT).fontSize(8);

    const footerWidth = gridHeight; // Available width is now the height of the grid
    const colW = footerWidth / 3;

    doc.text(`Order ID: ${orderId}`, 0, 0, {
      width: colW,
      align: "left",
    });

    doc.text(qrRange, colW, 0, {
      width: colW,
      align: "center",
    });

    doc.text(
      `Page ${page + 1} of ${totalPages}  (${idx} QRs)`,
      colW * 2,
      0,
      {
        width: colW,
        align: "right",
      }
    );
    doc.restore();
  }

  return doc;
};

const { uploadToSupabaseStorage } = require("./supabaseStorage");

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
          
          // Background upload to Supabase Storage
          const fileName = `qr_pdf_${options.orderId || Date.now()}_${Math.random().toString(36).substring(7)}.pdf`;
          uploadToSupabaseStorage(finalBuffer, fileName).then(url => {
             console.log("📄 QR PDF uploaded to Supabase:", url);
          }).catch(err => {
             console.error("📄 Supabase Upload Error for QR PDF:", err.message);
          });

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
 * New: Returns the PDF as a Buffer (useful for uploading to Supabase or other storage).
 */
const generateQrPdfBuffer = async (products, options = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = await buildQrPdf(products, options);
      const buffers = [];
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => {
        resolve(Buffer.concat(buffers));
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

module.exports = { generateQrPdf, generateQrPdfBuffer, generateQrPdfStream };
