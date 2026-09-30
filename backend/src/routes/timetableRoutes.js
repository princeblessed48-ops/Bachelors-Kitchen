const express = require('express');
const { body, validationResult } = require('express-validator');
const Timetable = require('../models/Timetable');
const Meal = require('../models/Meal');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', async (req, res) => {
  const { month, year } = req.query;

  try {
    const filter = {};
    if (month) filter.month = Number(month);
    if (year) filter.year = Number(year);

    const entries = await Timetable.find(filter)
      .populate({ path: 'meal', populate: { path: 'category' } })
      .sort({ date: 1 });

    res.json({ success: true, entries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', protect, authorize('admin'), [
  body('date').notEmpty(),
  body('meal').notEmpty(),
  body('month').notEmpty(),
  body('year').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }

  try {
    const meal = await Meal.findById(req.body.meal);
    if (!meal) {
      return res.status(400).json({ success: false, message: 'Meal not found' });
    }

    const entry = await Timetable.create({
      date: req.body.date,
      meal: req.body.meal,
      month: Number(req.body.month),
      year: Number(req.body.year),
      published: req.body.published || false
    });

    res.status(201).json({ success: true, entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const entry = await Timetable.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Timetable entry not found' });
    }

    res.json({ success: true, entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const entry = await Timetable.findByIdAndDelete(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Timetable entry not found' });
    }

    res.json({ success: true, message: 'Timetable entry deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
