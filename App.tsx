import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { RecipeCosting } from './components/RecipeCosting';
import { InvoiceScanner } from './components/InvoiceScanner';
import { NutritionInfo } from './components/NutritionInfo';
import { HelpDocs } from './components/HelpDocs';
import { OnboardingWelcome } from './components/OnboardingWelcome';
import { Stats } from './components/Stats';
import { FoodCostReport } from './components/FoodCostReport';
import { PriceChangeHistory } from './components/PriceChangeHistory';
import { TargetCosting } from './components/TargetCosting';
import { ImportExportHub } from './components/ImportExportHub';
import { LiveAssistant } from './components/LiveAssistant';
import { MobileHeader } from './components/MobileHeader';
import { OrderingView } from './components/OrderingView';
import { ingredients as initialIngredients, vendors as initialVendors, recipes as initialRecipes } from './data';
import { Ingredient, Recipe, Vendor } from './types';

export type Page = 'dashboard' | 'costing' | 'ordering' | 'reports' | 'price-history' | 'invoices' | 'nutrition' | 'import-export' | 'settings' | 'help';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('costing');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // --- Persistent State Management ---
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    try {
      const saved = window.localStorage.getItem('bitebytes-ingredients');
      return saved ? JSON.parse(saved) : initialIngredients;
    } catch (e) {
      console.error("Could not load ingredients from localStorage", e);
      return initialIngredients;
    }
  });

  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    try {
      const saved = window.localStorage.getItem('bitebytes-recipes');
      return saved ? JSON.parse(saved) : initialRecipes;
    } catch (e) {
      console.error("Could not load recipes from localStorage", e);
      return initialRecipes;
    }
  });
  
  const [vendors, setVendors] = useState<Vendor[]>(() => {
    try {
      const saved = window.localStorage.getItem('bitebytes-vendors');
      return saved ? JSON.parse(saved) : initialVendors;
    } catch (e) {
      console.error("Could not load vendors from localStorage", e);
      return initialVendors;
    }
  });

  useEffect(() => {
    window.localStorage.setItem('bitebytes-ingredients', JSON.stringify(ingredients));
  }, [ingredients]);
  
  useEffect(() => {
    window.localStorage.setItem('bitebytes-recipes', JSON.stringify(recipes));
  }, [recipes]);
  
  useEffect(() => {
    window.localStorage.setItem('bitebytes-vendors', JSON.stringify(vendors));
  }, [vendors]);

  // --- Data Handlers ---
  const handleAddNewIngredients = (newIngredientsData: Omit<Ingredient, 'id' | 'usedInRecipes' | 'priceTrend'>[]) => {
      const newIngredients: Ingredient[] = newIngredientsData.map((ingData, index) => ({
        ...ingData,
        id: `ing-${Date.now()}-${index}`,
        usedInRecipes: 0,
        priceTrend: 0,
      }));
      setIngredients(prevIngredients => [...prevIngredients, ...newIngredients]);
  };
  
  const handleUpdateIngredient = (updatedIngredient: Ingredient) => {
    setIngredients(prevIngredients =>
      prevIngredients.map(ing => (ing.id === updatedIngredient.id ? updatedIngredient : ing))
    );
  };

  const handleSaveRecipe = (recipeToSave: Recipe) => {
    setRecipes(prev => {
        const exists = prev.some(r => r.id === recipeToSave.id);
        if (exists) {
            return prev.map(r => r.id === recipeToSave.id ? recipeToSave : r);
        }
        return [...prev, recipeToSave];
    });
  };

  const handleSaveVendor = (vendorToSave: Vendor) => {
    setVendors(prev => {
        const exists = prev.some(v => v.id === vendorToSave.id);
        if (exists) {
            return prev.map(v => v.id === vendorToSave.id ? vendorToSave : v);
        }
        const newVendor = { ...vendorToSave, id: `vendor-${Date.now()}`};
        return [...prev, newVendor];
    });
  };

  const handleDeleteVendor = (vendorId: string) => {
    setVendors(prev => prev.filter(v => v.id !== vendorId));
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Stats />;
      case 'costing':
        return <RecipeCosting 
          setCurrentPage={setCurrentPage} 
          ingredients={ingredients}
          recipes={recipes}
          vendors={vendors}
          onAddNewIngredients={handleAddNewIngredients} 
          onUpdateIngredient={handleUpdateIngredient} 
          onSaveRecipe={handleSaveRecipe}
          onSaveVendor={handleSaveVendor}
          onDeleteVendor={handleDeleteVendor}
        />;
      case 'ordering':
        return <OrderingView />;
      case 'reports':
        return <FoodCostReport />;
      case 'price-history':
        return <PriceChangeHistory recipes={recipes} ingredients={ingredients} />;
      case 'invoices':
        return <InvoiceScanner onAddNewIngredients={handleAddNewIngredients} vendors={vendors} />;
      case 'nutrition':
        return <NutritionInfo />;
      case 'import-export':
        return <ImportExportHub />;
      case 'settings':
        return <TargetCosting />;
      case 'help':
        return <HelpDocs />;
      default:
        return <Stats />;
    }
  };

  if (showOnboarding) {
    return <OnboardingWelcome onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="flex h-screen bg-[#1E1E1E] font-sans text-gray-200">
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <MobileHeader onMenuClick={() => setIsSidebarOpen(true)} />
        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-[#1E1E1E]">
          {renderPage()}
        </div>
      </main>
      <LiveAssistant />
    </div>
  );
};

export default App;