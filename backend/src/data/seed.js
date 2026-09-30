const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Category = require('../models/Category');
const Meal = require('../models/Meal');
const Chef = require('../models/Chef');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Subscription = require('../models/Subscription');
const Timetable = require('../models/Timetable');
const DirectionRequest = require('../models/DirectionRequest');

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bachelor-kitchen');

    await User.deleteMany({});
    await Category.deleteMany({});
    await Meal.deleteMany({});
    await Chef.deleteMany({});
    await SubscriptionPlan.deleteMany({});
    await Subscription.deleteMany({});
    await Timetable.deleteMany({});
    await DirectionRequest.deleteMany({});

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@bachelorkitchen.com',
      password: 'admin123',
      role: 'admin',
      phone: '08000000000'
    });

    const freeUser = await User.create({
      name: 'Free User',
      email: 'free@bachelorkitchen.com',
      password: 'free123',
      role: 'user',
      phone: '08011111111'
    });

    const subscriberUser = await User.create({
      name: 'Subscriber User',
      email: 'subscriber@bachelorkitchen.com',
      password: 'subscriber123',
      role: 'user',
      phone: '08022222222'
    });

    const categories = await Category.insertMany([
      { name: 'High Protein', description: 'Protein-driven meal choices' },
      { name: 'Energy / Sports', description: 'Meals for energy and recovery' },
      { name: 'High Carbohydrate', description: 'Carb-loaded meals' },
      { name: 'Weight Gain', description: 'Higher-calorie options' },
      { name: 'Balanced Meals', description: 'Balanced everyday meals' },
      { name: 'Budget Meals', description: 'Affordable staples' },
      { name: 'Quick Meals', description: 'Fast to prepare' },
      { name: 'Beginner Friendly', description: 'Simple meals' }
    ]);

    const chef1 = await Chef.create({
      name: 'Chef Tolu',
      specialty: 'African Fusion',
      location: 'Lagos',
      contact: '08033333333',
      preparationPrice: 3500,
      description: 'Specializes in quick, nutritious meals.',
      deliveryAvailable: true,
      active: true
    });

    const chef2 = await Chef.create({
      name: 'Chef Musa',
      specialty: 'Fitness Meals',
      location: 'Abuja',
      contact: '08044444444',
      preparationPrice: 4200,
      description: 'Builds protein-rich and sports meals.',
      deliveryAvailable: true,
      active: true
    });

    const planMonthly = await SubscriptionPlan.create({
      name: 'Monthly Pro',
      price: 5000,
      duration: '1 month',
      description: 'Access all premium recipes and chef content',
      features: ['Nutrition info', 'Video guides', 'Chef details', 'Delivery calculator'],
      active: true
    });

    const planAnnual = await SubscriptionPlan.create({
      name: 'Annual Elite',
      price: 48000,
      duration: '12 months',
      description: 'Best value for serious meal planning',
      features: ['Everything in Monthly Pro', 'Priority support', 'Annual savings'],
      active: true
    });

    const meals = [
      {
        title: 'Egg Sauce + Bread',
        description: 'A classic, quick meal full of protein and comfort.',
        image: 'https://images.unsplash.com/photo-1547592180-85f173990554',
        category: categories[0]._id,
        ingredients: ['Eggs', 'Tomatoes', 'Onions', 'Pepper', 'Bread'],
        preparationSteps: ['Chop onions and tomatoes.', 'Sauté onions and pepper.', 'Add tomatoes and cook until saucy.', 'Beat eggs and stir in.', 'Serve with bread.'],
        preparationTime: '15 min',
        difficulty: 'Easy',
        estimatedCost: 1200,
        nutrition: { calories: 420, protein: 23, carbohydrates: 34, fat: 18, fibre: 5 },
        servings: 2,
        storageInstructions: 'Store in an airtight container and refrigerate for up to 2 days.',
        reheatingInstructions: 'Reheat in a pan for 3-5 minutes.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        chef: chef1._id,
        published: true
      },
      {
        title: 'Jollof Rice + Chicken',
        description: 'A bold, family-favourite meal with rich flavor.',
        image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d',
        category: categories[2]._id,
        ingredients: ['Rice', 'Chicken', 'Tomato paste', 'Pepper', 'Onions', 'Spices'],
        preparationSteps: ['Season chicken and fry lightly.', 'Blend pepper and tomatoes.', 'Cook sauce base with onions.', 'Add rice and stock.', 'Steam until tender and serve with chicken.'],
        preparationTime: '45 min',
        difficulty: 'Medium',
        estimatedCost: 2500,
        nutrition: { calories: 680, protein: 30, carbohydrates: 80, fat: 24, fibre: 6 },
        servings: 4,
        storageInstructions: 'Cool completely before refrigerating for up to 3 days.',
        reheatingInstructions: 'Reheat in a microwave or pan with a splash of water.',
        videoUrl: 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
        chef: chef2._id,
        published: true
      },
      {
        title: 'Beans + Plantain',
        description: 'Affordable, hearty, and satisfying.',
        image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38',
        category: categories[5]._id,
        ingredients: ['Beans', 'Plantain', 'Palm oil', 'Onions', 'Pepper'],
        preparationSteps: ['Boil beans until soft.', 'Slice plantain and fry.', 'Cook onions and pepper in oil.', 'Combine beans with sauce.', 'Serve with plantain.'],
        preparationTime: '35 min',
        difficulty: 'Easy',
        estimatedCost: 1500,
        nutrition: { calories: 520, protein: 18, carbohydrates: 65, fat: 20, fibre: 11 },
        servings: 3,
        storageInstructions: 'Keep in a sealed container in the fridge for 2-3 days.',
        reheatingInstructions: 'Warm gently on the stove to retain texture.',
        videoUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
        chef: chef1._id,
        published: true
      },
      {
        title: 'Tuna Pasta',
        description: 'A quick, filling choice for busy days.',
        image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9',
        category: categories[6]._id,
        ingredients: ['Pasta', 'Tuna', 'Garlic', 'Tomatoes', 'Olive oil'],
        preparationSteps: ['Cook pasta until tender.', 'Sauté garlic and tomatoes.', 'Add tuna and seasoning.', 'Toss with pasta.', 'Serve warm.'],
        preparationTime: '20 min',
        difficulty: 'Easy',
        estimatedCost: 2000,
        nutrition: { calories: 560, protein: 27, carbohydrates: 62, fat: 15, fibre: 4 },
        servings: 2,
        storageInstructions: 'Refrigerate in a covered bowl for up to 2 days.',
        reheatingInstructions: 'Warm in a pan with a splash of water until hot.',
        videoUrl: 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
        chef: chef1._id,
        published: true
      },
      {
        title: 'Chicken Stir Fry',
        description: 'A lean, protein-rich meal with lots of vegetables.',
        image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d',
        category: categories[0]._id,
        ingredients: ['Chicken breast', 'Broccoli', 'Carrots', 'Onion', 'Soy sauce'],
        preparationSteps: ['Slice chicken and season.', 'Stir fry in hot pan.', 'Add vegetables.', 'Toss with soy sauce.', 'Serve immediately.'],
        preparationTime: '18 min',
        difficulty: 'Medium',
        estimatedCost: 2600,
        nutrition: { calories: 490, protein: 34, carbohydrates: 29, fat: 21, fibre: 7 },
        servings: 2,
        storageInstructions: 'Store in an airtight container for up to 3 days.',
        reheatingInstructions: 'Reheat in a skillet for 4-6 minutes.',
        videoUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
        chef: chef2._id,
        published: true
      },
      {
        title: 'Oatmeal + Peanut Butter',
        description: 'A wholesome breakfast for energy and recovery.',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
        category: categories[2]._id,
        ingredients: ['Oats', 'Peanut butter', 'Banana', 'Milk', 'Cinnamon'],
        preparationSteps: ['Cook oats in milk.', 'Stir in peanut butter.', 'Top with banana and cinnamon.', 'Serve warm.'],
        preparationTime: '10 min',
        difficulty: 'Easy',
        estimatedCost: 900,
        nutrition: { calories: 430, protein: 16, carbohydrates: 48, fat: 18, fibre: 8 },
        servings: 1,
        storageInstructions: 'Best eaten fresh. Refrigerate leftover oats for up to 1 day.',
        reheatingInstructions: 'Warm briefly in the microwave before eating.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        chef: chef2._id,
        published: true
      },
      {
        title: 'Rice + Scrambled Eggs',
        description: 'Simple, cheap, and highly filling.',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
        category: categories[5]._id,
        ingredients: ['Rice', 'Eggs', 'Onion', 'Pepper', 'Oil'],
        preparationSteps: ['Warm rice.', 'Scramble eggs with onion and pepper.', 'Combine with rice.', 'Season to taste.'],
        preparationTime: '12 min',
        difficulty: 'Easy',
        estimatedCost: 1100,
        nutrition: { calories: 450, protein: 20, carbohydrates: 52, fat: 15, fibre: 3 },
        servings: 2,
        storageInstructions: 'Refrigerate leftovers and consume within 2 days.',
        reheatingInstructions: 'Reheat in a microwave or pan for a few minutes.',
        videoUrl: 'https://www.youtube.com/watch?v=ys_z_fHErME',
        chef: chef1._id,
        published: true
      },
      {
        title: 'Yam + Egg Sauce',
        description: 'A satisfying staple with plenty of energy.',
        image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd',
        category: categories[3]._id,
        ingredients: ['Yam', 'Eggs', 'Tomato', 'Pepper', 'Onion'],
        preparationSteps: ['Boil or fry yam cubes.', 'Prepare egg sauce.', 'Combine and serve.'],
        preparationTime: '25 min',
        difficulty: 'Medium',
        estimatedCost: 1600,
        nutrition: { calories: 560, protein: 17, carbohydrates: 72, fat: 20, fibre: 5 },
        servings: 2,
        storageInstructions: 'Store sauce separately for best texture.',
        reheatingInstructions: 'Warm on the stove and adjust seasoning.',
        videoUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
        chef: chef1._id,
        published: true
      },
      {
        title: 'Chicken Fried Rice',
        description: 'A quick, satisfying meal for busy evenings.',
        image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19',
        category: categories[6]._id,
        ingredients: ['Rice', 'Chicken', 'Vegetables', 'Soy sauce', 'Garlic'],
        preparationSteps: ['Cook rice and cool slightly.', 'Season and sauté chicken.', 'Add vegetables and rice.', 'Toss until well mixed.'],
        preparationTime: '22 min',
        difficulty: 'Medium',
        estimatedCost: 2200,
        nutrition: { calories: 610, protein: 32, carbohydrates: 73, fat: 22, fibre: 4 },
        servings: 3,
        storageInstructions: 'Keep refrigerated for up to 3 days.',
        reheatingInstructions: 'Warm in a skillet until piping hot.',
        videoUrl: 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
        chef: chef2._id,
        published: true
      },
      {
        title: 'Peanut Butter Banana Oats',
        description: 'A nutrient-dense meal for pre or post-workout energy.',
        image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061',
        category: categories[1]._id,
        ingredients: ['Oats', 'Banana', 'Peanut butter', 'Milk', 'Honey'],
        preparationSteps: ['Cook oats in milk.', 'Mix in peanut butter and banana.', 'Serve warm with honey.'],
        preparationTime: '10 min',
        difficulty: 'Easy',
        estimatedCost: 950,
        nutrition: { calories: 390, protein: 15, carbohydrates: 42, fat: 12, fibre: 7 },
        servings: 1,
        storageInstructions: 'Best fresh; refrigerate if needed for 1 day.',
        reheatingInstructions: 'Warm gently in the microwave.',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        chef: chef2._id,
        published: true
      }
    ];

    await Meal.insertMany(meals);

    const mealDoc = await Meal.findOne({ title: 'Egg Sauce + Bread' });
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    await Timetable.insertMany([
      { date: new Date('2026-09-01'), meal: mealDoc._id, month: 9, year: 2026, published: true },
      { date: new Date('2026-09-02'), meal: mealDoc._id, month: 9, year: 2026, published: true },
      { date: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1), meal: mealDoc._id, month: nextMonth.getMonth() + 1, year: nextMonth.getFullYear(), published: true }
    ]);

    console.log('Seed data loaded');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
