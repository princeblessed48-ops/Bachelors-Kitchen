const mongoose = require('mongoose');

const mealVideoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true },
    description: { type: String, default: '' },
    mealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meal', default: null },
    date: { type: Date, default: null },
    mealPeriod: { type: String, enum: ['morning', 'evening'], default: 'morning' },
    displayDate: { type: Date, default: null },
    status: { type: String, enum: ['draft', 'scheduled', 'published'], default: 'draft' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    isFeatured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

mealVideoSchema.index({ date: 1, mealPeriod: 1 });
mealVideoSchema.index({ mealId: 1, displayDate: 1 });

module.exports = mongoose.model('MealVideo', mealVideoSchema);
