import { useState } from 'react';
import { ChatMessage, Recipe, Ingredient } from '../types';

const getAIResponse = (
  message: string,
  recipes: Recipe[],
  ingredients: Ingredient[]
): string => {
  const lowerCaseMessage = message.toLowerCase();

  // 1. "Why is my food cost high?"
  if (lowerCaseMessage.includes('food cost')) {
    const totalCostOfGoods = recipes.reduce((total, recipe) => {
        return total + recipe.ingredients.reduce((recipeTotal, ing) => recipeTotal + (ing.cost || 0) * ing.quantity, 0);
    }, 0);
    const totalRevenue = recipes.reduce((total, recipe) => total + recipe.menuPrice * recipe.servings, 0);
    const overallFoodCostPercent = totalRevenue > 0 ? (totalCostOfGoods / totalRevenue) * 100 : 0;
    const target = 30;

    if (overallFoodCostPercent > target) {
      const highTrendIngredient = ingredients.sort((a, b) => (b.priceTrend || 0) - (a.priceTrend || 0))[0];
      const costIncrease = (highTrendIngredient.cost * (highTrendIngredient.priceTrend || 0)).toFixed(2);
      return `Let me check... Your food cost is ${overallFoodCostPercent.toFixed(1)}% (target: ${target}%). The biggest reason: ${highTrendIngredient.name} prices went up ${((highTrendIngredient.priceTrend || 0) * 100).toFixed(0)}% this week. That added about $${costIncrease} to the cost per ${highTrendIngredient.unit}. Want to see which recipes were affected?`;
    } else {
       return `Your current food cost is ${overallFoodCostPercent.toFixed(1)}%, which is below your target of ${target}%. Great job!`;
    }
  }

  // 2. "What's my most profitable dish?"
  if (lowerCaseMessage.includes('most profitable')) {
    let mostProfitable: Recipe | null = null;
    let maxProfitMargin = -Infinity;

    recipes.forEach(recipe => {
        const totalCost = recipe.ingredients.reduce((acc, ing) => acc + (ing.cost || 0) * ing.quantity, 0);
        const costPerServing = recipe.servings > 0 ? totalCost / recipe.servings : 0;
        const profitMargin = recipe.menuPrice > 0 ? ((recipe.menuPrice - costPerServing) / recipe.menuPrice) * 100 : 0;
        
        if (profitMargin > maxProfitMargin) {
            maxProfitMargin = profitMargin;
            mostProfitable = recipe;
        }
    });

    if (mostProfitable) {
        const totalCost = mostProfitable.ingredients.reduce((acc, ing) => acc + (ing.cost || 0) * ing.quantity, 0);
        const costPerServing = mostProfitable.servings > 0 ? totalCost / mostProfitable.servings : 0;
        return `Your ${mostProfitable.name}! It costs $${costPerServing.toFixed(2)} to make and you sell it for $${mostProfitable.menuPrice.toFixed(2)}. That's a ${maxProfitMargin.toFixed(0)}% profit margin 💰.`;
    }
    return "I couldn't determine the most profitable dish right now.";
  }
  
  // 3. "How much does my burger cost?"
  const costMatch = lowerCaseMessage.match(/how much does my (.*) cost/);
  if (costMatch && costMatch[1]) {
      const recipeName = costMatch[1].replace('?', '').trim();
      const recipe = recipes.find(r => r.name.toLowerCase().includes(recipeName));
      if (recipe) {
          const totalCost = recipe.ingredients.reduce((acc, ing) => acc + (ing.cost || 0) * ing.quantity, 0);
          const costPerServing = recipe.servings > 0 ? totalCost / recipe.servings : 0;
          const foodCostPercent = recipe.menuPrice > 0 ? (costPerServing / recipe.menuPrice) * 100 : 0;
          return `Your ${recipe.name} costs $${costPerServing.toFixed(2)} per serving. That's a ${foodCostPercent.toFixed(1)}% food cost when you sell it for $${recipe.menuPrice.toFixed(2)}. Want to see the ingredient breakdown?`;
      }
      return `I couldn't find a recipe called "${recipeName}". Please check the name and try again.`;
  }

  // 4. "Show me all chicken recipes"
  const showMatch = lowerCaseMessage.match(/show me all (.*) recipes/);
  if (showMatch && showMatch[1]) {
      const ingredientName = showMatch[1].trim();
      const matchingRecipes = recipes.filter(r => 
        r.ingredients.some(i => i.name.toLowerCase().includes(ingredientName))
      );
      if (matchingRecipes.length > 0) {
        let response = `You have ${matchingRecipes.length} recipes with ${ingredientName}:\n`;
        matchingRecipes.forEach(r => {
           const totalCost = r.ingredients.reduce((acc, ing) => acc + (ing.cost || 0) * ing.quantity, 0);
           const costPerServing = r.servings > 0 ? totalCost / r.servings : 0;
           response += `\n- ${r.name} ($${costPerServing.toFixed(2)} each)`;
        });
        response += "\n\nWhich one do you want to look at?";
        return response;
      }
      return `I couldn't find any recipes containing "${ingredientName}".`;
  }

  return "I'm sorry, I can't help with that yet. You can ask me about:\n- Your overall food cost\n- Your most profitable dish\n- The cost of a specific recipe";
};


export const useAIChat = (recipes: Recipe[], ingredients: Ingredient[]) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: "Hello! How can I help you manage your kitchen today?",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = (text: string) => {
    const userMessage: ChatMessage = {
      sender: 'user',
      text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    setTimeout(() => {
      const aiResponseText = getAIResponse(text, recipes, ingredients);
      const aiMessage: ChatMessage = {
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1200); // Simulate network latency and processing time
  };

  return { messages, isLoading, sendMessage };
};
