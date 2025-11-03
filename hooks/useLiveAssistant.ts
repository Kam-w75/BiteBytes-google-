import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, FunctionDeclaration, Type } from '@google/genai';
import { ChatMessage, Recipe, Ingredient } from '../types';
import { recipes, ingredients } from '../data';

type AssistantStatus = 'idle' | 'listening' | 'speaking' | 'connecting' | 'error';

// --- Function Implementations for AI Tools ---

const getFoodCostAnalysis = () => {
    const totalCostOfGoods = recipes.reduce((total, recipe) => {
        return total + recipe.ingredients.reduce((recipeTotal, ing) => recipeTotal + (ing.cost || 0) * ing.quantity, 0);
    }, 0);
    const totalRevenue = recipes.reduce((total, recipe) => total + recipe.menuPrice * recipe.servings, 0);
    const overallFoodCostPercent = totalRevenue > 0 ? (totalCostOfGoods / totalRevenue) * 100 : 0;
    const target = 30;

    const highTrendIngredient = ingredients
        .filter(i => (i.priceTrend || 0) > 0)
        .sort((a, b) => (b.priceTrend || 0) - (a.priceTrend || 0))[0];
    
    return JSON.stringify({
        overallFoodCostPercent: overallFoodCostPercent.toFixed(1),
        target: target,
        primaryDriver: highTrendIngredient ? {
            name: highTrendIngredient.name,
            priceTrend: `${((highTrendIngredient.priceTrend || 0) * 100).toFixed(0)}%`
        } : null
    });
};

const getMostProfitableRecipe = () => {
    let mostProfitableRecipe: any = null;
    let maxProfitMargin = -Infinity;

    recipes.forEach(recipe => {
        const totalCost = recipe.ingredients.reduce((acc, ing) => acc + (ing.cost || 0) * ing.quantity, 0);
        const costPerServing = recipe.servings > 0 ? totalCost / recipe.servings : 0;
        const profitMargin = recipe.menuPrice > 0 ? ((recipe.menuPrice - costPerServing) / recipe.menuPrice) * 100 : 0;
        
        if (profitMargin > maxProfitMargin) {
            maxProfitMargin = profitMargin;
            mostProfitableRecipe = {
                name: recipe.name,
                costPerServing: costPerServing.toFixed(2),
                menuPrice: recipe.menuPrice.toFixed(2),
                profitMargin: profitMargin.toFixed(0)
            };
        }
    });

    if (mostProfitableRecipe) {
        return JSON.stringify(mostProfitableRecipe);
    }
    return JSON.stringify({ error: "Could not determine the most profitable recipe." });
};

const getRecipeDetails = (recipeName: string) => {
    const recipe = recipes.find(r => r.name.toLowerCase().includes(recipeName.toLowerCase()));
    if (recipe) {
        const totalCost = recipe.ingredients.reduce((acc, ing) => acc + (ing.cost || 0) * ing.quantity, 0);
        const costPerServing = recipe.servings > 0 ? totalCost / recipe.servings : 0;
        const foodCostPercent = recipe.menuPrice > 0 ? (costPerServing / recipe.menuPrice) * 100 : 0;
        return JSON.stringify({
            name: recipe.name,
            costPerServing: costPerServing.toFixed(2),
            menuPrice: recipe.menuPrice.toFixed(2),
            foodCostPercent: foodCostPercent.toFixed(1),
        });
    }
    return JSON.stringify({ error: `Recipe "${recipeName}" not found.` });
};

const findRecipesByIngredient = (ingredientName: string) => {
    const matchingRecipes = recipes.filter(r => 
        r.ingredients.some(i => i.name.toLowerCase().includes(ingredientName.toLowerCase()))
      );
    if (matchingRecipes.length > 0) {
        return JSON.stringify({
            ingredient: ingredientName,
            count: matchingRecipes.length,
            recipes: matchingRecipes.map(r => r.name)
        });
    }
    return JSON.stringify({ error: `Could not find any recipes containing "${ingredientName}".` });
};

const functionHandlers: { [key: string]: (args: any) => string } = {
    getFoodCostAnalysis: () => getFoodCostAnalysis(),
    getMostProfitableRecipe: () => getMostProfitableRecipe(),
    getRecipeDetails: (args) => getRecipeDetails(args.recipeName),
    findRecipesByIngredient: (args) => findRecipesByIngredient(args.ingredientName),
};

// --- Function Declarations for AI Tools ---

const getFoodCostAnalysisFunction: FunctionDeclaration = {
    name: 'getFoodCostAnalysis',
    description: 'Calculates the current overall food cost percentage and identifies the main ingredient driving any recent cost increases.',
    parameters: { type: Type.OBJECT, properties: {} }
};

const getMostProfitableRecipeFunction: FunctionDeclaration = {
    name: 'getMostProfitableRecipe',
    description: 'Finds the most profitable recipe on the menu based on its cost per serving and menu price.',
    parameters: { type: Type.OBJECT, properties: {} }
};

const getRecipeDetailsFunction: FunctionDeclaration = {
    name: 'getRecipeDetails',
    description: 'Get cost, price, and food cost percentage for a specific recipe.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            recipeName: {
                type: Type.STRING,
                description: 'The name of the recipe to look up.',
            },
        },
        required: ['recipeName'],
    },
};

const findRecipesByIngredientFunction: FunctionDeclaration = {
    name: 'findRecipesByIngredient',
    description: 'Finds all recipes that contain a specific ingredient.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            ingredientName: {
                type: Type.STRING,
                description: 'The name of the ingredient to search for in recipes.',
            },
        },
        required: ['ingredientName'],
    },
};

// --- Audio Encoding/Decoding Utilities ---

function encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
}

export const useLiveAssistant = () => {
    const [assistantStatus, setAssistantStatus] = useState<AssistantStatus>('idle');
    const [transcriptHistory, setTranscriptHistory] = useState<ChatMessage[]>([
        { sender: 'ai', text: "Hello! Tap the button below to start our conversation.", timestamp: new Date() }
    ]);
    const [userInterimTranscript, setUserInterimTranscript] = useState('');
    const [aiInterimTranscript, setAiInterimTranscript] = useState('');

    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const cleanupRef = useRef<(() => void) | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef(0);
    const audioSourcesRef = useRef(new Set<AudioBufferSourceNode>());

    const currentInputTranscription = useRef('');
    const currentOutputTranscription = useRef('');

    const cleanupAndResetState = useCallback(() => {
        if (cleanupRef.current) {
            cleanupRef.current();
            cleanupRef.current = null;
        }
        sessionPromiseRef.current = null;
        setAssistantStatus('idle');
        setUserInterimTranscript('');
        setAiInterimTranscript('');
        currentInputTranscription.current = '';
        currentOutputTranscription.current = '';
        console.log("Session cleaned up and state reset.");
    }, []);

    const stopSession = useCallback(() => {
        sessionPromiseRef.current?.then(session => {
            session.close();
        }).catch(e => {
            console.error("Error retrieving session to close it. Forcing cleanup.", e);
            cleanupAndResetState();
        });
    }, [cleanupAndResetState]);

    const startSession = useCallback(async () => {
        setAssistantStatus('connecting');
        setTranscriptHistory([]);
        try {
             if (!process.env.API_KEY) {
                throw new Error("API_KEY environment variable not set");
             }
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const outputNode = outputAudioContext.createGain();
            outputNode.connect(outputAudioContext.destination);
            outputAudioContextRef.current = outputAudioContext;
            nextStartTimeRef.current = 0;
            audioSourcesRef.current = new Set();


            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: async () => {
                        console.log('Session opened.');
                        setAssistantStatus('listening');
                        
                        const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        const source = inputAudioContext.createMediaStreamSource(stream);
                        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                        
                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContext.destination);

                        cleanupRef.current = () => {
                            stream.getTracks().forEach(track => track.stop());
                            source.disconnect();
                            scriptProcessor.disconnect();
                            inputAudioContext.close();
                            outputAudioContext.close();
                            console.log('Cleanup complete.');
                        };
                    },
                    onmessage: async (message: LiveServerMessage) => {
                         // Handle transcription
                        if (message.serverContent?.inputTranscription) {
                            currentInputTranscription.current += message.serverContent.inputTranscription.text;
                            setUserInterimTranscript(currentInputTranscription.current);
                        } else if(message.serverContent?.outputTranscription) {
                            currentOutputTranscription.current += message.serverContent.outputTranscription.text;
                            setAiInterimTranscript(currentOutputTranscription.current);
                        }

                        if (message.serverContent?.turnComplete) {
                            const fullInput = currentInputTranscription.current.trim();
                            const fullOutput = currentOutputTranscription.current.trim();
                           
                           setTranscriptHistory(prev => {
                                const newHistory = [...prev];
                                if (fullInput) newHistory.push({ sender: 'user', text: fullInput, timestamp: new Date() });
                                if (fullOutput) newHistory.push({ sender: 'ai', text: fullOutput, timestamp: new Date() });
                                return newHistory;
                           });

                           currentInputTranscription.current = '';
                           currentOutputTranscription.current = '';
                           setUserInterimTranscript('');
                           setAiInterimTranscript('');
                        }
                        
                         // Handle function calls
                        if (message.toolCall) {
                            const toolCallResults = [];
                            for (const fc of message.toolCall.functionCalls) {
                                const handler = functionHandlers[fc.name];
                                if (handler) {
                                    const result = handler(fc.args);
                                    toolCallResults.push({
                                        id: fc.id,
                                        name: fc.name,
                                        response: { result: result },
                                    });
                                }
                            }
                            if (toolCallResults.length > 0) {
                                sessionPromiseRef.current?.then((session) => {
                                    session.sendToolResponse({ functionResponses: toolCallResults });
                                });
                            }
                        }

                        // Handle audio playback
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                        if (base64Audio) {
                            setAssistantStatus('speaking');
                            const audioContext = outputAudioContextRef.current;
                            if (audioContext) {
                                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContext.currentTime);
                                const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
                                const source = audioContext.createBufferSource();
                                source.buffer = audioBuffer;
                                source.connect(outputNode);
                                source.addEventListener('ended', () => {
                                    audioSourcesRef.current.delete(source);
                                    if(audioSourcesRef.current.size === 0) {
                                        setAssistantStatus('listening');
                                    }
                                });
                                source.start(nextStartTimeRef.current);
                                nextStartTimeRef.current += audioBuffer.duration;
                                audioSourcesRef.current.add(source);
                            }
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Session error:', e);
                        setAssistantStatus('error');
                        setTranscriptHistory(prev => [...prev, { sender: 'ai', text: `Sorry, a connection error occurred: ${e.message}`, timestamp: new Date()}]);
                        cleanupAndResetState();
                    },
                    onclose: (e: CloseEvent) => {
                        console.log('Session closed event received.');
                        cleanupAndResetState();
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    tools: [{ functionDeclarations: [
                        getFoodCostAnalysisFunction,
                        getMostProfitableRecipeFunction,
                        getRecipeDetailsFunction,
                        findRecipesByIngredientFunction,
                    ] }],
                    systemInstruction: "You are Aura, a friendly and helpful AI assistant for the Bitebytes kitchen management app. Your goal is to provide quick, conversational help by answering questions about the user's recipes, ingredients, and food costs. Use the provided tools to get specific data. Before calling a tool, inform the user what you're looking for (e.g., 'Let me check the numbers for that...'). After receiving the tool's response, summarize the information in a friendly, easy-to-understand way. Do not output raw JSON. If a tool returns an error or no data, inform the user gracefully."
                }
            });
            await sessionPromiseRef.current;
        } catch (e: any) {
            console.error('Failed to start session', e);
            setAssistantStatus('error');
            if (e.message.includes('permission')) {
                 setTranscriptHistory(prev => [...prev, { sender: 'ai', text: "I need microphone access to work. Please grant permission and try again.", timestamp: new Date()}]);
            } else {
                 setTranscriptHistory(prev => [...prev, { sender: 'ai', text: `An error occurred: ${e.message}`, timestamp: new Date()}]);
            }
        }
    }, [cleanupAndResetState]);
    
    useEffect(() => {
        return () => {
            if (cleanupRef.current) {
                cleanupRef.current();
            }
        };
    }, []);

    return { assistantStatus, transcriptHistory, userInterimTranscript, aiInterimTranscript, startSession, stopSession };
};