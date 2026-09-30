const express = require('express');
const { body, validationResult } = require('express-validator');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/plans', async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({ active: true });
    res.json({ success: true, plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/my', protect, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.user._id }).populate('plan');
    res.json({ success: true, subscriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', protect, [
  body('planId').notEmpty().withMessage('Plan ID is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }

  try {
    const plan = await SubscriptionPlan.findById(req.body.planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 30);

    const subscription = await Subscription.create({
      user: req.user._id,
      plan: plan._id,
      startDate,
      endDate,
      status: 'active',
      autoRenew: true
    });

    res.status(201).json({ success: true, subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/billing', protect, async (req, res) => {
  try {
    const paymentHistory = await Payment.find({ user: req.user._id }).sort({ createdAt: -1 });
    const subscription = await Subscription.findOne({ user: req.user._id, status: 'active' }).populate('plan');

    res.json({ success: true, subscription, paymentHistory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const subscriptions = await Subscription.find({}).populate('user').populate('plan');
    res.json({ success: true, subscriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
