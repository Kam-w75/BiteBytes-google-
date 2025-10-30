import React from 'react';
import { Header } from './Header';

export const RecipeProfitabilityReport: React.FC = () => {
    return (
        <div>
            <Header
                title="Recipe Profitability Report"
                subtitle="Analyze the profitability of each recipe on your menu."
            />
            <div className="p-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Coming Soon!</h3>
                    <p className="text-gray-600">This report will provide detailed insights into the most and least profitable items on your menu, helping you make smarter pricing and menu engineering decisions.</p>
                </div>
            </div>
        </div>
    );
};
