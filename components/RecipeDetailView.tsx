import React, { useState, useMemo } from 'react';
import { Recipe, Ingredient } from '../types';
import { 
    ArrowLeftIcon, 
    PencilIcon, 
    TrashIcon, 
    ArrowUpOnSquareIcon, 
    CpuChipIcon, 
    ChevronDownIcon,
    ChevronUpIcon,
    PlusIcon,
    PhotoIcon
} from './Icons';

interface RecipeDetailViewProps {
  recipe: Recipe;
  onBack: () => void;
}

const MetricCard: React.FC<{ title: string; value: string; subValue?: string; trend?: string; trendColor?: string; }> = ({ title, value, subValue, trend, trendColor = 'text-gray-500' }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="mt-1 text-2xl font-bold text-gray-900">{value} {subValue && <span className="text-lg font-medium text-gray-500">{subValue}</span>}</p>
        {trend && <p className={`mt-1 text-xs font-medium ${trendColor}`}>{trend}</p>}
    </div>
);

const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="bg-white border border-gray-200 rounded-lg">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left"
            >
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                {isOpen ? <ChevronUpIcon className="h-5 w-5 text-gray-500" /> : <ChevronDownIcon className="h-5 w-5 text-gray-500" />}
            </button>
            {isOpen && (
                <div className="p-4 border-t border-gray-200">
                    {children}
                </div>
            )}
        </div>
    );
};

export const RecipeDetailView: React.FC<RecipeDetailViewProps> = ({ recipe, onBack }) => {
  const [instructionsVisible, setInstructionsVisible] = useState(false);

  const {
      totalCost,
      costPerServing,
      foodCostPercent,
      profitPerServing,
      profitPercent,
  } = useMemo(() => {
    const totalCost = recipe.ingredients.reduce((acc, ing) => acc + (ing.cost || 0) * ing.quantity, 0);
    const costPerServing = recipe.servings > 0 ? totalCost / recipe.servings : 0;
    const foodCostPercent = recipe.menuPrice > 0 ? (costPerServing / recipe.menuPrice) * 100 : 0;
    const profitPerServing = recipe.menuPrice - costPerServing;
    const profitPercent = recipe.menuPrice > 0 ? (profitPerServing / recipe.menuPrice) * 100 : 0;
    return { totalCost, costPerServing, foodCostPercent, profitPerServing, profitPercent };
  }, [recipe]);

  const hasHighCostIngredient = recipe.ingredients.some(ing => (ing.priceTrend || 0) > 0.1);

  const getAiInsight = () => {
    if (foodCostPercent < 25 && foodCostPercent > 0) {
      return { 
        emoji: '✅', 
        message: 'This is one of your most profitable items! Consider promoting it on your menu.'
      };
    }
    if (hasHighCostIngredient) {
      const expensiveIngredient = recipe.ingredients.find(ing => (ing.priceTrend || 0) > 0.1);
      return { 
        emoji: '⚠️', 
        message: `${expensiveIngredient?.name} price went up ${((expensiveIngredient?.priceTrend || 0) * 100).toFixed(0)}%. You might want to raise the menu price by $${(costPerServing * (expensiveIngredient?.priceTrend || 0)).toFixed(2)}.`
      };
    }
    return {
        emoji: '💡',
        message: 'Switching to 73/27 beef would save $0.40 per burger with minimal taste difference.'
    };
  };

  const aiInsight = getAiInsight();

  return (
    <div className="bg-gray-50/50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0">
            <button onClick={onBack} className="mr-3 p-1 rounded-full text-gray-500 hover:bg-gray-200 flex-shrink-0">
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 truncate" title={recipe.name}>{recipe.name}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-500 hover:bg-gray-200 rounded-md">
              <ArrowUpOnSquareIcon className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-500 hover:bg-gray-200 rounded-md">
              <PencilIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Hero */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-full md:w-1/3 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                 {recipe.imageUrl ? (
                    <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-full object-cover rounded-lg"/>
                 ) : (
                    <PhotoIcon className="w-12 h-12 text-gray-400" />
                 )}
            </div>
            <div className="flex-1">
                <p className="font-semibold text-gray-600">Serving size: Makes {recipe.servings} servings</p>
                <div className="grid grid-cols-2 gap-4 mt-3">
                    <MetricCard title="Food Cost %" value={`${foodCostPercent.toFixed(1)}%`} trend="↑ 2% from last month" trendColor="text-red-600"/>
                    <MetricCard title="Cost Per Serving" value={`$${costPerServing.toFixed(2)}`}/>
                    <MetricCard title="Menu Price" value={`$${recipe.menuPrice.toFixed(2)}`} />
                    <MetricCard title="Profit Per Serving" value={`$${profitPerServing.toFixed(2)}`} subValue={`(${profitPercent.toFixed(0)}%)`}/>
                </div>
            </div>
        </div>

        {/* AI Insight Card */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-start">
            <CpuChipIcon className="h-6 w-6 text-blue-600 mr-4 flex-shrink-0 mt-1" />
            <div>
                <p className="font-semibold text-blue-900">
                    <span role="img" aria-label="insight" className="mr-2">{aiInsight.emoji}</span>
                    {aiInsight.message}
                </p>
            </div>
        </div>

        {/* Ingredients */}
        <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">What's in it</h3>
                <span className="text-sm font-medium text-gray-500">Total Cost: ${totalCost.toFixed(2)}</span>
            </div>
            <div className="overflow-x-auto">
                 <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left font-semibold text-gray-600">Ingredient</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-600">Amount</th>
                            <th className="px-4 py-2 text-left font-semibold text-gray-600">Prep</th>
                            <th className="px-4 py-2 text-right font-semibold text-gray-600">Cost</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {recipe.ingredients.map((ing, i) => (
                            <tr key={i} className="hover:bg-gray-50">
                                <td className="px-4 py-2 font-medium text-gray-900">{ing.name}</td>
                                <td className="px-4 py-2 text-gray-600">{ing.quantity} {ing.unit}</td>
                                <td className="px-4 py-2 text-gray-600">{ing.prep || '-'}</td>
                                <td className="px-4 py-2 text-right text-gray-800">${((ing.cost || 0) * ing.quantity).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             <div className="p-2 border-t border-gray-200">
                <button className="w-full flex items-center justify-center p-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-md">
                    <PlusIcon className="h-4 w-4 mr-2" /> Add Ingredient
                </button>
            </div>
        </div>

        {/* Instructions */}
        <CollapsibleSection title="Instructions">
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
                {recipe.instructions.split('\n').map((step, i) => <li key={i}>{step}</li>)}
            </ol>
        </CollapsibleSection>

        {/* Nutrition */}
        <CollapsibleSection title="Nutrition Info">
            <p className="text-gray-500 text-sm">Nutrition information is not yet available for this recipe.</p>
        </CollapsibleSection>

        {/* Pricing Strategy */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Pricing Strategy</h3>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between p-3 bg-green-50 rounded-md">
                    <span className="font-medium text-green-800">For a 30% food cost, sell for:</span>
                    <span className="font-bold text-green-900">${(costPerServing / 0.30).toFixed(2)}</span>
                </div>
                <div className="flex justify-between p-3 bg-green-50 rounded-md">
                    <span className="font-medium text-green-800">For a $10.00 profit, sell for:</span>
                    <span className="font-bold text-green-900">${(costPerServing + 10.00).toFixed(2)}</span>
                </div>
            </div>
            <div className="mt-4">
                <label htmlFor="price-slider" className="block text-sm font-medium text-gray-700">Adjust Target Food Cost %</label>
                <input id="price-slider" type="range" min="15" max="40" defaultValue="30" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-1" />
            </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                 <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">Duplicate Recipe</button>
                 <button className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md shadow-sm hover:bg-red-100">Archive</button>
            </div>
            <button className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700">Cost This Recipe</button>
        </div>
      </main>
    </div>
  );
};