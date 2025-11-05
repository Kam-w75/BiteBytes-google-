import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Header } from './Header';
import { Recipe, NutritionData } from '../types';
import { SparklesIcon, ArrowPathIcon, XCircleIcon } from './Icons';

interface NutritionInfoProps {
    recipes: Recipe[];
}

const NutritionLabel: React.FC<{ data: NutritionData, recipeName: string, servings: number }> = ({ data, recipeName, servings }) => (
    <div className="border-4 border-black p-2 font-sans bg-white text-black max-w-sm mx-auto">
        <h2 className="text-3xl font-extrabold">Nutrition Facts</h2>
        <p className="border-b-2 border-black pb-1">{servings} serving{servings > 1 ? 's' : ''} per recipe</p>
        <p className="font-bold text-right">Amount per serving</p>
        <div className="flex justify-between items-end border-b-8 border-black pb-1">
            <h3 className="text-4xl font-extrabold">Calories</h3>
            <p className="text-5xl font-extrabold">{data.calories}</p>
        </div>
        <p className="text-right font-bold text-sm">% Daily Value*</p>
        <div className="border-t-2 border-black space-y-0.5">
            <p><span className="font-bold">Total Fat</span> {data.totalFat}</p>
            <p className="pl-4">Saturated Fat {data.saturatedFat}</p>
            <p className="pl-4"><i>Trans</i> Fat {data.transFat}</p>
            <p><span className="font-bold">Cholesterol</span> {data.cholesterol}</p>
            <p><span className="font-bold">Sodium</span> {data.sodium}</p>
            <p><span className="font-bold">Total Carbohydrate</span> {data.totalCarbohydrate}</p>
            <p className="pl-4">Dietary Fiber {data.dietaryFiber}</p>
            <p className="pl-4">Total Sugars {data.totalSugars}</p>
            <p><span className="font-bold">Protein</span> {data.protein}</p>
        </div>
        <div className="border-t-8 border-black pt-1 mt-1">
            <p className="text-xs">*The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily diet. 2,000 calories a day is used for general nutrition advice.</p>
        </div>
        {data.allergens && data.allergens.length > 0 && (
            <div className="border-t-2 border-black mt-2 pt-1">
                <p className="font-bold">CONTAINS: {data.allergens.join(', ')}.</p>
            </div>
        )}
    </div>
);

export const NutritionInfo: React.FC<NutritionInfoProps> = ({ recipes }) => {
    const [selectedRecipeId, setSelectedRecipeId] = useState<string>('');
    const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!selectedRecipeId) return;

        const recipe = recipes.find(r => r.id === selectedRecipeId);
        if (!recipe) return;

        setIsLoading(true);
        setError(null);
        setNutritionData(null);

        try {
            if (!process.env.API_KEY) {
                throw new Error("API_KEY environment variable not set");
            }
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const ingredientList = recipe.ingredients.map(i => `${i.quantity} ${i.unit} ${i.name}`).join(', ');
            const prompt = `You are a nutritional analysis expert. Based on the following recipe ingredients and quantities, generate a standard nutritional information label. The recipe name is '${recipe.name}' and it makes ${recipe.servings} servings. Calculate the nutrition PER SERVING. The ingredients are: ${ingredientList}. Provide the output as a JSON object.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            calories: { type: Type.NUMBER },
                            totalFat: { type: Type.STRING, description: "e.g., '10g'" },
                            saturatedFat: { type: Type.STRING, description: "e.g., '5g'" },
                            transFat: { type: Type.STRING, description: "e.g., '0g'" },
                            cholesterol: { type: Type.STRING, description: "e.g., '30mg'" },
                            sodium: { type: Type.STRING, description: "e.g., '660mg'" },
                            totalCarbohydrate: { type: Type.STRING, description: "e.g., '29g'" },
                            dietaryFiber: { type: Type.STRING, description: "e.g., '3g'" },
                            totalSugars: { type: Type.STRING, description: "e.g., '5g'" },
                            protein: { type: Type.STRING, description: "e.g., '30g'" },
                            allergens: { type: Type.ARRAY, items: { type: Type.STRING }, description: "e.g., ['Wheat', 'Dairy', 'Soy']" }
                        },
                        required: ["calories", "totalFat", "saturatedFat", "transFat", "cholesterol", "sodium", "totalCarbohydrate", "dietaryFiber", "totalSugars", "protein", "allergens"]
                    }
                }
            });

            const data = JSON.parse(response.text);
            setNutritionData(data);

        } catch (e: any) {
            setError(`Failed to analyze recipe: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const selectedRecipe = recipes.find(r => r.id === selectedRecipeId);

    return (
        <div>
            <Header
                title="Nutrition Analysis"
                subtitle="Automatically generate nutrition information for your recipes."
            />
            <div className="p-6 max-w-4xl mx-auto">
                <div className="bg-[#2C2C2C] p-6 rounded-lg shadow-sm border border-[#444444]">
                    <h3 className="text-lg font-semibold text-gray-200">Select a Recipe to Analyze</h3>
                    <div className="mt-4 flex flex-col sm:flex-row gap-4">
                        <select
                            value={selectedRecipeId}
                            onChange={(e) => setSelectedRecipeId(e.target.value)}
                            className="flex-grow bg-transparent border-[#444444] rounded-md shadow-sm focus:ring-[#FF6B6B] focus:border-[#FF6B6B]"
                        >
                            <option value="" disabled>-- Choose a recipe --</option>
                            {recipes.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                        <button
                            onClick={handleAnalyze}
                            disabled={!selectedRecipeId || isLoading}
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-semibold rounded-md shadow-sm text-black bg-[#FF6B6B] hover:bg-[#E85A5A] disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5" />
                            ) : (
                                <SparklesIcon className="-ml-1 mr-2 h-5 w-5" />
                            )}
                            {isLoading ? 'Analyzing...' : 'Analyze with Gemini'}
                        </button>
                    </div>
                </div>

                <div className="mt-8">
                    {error && (
                         <div className="rounded-md bg-red-900/50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                <XCircleIcon className="h-5 w-5 text-red-400" />
                                </div>
                                <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-300">Analysis Failed</h3>
                                <div className="mt-2 text-sm text-red-300">
                                    <p>{error}</p>
                                </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {nutritionData && selectedRecipe && (
                        <div>
                            <h3 className="text-2xl font-bold text-center text-gray-100 mb-4">{selectedRecipe.name}</h3>
                            <NutritionLabel data={nutritionData} recipeName={selectedRecipe.name} servings={selectedRecipe.servings}/>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};