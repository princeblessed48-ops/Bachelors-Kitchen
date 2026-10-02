const express = require('express');
const { body, validationResult } = require('express-validator');
const Timetable = require('../models/Timetable');
const Meal = require('../models/Meal');
const { protect, authorize } = require('../middleware/authMiddleware');
const resolveScheduleAccess = require('../utils/resolveScheduleAccess');
const { ensureCurrentSchedule, zonedParts, TIME_ZONE } = require('../services/mealSchedulingService');

const router = express.Router();

const currentMonthResponse = async (req, res) => {
  try {
    const access = await resolveScheduleAccess(req);
    const schedule = await ensureCurrentSchedule();
    const { year, month } = zonedParts();
    const entries = (schedule.entries || [])
      .filter((entry) => access.subscriber || Number(entry.dayNumber || new Date(entry.date).getUTCDate()) <= 14)
      .map((entry) => ({
        _id: entry._id,
        date: entry.date,
        dateKey: entry.dateKey,
        dayNumber: entry.dayNumber,
        meal: entry.meal,
        category: entry.category,
        mealSnapshot: entry.mealSnapshot,
        assignmentSource: entry.assignmentSource,
        isManuallyModified: entry.isManuallyModified
      }));
    res.json({
      success: true,
      year,
      month,
      timezone: TIME_ZONE,
      entries,
      warnings: schedule.warnings || [],
      access: access.subscriber ? 'full-current-month' : 'first-two-weeks'
    });
  } catch (error) {
    const status = error.message === 'Token is invalid or expired' ? 401 : error.message === 'User not found' ? 401 : 503;
    res.status(status).json({ success: false, message: status === 503 ? 'This month’s meal plan is being prepared. Please try again shortly.' : error.message });
  }
};

router.get('/current', currentMonthResponse);
router.get('/', currentMonthResponse);

router.get('/month/:year/:month', async (req, res) => {
  const current = zonedParts();
  if (Number(req.params.year) !== current.year || Number(req.params.month) !== current.month) {
    return res.status(404).json({ success: false, message: 'Only the current month is available to members.' });
  }
  return currentMonthResponse(req, res);
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
