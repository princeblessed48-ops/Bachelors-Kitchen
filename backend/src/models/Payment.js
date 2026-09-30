const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'NGN' },
    transactionReference: { type: String, required: true, unique: true },
    provider: { type: String, default: 'paystack' },
    status: { type: String, enum: ['Pending', 'Successful', 'Failed', 'Refunded'], default: 'Pending' },
    paymentType: { type: String, default: 'subscription' },
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
