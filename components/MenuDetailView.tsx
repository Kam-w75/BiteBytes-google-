import React, { useMemo } from 'react';
import { Menu, Recipe, Ingredient } from '../types';
import { 
    ArrowLeftIcon, 
    PencilIcon, 
    ArrowUpOnSquareIcon,
    PlusIcon
} from './Icons';

interface MenuDetailViewProps {
  menu: Menu;
  recipes: Recipe[];
  allIngredients: Ingredient[];
  onBack: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
}

const MetricCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <div className="bg-[#2C2C2C] p-4 rounded-lg shadow-sm border border-[#444444]">
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <p className="mt-1 text-2xl font-bold text-gray-100">{value}</p>
    </div>
);

export const MenuDetailView: React.FC<MenuDetailViewProps> = ({ menu, recipes, allIngredients, onBack, onSelectRecipe }) => {

    const ingredientsMap = useMemo(() => 
        new Map(allIngredients.map(i => [i.id, i])), 
        [allIngredients]
    );

    const getRecipeCostPerServing = (recipe: Recipe) => {
        const totalCost = recipe.ingredients.reduce((acc, ing) => {
            const masterIngredient = ingredientsMap.get(ing.id);
            const cost = masterIngredient ? masterIngredient.cost : 0;
            return acc + (cost * ing.quantity);
        }, 0);
        return recipe.servings > 0 ? totalCost / recipe.servings : 0;
    };

    const menuRecipes = useMemo(() => {
        return menu.recipeIds.map(id => recipes.find(r => r.id === id)).filter((r): r is Recipe => !!r);
    }, [menu, recipes]);

    const metrics = useMemo(() => {
        if (menuRecipes.length === 0) {
            return {
                totalCost: 0,
                avgMenuPrice: 0,
                avgFoodCostPercent: 0,
            };
        }

        const totalCostOfServings = menuRecipes.reduce((acc, recipe) => {
            return acc + getRecipeCostPerServing(recipe); 
        }, 0);

        const totalMenuPrice = menuRecipes.reduce((acc, recipe) => acc + recipe.menuPrice, 0);
        const avgMenuPrice = totalMenuPrice > 0 ? totalMenuPrice / menuRecipes.length : 0;

        const avgFoodCostPercent = totalMenuPrice > 0 ? (totalCostOfServings / totalMenuPrice) * 100 : 0;

        return {
            totalCost: totalCostOfServings,
            avgMenuPrice,
            avgFoodCostPercent,
        };
    }, [menuRecipes, ingredientsMap]);


    return (
        <div className="bg-[#1E1E1E]">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-[#1E1E1E]/80 backdrop-blur-sm border-b border-[#444444] px-4 py-3 sm:px-6">
                <div className="flex items-center justify-between">
                <div className="flex items-center min-w-0">
                    <button onClick={onBack} className="mr-3 p-1 rounded-full text-gray-400 hover:bg-gray-700 flex-shrink-0">
                    <ArrowLeftIcon className="h-5 w-5" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-100 truncate" title={menu.name}>{menu.name}</h1>
                </div>
                <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:bg-gray-700 rounded-md">
                    <ArrowUpOnSquareIcon className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:bg-gray-700 rounded-md">
                    <PencilIcon className="h-5 w-5" />
                    </button>
                </div>
                </div>
            </header>
            
            <main className="p-6 max-w-5xl mx-auto space-y-6">
                {/* Metrics */}
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MetricCard title="Total Menu Cost" value={`$${metrics.totalCost.toFixed(2)}`} />
                    <MetricCard title="Avg. Food Cost %" value={`${metrics.avgFoodCostPercent.toFixed(1)}%`} />
                    <MetricCard title="# of Recipes" value={menuRecipes.length.toString()} />
                    <MetricCard title="Avg. Menu Price" value={`$${metrics.avgMenuPrice.toFixed(2)}`} />
                </div>

                {/* Recipes Table */}
                <div className="bg-[#2C2C2C] border border-[#444444] rounded-lg">
                    <div className="p-4 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-200">Recipes on this Menu</h3>
                         <button className="inline-flex items-center gap-x-1.5 rounded-md bg-[#FF6B6B] px-3 py-2 text-sm font-semibold text-black shadow-sm hover:bg-[#E85A5A]">
                            <PlusIcon className="-ml-0.5 h-5 w-5" /> Add Recipe
                        </button>
                    </div>
                     <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-[#444444]">
                            <thead className="bg-[#1E1E1E]">
                            <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-300 sm:pl-6">Recipe</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-300">Cost/Serving</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-300">Menu Price</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-300">Food Cost %</th>
                                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">View</span></th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-[#444444] bg-[#2C2C2C]">
                            {menuRecipes.map((recipe) => {
                                const costPerServing = getRecipeCostPerServing(recipe);
                                const foodCostPercent = recipe.menuPrice > 0 ? (costPerServing / recipe.menuPrice) * 100 : 0;
                                
                                return (
                                <tr key={recipe.id} className="hover:bg-[#444444] cursor-pointer" onClick={() => onSelectRecipe(recipe)}>
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-100 sm:pl-6">{recipe.name}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-400">${costPerServing.toFixed(2)}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-400">${recipe.menuPrice.toFixed(2)}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-400">{foodCostPercent.toFixed(1)}%</td>
                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                    <span className="text-[#FF6B6B] hover:text-[#E85A5A]">View</span>
                                    </td>
                                </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};