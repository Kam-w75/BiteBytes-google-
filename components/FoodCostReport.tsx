import React, { useState, useMemo } from 'react';
import { Header } from './Header';
import { foodCostHistory } from '../data';
import { Ingredient, Recipe, RecipeIngredient } from '../types';
import { RecipeProfitabilityReport } from './RecipeProfitabilityReport';
import { downloadFile, arrayToCsv } from '../utils';

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
                    className={`${color} transition-all duration-500 gauge-arc-path`}
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

interface ReportPanelProps {
    recipes: Recipe[];
    ingredients: Ingredient[];
}

const FoodCostReportPanel: React.FC<ReportPanelProps> = ({ recipes, ingredients }) => {
    const targetFoodCost = 30.0;

    const reportData = useMemo(() => {
        // FIX: Add explicit types to Map and reduce functions to prevent potential 'unknown' type inference issues.
        const ingredientsMap = new Map<string, Ingredient>(ingredients.map((i: Ingredient) => [i.id, i]));

        const totalCostOfGoods = recipes.reduce((total: number, recipe: Recipe) => {
            return total + recipe.ingredients.reduce((recipeTotal: number, ing: RecipeIngredient) => {
                 const masterIngredient = ingredientsMap.get(ing.id);
                 const cost = masterIngredient ? masterIngredient.cost : 0;
                 return recipeTotal + (cost * ing.quantity);
            }, 0);
        }, 0);

        const totalRevenue = recipes.reduce((total: number, recipe: Recipe) => total + recipe.menuPrice * recipe.servings, 0);
        const overallFoodCostPercent = totalRevenue > 0 ? (totalCostOfGoods / totalRevenue) * 100 : 0;
        
        const categoryCosts: { [key: string]: number } = {};
        recipes.forEach((recipe: Recipe) => {
            recipe.ingredients.forEach((ing: RecipeIngredient) => {
                const masterIngredient = ingredientsMap.get(ing.id);
                if (masterIngredient) {
                    const cost = masterIngredient.cost * ing.quantity;
                    categoryCosts[masterIngredient.category] = (categoryCosts[masterIngredient.category] || 0) + cost;
                }
            });
        });

        const categoryBreakdown = Object.entries(categoryCosts).map(([name, value]) => ({
            name,
            value,
            percent: totalCostOfGoods > 0 ? (value / totalCostOfGoods) * 100 : 0,
            // FIX: Cast 'name' to Ingredient['category'] to ensure type safety when accessing CATEGORY_COLORS.
            color: CATEGORY_COLORS[name as Ingredient['category']] || '#94a3b8'
        })).sort((a,b) => b.value - a.value);

        return {
            overallFoodCostPercent,
            categoryBreakdown,
            topDrivers: categoryBreakdown,
            totalCostOfGoods,
        };
    }, [recipes, ingredients]);

    const difference = reportData.overallFoodCostPercent - targetFoodCost;

    const handleExport = (format: 'csv' | 'pdf') => {
        if (format === 'pdf') {
            window.print();
            return;
        }
        
        const summaryData = [
            { key: 'Report Type', value: 'Overall Food Cost' },
            { key: 'Overall Food Cost %', value: `${reportData.overallFoodCostPercent.toFixed(1)}%` },
            { key: 'Target Food Cost %', value: `${targetFoodCost.toFixed(1)}%` },
            { key: 'Total Cost of Goods', value: `$${reportData.totalCostOfGoods.toFixed(2)}` },
        ];
        
        const categoryData = reportData.categoryBreakdown.map(cat => ({
            Category: cat.name,
            'Cost ($)': cat.value.toFixed(2),
            'Percentage of Total Cost (%)': cat.percent.toFixed(1),
        }));

        const summaryCsv = arrayToCsv(summaryData);
        const categoryCsv = arrayToCsv(categoryData);
        
        const csvContent = `${summaryCsv}\n\n${categoryCsv}`;
        
        downloadFile(csvContent, 'food_cost_report.csv', 'text/csv;charset=utf-8;');
    };

    const handleEmail = () => {
        const subject = "Chef's Edge - Food Cost Report";
        const body = `
Hi Team,

Here is the latest food cost report:

- Overall Food Cost: ${reportData.overallFoodCostPercent.toFixed(1)}%
- Target Food Cost: ${targetFoodCost.toFixed(1)}%
- Total Cost of Goods: $${reportData.totalCostOfGoods.toFixed(2)}

Top Cost Drivers by Category:
${reportData.topDrivers.map(d => `- ${d.name}: ${d.percent.toFixed(1)}%`).join('\n')}

Generated from Chef's Edge.
        `.trim().replace(/^\s+/gm, '');

        const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
    };


    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
            <div className="pt-4 flex justify-end items-center space-x-3 no-print">
                <button onClick={() => handleExport('pdf')} className="px-4 py-2 text-sm font-medium text-gray-300 bg-[#2C2C2C] border border-[#444444] rounded-md shadow-sm hover:bg-[#444444]">Export PDF</button>
                <button onClick={() => handleExport('csv')} className="px-4 py-2 text-sm font-medium text-gray-300 bg-[#2C2C2C] border border-[#444444] rounded-md shadow-sm hover:bg-[#444444]">Export Excel</button>
                <button onClick={handleEmail} className="px-4 py-2 text-sm font-semibold text-black bg-[#FF6B6B] rounded-md shadow-sm hover:bg-[#E85A5A]">Email to Accountant</button>
            </div>
        </div>
    );
};

type ReportViewType = 'food-cost' | 'profitability';

const ReportSelector: React.FC<{ selected: ReportViewType, onSelect: (view: ReportViewType) => void }> = ({ selected, onSelect }) => {
    const views = [
        { id: 'food-cost', name: 'Overall Food Cost' },
        { id: 'profitability', name: 'Recipe Profitability' }
    ];
    return (
        <div className="flex items-center space-x-1 bg-[#1E1E1E] p-1 rounded-lg border border-[#444444] no-print">
            {views.map(view => (
                <button
                    key={view.id}
                    onClick={() => onSelect(view.id as ReportViewType)}
                    className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                        selected === view.id ? 'bg-[#2C2C2C] text-gray-100 shadow-sm' : 'text-gray-400 hover:text-gray-200'
                    }`}
                >
                    {view.name}
                </button>
            ))}
        </div>
    );
};

export const FoodCostReport: React.FC<ReportPanelProps> = ({ recipes, ingredients }) => {
    const [currentView, setCurrentView] = useState<ReportViewType>('food-cost');

    return (
        <div className="bg-[#1E1E1E] min-h-screen">
             <Header
                title="Reports Center"
                subtitle="Analyze your kitchen's performance from every angle."
            >
                <ReportSelector selected={currentView} onSelect={setCurrentView} />
            </Header>
            <div className="p-6">
                {currentView === 'food-cost' && <FoodCostReportPanel recipes={recipes} ingredients={ingredients} />}
                {currentView === 'profitability' && <RecipeProfitabilityReport recipes={recipes} ingredients={ingredients} />}
            </div>
        </div>
    );
};