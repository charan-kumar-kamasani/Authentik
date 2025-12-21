const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Product",
  new mongoose.Schema({
    qrCode: String,
    productName: String,
    expiryDate: String,
    batchNo: String
  })
);
