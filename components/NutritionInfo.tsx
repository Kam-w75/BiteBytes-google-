import React from 'react';
import { Header } from './Header';
import { SparklesIcon, PlusIcon } from './Icons';

export const NutritionInfo: React.FC = () => {
    return (
        <div>
            <Header
                title="Nutrition Analysis"
                subtitle="Automatically generate nutrition information for your recipes."
            />
            <div className="p-6 max-w-4xl mx-auto">
                <div className="bg-[#2C2C2C] p-8 rounded-lg shadow-lg border border-[#444444] text-center">
                    <SparklesIcon className="mx-auto h-12 w-12 text-[#FF6B6B]" />
                    <h3 className="mt-4 text-2xl font-bold text-gray-100">Unlock Automatic Nutrition Labels</h3>
                    <p className="mt-2 text-base text-gray-400">
                        Connect your recipes to our database to instantly generate FDA-compliant nutrition labels, saving you hours of manual data entry.
                    </p>
                    <div className="mt-6">
                        <button
                            type="button"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-md shadow-sm text-black bg-[#FF6B6B] hover:bg-[#E85A5A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6B6B] disabled:bg-gray-500"
                        >
                            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                            Analyze First Recipe
                        </button>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
                    <div className="bg-[#2C2C2C] p-6 rounded-lg border border-[#444444]">
                        <h4 className="font-semibold text-lg text-gray-100 mb-3">How It Works</h4>
                        <ol className="list-decimal list-inside space-y-2 text-gray-400">
                            <li>Select a recipe you want to analyze.</li>
                            <li>Our AI matches your ingredients to a nutritional database.</li>
                            <li>Review and confirm the ingredient matches.</li>
                            <li>Instantly view and export the nutrition label.</li>
                        </ol>
                    </div>
                    <div className="bg-[#2C2C2C] p-6 rounded-lg border border-[#444444]">
                        <h4 className="font-semibold text-lg text-gray-100 mb-3">What You Get</h4>
                        <ul className="list-disc list-inside space-y-2 text-gray-400">
                            <li>Calories, fat, protein, carbs, and more.</li>
                            <li>Allergen information detection.</li>
                            <li>Printable FDA-style nutrition labels.</li>
                            <li>Peace of mind for you and your customers.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};