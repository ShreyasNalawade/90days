function watch(query){
  return 'https://www.youtube.com/results?search_query='+encodeURIComponent(query);
}

// Keys match the dish name on each meal card.
export const RECIPES = {
  'Besan chilla and milk': {
    steps:[
      'Whisk 85 g besan with water to a thick dosa batter. Add salt, turmeric, chopped onion, tomato, coriander, and green chilli.',
      'Heat a tawa and wipe on about ½ teaspoon oil. Pour a ladle and spread a thin chilla. Cook both sides until spotted and set. Repeat for the second chilla.',
      'Drink the 450 ml skimmed milk with the chillas, or warm it if you prefer.'
    ],
    youtube:watch('besan chilla recipe Maharashtrian')
  },
  'Jowar bhakri, moong pithla, and koshimbir': {
    steps:[
      'Mix 50 g jowar flour with hot water and a pinch of salt. Knead a soft dough, pat one round bhakri, and cook it on a tawa, turning until both sides have brown spots.',
      'Soak 95 g moong dal, then cook it soft. Mash part of it, add turmeric, salt, chilli, and the onion-tomato tempering in about ½ teaspoon oil. Simmer into pithla.',
      'Chop cucumber and tomato, mix with salt, and squeeze a little lemon if you have it. This is the koshimbir. Serve with 200 g low-fat dahi.'
    ],
    youtube:watch('jowar bhakri and pithla recipe')
  },
  'Masoor amti and milk': {
    steps:[
      'Rinse the masoor and pressure-cook it with turmeric and salt until soft.',
      'In about ½ teaspoon oil, warm mustard seeds or cumin, then add chopped onion, garlic, green chilli, and the cooked vegetable. Add the dal and a little water and simmer.',
      'Finish with coriander. Drink the skimmed milk on the side or after the meal.'
    ],
    youtube:watch('masoor amti recipe Maharashtrian')
  },
  'Oats, milk, and peanuts': {
    steps:[
      'Warm part of the 450 ml skimmed milk. Stir in 45 g rolled oats and a pinch of salt or a little jaggery if you want it sweet.',
      'Cook 3 to 4 minutes until thick. Keep the rest of the milk to drink.',
      'Crush 8 g roasted peanuts and sprinkle them on top.'
    ],
    youtube:watch('oats with milk recipe breakfast')
  },
  'Jowar bhakri, matki usal, and zunka': {
    steps:[
      'Pat and cook one jowar bhakri from 50 g flour, as on a bhakri day.',
      'Soak 90 g matki, pressure-cook until soft, then simmer with onion, tomato, chilli, goda masala or garam masala, and about ½ teaspoon oil.',
      'For zunka, cook chopped onion in about ½ teaspoon oil, add 60 g besan with a splash of water, turmeric, and salt, and stir until it clumps and smells cooked. Serve with 200 g low-fat dahi.'
    ],
    youtube:watch('matki usal and zunka recipe')
  },
  'Moong amti and milk': {
    steps:[
      'Pressure-cook 95 g moong dal with turmeric and salt until soft.',
      'Temper about ½ teaspoon oil with cumin, then add onion, garlic, green chilli, and the cooked vegetable. Pour in the dal and simmer a few minutes.',
      'Add coriander. Have the 500 ml skimmed milk with the meal or after it.'
    ],
    youtube:watch('moong dal amti recipe Maharashtrian')
  },
  'Moong-besan chilla and milk': {
    steps:[
      'Soak 50 g moong, drain, and grind it with a little water to a coarse batter. Mix in 65 g besan, salt, turmeric, onion, tomato, coriander, and green chilli. Add water until it spreads.',
      'Cook thin chillas on a tawa wiped with about ½ teaspoon oil, both sides, until set.',
      'Drink the 450 ml skimmed milk with them.'
    ],
    youtube:watch('moong besan chilla recipe')
  },
  'Bajra bhakri and paneer bhurji': {
    steps:[
      'Mix 50 g bajri flour with hot water and salt. Pat one bhakri and cook it on a tawa until both sides are firm and spotted.',
      'Crumble 80 g paneer. In about ½ teaspoon oil, cook onion, tomato, chilli, and turmeric, then add the paneer and palak or the other bhaji. Salt and cook until the greens wilt. This is the only paneer meal in the week.',
      'Mix cucumber and tomato with salt for koshimbir. Serve with 200 g low-fat dahi.'
    ],
    youtube:watch('bajra bhakri and paneer bhurji recipe')
  },
  'Chawli usal and milk': {
    steps:[
      'Soak 95 g chawli, then pressure-cook until soft but not broken.',
      'Cook onion, tomato, garlic, and chilli in about ½ teaspoon oil. Add goda masala or garam masala, the beans, and the cooked vegetable. Simmer until the gravy thickens.',
      'Drink the 500 ml skimmed milk with dinner.'
    ],
    youtube:watch('chawli usal recipe Maharashtrian')
  },
  'Vegetable oats and milk': {
    steps:[
      'Warm about ½ teaspoon oil. Cook onion, tomato, and cabbage with salt and turmeric for 2 minutes.',
      'Add 50 g rolled oats and a splash of water or milk. Stir until the oats are soft and the vegetables are still bright.',
      'Drink the rest of the 450 ml skimmed milk alongside.'
    ],
    youtube:watch('vegetable oats recipe Indian breakfast')
  },
  'Jowar bhakri, masoor amti, and zunka': {
    steps:[
      'Cook one jowar bhakri from 50 g flour on a tawa.',
      'Pressure-cook 100 g masoor. Temper about ½ teaspoon oil with cumin, onion, garlic, and chilli, add the dal, and simmer into amti.',
      'Make zunka with 55 g besan, onion, turmeric, salt, and about ½ teaspoon oil, stirring until the flour is cooked. Serve with the leafy bhaji and 200 g low-fat dahi.'
    ],
    youtube:watch('masoor amti and besan zunka recipe')
  },
  'Matki usal and milk': {
    steps:[
      'Soak 95 g matki and pressure-cook until soft.',
      'In about ½ teaspoon oil, cook onion, tomato, and chilli. Add the matki, a little water, and goda masala or garam masala. Simmer with the cooked vegetable.',
      'Have the 500 ml skimmed milk with the usal.'
    ],
    youtube:watch('matki usal recipe Maharashtrian')
  },
  'Besan chilla, sprouted moong, and milk': {
    steps:[
      'Whisk 60 g besan into a thick batter with salt, turmeric, onion, tomato, and coriander. Cook one or two chillas in about ½ teaspoon oil.',
      'Steam or sauté 120 g sprouted moong with salt, turmeric, and a pinch of chilli until just tender. Do not add more oil.',
      'Drink the 450 ml skimmed milk with breakfast.'
    ],
    youtube:watch('besan chilla and sprouted moong recipe')
  },
  'Nachni bhakri, moong usal, and zunka': {
    steps:[
      'Mix 50 g nachni flour with hot water and salt. Pat one bhakri and cook both sides on a tawa.',
      'Soak and pressure-cook 85 g moong. Simmer it as usal with onion, tomato, chilli, and about ½ teaspoon oil.',
      'Stir 45 g besan into a little water with turmeric and salt, cook it as zunka with the vegetable bhaji, and serve with 200 g low-fat dahi.'
    ],
    youtube:watch('nachni bhakri and moong usal recipe')
  },
  'Oats, sprouted moong, and milk': {
    steps:[
      'Cook 50 g rolled oats in part of the skimmed milk until creamy. Keep the rest of the 450 ml to drink.',
      'Steam or lightly cook 130 g sprouted moong with salt and turmeric in about ½ teaspoon oil.',
      'Eat the sprouts with the oats.'
    ],
    youtube:watch('oats and sprouted moong breakfast recipe')
  },
  'Jowar bhakri, kala chana usal, and zunka': {
    steps:[
      'Soak 80 g kala chana overnight and pressure-cook until soft. Cook one jowar bhakri from 50 g flour.',
      'Simmer the chana with onion, tomato, chilli, and goda masala in about ½ teaspoon oil until the gravy coats the chickpeas.',
      'Cook 70 g besan as zunka with onion, turmeric, salt, and about ½ teaspoon oil. Serve with the bhaji and 200 g low-fat dahi.'
    ],
    youtube:watch('kala chana usal and zunka recipe')
  },
  'Soya usal and milk': {
    steps:[
      'Soak 45 g dry soya chunks in hot water for 10 minutes. Squeeze them dry. This is the only soya meal in the week, and the 45 g is the dry weight.',
      'Cook onion, tomato, garlic, and chilli in about ½ teaspoon oil. Add the chunks, turmeric, salt, and a little water, and simmer with the cooked vegetable until the gravy is thick.',
      'Drink the 550 ml skimmed milk with dinner.'
    ],
    youtube:watch('soya chunks usal recipe Maharashtrian')
  },
  'Moong-besan thalipeeth and milk': {
    steps:[
      'Soak 40 g moong, grind it coarse, and mix with 55 g besan, salt, turmeric, onion, coriander, and green chilli. The dough should be thick enough to pat.',
      'Pat one thalipeeth on a wet tawa or plastic sheet. Cook both sides with about ½ teaspoon oil until the centre is set.',
      'Drink the 400 ml skimmed milk with it.'
    ],
    youtube:watch('moong thalipeeth recipe Maharashtrian')
  },
  'Bajra bhakri, chawli amti, and zunka': {
    steps:[
      'Pat and cook one bajri bhakri from 50 g flour.',
      'Pressure-cook 80 g chawli. Temper about ½ teaspoon oil, add onion, garlic, and chilli, then the beans and a little water. Simmer into amti.',
      'Cook 45 g besan as zunka with the vegetable bhaji. Serve with 200 g low-fat dahi.'
    ],
    youtube:watch('bajra bhakri and chawli amti recipe')
  },
  'Moong dal and milk': {
    steps:[
      'Pressure-cook 90 g moong dal with turmeric and salt until soft.',
      'In about ½ teaspoon oil, warm cumin, then add garlic, green chilli, and the cooked vegetable. Stir in the dal and simmer.',
      'Finish with coriander. Have the 450 ml skimmed milk with the dal or after it.'
    ],
    youtube:watch('yellow moong dal recipe')
  }
};

export function recipeFor(dish){
  return RECIPES[dish] || {
    steps:[
      'Use the portions listed on the meal card.',
      'Cook the dish with about ½ teaspoon of oil, salt, turmeric, and chilli to taste.',
      'Drink the skimmed milk with the meal if it is on the card. Dahi stays at lunch.'
    ],
    youtube:watch(dish+' recipe Maharashtrian')
  };
}
