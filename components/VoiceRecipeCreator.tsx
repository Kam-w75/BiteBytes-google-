import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
// FIX: Corrected import path for Recipe type.
import { Recipe } from '../types';
// FIX: Corrected import path for Icons.
import { MicrophoneIcon, XMarkIcon, SparklesIcon, ArrowPathIcon } from './Icons';

interface VoiceRecipeCreatorProps {
    onClose: () => void;
    onRecipeCreate: (recipe: Omit<Recipe, 'id'>) => void;
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const speak = (text: string) => {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    }
};

export const VoiceRecipeCreator: React.FC<VoiceRecipeCreatorProps> = ({ onClose, onRecipeCreate }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (!SpeechRecognition) {
            setError("Your browser does not support Speech Recognition. Try Chrome or Edge.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            setTranscript(prev => prev + finalTranscript);
        };
        
        recognition.onerror = (event: any) => {
            if (event.error === 'not-allowed') {
                setError("Microphone access denied. Please allow microphone access in your browser settings for this page.");
            } else {
                setError(`Speech recognition error: ${event.error}`);
            }
            setIsListening(false);
        };
        
        recognition.onend = () => {
            setIsListening(false);
        }

        recognitionRef.current = recognition;

        // Automatically start listening when the modal opens
        startListening();
        speak("I'm listening. Please tell me the recipe you'd like to create.");

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            setTranscript('');
            setError('');
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    const handleProcessRecipe = async () => {
        if (!transcript) {
            setError("Please say something first.");
            return;
        }
        setIsProcessing(true);
        setError('');
        speak("Got it. Processing your recipe now.");

        try {
            if (!process.env.API_KEY) {
                throw new Error("API_KEY environment variable not set");
            }
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const prompt = `You are an expert chef's assistant. A chef has dictated a recipe. Your task is to parse the following text and structure it into a JSON object. The JSON object should have: name (string), ingredients (array of objects, each with name, quantity, and unit), instructions (a single string, can have newlines), servings (number), and laborTimeMinutes (number). If a value isn't mentioned, use a sensible default (e.g., 1 serving, 15 minutes labor). The final output must be only the JSON object. Chef's dictation: --- ${transcript}`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            ingredients: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, quantity: { type: Type.NUMBER }, unit: { type: Type.STRING }, category: { type: Type.STRING, enum: ['Meat', 'Produce', 'Dairy', 'Dry Goods', 'Spices', 'Canned', 'Beverages', 'Other'] } }, required: ["name", "quantity", "unit"] } },
                            instructions: { type: Type.STRING },
                            servings: { type: Type.NUMBER },
                            laborTimeMinutes: { type: Type.NUMBER }
                        },
                        required: ["name", "ingredients", "instructions", "servings", "laborTimeMinutes"]
                    }
                }
            });

            const recipeData = JSON.parse(response.text);
            speak("Recipe created successfully!");
            onRecipeCreate(recipeData);

        } catch (e: any) {
            console.error(e);
            setError(`Failed to create recipe: ${e.message}`);
            speak("Sorry, I couldn't process that. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <XMarkIcon className="h-6 w-6" />
                </button>
                <div className="flex items-center">
                    <SparklesIcon className="h-6 w-6 text-purple-600 mr-3" />
                    <h2 className="text-xl font-bold text-gray-800">Create Recipe with Voice</h2>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                    Start by saying "Create a recipe for...". Include ingredients, quantities, units, servings, labor time, and instructions.
                </p>
                
                <div className="mt-6 flex flex-col items-center">
                    <button
                        onClick={isListening ? stopListening : startListening}
                        disabled={isProcessing}
                        className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                            isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}
                    >
                        <MicrophoneIcon className="h-10 w-10" />
                    </button>
                    <p className="mt-4 text-sm font-medium text-gray-600 h-5">
                      {isListening ? "Listening..." : (transcript ? "Ready to process" : "Tap to speak")}
                    </p>
                </div>
                
                <textarea
                    value={transcript}
                    readOnly
                    placeholder="Your transcribed recipe will appear here..."
                    className="mt-4 w-full h-32 p-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                />

                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} type="button" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
                        Cancel
                    </button>
                    <button 
                        onClick={handleProcessRecipe}
                        disabled={isProcessing || !transcript}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                    >
                        {isProcessing ? <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5" /> : <SparklesIcon className="-ml-1 mr-2 h-5 w-5" />}
                        {isProcessing ? 'Processing...' : 'Create Recipe'}
                    </button>
                </div>
            </div>
        </div>
    );
};
