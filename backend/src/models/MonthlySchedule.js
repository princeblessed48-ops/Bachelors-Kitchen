const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    dateKey: { type: String, required: true },
    dayNumber: { type: Number, required: true, min: 1, max: 31 },
    meal: { type: mongoose.Schema.Types.ObjectId, ref: 'Meal', required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    assignmentSource: { type: String, enum: ['automatic', 'manual'], default: 'automatic' },
    isManuallyModified: { type: Boolean, default: false },
    mealSnapshot: {
      title: String,
      image: String,
      categoryName: String,
      description: String,
      estimatedCost: Number,
      preparationTime: String,
      difficulty: String,
      isExotic: Boolean
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    updatedAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const monthlyScheduleSchema = new mongoose.Schema(
  {
    year: { type: Number, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    status: { type: String, enum: ['draft', 'ready', 'published', 'archived'], default: 'ready' },
    entries: { type: [entrySchema], default: [] },
    generatedAt: { type: Date, default: Date.now },
    publishedAt: { type: Date, default: null },
    warnings: [{ type: String }]
  },
  { timestamps: true }
);

monthlyScheduleSchema.index({ year: 1, month: 1 }, { unique: true });
monthlyScheduleSchema.index({ 'entries.dateKey': 1 });
monthlyScheduleSchema.path('entries').validate((entries) => {
  const dateKeys = entries.map((entry) => entry.dateKey);
  return dateKeys.length === new Set(dateKeys).size;
}, 'A monthly schedule cannot contain duplicate dates.');

module.exports = mongoose.model('MonthlySchedule', monthlyScheduleSchema);
