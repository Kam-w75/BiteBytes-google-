import React, { useState } from 'react';
import { Page } from '../App';
import { Header } from './Header';
import { FilterBar } from './FilterBar';
import { RecipesView } from './RecipesView';
import { IngredientsView } from './IngredientsView';
import { MenusView } from './MenusView';
import { RecipeBooksView } from './RecipeBooksView';
import { DocsView } from './DocsView';
import { PurchasesView } from './PurchasesView';
import { VendorsView } from './VendorsView';
import { RecipeDetailView } from './RecipeDetailView';
import { AddRecipeView } from './AddRecipeView';
import { AddIngredientView } from './AddIngredientView';
import { MenuDetailView } from './MenuDetailView';
import { menus, recipeBooks, docs, purchases } from '../data';
import { Recipe, Menu, Ingredient, Vendor } from '../types';

type CostingView = 
  | 'list' 
  | 'recipe-detail' 
  | 'menu-detail' 
  | 'add-recipe' 
  | 'edit-recipe' 
  | 'add-ingredient'
  | 'edit-ingredient';

interface RecipeCostingProps {
    setCurrentPage: (page: Page) => void;
    ingredients: Ingredient[];
    recipes: Recipe[];
    vendors: Vendor[];
    onAddNewIngredients: (newIngredients: Omit<Ingredient, 'id' | 'usedInRecipes' | 'priceTrend'>[]) => void;
    onUpdateIngredient: (ingredient: Ingredient) => void;
    onSaveRecipe: (recipe: Recipe) => void;
    onSaveVendor: (vendor: Vendor) => void;
    onDeleteVendor: (vendorId: string) => void;
}

export const RecipeCosting: React.FC<RecipeCostingProps> = ({ 
    setCurrentPage, 
    ingredients, 
    recipes,
    vendors,
    onAddNewIngredients, 
    onUpdateIngredient,
    onSaveRecipe,
    onSaveVendor,
    onDeleteVendor
}) => {
    const [activeFilter, setActiveFilter] = useState('Ingredients');
    const [view, setView] = useState<CostingView>('list');
    
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
    const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);

    const handleSelectRecipe = (recipe: Recipe) => {
        setSelectedRecipe(recipe);
        setView('recipe-detail');
    };
    
    const handleSelectIngredient = (ingredient: Ingredient) => {
        setSelectedIngredient(ingredient);
        setView('edit-ingredient');
    };

    const handleSelectMenu = (menu: Menu) => {
        setSelectedMenu(menu);
        setView('menu-detail');
    }

    const handleBackToList = (targetFilter: string) => () => {
        setSelectedRecipe(null);
        setSelectedMenu(null);
        setSelectedIngredient(null);
        setActiveFilter(targetFilter);
        setView('list');
    };
    
    const handleBack = handleBackToList('Recipes');

    const handleAddRecipeClick = () => setView('add-recipe');
    const handleAddIngredientClick = () => setView('add-ingredient');
    
    const handleSaveRecipe = (newRecipe: Recipe) => {
        onSaveRecipe(newRecipe);
        handleBack();
    };
    
    const handleSaveIngredient = (ingredientData: Partial<Ingredient>) => {
        if (ingredientData.id) {
            onUpdateIngredient(ingredientData as Ingredient);
        } else {
            onAddNewIngredients([ingredientData as Omit<Ingredient, 'id' | 'usedInRecipes'>]);
        }
        handleBackToList('Ingredients')();
    };


    const renderContent = () => {
        switch (view) {
            case 'recipe-detail':
                return selectedRecipe && <RecipeDetailView recipe={selectedRecipe} allIngredients={ingredients} onBack={handleBack} />;
            case 'menu-detail':
                return selectedMenu && <MenuDetailView menu={selectedMenu} recipes={recipes} allIngredients={ingredients} onBack={handleBack} onSelectRecipe={handleSelectRecipe} />;
            case 'add-recipe':
                return <AddRecipeView onBack={handleBack} onSave={handleSaveRecipe} allIngredients={ingredients} />;
            case 'add-ingredient':
                return <AddIngredientView onBack={handleBackToList('Ingredients')} onSave={handleSaveIngredient} vendors={vendors} />;
            case 'edit-ingredient':
                return selectedIngredient && <AddIngredientView onBack={handleBackToList('Ingredients')} onSave={handleSaveIngredient} vendors={vendors} ingredientToEdit={selectedIngredient} />;
            case 'list':
            default:
                switch (activeFilter) {
                    case 'Recipes':
                        return <RecipesView recipes={recipes} allIngredients={ingredients} onSelectRecipe={handleSelectRecipe} onAddRecipeClick={handleAddRecipeClick} />;
                    case 'Ingredients':
                        return <IngredientsView ingredients={ingredients} onAddIngredientClick={handleAddIngredientClick} onSelectIngredient={handleSelectIngredient} />;
                    case 'Menus':
                        return <MenusView menus={menus} recipes={recipes} onSelectMenu={handleSelectMenu} />;
                    case 'Recipe Books':
                        return <RecipeBooksView recipeBooks={recipeBooks} />;
                    case 'Docs':
                        return <DocsView docs={docs} />;

                    case 'New Purchase Items':
                        return <PurchasesView purchases={purchases} />;
                    case 'Vendors':
                        return <VendorsView vendors={vendors} ingredients={ingredients} onSaveVendor={onSaveVendor} onDeleteVendor={onDeleteVendor} />;
                    default:
                        return <RecipesView recipes={recipes} allIngredients={ingredients} onSelectRecipe={handleSelectRecipe} onAddRecipeClick={handleAddRecipeClick} />;
                }
        }
    };

    const handleFilterChange = (filter: string) => {
        setView('list'); 
        setActiveFilter(filter);
    };

    return (
        <div>
            <Header title="Costing Hub" subtitle="Manage your recipes, ingredients, and costs." />
            <div className="p-6">
                {view === 'list' && <FilterBar activeFilter={activeFilter} onFilterChange={handleFilterChange} />}
                <div className="mt-6">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};