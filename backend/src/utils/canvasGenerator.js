const { createCanvas, loadImage } = require('canvas');
const QRCode = require('qrcode');

const MM = 2.83465;
const A3_WIDTH = Math.floor(297 * MM);
const A3_HEIGHT = Math.floor(420 * MM);

const SCALE = 2.5; // High resolution for A3 prints

const generateQrImagePages = async (products, format = 'png', options = {}) => {
  const brandColor = options.brandColor || "#020617";
  const cols = 15;
  const rows = 18;
  const perPage = cols * rows; // 270
  const totalPages = Math.ceil(products.length / perPage);

  const cellWidth = 15 * MM;
  const headerHeight = 3.5 * MM;
  const qrAreaHeight = 15 * MM;
  const footerBannerH = 2.5 * MM;
  const cellHeight = headerHeight + qrAreaHeight + footerBannerH;

  const gridWidth = cols * cellWidth;
  const gridHeight = rows * cellHeight;

  const marginLeft = (A3_WIDTH - gridWidth) / 2;
  const marginTop = (A3_HEIGHT - gridHeight) / 2;

  const qrSide = 13 * MM;

  const pages = [];

  for (let page = 0; page < totalPages; page++) {
    const start = page * perPage;
    const end = Math.min(start + perPage, products.length);

    console.log(`Generating canvas page ${page + 1}/${totalPages}`);

    // Create a high resolution canvas
    const canvas = createCanvas(Math.floor(A3_WIDTH * SCALE), Math.floor(A3_HEIGHT * SCALE));
    const ctx = canvas.getContext('2d');

    // Scale context so we can use standard points
    ctx.scale(SCALE, SCALE);

    // Set white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, A3_WIDTH, A3_HEIGHT);

    // Draw borders if scoring is enabled
    if (options.scoring !== false) {
      ctx.strokeStyle = "#E0E0E0";
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

    let idx = 0;

    for (let i = start; i < end; i++) {
        const row = Math.floor(idx / cols);
        const col = idx % cols;

        const x = marginLeft + col * cellWidth;
        const y = marginTop + row * cellHeight;

        // ── HEADER ──
        ctx.fillStyle = brandColor;
        ctx.fillRect(x, y, cellWidth, headerHeight);

        ctx.fillStyle = "#000000";
        ctx.font = 'bold 6.5px Helvetica';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText("Scratch & Scan", x + cellWidth / 2, y + headerHeight / 2);

        // ── QR CODE AREA ──
        const qrY = y + headerHeight;
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(x, qrY, cellWidth, qrAreaHeight);

        const qrUrl = `https://authentiks.in/scan?code=${encodeURIComponent(products[i].qrCode || "")}`;
        
        try {
            const qrDataUrl = await QRCode.toDataURL(qrUrl, {
                errorCorrectionLevel: 'M',
                margin: 1,
                width: 300 // generate at fixed size then scale down in drawImage
            });
            const qrImage = await loadImage(qrDataUrl);
            
            const qrX = x + (cellWidth - qrSide) / 2;
            const qrImgY = qrY + (qrAreaHeight - qrSide) / 2;
            
            ctx.drawImage(qrImage, qrX, qrImgY, qrSide, qrSide);
        } catch (qrErr) {
            console.error("QR Generation err on canvas", qrErr);
        }

        // ── FOOTER BANNER ──
        const footerY = qrY + qrAreaHeight;
        ctx.fillStyle = brandColor;
        ctx.fillRect(x, footerY, cellWidth, footerBannerH);

        ctx.fillStyle = "#000000";
        ctx.font = 'bold 6.5px Helvetica';
        ctx.fillText("Authentiks.in", x + cellWidth / 2, footerY + footerBannerH / 2);

        idx++;
    }

    // PAGE FOOTER TEXT
    const orderId = options.orderId || products[start]?.orderId || "N/A";
    const brand = products[start]?.brand || options.brand || "N/A";
    const pageFooterY = marginTop + gridHeight + 6;

    ctx.fillStyle = "#000000";
    ctx.font = 'bold 8px Helvetica';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const colW = gridWidth / 3;

    ctx.fillText(`${orderId}`, marginLeft, pageFooterY);
    
    ctx.textAlign = 'center';
    ctx.fillText(`${brand}`, marginLeft + colW * 1.5, pageFooterY);

    ctx.textAlign = 'right';
    ctx.fillText(`Page ${page + 1} of ${totalPages}`, marginLeft + gridWidth, pageFooterY);

    // Get buffer directly natively!
    const buffer = format === 'jpeg' || format === 'jpg' 
      ? canvas.toBuffer('image/jpeg', { quality: 1 })
      : canvas.toBuffer('image/png');
      
    pages.push({
      buffer,
      filename: `Page_${page + 1}.${format === 'jpeg' || format === 'jpg' ? 'jpg' : 'png'}`
    });
  }

  return pages;
};

module.exports = { generateQrImagePages };
