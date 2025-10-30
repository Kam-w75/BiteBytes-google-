export interface Ingredient {
  id: string;
  name: string;
  cost: number;
  unit: string;
  supplier: string;
  usedInRecipes: number;
  priceTrend?: number;
  category: 'Meat' | 'Produce' | 'Dairy' | 'Dry Goods' | 'Spices' | 'Canned' | 'Beverages' | 'Other';
}

export interface RecipeIngredient {
  id: string; // Corresponds to an Ingredient id
  name: string;
  quantity: number;
  unit: string;
  cost?: number; // per unit
  prep?: string;
  priceTrend?: number;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
  instructions: string;
  servings: number;
  menuPrice: number;
  laborTimeMinutes: number;
  imageUrl?: string;
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
    type: 'SOP' | 'Checklist' | 'Training';
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

export interface VendorContact {
    name: string;
    phone: string;
    email: string;
}

export interface Vendor {
    id: string;
    name: string;
    lastOrderDate: string;
    totalSpend: number;
    itemCount: number;
    accountNumber?: string;
    contact: VendorContact;
    type: 'Broadline' | 'Produce' | 'Specialty' | 'Other';
    isPrimary: boolean;
    orderDays: string[];
    paymentTerms: string;
}

export interface ScannedItem {
  itemName: string;
  quantity: number;
  price: number;
  unit: string;
  confidence?: number;
}

export enum InsightType {
    Warning = 'warning',
    Opportunity = 'opportunity',
    Success = 'success'
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
    category: Ingredient['category'];
}

export interface PriceChangeEntry {
    date: string;
    supplier: string;
    items: PriceChangeItem[];
    affectedRecipes: number;
}