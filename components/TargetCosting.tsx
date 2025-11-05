import React, { useState } from 'react';
import { Header } from './Header';
import { CpuChipIcon, WarningIcon } from './Icons';
import { targetCosts as defaultTargets } from '../data';

interface SettingsProps {
    onResetData: () => void;
}

const ConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}> = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-[#2C2C2C] rounded-lg shadow-xl p-6 w-full max-w-md relative border border-red-500/50">
                <div className="flex items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
                        <WarningIcon className="h-6 w-6 text-red-400" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 className="text-lg leading-6 font-bold text-gray-100">Reset Application Data</h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-400">
                                Are you sure you want to proceed? This will permanently delete all your recipes, ingredients, and vendors, restoring the app to its original state. This action cannot be undone.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                        Confirm Reset
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-500 shadow-sm px-4 py-2 bg-transparent text-base font-medium text-gray-300 hover:bg-gray-700 sm:mt-0 sm:w-auto sm:text-sm"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export const Settings: React.FC<SettingsProps> = ({ onResetData }) => {
    const [overallTarget, setOverallTarget] = useState(defaultTargets.overall);
    const [categoryTargets, setCategoryTargets] = useState(defaultTargets.byCategory);
    const [currency, setCurrency] = useState('$');
    const [saved, setSaved] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);

    const handleCategoryChange = (category: string, value: string) => {
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue)) {
            setCategoryTargets(prev => ({ ...prev, [category]: numValue }));
        }
    };

    const handleSave = () => {
        console.log("Saving settings:", { 
            overallTarget, 
            categoryTargets,
            currency
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };
    
    const handleConfirmReset = () => {
        onResetData();
        setIsResetModalOpen(false);
    };

    return (
        <div>
            <Header
                title="Settings"
                subtitle="Configure your application preferences and profitability goals."
            />
            <div className="p-6 max-w-4xl mx-auto">
                <div className="space-y-8">
                    {/* Profitability Goals */}
                    <div className="bg-[#2C2C2C] p-6 rounded-lg shadow-sm border border-[#444444]">
                        <h3 className="text-xl font-bold text-gray-100 mb-4">Profitability Goals</h3>
                         {/* AI Suggestion */}
                        <div className="bg-[#1E1E1E] border border-[#444444] p-4 rounded-lg flex items-start mb-6">
                            <CpuChipIcon className="h-6 w-6 text-[#FF6B6B] mr-4 flex-shrink-0 mt-1" />
                            <div>
                                <p className="font-semibold text-gray-200">
                                    AI Suggestion: Based on your menu type (Classic American), I recommend a target of 28-32%.
                                </p>
                            </div>
                        </div>

                        {/* Overall Target */}
                        <div className="text-center">
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
                        <div className="mt-8">
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
                    </div>
                    
                    {/* Application Preferences */}
                     <div className="bg-[#2C2C2C] p-6 rounded-lg shadow-sm border border-[#444444]">
                        <h3 className="text-xl font-bold text-gray-100 mb-4">Application Preferences</h3>
                        <div>
                            <label htmlFor="currency-symbol" className="block text-sm font-medium text-gray-300">Currency Symbol</label>
                            <input 
                                type="text" 
                                id="currency-symbol" 
                                value={currency}
                                onChange={e => setCurrency(e.target.value)}
                                className="mt-1 w-24 bg-transparent border-[#444444] rounded-md shadow-sm focus:ring-[#FF6B6B] focus:border-[#FF6B6B]" 
                            />
                            <p className="text-xs text-gray-500 mt-2">Note: This is a visual change only and does not perform currency conversion.</p>
                        </div>
                    </div>

                    {/* Data Management */}
                    <div className="bg-[#1E1E1E] p-6 rounded-lg shadow-sm border border-red-500/30">
                        <h3 className="text-xl font-bold text-red-400 mb-2">Danger Zone</h3>
                         <div>
                            <h4 className="font-semibold text-gray-200">Reset Application Data</h4>
                            <p className="text-sm text-gray-400 mt-1 mb-4 max-w-prose">
                                This will permanently delete all your custom recipes, ingredients, and vendor information, restoring the application to its default demonstration state. This action cannot be undone.
                            </p>
                            <button 
                                onClick={() => setIsResetModalOpen(true)}
                                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Reset All Data
                            </button>
                         </div>
                    </div>
                    
                    <div className="flex justify-end items-center">
                        {saved && <p className="text-sm font-medium text-green-400 mr-4">Settings saved!</p>}
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 text-sm font-semibold text-black bg-[#FF6B6B] rounded-md shadow-sm hover:bg-[#E85A5A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6B6B]"
                        >
                            Save Settings
                        </button>
                    </div>
                </div>
            </div>
            <ConfirmationModal 
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                onConfirm={handleConfirmReset}
            />
        </div>
    );
};