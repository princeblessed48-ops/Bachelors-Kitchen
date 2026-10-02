const mongoose = require('mongoose');

const ingredientPriceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    unit: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    location: { type: String, default: 'Nigeria' },
    market: { type: String, default: '' },
    effectiveDate: { type: Date, default: Date.now },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

ingredientPriceSchema.index({ name: 1, location: 1, effectiveDate: -1 });

module.exports = mongoose.model('IngredientPrice', ingredientPriceSchema);
