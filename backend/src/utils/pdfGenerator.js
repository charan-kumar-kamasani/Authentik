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
 * Dedicated A4 PDF generator for Batch-Level QRs: Displays QR Code on an A4 sheet with product & supply chain specifications.
 */
const buildBatchQrPdf = async (products, options = {}) => {
  const p = products[0] || {};
  const order = options.orderObj || {};
  const sc = p.supplyChain || order.supplyChain || {};

  const isProduct = options.isProductLevel || p.qrType === 'product' || p.qrType === 'product_qr' || order.qrType === 'product' || order.qrType === 'product_qr';

  const BOLD_FONT = path.join(__dirname, "../assets/fonts/Roboto-Bold.ttf");
  const REGULAR_FONT = path.join(__dirname, "../assets/fonts/Roboto-Regular.ttf");

  const doc = new PDFDocument({
    size: "A4",
    margin: 0,
    autoFirstPage: true,
  });

  const pageWidth = 595.28;
  const brandColor = "#0b1b36";

  // 1. Top Header Banner
  doc.rect(0, 0, pageWidth, 75).fill(brandColor);

  const brandTitle = p.brand || options.brand || "AUTHENTIKS";
  doc.fillColor("#FFFFFF").font(BOLD_FONT).fontSize(20).text(brandTitle.toUpperCase(), 35, 20, { lineBreak: false });
  doc.fillColor("#8CB4D6").font(REGULAR_FONT).fontSize(9).text(isProduct ? "PRODUCT QR CODE & SPECIFICATION CERTIFICATE" : "BATCH QR CODE & SPECIFICATION CERTIFICATE", 35, 46, { lineBreak: false });

  // Header Right side: Order ID & Date
  const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  doc.fillColor("#FFFFFF").font(BOLD_FONT).fontSize(9).text(`ORDER ID: ${options.orderId || order.orderId || 'N/A'}`, 350, 24, { width: 210, align: "right" });
  doc.fillColor("#94A3B8").font(REGULAR_FONT).fontSize(8.5).text(`Generated: ${dateStr}`, 350, 42, { width: 210, align: "right" });

  // 2. QR CODE CARD (Centered Upper Section)
  const qrCardX = (pageWidth - 240) / 2;
  doc.save();
  doc.roundedRect(qrCardX, 95, 240, 245, 12).fillAndStroke("#FAFAFA", "#E2E8F0");
  
  // Generate QR Code image Buffer
  const baseUrl = process.env.FRONTEND_URL || 'https://authentiks.in';
  const qrUrl = `${baseUrl}/scan?code=${encodeURIComponent(p.qrCode || "")}`;
  const qrBuffer = await QRCode.toBuffer(qrUrl, { errorCorrectionLevel: 'H', scale: 10, margin: 1 });

  doc.image(qrBuffer, (pageWidth - 170) / 2, 110, { width: 170, height: 170 });

  // Code string & text below QR
  doc.fillColor("#0b1b36").font(BOLD_FONT).fontSize(9.5).text(p.qrCode || 'N/A', qrCardX, 290, { width: 240, align: 'center' });
  doc.fillColor("#64748B").font(REGULAR_FONT).fontSize(8).text(isProduct ? "Scan with camera to view complete product information" : "Scan with camera to verify batch authenticity", qrCardX, 308, { width: 240, align: 'center' });
  doc.restore();

  // 3. PRODUCT & BATCH DETAILS CARD
  const cardX = 35;
  let currentY = 355;
  const cardW = pageWidth - 70;

  // Header Box
  doc.save();
  doc.roundedRect(cardX, currentY, cardW, 195, 10).fillAndStroke("#FFFFFF", "#E2E8F0");
  
  // Card Section Header
  doc.rect(cardX, currentY, cardW, 30).fill("#F1F5F9");
  doc.fillColor("#0F172A").font(BOLD_FONT).fontSize(10).text(isProduct ? "PRODUCT SPECIFICATIONS" : "BATCH & PRODUCT SPECIFICATIONS", cardX + 15, currentY + 9);
  
  // Table Content Inside Card
  const tableY = currentY + 40;
  const rowHeight = 35;
  
  const drawKvRow = (label1, val1, label2, val2, yPos, isLast = false) => {
    const col1X = cardX + 15;
    const col2X = cardX + 265;
    
    // Column 1
    doc.fillColor("#64748B").font(BOLD_FONT).fontSize(7.5).text(label1.toUpperCase(), col1X, yPos);
    doc.fillColor("#0F172A").font(REGULAR_FONT).fontSize(9).text(String(val1 || 'N/A'), col1X, yPos + 11, { width: 230 });
    
    // Column 2
    doc.fillColor("#64748B").font(BOLD_FONT).fontSize(7.5).text(label2.toUpperCase(), col2X, yPos);
    doc.fillColor("#0F172A").font(REGULAR_FONT).fontSize(9).text(String(val2 || 'N/A'), col2X, yPos + 11, { width: 230 });

    if (!isLast) {
      doc.moveTo(cardX + 15, yPos + 28).lineTo(cardX + cardW - 15, yPos + 28).strokeColor("#F1F5F9").lineWidth(0.8).stroke();
    }
  };

  const mfdStr = p.mfdOn ? `${p.mfdOn.month || ''}/${p.mfdOn.year || ''}` : (p.manufactureDate || 'N/A');
  const expStr = p.calculatedExpiryDate || p.expiryDate || (p.bestBefore ? `${p.bestBefore.value} ${p.bestBefore.unit}` : 'N/A');

  drawKvRow("Product Name", p.productName || 'N/A', "Brand / Manufacturer", p.brand || options.brand || 'N/A', tableY);
  drawKvRow(isProduct ? "Batch No (Optional)" : "Batch / Lot Number", p.batchNo || (isProduct ? 'N/A (Product Level)' : 'N/A'), "SKU / Product Code", p.skuNumber || 'N/A', tableY + rowHeight);
  drawKvRow("Manufacturing Date", mfdStr, "Expiry Date", expStr, tableY + rowHeight * 2);
  drawKvRow("QR Type", isProduct ? "Product-Level QR" : "Batch-Level QR", "Status", "Active & Authenticated", tableY + rowHeight * 3, true);

  doc.restore();

  // 4. SUPPLY CHAIN DETAILS CARD
  currentY = 565;

  doc.save();
  doc.roundedRect(cardX, currentY, cardW, 215, 10).fillAndStroke("#FFFFFF", "#E2E8F0");
  
  // Section Header
  doc.rect(cardX, currentY, cardW, 30).fill("#F1F5F9");
  doc.fillColor("#0F172A").font(BOLD_FONT).fontSize(10).text("SUPPLY CHAIN & TRACEABILITY DETAILS", cardX + 15, currentY + 9);
  
  const scTableY = currentY + 40;
  
  const manufacturingInfo = [sc.manufacturerName, sc.manufacturingUnit, sc.manufacturingLocation].filter(Boolean).join(" - ") || 'N/A';
  const rawMaterialInfo = [sc.rawMaterialSource, sc.countryOfOrigin ? `Origin: ${sc.countryOfOrigin}` : ''].filter(Boolean).join(" | ") || 'N/A';
  const packagingInfo = [sc.packagingUnit, sc.packagingLocation, sc.packagingType].filter(Boolean).join(", ") || 'N/A';
  const distributionInfo = [sc.dispatchLocation, sc.distributorName ? `Distributor: ${sc.distributorName}` : ''].filter(Boolean).join(" | ") || 'N/A';

  drawKvRow("Manufacturing Unit & Location", manufacturingInfo, "Raw Material Source & Origin", rawMaterialInfo, scTableY);
  drawKvRow("Packaging Unit & Details", packagingInfo, "Dispatch & Distribution", distributionInfo, scTableY + rowHeight);
  drawKvRow("Supplier / Manufacturer", sc.supplierName || 'N/A', "Certifications", sc.certifications || 'N/A', scTableY + rowHeight * 2);
  drawKvRow("Mode of Transport", sc.modeOfTransport || 'N/A', "Expected Delivery", sc.expectedDeliveryDate || 'N/A', scTableY + rowHeight * 3, true);

  doc.restore();

  // 5. FOOTER
  doc.rect(0, 805, pageWidth, 36.89).fill("#F8FAFC");
  doc.moveTo(0, 805).lineTo(pageWidth, 805).strokeColor("#E2E8F0").lineWidth(1).stroke();
  doc.fillColor("#64748B").font(REGULAR_FONT).fontSize(8.5).text(isProduct ? "Authentiks Enterprise Product Identity System  •  Product QR Code Certificate" : "Authentiks Enterprise Product Traceability System  •  Batch QR Code Certificate", 0, 818, { width: pageWidth, align: "center" });

  return doc;
};

/**
 * Core PDF building logic. Returns a PDFDocument instance.
 * Note: Caller is responsible for calling doc.end() when finished.
 */
const buildQrPdf = async (products, options = {}) => {
  let qrType = (options.orderObj?.qrType || products[0]?.qrType || options.qrType || '').toLowerCase();

  // CRITICAL: If an order contains multiple products (> 1), it is ALWAYS an Individual/Normal QR order (sheet of QR stickers).
  // Batch QR and Product QR by definition are single-QR orders (products.length === 1).
  if (products.length > 1) {
    qrType = 'individual';
  }

  const isBatch = qrType === 'batch';
  const isProduct = qrType === 'product' || qrType === 'product_qr';

  // Batch-level and Product-level single QRs download the A4 Specification Certificate.
  // Normal/Individual orders (even if quantity is 1) download the QR sticker sheet layout.
  if ((isBatch || isProduct) && products.length === 1) {
    return await buildBatchQrPdf(products, { ...options, isProductLevel: isProduct });
  }

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

      const headerBrand = products[i].brand ? String(products[i].brand).toUpperCase() : "AUTHENTIKS";
      doc.font(BOLD_FONT).fontSize(6);
      doc.fillColor("#FFFFFF").text(headerBrand, x, y + (topRibbonH - 6) / 2 + 0.5, { width: contentWidth, align: "center", lineBreak: false });

      /** ── QR CODE SECTION (13mm) ── **/
      const midY = y + topRibbonH;
      doc.rect(x, midY, contentWidth, midSectionH).fill("#FFFFFF");

      const qrBuffer = allQrBuffers[i];
      const qrX = x + (contentWidth - qrSize) / 2;
      const qrImgY = midY + (midSectionH - qrSize) / 2;

      doc.image(qrBuffer, qrX, qrImgY, {
        width: qrSize,
        height: qrSize,
      });

      /** ── BOTTOM RIBBON (7mm) ── **/
      const bottomY = midY + midSectionH;
      doc.rect(x, bottomY, contentWidth, bottomRibbonH).fill(brandColor);

      if (products[i].serialNumber !== undefined) {
        doc
          .fillColor("#FFFFFF")
          .font(BOLD_FONT)
          .fontSize(5.5)
          .text("AUTHENTIC", x, bottomY + 2, {
            width: contentWidth,
            align: "center",
            lineBreak: false,
          });
        doc
          .fillColor("#8CB4D6")
          .font(BOLD_FONT)
          .fontSize(5)
          .text(formatSN(products[i].serialNumber), x, bottomY + 10, {
            width: contentWidth,
            align: "center",
            lineBreak: false,
          });
      } else {
        doc
          .fillColor("#FFFFFF")
          .font(BOLD_FONT)
          .fontSize(6)
          .text("AUTHENTIC", x, bottomY + (bottomRibbonH - 6) / 2, {
            width: contentWidth,
            align: "center",
            lineBreak: false,
          });
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
