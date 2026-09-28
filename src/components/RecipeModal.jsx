import { recipeFor } from '../data/recipes.js';
import { GuideModal } from './GuideModal.jsx';

export function RecipeModal({meal, onClose}){
  const recipe = meal ? recipeFor(meal.dish) : null;
  return (
    <GuideModal
      open={!!meal}
      kicker={meal?.title}
      title={meal?.dish}
      note="Use the portions on the card. About ½ teaspoon of oil for the cooked dish."
      steps={recipe?.steps}
      href={recipe?.youtube}
      linkLabel="Watch on YouTube"
      onClose={onClose}
    />
  );
}
