import React, { useState, useMemo } from 'react';
import { Header } from './Header';
import { priceChangeHistory, vendors } from '../data';
import { PriceChangeItem, Ingredient } from '../types';
import { ArrowUpIcon, ArrowDownIcon } from './Icons';

type FilterType = 'all' | 'increases' | 'decreases';
type CategoryType = Ingredient['category'] | 'all';

const FilterButton: React.FC<{ label: string; isActive: boolean; onClick: () => void }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
            isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
    >
        {label}
    </button>
);

const PriceChangeCard: React.FC<{ item: PriceChangeItem }> = ({ item }) => {
    const change = item.newPrice - item.oldPrice;
    const percentChange = (change / item.oldPrice) * 100;
    const isIncrease = change > 0;
    
    return (
        <div className="flex justify-between items-center py-2">
            <p className="font-medium text-gray-800">{item.ingredientName}</p>
            <div className="flex items-center space-x-3">
                <p className="text-sm text-gray-500">${item.oldPrice.toFixed(2)} → <span className="font-bold text-gray-900">${item.newPrice.toFixed(2)}</span></p>
                <span className={`flex items-center text-sm font-semibold ${isIncrease ? 'text-red-600' : 'text-green-600'}`}>
                    {isIncrease ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
                    {percentChange.toFixed(0)}%
                </span>
            </div>
        </div>
    );
};

export const PriceChangeHistory: React.FC = () => {
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [supplierFilter, setSupplierFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<CategoryType>('all');

    const filteredHistory = useMemo(() => {
        return priceChangeHistory.map(entry => {
            let items = entry.items;
            
            // Filter by increase/decrease
            if (filterType === 'increases') {
                items = items.filter(i => i.newPrice > i.oldPrice);
            } else if (filterType === 'decreases') {
                items = items.filter(i => i.newPrice < i.oldPrice);
            }
            
            // Filter by category
            if (categoryFilter !== 'all') {
                items = items.filter(i => i.category === categoryFilter);
            }

            return { ...entry, items };
        }).filter(entry => {
            // Filter by supplier
            const supplierMatch = supplierFilter === 'all' || entry.supplier === supplierFilter;
            // Only show entries that still have items after filtering
            return supplierMatch && entry.items.length > 0;
        });
    }, [filterType, supplierFilter, categoryFilter]);

    const allCategories: CategoryType[] = ['all', 'Meat', 'Produce', 'Dairy', 'Dry Goods', 'Spices', 'Canned', 'Beverages', 'Other'];

    return (
        <div className="bg-gray-50/50 min-h-screen">
            <Header
                title="Price Change History"
                subtitle="Track all supplier price movements over time."
            />
            <div className="p-6">
                {/* Filters */}
                <div className="mb-8 p-4 bg-white rounded-lg shadow-sm border border-gray-200 space-y-4">
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-semibold text-gray-600">Show:</span>
                        <div className="flex space-x-2">
                            <FilterButton label="All Changes" isActive={filterType === 'all'} onClick={() => setFilterType('all')} />
                            <FilterButton label="Increases Only" isActive={filterType === 'increases'} onClick={() => setFilterType('increases')} />
                            <FilterButton label="Decreases Only" isActive={filterType === 'decreases'} onClick={() => setFilterType('decreases')} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor="supplier-filter" className="block text-sm font-medium text-gray-700">Supplier</label>
                            <select id="supplier-filter" value={supplierFilter} onChange={e => setSupplierFilter(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                                <option value="all">All Suppliers</option>
                                {vendors.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700">Category</label>
                            <select id="category-filter" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value as CategoryType)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                                {allCategories.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="relative pl-6">
                    {/* Vertical line */}
                    <div className="absolute left-6 top-1 bottom-1 w-0.5 bg-gray-200" aria-hidden="true"></div>
                    
                    <div className="space-y-8">
                        {filteredHistory.length > 0 ? (
                            filteredHistory.map((entry, index) => (
                                <div key={index} className="relative">
                                    <div className="absolute -left-1.5 top-1 h-3 w-3 bg-blue-600 rounded-full border-2 border-white"></div>
                                    <div className="ml-6">
                                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                            <div className="p-4 border-b border-gray-200 bg-gray-50/70">
                                                <div className="flex justify-between items-center">
                                                    <p className="font-bold text-gray-800">{entry.date}</p>
                                                    <p className="text-sm font-semibold text-gray-600">{entry.supplier}</p>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1">{entry.items.length} item{entry.items.length > 1 && 's'} changed price</p>
                                            </div>
                                            <div className="p-4 divide-y divide-gray-100">
                                                {entry.items.map((item, itemIndex) => (
                                                    <PriceChangeCard key={itemIndex} item={item} />
                                                ))}
                                            </div>
                                            <div className="p-4 bg-gray-50/70 flex justify-between items-center">
                                                <p className="text-xs font-medium text-gray-500">This affected {entry.affectedRecipes} recipes</p>
                                                <button className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700">
                                                    Review Impact
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <h3 className="text-lg font-semibold">No Price Changes Found</h3>
                                <p>Try adjusting your filters to see more results.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};