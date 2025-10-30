import React from 'react';
// FIX: Corrected import path for PurchaseItem type.
import { PurchaseItem } from '../types';
// FIX: Corrected import path for Icons.
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
          <h2 className="text-lg font-semibold text-gray-700">New Purchase Items ({purchases.length})</h2>
          <p className="text-sm text-gray-500">{itemsNeedingMapping} items need mapping to an ingredient.</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
        >
          <PlusIcon className="-ml-0.5 h-5 w-5" />
          Add Purchase
        </button>
      </div>
      <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                          <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                          </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                          {purchases.map(item => (
                              <tr key={item.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.supplier}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.purchaseDate}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity} {item.unit}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.totalCost.toFixed(2)}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        item.status === 'Needs Mapping' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                      }`}>
                                        {item.status}
                                      </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {item.status === 'Needs Mapping' && (
                                      <button className="text-blue-600 hover:text-blue-900">Map</button>
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
