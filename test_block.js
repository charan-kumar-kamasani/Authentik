const mongoose = require('mongoose');
const BlankQr = require('./backend/src/models/BlankQr');
const BlankQrBatch = require('./backend/src/models/BlankQrBatch');
require('dotenv').config({path: './backend/.env'});

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const batch = await BlankQrBatch.findOne();
  console.log("Batch:", batch._id);
  
  const qrs = await BlankQr.find({ batchId: batch._id, isBlocked: false, isAssigned: false }).limit(3);
  const qrIds = qrs.map(q => q._id.toString());
  console.log("QR IDs to block:", qrIds);
  
  const validQrsCount = await BlankQr.countDocuments({
    _id: { $in: qrIds },
    serialNumber: { $gte: batch.startSerialNumber, $lte: batch.endSerialNumber },
    isAssigned: false
  });
  console.log("Valid QRs Count:", validQrsCount);
  
  const result = await BlankQr.updateMany(
    { _id: { $in: qrIds } },
    { $set: { isBlocked: true, blockReason: 'test' } }
  );
  console.log("Update result:", result);
  
  // Unblock them
  await BlankQr.updateMany(
    { _id: { $in: qrIds } },
    { $set: { isBlocked: false, blockReason: '' } }
  );
  process.exit(0);
}
test();
