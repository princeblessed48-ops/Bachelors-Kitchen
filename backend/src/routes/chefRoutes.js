const express = require('express');
const { body, validationResult } = require('express-validator');
const Chef = require('../models/Chef');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const chefs = await Chef.find({ active: true });
    res.json({ success: true, chefs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', protect, authorize('admin'), [
  body('name').notEmpty(),
  body('specialty').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }

  try {
    const chef = await Chef.create(req.body);
    res.status(201).json({ success: true, chef });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
