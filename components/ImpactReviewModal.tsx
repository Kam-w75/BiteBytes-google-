import React, { useMemo } from 'react';
import { PriceChangeEntry, Recipe, Ingredient, PriceChangeItem } from '../types';
import { XMarkIcon, ArrowUpIcon, ArrowDownIcon } from './Icons';

interface ImpactReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    entry: PriceChangeEntry;
    allRecipes: Recipe[];
    allIngredients: Ingredient[];
}

interface AffectedRecipe {
    id: string;
    name: string;
    oldCostPerServing: number;
    newCostPerServing: number;
    costChange: number;
    oldFoodCostPercent: number;
    newFoodCostPercent: number;
}

const CostChange: React.FC<{ change: number }> = ({ change }) => {
    if (change === 0) {
        return <span className="text-gray-400">$0.00</span>;
    }
    const isIncrease = change > 0;
    const color = isIncrease ? 'text-red-400' : 'text-green-400';
    const Icon = isIncrease ? ArrowUpIcon : ArrowDownIcon;
    return (
        <span className={`flex items-center font-semibold ${color}`}>
            <Icon className="w-4 h-4 mr-1" />
            ${Math.abs(change).toFixed(2)}
        </span>
    );
};

export const ImpactReviewModal: React.FC<ImpactReviewModalProps> = ({ isOpen, onClose, entry, allRecipes, allIngredients }) => {
    
    const affectedRecipesData = useMemo((): AffectedRecipe[] => {
        if (!entry) return [];
        
        const priceChangesMap = new Map(entry.items.map(item => [item.ingredientName, item]));
        const changedIngredientNames = new Set(entry.items.map(item => item.ingredientName));
        
        const affectedRecipes = allRecipes.filter(recipe => 
            recipe.ingredients.some(ing => changedIngredientNames.has(ing.name))
        );

        return affectedRecipes.map(recipe => {
            const calculateCost = (priceSource: 'oldPrice' | 'newPrice'): number => {
                return recipe.ingredients.reduce((total, ing) => {
                    const priceChange = priceChangesMap.get(ing.name);
                    const cost = priceChange ? priceChange[priceSource] : allIngredients.find(master => master.id === ing.id)?.cost || 0;
                    return total + (cost * ing.quantity);
                }, 0);
            };

            const oldTotalCost = calculateCost('oldPrice');
            const newTotalCost = calculateCost('newPrice');

            const oldCostPerServing = recipe.servings > 0 ? oldTotalCost / recipe.servings : 0;
            const newCostPerServing = recipe.servings > 0 ? newTotalCost / recipe.servings : 0;
            const costChange = newCostPerServing - oldCostPerServing;
            
            const oldFoodCostPercent = recipe.menuPrice > 0 ? (oldCostPerServing / recipe.menuPrice) * 100 : 0;
            const newFoodCostPercent = recipe.menuPrice > 0 ? (newCostPerServing / recipe.menuPrice) * 100 : 0;

            return {
                id: recipe.id,
                name: recipe.name,
                oldCostPerServing,
                newCostPerServing,
                costChange,
                oldFoodCostPercent,
                newFoodCostPercent
            };
        });

    }, [entry, allRecipes, allIngredients]);

    if (!isOpen || !entry) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-[#2C2C2C] rounded-lg shadow-xl w-full max-w-2xl relative border border-[#444444] flex flex-col max-h-[90vh]">
                <header className="p-4 border-b border-[#444444] flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-100">Impact Analysis</h2>
                    <p className="text-sm text-gray-400">Price changes from <span className="font-semibold">{entry.supplier}</span> on <span className="font-semibold">{entry.date}</span></p>
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </header>
                
                <div className="p-4 overflow-y-auto">
                    <h3 className="text-lg font-semibold text-gray-200 mb-2">Affected Recipes ({affectedRecipesData.length})</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="text-left text-gray-400">
                                <tr className="border-b border-gray-700">
                                    <th className="p-2 font-semibold">Recipe</th>
                                    <th className="p-2 font-semibold">Old Cost</th>
                                    <th className="p-2 font-semibold">New Cost</th>
                                    <th className="p-2 font-semibold">Change</th>
                                    <th className="p-2 font-semibold">New FC%</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {affectedRecipesData.map(recipe => (
                                    <tr key={recipe.id} className="hover:bg-[#444444]">
                                        <td className="p-2 font-medium text-gray-100">{recipe.name}</td>
                                        <td className="p-2 text-gray-400">${recipe.oldCostPerServing.toFixed(2)}</td>
                                        <td className="p-2 font-semibold text-gray-200">${recipe.newCostPerServing.toFixed(2)}</td>
                                        <td className="p-2"><CostChange change={recipe.costChange} /></td>
                                        <td className="p-2 text-gray-300">{recipe.newFoodCostPercent.toFixed(1)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {affectedRecipesData.length === 0 && (
                            <p className="text-center py-8 text-gray-500">No recipes were affected by this price change.</p>
                        )}
                    </div>
                </div>

                <footer className="p-4 border-t border-[#444444] flex-shrink-0 flex justify-end">
                     <button 
                        onClick={onClose} 
                        className="px-4 py-2 text-sm font-semibold text-black bg-[#FF6B6B] border border-transparent rounded-md shadow-sm hover:bg-[#E85A5A]">
                        Close
                    </button>
                </footer>
            </div>
        </div>
    );
};
