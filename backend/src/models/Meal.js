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

const ingredientLineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    unit: { type: String, default: 'portion' },
    estimatedCost: { type: Number, default: 0 }
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
    ingredientLines: [ingredientLineSchema],
    preparationSteps: [{ type: String }],
    preparationTime: { type: String, default: '20 min' },
    cookingTime: { type: String, default: '' },
    totalTime: { type: String, default: '' },
    requiredEquipment: [{ type: String }],
    commonMistakes: [{ type: String }],
    substitutions: [{ type: String }],
    safetyTips: [{ type: String }],
    isExotic: { type: Boolean, default: false },
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
