import React from 'react';
import { Bars3Icon } from './Icons';

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuClick }) => {
  return (
    <div className="md:hidden flex items-center h-16 bg-[#121212] text-white px-4 border-b border-gray-800 flex-shrink-0">
      <button onClick={onMenuClick} className="p-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white">
        <Bars3Icon className="h-6 w-6" />
      </button>
      <h1 className="text-lg font-bold ml-4 text-[#FF6B6B]">Bitebytes</h1>
    </div>
  );
};

// FIX: Removed local declaration of Bars3Icon as it was already imported from ./Icons.tsx, causing a conflict.