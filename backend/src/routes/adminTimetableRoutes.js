const express = require('express');
const { body, validationResult } = require('express-validator');
const AnnualMealPlan = require('../models/AnnualMealPlan');
const MonthlySchedule = require('../models/MonthlySchedule');
const ScheduleHistory = require('../models/ScheduleHistory');
const Meal = require('../models/Meal');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  ALGORITHM_VERSION,
  TIME_ZONE,
  generateAnnualPlan,
  prepareMonthlySchedule
} = require('../services/mealSchedulingService');

const router = express.Router();
router.use(protect, authorize('admin'));

const populatedSchedule = (year, month) => MonthlySchedule.findOne({ year: Number(year), month: Number(month) })
  .populate({ path: 'entries.meal', populate: { path: 'category', select: 'name' } })
  .populate('entries.updatedBy', 'name email');

router.get('/years', async (req, res) => {
  const plans = await AnnualMealPlan.find({}).select('year status generationDate algorithmVersion warnings').sort({ year: -1 });
  res.json({ success: true, plans, timezone: TIME_ZONE });
});

router.get('/:year/:month', async (req, res) => {
  try {
    const schedule = await populatedSchedule(req.params.year, req.params.month);
    if (!schedule) return res.status(404).json({ success: false, message: 'Monthly schedule not found' });
    res.json({ success: true, schedule });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get('/:year/:month/history', async (req, res) => {
  const history = await ScheduleHistory.find({ year: Number(req.params.year), month: Number(req.params.month) })
    .populate('changedBy', 'name email')
    .populate('previousMealId', 'title')
    .populate('newMealId', 'title')
    .sort({ timestamp: -1 });
  res.json({ success: true, history });
});

router.post('/generate/:year', async (req, res) => {
  try {
    const plan = await generateAnnualPlan({ year: Number(req.params.year), generatedBy: req.user._id });
    res.status(201).json({ success: true, plan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/prepare/:year/:month', async (req, res) => {
  try {
    const schedule = await prepareMonthlySchedule(Number(req.params.year), Number(req.params.month), req.user._id);
    res.json({ success: true, schedule });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.patch('/:year/:month/:entryId', [
  body('mealId').isMongoId().withMessage('A valid published meal is required'),
  body('reason').optional().isString().trim().isLength({ max: 500 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });

  try {
    const [schedule, meal] = await Promise.all([
      MonthlySchedule.findOne({ year: Number(req.params.year), month: Number(req.params.month) }),
      Meal.findOne({ _id: req.body.mealId, published: true }).populate('category', 'name')
    ]);
    if (!schedule) return res.status(404).json({ success: false, message: 'Monthly schedule not found' });
    if (!meal) return res.status(404).json({ success: false, message: 'Published meal not found' });

    const entry = schedule.entries.id(req.params.entryId);
    if (!entry) return res.status(404).json({ success: false, message: 'Schedule entry not found' });
    const previousMealId = entry.meal;
    entry.meal = meal._id;
    entry.category = meal.category?._id || meal.category || null;
    entry.mealSnapshot = {
      title: meal.title,
      image: meal.image,
      categoryName: meal.category?.name || '',
      description: meal.description,
      estimatedCost: meal.estimatedCost,
      preparationTime: meal.preparationTime,
      difficulty: meal.difficulty,
      isExotic: Boolean(meal.isExotic)
    };
    entry.assignmentSource = 'manual';
    entry.isManuallyModified = true;
    entry.updatedBy = req.user._id;
    entry.updatedAt = new Date();
    const categoryCounts = new Map();
    const mealCounts = new Map();
    const sortedEntries = [...schedule.entries].sort((left, right) => left.dayNumber - right.dayNumber);
    for (let index = 0; index < sortedEntries.length; index += 1) {
      const item = sortedEntries[index];
      const categoryKey = String(item.category || 'uncategorized');
      const mealKey = String(item.meal);
      categoryCounts.set(categoryKey, (categoryCounts.get(categoryKey) || 0) + 1);
      mealCounts.set(mealKey, (mealCounts.get(mealKey) || 0) + 1);
      if (index > 0 && String(sortedEntries[index - 1].meal) === mealKey) {
        categoryCounts.set('__consecutive-repeat__', 1);
      }
    }
    const manualWarnings = [];
    const mostUsedCategory = Math.max(0, ...categoryCounts.entries().filter(([key]) => key !== '__consecutive-repeat__').map(([, count]) => count));
    if (mostUsedCategory / Math.max(schedule.entries.length, 1) > 0.6) manualWarnings.push('Manual changes leave one category on more than 60% of the month.');
    if (categoryCounts.has('__consecutive-repeat__')) manualWarnings.push('Manual changes created two consecutive dates with the same meal.');
    if ([...mealCounts.values()].some((count) => count > Math.max(4, Math.ceil(schedule.entries.length * 0.25)))) {
      manualWarnings.push('Manual changes repeat one meal more than the monthly variety target.');
    }
    schedule.warnings = [
      ...schedule.warnings.filter((warning) => !warning.startsWith('Manual changes')),
      ...manualWarnings
    ];
    await schedule.save();

    await ScheduleHistory.create({
      year: schedule.year,
      month: schedule.month,
      dateKey: entry.dateKey,
      action: 'manual-assignment',
      previousMealId,
      newMealId: meal._id,
      changedBy: req.user._id,
      reason: req.body.reason || ''
    });

    res.json({ success: true, entry });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/publish/:year/:month', async (req, res) => {
  const year = Number(req.params.year);
  const month = Number(req.params.month);
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return res.status(400).json({ success: false, message: 'Invalid year or month' });
  }

  try {
    const schedule = await MonthlySchedule.findOne({ year, month });
    if (!schedule) return res.status(404).json({ success: false, message: 'Monthly schedule not found' });
    const requiredDays = new Date(Date.UTC(year, month, 0)).getUTCDate();
    if (schedule.entries.length !== requiredDays) {
      return res.status(400).json({ success: false, message: 'Schedule must contain an assignment for every day before publishing' });
    }
    schedule.status = 'published';
    schedule.publishedAt = schedule.publishedAt || new Date();
    await schedule.save();
    await ScheduleHistory.create({ year, month, dateKey: `${year}-${String(month).padStart(2, '0')}-01`, action: 'published', changedBy: req.user._id });
    res.json({ success: true, schedule });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/reshuffle/:year', async (req, res) => {
  try {
    const plan = await generateAnnualPlan({ year: Number(req.params.year), generatedBy: req.user._id, force: true });
    await ScheduleHistory.create({
      year: plan.year,
      month: 1,
      dateKey: `${plan.year}-01-01`,
      action: 'reshuffled',
      changedBy: req.user._id,
      reason: req.body.reason || 'Authorized annual reshuffle',
      algorithmVersion: ALGORITHM_VERSION,
      generationSettings: plan.generationSettings
    });
    res.json({ success: true, plan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
