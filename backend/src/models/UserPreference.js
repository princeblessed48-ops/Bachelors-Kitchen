const mongoose = require('mongoose');

const userPreferenceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    preferredCategory: { type: String, default: 'High Protein' },
    allergies: [{ type: String, default: [] }],
    customAllergies: [{ type: String, default: [] }],
    lastPreferenceChange: { type: Date, default: null },
    nextAllowedPreferenceChange: { type: Date, default: null },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserPreference', userPreferenceSchema);
