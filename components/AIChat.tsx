import React, { useState, useRef, useEffect } from 'react';
import { useAIChat } from '../hooks/useAIChat';
import { Recipe, Ingredient } from '../types';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { ChatBubbleBottomCenterTextIcon, XMarkIcon, PaperAirplaneIcon, CpuChipIcon, MicrophoneIcon } from './Icons';

interface AIChatProps {
  recipes: Recipe[];
  ingredients: Ingredient[];
}

const SuggestionChip: React.FC<{ text: string; onClick: () => void }> = ({ text, onClick }) => (
  <button
    onClick={onClick}
    className="px-3 py-1.5 bg-gray-700 text-gray-200 rounded-full text-sm font-medium hover:bg-gray-600 transition-colors flex-shrink-0"
  >
    {text}
  </button>
);

export const AIChat: React.FC<AIChatProps> = ({ recipes, ingredients }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, isLoading, sendMessage } = useAIChat(recipes, ingredients);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { isListening, transcript, error: speechError, startListening, stopListening } = useSpeechToText({
    onFinalTranscript: (text) => {
        if(text) {
          sendMessage(text);
        }
        setInputValue('');
    }
  });

  useEffect(() => {
    if (isListening) {
      setInputValue(transcript);
    }
  }, [transcript, isListening]);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSend = () => {
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };
  
  const handleSuggestionClick = (text: string) => {
      sendMessage(text);
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };
  
  const handleMicClick = () => {
    if (isListening) {
        stopListening();
    } else {
        setInputValue('');
        startListening();
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
      <button onClick={() => setIsOpen(!isOpen)} className={fabClasses} aria-label="Toggle AI Chat">
        {isOpen ? <XMarkIcon className="h-8 w-8" /> : <ChatBubbleBottomCenterTextIcon className="h-8 w-8" />}
      </button>

      <div className={chatContainerClasses}>
        {/* Header */}
        <header className="flex items-center p-4 border-b border-gray-700 bg-[#2C2C2C] flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#ff8a8a] flex items-center justify-center mr-3">
            <CpuChipIcon className="w-6 h-6 text-black" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-gray-100">AI Assistant</h2>
            <p className="text-sm text-gray-400">{isListening ? 'Listening...' : 'Ready to help'}</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="ml-auto md:hidden text-gray-500 p-2 rounded-full hover:bg-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#ff8a8a] flex items-center justify-center flex-shrink-0">
                  <CpuChipIcon className="w-5 h-5 text-black" />
                </div>
              )}
              <div
                className={`px-4 py-2 rounded-2xl max-w-sm whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-[#FF6B6B] text-black rounded-br-none'
                    : 'bg-gray-700 text-gray-100 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
             <div className="flex items-end gap-2 justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#ff8a8a] flex items-center justify-center flex-shrink-0">
                  <CpuChipIcon className="w-5 h-5 text-black" />
                </div>
                 <div className="px-4 py-2 rounded-2xl bg-gray-700 text-gray-100 rounded-bl-none">
                     <div className="flex items-center space-x-1">
                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                     </div>
                 </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-700 bg-[#1E1E1E] flex-shrink-0">
           <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-2 -mx-4 px-4">
               <SuggestionChip text="Why is my food cost high?" onClick={() => handleSuggestionClick("Why is my food cost high?")}/>
               <SuggestionChip text="Most profitable dish?" onClick={() => handleSuggestionClick("What's my most profitable dish?")}/>
               <SuggestionChip text="Cost of my burger?" onClick={() => handleSuggestionClick("How much does my classic cheeseburger cost?")}/>
           </div>
           {speechError && <p className="text-xs text-red-500 text-center mb-2">{speechError}</p>}
          <div className="relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Listening..." : "Ask me anything..."}
              rows={1}
              className="w-full pl-4 pr-20 py-2 border border-gray-600 bg-transparent text-gray-200 rounded-full resize-none focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent transition"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                <button
                  onClick={handleMicClick}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-600 text-gray-200 hover:bg-gray-500'}`}
                  aria-label={isListening ? 'Stop listening' : 'Start listening'}
                >
                  <MicrophoneIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSend}
                  disabled={isLoading || !inputValue.trim()}
                  className="w-8 h-8 rounded-full bg-[#FF6B6B] text-black flex items-center justify-center hover:bg-[#E85A5A] disabled:bg-gray-500 transition-colors"
                  aria-label="Send message"
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};