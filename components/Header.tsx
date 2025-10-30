
import React from 'react';

interface HeaderProps {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, children }) => {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-5 sm:px-6">
      <div className="-ml-4 -mt-4 flex justify-between items-center flex-wrap sm:flex-nowrap">
        <div className="ml-4 mt-4">
          <h2 className="text-2xl font-bold leading-6 text-gray-900">{title}</h2>
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        </div>
        {children && <div className="ml-4 mt-4 flex-shrink-0">{children}</div>}
      </div>
    </div>
  );
};
