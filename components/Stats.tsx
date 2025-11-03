import React from 'react';
import { Header } from './Header';
import { insights } from '../data';
import { Insight, InsightType } from '../types';
import { 
    WarningIcon, 
    OpportunityIcon, 
    SuccessIcon, 
    ArrowUpIcon, 
    ArrowDownIcon 
} from './Icons';

// Helper to get the right icon for an insight
const getInsightIcon = (type: InsightType) => {
    switch (type) {
        case InsightType.Warning:
            return <WarningIcon className="mr-3 h-6 w-6 text-red-400" />;
        case InsightType.Opportunity:
            return <OpportunityIcon className="mr-3 h-6 w-6 text-[#FF6B6B]" />;
        case InsightType.Success:
            return <SuccessIcon className="mr-3 h-6 w-6 text-green-400" />;
        default:
            return null;
    }
};

const TopPriorityCard: React.FC = () => (
    <div className="bg-[#2C2C2C] p-6 rounded-lg shadow-lg border border-[#444444]">
        <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wide">Top Priority</h3>
        <p className="mt-2 text-2xl font-bold text-gray-100">⚠️ Your food cost jumped to 34% this week (target: 30%)</p>
        <p className="mt-1 text-base text-gray-300">The biggest drivers: Beef +$312, Produce +$147</p>
        <button className="mt-4 px-4 py-2 text-sm font-semibold text-black bg-[#FF6B6B] rounded-md shadow-sm hover:bg-[#E85A5A]">
            See Details
        </button>
    </div>
);

const KeyMetric: React.FC<{ label: string; value: string; change?: string; changeType?: 'increase' | 'decrease' }> = ({ label, value, change, changeType }) => {
    const isIncrease = changeType === 'increase';
    const changeColor = isIncrease ? 'text-red-400' : 'text-green-400';
    const ChangeIcon = isIncrease ? ArrowUpIcon : ArrowDownIcon;

    return (
        <div className="bg-[#2C2C2C] p-4 rounded-lg shadow-sm border border-[#444444]">
            <p className="text-sm font-medium text-gray-400">{label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-100">{value}</p>
            {change && (
                <p className={`mt-1 text-xs font-medium flex items-center ${changeColor}`}>
                    <ChangeIcon className="h-3 w-3 mr-0.5" />
                    {change} vs last month
                </p>
            )}
        </div>
    );
};

const InsightCard: React.FC<{ insight: Insight }> = ({ insight }) => {
    const baseColor =
        insight.type === InsightType.Warning ? 'red' :
        insight.type === InsightType.Opportunity ? 'red' : 'green';
    
    const borderColor =
        insight.type === InsightType.Warning ? 'border-l-red-400' :
        insight.type === InsightType.Opportunity ? 'border-l-[#FF6B6B]' : 'border-l-green-400';
        
    const textColor =
        insight.type === InsightType.Warning ? 'text-red-400' :
        insight.type === InsightType.Opportunity ? 'text-[#FF6B6B]' : 'text-green-400';

    const buttonClasses = 
        insight.type === InsightType.Opportunity 
        ? 'bg-[#FF6B6B] text-black font-semibold hover:bg-[#E85A5A]' 
        : `bg-${baseColor}-600 text-white hover:bg-${baseColor}-700`;

    return (
        <div className={`bg-[#2C2C2C] border border-[#444444] ${borderColor} border-l-4 p-4 rounded-lg flex flex-col`}>
            <div className="flex items-start">
                <h4 className={`flex-1 font-semibold text-lg ${textColor}`}>{insight.headline}</h4>
            </div>
            <p className="mt-2 text-sm text-gray-300 flex-grow">{insight.explanation}</p>
            <div className="mt-4 text-right">
                <button className={`px-3 py-1.5 text-sm rounded-md shadow-sm ${buttonClasses}`}>
                    {insight.actionText}
                </button>
            </div>
        </div>
    );
};

const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
    const width = 100;
    const height = 30;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-8">
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                points={points}
            />
        </svg>
    );
};

export const Stats: React.FC = () => {
    return (
        <div className="bg-[#1E1E1E] min-h-screen">
            <Header
                title="AI Insights"
                subtitle="What matters most right now"
            />
            <div className="p-6 space-y-8">
                <TopPriorityCard />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <KeyMetric label="Food Cost % (Week)" value="34.1%" change="+4.1%" changeType="increase" />
                    <KeyMetric label="Food Cost % (Month)" value="31.8%" change="+1.8%" changeType="increase" />
                    <KeyMetric label="Waste %" value="3.2%" change="-0.5%" changeType="decrease" />
                    <KeyMetric label="Profit Margin" value="18.3%" change="-2.1%" changeType="increase" />
                </div>

                <div>
                    <h3 className="text-xl font-semibold text-gray-200 mb-4">Insights Feed</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {insights.map(insight => (
                            <InsightCard key={insight.id} insight={insight} />
                        ))}
                         <div className="bg-[#2C2C2C] p-6 rounded-lg shadow-sm border border-[#444444]">
                            <h3 className="text-lg font-semibold text-gray-200">Your Week in Numbers</h3>
                            <div className="mt-4 space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-gray-400">Sales</span>
                                        <span className="font-bold text-gray-200">$12,450</span>
                                    </div>
                                    <Sparkline data={[5, 8, 9, 12, 10, 11, 12]} color="#FF6B6B" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-gray-400">Food Cost</span>
                                        <span className="font-bold text-gray-200">$4,233</span>
                                    </div>
                                    <Sparkline data={[10, 11, 9, 12, 13, 11, 14]} color="#EF4444" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-gray-400">Profit</span>
                                        <span className="font-bold text-gray-200">$2,280</span>
                                    </div>
                                    <Sparkline data={[6, 7, 8, 6, 9, 10, 9]} color="#10B981" />
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};