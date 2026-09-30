const mongoose = require('mongoose');

const chefSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String, default: '' },
    description: { type: String, default: '' },
    specialty: { type: String, default: '' },
    location: { type: String, default: '' },
    contact: { type: String, default: '' },
    preparationPrice: { type: Number, default: 0 },
    deliveryAvailable: { type: Boolean, default: true },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Chef', chefSchema);
