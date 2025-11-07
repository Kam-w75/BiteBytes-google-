import React, { useState, useMemo, useEffect } from 'react';
import { Ingredient, Recipe, TargetCosts } from '../types';
import { PlusIcon, AdjustmentsHorizontalIcon, MagnifyingGlassIcon, ArrowUpIcon, ArrowDownIcon, ArrowRightIcon } from './Icons';
import { IngredientFilterPanel, FilterState } from './IngredientFilterPanel';
import { vendors as mockVendors } from '../data';

interface IngredientsViewProps {
  ingredients: Ingredient[];
  recipes: Recipe[];
  allIngredients: Ingredient[];
  targetCosts: TargetCosts;
  onAddIngredientClick: () => void;
  onSelectIngredient: (ingredient: Ingredient) => void;
}

const PriceTrend: React.FC<{ trend?: number }> = ({ trend = 0 }) => {
  const isUp = trend > 0;
  const isDown = trend < 0;
  const color = isUp ? 'text-red-400' : isDown ? 'text-green-400' : 'text-gray-500';
  const Icon = isUp ? ArrowUpIcon : isDown ? ArrowDownIcon : ArrowRightIcon;
  
  return (
    <span className={`flex items-center text-sm font-semibold ${color}`}>
      <Icon className="h-4 w-4 mr-1" />
      {Math.abs(trend * 100).toFixed(0)}%
    </span>
  );
};

interface IngredientCardProps {
    ingredient: Ingredient;
    isProblem: boolean;
    onSelect: (ingredient: Ingredient) => void;
}

const IngredientCard: React.FC<IngredientCardProps> = ({ ingredient, isProblem, onSelect }) => {
  const vendor = mockVendors.find(v => v.id === ingredient.vendorId);
  const statusColor = (ingredient.priceTrend || 0) > 0.1 ? 'bg-red-500' : (ingredient.priceTrend || 0) < 0 ? 'bg-green-500' : null;
  
  return (
    <div 
        onClick={() => onSelect(ingredient)} 
        className={`bg-[#2C2C2C] rounded-lg shadow-sm border border-[#444444] flex flex-col justify-between hover:shadow-lg hover:border-gray-600 transition-all duration-200 cursor-pointer
        border-t-4 ${isProblem ? 'border-t-red-500' : 'border-t-transparent'}`}
    >
      <div>
          <div className="flex justify-between items-start p-4 pb-0">
              <h3 className="font-bold text-lg text-gray-100 pr-2">{ingredient.name}</h3>
              {statusColor && <div className={`h-2.5 w-2.5 ${statusColor} rounded-full`} title={ (ingredient.priceTrend || 0) > 0.1 ? "Significant price increase" : "Price decreased" }></div>}
          </div>
          <div className="p-4 pt-1">
            <p className="text-2xl font-bold text-gray-100">
                ${ingredient.cost?.toFixed(2)}
                <span className="text-sm font-normal text-gray-400">/{ingredient.unit}</span>
            </p>
            <div className="flex items-center mt-2">
                <PriceTrend trend={ingredient.priceTrend} />
            </div>
          </div>
      </div>
      <div className="mt-4 p-4 border-t border-gray-700 flex justify-between text-xs text-gray-500">
          <span>Supplier: <strong className="text-gray-400">{vendor?.name || 'N/A'}</strong></span>
          <span>Used in: <strong className="text-gray-400">{ingredient.usedInRecipes} recipes</strong></span>
      </div>
    </div>
  );
};

const initialFilterState: FilterState = {
    sortBy: 'smart',
    categories: [],
    suppliers: [],
    priceChange: 'all'
};

export const IngredientsView: React.FC<IngredientsViewProps> = ({ ingredients, recipes, allIngredients, targetCosts, onAddIngredientClick, onSelectIngredient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>(initialFilterState);

  const ingredientsMap = useMemo(() => new Map(allIngredients.map(i => [i.id, i])), [allIngredients]);

  const problemIngredientIds = useMemo(() => {
    const overTargetRecipes = recipes.filter(recipe => {
        const totalCost = recipe.ingredients.reduce((acc, ing) => acc + (ingredientsMap.get(ing.id)?.cost || 0) * ing.quantity, 0);
        const costPerServing = recipe.servings > 0 ? totalCost / recipe.servings : 0;
        const foodCostPercent = recipe.menuPrice > 0 ? (costPerServing / recipe.menuPrice) * 100 : 0;
        return foodCostPercent > targetCosts.overall;
    });

    const problemIds = new Set<string>();
    overTargetRecipes.forEach(recipe => {
        const totalCost = recipe.ingredients.reduce((acc, ing) => acc + (ingredientsMap.get(ing.id)?.cost || 0) * ing.quantity, 0);
        recipe.ingredients.forEach(ing => {
            const ingredientCost = (ingredientsMap.get(ing.id)?.cost || 0) * ing.quantity;
            // If an ingredient makes up more than 15% of the cost of an over-budget recipe, flag it.
            if (totalCost > 0 && (ingredientCost / totalCost) > 0.15) {
                problemIds.add(ing.id);
            }
        });
    });
    return problemIds;
  }, [recipes, ingredientsMap, targetCosts]);


  const sortedAndFilteredIngredients = useMemo(() => {
    let filtered = [...ingredients];

    if (searchTerm) {
      filtered = filtered.filter(ing => ing.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (activeFilters.categories.length > 0) {
        filtered = filtered.filter(ing => activeFilters.categories.includes(ing.category));
    }
    if (activeFilters.suppliers.length > 0) {
        const selectedVendorIds = mockVendors.filter(v => activeFilters.suppliers.includes(v.name)).map(v => v.id);
        filtered = filtered.filter(ing => ing.vendorId && selectedVendorIds.includes(ing.vendorId));
    }
    if (activeFilters.priceChange === 'increased') {
        filtered = filtered.filter(ing => (ing.priceTrend || 0) > 0);
    } else if (activeFilters.priceChange === 'decreased') {
        filtered = filtered.filter(ing => (ing.priceTrend || 0) < 0);
    }

    return filtered.sort((a, b) => {
        switch(activeFilters.sortBy) {
            case 'smart':
                const isAProblem = problemIngredientIds.has(a.id);
                const isBProblem = problemIngredientIds.has(b.id);
                if (isAProblem && !isBProblem) return -1;
                if (!isAProblem && isBProblem) return 1;
                return (b.cost || 0) - (a.cost || 0);
            case 'cost':
                return (b.cost || 0) - (a.cost || 0);
            case 'alpha':
                return a.name.localeCompare(b.name);
            case 'category':
                return a.category.localeCompare(b.category);
            default:
                return 0;
        }
    });
  }, [ingredients, searchTerm, activeFilters, problemIngredientIds]);
  
  const highCostItemsCount = useMemo(() => ingredients.filter(i => (i.priceTrend || 0) > 0).length, [ingredients]);

  const handleApplyFilters = (newFilters: FilterState) => {
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
            placeholder="Find ingredients..."
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
            onClick={onAddIngredientClick}
            className="inline-flex items-center gap-x-1.5 rounded-md bg-[#FF6B6B] px-3 py-2 text-sm font-semibold text-black shadow-sm hover:bg-[#E85A5A]"
          >
            <PlusIcon className="-ml-0.5 h-5 w-5" />
            Add
          </button>
        </div>
      </div>

      {isBannerVisible && highCostItemsCount > 0 && (
        <div className="relative bg-coral-500/10 border border-[#FF6B6B]/20 text-coral-200 px-4 py-3 rounded-lg text-sm mb-4 flex justify-between items-center">
          <p className="text-[#FFC2C2]">
            <span className="font-bold mr-2">🎯 AI Insight:</span> 
            {problemIngredientIds.size} ingredients are driving costs over your target. They are prioritized in "Smart Sort".
          </p>
          <button onClick={() => setIsBannerVisible(false)} className="text-[#FFC2C2] hover:text-white">&times;</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedAndFilteredIngredients.map(ing => (
          <IngredientCard key={ing.id} ingredient={ing} isProblem={problemIngredientIds.has(ing.id)} onSelect={onSelectIngredient} />
        ))}
        {sortedAndFilteredIngredients.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
                <p className="font-semibold">No ingredients match your filters.</p>
                <p className="text-sm">Try adjusting your search or filter settings.</p>
            </div>
        )}
      </div>

      <IngredientFilterPanel 
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        onApply={handleApplyFilters}
        currentFilters={activeFilters}
        allSuppliers={mockVendors.map(v => v.name)}
      />
    </div>
  );
};