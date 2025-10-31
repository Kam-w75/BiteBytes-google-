import React, { useState } from 'react';
import { Header } from './Header';
import { CpuChipIcon } from './Icons';
import { targetCosts as defaultTargets } from '../data';

export const TargetCosting: React.FC = () => {
    const [overallTarget, setOverallTarget] = useState(defaultTargets.overall);
    const [categoryTargets, setCategoryTargets] = useState(defaultTargets.byCategory);
    const [saved, setSaved] = useState(false);

    const handleCategoryChange = (category: string, value: string) => {
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue)) {
            setCategoryTargets(prev => ({ ...prev, [category]: numValue }));
        }
    };

    const handleSave = () => {
        // Here you would typically save the data to a backend.
        console.log("Saving targets:", { overall: overallTarget, byCategory: categoryTargets });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000); // Hide message after 2 seconds
    };

    return (
        <div>
            <Header
                title="Set Your Profitability Goals"
                subtitle="Define your target food costs to track performance accurately."
            />
            <div className="p-6 max-w-4xl mx-auto">
                <div className="space-y-8">
                    {/* AI Suggestion */}
                    <div className="bg-[#2C2C2C] border border-[#444444] p-4 rounded-lg flex items-start">
                        <CpuChipIcon className="h-6 w-6 text-[#FF6B6B] mr-4 flex-shrink-0 mt-1" />
                        <div>
                            <p className="font-semibold text-gray-200">
                                AI Suggestion: Based on your menu type (Classic American), I recommend a target of 28-32%.
                            </p>
                        </div>
                    </div>

                    {/* Overall Target */}
                    <div className="bg-[#2C2C2C] p-6 rounded-lg shadow-sm border border-[#444444] text-center">
                        <label htmlFor="overall-target" className="text-lg font-semibold text-gray-200">
                            What's your target food cost %?
                        </label>
                        <p className="my-4 text-6xl font-bold text-[#FF6B6B] tracking-tight">{overallTarget}%</p>
                        <input
                            id="overall-target"
                            type="range"
                            min="15"
                            max="50"
                            value={overallTarget}
                            onChange={(e) => setOverallTarget(parseInt(e.target.value, 10))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 px-1 mt-1">
                            <span>15%</span>
                            <span>50%</span>
                        </div>
                        <p className="mt-4 text-sm text-gray-400">
                            Industry average: Most restaurants target 28-32%.
                        </p>
                    </div>

                    {/* Category Specific Targets */}
                    <div className="bg-[#2C2C2C] p-6 rounded-lg shadow-sm border border-[#444444]">
                        <h3 className="text-lg font-semibold text-gray-200">Or set different targets by category:</h3>
                        <p className="text-sm text-gray-400 mt-1 mb-6">This is optional and overrides the overall target for specific recipes.</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {Object.entries(categoryTargets).map(([category, value]) => (
                                <div key={category}>
                                    <label htmlFor={`cat-${category}`} className="block text-sm font-medium text-gray-300">{category}</label>
                                    <div className="relative mt-1">
                                        <input
                                            type="number"
                                            id={`cat-${category}`}
                                            value={value}
                                            onChange={(e) => handleCategoryChange(category, e.target.value)}
                                            className="w-full pl-3 pr-8 py-2 border border-[#444444] bg-transparent rounded-md shadow-sm focus:ring-[#FF6B6B] focus:border-[#FF6B6B]"
                                        />
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                            <span className="text-gray-400 sm:text-sm">%</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Save Button */}
                    <div className="flex justify-end items-center">
                        {saved && <p className="text-sm font-medium text-green-400 mr-4">Changes saved successfully!</p>}
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 text-sm font-semibold text-black bg-[#FF6B6B] rounded-md shadow-sm hover:bg-[#E85A5A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6B6B]"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};