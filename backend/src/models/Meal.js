const mongoose = require('mongoose');

const nutritionSchema = new mongoose.Schema(
  {
    calories: Number,
    protein: Number,
    carbohydrates: Number,
    fat: Number,
    fibre: Number,
    sugar: Number,
    sodium: Number
  },
  { _id: false }
);

const mealSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    image: { type: String, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    ingredients: [{ type: String }],
    preparationSteps: [{ type: String }],
    preparationTime: { type: String, default: '20 min' },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    estimatedCost: { type: Number, default: 0 },
    nutrition: { type: nutritionSchema, default: {} },
    servings: { type: Number, default: 2 },
    storageInstructions: { type: String, default: '' },
    reheatingInstructions: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    chef: { type: mongoose.Schema.Types.ObjectId, ref: 'Chef', default: null },
    published: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Meal', mealSchema);
