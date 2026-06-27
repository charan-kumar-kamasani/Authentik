const { Worker } = require('worker_threads');
const os = require('os');
const path = require('path');
const QRCode = require('qrcode');

async function generateQrsClustered(urls, options) {
  const numCPUs = os.cpus().length;
  const workers = [];
  for (let i = 0; i < numCPUs; i++) {
    workers.push(new Worker(path.join(__dirname, 'qrWorker.js')));
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
        if (msg.error) reject(new Error(msg.error));
        else {
          results[msg.id] = msg.buffer;
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

async function run() {
  const urls = [];
  for (let i = 0; i < 1000; i++) {
    urls.push(`https://authentiks.in/scan?code=test_${i}`);
  }

  console.time('Sequential');
  for (let i = 0; i < 1000; i++) {
    await QRCode.toBuffer(urls[i], {
      errorCorrectionLevel: 'L',
      scale: 8,
      margin: 1,
    });
  }
  console.timeEnd('Sequential');

  console.time('Clustered');
  await generateQrsClustered(urls, {
    errorCorrectionLevel: 'L',
    scale: 8,
    margin: 1,
  });
  console.timeEnd('Clustered');
}

run().catch(console.error);
