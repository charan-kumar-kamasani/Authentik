const { createCanvas, registerFont, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const sharp = require("sharp");
const { Worker } = require("worker_threads");
const os = require("os");

const BOLD_FONT = path.join(__dirname, "../assets/fonts/Roboto-Bold.ttf");
if (fs.existsSync(BOLD_FONT)) {
  registerFont(BOLD_FONT, { family: "Roboto", weight: "bold" });
}

// Reusing worker logic for fast QR generation
const workerCode = `
  const { parentPort } = require('worker_threads');
  const QRCode = require('qrcode');
  parentPort.on('message', async (task) => {
    try {
      if (task.type === 'svg') {
        // Return raw SVG path data to keep it pure vector
        const svgString = await QRCode.toString(task.url, { type: 'svg', margin: 1, scale: task.options.scale || 8 });
        parentPort.postMessage({ id: task.id, buffer: svgString, error: null });
      } else {
        const buffer = await QRCode.toBuffer(task.url, task.options);
        parentPort.postMessage({ id: task.id, buffer, error: null });
      }
    } catch (err) {
      parentPort.postMessage({ id: task.id, buffer: null, error: err.message });
    }
  });
`;

async function generateQrsClustered(urls, options, type = 'png') {
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
      worker.postMessage({ id, url: urls[id], options, type });
    };

    workers.forEach(worker => {
      worker.on('message', (msg) => {
        if (msg.error) {
          reject(new Error(msg.error));
        } else {
          results[msg.id] = type === 'svg' ? msg.buffer : Buffer.from(msg.buffer);
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

// Math layout variables
const widthPts = 936;
const heightPts = 1368;
const MM = 2.83465;
const cellWidth = 20 * MM;
const cellHeight = 25 * MM;
const cols = 15;
const rowGap = 4.88977; 
const headerHeight = cellHeight * 0.2;
const footerBannerH = cellHeight * 0.2;
const qrAreaHeight = cellHeight - headerHeight - footerBannerH;
const qrSide = 13 * MM;

const buildPageCanvas = async (products, startIdx, options, allQrBuffers) => {
  const DPI = 900;
  const scale = DPI / 72; // 900 DPI = 12.5x scale for ultra-sharp print quality
  const canvasWidth = Math.round(widthPts * scale);
  const canvasHeight = Math.round(heightPts * scale);

  const canvas = createCanvas(canvasWidth, canvasHeight);
  // textDrawingMode: 'path' renders text as vector outlines instead of bitmap glyphs
  // This produces much smoother, crisper text — essential for print quality
  const ctx = canvas.getContext("2d", { textDrawingMode: 'path' });
  
  // 'gray' anti-aliasing is best for print output (no LCD subpixel color fringing)
  ctx.antialias = 'gray';
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  const rows = options.isBlankQr ? 17 : 18;
  const perPage = options.isBlankQr ? 250 : cols * rows;
  const gridWidth = cols * cellWidth;
  const gridHeight = rows * cellHeight + (rows > 0 ? (rows - 1) * rowGap : 0);
  const marginLeft = (widthPts - gridWidth) / 2;
  const marginTop = Math.max(0, (heightPts - gridHeight) / 2);

  // Scoring / cut lines
  if (options.scoring !== false) {
    ctx.strokeStyle = "#E0E0E0";
    ctx.lineWidth = 0.3 * scale;
    ctx.beginPath();
    for (let c = 0; c <= cols; c++) {
      const x = (marginLeft + c * cellWidth) * scale;
      ctx.moveTo(x, marginTop * scale);
      ctx.lineTo(x, (marginTop + gridHeight) * scale);
    }
    for (let r = 0; r < rows; r++) {
      const topY = (marginTop + r * (cellHeight + rowGap)) * scale;
      const bottomY = topY + cellHeight * scale;
      ctx.moveTo(marginLeft * scale, topY);
      ctx.lineTo((marginLeft + gridWidth) * scale, topY);
      ctx.moveTo(marginLeft * scale, bottomY);
      ctx.lineTo((marginLeft + gridWidth) * scale, bottomY);
    }
    ctx.stroke();
  }

  const end = Math.min(startIdx + perPage, products.length);
  let idx = 0;

  for (let i = startIdx; i < end; i++) {
    const row = Math.floor(idx / cols);
    const col = idx % cols;
    const x = (marginLeft + col * cellWidth) * scale;
    const y = (marginTop + row * (cellHeight + rowGap)) * scale;
    const qrY = y + headerHeight * scale;
    const footerY = qrY + qrAreaHeight * scale;
    const qrX = x + ((cellWidth - qrSide) / 2) * scale;
    const qrImgY = qrY + ((qrAreaHeight - qrSide) / 2) * scale;

    // Backgrounds
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(x, y, cellWidth * scale, cellHeight * scale);

    // Text — keep smoothing ON for crisp text
    ctx.fillStyle = "#000000";
    ctx.font = `bold ${6.5 * scale}px Roboto, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("Scratch & Win", x + (cellWidth * scale) / 2, y + (headerHeight * scale) / 2 - (1.5 * scale));
    ctx.fillText("Use Coin/Key", x + (cellWidth * scale) / 2, footerY + (footerBannerH * scale) / 2 - (1.5 * scale));

    // QR Image — disable smoothing ONLY for QR so edges stay razor-sharp
    ctx.imageSmoothingEnabled = false;
    const qrImage = await loadImage(allQrBuffers[i]);
    ctx.drawImage(qrImage, qrX, qrImgY, qrSide * scale, qrSide * scale);
    ctx.imageSmoothingEnabled = true; // re-enable for everything else

    // Serial number
    if (products[i].serialNumber && rowGap > 0) {
      ctx.fillStyle = "#666666";
      ctx.font = `bold ${4 * scale}px Roboto, sans-serif`;
      ctx.textBaseline = 'top';
      ctx.fillText(formatSN(products[i].serialNumber), x + (cellWidth * scale) / 2, y + cellHeight * scale + (0.5 * scale));
    }

    // Border
    if (options.scoring !== false) {
      ctx.strokeStyle = "#E0E0E0";
      ctx.lineWidth = 0.3 * scale;
      ctx.strokeRect(x, y, cellWidth * scale, cellHeight * scale);
    }
    idx++;
  }

  // PAGE FOOTER
  const pageFooterY = (heightPts - 25) * scale;
  ctx.fillStyle = "#000000";
  ctx.font = `bold ${8 * scale}px Roboto, sans-serif`;
  ctx.textBaseline = 'top';

  const orderId = options.orderId || products[startIdx]?.orderId || "N/A";
  let brand = products[startIdx]?.brand || options.brand || "N/A";

  if (options.isBlankQr) {
    const pageStartSN = products[startIdx]?.serialNumber;
    const pageEndSN = products[end - 1]?.serialNumber;
    if (pageStartSN && pageEndSN) {
      brand = `${formatSN(pageStartSN)} to ${formatSN(pageEndSN)}`;
    }
  }

  const colW = (gridWidth / 3) * scale;
  ctx.textAlign = 'left';
  ctx.fillText(`${orderId}`, marginLeft * scale, pageFooterY);
  ctx.textAlign = 'center';
  ctx.fillText(`${brand}`, marginLeft * scale + colW * 1.5, pageFooterY);
  ctx.textAlign = 'right';
  const totalPages = Math.ceil(products.length / perPage);
  const pageNum = Math.floor(startIdx / perPage) + 1;
  ctx.fillText(`Page ${pageNum} of ${totalPages}`, (marginLeft + gridWidth) * scale, pageFooterY);

  return { canvas, DPI };
};

const buildPageSvg = (products, startIdx, options, allQrStrings) => {
  const rows = options.isBlankQr ? 17 : 18;
  const perPage = options.isBlankQr ? 250 : cols * rows;
  const gridWidth = cols * cellWidth;
  const gridHeight = rows * cellHeight + (rows > 0 ? (rows - 1) * rowGap : 0);
  const marginLeft = (widthPts - gridWidth) / 2;
  const marginTop = Math.max(0, (heightPts - gridHeight) / 2);

  let svg = `<svg width="13in" height="19in" viewBox="0 0 ${widthPts} ${heightPts}" xmlns="http://www.w3.org/2000/svg">
<style>
  .bold { font-family: 'Roboto', sans-serif; font-weight: bold; }
  .text-xs { font-size: 6.5px; fill: #000; text-anchor: middle; dominant-baseline: middle; }
  .text-xxs { font-size: 4px; fill: #666; text-anchor: middle; dominant-baseline: hanging; }
  .footer { font-size: 8px; fill: #000; dominant-baseline: hanging; }
</style>
<rect width="${widthPts}" height="${heightPts}" fill="#FFFFFF" />`;

  // Scoring
  if (options.scoring !== false) {
    svg += `<g stroke="#E0E0E0" stroke-width="0.3">`;
    for (let c = 0; c <= cols; c++) {
      const x = marginLeft + c * cellWidth;
      svg += `<line x1="${x}" y1="${marginTop}" x2="${x}" y2="${marginTop + gridHeight}" />`;
    }
    for (let r = 0; r < rows; r++) {
      const topY = marginTop + r * (cellHeight + rowGap);
      const bottomY = topY + cellHeight;
      svg += `<line x1="${marginLeft}" y1="${topY}" x2="${marginLeft + gridWidth}" y2="${topY}" />`;
      svg += `<line x1="${marginLeft}" y1="${bottomY}" x2="${marginLeft + gridWidth}" y2="${bottomY}" />`;
    }
    svg += `</g>`;
  }

  const end = Math.min(startIdx + perPage, products.length);
  let idx = 0;

  for (let i = startIdx; i < end; i++) {
    const row = Math.floor(idx / cols);
    const col = idx % cols;
    const x = marginLeft + col * cellWidth;
    const y = marginTop + row * (cellHeight + rowGap);
    const qrY = y + headerHeight;
    const footerY = qrY + qrAreaHeight;
    const qrX = x + (cellWidth - qrSide) / 2;
    const qrImgY = qrY + (qrAreaHeight - qrSide) / 2;

    svg += `<rect x="${x}" y="${y}" width="${cellWidth}" height="${cellHeight}" fill="#FFFFFF" />`;
    if (options.scoring !== false) {
      svg += `<rect x="${x}" y="${y}" width="${cellWidth}" height="${cellHeight}" fill="none" stroke="#E0E0E0" stroke-width="0.3" />`;
    }

    svg += `<text x="${x + cellWidth / 2}" y="${y + headerHeight / 2}" class="bold text-xs">Scratch &amp; Win</text>`;
    svg += `<text x="${x + cellWidth / 2}" y="${footerY + footerBannerH / 2}" class="bold text-xs">Use Coin/Key</text>`;

    if (products[i].serialNumber && rowGap > 0) {
      svg += `<text x="${x + cellWidth / 2}" y="${y + cellHeight + 0.5}" class="bold text-xxs">${formatSN(products[i].serialNumber)}</text>`;
    }

    // Extract raw <path> and <rect> from qrcode SVG string and apply transform
    // The qrcode SVG usually has <svg viewBox="...">...</svg>. We can grab everything inside.
    const rawSvg = allQrStrings[i];
    const innerContentMatch = rawSvg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
    if (innerContentMatch) {
      let innerContent = innerContentMatch[1];
      // QRCode generates white background rect by default which we don't strictly need, but we can keep it.
      // We need to scale the QR from its native viewBox (e.g., 0 0 45 45) to fit qrSide
      const viewBoxMatch = rawSvg.match(/viewBox="0 0 (\d+) (\d+)"/);
      if (viewBoxMatch) {
        const qrNativeSide = parseFloat(viewBoxMatch[1]);
        const scale = qrSide / qrNativeSide;
        svg += `<g transform="translate(${qrX}, ${qrImgY}) scale(${scale})">${innerContent}</g>`;
      }
    }
    
    idx++;
  }

  // PAGE FOOTER
  const pageFooterY = heightPts - 25;
  const orderId = options.orderId || products[startIdx]?.orderId || "N/A";
  let brand = products[startIdx]?.brand || options.brand || "N/A";

  if (options.isBlankQr) {
    const pageStartSN = products[startIdx]?.serialNumber;
    const pageEndSN = products[end - 1]?.serialNumber;
    if (pageStartSN && pageEndSN) {
      brand = `${formatSN(pageStartSN)} to ${formatSN(pageEndSN)}`;
    }
  }

  const colW = gridWidth / 3;
  const totalPages = Math.ceil(products.length / perPage);
  const pageNum = Math.floor(startIdx / perPage) + 1;

  svg += `<text x="${marginLeft}" y="${pageFooterY}" class="bold footer" text-anchor="start">${orderId}</text>`;
  svg += `<text x="${marginLeft + colW * 1.5}" y="${pageFooterY}" class="bold footer" text-anchor="middle">${brand}</text>`;
  svg += `<text x="${marginLeft + gridWidth}" y="${pageFooterY}" class="bold footer" text-anchor="end">Page ${pageNum} of ${totalPages}</text>`;

  svg += `</svg>`;
  return svg;
};

const generateLayoutZip = async (products, options = {}, format) => {
  return new Promise(async (resolve, reject) => {
    try {
      const baseUrl = process.env.FRONTEND_URL || 'https://authentiks.in';
      const qrUrls = products.map((p) => `${baseUrl}/scan?code=${encodeURIComponent(p.qrCode || "")}`);
      
      const isSvg = format === 'svg';
      const allQrData = await generateQrsClustered(qrUrls, { errorCorrectionLevel: 'L', margin: 0, scale: isSvg ? 8 : 32 }, isSvg ? 'svg' : 'png');

      const perPage = options.isBlankQr ? 250 : cols * (options.isBlankQr ? 17 : 18);
      const totalPages = Math.ceil(products.length / perPage);
      
      const buffers = [];
      const archive = archiver('zip', { zlib: { level: 9 } });

      archive.on('error', (err) => reject(err));
      archive.on('data', data => buffers.push(data));
      archive.on('end', () => {
        const finalBuffer = Buffer.concat(buffers);
        resolve(finalBuffer.toString("base64"));
      });

      const ext = isSvg ? 'svg' : (format === 'tiff' || format === 'tif' ? 'tiff' : 'png');

      for (let page = 0; page < totalPages; page++) {
        const startIdx = page * perPage;
        
        let fileBuffer;
        if (isSvg) {
          const svgString = buildPageSvg(products, startIdx, options, allQrData);
          fileBuffer = Buffer.from(svgString);
        } else {
          const { canvas, DPI } = await buildPageCanvas(products, startIdx, options, allQrData);
          const pngBuffer = canvas.toBuffer("image/png");
          if (format === 'tiff' || format === 'tif') {
            fileBuffer = await sharp(pngBuffer)
              .withMetadata({ density: DPI })
              .tiff({ compression: 'lzw' })
              .toBuffer();
          } else {
            fileBuffer = pngBuffer;
          }
        }
        
        const fileName = `Layout_Page_${page + 1}.${ext}`;
        archive.append(fileBuffer, { name: fileName });
      }

      archive.finalize();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generateLayoutZip };
