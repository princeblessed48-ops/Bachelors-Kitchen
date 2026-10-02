const express = require('express');
const User = require('../models/User');
const Meal = require('../models/Meal');
const Timetable = require('../models/Timetable');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const DirectionRequest = require('../models/DirectionRequest');
const IngredientPrice = require('../models/IngredientPrice');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/dashboard', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeSubscribers = await Subscription.countDocuments({ status: 'active' });
    const expiredSubscribers = await Subscription.countDocuments({ status: 'expired' });
    const totalMeals = await Meal.countDocuments();
    const publishedMeals = await Meal.countDocuments({ published: true });
    const pendingDirectionRequests = await DirectionRequest.countDocuments({ status: 'Pending' });
    const successfulPayments = await Payment.countDocuments({ status: 'Successful' });
    const revenue = await Payment.aggregate([
      { $match: { status: 'Successful' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeSubscribers,
        expiredSubscribers,
        totalMeals,
        publishedMeals,
        pendingDirectionRequests,
        successfulPayments,
        revenue: revenue[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/users', async (req, res) => {
  const users = await User.find().select('-password');
  res.json({ success: true, users });
});

router.get('/meals', async (req, res) => {
  const meals = await Meal.find({}).populate('category');
  res.json({ success: true, meals });
});

router.get('/timetable', async (req, res) => {
  const entries = await Timetable.find({}).populate('meal');
  res.json({ success: true, entries });
});

router.get('/payments', async (req, res) => {
  const payments = await Payment.find({}).populate('user');
  res.json({ success: true, payments });
});

router.get('/ingredient-prices', async (req, res) => {
  const prices = await IngredientPrice.find({ active: true }).sort({ name: 1, effectiveDate: -1 });
  res.json({ success: true, prices });
});

router.post('/ingredient-prices', async (req, res) => {
  try {
    const price = await IngredientPrice.create({
      name: req.body.name,
      unit: req.body.unit,
      quantity: req.body.quantity,
      price: req.body.price,
      location: req.body.location,
      market: req.body.market,
      effectiveDate: req.body.effectiveDate || new Date()
    });
    res.status(201).json({ success: true, price });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.patch('/ingredient-prices/:id', async (req, res) => {
  try {
    const price = await IngredientPrice.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!price) return res.status(404).json({ success: false, message: 'Ingredient price not found' });
    res.json({ success: true, price });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
