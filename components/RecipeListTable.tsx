
import React from 'react';
import { Recipe } from '../types';

interface RecipeListTableProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
}

export const RecipeListTable: React.FC<RecipeListTableProps> = ({ recipes, onSelectRecipe }) => {
  return (
    <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Recipe</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Servings</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Cost/Serving</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Menu Price</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Food Cost %</th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">View</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {recipes.map((recipe) => {
            const totalCost = recipe.ingredients.reduce((acc, ing) => acc + (ing.cost || 0) * ing.quantity, 0);
            const costPerServing = recipe.servings > 0 ? totalCost / recipe.servings : 0;
            const foodCostPercent = recipe.menuPrice > 0 ? (costPerServing / recipe.menuPrice) * 100 : 0;
            
            return (
              <tr key={recipe.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onSelectRecipe(recipe)}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{recipe.name}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{recipe.servings}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">${costPerServing.toFixed(2)}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">${recipe.menuPrice.toFixed(2)}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{foodCostPercent.toFixed(1)}%</td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <span className="text-blue-600 hover:text-blue-900">View</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
