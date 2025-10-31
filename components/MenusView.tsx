import React from 'react';
// FIX: Corrected import path for types.
import { Menu, Recipe } from '../types';
// FIX: Corrected import path for Icons.
import { PlusIcon } from './Icons';

interface MenusViewProps {
  menus: Menu[];
  recipes: Recipe[];
  onSelectMenu: (menu: Menu) => void;
}

export const MenusView: React.FC<MenusViewProps> = ({ menus, recipes, onSelectMenu }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-300">All Menus ({menus.length})</h2>
        <button
          type="button"
          className="inline-flex items-center gap-x-1.5 rounded-md bg-[#FF6B6B] px-3 py-2 text-sm font-semibold text-black shadow-sm hover:bg-[#E85A5A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF6B6B]"
        >
          <PlusIcon className="-ml-0.5 h-5 w-5" />
          Add Menu
        </button>
      </div>
      <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden border border-[#444444] md:rounded-lg">
                  <table className="min-w-full divide-y divide-[#444444]">
                      <thead className="bg-[#1E1E1E]">
                          <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Menu Name</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"># of Recipes</th>
                              <th scope="col" className="relative px-6 py-3"><span className="sr-only">View</span></th>
                          </tr>
                      </thead>
                      <tbody className="bg-[#2C2C2C] divide-y divide-[#444444]">
                          {menus.map(menu => (
                              <tr key={menu.id} className="hover:bg-[#444444] cursor-pointer" onClick={() => onSelectMenu(menu)}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{menu.name}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{menu.recipeIds.length}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      <span className="text-[#FF6B6B] hover:text-[#E85A5A]">View</span>
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