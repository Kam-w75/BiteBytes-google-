import { useState, useEffect, useRef, useCallback } from 'react';

interface UseSpeechToTextOptions {
  onFinalTranscript: (text: string) => void;
}

// FIX: Correctly define the Web Speech API event types to resolve compilation errors.
// The `SpeechRecognitionResultList` (`event.results`) is an array-like object and requires a `length` property for iteration.
interface SpeechRecognitionAlternative {
    readonly transcript: string;
}

interface SpeechRecognitionResult extends ArrayLike<SpeechRecognitionAlternative> {
    readonly isFinal: boolean;
}

interface SpeechRecognitionResultList extends ArrayLike<SpeechRecognitionResult> {}

interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
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

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export const useSpeechToText = ({ onFinalTranscript }: UseSpeechToTextOptions) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<any | null>(null);
    const finalTranscriptRef = useRef('');
    
    const onFinalTranscriptCallbackRef = useRef(onFinalTranscript);
    useEffect(() => {
        onFinalTranscriptCallbackRef.current = onFinalTranscript;
    }, [onFinalTranscript]);

    useEffect(() => {
        if (!SpeechRecognition) {
            setError("Your browser does not support Speech Recognition. Try Chrome or Edge.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const currentTranscript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscriptRef.current += currentTranscript + ' ';
                } else {
                    interimTranscript += currentTranscript;
                }
            }
            setTranscript(finalTranscriptRef.current + interimTranscript);
        };
        
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            if (event.error === 'not-allowed') {
                setError("Microphone access denied. Please allow it in your browser settings.");
            } else if (event.error !== 'no-speech') {
                setError(`Speech recognition error: ${event.error}`);
            }
            setIsListening(false);
        };
        
        recognition.onend = () => {
            setIsListening(false);
            if (finalTranscriptRef.current.trim()) {
                onFinalTranscriptCallbackRef.current(finalTranscriptRef.current.trim());
            }
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            finalTranscriptRef.current = '';
            setTranscript('');
            setError(null);
            recognitionRef.current.start();
            setIsListening(true);
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            // onend will fire and handle the final transcript
        }
    }, [isListening]);
    
    return { isListening, transcript, error, startListening, stopListening };
};
