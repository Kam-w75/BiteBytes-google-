import React, { useState, useEffect, useRef } from 'react';
import { useLiveAssistant } from '../hooks/useLiveAssistant';
import { ChatMessage } from '../types';
import { CpuChipIcon, XMarkIcon, MicrophoneIcon, StopIcon } from './Icons';

const Orb: React.FC<{ status: 'idle' | 'listening' | 'speaking' }> = ({ status }) => {
    const statusClasses = {
        idle: 'scale-100 opacity-80',
        listening: 'scale-110 opacity-100 animate-pulse-strong',
        speaking: 'scale-110 opacity-100 animate-breathing'
    };
    return (
        <div className={`relative w-24 h-24 transition-all duration-300 ${statusClasses[status]}`}>
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FF6B6B] to-[#ff8a8a] opacity-80"></div>
            <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-[#ff8a8a] to-[#FF6B6B] opacity-60 blur-sm"></div>
        </div>
    );
};


export const LiveAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { 
        assistantStatus, 
        startSession, 
        stopSession, 
        transcriptHistory,
        userInterimTranscript,
        aiInterimTranscript
    } = useLiveAssistant();

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [transcriptHistory, userInterimTranscript, aiInterimTranscript]);

    const handleToggleSession = () => {
        if (assistantStatus === 'idle') {
            startSession();
        } else {
            stopSession();
        }
    };
    
    const fabClasses = `fixed bottom-4 right-4 md:bottom-8 md:right-8 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out text-black transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6B6B] z-50 ${
      isOpen ? 'bg-gray-400' : 'bg-[#FF6B6B] hover:bg-[#E85A5A]'
    }`;

    const chatContainerClasses = `fixed bg-[#1E1E1E] flex flex-col z-50 overflow-hidden border border-gray-700
      transition-all duration-300 ease-in-out
      ${isOpen 
        ? 'opacity-100 translate-y-0' 
        : 'opacity-0 translate-y-10 pointer-events-none'
      }
      md:max-w-md md:h-[70vh] md:rounded-2xl md:shadow-2xl md:bottom-28 md:right-8
      inset-0 md:inset-auto 
    `;

    return (
        <>
        <style>{`
            @keyframes pulse-strong {
                0%, 100% { transform: scale(1); opacity: 0.8; }
                50% { transform: scale(1.1); opacity: 1; }
            }
            .animate-pulse-strong { animation: pulse-strong 1.5s infinite; }

            @keyframes breathing {
                0%, 100% { transform: scale(1.05); }
                50% { transform: scale(1.15); }
            }
            .animate-breathing { animation: breathing 2.5s infinite; }
        `}</style>
        <button onClick={() => setIsOpen(!isOpen)} className={fabClasses} aria-label="Toggle AI Assistant">
            {isOpen ? <XMarkIcon className="h-8 w-8" /> : <MicrophoneIcon className="h-8 w-8" />}
        </button>

        <div className={chatContainerClasses}>
            {/* Header */}
            <header className="flex items-center p-4 border-b border-gray-700 bg-[#2C2C2C] flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#ff8a8a] flex items-center justify-center mr-3">
                    <CpuChipIcon className="w-6 h-6 text-black" />
                </div>
                <div>
                    <h2 className="font-bold text-lg text-gray-100">Live Assistant</h2>
                    <p className="text-sm text-gray-400 capitalize">{assistantStatus.replace('_', ' ')}</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="ml-auto md:hidden text-gray-500 p-2 rounded-full hover:bg-gray-600">
                    <XMarkIcon className="h-6 w-6" />
                </button>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {transcriptHistory.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`px-4 py-2 rounded-2xl max-w-sm whitespace-pre-wrap ${
                            msg.sender === 'user'
                                ? 'bg-[#FF6B6B] text-black rounded-br-none'
                                : 'bg-gray-700 text-gray-100 rounded-bl-none'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                 {userInterimTranscript && (
                    <div className="flex items-end gap-2 justify-end">
                        <div className="px-4 py-2 rounded-2xl max-w-sm whitespace-pre-wrap bg-[#FF6B6B]/50 text-black/80 rounded-br-none">
                            {userInterimTranscript}
                        </div>
                    </div>
                )}
                {aiInterimTranscript && (
                     <div className="flex items-end gap-2 justify-start">
                        <div className="px-4 py-2 rounded-2xl max-w-sm whitespace-pre-wrap bg-gray-700/60 text-gray-100/80 rounded-bl-none">
                            {aiInterimTranscript}
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            
             {/* Controller */}
             <div className="p-6 border-t border-gray-700 bg-[#1E1E1E] flex flex-col items-center justify-center flex-shrink-0">
                <div className="h-28 flex items-center justify-center">
                    <Orb status={assistantStatus} />
                </div>
                <button
                    onClick={handleToggleSession}
                    className="mt-6 w-20 h-20 rounded-full flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1E1E1E] focus:ring-white bg-[#2C2C2C] text-white"
                >
                    {assistantStatus !== 'idle' ? <StopIcon className="h-8 w-8" /> : <MicrophoneIcon className="h-8 w-8 text-[#FF6B6B]" />}
                </button>
                 <p className="mt-4 text-sm text-gray-500 h-5">
                    {assistantStatus === 'idle' ? 'Tap to start' : 'Tap to stop'}
                 </p>
             </div>

        </div>
        </>
    );
};
