const mongoose = require("mongoose");
const BlankQr = require("./src/models/BlankQr");
const BlankQrBatch = require("./src/models/BlankQrBatch");
require("dotenv").config();

async function test() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/authentik");
  const batch = await BlankQrBatch.findOne().sort({ createdAt: -1 });
  
  const assignedQrs = await BlankQr.find({
    serialNumber: { $gte: batch.startSerialNumber, $lte: batch.endSerialNumber },
    assignedToCompany: { $ne: null }
  })
  .sort({ serialNumber: 1 })
  .populate('assignedToCompany', 'companyName')
  .lean();

  const segments = [];
  let currentSegment = null;

  for (const qr of assignedQrs) {
    if (!currentSegment) {
      currentSegment = {
        company: qr.assignedToCompany,
        startSerialNumber: qr.serialNumber,
        endSerialNumber: qr.serialNumber,
        count: 1
      };
    } else if (
      qr.assignedToCompany && currentSegment.company &&
      qr.assignedToCompany._id.toString() === currentSegment.company._id.toString() &&
      qr.serialNumber === currentSegment.endSerialNumber + 1
    ) {
      currentSegment.endSerialNumber = qr.serialNumber;
      currentSegment.count++;
    } else {
      segments.push(currentSegment);
      currentSegment = {
        company: qr.assignedToCompany,
        startSerialNumber: qr.serialNumber,
        endSerialNumber: qr.serialNumber,
        count: 1
      };
    }
  }
  if (currentSegment) {
    segments.push(currentSegment);
  }

  console.log("Segments:", segments);
  process.exit(0);
}
test();
