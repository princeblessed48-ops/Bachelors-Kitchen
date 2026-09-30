const express = require('express');
const { body, validationResult } = require('express-validator');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/initialize', protect, [
  body('planId').notEmpty().withMessage('Plan ID is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }

  try {
    const plan = await SubscriptionPlan.findById(req.body.planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Subscription plan not found' });
    }

    const ref = `BK-${Date.now()}-${Math.round(Math.random() * 1000)}`;
    const payment = await Payment.create({
      user: req.user._id,
      amount: plan.price,
      currency: 'NGN',
      transactionReference: ref,
      provider: 'paystack',
      status: 'Pending',
      paymentType: 'subscription',
      metadata: { planId: plan._id }
    });

    res.status(201).json({ success: true, payment, reference: ref, redirectUrl: `/payment/verify/${ref}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/verify/:reference', protect, async (req, res) => {
  try {
    const payment = await Payment.findOne({ transactionReference: req.params.reference, user: req.user._id });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    payment.status = 'Successful';
    await payment.save();

    const plan = await SubscriptionPlan.findById(payment.metadata.planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const existingSubscription = await Subscription.findOne({ user: req.user._id, status: 'active' });
    if (existingSubscription) {
      existingSubscription.status = 'expired';
      await existingSubscription.save();
    }

    const subscription = await Subscription.findOneAndUpdate(
      { user: req.user._id, plan: plan._id },
      { user: req.user._id, plan: plan._id, startDate: new Date(), endDate, status: 'active', payment: payment._id },
      { upsert: true, new: true }
    );

    res.json({ success: true, subscription, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/', protect, async (req, res) => {
  const payments = await Payment.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, payments });
});

module.exports = router;
