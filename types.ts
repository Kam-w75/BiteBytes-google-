// FIX: Define and export all necessary types for the application.

export type IngredientCategory = 'Meat' | 'Produce' | 'Dairy' | 'Dry Goods' | 'Spices' | 'Canned' | 'Beverages' | 'Other';

export interface Vendor {
    id: string;
    name: string;
    lastOrderDate: string;
    totalSpend: number;
    itemCount: number;
    accountNumber?: string;
    contact: {
        name: string;
        phone: string;
        email: string;
    };
    type: 'Broadline' | 'Produce' | 'Specialty' | 'Other';
    isPrimary: boolean;
    orderDays: string[];
    paymentTerms: string;
}

export interface Ingredient {
    id: string;
    name: string;
    cost: number;
    unit: string;
    vendorId: string;
    supplier?: string; // used in some components but not in data
    usedInRecipes: number;
    priceTrend?: number;
    category: IngredientCategory;
}

export interface RecipeIngredient {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    prep?: string;
    cost?: number;
    priceTrend?: number;
    category?: IngredientCategory;
}

export interface Recipe {
    id: string;
    name: string;
    servings: number;
    menuPrice: number;
    laborTimeMinutes: number;
    imageUrl?: string;
    ingredients: RecipeIngredient[];
    instructions: string;
}

export interface Menu {
    id: string;
    name: string;
    recipeIds: string[];
}

export interface RecipeBook {
    id: string;
    name: string;
    recipeIds: string[];
}

export interface Doc {
    id: string;
    name: string;
    type: 'Checklist' | 'SOP' | 'Training';
    lastUpdated: string;
}

export interface PurchaseItem {
    id: string;
    name: string;
    supplier: string;
    purchaseDate: string;
    quantity: number;
    unit: string;
    totalCost: number;
    status: 'Needs Mapping' | 'Mapped';
}

export enum InsightType {
    Warning,
    Opportunity,
    Success
}

export interface Insight {
    id: string;
    type: InsightType;
    headline: string;
    explanation: string;
    actionText: string;
}

export interface PriceChangeItem {
    ingredientName: string;
    oldPrice: number;
    newPrice: number;
    category: IngredientCategory;
}

export interface PriceChangeEntry {
    date: string;
    supplier: string;
    affectedRecipes: number;
    items: PriceChangeItem[];
}

export interface ScannedItem {
  itemName: string;
  quantity: number;
  price: number;
  unit: string;
  confidence?: number;
}

export interface SpecialSuggestion {
  name: string;
  description: string;
  keyIngredients: string[];
}

export interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
    timestamp: Date;
}

export interface PurchaseOrderItem {
    ingredientId: string;
    name: string;
    currentPar: number;
    suggestedQuantity: number;
    unit: string;
    price: number;
    reasoning: string;
}

export interface PurchaseOrder {
    vendorId: string;
    vendorName: string;
    items: PurchaseOrderItem[];
}
