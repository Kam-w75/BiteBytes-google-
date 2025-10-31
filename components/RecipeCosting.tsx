import React, { useState } from 'react';
import { Page } from '../App';
import { Header } from './Header';
import { FilterBar } from './FilterBar';
import { recipes, ingredients, menus, recipeBooks, docs, purchases, vendors } from '../data';
import { Recipe, Menu } from '../types';
import { RecipesView } from './RecipesView';
import { IngredientsView } from './IngredientsView';
import { MenusView } from './MenusView';
import { RecipeBooksView } from './RecipeBooksView';
import { DocsView } from './DocsView';
import { PurchasesView } from './PurchasesView';
import { VendorsView } from './VendorsView';
import { RecipeDetailView } from './RecipeDetailView';
import { AddIngredientView } from './AddIngredientView';
import { MenuDetailView } from './MenuDetailView';

interface RecipeCostingProps {
  onAddRecipeClick: () => void;
  setCurrentPage: (page: Page) => void;
}

type ViewState = 
  | { view: 'list'; filter: string }
  | { view: 'recipe-detail'; recipe: Recipe }
  | { view: 'add-ingredient' }
  | { view: 'menu-detail'; menu: Menu };

export const RecipeCosting: React.FC<RecipeCostingProps> = ({ onAddRecipeClick, setCurrentPage }) => {
  const [state, setState] = useState<ViewState>({ view: 'list', filter: 'Recipes' });
  
  const renderContent = () => {
    if (state.view === 'recipe-detail') {
      return <RecipeDetailView recipe={state.recipe} onBack={() => setState({ view: 'list', filter: 'Recipes' })} />;
    }
    
    if (state.view === 'menu-detail') {
      return <MenuDetailView 
        menu={state.menu} 
        recipes={recipes}
        onBack={() => setState({ view: 'list', filter: 'Menus' })}
        onSelectRecipe={(recipe) => setState({ view: 'recipe-detail', recipe })}
      />;
    }
    
    if (state.view === 'add-ingredient') {
      return <AddIngredientView onBack={() => setState({ view: 'list', filter: 'Ingredients' })} setCurrentPage={setCurrentPage} vendors={vendors} />;
    }
    
    // Default to 'list' view
    switch (state.filter) {
      case 'Recipes':
        return <RecipesView recipes={recipes} onAddRecipeClick={onAddRecipeClick} onSelectRecipe={(recipe) => setState({ view: 'recipe-detail', recipe })} />;
      case 'Ingredients':
        return <IngredientsView ingredients={ingredients} onAddIngredientClick={() => setState({ view: 'add-ingredient' })} />;
      case 'Menus':
        return <MenusView menus={menus} recipes={recipes} onSelectMenu={(menu) => setState({ view: 'menu-detail', menu })} />;
      case 'Recipe Books':
        return <RecipeBooksView recipeBooks={recipeBooks} />;
      case 'Docs':
        return <DocsView docs={docs} />;
      case 'New Purchase Items':
        return <PurchasesView purchases={purchases} />;
      case 'Vendors':
        return <VendorsView vendors={vendors} />;
      default:
        return <RecipesView recipes={recipes} onAddRecipeClick={onAddRecipeClick} onSelectRecipe={(recipe) => setState({ view: 'recipe-detail', recipe })} />;
    }
  };
  
  const handleFilterChange = (newFilter: string) => {
    setState({ view: 'list', filter: newFilter });
  };
  
  if (state.view === 'recipe-detail' || state.view === 'add-ingredient' || state.view === 'menu-detail') {
      return renderContent();
  }

  return (
    <div>
      <Header
        title="Recipe & Ingredient Costing"
        subtitle="Manage all your recipes, ingredients, and associated costs."
      >
          <FilterBar activeFilter={state.filter} onFilterChange={handleFilterChange} />
      </Header>
      <div className="p-6">
        {renderContent()}
      </div>
    </div>
  );
};