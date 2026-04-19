const DEMO_PRODUCT = {
  active: true,
  fieldLabels: {
    "color": "Color",
    "size": "Size",
    "model_series": "Model / Series",
    "sku": "SKU/Model Number",
    "mrp": "MRP (Maximum Retail Price)",
    "countryOfOrigin": "Country of Origin",
    "manufacturedBy": "Manufactured by",
    "website": "Website",
    "customerCare": "Customer Care",
    "supportEmail": "Support Email"
  },
  dynamicFields: {
    "sku": "AL2468",
    "mrp": 36999,
    "countryOfOrigin": "Made in India",
    "manufacturedBy": "ALPHALITE SPORTS",
    "website": "www.alphalite.com",
    "customerCare": "1600800800",
    "supportEmail": "care@alphalite.com"
  },
  _id: "00000000000000000000demo",
  productId: "00000000000000000000demo",
  brandId: "0000000000000000000bdemo",
  companyName: "Alphalite",
  productName: "Panther - Neon Blue",
  brand: "Alphalite",
  batchNo: "ALPHA-2478",
  mfdOn: { month: "Feb", year: "2026" },
  description: "ALPHALITE Performance Series: Panther - Neon Blue\nExperience the intersection of high-performance athletics and cutting-edge digital security. The ALPHALITE Performance Series isn't just a sneaker; it's a verified piece of technology designed for those who demand intelligence as much as they demand speed.",
  keyBenefits: "Design & Aesthetics\nA sleek, low-top aerodynamic profile finished in a deep carbon black.\n\nFeatures integrated neon-blue electroluminescent piping along the midsole, providing a signature \"glow\" that stands out in low-light environments.\n\nConstructed with a high-density engineered mesh upper for maximum breathability and lightweight durability.",
  productImage: "https://res.cloudinary.com/dx4i1w3uf/image/upload/v1776596909/alphali_nig1vq.jpg",
  category: "Sporting Goods",
  variants: [
    { variantName: "color", variantLabel: "Color", value: "Black" },
    { variantName: "size", variantLabel: "Size", value: "10 UK" },
    { variantName: "model_series", variantLabel: "Model / Series", value: "Panther" }
  ],
  hasCoupon: true,
  alreadyReviewed: false,
};

const getDemoResult = (qrCode, userId, latitude, longitude, place) => {
  const scannedAt = new Date();
  
  if (qrCode === 'DEMO-GENUINE-QR') {
    return {
      status: "ORIGINAL",
      data: {
        ...DEMO_PRODUCT,
        qrCode,
        latitude,
        longitude,
        place,
        scannedAt
      }
    };
  }
  
  if (qrCode === 'DEMO-DUPLICATE-QR') {
    return {
      status: "ALREADY_USED",
      data: {
        ...DEMO_PRODUCT,
        qrCode,
        latitude,
        longitude,
        place,
        scannedAt,
        originalScan: {
          scannedBy: '98***123',
          scannedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          place: "Mumbai, Maharashtra"
        }
      }
    };
  }

  if (qrCode === 'DEMO-FAKE-QR') {
    return {
      status: "FAKE",
      data: {
        qrCode,
        productId: null,
        productName: null,
        brand: null,
        expiryDate: null,
        place,
        latitude,
        longitude,
        scannedAt
      }
    };
  }

  return null;
}

module.exports = { DEMO_PRODUCT, getDemoResult };
