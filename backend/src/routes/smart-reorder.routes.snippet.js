// Smart Reorder Route (Add to scan.routes.js)
router.get("/smart-reorder/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const Product = require("../models/Product");
    const ProductTemplate = require("../models/ProductTemplate");

    const product = await Product.findById(productId).populate({
      path: 'brandId',
      populate: { path: 'companyId' }
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Try to find the ProductTemplate
    let templateData = null;
    if (product.brandId) {
      templateData = await ProductTemplate.findOne({
        productName: product.productName,
        brandId: product.brandId._id,
        status: 'active'
      }).lean();
    }

    // Build the dynamic payload
    const orderLinks = (product.orderLinks && product.orderLinks.length > 0) ? product.orderLinks : (templateData?.orderLinks || []);
    const price = product.price || templateData?.price || null;
    const mrp = product.mrp || templateData?.mrp || null;

    // We can extract custom 'usage' related dynamic fields
    const dynamicFields = (product.dynamicFields && product.dynamicFields.size > 0) ? product.dynamicFields : (templateData?.dynamicFields || {});

    // You can also check if the user is authenticated and get their purchase history for this product
    // For now, return standard product stats
    const responseData = {
      productId: product._id,
      productName: product.productName,
      productImage: product.productImage || templateData?.productImage,
      brand: product.brand || product.brandId?.brandName,
      companyName: product.brandId?.companyId?.companyName,
      variants: product.variants || templateData?.variants || [],
      orderLinks,
      price,
      mrp,
      dynamicFields,
      // For usage tracking UI
      createdAt: product.createdAt,
      expiryDate: product.expiryDate || product.calculatedExpiryDate
    };

    res.json(responseData);
  } catch (err) {
    console.error("Error fetching smart reorder data:", err);
    res.status(500).json({ error: "Failed to fetch smart reorder data" });
  }
});
