import React from 'react';
import { DocumentTextIcon, CalculatorIcon, SparklesIcon, CurrencyDollarIcon, BuildingLibraryIcon, TruckIcon } from './Icons';

interface FilterBarProps {
    activeFilter: string;
    onFilterChange: (filter: string) => void;
}

// FIX: Add 'locked' property to filter objects to resolve TypeScript errors and enable/disable filters.
const filters = [
    { name: 'Recipes', count: 2, icon: <CalculatorIcon className="h-4 w-4 mr-1.5" />, locked: false },
    { name: 'Ingredients', count: 16, icon: <SparklesIcon className="h-4 w-4 mr-1.5" />, locked: false },
    { name: 'Menus', count: 2, icon: <DocumentTextIcon className="h-4 w-4 mr-1.5" />, locked: false },
    { name: 'Recipe Books', count: 2, icon: <BuildingLibraryIcon className="h-4 w-4 mr-1.5" />, locked: false },
    { name: 'Docs', count: 4, icon: <DocumentTextIcon className="h-4 w-4 mr-1.5" />, locked: false },
    { name: 'New Purchase Items', count: 2, icon: <CurrencyDollarIcon className="h-4 w-4 mr-1.5" />, locked: false },
    { name: 'Vendors', count: 3, icon: <TruckIcon className="h-4 w-4 mr-1.5" />, locked: false },
];

export const FilterBar: React.FC<FilterBarProps> = ({ activeFilter, onFilterChange }) => (
    <div className="overflow-x-auto whitespace-nowrap py-1 -my-1">
        <div className="flex items-center space-x-2">
            {filters.map(filter => (
                <button
                    key={filter.name}
                    onClick={() => onFilterChange(filter.name)}
                    disabled={filter.locked}
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors duration-150 flex-shrink-0 ${
                        activeFilter === filter.name
                            ? 'bg-[#FF6B6B] text-black font-semibold' 
                            : 'bg-[#2C2C2C] text-gray-300 hover:bg-[#444444]'
                    } ${filter.locked ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                    {filter.icon}
                    <span>{filter.name}</span>
                    {filter.count !== null && <span className="ml-1.5 rounded-full bg-black/20 px-1.5 text-xs font-semibold text-white">{filter.count}</span>}
                    {filter.locked && <span className="ml-1.5">🔒</span>}
                </button>
            ))}
        </div>
    </div>
);