import React, { useState, useMemo } from 'react';
import { Header } from './Header';
// FIX: Import `ingredients` data to access category information.
import { recipes, foodCostHistory, ingredients as allIngredients } from '../data';
import { Ingredient } from '../types';

const CATEGORY_COLORS: { [key in Ingredient['category']]: string } = {
    'Meat': '#f87171', // red-400
    'Produce': '#4ade80', // green-400
    'Dairy': '#60a5fa', // blue-400
    'Dry Goods': '#facc15', // yellow-400
    'Spices': '#fb923c', // orange-400
    'Canned': '#a78bfa', // violet-400
    'Beverages': '#22d3ee', // cyan-400
    'Other': '#94a3b8', // slate-400
};

const DateSelector: React.FC<{ selected: string, onSelect: (range: string) => void }> = ({ selected, onSelect }) => {
    const ranges = ['Week', 'Month', 'Quarter', 'Custom'];
    return (
        <div className="flex items-center space-x-1 bg-[#2C2C2C] p-1 rounded-lg">
            {ranges.map(range => (
                <button
                    key={range}
                    onClick={() => onSelect(range)}
                    className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
                        selected === range ? 'bg-[#1E1E1E] text-gray-100 shadow-sm' : 'text-gray-400 hover:text-gray-200'
                    }`}
                >
                    {range}
                </button>
            ))}
        </div>
    );
};

const Gauge: React.FC<{ value: number, target: number }> = ({ value, target }) => {
    const percentage = Math.min(Math.max(value, 0), 100);
    const angle = (percentage / 100) * 180;
    
    let color = 'stroke-green-500';
    if (percentage > target) color = 'stroke-yellow-500';
    if (percentage > target + 3) color = 'stroke-red-500';
    
    return (
        <div className="relative w-48 h-24 mx-auto">
            <svg viewBox="0 0 100 50" className="w-full h-full">
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" strokeWidth="10" stroke="#444444" />
                <path 
                    d="M 10 50 A 40 40 0 0 1 90 50" 
                    fill="none" 
                    strokeWidth="10" 
                    className={`${color} transition-all duration-500`}
                    strokeDasharray={`${(angle/180) * 125.6} 125.6`}
                />
            </svg>
        </div>
    );
};

const PieChart: React.FC<{ data: { name: string, value: number, percent: number, color: string }[] }> = ({ data }) => {
    let cumulativePercent = 0;
    return (
        <svg viewBox="0 0 32 32" className="w-48 h-48 mx-auto">
            {data.map(slice => {
                const [startX, startY] = [16 + 15 * Math.cos(2 * Math.PI * cumulativePercent), 16 + 15 * Math.sin(2 * Math.PI * cumulativePercent)];
                cumulativePercent += slice.percent / 100;
                const [endX, endY] = [16 + 15 * Math.cos(2 * Math.PI * cumulativePercent), 16 + 15 * Math.sin(2 * Math.PI * cumulativePercent)];
                const largeArcFlag = slice.percent > 50 ? 1 : 0;
                
                const pathData = `M 16 16 L ${startX} ${startY} A 15 15 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;

                return <path key={slice.name} d={pathData} fill={slice.color} />;
            })}
        </svg>
    );
};

const LineGraph: React.FC<{ data: { week: number, costPercentage: number }[], target: number }> = ({ data, target }) => {
    const width = 500;
    const height = 200;
    const padding = 30;

    const maxVal = Math.max(...data.map(p => p.costPercentage), target) + 2;
    const minVal = Math.min(...data.map(p => p.costPercentage), target) - 2;

    const scaleY = (val: number) => height - padding - ((val - minVal) / (maxVal - minVal)) * (height - 2 * padding);
    const scaleX = (index: number) => padding + (index / (data.length - 1)) * (width - 2 * padding);

    const pathData = data.map((point, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(point.costPercentage)}`).join(' ');

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            {/* Target Line */}
            <line x1={padding} y1={scaleY(target)} x2={width - padding} y2={scaleY(target)} stroke="#fb923c" strokeWidth="1" strokeDasharray="4 2" />
            <text x={width - padding + 4} y={scaleY(target) + 4} fill="#fb923c" fontSize="10" className="font-semibold">{target}% Target</text>

            {/* Main line */}
            <path d={pathData} stroke="#FF6B6B" strokeWidth="2" fill="none" />

            {/* Points and Annotations */}
            {data.map((point, i) => {
                 const isHigh = i > 0 && point.costPercentage > data[i - 1].costPercentage + 1;
                 return (
                    <g key={i}>
                        <circle cx={scaleX(i)} cy={scaleY(point.costPercentage)} r="3" fill="#FF6B6B" />
                         {isHigh && <text x={scaleX(i)} y={scaleY(point.costPercentage) - 10} textAnchor="middle" fill="#ef4444" fontSize="10" className="font-bold">Spike</text>}
                    </g>
                )
            })}
        </svg>
    );
};

export const FoodCostReport: React.FC = () => {
    const [dateRange, setDateRange] = useState('Month');
    const targetFoodCost = 30.0;

    const reportData = useMemo(() => {
        // FIX: Create a map of all ingredients for efficient lookup.
        const allIngredientsMap = new Map(allIngredients.map(i => [i.id, i]));

        const totalCostOfGoods = recipes.reduce((total, recipe) => {
            return total + recipe.ingredients.reduce((recipeTotal, ing) => recipeTotal + (ing.cost || 0) * ing.quantity, 0);
        }, 0);

        const totalRevenue = recipes.reduce((total, recipe) => total + recipe.menuPrice * recipe.servings, 0);
        const overallFoodCostPercent = totalRevenue > 0 ? (totalCostOfGoods / totalRevenue) * 100 : 0;
        
        const categoryCosts: { [key: string]: number } = {};
        recipes.forEach(recipe => {
            recipe.ingredients.forEach(ing => {
                const cost = (ing.cost || 0) * ing.quantity;
                // FIX: Look up the full ingredient details to get its category.
                const fullIngredient = allIngredientsMap.get(ing.id);
                if (fullIngredient) {
                    categoryCosts[fullIngredient.category] = (categoryCosts[fullIngredient.category] || 0) + cost;
                }
            });
        });

        const categoryBreakdown = Object.entries(categoryCosts).map(([name, value]) => ({
            name,
            value,
            percent: (value / totalCostOfGoods) * 100,
            color: CATEGORY_COLORS[name as Ingredient['category']] || '#94a3b8'
        })).sort((a,b) => b.value - a.value);

        return {
            overallFoodCostPercent,
            categoryBreakdown,
            topDrivers: categoryBreakdown,
            totalCostOfGoods,
        };
    }, []);

    const difference = reportData.overallFoodCostPercent - targetFoodCost;

    return (
        <div className="bg-[#1E1E1E] min-h-screen">
            <Header
                title="Food Cost Report"
                subtitle="An overview of your food costs and profitability."
            >
                <DateSelector selected={dateRange} onSelect={setDateRange} />
            </Header>

            <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-[#2C2C2C] p-6 rounded-lg shadow-sm border border-[#444444] text-center">
                            <h3 className="text-lg font-semibold text-gray-200">Overall Food Cost</h3>
                            <Gauge value={reportData.overallFoodCostPercent} target={targetFoodCost} />
                            <p className="text-5xl font-bold text-gray-100 -mt-8">{reportData.overallFoodCostPercent.toFixed(1)}%</p>
                            <p className="text-sm text-gray-400 mt-2">Target: {targetFoodCost.toFixed(1)}%</p>
                            <p className={`text-sm font-semibold mt-1 ${difference > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                {difference > 0 ? '+' : ''}{difference.toFixed(1)}% ({difference > 0 ? 'needs attention' : 'on track'})
                            </p>
                        </div>
                        <div className="bg-[#2C2C2C] p-6 rounded-lg shadow-sm border border-[#444444]">
                            <h3 className="text-lg font-semibold text-gray-200 mb-4">Breakdown by Category</h3>
                            <div className="flex flex-col md:flex-row items-center gap-4">
                                <PieChart data={reportData.categoryBreakdown} />
                                <div className="space-y-2 text-sm">
                                    {reportData.categoryBreakdown.map(cat => (
                                        <div key={cat.name} className="flex items-center">
                                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: cat.color }}></div>
                                            <span className="font-medium text-gray-400">{cat.name}:</span>
                                            <span className="ml-auto font-semibold text-gray-200">{cat.percent.toFixed(1)}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-[#2C2C2C] p-6 rounded-lg shadow-sm border border-[#444444]">
                            <h3 className="text-lg font-semibold text-gray-200 mb-4">Top Cost Drivers</h3>
                            <ul className="space-y-3">
                                {reportData.topDrivers.map(driver => (
                                    <li key={driver.name}>
                                        <div className="flex justify-between items-center text-sm">
                                            <p className="font-medium text-gray-200">{driver.name}</p>
                                            <p className="font-semibold text-gray-300">${driver.value.toFixed(2)} <span className="text-xs text-gray-500">({driver.percent.toFixed(0)}%)</span></p>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                                            <div className="h-2 rounded-full" style={{ width: `${driver.percent}%`, backgroundColor: driver.color }}></div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                         <div className="bg-[#2C2C2C] p-6 rounded-lg shadow-sm border border-[#444444]">
                            <h3 className="text-lg font-semibold text-gray-200 mb-4">Food Cost % Trend (Last 12 Weeks)</h3>
                            <LineGraph data={foodCostHistory} target={targetFoodCost} />
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-end items-center space-x-3">
                    <button className="px-4 py-2 text-sm font-medium text-gray-300 bg-[#2C2C2C] border border-[#444444] rounded-md shadow-sm hover:bg-[#444444]">Export PDF</button>
                    <button className="px-4 py-2 text-sm font-medium text-gray-300 bg-[#2C2C2C] border border-[#444444] rounded-md shadow-sm hover:bg-[#444444]">Export Excel</button>
                    <button className="px-4 py-2 text-sm font-semibold text-black bg-[#FF6B6B] rounded-md shadow-sm hover:bg-[#E85A5A]">Email to Accountant</button>
                </div>
            </div>
        </div>
    );
};