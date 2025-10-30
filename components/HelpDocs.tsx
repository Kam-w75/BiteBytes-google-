
import React from 'react';
import { Header } from './Header';

export const HelpDocs: React.FC = () => {
    return (
        <div>
            <Header
                title="Costing your recipes"
                subtitle="Recipe Costs, Ingredient Costs, and Invoice Processing"
            />
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <div className="bg-white p-6 rounded-lg shadow-sm prose max-w-none">
                        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-md mb-6">
                            <h4 className="font-bold">Costing is available to:</h4>
                            <ul className="list-disc pl-5 mt-2">
                                <li>Plus, Starter and Scale</li>
                                <li>Team Members: Account Owners, Editors, and Managers</li>
                            </ul>
                        </div>
                        
                        <h3>Introduction</h3>
                        <p>To get your recipes properly costed, follow the below steps:</p>
                        <ol>
                            <li>Import your invoices (or manually set ingredient costs) for meez to properly cost.</li>
                            <li>Fix any errors or needing attention items that show up from the import.</li>
                            <li>Fix any remaining errors that might display on the recipe itself.</li>
                        </ol>
                        <p>The below sections provide a deeper dive into each of these steps.</p>

                        <hr className="my-8" />

                        <h3>Step 1: Import your invoices</h3>
                        <p>For meez to properly calculate recipe costs, it needs to know what you paid for each ingredient in the recipe. Knowing that will result in an accurate and personalized recipe cost for you.</p>
                        <p>There are a few ways to get your invoices into meez:</p>
                        <ul>
                            <li>You can <a href="#">manually set the ingredient costs</a> in meez.</li>
                            <li>You can <a href="#">import your ingredient costs</a> to meez via a spreadsheet.</li>
                            <li>If you are a Sysco or US Foods customer, you can enable one of our <a href="#">integrations</a>, which will sync your invoices and purchase data with meez automatically.</li>
                        </ul>

                        <hr className="my-8" />
                        
                        <h3>Step 2: Fix any items needing attention</h3>
                        <p>If you import your costs, use one of our integrations, or use our invoice processing service - you might need to address some items that need attention once your invoices are imported to meez.</p>
                        <p>The purchase item name in the invoice/import is too vague and could not match any of your ingredients. To fix this please use the Search for ingredient to map to the correct ingredient in your meez account, or create a new one.</p>
                    </div>
                </div>
                <div className="md:col-span-1">
                    <div className="sticky top-6">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <h4 className="font-semibold text-gray-800 mb-2">Contents</h4>
                            <ul className="text-sm text-blue-600 space-y-2">
                                <li><a href="#" className="hover:underline">Introduction</a></li>
                                <li><a href="#" className="hover:underline">Step 1: Import your invoices</a></li>
                                <li><a href="#" className="hover:underline">Step 2: Fix any items needing attention</a></li>
                                <li><a href="#" className="hover:underline">Step 3: Fix any lingering issues that display on the recipe</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
