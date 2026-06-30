const express = require('express');
const { scrapeProductPrice } = require('../utils/scraper');
const ProductTemplate = require('../models/ProductTemplate');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();


const syncScrapeTemplate = async (templateId) => {
  try {
    const template = await ProductTemplate.findById(templateId);
    if (!template || !template.orderLinks || template.orderLinks.length === 0) return template;
    
    let templateUpdated = false;
    let overallBestPrice = Infinity;
    
    for (const link of template.orderLinks) {
      if (link.url) {
        const scrapedDetails = await scrapeProductPrice(link.url);
        if (scrapedDetails) {
          if (scrapedDetails.price) link.price = scrapedDetails.price;
          if (scrapedDetails.mrp) link.mrp = scrapedDetails.mrp;
          if (scrapedDetails.discount) link.discount = scrapedDetails.discount;
          if (scrapedDetails.rating) link.rating = scrapedDetails.rating;
          if (scrapedDetails.reviewsCount) link.reviewsCount = scrapedDetails.reviewsCount;
          if (scrapedDetails.siteImage && !link.siteImage) link.siteImage = scrapedDetails.siteImage;
          link.lastScrapedAt = new Date();
          templateUpdated = true;
          
          if (scrapedDetails.price && scrapedDetails.price < overallBestPrice) {
            overallBestPrice = scrapedDetails.price;
          }
        }
      }
    }
    
    if (templateUpdated) {
      if (overallBestPrice !== Infinity) {
        template.price = overallBestPrice;
      }
      return await template.save();
    }
    return template;
  } catch (err) {
    console.error('Sync scrape failed for template', templateId, err);
    return null;
  }
};



// @desc    Get all product templates for a brand or company
// @route   GET /api/product-templates
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { brandId, companyId } = req.query;
    let query = { status: 'active' };

    // If companyId provided in query, use it
    if (companyId) {
      query.companyId = companyId;
    } else if (brandId) {
      query.brandId = brandId;
    } else {
      // Logic for scoped visibility:
      // Creators, Authorizers and Company users see everything for their company
      if (['creator', 'authorizer', 'company'].includes(req.user.role)) {
        if (req.user.companyId) {
          query.companyId = req.user.companyId;
        } else if (req.user.brandId) {
          // Fallback to brand if company is not set
          query.brandId = req.user.brandId;
        }
      }
    }

    const templates = await ProductTemplate.find(query)
      .populate('brandId', 'brandName')
      .populate('authorizedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @desc    Create a new product template
// @route   POST /api/product-templates
// @access  Private (Creator, Authorizer, Company, Admin, SuperAdmin)
router.post('/', protect, async (req, res) => {
  try {
    const { productName, productImage, productInfo, description, brandId, companyId, skuNumber, variants, dynamicFields, bestBefore, warranty, orderLinks, educationContent } = req.body;

    // Default to user's company/brand if not specified
    const finalBrandId = brandId || req.user.brandId;
    const finalCompanyId = companyId || req.user.companyId;

    if (!finalCompanyId && !finalBrandId) {
      return res.status(400).json({ error: 'Company or Brand ID is required' });
    }

    const template = new ProductTemplate({
      productName,
      productImage,
      productInfo,
      description,
      brandId: finalBrandId,
      companyId: finalCompanyId,
      skuNumber: skuNumber || null,
      createdBy: req.user._id,
      variants: variants || [],
      dynamicFields: dynamicFields || {},
      bestBefore: bestBefore || null,
      warranty: (warranty && (warranty.duration || warranty.warrantyType)) ? {
        duration: warranty.duration || null,
        durationUnit: warranty.durationUnit || 'months',
        warrantyType: warranty.warrantyType || '',
        description: warranty.description || '',
      } : undefined,
      orderLinks: orderLinks || [],
      educationContent: educationContent || [],
      isAuthorized: true,
      authorizedBy: req.user._id
    });

    const savedTemplate = await template.save();
    const finalTemplate = await syncScrapeTemplate(savedTemplate._id);
    res.status(201).json(finalTemplate || savedTemplate);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// @desc    Authorize a product template
// @route   PATCH /api/product-templates/:id/authorize
// @access  Private (Authorizer, Admin, SuperAdmin)
router.patch('/:id/authorize', protect, authorize('authorizer', 'admin', 'superadmin'), async (req, res) => {
  try {
    const template = await ProductTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ error: 'Template not found' });

    // Ensure the authorizer is in the same company
    if (req.user.role === 'authorizer' && template.companyId.toString() !== req.user.companyId.toString()) {
        return res.status(403).json({ error: 'You can only authorize products for your own company' });
    }

    template.isAuthorized = true;
    template.authorizedBy = req.user._id;

    const updatedTemplate = await template.save();
    res.json(updatedTemplate);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// @desc    Update a product template
// @route   PATCH /api/product-templates/:id
// @access  Private
router.patch('/:id', protect, async (req, res) => {
  try {
    const template = await ProductTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ error: 'Template not found' });

    // Check ownership or company alignment
    if (['creator', 'authorizer', 'company'].includes(req.user.role)) {
        if (template.companyId.toString() !== req.user.companyId.toString()) {
            return res.status(403).json({ error: 'Unauthorized to update this template' });
        }
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => template[key] = updates[key]);

    const updatedTemplate = await template.save();
    
    // Cascade update to all associated Products so they immediately reflect in the scanning app
    const Product = require('../models/Product');
    const cascadeUpdates = {};
    if (updates.educationContent !== undefined) cascadeUpdates.educationContent = updates.educationContent;
    if (updates.orderLinks !== undefined) cascadeUpdates.orderLinks = updates.orderLinks;
    if (updates.productInfo !== undefined) cascadeUpdates.productInfo = updates.productInfo;
    if (updates.description !== undefined) cascadeUpdates.description = updates.description;
    if (updates.productImage !== undefined) cascadeUpdates.productImage = updates.productImage;
    
    if (Object.keys(cascadeUpdates).length > 0) {
      await Product.updateMany({ templateId: template._id }, { $set: cascadeUpdates });
    }

    const finalTemplate = await syncScrapeTemplate(updatedTemplate._id);
    res.json(finalTemplate || updatedTemplate);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// @desc    Delete/Archive a product template
// @route   DELETE /api/product-templates/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const template = await ProductTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ error: 'Template not found' });

    // Ownership check
    if (['creator', 'authorizer', 'company'].includes(req.user.role)) {
        if (template.companyId.toString() !== req.user.companyId.toString()) {
            return res.status(403).json({ error: 'Unauthorized to delete this template' });
        }
    }

    template.status = 'archived';
    await template.save();
    res.json({ message: 'Template archived successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
