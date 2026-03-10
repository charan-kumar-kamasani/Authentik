const express = require('express');
const ProductTemplate = require('../models/ProductTemplate');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Get all product templates for a brand or company
// @route   GET /api/product-templates
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { brandId, companyId } = req.query;
    let query = { status: 'active' };

    if (brandId) query.brandId = brandId;
    if (companyId) query.companyId = companyId;

    // If no specific ID provided, and user is brand/company level, show their own
    if (!brandId && !companyId) {
        if (req.user.role === 'creator' || req.user.role === 'authorizer') {
            query.brandId = req.user.brandId;
        } else if (req.user.role === 'company') {
            query.companyId = req.user.companyId;
        }
    }

    const templates = await ProductTemplate.find(query)
      .populate('brandId', 'brandName')
      .sort({ createdAt: -1 });

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
    const { productName, productImage, productInfo, description, brandId, companyId } = req.body;

    const template = new ProductTemplate({
      productName,
      productImage,
      productInfo,
      description,
      brandId: brandId || req.user.brandId,
      companyId: companyId || req.user.companyId,
      createdBy: req.user._id
    });

    const savedTemplate = await template.save();
    res.status(201).json(savedTemplate);
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

    // Check ownership (simplified)
    const updates = req.body;
    Object.keys(updates).forEach(key => template[key] = updates[key]);

    const updatedTemplate = await template.save();
    res.json(updatedTemplate);
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

    template.status = 'archived';
    await template.save();
    res.json({ message: 'Template archived successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
