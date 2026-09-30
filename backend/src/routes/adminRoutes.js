const express = require('express');
const User = require('../models/User');
const Meal = require('../models/Meal');
const Timetable = require('../models/Timetable');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const DirectionRequest = require('../models/DirectionRequest');
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

module.exports = router;
