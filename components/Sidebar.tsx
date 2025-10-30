import React from 'react';
import { Page } from '../App';
import { ChartPieIcon, CalculatorIcon, DocumentChartBarIcon, DocumentTextIcon, SparklesIcon, QuestionMarkCircleIcon, ArrowTrendingUpIcon, Cog8ToothIcon, ArrowsRightLeftIcon } from './Icons';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const navItems: { id: Page; name: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', name: 'Dashboard', icon: <ChartPieIcon className="h-6 w-6" /> },
  { id: 'costing', name: 'Costing', icon: <CalculatorIcon className="h-6 w-6" /> },
  { id: 'reports', name: 'Reports', icon: <DocumentChartBarIcon className="h-6 w-6" /> },
  { id: 'price-history', name: 'Price History', icon: <ArrowTrendingUpIcon className="h-6 w-6" /> },
  { id: 'invoices', name: 'Invoices', icon: <DocumentTextIcon className="h-6 w-6" /> },
  { id: 'nutrition', name: 'Nutrition', icon: <SparklesIcon className="h-6 w-6" /> },
  { id: 'import-export', name: 'Import/Export', icon: <ArrowsRightLeftIcon className="h-6 w-6" /> },
  { id: 'settings', name: 'Settings', icon: <Cog8ToothIcon className="h-6 w-6" /> },
  { id: 'help', name: 'Help', icon: <QuestionMarkCircleIcon className="h-6 w-6" /> },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
  return (
    <div className="flex flex-col w-64 bg-gray-800 text-white">
      <div className="flex items-center justify-center h-20 border-b border-gray-700">
        <h1 className="text-2xl font-bold">meez</h1>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`w-full flex items-center px-4 py-2 text-left text-sm font-medium rounded-lg transition-colors duration-150 ${
              currentPage === item.id
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="ml-4">{item.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};