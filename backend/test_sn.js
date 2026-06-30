const mongoose = require('mongoose');
const StockRequest = require('./src/models/StockRequest');
const BlankQr = require('./src/models/BlankQr');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const reqs = await StockRequest.find({ status: 'Received', startSerialNumber: null });
  console.log('Found Received requests without SN:', reqs.length);
  for (let req of reqs) {
    const qrs = await BlankQr.find({ assignedToCompany: req.companyId }).sort({ serialNumber: 1 }).limit(req.quantity);
    if (qrs.length > 0) {
      req.startSerialNumber = qrs[0].serialNumber;
      req.endSerialNumber = qrs[qrs.length - 1].serialNumber;
      await req.save();
      console.log('Updated request:', req._id, 'with SN:', req.startSerialNumber, '-', req.endSerialNumber);
    }
  }
  process.exit(0);
}).catch(console.error);
