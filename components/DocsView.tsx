
import React from 'react';
// FIX: Corrected import path for Doc type.
import { Doc } from '../types';
// FIX: Corrected import path for Icons.
import { PlusIcon } from './Icons';

interface DocsViewProps {
  docs: Doc[];
}

export const DocsView: React.FC<DocsViewProps> = ({ docs }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700">All Documents ({docs.length})</h2>
        <button
          type="button"
          className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <PlusIcon className="-ml-0.5 h-5 w-5" />
          Add Document
        </button>
      </div>
      <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                          <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document Name</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                          </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                          {docs.map(doc => (
                              <tr key={doc.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doc.name}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        doc.type === 'SOP' ? 'bg-blue-100 text-blue-800' :
                                        doc.type === 'Checklist' ? 'bg-green-100 text-green-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {doc.type}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.lastUpdated}</td>
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
