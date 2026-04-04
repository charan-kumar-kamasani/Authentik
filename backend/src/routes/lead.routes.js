const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const { protect, authorize } = require('../middleware/authMiddleware');
const { sendLeadConfirmation } = require('../utils/emailService');

// POST /leads — Public: capture a new lead from the website
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, company, requirements, planInterest } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    const lead = await Lead.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: (phone || '').trim(),
      company: (company || '').trim(),
      requirements: (requirements || '').trim(),
      planInterest: (planInterest || '').trim(),
      source: 'website'
    });

    // Send confirmation emails (non-blocking)
    sendLeadConfirmation(lead).catch(() => {});

    res.status(201).json({ 
      message: 'Thank you! We will contact you shortly.',
      leadId: lead._id 
    });
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
});

// GET /leads — Protected: superadmin only
router.get('/', protect, authorize('superadmin', 'admin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const query = {};
    if (status) query.status = status;

    const leads = await Lead.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await Lead.countDocuments(query);

    res.json({ leads, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// PATCH /leads/:id — Protected: update lead status/notes
router.patch('/:id', protect, authorize('superadmin', 'admin'), async (req, res) => {
  try {
    const { status, notes } = req.body;
    const update = {};
    if (status) update.status = status;
    if (notes !== undefined) update.notes = notes;

    const lead = await Lead.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    res.json(lead);
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /leads/stats — Protected: lead funnel stats
router.get('/stats', protect, authorize('superadmin', 'admin'), async (req, res) => {
  try {
    const stats = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const total = await Lead.countDocuments();
    res.json({ total, byStatus: stats });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
