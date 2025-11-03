import React from 'react';
import { Doc } from '../types';
import { PlusIcon } from './Icons';

interface DocsViewProps {
  docs: Doc[];
}

const getBadgeColor = (type: Doc['type']) => {
    switch (type) {
        case 'SOP': return 'bg-blue-900/50 text-blue-300 border-blue-500/30';
        case 'Checklist': return 'bg-green-900/50 text-green-300 border-green-500/30';
        case 'Training': return 'bg-yellow-900/50 text-yellow-300 border-yellow-500/30';
        default: return 'bg-gray-700 text-gray-300';
    }
}

export const DocsView: React.FC<DocsViewProps> = ({ docs }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-300">All Documents ({docs.length})</h2>
        <button
          type="button"
          className="inline-flex items-center gap-x-1.5 rounded-md bg-[#FF6B6B] px-3 py-2 text-sm font-semibold text-black shadow-sm hover:bg-[#E85A5A]"
        >
          <PlusIcon className="-ml-0.5 h-5 w-5" />
          Add Document
        </button>
      </div>
      <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden border border-[#444444] md:rounded-lg">
                  <table className="min-w-full divide-y divide-[#444444]">
                      <thead className="bg-[#1E1E1E]">
                          <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Document Name</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Last Updated</th>
                          </tr>
                      </thead>
                      <tbody className="bg-[#2C2C2C] divide-y divide-[#444444]">
                          {docs.map(doc => (
                              <tr key={doc.id} className="hover:bg-[#444444] transition-colors duration-150">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{doc.name}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeColor(doc.type)}`}>
                                        {doc.type}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{doc.lastUpdated}</td>
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