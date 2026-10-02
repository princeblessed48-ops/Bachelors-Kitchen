const mongoose = require('mongoose');

const annualMealPlanSchema = new mongoose.Schema(
  {
    year: { type: Number, required: true, unique: true },
    status: { type: String, enum: ['draft', 'approved', 'active', 'archived'], default: 'draft' },
    monthlySchedules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MonthlySchedule' }],
    generationDate: { type: Date, default: Date.now },
    algorithmVersion: { type: String, default: '1.0.0' },
    generationSettings: {
      timezone: { type: String, default: 'Africa/Lagos' },
      exoticMealsPerWeek: { type: Number, default: 1 },
      maxMealsInRollingWindow: { type: Number, default: 2 },
      rollingWindowDays: { type: Number, default: 7 },
      seed: { type: Number, default: 0 }
    },
    warnings: [{ type: String }],
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AnnualMealPlan', annualMealPlanSchema);
