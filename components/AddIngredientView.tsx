import React, { useState } from 'react';
import { Page } from '../App';
// FIX: Corrected import path for Vendor type.
import { Vendor } from '../types';
// FIX: Corrected import path for Icons.
import { ArrowLeftIcon, CameraIcon, MicrophoneIcon, CpuChipIcon, TagIcon } from './Icons';

interface AddIngredientViewProps {
  onBack: () => void;
  setCurrentPage: (page: Page) => void;
  vendors: Vendor[];
}

const mockSuggestions = [
    { name: 'Flour, All-Purpose', source: 'Sysco Catalog' },
    { name: 'Flour, Bread', source: 'Sysco Catalog' },
    { name: 'Flour, Whole Wheat', source: 'Common Ingredients' },
];

export const AddIngredientView: React.FC<AddIngredientViewProps> = ({ onBack, setCurrentPage, vendors }) => {
    const [name, setName] = useState('');
    const [suggestions, setSuggestions] = useState<typeof mockSuggestions>([]);
    const [showAiAssist, setShowAiAssist] = useState(false);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setName(value);
        if (value.toLowerCase().includes('flour')) {
            setSuggestions(mockSuggestions);
        } else {
            setSuggestions([]);
        }
        if(value.length > 3) {
            setShowAiAssist(true);
        } else {
            setShowAiAssist(false);
        }
    };
    
    const handleSuggestionClick = (suggestionName: string) => {
        setName(suggestionName);
        setSuggestions([]);
    }

    const formIsFilled = name.length > 0; // Simplified validation

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center mb-6">
                <button
                    onClick={onBack}
                    className="mr-4 p-2 rounded-full hover:bg-gray-100"
                    aria-label="Back to ingredients list"
                >
                    <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
                </button>
                <h2 className="text-xl font-bold text-gray-800">Add New Ingredient</h2>
            </div>

            {/* AI Quick Options */}
            <div className="mb-8">
                <h3 className="text-base font-semibold text-gray-600 mb-3">Tired of Typing?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                        onClick={() => setCurrentPage('invoices')}
                        className="flex items-center justify-center p-4 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
                    >
                        <CameraIcon className="h-6 w-6 mr-3" />
                        <span className="font-semibold">Scan Invoice Instead?</span>
                    </button>
                     <button className="flex items-center justify-center p-4 bg-white text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
                        <MicrophoneIcon className="h-6 w-6 mr-3" />
                        <span className="font-semibold">Tell Me About It</span>
                    </button>
                </div>
            </div>

            {/* Traditional Form */}
            <div className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
                <div>
                    <label htmlFor="ingredient-name" className="block text-sm font-medium text-gray-700 mb-1">
                        Start with a name to see suggestions
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            id="ingredient-name"
                            value={name}
                            onChange={handleNameChange}
                            placeholder="e.g., 'Flour, All-Purpose'"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                        {suggestions.length > 0 && (
                            <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                                {suggestions.map(s => (
                                    <li key={s.name} onClick={() => handleSuggestionClick(s.name)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                                        {s.name} <span className="text-xs text-gray-400">- {s.source}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* AI Assist Banner */}
                {showAiAssist && (
                     <div className="bg-gray-100 p-3 rounded-md flex items-start text-sm">
                        <CpuChipIcon className="h-5 w-5 mr-3 text-gray-500 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700">
                            I noticed you buy from <strong>Sysco</strong> - should I check their catalog for this ingredient? <a href="#" className="font-semibold text-blue-600 hover:underline">Yes, check now</a>
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                        <div className="relative mt-1">
                             <TagIcon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 h-5 w-5 text-gray-400" />
                             <select id="category" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 appearance-none">
                                <option>Dry Goods</option>
                                <option>Produce</option>
                                <option>Dairy & Cheese</option>
                                <option>Meat & Poultry</option>
                                <option>Seafood</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="unit" className="block text-sm font-medium text-gray-700">Unit of Measure</label>
                        <select id="unit" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                            <option>lb</option>
                            <option>kg</option>
                            <option>oz</option>
                            <option>g</option>
                            <option>each</option>
                            <option>pack</option>
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Current Price</label>
                        <div className="relative mt-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input type="number" id="price" placeholder="0.00" className="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="supplier" className="block text-sm font-medium text-gray-700">Supplier</label>
                        <select id="supplier" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                           <option>Select a supplier...</option>
                           {vendors.map(v => <option key={v.id}>{v.name}</option>)}
                           <option value="add_new">-- Add New Supplier --</option>
                        </select>
                    </div>
                </div>
                 <div>
                    <label htmlFor="package-size" className="block text-sm font-medium text-gray-700">Package Size (Optional)</label>
                    <input type="text" id="package-size" placeholder="e.g., 50 lb bag" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                </div>
            </div>

            {/* Action Button */}
            <div className="mt-8 flex justify-end">
                 <button
                    type="button"
                    onClick={onBack}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!formIsFilled}
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                >
                    Add Ingredient
                </button>
            </div>
        </div>
    );
};
