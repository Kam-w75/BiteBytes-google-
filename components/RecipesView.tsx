import React, { useState, useMemo } from 'react';
import { Recipe, Ingredient } from '../types';
import { RecipeListTable } from './RecipeListTable';
import { RecipeFilterPanel, RecipeFilterState } from './RecipeFilterPanel';
import { MagnifyingGlassIcon, PlusIcon, AdjustmentsHorizontalIcon } from './Icons';

interface RecipesViewProps {
  recipes: Recipe[];
  allIngredients: Ingredient[];
  onSelectRecipe: (recipe: Recipe) => void;
  onAddRecipeClick: () => void;
}

export const RecipesView: React.FC<RecipesViewProps> = ({ recipes, allIngredients, onSelectRecipe, onAddRecipeClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<RecipeFilterState>({ sortBy: 'name', foodCost: 'all' });

  const ingredientsMap = useMemo(() => new Map(allIngredients.map(i => [i.id, i])), [allIngredients]);

  const filteredAndSortedRecipes = useMemo(() => {
    let filtered = [...recipes].filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));

    // Filter by food cost
    if (activeFilters.foodCost !== 'all') {
      filtered = filtered.filter(recipe => {
        const totalCost = recipe.ingredients.reduce((acc, ing) => {
          const masterIngredient = ingredientsMap.get(ing.id);
          return acc + (masterIngredient?.cost || 0) * ing.quantity;
        }, 0);
        const costPerServing = recipe.servings > 0 ? totalCost / recipe.servings : 0;
        const foodCostPercent = recipe.menuPrice > 0 ? (costPerServing / recipe.menuPrice) * 100 : 0;
        
        if (activeFilters.foodCost === 'over_30') return foodCostPercent > 30;
        if (activeFilters.foodCost === 'under_30') return foodCostPercent < 30;
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      if (activeFilters.sortBy === 'food_cost') {
        const costA = a.ingredients.reduce((acc, ing) => acc + (ingredientsMap.get(ing.id)?.cost || 0) * ing.quantity, 0) / a.servings;
        const costB = b.ingredients.reduce((acc, ing) => acc + (ingredientsMap.get(ing.id)?.cost || 0) * ing.quantity, 0) / b.servings;
        return (costB / b.menuPrice) - (costA / a.menuPrice);
      }
      if (activeFilters.sortBy === 'profitability') {
         const profitA = a.menuPrice - (a.ingredients.reduce((acc, ing) => acc + (ingredientsMap.get(ing.id)?.cost || 0) * ing.quantity, 0) / a.servings);
         const profitB = b.menuPrice - (b.ingredients.reduce((acc, ing) => acc + (ingredientsMap.get(ing.id)?.cost || 0) * ing.quantity, 0) / b.servings);
         return profitB - profitA;
      }
      return a.name.localeCompare(b.name);
    });

    return filtered;
  }, [recipes, searchTerm, activeFilters, ingredientsMap]);

  const handleApplyFilters = (newFilters: RecipeFilterState) => {
    setActiveFilters(newFilters);
    setIsFilterPanelOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4 gap-4">
        <div className="relative flex-grow">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <input
            type="search"
            placeholder="Find recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-[#444444] rounded-md text-sm bg-transparent text-white focus:ring-[#FF6B6B] focus:border-[#FF6B6B] placeholder-gray-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={() => setIsFilterPanelOpen(true)} className="p-2 text-gray-400 hover:bg-[#2C2C2C] rounded-md">
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onAddRecipeClick}
            className="inline-flex items-center gap-x-1.5 rounded-md bg-[#FF6B6B] px-3 py-2 text-sm font-semibold text-black shadow-sm hover:bg-[#E85A5A]"
          >
            <PlusIcon className="-ml-0.5 h-5 w-5" />
            Add Recipe
          </button>
        </div>
      </div>
      
      <RecipeListTable 
        recipes={filteredAndSortedRecipes} 
        allIngredients={allIngredients} 
        onSelectRecipe={onSelectRecipe} 
      />
      
      <RecipeFilterPanel 
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        onApply={handleApplyFilters}
      />
    </div>
  );
};
