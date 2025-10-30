import React, { useState, useMemo, useEffect } from 'react';
// FIX: Corrected import path for Ingredient type.
import { Ingredient } from '../types';
// FIX: Corrected import path for Icons.
import { PlusIcon, AdjustmentsHorizontalIcon, MagnifyingGlassIcon, ArrowUpIcon, ArrowDownIcon, ArrowRightIcon } from './Icons';
import { IngredientFilterPanel, FilterState } from './IngredientFilterPanel';
// FIX: Corrected import path for data.
import { vendors as mockVendors } from '../data';

interface IngredientsViewProps {
  ingredients: Ingredient[];
  onAddIngredientClick: () => void;
}

const PriceTrend: React.FC<{ trend?: number }> = ({ trend = 0 }) => {
  const isUp = trend > 0;
  const isDown = trend < 0;
  const color = isUp ? 'text-red-600' : isDown ? 'text-green-600' : 'text-gray-500';
  const Icon = isUp ? ArrowUpIcon : isDown ? ArrowDownIcon : ArrowRightIcon;
  
  return (
    <span className={`flex items-center text-sm font-semibold ${color}`}>
      <Icon className="h-4 w-4 mr-1" />
      {Math.abs(trend * 100).toFixed(0)}%
    </span>
  );
};

const StatusDot: React.FC<{ trend?: number }> = ({ trend = 0 }) => {
  if (trend > 0.1) return <div className="h-2.5 w-2.5 bg-red-500 rounded-full" title="Significant price increase"></div>;
  if (trend < 0) return <div className="h-2.5 w-2.5 bg-green-500 rounded-full" title="Price decreased"></div>;
  return null;
};

const IngredientCard: React.FC<{ ingredient: Ingredient }> = ({ ingredient }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md transition-shadow duration-200 cursor-pointer">
    <div>
        <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg text-gray-800 pr-2">{ingredient.name}</h3>
            <StatusDot trend={ingredient.priceTrend} />
        </div>
        <p className="text-2xl font-bold text-gray-900 mt-1">
            ${ingredient.cost?.toFixed(2)}
            <span className="text-sm font-normal text-gray-500">/{ingredient.unit}</span>
        </p>
        <div className="flex items-center mt-2">
            <PriceTrend trend={ingredient.priceTrend} />
        </div>
    </div>
    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500">
        <span>Supplier: <strong>{ingredient.supplier}</strong></span>
        <span>Used in: <strong>{ingredient.usedInRecipes} recipes</strong></span>
    </div>
  </div>
);

const initialFilterState: FilterState = {
    sortBy: 'smart',
    categories: [],
    suppliers: [],
    priceChange: 'all'
};

export const IngredientsView: React.FC<IngredientsViewProps> = ({ ingredients, onAddIngredientClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>(initialFilterState);

  const sortedAndFilteredIngredients = useMemo(() => {
    let filtered = [...ingredients];

    // 1. Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(ing => 
          ing.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // 2. Filter by categories
    if (activeFilters.categories.length > 0) {
        filtered = filtered.filter(ing => activeFilters.categories.includes(ing.category));
    }
    
    // 3. Filter by suppliers
    if (activeFilters.suppliers.length > 0) {
        filtered = filtered.filter(ing => ing.supplier && activeFilters.suppliers.includes(ing.supplier));
    }

    // 4. Filter by price change
    if (activeFilters.priceChange === 'increased') {
        filtered = filtered.filter(ing => (ing.priceTrend || 0) > 0);
    } else if (activeFilters.priceChange === 'decreased') {
        filtered = filtered.filter(ing => (ing.priceTrend || 0) < 0);
    }


    // 5. Apply sorting
    return filtered.sort((a, b) => {
        switch(activeFilters.sortBy) {
            case 'smart':
                const costA = a.cost || 0;
                const costB = b.cost || 0;
                if (costB > costA) return 1;
                if (costA > costB) return -1;
                const trendA = Math.abs(a.priceTrend || 0);
                const trendB = Math.abs(b.priceTrend || 0);
                if (trendB > trendA) return 1;
                if (trendA > trendB) return -1;
                return a.name.localeCompare(b.name);
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
  }, [ingredients, searchTerm, activeFilters]);
  
  const highCostItemsCount = useMemo(() => ingredients.filter(i => (i.priceTrend || 0) > 0).length, [ingredients]);

  const handleApplyFilters = (newFilters: FilterState) => {
    setActiveFilters(newFilters);
    setIsFilterPanelOpen(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4 gap-4">
        <div className="relative flex-grow">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="search"
            placeholder="Find ingredients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={() => setIsFilterPanelOpen(true)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-md">
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onAddIngredientClick}
            className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            <PlusIcon className="-ml-0.5 h-5 w-5" />
            Add
          </button>
        </div>
      </div>

      {/* AI Insights Banner */}
      {isBannerVisible && highCostItemsCount > 0 && (
        <div className="relative bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm mb-4 flex justify-between items-center">
          <p>
            <span className="font-bold mr-2">🎯 AI Insight:</span> 
            {highCostItemsCount} ingredients are costing more than usual. They are prioritized in "Smart Sort".
          </p>
          <button onClick={() => setIsBannerVisible(false)} className="text-blue-600 hover:text-blue-800">&times;</button>
        </div>
      )}

      {/* Grid of Ingredient Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedAndFilteredIngredients.map(ing => (
          <IngredientCard key={ing.id} ingredient={ing} />
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
