const QRCode = require('qrcode');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

async function createCustomQR(url, logoUrl) {
  // 1. Get raw QR matrix
  const qr = QRCode.create(url, { errorCorrectionLevel: 'H' });
  const size = qr.modules.size;
  const data = qr.modules.data;

  // 2. Setup canvas
  const scale = 20;
  const margin = 1;
  const canvasSize = (size + margin * 2) * scale;
  const canvas = createCanvas(canvasSize, canvasSize);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvasSize, canvasSize);

  // 3. Draw rounded dots
  ctx.fillStyle = '#1e1b4b'; // Deep indigo color
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const isDark = data[row * size + col];
      
      // Check if it's in the finder patterns (corners)
      const isFinder = (
        (row < 7 && col < 7) ||
        (row < 7 && col >= size - 7) ||
        (row >= size - 7 && col < 7)
      );

      if (isDark && !isFinder) {
        const x = (col + margin) * scale + scale / 2;
        const y = (row + margin) * scale + scale / 2;
        ctx.beginPath();
        // Circle dot
        ctx.arc(x, y, scale * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // 4. Draw Custom Finder Patterns (Rounded)
  const drawFinder = (startX, startY) => {
    const x = (startX + margin) * scale;
    const y = (startY + margin) * scale;
    const s = 7 * scale;

    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.roundRect(x, y, s, s, scale * 2.5);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(x + scale, y + scale, s - 2 * scale, s - 2 * scale, scale * 1.5);
    ctx.fill();

    ctx.fillStyle = '#4f46e5'; // Brand accent color
    ctx.beginPath();
    ctx.roundRect(x + 2 * scale, y + 2 * scale, s - 4 * scale, s - 4 * scale, scale * 1);
    ctx.fill();
  };

  drawFinder(0, 0); // TL
  drawFinder(size - 7, 0); // TR
  drawFinder(0, size - 7); // BL

  // 5. Draw Logo
  const logoSize = canvasSize * 0.22;
  const logoX = (canvasSize - logoSize) / 2;
  const logoY = (canvasSize - logoSize) / 2;
  
  // White background for logo
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(logoX - scale, logoY - scale, logoSize + 2*scale, logoSize + 2*scale, scale*1.5);
  ctx.fill();

  // Draw logo image (if available)
  // For test, we just draw a colorful circle as placeholder if no image
  ctx.fillStyle = '#4f46e5';
  ctx.beginPath();
  ctx.arc(canvasSize/2, canvasSize/2, logoSize/2, 0, Math.PI*2);
  ctx.fill();

  const buffer = canvas.toBuffer('image/png');
  const outPath = '/Users/charankumarkamasani/.gemini/antigravity-ide/brain/1eebef76-0ec3-4909-8aa4-a52789b8fe3a/test-custom-qr.png';
  fs.writeFileSync(outPath, buffer);
  console.log('Saved to ' + outPath);
}

createCustomQR('https://authentiks.in/scan?code=SA-12345678-ABCD');
