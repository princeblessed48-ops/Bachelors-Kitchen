const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    address: {
      name: String,
      phone: String,
      address: String,
      city: String,
      landmark: String
    },
    distance: { type: Number, default: 0 },
    pricingMethod: { type: String, default: 'distance' },
    baseFee: { type: Number, default: 0 },
    distanceFee: { type: Number, default: 0 },
    expressFee: { type: Number, default: 0 },
    totalDeliveryFee: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'confirmed', 'in-transit', 'delivered'], default: 'pending' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Delivery', deliverySchema);
