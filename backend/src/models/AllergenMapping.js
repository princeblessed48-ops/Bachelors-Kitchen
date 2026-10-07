const mongoose = require('mongoose');

const allergenMappingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    aliases: [{ type: String, default: [] }],
    category: { type: String, default: 'general' },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AllergenMapping', allergenMappingSchema);
