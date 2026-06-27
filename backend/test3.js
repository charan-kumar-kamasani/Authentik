const mongoose = require('mongoose');
const BlankQr = require('./src/models/BlankQr');
const BlankQrBatch = require('./src/models/BlankQrBatch');
require('dotenv').config();

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const batch = await BlankQrBatch.findOne();
  console.log("Batch ID:", batch._id);
  
  const qrs = await BlankQr.find({ batchId: batch._id, isBlocked: false, isAssigned: false }).limit(3);
  const qrIds = qrs.map(q => q._id.toString());
  console.log("QR IDs to block:", qrIds);
  
  const result = await BlankQr.updateMany(
    { _id: { $in: qrIds } },
    { $set: { isBlocked: true, blockReason: 'test' } }
  );
  console.log("Update result:", result);
  
  // Unblock
  await BlankQr.updateMany(
    { _id: { $in: qrIds } },
    { $set: { isBlocked: false, blockReason: '' } }
  );
  process.exit(0);
}
test();
