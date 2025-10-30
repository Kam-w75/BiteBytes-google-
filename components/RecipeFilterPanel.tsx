
import React, { useState } from 'react';
import { XMarkIcon } from './Icons';

export interface RecipeFilterState {
    sortBy: string;
    foodCost: string;
}

interface RecipeFilterPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: RecipeFilterState) => void;
}

export const RecipeFilterPanel: React.FC<RecipeFilterPanelProps> = ({ isOpen, onClose, onApply }) => {
    const [filters, setFilters] = useState<RecipeFilterState>({
        sortBy: 'name',
        foodCost: 'all',
    });

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" onClick={onClose}></div>
            <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-xl z-50 flex flex-col">
                <header className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Filter Recipes</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-100">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </header>
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Filters content here */}
                     <fieldset>
                        <legend className="text-sm font-semibold text-gray-600 mb-2">Sort By</legend>
                        <div className="space-y-2">
                           {['name', 'food_cost', 'profitability'].map(sort => (
                                <label key={sort} className="flex items-center">
                                    <input type="radio" name="sort" value={sort} checked={filters.sortBy === sort} onChange={(e) => setFilters(f => ({...f, sortBy: e.target.value}))} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                                    <span className="ml-3 text-sm text-gray-700 capitalize">{sort.replace('_', ' ')}</span>
                                </label>
                           ))}
                        </div>
                    </fieldset>
                     <fieldset>
                        <legend className="text-sm font-semibold text-gray-600 mb-2">Food Cost</legend>
                        <div className="space-y-2">
                           {['all', 'over_30', 'under_30'].map(cost => (
                                <label key={cost} className="flex items-center">
                                    <input type="radio" name="foodCost" value={cost} checked={filters.foodCost === cost} onChange={(e) => setFilters(f => ({...f, foodCost: e.target.value}))} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                                    <span className="ml-3 text-sm text-gray-700 capitalize">{cost.replace('_', ' ')}</span>
                                </label>
                           ))}
                        </div>
                    </fieldset>
                </div>
                <footer className="p-4 border-t border-gray-200 bg-white">
                    <button onClick={() => onApply(filters)} className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700">
                        Apply Filters
                    </button>
                </footer>
            </div>
        </>
    );
};
