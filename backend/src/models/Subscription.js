const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['active', 'expired', 'cancelled', 'pending'], default: 'pending' },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', default: null },
    autoRenew: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
