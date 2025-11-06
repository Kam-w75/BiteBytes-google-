import React, { useState } from 'react';
import { Ingredient, Vendor, IngredientCategory } from '../types';
import { ArrowLeftIcon, CpuChipIcon, ArrowPathIcon } from './Icons';
import { GoogleGenAI, Type } from "@google/genai";

interface AddIngredientViewProps {
    onBack: () => void;
    onSave: (ingredient: Partial<Ingredient>) => void;
    vendors: Vendor[];
    ingredientToEdit?: Ingredient | null;
    preselectedVendorId?: string | null;
}

const emptyIngredient: Omit<Ingredient, 'id' | 'usedInRecipes'> = {
    name: '',
    cost: 0,
    unit: '',
    vendorId: '',
    category: 'Other',
};

const allCategories: IngredientCategory[] = ['Meat', 'Produce', 'Dairy', 'Dry Goods', 'Spices', 'Canned', 'Beverages', 'Other'];

export const AddIngredientView: React.FC<AddIngredientViewProps> = ({ onBack, onSave, vendors, ingredientToEdit, preselectedVendorId }) => {
    const [ingredient, setIngredient] = useState(() => {
        if (ingredientToEdit) return ingredientToEdit;
        const newIngredient = { ...emptyIngredient };
        if (preselectedVendorId) {
            newIngredient.vendorId = preselectedVendorId;
        }
        return newIngredient;
    });
    const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
    const [suggestionError, setSuggestionError] = useState('');

    const handleChange = (field: keyof typeof ingredient, value: any) => {
        setIngredient(prev => ({ ...prev, [field]: value }));
    };

    const handleSuggestCategory = async () => {
        if (!ingredient.name) return;
        setIsLoadingSuggestion(true);
        setSuggestionError('');
        try {
            if (!process.env.API_KEY) throw new Error("API_KEY not set");
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const prompt = `Classify the food item "${ingredient.name}" into one of the following categories: ${allCategories.join(', ')}.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            category: { type: Type.STRING, enum: allCategories }
                        },
                        required: ["category"]
                    }
                }
            });
            const result = JSON.parse(response.text);
            if (result.category && allCategories.includes(result.category)) {
                handleChange('category', result.category);
            } else {
                setSuggestionError('AI returned an invalid category.');
            }
        } catch (e: any) {
            setSuggestionError('AI suggestion failed.');
            console.error(e);
        } finally {
            setIsLoadingSuggestion(false);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(ingredient);
    };

    return (
        <div>
            <header className="flex items-center mb-6">
                <button onClick={onBack} className="mr-3 p-1 rounded-full text-gray-400 hover:bg-gray-700">
                    <ArrowLeftIcon className="h-5 w-5" />
                </button>
                <h1 className="text-2xl font-bold text-gray-100">{ingredientToEdit ? 'Edit Ingredient' : 'Add New Ingredient'}</h1>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto bg-[#2C2C2C] p-8 rounded-lg shadow-sm border border-[#444444]">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300">Ingredient Name</label>
                    <input type="text" id="name" value={ingredient.name} onChange={e => handleChange('name', e.target.value)} required className="mt-1 w-full bg-transparent border-[#444444] rounded-md" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="cost" className="block text-sm font-medium text-gray-300">Cost</label>
                        <input type="number" step="0.01" id="cost" value={ingredient.cost} onChange={e => handleChange('cost', parseFloat(e.target.value))} required className="mt-1 w-full bg-transparent border-[#444444] rounded-md" />
                    </div>
                     <div>
                        <label htmlFor="unit" className="block text-sm font-medium text-gray-300">Unit</label>
                        <input type="text" id="unit" placeholder="e.g., lb, kg, each" value={ingredient.unit} onChange={e => handleChange('unit', e.target.value)} required className="mt-1 w-full bg-transparent border-[#444444] rounded-md" />
                    </div>
                </div>

                 <div>
                    <label htmlFor="vendor" className="block text-sm font-medium text-gray-300">Supplier</label>
                    <select 
                        id="vendor" 
                        value={ingredient.vendorId} 
                        onChange={e => handleChange('vendorId', e.target.value)} 
                        required 
                        disabled={!!preselectedVendorId}
                        className="mt-1 w-full bg-transparent border-[#444444] rounded-md disabled:bg-gray-700/50 disabled:cursor-not-allowed"
                    >
                        <option value="">Select a supplier</option>
                        {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                </div>
                
                 <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-300">Category</label>
                    <div className="flex gap-2 mt-1">
                        <select id="category" value={ingredient.category} onChange={e => handleChange('category', e.target.value)} required className="flex-grow bg-transparent border-[#444444] rounded-md">
                             {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <button type="button" onClick={handleSuggestCategory} disabled={isLoadingSuggestion || !ingredient.name} className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-black bg-[#FF6B6B] hover:bg-[#E85A5A] disabled:bg-gray-500">
                             {isLoadingSuggestion ? <ArrowPathIcon className="animate-spin h-4 w-4" /> : <CpuChipIcon className="h-4 w-4" />}
                             <span className="ml-2">Suggest</span>
                        </button>
                    </div>
                    {suggestionError && <p className="mt-1 text-xs text-red-400">{suggestionError}</p>}
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onBack} className="px-5 py-2 text-sm font-semibold text-gray-300 bg-transparent border border-[#444444] rounded-md hover:bg-[#444444]">Cancel</button>
                    <button type="submit" className="px-5 py-2 text-sm font-semibold text-black bg-[#FF6B6B] rounded-md shadow-sm hover:bg-[#E85A5A]">Save Ingredient</button>
                </div>
            </form>
        </div>
    );
};