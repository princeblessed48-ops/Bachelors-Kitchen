const express = require('express');
const { body, validationResult } = require('express-validator');
const AllergenMapping = require('../models/AllergenMapping');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', async (req, res) => {
  const mappings = await AllergenMapping.find({ active: true }).sort({ name: 1 });
  res.json({ success: true, mappings });
});

router.post('/', protect, authorize('admin'), [
  body('name').notEmpty(),
  body('aliases').optional().isArray()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });

  try {
    const mapping = await AllergenMapping.create({ ...req.body, active: true });
    res.status(201).json({ success: true, mapping });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
