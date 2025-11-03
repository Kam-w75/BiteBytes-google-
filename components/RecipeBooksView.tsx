import React from 'react';
import { RecipeBook } from '../types';
import { PlusIcon } from './Icons';

interface RecipeBooksViewProps {
  recipeBooks: RecipeBook[];
}

export const RecipeBooksView: React.FC<RecipeBooksViewProps> = ({ recipeBooks }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-300">All Recipe Books ({recipeBooks.length})</h2>
        <button
          type="button"
          className="inline-flex items-center gap-x-1.5 rounded-md bg-[#FF6B6B] px-3 py-2 text-sm font-semibold text-black shadow-sm hover:bg-[#E85A5A]"
        >
          <PlusIcon className="-ml-0.5 h-5 w-5" />
          Add Recipe Book
        </button>
      </div>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden border border-[#444444] md:rounded-lg">
            <table className="min-w-full divide-y divide-[#444444]">
              <thead className="bg-[#1E1E1E]">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"># of Recipes</th>
                </tr>
              </thead>
              <tbody className="bg-[#2C2C2C] divide-y divide-[#444444]">
                {recipeBooks.map(book => (
                  <tr key={book.id} className="hover:bg-[#444444] transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{book.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{book.recipeIds.length}</td>
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