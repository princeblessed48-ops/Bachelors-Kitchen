const mongoose = require('mongoose');

const directionRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    meal: { type: mongoose.Schema.Types.ObjectId, ref: 'Meal', required: true },
    question: { type: String, required: true },
    details: { type: String, default: '' },
    response: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Answered', 'Closed'],
      default: 'Pending'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('DirectionRequest', directionRequestSchema);
