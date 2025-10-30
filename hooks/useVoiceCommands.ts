import { useState, useEffect, useRef } from 'react';

// FIX: Add types for Web Speech API to resolve TypeScript errors.
// These types are not included in standard DOM typings.
interface SpeechRecognitionEvent extends Event {
    results: {
        [index: number]: {
            [index: number]: {
                transcript: string;
            };
        };
    };
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
}

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

interface VoiceCommands {
    [key: string]: () => void;
}

// Check for browser support
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
}

export const useVoiceCommands = (commands: VoiceCommands) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const commandsRef = useRef(commands);
    commandsRef.current = commands;

    useEffect(() => {
        if (!recognition) return;

        const handleResult = (event: SpeechRecognitionEvent) => {
            const currentTranscript = event.results[0][0].transcript.toLowerCase().trim();
            setTranscript(currentTranscript);
            
            console.log("Voice command received:", currentTranscript);

            // Simple command matching
            Object.keys(commandsRef.current).forEach(command => {
                if (currentTranscript.includes(command)) {
                    commandsRef.current[command]();
                }
            });
        };

        const handleEnd = () => {
            setIsListening(false);
            setTranscript('');
        };
        
        const handleError = (event: SpeechRecognitionErrorEvent) => {
             console.error('Speech recognition error', event.error);
             setIsListening(false);
        }

        recognition.addEventListener('result', handleResult);
        recognition.addEventListener('end', handleEnd);
        recognition.addEventListener('error', handleError);


        return () => {
            recognition.removeEventListener('result', handleResult);
            recognition.removeEventListener('end', handleEnd);
            recognition.removeEventListener('error', handleError);
        };
    }, []);

    const startListening = () => {
        if (recognition && !isListening) {
            recognition.start();
            setIsListening(true);
        }
    };

    const stopListening = () => {
        if (recognition && isListening) {
            recognition.stop();
            setIsListening(false);
        }
    };

    return { isListening, transcript, startListening, stopListening };
};
