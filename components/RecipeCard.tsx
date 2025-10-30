// FIX: Add a basic component implementation to resolve file content errors.
import React from 'react';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onSelect }) => {
  return (
    <div onClick={() => onSelect(recipe)} className="p-4 border rounded-md cursor-pointer hover:bg-gray-50">
      <h3 className="font-bold">{recipe.name}</h3>
      <p className="text-sm text-gray-500">{recipe.servings} servings</p>
    </div>
  );
};
