import React, { useState, useMemo, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, Ingredient, TargetCosts } from '../types';
import { 
    ArrowLeftIcon, 
    PencilIcon, 
    ArrowUpOnSquareIcon, 
    CpuChipIcon, 
    ChevronDownIcon,
    ChevronUpIcon,
    PlusIcon,
    PhotoIcon,
    ArrowPathIcon
} from './Icons';

interface RecipeDetailViewProps {
  recipe: Recipe;
  allIngredients: Ingredient[];
  onBack: () => void;
  onEdit: (recipe: Recipe) => void;
  targetCosts: TargetCosts;
}

const MetricCard: React.FC<{ title: string; value: string; subValue?: string; trend?: string; trendColor?: string; valueColor?: string; }> = ({ title, value, subValue, trend, trendColor = 'text-gray-400', valueColor = 'text-gray-100' }) => (
    <div className="bg-[#2C2C2C] p-4 rounded-lg shadow-sm border border-[#444444]">
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <p className={`mt-1 text-2xl font-bold ${valueColor}`}>{value} {subValue && <span className="text-lg font-medium text-gray-400">{subValue}</span>}</p>
        {trend && <p className={`mt-1 text-xs font-medium ${trendColor}`}>{trend}</p>}
    </div>
);

const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="bg-[#2C2C2C] border border-[#444444] rounded-lg">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left"
            >
                <h3 className="text-lg font-semibold text-gray-200">{title}</h3>
                {isOpen ? <ChevronUpIcon className="h-5 w-5 text-gray-400" /> : <ChevronDownIcon className="h-5 w-5 text-gray-400" />}
            </button>
            {isOpen && (
                <div className="p-4 border-t border-[#444444]">
                    {children}
                </div>
            )}
        </div>
    );
};

export const RecipeDetailView: React.FC<RecipeDetailViewProps> = ({ recipe, allIngredients, onBack, onEdit, targetCosts }) => {
  const [targetFoodCost, setTargetFoodCost] = useState(targetCosts.overall);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setTargetFoodCost(targetCosts.overall);
  }, [targetCosts]);
  
  const ingredientsMap = useMemo(() => 
    new Map(allIngredients.map(i => [i.id, i])), 
    [allIngredients]
  );
  
  const recipeIngredientsWithLiveCost = useMemo(() => {
    return recipe.ingredients.map(ing => {
        const masterIngredient = ingredientsMap.get(ing.id);
        return {
            ...ing,
            cost: masterIngredient?.cost || 0,
            priceTrend: masterIngredient?.priceTrend || 0
        };
    });
  }, [recipe, ingredientsMap]);

  const {
      totalCost,
      costPerServing,
      foodCostPercent,
      profitPerServing,
      profitPercent,
  } = useMemo(() => {
    const totalCost = recipeIngredientsWithLiveCost.reduce((acc, ing) => acc + (ing.cost || 0) * ing.quantity, 0);
    const costPerServing = recipe.servings > 0 ? totalCost / recipe.servings : 0;
    const foodCostPercent = recipe.menuPrice > 0 ? (costPerServing / recipe.menuPrice) * 100 : 0;
    const profitPerServing = recipe.menuPrice - costPerServing;
    const profitPercent = recipe.menuPrice > 0 ? (profitPerServing / recipe.menuPrice) * 100 : 0;
    return { totalCost, costPerServing, foodCostPercent, profitPerServing, profitPercent };
  }, [recipe, recipeIngredientsWithLiveCost]);
  
  const targetCostPerServing = recipe.menuPrice * (targetFoodCost / 100);
  const costReductionNeeded = costPerServing - targetCostPerServing;

  const hasHighCostIngredient = recipeIngredientsWithLiveCost.some(ing => (ing.priceTrend || 0) > 0.1);
  
  const foodCostColor = foodCostPercent > targetCosts.overall ? 'text-red-400' : 'text-green-400';

  const getAiInsight = () => {
    if (foodCostPercent > targetCosts.overall) {
      return { 
        emoji: '🔴', 
        message: `This recipe is over your ${targetCosts.overall}% food cost target. Use the analyzer below to find savings.`
      };
    }
    if (hasHighCostIngredient) {
      const expensiveIngredient = recipeIngredientsWithLiveCost.find(ing => (ing.priceTrend || 0) > 0.1);
      return { 
        emoji: '⚠️', 
        message: `${expensiveIngredient?.name} price went up ${((expensiveIngredient?.priceTrend || 0) * 100).toFixed(0)}%. You might want to raise the menu price by $${(costPerServing * (expensiveIngredient?.priceTrend || 0)).toFixed(2)}.`
      };
    }
     if (foodCostPercent < targetCosts.overall - 10 && foodCostPercent > 0) {
      return { 
        emoji: '✅', 
        message: 'This is one of your most profitable items! Consider promoting it on your menu.'
      };
    }
    return {
        emoji: '💡',
        message: 'Recipe costs look good and prices are stable. No immediate actions needed.'
    };
  };
  
  const handleGetSuggestions = async () => {
    setIsGenerating(true);
    setAiSuggestions([]);
    try {
        if (!process.env.API_KEY) throw new Error("API key not set");
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const topIngredients = [...recipeIngredientsWithLiveCost]
            .sort((a, b) => (b.cost * b.quantity) - (a.cost * a.quantity))
            .slice(0, 3)
            .map(ing => ing.name)
            .join(', ');

        const prompt = `For a professional kitchen making a "${recipe.name}", suggest 3 specific, actionable cost-saving alternatives for these ingredients: ${topIngredients}. Focus on supplier negotiation points, alternative cuts/grades, or different but similar products. Keep each suggestion concise.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    },
                    required: ["suggestions"]
                }
            }
        });
        
        const result = JSON.parse(response.text);
        if (result.suggestions && Array.isArray(result.suggestions)) {
            setAiSuggestions(result.suggestions);
        }

    } catch (e) {
        console.error("AI suggestion failed", e);
        setAiSuggestions(["Sorry, I couldn't generate suggestions at this time."]);
    } finally {
        setIsGenerating(false);
    }
};

  const aiInsight = getAiInsight();

  return (
    <div className="bg-[#1E1E1E]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#1E1E1E]/80 backdrop-blur-sm border-b border-[#444444] px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0">
            <button onClick={onBack} className="mr-3 p-1 rounded-full text-gray-400 hover:bg-gray-700 flex-shrink-0">
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-100 truncate" title={recipe.name}>{recipe.name}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:bg-gray-700 rounded-md">
              <ArrowUpOnSquareIcon className="h-5 w-5" />
            </button>
            <button onClick={() => onEdit(recipe)} className="p-2 text-gray-400 hover:bg-gray-700 rounded-md">
              <PencilIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Hero */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-full md:w-1/3 h-48 bg-gray-800 rounded-lg flex items-center justify-center">
                 {recipe.imageUrl ? (
                    <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-full object-cover rounded-lg"/>
                 ) : (
                    <PhotoIcon className="w-12 h-12 text-gray-600" />
                 )}
            </div>
            <div className="flex-1">
                <p className="font-semibold text-gray-400">Serving size: Makes {recipe.servings} servings</p>
                <div className="grid grid-cols-2 gap-4 mt-3">
                    <MetricCard title="Food Cost %" value={`${foodCostPercent.toFixed(1)}%`} valueColor={foodCostColor}/>
                    <MetricCard title="Cost Per Serving" value={`$${costPerServing.toFixed(2)}`}/>
                    <MetricCard title="Menu Price" value={`$${recipe.menuPrice.toFixed(2)}`} />
                    <MetricCard title="Profit Per Serving" value={`$${profitPerServing.toFixed(2)}`} subValue={`(${profitPercent.toFixed(0)}%)`}/>
                </div>
            </div>
        </div>

        {/* AI Insight Card */}
        <div className="bg-[#2C2C2C] border border-[#444444] p-4 rounded-lg flex items-start">
            <CpuChipIcon className="h-6 w-6 text-[#FF6B6B] mr-4 flex-shrink-0 mt-1" />
            <div>
                <p className="font-semibold text-gray-200">
                    <span role="img" aria-label="insight" className="mr-2">{aiInsight.emoji}</span>
                    {aiInsight.message}
                </p>
            </div>
        </div>

        {/* Ingredients */}
        <div className="bg-[#2C2C2C] border border-[#444444] rounded-lg">
            <div className="p-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-200">What's in it</h3>
                <span className="text-sm font-medium text-gray-400">Total Cost: ${totalCost.toFixed(2)}</span>
            </div>
            <div className="overflow-x-auto">
                 <table className="w-full text-sm">
                    <thead className="bg-[#1E1E1E]">
                        <tr>
                            <th className="px-4 py-2 text-left font-semibold text-gray-400">Ingredient</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-400">Amount</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-400">Prep</th>
                            <th className="px-4 py-2 text-right font-semibold text-gray-400">Cost</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#444444]">
                        {recipeIngredientsWithLiveCost.map((ing, i) => (
                            <tr key={i} className="hover:bg-[#444444]">
                                <td className="px-4 py-2 font-medium text-gray-100">{ing.name}</td>
                                <td className="px-4 py-2 text-gray-300">{ing.quantity} {ing.unit}</td>
                                <td className="px-4 py-2 text-gray-300">{ing.prep || '-'}</td>
                                <td className="px-4 py-2 text-right text-gray-200">${((ing.cost || 0) * ing.quantity).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             <div className="p-2 border-t border-[#444444]">
                <button className="w-full flex items-center justify-center p-2 text-sm font-semibold text-[#FF6B6B] hover:bg-gray-700 rounded-md">
                    <PlusIcon className="h-4 w-4 mr-2" /> Add Ingredient
                </button>
            </div>
        </div>

        {/* Instructions */}
        <CollapsibleSection title="Instructions">
            <ol className="list-decimal list-inside space-y-2 text-gray-300">
                {recipe.instructions.split('\n').map((step, i) => <li key={i}>{step}</li>)}
            </ol>
        </CollapsibleSection>

        {/* Nutrition */}
        <CollapsibleSection title="Nutrition Info">
            <p className="text-gray-400 text-sm">Nutrition information is not yet available for this recipe.</p>
        </CollapsibleSection>

        {/* Target Cost Analyzer */}
        <div className="bg-[#2C2C2C] border border-[#444444] rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-200 mb-3">Target Cost Analyzer</h3>
            <div className="space-y-4">
                <div>
                    <label htmlFor="price-slider" className="block text-sm font-medium text-gray-300">
                        Set Target Food Cost %: <span className="font-bold text-[#FF6B6B]">{targetFoodCost}%</span>
                    </label>
                    <input
                        id="price-slider"
                        type="range"
                        min="15"
                        max="50"
                        value={targetFoodCost}
                        onChange={(e) => setTargetFoodCost(parseInt(e.target.value, 10))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer mt-1"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-[#1E1E1E] p-3 rounded-md border border-gray-700">
                        <p className="text-xs text-gray-400">Target Cost/Serving</p>
                        <p className="font-bold text-lg text-gray-100">${targetCostPerServing.toFixed(2)}</p>
                    </div>
                    <div className="bg-[#1E1E1E] p-3 rounded-md border border-gray-700">
                        <p className="text-xs text-gray-400">Required Reduction</p>
                        <p className={`font-bold text-lg ${costReductionNeeded > 0 ? 'text-red-400' : 'text-green-400'}`}>
                            ${costReductionNeeded.toFixed(2)}
                        </p>
                    </div>
                </div>
                {costReductionNeeded > 0 && (
                    <div>
                        <h4 className="font-semibold text-gray-300 text-sm">Ingredient Cost Targets</h4>
                        <p className="text-xs text-gray-500 mb-2">To meet your goal, here are the suggested new costs per unit for each ingredient.</p>
                        <ul className="space-y-2 text-xs">
                            {recipeIngredientsWithLiveCost.map(ing => {
                                const ingredientTotalCost = (ing.cost || 0) * ing.quantity;
                                if (totalCost === 0) return null; // Avoid division by zero
                                const ingredientCostContribution = ingredientTotalCost / totalCost;
                                const ingredientReductionShare = costReductionNeeded * recipe.servings * ingredientCostContribution;
                                const ingredientTargetTotalCost = ingredientTotalCost - ingredientReductionShare;
                                const ingredientTargetCostPerUnit = ingredientTargetTotalCost / ing.quantity;
                                
                                return (
                                    <li key={ing.id} className="flex justify-between items-center bg-[#1E1E1E] p-2 rounded">
                                        <span className="font-medium text-gray-300">{ing.name}</span>
                                        <div>
                                            <span className="text-gray-500 line-through mr-2">${(ing.cost || 0).toFixed(2)}</span>
                                            <span className="font-bold text-[#FF6B6B]">→ ${ingredientTargetCostPerUnit.toFixed(2)}</span>
                                            <span className="text-gray-400"> / {ing.unit}</span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                        <div className="mt-4">
                            <button onClick={handleGetSuggestions} disabled={isGenerating} className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-black bg-[#FF6B6B] hover:bg-[#E85A5A] disabled:bg-gray-500">
                                {isGenerating ? <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5" /> : <CpuChipIcon className="-ml-1 mr-2 h-5 w-5" />}
                                {isGenerating ? 'Thinking...' : 'Suggest Cost-Saving Alternatives'}
                            </button>
                            {aiSuggestions.length > 0 && (
                                <div className="mt-4 p-3 bg-[#1E1E1E] rounded-md border border-gray-700">
                                    <h5 className="text-sm font-semibold text-gray-200 mb-2">Gemini's Suggestions:</h5>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                                        {aiSuggestions.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                 <button className="px-4 py-2 text-sm font-medium text-gray-300 bg-[#2C2C2C] border border-[#444444] rounded-md shadow-sm hover:bg-[#444444]">Duplicate Recipe</button>
                 <button className="px-4 py-2 text-sm font-medium text-red-400 bg-red-900/50 border border-red-500/30 rounded-md shadow-sm hover:bg-red-900/80">Archive</button>
            </div>
            <button className="px-5 py-2 text-sm font-semibold text-black bg-[#FF6B6B] rounded-md shadow-sm hover:bg-[#E85A5A]">Cost This Recipe</button>
        </div>
      </main>
    </div>
  );
};