import React from 'react';
import { Header } from './Header';

const HelpSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-[#2C2C2C] p-6 rounded-lg shadow-sm border border-[#444444]">
        <h3 className="text-xl font-bold text-[#FF6B6B] mb-4">{title}</h3>
        <div className="prose prose-invert prose-sm max-w-none text-gray-300">
            {children}
        </div>
    </div>
);

export const HelpDocs: React.FC = () => {
    return (
        <div className="bg-[#1E1E1E]">
            <Header
                title="Help & Documentation"
                subtitle="Your guide to getting the most out of BiteBytes."
            />
            <div className="p-6 max-w-4xl mx-auto space-y-8">
                <HelpSection title="Step 1: Setting Up Your Ingredients">
                    <p>The foundation of accurate costing is your ingredient list. You need to tell BiteBytes what you pay for each item. There are three ways to do this:</p>
                    <ul>
                        <li><strong>Scan Invoices:</strong> The fastest way. Go to the 'Invoices' tab and upload a picture of an invoice. Our AI will read it and pull out all the items and their costs.</li>
                        <li><strong>Manual Entry:</strong> For one-off items, you can go to 'Costing' {'->'} 'Ingredients' and click 'Add' to enter details by hand.</li>
                        <li><strong>Import Spreadsheet:</strong> If you have an order guide or inventory list, you can import it. Go to the 'Import/Export' hub to download our template.</li>
                    </ul>
                </HelpSection>

                <HelpSection title="Step 2: Building & Costing Recipes">
                    <p>Once your ingredients have prices, you can build recipes to see exactly how much each dish costs to make.</p>
                    <ol>
                        <li>Go to 'Costing' {'->'} 'Recipes' and click 'Add Recipe'.</li>
                        <li>Give your recipe a name, like "Classic Cheeseburger".</li>
                        <li>Start adding ingredients. As you type, BiteBytes will suggest ingredients from your list.</li>
                        <li>Specify the quantity and unit for each ingredient (e.g., 1 lb of Ground Beef, 4 each of Brioche Buns).</li>
                        <li>As you add ingredients, you'll see the total recipe cost and cost per serving update in real-time.</li>
                    </ol>
                </HelpSection>

                <HelpSection title="Step 3: Understanding Your Dashboard">
                    <p>The Dashboard is your command center. It uses AI to show you the most important information about your business right now.</p>
                    <ul>
                        <li><strong>Top Priority:</strong> This card shows the most urgent issue, like a sudden jump in your food cost percentage.</li>
                        <li><strong>Key Metrics:</strong> A quick overview of your weekly and monthly performance.</li>
                        <li><strong>Insights Feed:</strong> Here, the AI will point out opportunities (like a cheap ingredient you should use more), warnings (like an ingredient price that has shot up), and successes (like a very profitable menu item).</li>
                    </ul>
                </HelpSection>
            </div>
        </div>
    );
};