const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Timetable = require('../models/Timetable');
const Meal = require('../models/Meal');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', async (req, res) => {
  const today = new Date();
  const month = Number(req.query.month) || today.getMonth() + 1;
  const year = Number(req.query.year) || today.getFullYear();

  try {
    let subscriber = false;
    const authorization = req.headers.authorization;

    if (authorization?.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authorization.slice(7), process.env.JWT_SECRET || 'bachelor-kitchen-secret');
        const user = await User.findById(decoded.id).select('role');
        subscriber = user?.role === 'admin' || Boolean(await Subscription.exists({
          user: decoded.id,
          status: 'active',
          endDate: { $gte: new Date() }
        }));
      } catch {
        return res.status(401).json({ success: false, message: 'Token is invalid or expired' });
      }
    }

    const filter = { month, year, published: true };
    if (!subscriber) filter.date = { $lte: new Date(year, month - 1, 14, 23, 59, 59, 999) };

    const entries = await Timetable.find(filter)
      .populate({ path: 'meal', select: 'title image category preparationTime difficulty estimatedCost isExotic', populate: { path: 'category', select: 'name' } })
      .sort({ date: 1 });

    res.json({ success: true, entries, access: subscriber ? 'full-month' : 'first-two-weeks' });
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
