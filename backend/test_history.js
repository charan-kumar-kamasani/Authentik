const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://charankumarreddy03_db_user:oTj41t4ATqEVdP25@cluster0.cirqcii.mongodb.net/authentick');
const Scan = require('./src/models/Scan');
async function run() {
  const scan = await Scan.findOne({ productName: /IQOO/i })
    .populate({ path: "productId", populate: { path: "orderId" } })
    .populate({ path: "brandId", populate: { path: "companyId" } })
    .lean();
  console.log("Scan:", JSON.stringify(scan, null, 2));
  process.exit(0);
}
run();
