const meal = (id, title, category, description, preparationTime, estimatedCost, servings, ingredients, preparationSteps, image, isExotic = false) => ({
  id: String(id),
  title,
  category,
  description,
  image,
  preparationTime,
  cookingTime: preparationTime,
  totalTime: preparationTime,
  difficulty: 'Easy',
  estimatedCost,
  costPerServing: Math.round(estimatedCost / servings),
  priceNote: 'Estimated price; market costs vary by location and season.',
  ingredients,
  ingredientLines: ingredients.map((name, index) => ({ name, quantity: index === 0 ? 2 : 1, unit: index === 0 ? 'portions' : 'portion', estimatedCost: Math.round(estimatedCost / ingredients.length) })),
  preparationSteps,
  requiredEquipment: ['Frying pan', 'Cooking pot', 'Knife', 'Chopping board', 'Cooking spoon'],
  commonMistakes: ['Keep the heat moderate to prevent the food sticking or burning.', 'Taste before adding more salt or seasoning.'],
  substitutions: ['Use any locally available fresh pepper.', 'Swap vegetable oil for palm oil where it suits the dish.'],
  safetyTips: ['Wash hands and produce before cooking.', 'Cook eggs and poultry until fully done.'],
  published: true,
  isSubscriberOnly: true,
  isExotic,
});

const images = {
  rice: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/67/Nigerian_jollof_rice.jpg/250px-Nigerian_jollof_rice.jpg',
  beans: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/ba/Beans_and_plantain_%28African_good%29.jpg/250px-Beans_and_plantain_%28African_good%29.jpg',
  egg: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ea/Nigerian_dish_Yam_and_Egg_Sauce.jpg/330px-Nigerian_dish_Yam_and_Egg_Sauce.jpg',
  pasta: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3f/Jollof_spaghetti_In_Northern_Nigeria.jpg/250px-Jollof_spaghetti_In_Northern_Nigeria.jpg',
  breakfast: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2c/Kosai%28Akara%29.jpg/250px-Kosai%28Akara%29.jpg',
  moiMoi: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/24/Moin_Moin.jpg/330px-Moin_Moin.jpg',
  stew: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/49/Ofada_Stew_%28Ayamase_stew%29.jpg/120px-Ofada_Stew_%28Ayamase_stew%29.jpg',
  chicken: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/29/Fried_rice_and_chicken_garnished_with_sweet_corn%2C_carrot_and_green_peas.jpg/250px-Fried_rice_and_chicken_garnished_with_sweet_corn%2C_carrot_and_green_peas.jpg',
  yam: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1b/Yam_porridge_or_%C3%80s%C3%A1r%C3%B3.jpg/250px-Yam_porridge_or_%C3%80s%C3%A1r%C3%B3.jpg',
  pepperSoup: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c9/Nigerian_prepared_Pepper-Soup.jpg/250px-Nigerian_prepared_Pepper-Soup.jpg',
};

export const demoMeals = [
  meal(1, 'Jollof Rice + Chicken', 'Balanced Meals', 'Smoky one-pot party-style rice with tender chicken, made practical for a weeknight.', '50 min', 5200, 2, ['2 cups parboiled rice', '2 chicken portions', '3 tomatoes', '1 red bell pepper', '1 onion', 'Tomato paste', 'Stock cube and thyme'], ['Rinse rice until the water runs mostly clear and set aside. Blend tomatoes and pepper roughly; do not add water unless needed.', 'Season chicken with salt, thyme and half the sliced onion. Brown in a pot, add water to cover halfway, and simmer until cooked through. Keep the stock.', 'Warm a little oil in the pot. Fry remaining onion and tomato paste for 2 minutes, then add the blended pepper mixture.', 'Cook the sauce over medium heat for 10-12 minutes, stirring regularly until it thickens and the raw tomato smell fades.', 'Stir in rice, measured chicken stock and enough water to just cover the grains. Taste the liquid and adjust seasoning.', 'Cover tightly and cook on low heat for 25-30 minutes. Check once near the end and add a small splash of water if the base is dry.', 'Fold gently, return chicken to the top to warm through, then rest covered for 5 minutes before serving.'], images.rice),
  meal(2, 'Beans + Fried Plantain', 'Budget Meals', 'Soft beans with ripe plantain: filling, familiar and made with everyday market ingredients.', '55 min', 3900, 3, ['2 cups brown beans', '2 ripe plantains', '1 onion', 'Palm oil', 'Fresh pepper', 'Salt'], ['Pick through the beans, rinse well and place in a pot with plenty of water.', 'Boil until the beans are tender, adding hot water as needed. Do not add salt early if the beans are still firm.', 'Slice plantain diagonally into even pieces. Heat a shallow layer of oil and fry in batches until golden on both sides.', 'In a small pan, warm palm oil over low heat. Add chopped onion and pepper and cook gently for 3 minutes.', 'Stir the pepper oil into the soft beans, season lightly and simmer for another 5 minutes.', 'Serve beans with fried plantain while hot.'], images.beans),
  meal(3, 'Egg Sauce + Bread', 'High Protein', 'A quick tomato-and-egg sauce served with soft bread for breakfast or a no-fuss supper.', '20 min', 3600, 2, ['4 eggs', '3 tomatoes', '1 onion', '2 fresh peppers', '2 tablespoons vegetable oil', '1 loaf sliced bread'], ['Wash the tomatoes and peppers. Dice the tomatoes and onion; chop the pepper finely or blend briefly for a smoother sauce.', 'Crack eggs into a clean bowl, add a pinch of salt and whisk just until yolks and whites combine.', 'Warm a frying pan over medium heat for 30 seconds. Add oil, then cook onion for 1-2 minutes until softened.', 'Add tomato and pepper. Stir and cook for 6-8 minutes, lowering the heat if the mixture begins to catch on the pan.', 'Season the sauce, taste carefully, then pour in the eggs. Leave undisturbed for 10 seconds before folding gently.', 'Cook until the eggs are set but still moist. Remove from heat and serve with bread, boiled yam or potatoes.'], images.egg),
  meal(4, 'White Rice + Tomato Stew', 'Everyday Meals', 'A dependable Nigerian staple with a simple pepper and tomato stew.', '45 min', 4300, 3, ['2 cups rice', '4 tomatoes', '1 red pepper', '1 onion', 'Tomato paste', 'Vegetable oil', 'Stock cube'], ['Rinse rice and cook in salted boiling water until just tender. Drain excess water and keep covered.', 'Blend tomatoes and pepper coarsely. Slice the onion and reserve a little for the stew.', 'Heat oil in a pot and soften the onion. Stir in tomato paste and fry for 1 minute.', 'Add the blended vegetables and cook uncovered for 12-15 minutes, stirring often until reduced and glossy.', 'Season with a small amount of stock cube and salt. Add a splash of water if the stew becomes too thick.', 'Serve stew over rice. Add cooked fish, egg or chicken if available.'], images.stew),
  meal(5, 'Yam + Egg Sauce', 'Energy / Sports', 'Boiled yam with rich tomato egg sauce for steady energy and an easy-to-find ingredient list.', '35 min', 4200, 2, ['4 yam slices', '4 eggs', '3 tomatoes', '1 onion', 'Fresh pepper', 'Vegetable oil'], ['Peel yam carefully, cut into even chunks and rinse. Put in a pot, cover with water and add a small pinch of salt.', 'Boil for 15-20 minutes until a fork passes through easily. Drain and keep covered.', 'Dice tomato and onion; chop pepper. Beat eggs lightly in a clean bowl.', 'Heat oil in a pan and cook onion for 1 minute. Add tomato and pepper, then simmer until most liquid evaporates.', 'Season the sauce. Pour in eggs and allow them to set briefly before folding slowly.', 'Cook until the egg is fully set but not dry. Serve beside the hot yam.'], images.egg),
  meal(6, 'Akara + Bread', 'Breakfast', 'Crisp bean fritters made from peeled beans, served with bread for a satisfying breakfast.', '40 min', 3200, 3, ['2 cups peeled beans', '1 small onion', 'Fresh pepper', 'Salt', 'Vegetable oil', 'Bread'], ['Rinse peeled beans and soak in fresh water for 20 minutes if they feel dry.', 'Blend beans with a little water into a thick, smooth paste. Avoid making it runny.', 'Beat the paste with a spoon for 2-3 minutes until lighter. Fold in finely chopped onion, pepper and salt.', 'Heat oil in a deep pan over medium heat. Test with a small dot of batter; it should bubble gently, not smoke.', 'Spoon small portions into the oil with space between them. Fry in batches, turning once until golden and cooked through.', 'Drain on a rack or paper towel and serve warm with bread.'], images.beans),
  meal(7, 'Moi Moi + Boiled Eggs', 'High Protein', 'Steamed bean pudding with egg, a nourishing option that works with a pot and covered bowls.', '70 min', 4400, 4, ['2 cups peeled beans', '2 eggs', '1 red pepper', '1 onion', '2 tablespoons vegetable oil', 'Seasoning and salt'], ['Rinse beans and blend with pepper, onion and enough water to make a smooth, pourable batter.', 'Boil eggs until firm, cool in water, peel and cut each egg in half.', 'Stir oil and seasoning into the bean batter. Taste a small amount and adjust salt.', 'Pour batter into heat-safe covered cups or leaf wraps, leaving room for it to expand. Add egg pieces.', 'Place cups in a pot with hot water reaching halfway up their sides. Cover the pot and steam gently for 45-55 minutes.', 'Check one portion with a clean skewer; it should come out mostly clean. Cool briefly before serving.'], images.beans),
  meal(8, 'Ewa Riro', 'Budget Meals', 'A soft, peppery Yoruba-style bean stew finished with palm oil and served with bread or garri.', '60 min', 3100, 3, ['2 cups brown beans', '1 onion', '2 tomatoes', 'Fresh pepper', 'Palm oil', 'Salt'], ['Pick over beans and rinse. Add to a pot with water and half the onion; boil until very soft.', 'Blend tomatoes and pepper coarsely. Warm palm oil in a second pot over low heat.', 'Add remaining onion to the oil and cook until fragrant, then stir in the blended pepper.', 'Cook the pepper base for 8-10 minutes, stirring often. Add a little bean cooking water if it gets too thick.', 'Add the cooked beans and some of their liquid. Mash a few spoonfuls against the pot to thicken naturally.', 'Season lightly and simmer for 8 minutes. Serve with bread, garri or boiled yam.'], images.beans),
  meal(9, 'Nigerian Fried Rice + Chicken', 'Balanced Meals', 'Rice tossed with carrots, green beans and liver or chicken, using a simple home kitchen method.', '45 min', 5600, 3, ['2 cups rice', '2 chicken pieces', '1 carrot', 'Green beans', 'Sweet corn', 'Curry powder', 'Stock cube'], ['Rinse rice and parboil for 5 minutes. Drain, rinse again and set aside.', 'Season chicken with salt, curry and thyme. Simmer in a pot until cooked through and reserve the stock.', 'Dice carrot and green beans into small even pieces. Heat a spoon of oil in a wide pan.', 'Add vegetables and sweet corn. Stir-fry for 2-3 minutes so they stay bright and slightly crisp.', 'Add rice in batches with a little chicken stock and curry. Toss well and cook covered on low heat until grains are tender.', 'Taste and adjust seasoning. Serve with chicken cooked through and hot.'], images.chicken),
  meal(10, 'Nigerian-Style Noodles + Eggs', 'Quick Meals', 'A fast pan of noodles with vegetables and egg for nights when time and energy are short.', '15 min', 2800, 1, ['2 packs noodles', '2 eggs', '1 carrot', '1 spring onion', 'Fresh pepper', 'Seasoning sachet'], ['Bring a small pot of water to a boil. Add noodles and cook for 2 minutes, then drain most of the water.', 'Slice carrot, spring onion and pepper thinly while the noodles soften.', 'Warm a little oil in a pan. Scramble eggs gently until just set, then transfer to a plate.', 'Add carrot and pepper to the same pan and stir-fry for 1 minute.', 'Return noodles and eggs to the pan. Add seasoning gradually and toss until evenly coated.', 'Fold in spring onion and serve immediately.'], images.egg),
  meal(11, 'Ofada Rice + Ayamase Sauce', 'Balanced Meals', 'A smaller, simplified home version of Ofada rice with a green pepper sauce.', '60 min', 6500, 3, ['2 cups Ofada rice', '6 green bell peppers', '2 scotch bonnet peppers', '1 onion', 'Palm oil', 'Assorted meat (optional)'], ['Rinse Ofada rice several times until the water runs clearer. Cook in fresh water until tender, then drain.', 'Blend green peppers, scotch bonnet and half the onion coarsely. Do not add much water.', 'Warm palm oil gently in a pot. If it is smoking, remove it from the heat and let it cool before continuing.', 'Add sliced onion, then the pepper blend. Simmer uncovered for 15-20 minutes, stirring regularly.', 'Add cooked assorted meat if using. Season carefully and simmer until the sauce is thick and fragrant.', 'Serve a modest portion of rice with sauce. Keep the sauce covered and refrigerated after cooling.'], images.stew),
  meal(12, 'Spaghetti Jollof', 'Quick Meals', 'A tomato-pepper spaghetti one-pot with familiar Nigerian seasoning.', '30 min', 3900, 2, ['250 g spaghetti', '3 tomatoes', '1 red pepper', '1 onion', 'Tomato paste', 'Vegetable oil', 'Stock cube'], ['Break spaghetti in half if needed to fit the pot. Blend tomatoes and pepper roughly.', 'Fry sliced onion and a spoon of tomato paste in a little oil for 1 minute.', 'Add blended pepper and cook for 8-10 minutes until reduced and no longer raw-smelling.', 'Pour in enough water to barely cover the spaghetti, then add seasoning and bring to a boil.', 'Add spaghetti, stir to separate strands and cook uncovered, stirring often to prevent sticking.', 'Lower heat when nearly tender. Cook until the liquid is absorbed and the pasta is soft but not mushy.'], images.pasta),
  meal(13, 'Potato Porridge', 'Energy / Sports', 'A comforting one-pot meal with potatoes, pepper, greens and a small amount of palm oil.', '40 min', 3600, 3, ['5 medium potatoes', '2 tomatoes', '1 red pepper', '1 onion', 'Palm oil', 'Spinach or ugu'], ['Peel potatoes, cut into equal cubes and rinse. Chop onion and wash the leafy vegetables.', 'Blend tomato and pepper. Add potatoes to a pot with enough water to come halfway up the pieces.', 'Add onion, pepper blend, a small amount of palm oil and seasoning. Cover and bring to a gentle boil.', 'Cook for 20-25 minutes, stirring carefully once or twice so the potatoes do not stick.', 'When potatoes are tender, mash a few pieces against the pot to thicken the sauce.', 'Fold in chopped greens and simmer uncovered for 2 minutes. Serve hot.'], images.rice),
  meal(14, 'Boiled Yam + Garden Egg Sauce', 'Everyday Meals', 'Boiled yam paired with a simple garden egg and pepper sauce.', '35 min', 4100, 2, ['4 yam slices', '6 garden eggs', '1 onion', 'Fresh pepper', 'Palm oil', 'Salt'], ['Peel and cut yam into chunks. Rinse and boil in lightly salted water until tender.', 'Rinse garden eggs and boil until soft. Cool slightly, peel if desired and mash coarsely.', 'Warm palm oil in a pan and soften chopped onion over low heat.', 'Add mashed garden eggs and chopped pepper. Stir in a spoon of water if the sauce is too thick.', 'Season to taste and simmer for 5 minutes, stirring to keep the base from catching.', 'Drain yam and serve with the hot sauce.'], images.egg),
  meal(15, 'Beans + Garri', 'Budget Meals', 'Soft beans served with garri and a light pepper-oil topping, a low-cost pantry meal.', '55 min', 2600, 2, ['2 cups brown beans', '1 cup garri', '1 onion', 'Fresh pepper', 'Palm oil', 'Salt'], ['Rinse beans and boil in plenty of water until soft, adding hot water as needed.', 'When beans are tender, season lightly and keep a little cooking liquid so they remain moist.', 'Mix garri with cool drinking water in a clean bowl and allow it to soften for 3-5 minutes.', 'Warm palm oil gently in a pan. Add chopped onion and pepper, and cook for 2-3 minutes.', 'Spoon beans into bowls and top with pepper oil. Serve with softened garri.', 'Cool and refrigerate leftovers promptly; do not leave cooked beans at room temperature for long.'], images.beans),
  meal(16, 'Chicken Pepper Soup', 'High Protein', 'A light, spicy broth made with chicken and accessible pepper-soup spices.', '50 min', 5800, 3, ['500 g chicken pieces', '1 onion', 'Pepper-soup spice', 'Fresh pepper', 'Scent leaf', 'Seasoning'], ['Rinse chicken under clean running water and place in a pot with sliced onion.', 'Add salt, seasoning and pepper-soup spice. Add water just to cover the chicken.', 'Bring to a boil, then simmer covered until chicken is completely cooked and tender, about 30 minutes.', 'Taste the broth and add pepper gradually; pepper-soup heat should be adjustable.', 'Add chopped scent leaf and simmer uncovered for 2 minutes.', 'Serve hot in bowls. Ensure chicken is cooked through before serving.'], images.chicken),
  meal(17, 'Rice + Scrambled Eggs', 'Quick Meals', 'A simple leftover-rice meal with onion, pepper and soft scrambled eggs.', '15 min', 2900, 2, ['2 cups cooked rice', '3 eggs', '1 onion', 'Fresh pepper', 'Vegetable oil'], ['Break up cold cooked rice with a fork so there are no large clumps.', 'Crack eggs into a bowl, season lightly and whisk just to combine.', 'Warm oil in a pan. Soften chopped onion and pepper for 1-2 minutes.', 'Pour in eggs and stir slowly until softly set, then add the rice.', 'Toss rice over medium heat until steaming hot throughout. Taste and adjust seasoning.', 'Serve right away. Refrigerate leftover rice quickly and reheat only once.'], images.rice),
  meal(18, 'Oats + Peanut Butter + Banana', 'Energy / Sports', 'An affordable quick breakfast using oats, banana and peanut butter for longer-lasting energy.', '10 min', 2500, 1, ['1 cup oats', '1 banana', '1 tablespoon peanut butter', '1 cup milk or water', 'Groundnut (optional)'], ['Put oats and milk or water in a small pot. Bring to a gentle simmer, stirring so the bottom does not catch.', 'Cook for 4-6 minutes until creamy. Add a little more liquid if you prefer a looser texture.', 'Slice banana and crush a small handful of groundnuts if using.', 'Remove oats from heat and swirl in peanut butter.', 'Top with banana and groundnuts. Serve warm.'], images.breakfast),
  meal(19, 'Chicken and Vegetable Stir-fry', 'High Protein', 'A simple try-something-different pan meal with chicken, cabbage, carrots and local pepper.', '25 min', 5300, 2, ['300 g chicken', '1 carrot', '2 cups cabbage', '1 onion', 'Fresh pepper', 'Soy sauce (optional)'], ['Slice chicken into small even strips and season with salt and pepper.', 'Shred cabbage, slice carrot thinly and cut onion into wedges.', 'Heat a wide frying pan over medium-high heat with a spoon of oil.', 'Cook chicken in a single layer until browned and fully cooked, turning pieces as needed.', 'Add onion and carrot and stir-fry for 2 minutes. Add cabbage and toss until just softened.', 'Add a small splash of soy sauce if available. Taste, adjust seasoning and serve with rice.'], images.chicken, true),
  meal(20, 'Homemade Chicken Shawarma Wrap', 'Try Something Different', 'A weeknight shawarma-inspired wrap using chicken, cabbage and other easy-to-find ingredients.', '30 min', 4900, 2, ['300 g chicken', '2 flatbreads', '2 cups shredded cabbage', '1 carrot', 'Plain yoghurt', 'Fresh pepper'], ['Slice chicken thinly and season with salt, pepper and curry powder.', 'Cook in a hot frying pan until browned and fully cooked through.', 'Shred cabbage and carrot. Mix plain yoghurt with a little pepper for a quick sauce.', 'Warm each flatbread briefly in a dry pan until flexible.', 'Place vegetables, chicken and sauce down the centre of each bread.', 'Fold tightly and toast seam-side down for one minute before serving.'], images.chicken, true),
];

const dishPhotos = {
  'Akara + Bread': images.breakfast,
  'Moi Moi + Boiled Eggs': images.moiMoi,
  'Spaghetti Jollof': images.pasta,
  'Chicken Pepper Soup': images.pepperSoup,
  'Nigerian Fried Rice + Chicken': images.chicken,
  'Ofada Rice + Ayamase Sauce': images.stew,
  'Potato Porridge': images.yam,
  'Yam Porridge with Ugu': images.yam,
  'Chicken and Vegetable Stir-fry': images.chicken,
};

demoMeals.forEach((item) => {
  if (dishPhotos[item.title]) item.image = dishPhotos[item.title];
});

const exoticByWeek = [19, 20, 19, 20, 19];

export const demoTimetable = (() => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weekRotation = [1, 3, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15];

  return Array.from({ length: Math.min(daysInMonth, 14) }, (_, dayIndex) => {
    const date = new Date(year, month, dayIndex + 1);
    const week = Math.floor(dayIndex / 7);
    const weekday = date.toLocaleDateString('en-NG', { weekday: 'long' });
    const exotic = date.getDay() === 6;
    const mealId = exotic ? exoticByWeek[week] || 19 : weekRotation[dayIndex % weekRotation.length];
    const selectedMeal = demoMeals.find((item) => item.id === String(mealId));

    return {
      id: `${year}-${month + 1}-${dayIndex + 1}`,
      day: weekday,
      date: `${year}-${String(month + 1).padStart(2, '0')}-${String(dayIndex + 1).padStart(2, '0')}`,
      meal: selectedMeal.title,
      mealId: selectedMeal.id,
      category: selectedMeal.category,
      preparationTime: selectedMeal.preparationTime,
      estimatedCost: selectedMeal.estimatedCost,
      isExotic: selectedMeal.isExotic,
    };
  });
})();

export const demoPlans = [
  { id: 'monthly', name: 'Monthly Pro', price: 5000, duration: '1 month', description: 'Access the full monthly plan, nutrition data, and chef content.', features: ['Nutrition insights', 'Video guides', 'Chef details', 'Billing history'], active: true },
  { id: 'annual', name: 'Annual Elite', price: 48000, duration: '12 months', description: 'Best choice for long-term meal planning and savings.', features: ['Everything in Monthly Pro', 'Priority support', 'Discounted chef meals'], active: true },
];
