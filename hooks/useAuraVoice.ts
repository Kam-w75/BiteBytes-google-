import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Type, FunctionDeclaration, Blob } from '@google/genai';

// --- Audio Helper Functions (as per guidelines) ---

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

const navigateFunctionDeclaration: FunctionDeclaration = {
  name: 'navigate',
  description: 'Navigate to a different page in the application. Available pages are: dashboard, costing, reports, price-history, invoices, nutrition, import-export, settings, and help.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      page: {
        type: Type.STRING,
        description: 'The page to navigate to.',
        enum: ['dashboard', 'costing', 'reports', 'price-history', 'invoices', 'nutrition', 'import-export', 'settings', 'help'],
      },
    },
    required: ['page'],
  },
};

export const useAuraVoice = (onCommand: (command: string, args: any) => void) => {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [userTranscript, setUserTranscript] = useState('');
    
    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef(0);
    const audioQueueRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    const stopAudioPlayback = useCallback(() => {
        if (outputAudioContextRef.current) {
            audioQueueRef.current.forEach(source => {
                source.stop();
            });
            audioQueueRef.current.clear();
            nextStartTimeRef.current = 0;
            setIsSpeaking(false);
        }
    }, []);

    const startSession = async () => {
        if (isListening || !process.env.API_KEY) return;
        
        setIsListening(true);
        setUserTranscript('');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            // FIX: Cast window to `any` to allow access to the prefixed `webkitAudioContext` for older browser compatibility.
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        console.log('Aura session opened.');
                        // FIX: Cast window to `any` to allow access to the prefixed `webkitAudioContext` for older browser compatibility.
                        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                        
                        const source = audioContextRef.current.createMediaStreamSource(stream);
                        mediaStreamSourceRef.current = source;
                        
                        const scriptProcessor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (event) => {
                            const inputData = event.inputBuffer.getChannelData(0);
                            const l = inputData.length;
                            const int16 = new Int16Array(l);
                            for (let i = 0; i < l; i++) {
                                int16[i] = inputData[i] * 32768;
                            }
                            const pcmBlob: Blob = {
                                data: encode(new Uint8Array(int16.buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(audioContextRef.current.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            setUserTranscript(prev => prev + message.serverContent.inputTranscription.text);
                        }
                        if (message.serverContent?.turnComplete) {
                            const finalTranscript = userTranscript + (message.serverContent.inputTranscription?.text || '');
                             setUserTranscript(finalTranscript); // Show final transcript briefly
                             setTimeout(() => setUserTranscript(''), 2000); // Clear after a delay
                        }
                        if (message.toolCall?.functionCalls) {
                            for (const fc of message.toolCall.functionCalls) {
                                onCommand(fc.name, fc.args);
                                sessionPromiseRef.current?.then((session) => {
                                  session.sendToolResponse({ functionResponses: { id: fc.id, name: fc.name, response: { result: "ok" } }});
                                });
                            }
                        }
                        const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (audioData && outputAudioContextRef.current) {
                            setIsSpeaking(true);
                            const ctx = outputAudioContextRef.current;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                            const audioBuffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
                            
                            const source = ctx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(ctx.destination);
                            
                            source.onended = () => {
                                audioQueueRef.current.delete(source);
                                if (audioQueueRef.current.size === 0) {
                                    setIsSpeaking(false);
                                }
                            };
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            audioQueueRef.current.add(source);
                        }
                        if (message.serverContent?.interrupted) {
                            stopAudioPlayback();
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Aura session error:', e);
                        stopSession();
                    },
                    onclose: () => {
                        console.log('Aura session closed.');
                        stopSession();
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    tools: [{ functionDeclarations: [navigateFunctionDeclaration] }],
                },
            });

        } catch (error) {
            console.error("Failed to start Aura session:", error);
            setIsListening(false);
        }
    };
    
    const stopSession = useCallback(() => {
        if (!isListening) return;

        sessionPromiseRef.current?.then(session => session.close());
        sessionPromiseRef.current = null;
        
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
        
        scriptProcessorRef.current?.disconnect();
        scriptProcessorRef.current = null;

        mediaStreamSourceRef.current?.disconnect();
        mediaStreamSourceRef.current = null;

        audioContextRef.current?.close();
        audioContextRef.current = null;

        outputAudioContextRef.current?.close();
        outputAudioContextRef.current = null;

        stopAudioPlayback();

        setIsListening(false);
        setUserTranscript('');
    }, [isListening, stopAudioPlayback]);

    useEffect(() => {
        return () => {
            stopSession();
        };
    }, [stopSession]);

    return { isListening, isSpeaking, userTranscript, startSession, stopSession };
};