const express = require('express');
const { body, validationResult } = require('express-validator');
const Meal = require('../models/Meal');
const Category = require('../models/Category');
const { protect, authorize } = require('../middleware/authMiddleware');
const { requireSubscriber } = require('../middleware/subscriptionMiddleware');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const meals = await Meal.find({ published: true }).populate('category').populate('chef');
    res.json({ success: true, meals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id).populate('category').populate('chef');
    if (!meal) {
      return res.status(404).json({ success: false, message: 'Meal not found' });
    }
    res.json({ success: true, meal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', protect, authorize('admin'), [
  body('title').notEmpty(),
  body('description').notEmpty(),
  body('category').notEmpty(),
  body('ingredients').isArray(),
  body('preparationSteps').isArray()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
  }

  try {
    const categoryExists = await Category.findById(req.body.category);
    if (!categoryExists) {
      return res.status(400).json({ success: false, message: 'Invalid category' });
    }

    const meal = await Meal.create({ ...req.body });
    res.status(201).json({ success: true, meal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) {
      return res.status(404).json({ success: false, message: 'Meal not found' });
    }

    Object.assign(meal, req.body);
    await meal.save();
    res.json({ success: true, meal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const meal = await Meal.findByIdAndDelete(req.params.id);
    if (!meal) {
      return res.status(404).json({ success: false, message: 'Meal not found' });
    }
    res.json({ success: true, message: 'Meal deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id/subscriber-details', protect, requireSubscriber, async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id).populate('category').populate('chef');
    if (!meal) {
      return res.status(404).json({ success: false, message: 'Meal not found' });
    }

    res.json({
      success: true,
      meal: {
        _id: meal._id,
        title: meal.title,
        description: meal.description,
        image: meal.image,
        category: meal.category,
        ingredients: meal.ingredients,
        preparationSteps: meal.preparationSteps,
        preparationTime: meal.preparationTime,
        difficulty: meal.difficulty,
        estimatedCost: meal.estimatedCost,
        nutrition: meal.nutrition,
        servings: meal.servings,
        storageInstructions: meal.storageInstructions,
        reheatingInstructions: meal.reheatingInstructions,
        videoUrl: meal.videoUrl,
        chef: meal.chef,
        published: meal.published
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
