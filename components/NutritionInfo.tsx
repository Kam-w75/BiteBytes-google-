
import React from 'react';
import { Header } from './Header';

export const NutritionInfo: React.FC = () => {
    return (
        <div>
            <Header
                title="Generating nutrition labels for recipes"
                subtitle="View and manage nutrition information for your recipes."
            />
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Steps to generate nutrition labels</h3>
                        <ol className="list-decimal list-inside space-y-2 text-gray-600">
                            <li>Begin by clicking the Nutrition tab on the right side of the recipe page.</li>
                            <li>The Nutrition side sheet will then appear on the right side of the screen.</li>
                            <li>Add the total yield for the recipe. This can be edited by hovering your mouse over "Show Details".</li>
                            <li>Add Nutritional Data.</li>
                        </ol>

                        <div className="mt-8">
                             <h4 className="font-semibold text-gray-800 mb-2">Show Details</h4>
                             <p className="text-sm text-gray-600 mb-4">Here you can add the total yield for this recipe and also see which ingredients need attention to populate nutrition data. </p>
                             <img src="https://picsum.photos/800/400?random=1" alt="Nutrition details screenshot" className="rounded-md border border-gray-200" />
                        </div>
                         <div className="mt-8">
                             <h4 className="font-semibold text-gray-800 mb-2">Add Nutritional Data</h4>
                             <p className="text-sm text-gray-600 mb-4">Click "Add Nutritional Data". A search bar will populate where you can search the database for the correct ingredient to match. </p>
                             <img src="https://picsum.photos/800/400?random=2" alt="Add nutritional data screenshot" className="rounded-md border border-gray-200" />
                        </div>
                    </div>
                </div>
                <div className="md:col-span-1">
                     <div className="bg-gray-100 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">Nutrition available for</h4>
                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                            <li>Plus, Starter and Scale plans.</li>
                            <li>Team Members: Account Owners, Editors, and Managers.</li>
                        </ul>
                    </div>
                    <div className="bg-white mt-6 p-4 rounded-lg shadow-sm border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-2">On this page</h4>
                         <ul className="text-sm text-blue-600 space-y-2">
                             <li><a href="#" className="hover:underline">Step 1: Begin</a></li>
                             <li><a href="#" className="hover:underline">Step 2: Add serving size</a></li>
                             <li><a href="#" className="hover:underline">Step 3: Add ingredients</a></li>
                             <li><a href="#" className="hover:underline">Step 4: View nutrition label</a></li>
                         </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
