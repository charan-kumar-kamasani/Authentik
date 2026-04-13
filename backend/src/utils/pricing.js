const BillingConfig = require('../models/BillingConfig');

/**
 * Calculates the total amount and price per QR based on volume brackets.
 * @param {Number} quantity - The number of QR codes.
 * @returns {Promise<{pricePerQr: Number, amount: Number}>}
 */
const calculateQrPrice = async (quantity) => {
    const config = await BillingConfig.getConfig();
    let brackets = config.qrPricingBrackets || [];
    
    // Default tiers provided by the user if none configured in DB
    if (brackets.length === 0) {
        brackets = [
            { minQuantity: 500, maxQuantity: 5000, pricePerQr: 3 },
            { minQuantity: 5001, maxQuantity: 50000, pricePerQr: 2 },
            { minQuantity: 50001, maxQuantity: null, pricePerQr: 1 }
        ];
    }

    // Default price if no brackets configured or matching
    let pricePerQr = 1;

    // Find the matching bracket
    if (brackets.length > 0) {
        const match = brackets.find(b => {
            const min = b.minQuantity || 0;
            const max = b.maxQuantity || Infinity; // Max infinity if null
            return quantity >= min && (max === null || max === Infinity || quantity <= max);
        });

        if (match) {
            pricePerQr = match.pricePerQr;
        } else {
            // Fallback to closest bracket
            const sortedByMin = [...brackets].sort((a, b) => a.minQuantity - b.minQuantity);
            if (quantity < sortedByMin[0].minQuantity) {
                pricePerQr = sortedByMin[0].pricePerQr;
            } else {
                pricePerQr = sortedByMin[sortedByMin.length - 1].pricePerQr;
            }
        }
    }

    // Get GST percentage from settings
    const Setting = require('../models/Setting');
    const settings = await Setting.getSettings();
    const gstPercentage = typeof settings.gstPercentage === 'number' ? settings.gstPercentage : 18;

    const subtotal = Math.round(quantity * pricePerQr * 100) / 100;
    const tax = Math.round((subtotal * gstPercentage) / 100 * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    return { 
        pricePerQr, 
        subtotal, 
        tax, 
        total,
        amount: subtotal // For backward compatibility if needed
    };
};

module.exports = {
    calculateQrPrice
};
