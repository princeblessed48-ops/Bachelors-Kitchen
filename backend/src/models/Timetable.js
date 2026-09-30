const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    meal: { type: mongoose.Schema.Types.ObjectId, ref: 'Meal', required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    published: { type: Boolean, default: false }
  },
  { timestamps: true }
);

timetableSchema.index({ date: 1 }, { unique: true });

module.exports = mongoose.model('Timetable', timetableSchema);
