const express = require('express');
const { body, validationResult } = require('express-validator');
const MealVideo = require('../models/MealVideo');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', async (req, res) => {
  const videos = await MealVideo.find({}).sort({ displayDate: 1, mealPeriod: 1 }).populate('mealId', 'title');
  res.json({ success: true, videos });
});

router.post('/', protect, authorize('admin'), [
  body('title').notEmpty(),
  body('url').isURL().withMessage('A valid video URL is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });

  try {
    const video = await MealVideo.create({
      ...req.body,
      createdBy: req.user._id,
      status: req.body.status || 'scheduled'
    });
    res.status(201).json({ success: true, video });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.patch('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const video = await MealVideo.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
    res.json({ success: true, video });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  const video = await MealVideo.findByIdAndDelete(req.params.id);
  if (!video) return res.status(404).json({ success: false, message: 'Video not found' });
  res.json({ success: true, message: 'Video deleted' });
});

module.exports = router;
