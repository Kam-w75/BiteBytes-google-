import React, { useState } from 'react';
import { Recipe } from '../types';
import { PlusIcon, AdjustmentsHorizontalIcon, MagnifyingGlassIcon } from './Icons';
import { RecipeListTable } from './RecipeListTable';
import { RecipeFilterPanel } from './RecipeFilterPanel';

interface RecipesViewProps {
  recipes: Recipe[];
  onAddRecipeClick: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
}

export const RecipesView: React.FC<RecipesViewProps> = ({ recipes, onAddRecipeClick, onSelectRecipe }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const filteredRecipes = recipes.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div>
      {/* Header */}
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

      <RecipeListTable recipes={filteredRecipes} onSelectRecipe={onSelectRecipe} />
      
      <RecipeFilterPanel 
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        onApply={() => {setIsFilterPanelOpen(false)}}
      />
    </div>
  );
};