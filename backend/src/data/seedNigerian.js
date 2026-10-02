const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Category = require('../models/Category');
const Meal = require('../models/Meal');
const Chef = require('../models/Chef');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Subscription = require('../models/Subscription');
const Timetable = require('../models/Timetable');
const Payment = require('../models/Payment');
const IngredientPrice = require('../models/IngredientPrice');

dotenv.config();

const photos = {
  rice: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/67/Nigerian_jollof_rice.jpg/250px-Nigerian_jollof_rice.jpg',
  beans: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/ba/Beans_and_plantain_%28African_good%29.jpg/250px-Beans_and_plantain_%28African_good%29.jpg',
  egg: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ea/Nigerian_dish_Yam_and_Egg_Sauce.jpg/330px-Nigerian_dish_Yam_and_Egg_Sauce.jpg',
  akara: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2c/Kosai%28Akara%29.jpg/250px-Kosai%28Akara%29.jpg',
  moiMoi: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/24/Moin_Moin.jpg/330px-Moin_Moin.jpg',
  stew: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/49/Ofada_Stew_%28Ayamase_stew%29.jpg/120px-Ofada_Stew_%28Ayamase_stew%29.jpg',
  friedRice: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/29/Fried_rice_and_chicken_garnished_with_sweet_corn%2C_carrot_and_green_peas.jpg/250px-Fried_rice_and_chicken_garnished_with_sweet_corn%2C_carrot_and_green_peas.jpg',
  spaghetti: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3f/Jollof_spaghetti_In_Northern_Nigeria.jpg/250px-Jollof_spaghetti_In_Northern_Nigeria.jpg',
  yam: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1b/Yam_porridge_or_%C3%80s%C3%A1r%C3%B3.jpg/250px-Yam_porridge_or_%C3%80s%C3%A1r%C3%B3.jpg',
  pepperSoup: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c9/Nigerian_prepared_Pepper-Soup.jpg/250px-Nigerian_prepared_Pepper-Soup.jpg'
};

const recipeRows = [
  ['Jollof Rice + Chicken', 'Balanced Meals', 5200, 50, ['parboiled rice', 'chicken', 'tomatoes', 'red pepper', 'onion', 'tomato paste', 'thyme'], ['Rinse rice until water runs mostly clear. Blend tomatoes and pepper roughly.', 'Season chicken with salt and thyme; simmer until cooked through and reserve the stock.', 'Fry onion and tomato paste in a little oil, then add blended pepper and cook 10-12 minutes.', 'Stir in rice, measured stock and enough water to just cover. Taste and adjust seasoning.', 'Cover and cook on low for 25-30 minutes, checking once near the end to prevent sticking.', 'Fold rice gently, warm chicken on top, rest covered for 5 minutes and serve.']],
  ['Beans + Fried Plantain', 'Budget Meals', 3900, 55, ['brown beans', 'ripe plantain', 'onion', 'palm oil', 'fresh pepper'], ['Pick through, rinse and boil beans until tender, adding hot water when needed.', 'Slice plantain evenly and fry in batches over medium heat until golden on both sides.', 'Warm palm oil gently; cook chopped onion and pepper for 3 minutes.', 'Stir pepper oil into the soft beans, season lightly and simmer for 5 minutes.', 'Serve beans with fried plantain while hot.']],
  ['Egg Sauce + Bread', 'High Protein', 3600, 20, ['eggs', 'tomatoes', 'onion', 'fresh pepper', 'vegetable oil', 'bread'], ['Wash produce. Dice tomatoes and onion; chop pepper finely.', 'Crack eggs into a clean bowl, add a pinch of salt and whisk just to combine.', 'Warm pan over medium heat. Add oil and cook onion for 1-2 minutes until softened.', 'Add tomatoes and pepper; cook for 6-8 minutes, stirring until the mixture thickens.', 'Taste and season. Pour in eggs, leave still briefly, then fold gently until set but moist.', 'Serve immediately with bread, yam or potatoes.']],
  ['White Rice + Tomato Stew', 'Everyday Meals', 4300, 45, ['rice', 'tomatoes', 'red pepper', 'onion', 'tomato paste', 'vegetable oil'], ['Rinse rice and cook in salted boiling water until tender; drain and cover.', 'Blend tomatoes and pepper coarsely and slice onion.', 'Soften onion in oil, stir in tomato paste and fry for one minute.', 'Add blended vegetables and cook uncovered for 12-15 minutes, stirring regularly.', 'Season carefully and add a splash of water if the stew becomes too thick.', 'Serve stew over rice with egg, fish or chicken if available.']],
  ['Yam + Egg Sauce', 'Energy / Sports', 4200, 35, ['yam', 'eggs', 'tomatoes', 'onion', 'fresh pepper', 'vegetable oil'], ['Peel yam carefully, cut into even chunks and rinse well.', 'Boil in lightly salted water for 15-20 minutes until a fork passes through easily.', 'Dice tomatoes and onion, chop pepper, and beat eggs lightly.', 'Cook onion in warm oil for a minute, add tomato and pepper, and simmer until reduced.', 'Season, pour in eggs and fold slowly once they begin to set.', 'Cook until egg is fully set but moist; serve beside hot yam.']],
  ['Akara + Bread', 'Breakfast', 3200, 40, ['peeled beans', 'onion', 'fresh pepper', 'salt', 'vegetable oil', 'bread'], ['Rinse peeled beans and soak briefly if dry.', 'Blend with only enough water to form a thick smooth paste.', 'Beat paste with a spoon for 2-3 minutes, then fold in chopped onion and pepper.', 'Heat oil over medium heat; test with a small dot of batter. It should bubble, not smoke.', 'Fry small spoonfuls in batches, turning until golden and cooked through.', 'Drain and serve warm with bread.']],
  ['Moi Moi + Boiled Eggs', 'High Protein', 4400, 70, ['peeled beans', 'eggs', 'red pepper', 'onion', 'vegetable oil', 'seasoning'], ['Blend rinsed beans with pepper and onion into a smooth batter.', 'Boil eggs until firm, cool, peel and halve.', 'Stir oil and seasoning into batter and taste for salt.', 'Pour into heat-safe covered cups, leaving space for expansion; add egg pieces.', 'Stand cups in a pot of hot water halfway up their sides and cover.', 'Steam gently for 45-55 minutes; test the centre with a clean skewer before serving.']],
  ['Ewa Riro', 'Budget Meals', 3100, 60, ['brown beans', 'onion', 'tomatoes', 'fresh pepper', 'palm oil'], ['Rinse beans and boil with half the onion until very soft.', 'Blend tomato and pepper coarsely and warm palm oil in a second pot.', 'Soften remaining onion in the oil, then add the pepper blend.', 'Cook pepper base for 8-10 minutes, adding bean water if it thickens too much.', 'Add beans and some cooking liquid; mash a few spoonfuls to thicken naturally.', 'Season and simmer for 8 minutes. Serve with bread, garri or yam.']],
  ['Nigerian Fried Rice + Chicken', 'Balanced Meals', 5600, 45, ['rice', 'chicken', 'carrot', 'green beans', 'sweet corn', 'curry powder'], ['Rinse and parboil rice for 5 minutes; drain and rinse again.', 'Season chicken and simmer until fully cooked, reserving the stock.', 'Dice carrot and green beans into small even pieces.', 'Stir-fry vegetables for 2-3 minutes in a wide pan.', 'Add rice in batches with a little stock and curry; toss and cover on low heat.', 'Cook until tender, adjust seasoning and serve with chicken.']],
  ['Nigerian-Style Noodles + Eggs', 'Quick Meals', 2800, 15, ['noodles', 'eggs', 'carrot', 'spring onion', 'fresh pepper'], ['Boil noodles for 2 minutes, then drain most of the water.', 'Slice carrot, spring onion and pepper thinly.', 'Scramble eggs gently in a warm pan until just set; transfer to a plate.', 'Stir-fry carrot and pepper in the same pan for one minute.', 'Return noodles and egg; add seasoning gradually and toss until hot.', 'Fold in spring onion and serve immediately.']],
  ['Ofada Rice + Ayamase Sauce', 'Balanced Meals', 6500, 60, ['Ofada rice', 'green bell pepper', 'scotch bonnet', 'onion', 'palm oil', 'assorted meat'], ['Rinse Ofada rice several times and cook in fresh water until tender; drain.', 'Blend peppers and half the onion coarsely without adding much water.', 'Warm palm oil gently; let it cool if it begins smoking.', 'Add sliced onion and pepper blend, then simmer uncovered for 15-20 minutes.', 'Add cooked meat if available, season carefully and simmer until thick.', 'Serve a modest rice portion with sauce; cool and refrigerate leftovers promptly.']],
  ['Spaghetti Jollof', 'Quick Meals', 3900, 30, ['spaghetti', 'tomatoes', 'red pepper', 'onion', 'tomato paste', 'vegetable oil'], ['Blend tomatoes and pepper roughly and break spaghetti to fit the pot if needed.', 'Fry onion and tomato paste in a little oil for one minute.', 'Add pepper blend and cook 8-10 minutes until reduced and no longer raw-smelling.', 'Add water to just cover the spaghetti; season and bring to a boil.', 'Add spaghetti and stir often to separate strands and prevent sticking.', 'Lower heat and cook until tender and most liquid is absorbed.']],
  ['Potato Porridge', 'Energy / Sports', 3600, 40, ['potatoes', 'tomatoes', 'red pepper', 'onion', 'palm oil', 'ugu leaves'], ['Peel potatoes, cut into equal cubes and rinse. Chop onion and wash greens.', 'Blend tomato and pepper; add potatoes to a pot with water halfway up the pieces.', 'Add onion, pepper blend, a little palm oil and seasoning; cover and simmer.', 'Cook 20-25 minutes, stirring carefully so the potatoes do not stick.', 'Mash a few tender pieces against the pot to thicken the sauce.', 'Fold in sliced greens and simmer uncovered for 2 minutes.']],
  ['Boiled Yam + Garden Egg Sauce', 'Everyday Meals', 4100, 35, ['yam', 'garden eggs', 'onion', 'fresh pepper', 'palm oil'], ['Peel and cut yam into chunks, rinse, then boil until tender.', 'Boil garden eggs until soft, cool slightly and mash coarsely.', 'Warm palm oil gently and soften chopped onion.', 'Add mashed garden eggs and pepper; loosen with a spoon of water if needed.', 'Season and simmer for 5 minutes, stirring to keep the base from catching.', 'Drain yam and serve with the hot sauce.']],
  ['Beans + Garri', 'Budget Meals', 2600, 55, ['brown beans', 'garri', 'onion', 'fresh pepper', 'palm oil'], ['Rinse beans and boil in plenty of water until soft.', 'Season lightly and retain a little cooking liquid so beans stay moist.', 'Mix garri with clean drinking water and allow to soften for 3-5 minutes.', 'Warm palm oil gently and cook chopped onion and pepper for 2-3 minutes.', 'Serve beans with pepper oil and softened garri.', 'Refrigerate cooked leftovers promptly.']],
  ['Chicken Pepper Soup', 'High Protein', 5800, 50, ['chicken pieces', 'onion', 'pepper soup spice', 'fresh pepper', 'scent leaf'], ['Rinse chicken and place in a pot with sliced onion.', 'Add seasoning and pepper-soup spice with water just covering the chicken.', 'Bring to a boil, then simmer covered until chicken is completely cooked and tender.', 'Taste broth and add pepper gradually to control heat.', 'Add chopped scent leaf and simmer uncovered for 2 minutes.', 'Serve hot; check the thickest chicken piece is fully cooked.']],
  ['Rice + Scrambled Eggs', 'Quick Meals', 2900, 15, ['cooked rice', 'eggs', 'onion', 'fresh pepper', 'vegetable oil'], ['Break up cold cooked rice with a fork to remove clumps.', 'Whisk eggs just to combine and season lightly.', 'Soften onion and pepper in warm oil for 1-2 minutes.', 'Pour in eggs, stir slowly until softly set, then add the rice.', 'Toss over medium heat until steaming hot throughout.', 'Serve immediately and refrigerate leftover rice quickly.']],
  ['Oats + Peanut Butter + Banana', 'Energy / Sports', 2500, 10, ['oats', 'banana', 'peanut butter', 'milk or water', 'groundnuts'], ['Add oats and milk or water to a small pot and bring to a gentle simmer.', 'Cook for 4-6 minutes, stirring to prevent the bottom catching.', 'Slice banana and crush groundnuts if using.', 'Remove oats from heat and swirl in peanut butter.', 'Top with banana and groundnuts and serve warm.']],
  ['Chicken and Vegetable Stir-fry', 'High Protein', 5300, 25, ['chicken', 'carrot', 'cabbage', 'onion', 'fresh pepper', 'soy sauce (optional)'], ['Slice chicken into even strips and season lightly.', 'Shred cabbage, slice carrot thinly and cut onion into wedges.', 'Heat a wide pan over medium-high heat with a little oil.', 'Cook chicken in a single layer until browned and fully cooked, turning as needed.', 'Add onion and carrot for 2 minutes, then cabbage; toss until just softened.', 'Add a splash of soy sauce if available, taste and serve with rice.'], true],
  ['Yam Porridge with Ugu', 'Energy / Sports', 3900, 40, ['yam', 'tomatoes', 'onion', 'fresh pepper', 'palm oil', 'ugu leaves'], ['Peel yam into similar-sized cubes, rinse and place in a pot.', 'Add chopped onion, blended tomato and pepper, palm oil and water halfway up the yam.', 'Season lightly, cover and simmer 20-25 minutes, stirring occasionally.', 'Mash a few pieces into the liquid to thicken the sauce.', 'Wash and slice ugu; fold into the pot and simmer 2-3 minutes.', 'Taste and serve warm.']],
  ['Chicken Shawarma-style Wrap', 'Try Something Different', 4900, 30, ['chicken', 'flatbread', 'cabbage', 'carrot', 'plain yoghurt', 'pepper'], ['Slice chicken thinly and season with pepper, salt and curry powder.', 'Cook chicken in a hot pan until browned and fully cooked.', 'Shred cabbage and carrot; mix plain yoghurt with a little pepper for a simple sauce.', 'Warm flatbread briefly in a dry pan so it bends without cracking.', 'Layer vegetables, chicken and sauce down the centre of the bread.', 'Fold tightly and toast seam-side down for a minute before serving.'], true]
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bachelor-kitchen');

    await Promise.all([
      User.deleteMany({}), Category.deleteMany({}), Meal.deleteMany({}), Chef.deleteMany({}),
      SubscriptionPlan.deleteMany({}), Subscription.deleteMany({}), Timetable.deleteMany({}),
      Payment.deleteMany({}), IngredientPrice.deleteMany({})
    ]);

    const users = await Promise.all([
      User.create({ name: 'Kitchen Admin', email: 'admin@bachelorkitchen.com', password: 'admin123', role: 'admin', phone: '08000000000' }),
      User.create({ name: 'Free Member', email: 'free@bachelorkitchen.com', password: 'free123', role: 'user', phone: '08011111111' }),
      User.create({ name: 'Pro Member', email: 'subscriber@bachelorkitchen.com', password: 'subscriber123', role: 'user', phone: '08022222222' })
    ]);

    const categoryNames = [...new Set(recipeRows.map((row) => row[1]))];
    const categories = await Category.insertMany(categoryNames.map((name) => ({ name, description: `${name} Nigerian home-cooking meals` })));
    const categoryByName = new Map(categories.map((item) => [item.name, item._id]));
    const chefs = await Chef.insertMany([
      { name: 'Chef Tolu', specialty: 'Nigerian home cooking', location: 'Lagos', contact: '08033333333', preparationPrice: 3500, deliveryAvailable: true },
      { name: 'Chef Musa', specialty: 'Protein and fitness meals', location: 'Abuja', contact: '08044444444', preparationPrice: 4200, deliveryAvailable: true }
    ]);

    const meals = await Meal.insertMany(recipeRows.map((row, index) => {
      const [title, category, estimatedCost, minutes, ingredients, preparationSteps, isExotic = false] = row;
      const image = title.includes('Beans') || title === 'Ewa Riro' ? photos.beans
        : title.includes('Moi Moi') ? photos.moiMoi
          : title.includes('Akara') ? photos.akara
            : title.includes('Pepper Soup') ? photos.pepperSoup
              : title.includes('Yam') || title.includes('Potato Porridge') ? photos.yam
                : title.includes('Egg Sauce') || title.includes('Eggs') ? photos.egg
                  : title.includes('Spaghetti') ? photos.spaghetti
                    : title.includes('Fried Rice') || title.includes('Stir-fry') || title.includes('Shawarma') ? photos.friedRice
                    : title.includes('Ofada') ? photos.stew
                      : photos.rice;
      const ingredientLines = ingredients.map((name, ingredientIndex) => ({
        name,
        quantity: ingredientIndex === 0 ? 2 : 1,
        unit: ingredientIndex === 0 ? 'portions' : 'portion',
        estimatedCost: Math.round(estimatedCost / ingredients.length)
      }));

      return {
        title,
        description: `${title} made with everyday Nigerian ingredients and practical home-cooking equipment.`,
        image,
        category: categoryByName.get(category),
        ingredients,
        ingredientLines,
        preparationSteps,
        preparationTime: `${minutes} min`,
        cookingTime: `${minutes} min`,
        totalTime: `${minutes} min`,
        requiredEquipment: ['Cooking pot', 'Frying pan', 'Knife', 'Chopping board', 'Cooking spoon'],
        commonMistakes: ['Keep heat moderate and stir regularly to avoid burning.', 'Taste before adding more salt or seasoning.'],
        substitutions: ['Use locally available fresh pepper.', 'Adjust oil and seasoning to taste.'],
        safetyTips: ['Wash hands and produce before cooking.', 'Cook eggs and poultry until fully done.'],
        isExotic,
        difficulty: 'Easy',
        estimatedCost,
        servings: index % 3 + 2,
        nutrition: { calories: 450 + index * 7, protein: 18 + index % 15, carbohydrates: 40 + index % 30, fat: 12 + index % 12, fibre: 4 + index % 8 },
        storageInstructions: 'Cool promptly, cover and refrigerate. Consume within 2-3 days.',
        reheatingInstructions: 'Reheat until steaming hot; add a splash of water if needed.',
        videoUrl: '',
        chef: chefs[index % chefs.length]._id,
        published: true
      };
    }));

    await IngredientPrice.insertMany([
      { name: 'Egg', unit: 'piece', quantity: 1, price: 550, location: 'Lagos', market: 'Sample market estimate', effectiveDate: new Date() },
      { name: 'Tomato', unit: 'piece', quantity: 1, price: 250, location: 'Lagos', market: 'Sample market estimate', effectiveDate: new Date() },
      { name: 'Brown beans', unit: 'kg', quantity: 1, price: 1800, location: 'Lagos', market: 'Sample market estimate', effectiveDate: new Date() },
      { name: 'Rice', unit: 'kg', quantity: 1, price: 2200, location: 'Lagos', market: 'Sample market estimate', effectiveDate: new Date() },
      { name: 'Plantain', unit: 'piece', quantity: 1, price: 500, location: 'Lagos', market: 'Sample market estimate', effectiveDate: new Date() }
    ]);

    const plans = await SubscriptionPlan.insertMany([
      { name: 'Monthly Pro', price: 5000, duration: '1 month', description: 'Full monthly meal plan and subscriber recipe access', features: ['Full timetable', 'Nutrition and serving data', 'Video guides', 'Chef information'], active: true },
      { name: 'Annual Elite', price: 48000, duration: '12 months', description: 'Full year of Nigerian meal planning at a reduced rate', features: ['Everything in Monthly Pro', 'Priority support', 'Annual savings'], active: true }
    ]);

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    await Subscription.create({ user: users[2]._id, plan: plans[0]._id, startDate, endDate, status: 'active', autoRenew: false });

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const dayCount = new Date(year, month + 1, 0).getDate();
    const normalRotation = meals.filter((item) => !item.isExotic);
    const exoticMeals = meals.filter((item) => item.isExotic);
    const entries = Array.from({ length: dayCount }, (_, index) => {
      const date = new Date(year, month, index + 1);
      const isExoticDay = date.getDay() === 6;
      const meal = isExoticDay
        ? exoticMeals[Math.floor(index / 7) % exoticMeals.length]
        : normalRotation[index % normalRotation.length];

      return { date, meal: meal._id, month: month + 1, year, published: true };
    });
    await Timetable.insertMany(entries);

    console.log(`Seed data loaded: ${meals.length} Nigerian meals and ${entries.length} timetable dates for ${year}-${String(month + 1).padStart(2, '0')}`);
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
