import React from 'react';
// FIX: Corrected import path for RecipeBook type.
import { RecipeBook } from '../types';
// FIX: Corrected import path for Icons.
import { PlusIcon } from './Icons';

interface RecipeBooksViewProps {
  recipeBooks: RecipeBook[];
}

export const RecipeBooksView: React.FC<RecipeBooksViewProps> = ({ recipeBooks }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700">All Recipe Books ({recipeBooks.length})</h2>
        <button
          type="button"
          className="inline-flex items-center gap-x-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
        >
          <PlusIcon className="-ml-0.5 h-5 w-5" />
          Add Recipe Book
        </button>
      </div>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># of Recipes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recipeBooks.map(book => (
                  <tr key={book.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{book.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.recipeIds.length}</td>
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
