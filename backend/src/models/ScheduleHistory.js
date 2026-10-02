const mongoose = require('mongoose');

const scheduleHistorySchema = new mongoose.Schema(
  {
    year: { type: Number, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    dateKey: { type: String, required: true },
    action: { type: String, enum: ['generated', 'manual-assignment', 'published', 'archived', 'reshuffled'], required: true },
    previousMealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meal', default: null },
    newMealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meal', default: null },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reason: { type: String, default: '' },
    algorithmVersion: { type: String, default: '' },
    generationSettings: { type: mongoose.Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: false }
);

scheduleHistorySchema.index({ year: 1, month: 1, timestamp: -1 });
scheduleHistorySchema.index(
  { year: 1, month: 1, dateKey: 1, action: 1 },
  { unique: true, partialFilterExpression: { action: 'generated' } }
);

module.exports = mongoose.model('ScheduleHistory', scheduleHistorySchema);
