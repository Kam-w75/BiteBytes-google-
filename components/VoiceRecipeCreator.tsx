import React, { useState, useCallback } from 'react';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { GoogleGenAI, Type } from '@google/genai';
import { Recipe } from '../types';
import { MicrophoneIcon, StopIcon, ArrowPathIcon, SparklesIcon, CheckCircleIcon } from './Icons';

export const VoiceRecipeCreator: React.FC = () => {
    const [structuredRecipe, setStructuredRecipe] = useState<Recipe | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const processTranscript = useCallback(async (text: string) => {
        if (!text) return;
        setIsProcessing(true);
        setError(null);
        setStructuredRecipe(null);

        try {
            if (!process.env.API_KEY) throw new Error("API_KEY not set");
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const prompt = `You are a recipe parser. Convert the following voice transcript into a structured recipe. The response must include a name, ingredients (with name, quantity, unit, and an optional prep note), instructions (as a single string with newlines), servings, a suggested menu price, and labor time in minutes. Transcript: "${text}"`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            ingredients: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        name: { type: Type.STRING },
                                        quantity: { type: Type.NUMBER },
                                        unit: { type: Type.STRING },
                                        prep: { type: Type.STRING }
                                    },
                                    required: ["name", "quantity", "unit"]
                                }
                            },
                            instructions: { type: Type.STRING },
                            servings: { type: Type.NUMBER },
                            menuPrice: { type: Type.NUMBER },
                            laborTimeMinutes: { type: Type.NUMBER },
                        },
                        required: ["name", "ingredients", "instructions", "servings", "menuPrice", "laborTimeMinutes"]
                    }
                }
            });
            const recipeData = JSON.parse(response.text);
            setStructuredRecipe({ ...recipeData, id: `voice-${Date.now()}` });
        } catch (e: any) {
            setError(`Failed to create recipe from voice: ${e.message}`);
        } finally {
            setIsProcessing(false);
        }
    }, []);

    const { isListening, transcript, error: speechError, startListening, stopListening } = useSpeechToText({ onFinalTranscript: processTranscript });
    
    const hasContent = isListening || transcript || isProcessing || structuredRecipe || error || speechError;

    return (
        <div className="bg-[#2C2C2C] p-6 rounded-lg shadow-sm border border-[#444444]">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Voice Recipe Creator</h3>
            <div className="flex flex-col items-center justify-center space-y-4">
                <button
                    onClick={isListening ? stopListening : startListening}
                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-colors duration-200 ${
                        isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-[#FF6B6B] text-black'
                    }`}
                >
                    {isListening ? <StopIcon className="h-10 w-10" /> : <MicrophoneIcon className="h-10 w-10" />}
                </button>
                <p className="text-sm text-gray-400 h-5">
                    {isListening ? 'Listening...' : 'Tap to start speaking your recipe'}
                </p>
                
                {hasContent && (
                    <div className="w-full mt-6 p-4 bg-[#1E1E1E] rounded-md border border-gray-700 min-h-[150px]">
                        {speechError && <p className="text-red-400">{speechError}</p>}
                        {error && <p className="text-red-400">{error}</p>}
                        
                        {transcript && !structuredRecipe && <p className="text-gray-300 italic">"{transcript}"</p>}

                        {isProcessing && (
                            <div className="flex items-center justify-center text-gray-400">
                                <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                                Analyzing and structuring recipe...
                            </div>
                        )}

                        {structuredRecipe && (
                            <div className="space-y-3">
                                <h4 className="text-xl font-bold text-[#FF6B6B]">{structuredRecipe.name}</h4>
                                <p className="text-sm text-gray-400">Servings: {structuredRecipe.servings}, Price: ${structuredRecipe.menuPrice.toFixed(2)}</p>
                                <div>
                                    <h5 className="font-semibold text-gray-300">Ingredients:</h5>
                                    <ul className="list-disc list-inside text-sm text-gray-400">
                                        {structuredRecipe.ingredients.map((ing, i) => (
                                            <li key={i}>{ing.quantity} {ing.unit} {ing.name} {ing.prep ? `(${ing.prep})` : ''}</li>
                                        ))}
                                    </ul>
                                </div>
                                 <button className="w-full mt-4 flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md shadow-sm hover:bg-green-700">
                                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                                    Save to Recipe Book
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
