import React, { useState, useMemo } from 'react';
import { Recipe, RecipeIngredient, Ingredient } from '../types';
import { ArrowLeftIcon, PlusIcon, TrashIcon, CpuChipIcon, PhotoIcon, ArrowPathIcon } from './Icons';

interface AddRecipeViewProps {
    onBack: () => void;
    onSave: (recipe: Recipe) => void;
    allIngredients: Ingredient[];
    recipeToEdit?: Recipe | null;
}

const emptyRecipe: Omit<Recipe, 'id'> = {
    name: '',
    servings: 1,
    menuPrice: 0,
    laborTimeMinutes: 0,
    ingredients: [],
    instructions: '',
};

export const AddRecipeView: React.FC<AddRecipeViewProps> = ({ onBack, onSave, allIngredients, recipeToEdit }) => {
    const [recipe, setRecipe] = useState(recipeToEdit || { ...emptyRecipe, id: `new-${Date.now()}` });
    const [ingredientSearch, setIngredientSearch] = useState('');

    const handleRecipeChange = (field: keyof Recipe, value: any) => {
        setRecipe(prev => ({ ...prev, [field]: value }));
    };

    const handleIngredientChange = (index: number, field: keyof RecipeIngredient, value: any) => {
        const newIngredients = [...recipe.ingredients];
        (newIngredients[index] as any)[field] = value;
        handleRecipeChange('ingredients', newIngredients);
    };

    const handleAddIngredient = (ingredient: Ingredient) => {
        const newRecipeIngredient: RecipeIngredient = {
            id: ingredient.id,
            name: ingredient.name,
            quantity: 1,
            unit: ingredient.unit,
        };
        handleRecipeChange('ingredients', [...recipe.ingredients, newRecipeIngredient]);
        setIngredientSearch('');
    };

    const handleRemoveIngredient = (index: number) => {
        const newIngredients = recipe.ingredients.filter((_, i) => i !== index);
        handleRecipeChange('ingredients', newIngredients);
    };

    const filteredIngredients = useMemo(() => {
        if (!ingredientSearch) return [];
        return allIngredients
            .filter(ing => ing.name.toLowerCase().includes(ingredientSearch.toLowerCase()))
            .filter(ing => !recipe.ingredients.some(ri => ri.id === ing.id)) // Exclude already added ingredients
            .slice(0, 5);
    }, [ingredientSearch, allIngredients, recipe.ingredients]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(recipe);
    };

    return (
        <div>
            <header className="flex items-center mb-6">
                <button onClick={onBack} className="mr-3 p-1 rounded-full text-gray-400 hover:bg-gray-700">
                    <ArrowLeftIcon className="h-5 w-5" />
                </button>
                <h1 className="text-2xl font-bold text-gray-100">{recipeToEdit ? 'Edit Recipe' : 'Add New Recipe'}</h1>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
                {/* Basic Info */}
                <div className="bg-[#2C2C2C] p-6 rounded-lg shadow-sm border border-[#444444]">
                    <h2 className="text-lg font-semibold text-gray-200 mb-4">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300">Recipe Name</label>
                            <input type="text" id="name" value={recipe.name} onChange={e => handleRecipeChange('name', e.target.value)} required className="mt-1 w-full bg-transparent border-[#444444] rounded-md" />
                        </div>
                        <div className="w-48 h-32 bg-gray-800 rounded-lg flex items-center justify-center row-span-3">
                            <PhotoIcon className="w-10 h-10 text-gray-600" />
                        </div>
                        <div>
                            <label htmlFor="servings" className="block text-sm font-medium text-gray-300">Servings</label>
                            <input type="number" id="servings" value={recipe.servings} onChange={e => handleRecipeChange('servings', parseFloat(e.target.value))} required className="mt-1 w-full bg-transparent border-[#444444] rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="menuPrice" className="block text-sm font-medium text-gray-300">Menu Price</label>
                            <input type="number" step="0.01" id="menuPrice" value={recipe.menuPrice} onChange={e => handleRecipeChange('menuPrice', parseFloat(e.target.value))} required className="mt-1 w-full bg-transparent border-[#444444] rounded-md" />
                        </div>
                    </div>
                </div>

                {/* Ingredients */}
                <div className="bg-[#2C2C2C] p-6 rounded-lg shadow-sm border border-[#444444]">
                    <h2 className="text-lg font-semibold text-gray-200 mb-4">Ingredients</h2>
                    <div className="space-y-3">
                        {recipe.ingredients.map((ing, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <span className="flex-grow font-medium text-gray-100">{ing.name}</span>
                                <input type="number" value={ing.quantity} onChange={e => handleIngredientChange(index, 'quantity', parseFloat(e.target.value))} className="w-20 bg-transparent border-[#444444] rounded-md" />
                                <input type="text" value={ing.unit} onChange={e => handleIngredientChange(index, 'unit', e.target.value)} className="w-24 bg-transparent border-[#444444] rounded-md" />
                                <button type="button" onClick={() => handleRemoveIngredient(index)} className="p-1 text-red-400 hover:bg-red-900/50 rounded-full"><TrashIcon className="w-4 h-4" /></button>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 relative">
                        <input type="text" placeholder="Search for an ingredient to add..." value={ingredientSearch} onChange={e => setIngredientSearch(e.target.value)} className="w-full bg-transparent border-[#444444] rounded-md" />
                        {filteredIngredients.length > 0 && (
                            <ul className="absolute z-10 w-full mt-1 bg-[#444444] border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                                {filteredIngredients.map(ing => (
                                    <li key={ing.id} onClick={() => handleAddIngredient(ing)} className="p-2 hover:bg-gray-700 cursor-pointer">{ing.name}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-[#2C2C2C] p-6 rounded-lg shadow-sm border border-[#444444]">
                     <h2 className="text-lg font-semibold text-gray-200 mb-4">Instructions</h2>
                     <textarea rows={6} value={recipe.instructions} onChange={e => handleRecipeChange('instructions', e.target.value)} className="w-full bg-transparent border-[#444444] rounded-md" />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <button type="button" onClick={onBack} className="px-5 py-2 text-sm font-semibold text-gray-300 bg-transparent border border-[#444444] rounded-md hover:bg-[#444444]">Cancel</button>
                    <button type="submit" className="px-5 py-2 text-sm font-semibold text-black bg-[#FF6B6B] rounded-md shadow-sm hover:bg-[#E85A5A]">Save Recipe</button>
                </div>
            </form>
        </div>
    );
};
