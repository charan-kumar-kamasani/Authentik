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
