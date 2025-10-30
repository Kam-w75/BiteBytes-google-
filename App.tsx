import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { RecipeCosting } from './components/RecipeCosting';
import { InvoiceScanner } from './components/InvoiceScanner';
import { NutritionInfo } from './components/NutritionInfo';
import { HelpDocs } from './components/HelpDocs';
import { OnboardingWelcome } from './components/OnboardingWelcome';
import { Stats } from './components/Stats';
import { FoodCostReport } from './components/FoodCostReport';
import { PriceChangeHistory } from './components/PriceChangeHistory';
import { AuraOrb } from './components/AuraOrb';
import { VoiceRecipeCreator } from './components/VoiceRecipeCreator';
import { recipes } from './data';
import { Recipe } from './types';
import { TargetCosting } from './components/TargetCosting';
import { ImportExportHub } from './components/ImportExportHub';

export type Page = 'dashboard' | 'costing' | 'reports' | 'price-history' | 'invoices' | 'nutrition' | 'import-export' | 'settings' | 'help';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showVoiceCreator, setShowVoiceCreator] = useState(false);
  const [allRecipes, setAllRecipes] = useState<Recipe[]>(recipes);


  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Stats />;
      case 'costing':
        return <RecipeCosting onAddRecipeClick={() => setShowVoiceCreator(true)} setCurrentPage={setCurrentPage} />;
      case 'reports':
        return <FoodCostReport />;
      case 'price-history':
        return <PriceChangeHistory />;
      case 'invoices':
        return <InvoiceScanner />;
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

  const handleRecipeCreate = (newRecipe: Omit<Recipe, 'id'>) => {
    const recipeWithId: Recipe = { ...newRecipe, id: `r${allRecipes.length + 1}` };
    setAllRecipes(prev => [...prev, recipeWithId]);
    setShowVoiceCreator(false);
    // You might want to navigate to the new recipe's detail page or costing page
    setCurrentPage('costing');
  };

  if (showOnboarding) {
    return <OnboardingWelcome onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          {renderPage()}
        </div>
      </main>
      <AuraOrb setCurrentPage={setCurrentPage} />
      {showVoiceCreator && <VoiceRecipeCreator onClose={() => setShowVoiceCreator(false)} onRecipeCreate={handleRecipeCreate} />}
    </div>
  );
};

export default App;