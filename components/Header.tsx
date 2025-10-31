import React from 'react';

interface HeaderProps {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, children }) => {
  return (
    <div className="bg-[#1E1E1E] border-b border-[#444444] px-4 py-5 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold leading-6 text-gray-100">{title}</h2>
          <p className="mt-1 text-sm text-gray-400">{subtitle}</p>
        </div>
        {children && <div className="sm:flex-shrink-0">{children}</div>}
      </div>
    </div>
  );
};
