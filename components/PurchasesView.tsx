import React from 'react';
import { PurchaseItem } from '../types';
import { PlusIcon } from './Icons';

interface PurchasesViewProps {
  purchases: PurchaseItem[];
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({ purchases }) => {
  const itemsNeedingMapping = purchases.filter(p => p.status === 'Needs Mapping').length;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-300">New Purchase Items ({purchases.length})</h2>
          <p className="text-sm text-gray-400">{itemsNeedingMapping} items need mapping to an ingredient.</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-x-1.5 rounded-md bg-[#FF6B6B] px-3 py-2 text-sm font-semibold text-black shadow-sm hover:bg-[#E85A5A]"
        >
          <PlusIcon className="-ml-0.5 h-5 w-5" />
          Add Purchase
        </button>
      </div>
      <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden border border-[#444444] md:rounded-lg">
                  <table className="min-w-full divide-y divide-[#444444]">
                      <thead className="bg-[#1E1E1E]">
                          <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Item Name</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Supplier</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Quantity</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total Cost</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                          </tr>
                      </thead>
                      <tbody className="bg-[#2C2C2C] divide-y divide-[#444444]">
                          {purchases.map(item => (
                              <tr key={item.id} className="hover:bg-[#444444] transition-colors duration-150">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{item.name}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{item.supplier}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{item.purchaseDate}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{item.quantity} {item.unit}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">${item.totalCost.toFixed(2)}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        item.status === 'Needs Mapping' ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-500/30' : 'bg-green-900/50 text-green-300 border border-green-500/30'
                                      }`}>
                                        {item.status}
                                      </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {item.status === 'Needs Mapping' && (
                                      <button className="text-[#FF6B6B] hover:text-[#E85A5A]">Map</button>
                                    )}
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      </div>
    </div>
  );
};