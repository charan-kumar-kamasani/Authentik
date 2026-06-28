const DEMO_PRODUCT = {
  active: true,
  fieldLabels: {
    "color": "Color",
    "size": "Size",
    "model_series": "Model / Series",
    "sku": "SKU/Model Number",
    "mrp": "",
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
  warranty: {
    duration: 1,
    durationUnit: "years",
    warrantyType: "Brand Warranty",
    customerCare: "1600800800",
    supportEmail: "care@alphalite.com",
    description: "This product comes with a 1-Year brand warranty covering all manufacturing defects. Physical damages and unauthorized modifications are not covered under standard terms."
  },
  warrantyClaimStatus: null,
  recommendations: [
    {
      id: 1,
      productName: 'Daily Fibre+ Greens Unflavoured',
      mrp: 1299,
      oldPrice: '₹1,499',
      discount: '13% OFF',
      ratingBadge: '4.4g FIBRE',
      productImage: 'https://res.cloudinary.com/dx4i1w3uf/image/upload/v1776596909/alphali_nig1vq.jpg'
    },
    {
      id: 2,
      productName: 'Plant Protein Mango Mania',
      mrp: 1439,
      oldPrice: '₹1,799',
      discount: '20% OFF',
      ratingBadge: '25g PROTEIN',
      productImage: 'https://res.cloudinary.com/dx4i1w3uf/image/upload/v1776596909/alphali_nig1vq.jpg'
    },
    {
      id: 3,
      productName: 'Plant Protein Classic Unflavoured',
      mrp: 1439,
      oldPrice: '₹1,799',
      discount: '20% OFF',
      ratingBadge: '25g PROTEIN',
      productImage: 'https://res.cloudinary.com/dx4i1w3uf/image/upload/v1776596909/alphali_nig1vq.jpg'
    },
    {
      id: 4,
      productName: 'Nutrition Mix Chocolate',
      mrp: 1699,
      oldPrice: '₹1,999',
      discount: '15% OFF',
      ratingBadge: '13 VITAMINS & MINERALS',
      productImage: 'https://res.cloudinary.com/dx4i1w3uf/image/upload/v1776596909/alphali_nig1vq.jpg'
    }
  ]
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
        alertReasons: [
          "Product sharing or resale",
          "Unauthorized distribution",
          "Potential counterfeit activity"
        ],
        ...DEMO_PRODUCT,
        qrCode,
        latitude,
        longitude,
        place,
        scannedAt,
        originalScan: {
          scannedBy: '98*****123',
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
        alertReasons: [
          "Counterfeit or fake product",
          "Tampered or duplicate QR code",
          "Unauthorized manufacturing or distribution",
          "Product not linked with Authentiks protection"
        ],
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
