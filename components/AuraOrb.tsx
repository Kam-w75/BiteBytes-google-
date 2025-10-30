import React from 'react';
import { useAuraVoice } from '../hooks/useAuraVoice';
// FIX: Corrected import path for Icons.
import { MicrophoneIcon, SparklesIcon } from './Icons';

interface AuraOrbProps {
    setCurrentPage: (page: 'costing' | 'invoices' | 'nutrition' | 'help') => void;
}

export const AuraOrb: React.FC<AuraOrbProps> = ({ setCurrentPage }) => {

    const handleCommand = (command: string, args: any) => {
        if (command === 'navigate' && args.page) {
            setCurrentPage(args.page);
        }
    }
    
    const { isListening, isSpeaking, userTranscript, startSession, stopSession } = useAuraVoice(handleCommand);

    const toggleListening = () => {
        if (isListening) {
            stopSession();
        } else {
            startSession();
        }
    }

    const orbClasses = [
        'fixed', 'bottom-8', 'right-8', 'w-16', 'h-16',
        'rounded-full', 'shadow-2xl', 'flex', 'items-center', 'justify-center',
        'cursor-pointer', 'transition-all', 'duration-300', 'ease-in-out',
        'text-white', 'transform', 'hover:scale-110', 'focus:outline-none',
        'focus:ring-2', 'focus:ring-offset-2', 'focus:ring-purple-500',
        isListening ? 'bg-purple-600' : 'bg-gray-700 hover:bg-purple-500'
    ].join(' ');

    const speakingPulseClass = isSpeaking ? 'animate-pulse' : '';

    return (
        <>
            {isListening && (
                <div className="fixed bottom-28 right-8 bg-white p-4 rounded-lg shadow-xl w-80 z-40">
                    <p className="text-sm text-gray-500 font-medium">You said:</p>
                    <p className="text-base text-gray-800 min-h-[2rem]">{userTranscript || '...'}</p>
                </div>
            )}
            <button
                onClick={toggleListening}
                className={orbClasses + " z-50"}
                aria-label={isListening ? 'Stop Aura' : 'Start Aura'}
            >
                {isListening 
                    ? <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white bg-opacity-30 ${speakingPulseClass}`}><MicrophoneIcon className="w-6 h-6"/></div>
                    : <SparklesIcon className="h-8 w-8" />
                }
            </button>
        </>
    );
};
