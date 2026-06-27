const { Worker } = require('worker_threads');
const QRCode = require('qrcode'); // To make sure it's available

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

const worker = new Worker(workerCode, { eval: true });
worker.on('message', (msg) => {
  console.log('Received:', msg.buffer.length, 'bytes');
  worker.terminate();
});
worker.postMessage({ id: 1, url: 'https://example.com', options: { errorCorrectionLevel: 'L' }});
