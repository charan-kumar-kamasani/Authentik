const QRCode = require('qrcode');

async function run() {
  console.time('Sequential');
  for (let i = 0; i < 250; i++) {
    await QRCode.toBuffer(`https://authentiks.in/scan?code=test_${i}`, {
      errorCorrectionLevel: 'L',
      scale: 8,
      margin: 1,
    });
  }
  console.timeEnd('Sequential');

  console.time('Promise.all');
  const promises = [];
  for (let i = 0; i < 250; i++) {
    promises.push(QRCode.toBuffer(`https://authentiks.in/scan?code=test_${i}`, {
      errorCorrectionLevel: 'L',
      scale: 8,
      margin: 1,
    }));
  }
  await Promise.all(promises);
  console.timeEnd('Promise.all');
}

run();
