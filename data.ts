// FIX: Import InsightType as a value, as it is an enum used for values, not just a type.
import type { Recipe, Ingredient, Menu, RecipeBook, Doc, PurchaseItem, Vendor, Insight, PriceChangeEntry } from './types';
import { InsightType } from './types';

export const vendors: Vendor[] = [
    { 
        id: 'v1', 
        name: 'Sysco', 
        lastOrderDate: '2023-10-25', 
        totalSpend: 12543.50, 
        itemCount: 45,
        accountNumber: 'ACCT-SYS-12345',
        contact: { name: 'John Doe', phone: '555-123-4567', email: 'john.doe@sysco.com' },
        type: 'Broadline',
        isPrimary: true,
        orderDays: ['Mon', 'Wed', 'Fri'],
        paymentTerms: 'Net 30'
    },
    { 
        id: 'v2', 
        name: 'US Foods', 
        lastOrderDate: '2023-10-24', 
        totalSpend: 8765.20, 
        itemCount: 32,
        accountNumber: 'ACCT-USF-67890',
        contact: { name: 'Jane Smith', phone: '555-987-6543', email: 'jane.smith@usfoods.com' },
        type: 'Broadline',
        isPrimary: false,
        orderDays: ['Tue', 'Thu'],
        paymentTerms: 'Net 30'
    },
    { 
        id: 'v3', 
        name: 'Local Farms Co-op', 
        lastOrderDate: '2023-10-26', 
        totalSpend: 2345.80, 
        itemCount: 15,
        contact: { name: 'Maria Garcia', phone: '555-222-3333', email: 'maria@localfarms.com' },
        type: 'Produce',
        isPrimary: false,
        orderDays: ['Tue', 'Fri'],
        paymentTerms: 'COD'
    },
];

export const ingredients: Ingredient[] = [
    { id: 'ing1', name: 'Ground Beef 80/20', cost: 4.50, unit: 'lb', vendorId: 'v1', usedInRecipes: 2, priceTrend: 0.12, category: 'Meat' },
    { id: 'ing2', name: 'Brioche Buns', cost: 0.80, unit: 'each', vendorId: 'v2', usedInRecipes: 1, priceTrend: 0.05, category: 'Dry Goods' },
    { id: 'ing3', name: 'Cheddar Cheese, Sliced', cost: 3.20, unit: 'lb', vendorId: 'v1', usedInRecipes: 1, priceTrend: -0.02, category: 'Dairy' },
    { id: 'ing4', name: 'Tomatoes, Roma', cost: 1.50, unit: 'lb', vendorId: 'v3', usedInRecipes: 3, priceTrend: 0.25, category: 'Produce' },
    { id: 'ing5', name: 'Lettuce, Iceberg', cost: 1.20, unit: 'head', vendorId: 'v3', usedInRecipes: 2, priceTrend: 0, category: 'Produce' },
    { id: 'ing6', name: 'All-Purpose Flour', cost: 0.40, unit: 'lb', vendorId: 'v2', usedInRecipes: 5, priceTrend: -0.05, category: 'Dry Goods' },
    { id: 'ing7', name: 'Chicken Breast, Boneless', cost: 3.80, unit: 'lb', vendorId: 'v1', usedInRecipes: 2, priceTrend: 0.08, category: 'Meat' },
    { id: 'ing8', name: 'Avocado', cost: 1.10, unit: 'each', vendorId: 'v3', usedInRecipes: 1, priceTrend: 0.15, category: 'Produce' },
    { id: 'ing9', name: 'Salt, Kosher', cost: 0.90, unit: 'lb', vendorId: 'v1', usedInRecipes: 10, priceTrend: 0, category: 'Spices' },
    { id: 'ing10', name: 'Olive Oil', cost: 12.00, unit: 'gallon', vendorId: 'v2', usedInRecipes: 8, priceTrend: 0.03, category: 'Dry Goods' },
];

export const recipes: Recipe[] = [
    {
        id: 'r1',
        name: 'Classic Cheeseburger',
        servings: 4,
        menuPrice: 15.00,
        laborTimeMinutes: 10,
        imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1998&auto=format&fit=crop',
        ingredients: [
            { id: 'ing1', name: 'Ground Beef 80/20', quantity: 1, unit: 'lb' },
            { id: 'ing2', name: 'Brioche Buns', quantity: 4, unit: 'each' },
            { id: 'ing3', name: 'Cheddar Cheese, Sliced', quantity: 0.25, unit: 'lb' },
            { id: 'ing4', name: 'Tomatoes, Roma', quantity: 0.5, unit: 'lb', prep: 'sliced' },
            { id: 'ing5', name: 'Lettuce, Iceberg', quantity: 0.25, unit: 'head', prep: 'shredded' },
        ],
        instructions: "1. Form beef into 4 patties.\n2. Grill patties to desired doneness.\n3. Melt cheese on patties.\n4. Assemble burgers with toppings on buns."
    },
    {
        id: 'r2',
        name: 'House Salad',
        servings: 1,
        menuPrice: 8.00,
        laborTimeMinutes: 5,
        imageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?q=80&w=2070&auto=format&fit=crop',
        ingredients: [
            { id: 'ing5', name: 'Lettuce, Iceberg', quantity: 0.25, unit: 'head' },
            { id: 'ing4', name: 'Tomatoes, Roma', quantity: 0.25, unit: 'lb' },
            { id: 'ing10', name: 'Olive Oil', quantity: 0.01, unit: 'gallon' },
        ],
        instructions: "1. Chop lettuce and tomatoes.\n2. Toss with olive oil.\n3. Serve immediately."
    }
];

export const menus: Menu[] = [
    { id: 'm1', name: 'Lunch Menu', recipeIds: ['r1', 'r2'] },
    { id: 'm2', name: 'Dinner Menu', recipeIds: ['r1'] },
];

export const recipeBooks: RecipeBook[] = [
    { id: 'rb1', name: 'Summer Specials', recipeIds: ['r1', 'r2'] },
    { id: 'rb2', name: 'Core Menu Items', recipeIds: ['r1'] },
];

export const docs: Doc[] = [
    { id: 'd1', name: 'Grill Station Opening', type: 'Checklist', lastUpdated: '2023-10-15' },
    { id: 'd2', name: 'Burger Assembly SOP', type: 'SOP', lastUpdated: '2023-09-01' },
    { id: 'd3', name: 'Knife Skills Training', type: 'Training', lastUpdated: '2023-08-20' },
    { id: 'd4', name: 'Closing Checklist', type: 'Checklist', lastUpdated: '2023-10-20' },
];

export const purchases: PurchaseItem[] = [
    { id: 'p1', name: 'BEEF GRND 80/20 FZ', supplier: 'Sysco', purchaseDate: '2023-10-25', quantity: 40, unit: 'lb', totalCost: 172.00, status: 'Needs Mapping' },
    { id: 'p2', name: 'Tomato, Roma', supplier: 'Local Farms Co-op', purchaseDate: '2023-10-26', quantity: 20, unit: 'lb', totalCost: 30.00, status: 'Mapped' },
];

export const insights: Insight[] = [
    {
        id: 'i1',
        type: InsightType.Warning,
        headline: 'Beef prices are up 12% this month.',
        explanation: 'Your ground beef cost has increased significantly. This impacts the profitability of your burgers and other beef dishes.',
        actionText: 'Review Burger Price',
    },
    {
        id: 'i2',
        type: InsightType.Opportunity,
        headline: 'Flour is 5% cheaper than last quarter.',
        explanation: 'The cost of flour from US Foods has decreased. Consider running a special on baked goods to capitalize on the lower cost.',
        actionText: 'Create a Special',
    },
    {
        id: 'i3',
        type: InsightType.Success,
        headline: 'Food cost on House Salad is only 15%.',
        explanation: 'This is a highly profitable item. Great job on sourcing and costing! Consider making it a featured item.',
        actionText: 'View Recipe',
    }
];

export const foodCostHistory: { week: number; costPercentage: number }[] = [
    { week: 1, costPercentage: 30.5 },
    { week: 2, costPercentage: 31.0 },
    { week: 3, costPercentage: 30.2 },
    { week: 4, costPercentage: 31.5 },
    { week: 5, costPercentage: 31.2 },
    { week: 6, costPercentage: 30.8 },
    { week: 7, costPercentage: 32.5 },
    { week: 8, costPercentage: 32.1 },
    { week: 9, costPercentage: 33.0 },
    { week: 10, costPercentage: 32.8 },
    { week: 11, costPercentage: 34.1 },
    { week: 12, costPercentage: 33.5 },
];

export const priceChangeHistory: PriceChangeEntry[] = [
    {
        date: 'Jan 15, 2025',
        supplier: 'Sysco',
        affectedRecipes: 12,
        items: [
            { ingredientName: 'Ground Beef 80/20', oldPrice: 4.20, newPrice: 4.85, category: 'Meat' },
            { ingredientName: 'Chicken Breast, Boneless', oldPrice: 3.10, newPrice: 3.45, category: 'Meat' },
        ]
    },
    {
        date: 'Jan 12, 2025',
        supplier: 'Local Farms Co-op',
        affectedRecipes: 5,
        items: [
            { ingredientName: 'Tomatoes, Roma', oldPrice: 2.30, newPrice: 2.15, category: 'Produce' },
        ]
    },
    {
        date: 'Jan 10, 2025',
        supplier: 'US Foods',
        affectedRecipes: 8,
        items: [
            { ingredientName: 'All-Purpose Flour', oldPrice: 0.42, newPrice: 0.38, category: 'Dry Goods' },
            { ingredientName: 'Olive Oil', oldPrice: 11.80, newPrice: 12.10, category: 'Dry Goods' },
            { ingredientName: 'Brioche Buns', oldPrice: 0.75, newPrice: 0.82, category: 'Dry Goods' },
        ]
    },
     {
        date: 'Jan 2, 2025',
        supplier: 'Sysco',
        affectedRecipes: 3,
        items: [
            { ingredientName: 'Cheddar Cheese, Sliced', oldPrice: 3.25, newPrice: 3.15, category: 'Dairy' },
        ]
    }
];

export const targetCosts = {
    overall: 30,
    byCategory: {
        'Entrees': 30,
        'Sides': 25,
        'Desserts': 20,
        'Beverages': 18
    }
};
