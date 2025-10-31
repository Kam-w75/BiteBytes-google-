import React from 'react';
import { Page } from '../App';
import { ChartPieIcon, CalculatorIcon, DocumentChartBarIcon, DocumentTextIcon, SparklesIcon, QuestionMarkCircleIcon, ArrowTrendingUpIcon, Cog8ToothIcon, ArrowsRightLeftIcon, XMarkIcon } from './Icons';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  isOpen: boolean;
  onClose: () => void;
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

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, isOpen, onClose }) => {
  const handleItemClick = (page: Page) => {
    setCurrentPage(page);
    onClose();
  };
  
  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-70 z-30 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 flex flex-col w-64 bg-[#121212] text-white z-40 transform transition-transform duration-300 ease-in-out 
        md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between h-16 border-b border-gray-800 px-4 md:h-20 md:justify-center">
          <h1 className="text-2xl font-bold text-[#FF6B6B]">Bitebytes</h1>
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center px-4 py-2 text-left text-sm font-medium rounded-lg transition-colors duration-150 ${
                currentPage === item.id
                  ? 'bg-[#FF6B6B]/10 text-[#FF6B6B]'
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="ml-4">{item.name}</span>
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};