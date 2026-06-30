const fs = require('fs');
const path = './src/routes/admin.routes.js';
let content = fs.readFileSync(path, 'utf8');

const routeStr = `
router.get(
  "/blank-qr-batches/:id/assignments",
  protect,
  authorize("superadmin"),
  async (req, res) => {
    try {
      const BlankQrBatch = require("../models/BlankQrBatch");
      const BlankQr = require("../models/BlankQr");
      
      const batch = await BlankQrBatch.findById(req.params.id);
      if (!batch) return res.status(404).json({ error: "Batch not found" });

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

      res.json(segments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ error: "Failed to fetch assignments" });
    }
  }
);
`;

const insertMarker = 'router.get(\n  "/blank-qr-batches/:id",';
if (content.includes(insertMarker)) {
  content = content.replace(insertMarker, routeStr + '\n' + insertMarker);
  fs.writeFileSync(path, content, 'utf8');
  console.log("Patched admin.routes.js");
} else {
  console.error("Could not find insert marker.");
}
