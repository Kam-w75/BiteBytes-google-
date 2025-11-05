import React, { useMemo, useState } from 'react';
import { Recipe, Ingredient, RecipeIngredient } from '../types';
import { ArrowUpIcon, ArrowDownIcon, TagIcon } from './Icons';
import { downloadFile, arrayToCsv } from '../utils';

interface ProfitabilityData extends Recipe {
    costPerServing: number;
    profitPerServing: number;
    foodCostPercent: number;
    profitMarginPercent: number;
}

type SortKey = 'name' | 'profitPerServing' | 'profitMarginPercent' | 'foodCostPercent';
type SortDirection = 'asc' | 'desc';

interface MetricCardProps {
    title: string;
    recipeName?: string;
    value?: string;
    subValue?: string;
    isPositive?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, recipeName, value, subValue, isPositive }) => (
    <div className="bg-[#2C2C2C] p-6 rounded-lg shadow-sm border border-[#444444]">
        <p className={`text-sm font-semibold uppercase tracking-wide ${isPositive ? 'text-green-400' : 'text-red-400'}`}>{title}</p>
        <p className="mt-2 text-2xl font-bold text-gray-100">{recipeName || 'N/A'}</p>
        <div className="mt-1 flex items-baseline gap-x-2">
            <span className="text-3xl font-bold text-gray-100">{value}</span>
            <span className="text-base font-medium text-gray-400">{subValue}</span>
        </div>
    </div>
);

const SortableHeader: React.FC<{
    label: string;
    sortKey: SortKey;
    sortConfig: { key: SortKey; direction: SortDirection };
    onSort: (key: SortKey) => void;
}> = ({ label, sortKey, sortConfig, onSort }) => {
    const isActive = sortConfig.key === sortKey;
    const Icon = sortConfig.direction === 'asc' ? ArrowUpIcon : ArrowDownIcon;
    return (
        <th scope="col" className="p-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-200" onClick={() => onSort(sortKey)}>
            <div className="flex items-center">
                <span>{label}</span>
                {isActive && <Icon className="ml-1 h-3 w-3" />}
            </div>
        </th>
    );
};

export const RecipeProfitabilityReport: React.FC<{ recipes: Recipe[], ingredients: Ingredient[] }> = ({ recipes, ingredients }) => {
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'profitPerServing', direction: 'desc' });

    const profitabilityData = useMemo((): ProfitabilityData[] => {
        // FIX: Add explicit types to Map and reduce functions to prevent potential 'unknown' type inference issues.
        const ingredientsMap = new Map<string, Ingredient>(ingredients.map((i: Ingredient) => [i.id, i]));
        
        return recipes.map((recipe: Recipe) => {
            const totalCost = recipe.ingredients.reduce((acc: number, ing: RecipeIngredient) => {
                const masterIngredient = ingredientsMap.get(ing.id);
                return acc + (masterIngredient?.cost || 0) * ing.quantity;
            }, 0);

            const costPerServing = recipe.servings > 0 ? totalCost / recipe.servings : 0;
            const profitPerServing = recipe.menuPrice - costPerServing;
            const foodCostPercent = recipe.menuPrice > 0 ? (costPerServing / recipe.menuPrice) * 100 : 0;
            const profitMarginPercent = recipe.menuPrice > 0 ? (profitPerServing / recipe.menuPrice) * 100 : 0;

            return {
                ...recipe,
                costPerServing,
                profitPerServing,
                foodCostPercent,
                profitMarginPercent
            };
        });
    }, [recipes, ingredients]);

    const sortedData = useMemo(() => {
        return [...profitabilityData].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return a.name.localeCompare(b.name);
        });
    }, [profitabilityData, sortConfig]);

    const handleSort = (key: SortKey) => {
        let direction: SortDirection = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    const mostProfitable = sortedData.length > 0 ? sortedData[0] : null;
    const leastProfitable = sortedData.length > 0 ? sortedData[sortedData.length - 1] : null;

    const handleExport = (format: 'csv' | 'pdf') => {
        if (format === 'pdf') {
            window.print();
            return;
        }

        const summaryData = [
            { key: 'Report Type', value: 'Recipe Profitability' },
            { key: 'Most Profitable Item', value: `${mostProfitable?.name || 'N/A'} ($${mostProfitable?.profitPerServing.toFixed(2)} profit/serving)`},
            { key: 'Least Profitable Item', value: `${leastProfitable?.name || 'N/A'} ($${leastProfitable?.profitPerServing.toFixed(2)} profit/serving)`},
        ];

        const recipeData = sortedData.map(r => ({
            'Recipe Name': r.name,
            'Menu Price ($)': r.menuPrice.toFixed(2),
            'Cost per Serving ($)': r.costPerServing.toFixed(2),
            'Profit per Serving ($)': r.profitPerServing.toFixed(2),
            'Food Cost %': r.foodCostPercent.toFixed(1),
            'Profit Margin %': r.profitMarginPercent.toFixed(1),
        }));

        const summaryCsv = arrayToCsv(summaryData);
        const recipeCsv = arrayToCsv(recipeData);

        const csvContent = `${summaryCsv}\n\n${recipeCsv}`;

        downloadFile(csvContent, 'recipe_profitability_report.csv', 'text/csv;charset=utf-8;');
    };

    const handleEmail = () => {
        const subject = "Chef's Edge - Recipe Profitability Report";
        const body = `
Hi Team,

Here is the latest recipe profitability report:

- Most Profitable Item: ${mostProfitable?.name} ($${mostProfitable?.profitPerServing.toFixed(2)} profit/serving, ${mostProfitable?.profitMarginPercent.toFixed(0)}% margin)
- Least Profitable Item: ${leastProfitable?.name} ($${leastProfitable?.profitPerServing.toFixed(2)} profit/serving, ${leastProfitable?.profitMarginPercent.toFixed(0)}% margin)

Please see the attached CSV for the full breakdown.

Generated from Chef's Edge.
        `.trim().replace(/^\s+/gm, '');

        const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MetricCard 
                    title="Most Profitable Item"
                    recipeName={mostProfitable?.name}
                    value={`$${mostProfitable?.profitPerServing.toFixed(2)}`}
                    subValue={`(${mostProfitable?.profitMarginPercent.toFixed(0)}% margin)`}
                    isPositive
                />
                <MetricCard 
                    title="Least Profitable Item"
                    recipeName={leastProfitable?.name}
                    value={`$${leastProfitable?.profitPerServing.toFixed(2)}`}
                    subValue={`(${leastProfitable?.profitMarginPercent.toFixed(0)}% margin)`}
                    isPositive={false}
                />
            </div>

            <div className="bg-[#2C2C2C] border border-[#444444] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#444444]">
                        <thead className="bg-[#1E1E1E]">
                            <tr>
                                <SortableHeader label="Recipe" sortKey="name" sortConfig={sortConfig} onSort={handleSort} />
                                <th scope="col" className="p-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Menu Price</th>
                                <th scope="col" className="p-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Cost/Serving</th>
                                <SortableHeader label="Profit/Serving" sortKey="profitPerServing" sortConfig={sortConfig} onSort={handleSort} />
                                <SortableHeader label="Food Cost %" sortKey="foodCostPercent" sortConfig={sortConfig} onSort={handleSort} />
                                <SortableHeader label="Profit Margin %" sortKey="profitMarginPercent" sortConfig={sortConfig} onSort={handleSort} />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#444444] bg-[#2C2C2C]">
                            {sortedData.map(recipe => (
                                <tr key={recipe.id} className="hover:bg-[#444444]">
                                    <td className="p-4 whitespace-nowrap text-sm font-medium text-gray-100">{recipe.name}</td>
                                    <td className="p-4 whitespace-nowrap text-sm text-gray-300">${recipe.menuPrice.toFixed(2)}</td>
                                    <td className="p-4 whitespace-nowrap text-sm text-gray-300">${recipe.costPerServing.toFixed(2)}</td>
                                    <td className="p-4 whitespace-nowrap text-sm font-semibold text-gray-100">${recipe.profitPerServing.toFixed(2)}</td>
                                    <td className="p-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${recipe.foodCostPercent > 35 ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'}`}>
                                            {recipe.foodCostPercent.toFixed(1)}%
                                        </span>
                                    </td>
                                     <td className="p-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${recipe.profitMarginPercent < 65 ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'}`}>
                                            {recipe.profitMarginPercent.toFixed(1)}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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