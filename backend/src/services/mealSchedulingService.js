const AnnualMealPlan = require('../models/AnnualMealPlan');
const MonthlySchedule = require('../models/MonthlySchedule');
const ScheduleHistory = require('../models/ScheduleHistory');
const Meal = require('../models/Meal');
const Timetable = require('../models/Timetable');

const TIME_ZONE = process.env.APP_TIME_ZONE || 'Africa/Lagos';
const ALGORITHM_VERSION = '1.0.0';

const zonedParts = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  return Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, Number(part.value)]));
};

const dateKeyFor = (year, month, day) => `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
const utcDateFor = (year, month, day) => new Date(Date.UTC(year, month - 1, day, 12));
const daysInMonth = (year, month) => new Date(Date.UTC(year, month, 0)).getUTCDate();
const weekdayFor = (year, month, day) => new Date(Date.UTC(year, month - 1, day)).getUTCDay();

const makeRandom = (seed) => {
  let state = (seed >>> 0) || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
};

const snapshotMeal = (meal) => ({
  title: meal.title,
  image: meal.image,
  categoryName: meal.category?.name || '',
  description: meal.description,
  estimatedCost: meal.estimatedCost,
  preparationTime: meal.preparationTime,
  difficulty: meal.difficulty,
  isExotic: Boolean(meal.isExotic)
});

const buildAnnualAssignments = (year, meals, priorEntries = []) => {
  const random = makeRandom(year * 7919 + meals.length * 101);
  const priorByDate = new Map(priorEntries.map((entry) => [entry.dateKey, String(entry.meal?._id || entry.meal)]));
  const counts = new Map();
  const recent = [];
  const warnings = [];
  const monthlyEntries = Array.from({ length: 12 }, () => []);
  const exoticMeals = meals.filter((meal) => meal.isExotic);

  if (exoticMeals.length === 0) warnings.push('No published exotic meals are available; the weekly exotic target cannot be met.');
  if (meals.length < 7) warnings.push('Fewer than seven published meals are available; repetition controls will be relaxed.');

  const chooseMeal = (month, day) => {
    const isExoticDay = weekdayFor(year, month, day) === 6;
    const pool = isExoticDay && exoticMeals.length ? exoticMeals : meals;
    let candidates = pool.filter((meal) => !recent.slice(-7).includes(String(meal._id)));
    if (!candidates.length) candidates = pool.filter((meal) => String(meal._id) !== recent[recent.length - 1]);
    if (!candidates.length) candidates = pool;

    const scored = candidates.map((meal) => {
      const id = String(meal._id);
      const category = String(meal.category?._id || meal.category || 'uncategorized');
      const repeatCount = recent.filter((recentId) => recentId === id).length;
      const samePriorDate = priorByDate.get(dateKeyFor(year - 1, month, day)) === id;
      return {
        meal,
        score: (counts.get(category) || 0) * 5 + repeatCount * 30 + (samePriorDate ? 80 : 0) + random() * 4
      };
    }).sort((left, right) => left.score - right.score);

    return scored[0].meal;
  };

  for (let month = 1; month <= 12; month += 1) {
    for (let day = 1; day <= daysInMonth(year, month); day += 1) {
      const selectedMeal = chooseMeal(month, day);
      const categoryId = selectedMeal.category?._id || selectedMeal.category || null;
      const dateKey = dateKeyFor(year, month, day);
      const entry = {
        date: utcDateFor(year, month, day),
        dateKey,
        dayNumber: day,
        meal: selectedMeal._id,
        category: categoryId,
        assignmentSource: 'automatic',
        isManuallyModified: false,
        mealSnapshot: snapshotMeal(selectedMeal),
        updatedAt: new Date()
      };
      monthlyEntries[month - 1].push(entry);
      counts.set(String(categoryId || 'uncategorized'), (counts.get(String(categoryId || 'uncategorized')) || 0) + 1);
      recent.push(String(selectedMeal._id));
    }
  }

  return { monthlyEntries, warnings };
};

const generateAnnualPlan = async ({ year, generatedBy = null, force = false, status } = {}) => {
  const targetYear = Number(year);
  if (!Number.isInteger(targetYear) || targetYear < 2020 || targetYear > 2200) {
    throw new Error('A valid schedule year is required.');
  }

  const currentYear = zonedParts().year;
  if (force && targetYear <= currentYear) {
    throw new Error('A reshuffle is only allowed for a future year; historical and active schedules are immutable.');
  }

  const existingPlan = await AnnualMealPlan.findOne({ year: targetYear }).populate('monthlySchedules');
  if (existingPlan && !force) return existingPlan;

  if (existingPlan && force) {
    const hasPublishedOrManualSchedule = await MonthlySchedule.exists({
      year: targetYear,
      $or: [{ status: 'published' }, { 'entries.isManuallyModified': true }]
    });
    if (hasPublishedOrManualSchedule) {
      throw new Error('This annual plan contains published or manually edited schedules and cannot be overwritten.');
    }
  }

  const meals = await Meal.find({ published: true }).populate('category', 'name').sort({ _id: 1 });
  if (!meals.length) throw new Error('Publish at least one meal before generating a schedule.');

  const priorYearSchedules = await MonthlySchedule.find({ year: targetYear - 1 }).select('entries.dateKey entries.meal');
  const priorEntries = priorYearSchedules.flatMap((schedule) => schedule.entries);
  const { monthlyEntries, warnings } = buildAnnualAssignments(targetYear, meals, priorEntries);
  const generatedAt = new Date();
  const monthlySchedules = [];

  const { month: currentMonth } = zonedParts();
  for (let month = 1; month <= 12; month += 1) {
    const monthStatus = targetYear < currentYear || (targetYear === currentYear && month < currentMonth)
      ? 'archived'
      : targetYear === currentYear && month === currentMonth ? 'published' : 'ready';
    const query = { year: targetYear, month };
    const update = force ? {
        $set: {
          year: targetYear,
          month,
          status: status || monthStatus,
          entries: monthlyEntries[month - 1],
          generatedAt,
          publishedAt: (status || monthStatus) === 'published' ? generatedAt : null,
          warnings
        }
      } : {
        $setOnInsert: {
          year: targetYear,
          month,
          status: status || monthStatus,
          entries: monthlyEntries[month - 1],
          generatedAt,
          publishedAt: (status || monthStatus) === 'published' ? generatedAt : null,
          warnings
        }
      };
    let schedule;
    try {
      schedule = await MonthlySchedule.findOneAndUpdate(query, update, { upsert: true, new: true, setDefaultsOnInsert: true });
    } catch (error) {
      if (error.code !== 11000) throw error;
      schedule = await MonthlySchedule.findOne(query);
      if (!schedule) throw error;
    }
    monthlySchedules.push(schedule._id);

    if (!existingPlan) {
      await ScheduleHistory.updateOne(
        { year: targetYear, month, action: 'generated' },
        { $setOnInsert: {
          year: targetYear,
          month,
          dateKey: dateKeyFor(targetYear, month, 1),
          action: 'generated',
          changedBy: generatedBy,
          reason: `Generated ${monthlyEntries[month - 1].length} daily assignments.`,
          algorithmVersion: ALGORITHM_VERSION,
          generationSettings: { timezone: TIME_ZONE, exoticMealsPerWeek: 1, rollingWindowDays: 7 }
        } },
        { upsert: true }
      );
    }
  }

  let plan;
  try {
    plan = await AnnualMealPlan.findOneAndUpdate(
      { year: targetYear },
      {
        $set: {
          status: status || (targetYear === currentYear ? 'active' : 'approved'),
          monthlySchedules,
          generationDate: generatedAt,
          algorithmVersion: ALGORITHM_VERSION,
          generationSettings: { timezone: TIME_ZONE, exoticMealsPerWeek: 1, maxMealsInRollingWindow: 2, rollingWindowDays: 7, seed: targetYear * 7919 },
          warnings,
          generatedBy
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch (error) {
    if (error.code !== 11000) throw error;
    plan = await AnnualMealPlan.findOne({ year: targetYear }).populate('monthlySchedules');
    if (!plan) throw error;
  }

  return plan.populate('monthlySchedules');
};

const ensureYearPrepared = async (year, options = {}) => {
  const existing = await AnnualMealPlan.findOne({ year }).populate('monthlySchedules');
  if (existing) return existing;
  return generateAnnualPlan({ year, ...options });
};

const ensureCurrentSchedule = async () => {
  const { year, month } = zonedParts();
  try {
    await ensureYearPrepared(year);
  } catch (error) {
    const legacyEntries = await Timetable.find({ year, month, published: true }).populate({
      path: 'meal',
      select: 'title image category preparationTime difficulty estimatedCost isExotic',
      populate: { path: 'category', select: 'name' }
    }).sort({ date: 1 });
    if (legacyEntries.length) return { year, month, entries: legacyEntries, warnings: [error.message], legacy: true };
    throw error;
  }

  const schedule = await MonthlySchedule.findOne({ year, month, status: { $in: ['ready', 'published'] } })
    .populate({ path: 'entries.meal', select: 'title image category preparationTime difficulty estimatedCost isExotic', populate: { path: 'category', select: 'name' } })
    .populate({ path: 'entries.category', select: 'name' });

  if (!schedule) throw new Error('The current month schedule is being prepared. Please try again shortly.');
  return schedule;
};

const prepareMonthlySchedule = async (year, month, generatedBy = null) => {
  const plan = await ensureYearPrepared(Number(year), { generatedBy });
  const schedule = await MonthlySchedule.findOne({ year: Number(year), month: Number(month) });
  if (!schedule) throw new Error(`Schedule ${year}-${month} is unavailable.`);
  if (!plan.monthlySchedules.some((item) => String(item._id || item) === String(schedule._id))) {
    plan.monthlySchedules.push(schedule._id);
    await plan.save();
  }
  return schedule;
};

const archiveCompletedSchedules = async () => {
  const { year, month } = zonedParts();
  await MonthlySchedule.updateMany(
    { $or: [{ year: { $lt: year } }, { year, month: { $lt: month } }], status: { $ne: 'archived' } },
    { $set: { status: 'archived' } }
  );
  await AnnualMealPlan.updateMany({ year: { $lt: year }, status: { $ne: 'archived' } }, { $set: { status: 'archived' } });
};

const runScheduleMaintenance = async () => {
  const { year, month } = zonedParts();
  const plan = await ensureYearPrepared(year);
  if (month >= 10) {
    const upcomingPlan = await AnnualMealPlan.findOne({ year: year + 1 });
    if (month === 12 && upcomingPlan) {
      try {
        await generateAnnualPlan({ year: year + 1, force: true });
      } catch (error) {
        const warning = `Annual reshuffle retained the existing plan: ${error.message}`;
        if (!upcomingPlan.warnings.includes(warning)) upcomingPlan.warnings.push(warning);
        await upcomingPlan.save();
        console.warn(`Annual reshuffle skipped for ${year + 1}:`, error.message);
      }
    } else if (!upcomingPlan) {
      await ensureYearPrepared(year + 1);
    }
  }
  const currentSchedule = await prepareMonthlySchedule(year, month);
  if (currentSchedule.status !== 'published') {
    currentSchedule.status = 'published';
    currentSchedule.publishedAt = currentSchedule.publishedAt || new Date();
    await currentSchedule.save();
  }
  if (plan.status !== 'active') {
    plan.status = 'active';
    await plan.save();
  }
  await prepareMonthlySchedule(month === 12 ? year + 1 : year, month === 12 ? 1 : month + 1);
  await archiveCompletedSchedules();
};

module.exports = {
  ALGORITHM_VERSION,
  TIME_ZONE,
  zonedParts,
  dateKeyFor,
  daysInMonth,
  snapshotMeal,
  buildAnnualAssignments,
  generateAnnualPlan,
  ensureYearPrepared,
  ensureCurrentSchedule,
  prepareMonthlySchedule,
  archiveCompletedSchedules,
  runScheduleMaintenance
};