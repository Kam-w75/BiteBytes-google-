import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Header } from './Header';
import { PurchaseOrder, PurchaseOrderItem } from '../types';
import { vendors } from '../data';
import { SparklesIcon, ArrowPathIcon, PlusIcon, MinusIcon, CpuChipIcon } from './Icons';

const mockApiResponse: PurchaseOrder[] = [
    {
        vendorId: 'v1',
        vendorName: 'Sysco',
        items: [
            { ingredientId: 'ing1', name: 'Ground Beef 80/20', currentPar: 20, suggestedQuantity: 40, unit: 'lb', price: 4.50, reasoning: 'High usage in Classic Cheeseburger, trending up.' },
            { ingredientId: 'ing3', name: 'Cheddar Cheese, Sliced', currentPar: 15, suggestedQuantity: 20, unit: 'lb', price: 3.20, reasoning: 'Stable usage, maintaining 7-day PAR.' },
            { ingredientId: 'ing9', name: 'Salt, Kosher', currentPar: 50, suggestedQuantity: 10, unit: 'lb', price: 0.90, reasoning: 'Topping off to PAR level.' },
        ]
    },
    {
        vendorId: 'v2',
        vendorName: 'US Foods',
        items: [
            { ingredientId: 'ing2', name: 'Brioche Buns', currentPar: 48, suggestedQuantity: 96, unit: 'each', price: 0.80, reasoning: 'High usage, anticipating weekend rush.' },
            { ingredientId: 'ing6', name: 'All-Purpose Flour', currentPar: 100, suggestedQuantity: 50, unit: 'lb', price: 0.40, reasoning: 'Topping off to PAR level.' },
        ]
    },
     {
        vendorId: 'v3',
        vendorName: 'Local Farms Co-op',
        items: [
            { ingredientId: 'ing4', name: 'Tomatoes, Roma', currentPar: 10, suggestedQuantity: 25, unit: 'lb', price: 1.50, reasoning: 'High price trend; ordering slightly more to cover potential waste.' },
        ]
    }
];

const OrderItemRow: React.FC<{ item: PurchaseOrderItem; onQuantityChange: (itemId: string, newQuantity: number) => void; }> = ({ item, onQuantityChange }) => {
    return (
        <tr className="hover:bg-[#444444]">
            <td className="p-4 whitespace-nowrap">
                <p className="font-medium text-gray-100">{item.name}</p>
                <p className="text-xs text-gray-400 flex items-center mt-1">
                    <CpuChipIcon className="w-3 h-3 mr-1.5 text-[#FF6B6B]" />
                    {item.reasoning}
                </p>
            </td>
            <td className="p-4 whitespace-nowrap text-gray-300">${item.price.toFixed(2)} / {item.unit}</td>
            <td className="p-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                    <button onClick={() => onQuantityChange(item.ingredientId, item.suggestedQuantity - 1)} className="p-1 rounded-full bg-gray-700 hover:bg-gray-600"><MinusIcon className="w-4 h-4" /></button>
                    <input 
                        type="number" 
                        value={item.suggestedQuantity}
                        onChange={(e) => onQuantityChange(item.ingredientId, parseInt(e.target.value, 10) || 0)}
                        className="w-16 text-center bg-transparent border border-gray-600 rounded-md py-1"
                    />
                     <button onClick={() => onQuantityChange(item.ingredientId, item.suggestedQuantity + 1)} className="p-1 rounded-full bg-gray-700 hover:bg-gray-600"><PlusIcon className="w-4 h-4" /></button>
                </div>
            </td>
            <td className="p-4 whitespace-nowrap font-semibold text-gray-100">${(item.price * item.suggestedQuantity).toFixed(2)}</td>
        </tr>
    );
};


export const OrderingView: React.FC = () => {
    const [orders, setOrders] = useState<PurchaseOrder[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateOrders = async () => {
        setIsLoading(true);
        setError(null);
        setOrders([]);

        // In a real app, this would be a real API call.
        // We are simulating the delay and response.
        await new Promise(resolve => setTimeout(resolve, 1500));
        setOrders(mockApiResponse);
        
        setIsLoading(false);
    };

    const handleQuantityChange = (orderIndex: number, itemId: string, newQuantity: number) => {
        const updatedOrders = [...orders];
        const item = updatedOrders[orderIndex].items.find(i => i.ingredientId === itemId);
        if (item) {
            item.suggestedQuantity = newQuantity;
            setOrders(updatedOrders);
        }
    };
    
    const calculateOrderTotal = (order: PurchaseOrder) => {
        return order.items.reduce((total, item) => total + (item.price * item.suggestedQuantity), 0);
    };

    return (
        <div>
            <Header
                title="Smart Ordering Hub"
                subtitle="Use AI to generate draft purchase orders based on sales velocity and PAR levels."
            />
            <div className="p-6 max-w-7xl mx-auto">
                {!isLoading && orders.length === 0 && (
                    <div className="text-center bg-[#2C2C2C] p-12 rounded-lg border border-dashed border-gray-600">
                        <h3 className="text-xl font-bold text-gray-100">Ready to build your orders?</h3>
                        <p className="mt-2 text-base text-gray-400">
                            The AI will analyze your recent recipe usage and vendor lead times to suggest what to order.
                        </p>
                        <button
                            onClick={handleGenerateOrders}
                            className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-md shadow-sm text-black bg-[#FF6B6B] hover:bg-[#E85A5A]"
                        >
                            <SparklesIcon className="-ml-1 mr-3 h-6 w-6" />
                            Generate Draft Orders
                        </button>
                    </div>
                )}

                {isLoading && (
                    <div className="text-center text-gray-400 p-12">
                         <ArrowPathIcon className="animate-spin h-8 w-8 mx-auto" />
                         <p className="mt-4 font-semibold">Analyzing data and building orders...</p>
                    </div>
                )}

                {orders.length > 0 && (
                    <div className="space-y-8">
                        {orders.map((order, index) => (
                             <div key={order.vendorId} className="bg-[#2C2C2C] border border-[#444444] rounded-lg overflow-hidden">
                                <div className="p-4 border-b border-[#444444] bg-[#1E1E1E] flex justify-between items-center">
                                    <h3 className="text-xl font-bold text-gray-100">{order.vendorName}</h3>
                                    <div className="flex items-center gap-4">
                                        <p className="text-lg font-semibold">Total: <span className="text-[#FF6B6B]">${calculateOrderTotal(order).toFixed(2)}</span></p>
                                        <button className="px-4 py-2 text-sm font-semibold text-black bg-[#FF6B6B] rounded-md shadow-sm hover:bg-[#E85A5A]">
                                            Finalize & Send
                                        </button>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead className="text-left text-gray-400">
                                            <tr>
                                                <th className="p-4 font-semibold">Item</th>
                                                <th className="p-4 font-semibold">Price</th>
                                                <th className="p-4 font-semibold">Order Quantity</th>
                                                <th className="p-4 font-semibold">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#444444]">
                                            {order.items.map(item => (
                                                <OrderItemRow key={item.ingredientId} item={item} onQuantityChange={(id, qty) => handleQuantityChange(index, id, qty)} />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
