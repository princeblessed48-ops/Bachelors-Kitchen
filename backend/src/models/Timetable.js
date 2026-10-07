const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    mealPeriod: { type: String, enum: ['morning', 'evening'], default: 'morning' },
    meal: { type: mongoose.Schema.Types.ObjectId, ref: 'Meal', required: true },
    video: { type: mongoose.Schema.Types.ObjectId, ref: 'MealVideo', default: null },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    published: { type: Boolean, default: false },
    assignmentSource: { type: String, enum: ['automatic', 'manual'], default: 'automatic' },
    isManuallyModified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

timetableSchema.index({ date: 1, mealPeriod: 1 }, { unique: true });

module.exports = mongoose.model('Timetable', timetableSchema);
