const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');

async function testPdfGen() {
  const products = [];
  for (let i = 0; i < 1000; i++) {
    products.push({ qrCode: `test_code_${i}`, serialNumber: i });
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

  console.time('Total Generation');
  
  const widthPts = 13 * 72; 
  const heightPts = 19 * 72; 
  const MM = 2.83465; 
  const cellWidth = 20 * MM; 
  const cellHeight = 25 * MM; 
  const cols = 15;
  const rows = 18;
  const perPage = cols * rows; 
  const rowGap = 0; 

  const gridWidth = cols * cellWidth;
  const gridHeight = rows * cellHeight + (rows > 0 ? (rows - 1) * rowGap : 0);
  const marginLeft = (widthPts - gridWidth) / 2;
  const marginTop = Math.max(0, (heightPts - gridHeight) / 2);

  const brandColor = "#FFFFFF";
  const headerHeight = cellHeight * 0.2; 
  const footerBannerH = cellHeight * 0.2; 
  const qrAreaHeight = cellHeight - headerHeight - footerBannerH; 

  const totalPages = Math.ceil(products.length / perPage);

  const BOLD_FONT = path.join(__dirname, "../assets/fonts/Roboto-Bold.ttf");

  const doc = new PDFDocument({
    size: [widthPts, heightPts],
    margin: 0,
    autoFirstPage: false,
  });

  const outPath = path.join(__dirname, "test_out.pdf");
  const writeStream = fs.createWriteStream(outPath);
  doc.pipe(writeStream);

  console.time('QR Generation');
  // Parallel QR Generation
  const baseUrl = 'https://authentiks.in';
  const qrBuffers = await Promise.all(products.map(p => 
    QRCode.toBuffer(`${baseUrl}/scan?code=${p.qrCode}`, {
      errorCorrectionLevel: 'L',
      scale: 8,
      margin: 1,
    })
  ));
  console.timeEnd('QR Generation');

  console.time('PDF Layout');
  for (let page = 0; page < totalPages; page++) {
    const start = page * perPage;
    const end = Math.min(start + perPage, products.length);
    if (start >= end) break;

    doc.addPage({ size: [widthPts, heightPts], margin: 0 });

    let idx = 0;
    for (let i = start; i < end; i++) {
      const row = Math.floor(idx / cols);
      const col = idx % cols;

      const x = marginLeft + col * cellWidth;
      const y = marginTop + row * (cellHeight + rowGap);

      doc.rect(x, y, cellWidth, headerHeight).fill(brandColor);

      doc
        .fillColor("#000")
        .font(BOLD_FONT)
        .fontSize(6.5)
        .text("Verify & Win", x, y + headerHeight / 2 - 3, {
          width: cellWidth,
          align: "center",
          lineBreak: false,
        });

      const qrY = y + headerHeight;
      doc.rect(x, qrY, cellWidth, qrAreaHeight).fill("#FFFFFF");

      const qrBuffer = qrBuffers[i];
      const qrSide = 13 * MM;
      const qrX = x + (cellWidth - qrSide) / 2;
      const qrImgY = qrY + (qrAreaHeight - qrSide) / 2;

      doc.image(qrBuffer, qrX, qrImgY, {
        width: qrSide,
        height: qrSide,
      });

      if (products[i].serialNumber !== undefined) {
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
      idx++;
    }
  }
  doc.end();

  await new Promise(resolve => writeStream.on('finish', resolve));
  console.timeEnd('PDF Layout');
  console.timeEnd('Total Generation');
}

testPdfGen().catch(console.error);
