import { useEffect } from 'react';
import { recipeFor } from '../data/recipes.js';

export function RecipeModal({meal, onClose}){
  const recipe = meal ? recipeFor(meal.dish) : null;
  useEffect(()=>{
    if(!meal) return undefined;
    function onKey(e){ if(e.key==='Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return ()=>{
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [meal, onClose]);
  if(!meal || !recipe) return null;
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="recipe-title" onClick={e=>e.stopPropagation()}>
        <div className="modal-top">
          <div>
            <p className="kicker">{meal.title}</p>
            <h2 id="recipe-title">{meal.dish}</h2>
          </div>
          <button className="modal-close" type="button" aria-label="Close recipe" onClick={onClose}>×</button>
        </div>
        <p className="muted" style={{margin:'8px 0 0'}}>Use the portions on the card. About ½ teaspoon of oil for the cooked dish.</p>
        <ol className="recipe-steps">
          {recipe.steps.map(step=><li key={step}>{step}</li>)}
        </ol>
        <a className="btn btn-primary recipe-link" href={recipe.youtube} target="_blank" rel="noreferrer">Watch on YouTube</a>
      </div>
    </div>
  );
}
