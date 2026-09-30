const express = require('express');
const { body, validationResult } = require('express-validator');
const DirectionRequest = require('../models/DirectionRequest');
const Meal = require('../models/Meal');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
    const requests = await DirectionRequest.find(filter).populate('meal').populate('user');
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', protect, [
  body('meal').notEmpty(),
  body('question').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }

  try {
    const meal = await Meal.findById(req.body.meal);
    if (!meal) {
      return res.status(404).json({ success: false, message: 'Meal not found' });
    }

    const request = await DirectionRequest.create({
      user: req.user._id,
      meal: req.body.meal,
      question: req.body.question,
      details: req.body.details || '',
      status: 'Pending'
    });

    res.status(201).json({ success: true, request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const request = await DirectionRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    res.json({ success: true, request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
