import React from 'react';
import { Recipe } from '../types';

interface RecipeListTableProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
}

export const RecipeListTable: React.FC<RecipeListTableProps> = ({ recipes, onSelectRecipe }) => {
  return (
    <div className="overflow-hidden border border-[#444444] md:rounded-lg">
      <table className="min-w-full divide-y divide-[#444444]">
        <thead className="bg-[#1E1E1E]">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-300 sm:pl-6">Recipe</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-300">Servings</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-300">Cost/Serving</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-300">Menu Price</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-300">Food Cost %</th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">View</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#444444] bg-[#2C2C2C]">
          {recipes.map((recipe) => {
            const totalCost = recipe.ingredients.reduce((acc, ing) => acc + (ing.cost || 0) * ing.quantity, 0);
            const costPerServing = recipe.servings > 0 ? totalCost / recipe.servings : 0;
            const foodCostPercent = recipe.menuPrice > 0 ? (costPerServing / recipe.menuPrice) * 100 : 0;
            
            return (
              <tr key={recipe.id} className="hover:bg-[#444444] transition-colors duration-150 cursor-pointer" onClick={() => onSelectRecipe(recipe)}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-100 sm:pl-6">{recipe.name}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-400">{recipe.servings}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-400">${costPerServing.toFixed(2)}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-400">${recipe.menuPrice.toFixed(2)}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-400">{foodCostPercent.toFixed(1)}%</td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <span className="text-[#FF6B6B] hover:text-[#E85A5A]">View</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};