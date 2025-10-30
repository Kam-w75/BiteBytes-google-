import React, { useState, useEffect } from 'react';
// FIX: Corrected import path for Ingredient type.
import { Ingredient } from '../types';
// FIX: Corrected import path for Icons.
import { XMarkIcon, MeatIcon, ProduceIcon, DairyIcon, DryGoodsIcon, SpicesIcon, CannedIcon, BeveragesIcon, OtherIcon, TruckIcon } from './Icons';

type SortByType = 'smart' | 'cost' | 'alpha' | 'category';
type PriceChangeType = 'all' | 'increased' | 'decreased';
type CategoryType = Ingredient['category'];

export interface FilterState {
    sortBy: SortByType;
    categories: CategoryType[];
    suppliers: string[];
    priceChange: PriceChangeType;
}

interface IngredientFilterPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: FilterState) => void;
    currentFilters: FilterState;
    allSuppliers: string[];
}

const categories: { name: CategoryType, icon: React.ReactNode }[] = [
    { name: 'Meat', icon: <MeatIcon className="w-5 h-5" /> },
    { name: 'Produce', icon: <ProduceIcon className="w-5 h-5" /> },
    { name: 'Dairy', icon: <DairyIcon className="w-5 h-5" /> },
    { name: 'Dry Goods', icon: <DryGoodsIcon className="w-5 h-5" /> },
    { name: 'Spices', icon: <SpicesIcon className="w-5 h-5" /> },
    { name: 'Canned', icon: <CannedIcon className="w-5 h-5" /> },
    { name: 'Beverages', icon: <BeveragesIcon className="w-5 h-5" /> },
    { name: 'Other', icon: <OtherIcon className="w-5 h-5" /> },
];

export const IngredientFilterPanel: React.FC<IngredientFilterPanelProps> = ({ isOpen, onClose, onApply, currentFilters, allSuppliers }) => {
    const [filters, setFilters] = useState<FilterState>(currentFilters);

    useEffect(() => {
        setFilters(currentFilters);
    }, [currentFilters, isOpen]);

    const handleClear = () => {
        setFilters({ sortBy: 'smart', categories: [], suppliers: [], priceChange: 'all' });
    };

    const handleCategoryChange = (category: CategoryType) => {
        setFilters(prev => ({
            ...prev,
            categories: prev.categories.includes(category)
                ? prev.categories.filter(c => c !== category)
                : [...prev.categories, category]
        }));
    };
    
     const handleSupplierChange = (supplier: string) => {
        setFilters(prev => ({
            ...prev,
            suppliers: prev.suppliers.includes(supplier)
                ? prev.suppliers.filter(s => s !== supplier)
                : [...prev.suppliers, supplier]
        }));
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" onClick={onClose}></div>
            <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-xl z-50 flex flex-col transition-transform transform translate-x-0">
                {/* Header */}
                <header className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Filters & Sort</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-100">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Sort By */}
                    <fieldset>
                        <legend className="text-sm font-semibold text-gray-600 mb-2">Sort By</legend>
                        <div className="space-y-2">
                           {['smart', 'cost', 'alpha', 'category'].map(sort => (
                                <label key={sort} className="flex items-center">
                                    <input type="radio" name="sort" value={sort} checked={filters.sortBy === sort} onChange={(e) => setFilters(f => ({...f, sortBy: e.target.value as SortByType}))} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                                    <span className="ml-3 text-sm text-gray-700 capitalize">{sort === 'cost' ? 'Highest Cost' : sort.replace('_', ' ')}</span>
                                </label>
                           ))}
                        </div>
                    </fieldset>

                     {/* Categories */}
                    <fieldset>
                        <legend className="text-sm font-semibold text-gray-600 mb-2">Categories</legend>
                        <div className="space-y-2">
                           {categories.map(cat => (
                                <label key={cat.name} className="flex items-center">
                                    <input type="checkbox" checked={filters.categories.includes(cat.name)} onChange={() => handleCategoryChange(cat.name)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                    <span className="ml-3 text-sm text-gray-700 flex items-center">{cat.icon} <span className="ml-2">{cat.name}</span></span>
                                </label>
                           ))}
                        </div>
                    </fieldset>
                    
                    {/* Suppliers */}
                    <fieldset>
                        <legend className="text-sm font-semibold text-gray-600 mb-2">Suppliers</legend>
                         <div className="space-y-2">
                           {allSuppliers.map(sup => (
                                <label key={sup} className="flex items-center">
                                    <input type="checkbox" checked={filters.suppliers.includes(sup)} onChange={() => handleSupplierChange(sup)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                    <span className="ml-3 text-sm text-gray-700">{sup}</span>
                                </label>
                           ))}
                        </div>
                    </fieldset>
                    
                    {/* Price Changes */}
                    <fieldset>
                        <legend className="text-sm font-semibold text-gray-600 mb-2">Price Changes</legend>
                         <div className="space-y-2">
                           {['all', 'increased', 'decreased'].map(change => (
                                <label key={change} className="flex items-center">
                                    <input type="radio" name="priceChange" value={change} checked={filters.priceChange === change} onChange={(e) => setFilters(f => ({...f, priceChange: e.target.value as PriceChangeType}))} className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                                    <span className="ml-3 text-sm text-gray-700 capitalize">{change === 'all' ? 'Show All' : `Price ${change}`}</span>
                                </label>
                           ))}
                        </div>
                    </fieldset>
                </div>
                
                {/* Footer */}
                <footer className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex justify-between">
                        <button onClick={handleClear} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
                            Clear All
                        </button>
                        <button onClick={() => onApply(filters)} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700">
                            Apply
                        </button>
                    </div>
                </footer>
            </div>
        </>
    );
};
