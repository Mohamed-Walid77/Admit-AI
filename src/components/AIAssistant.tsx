import React, { useState, useEffect, useRef } from 'react';
import { Program, ChatMessage } from '../types';
import { programs } from '../data/programs';
import { runChat } from '../services/geminiService';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { SendIcon, SoundOnIcon, SoundOffIcon, SpinnerIcon } from './icons/Icons';

interface AIAssistantProps {
    initialProgram: Program;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ initialProgram }) => {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(initialProgram);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  
  const { speak, cancel, isSpeaking } = useTextToSpeech();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialProgram) {
        setSelectedProgram(initialProgram);
    }
  }, [initialProgram]);

  useEffect(() => {
    if (selectedProgram) {
      const initialMessage: ChatMessage = {
        role: 'model',
        text: `Hello! I'm your AdmitAI assistant. I'm here to help you with your application to the **${selectedProgram.title}**. How can I assist you today? You can ask me to explain application steps, help draft essays, or generate a checklist.`
      };
      setMessages([initialMessage]);
    }
  }, [selectedProgram]);

  useEffect(() => {
    chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
    const lastMessage = messages[messages.length - 1];
    if (isVoiceMode && lastMessage && lastMessage.role === 'model' && !isLoading) {
      speak(lastMessage.text.replace(/\*\*/g, ''));
    }
  }, [messages, isVoiceMode, isLoading, speak]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading || !selectedProgram) return;

    const newUserMessage: ChatMessage = { role: 'user', text: userInput };
    const historyForAPI = [...messages];
    
    setMessages(prev => [...prev, newUserMessage]);
    const currentInput = userInput;
    setUserInput('');
    setIsLoading(true);
    
    if(isSpeaking) cancel();

    const modelResponseText = await runChat(selectedProgram, historyForAPI, currentInput);
    const newModelMessage: ChatMessage = { role: 'model', text: modelResponseText };
    
    setMessages(prev => [...prev, newModelMessage]);
    setIsLoading(false);
  };
  
  const toggleVoiceMode = () => {
    if (isSpeaking) {
      cancel();
    }
    setIsVoiceMode(!isVoiceMode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a101f] to-[#0d1a3a] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[85vh] bg-gray-900/50 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col border border-teal-500/20">
        <header className="p-4 border-b border-teal-500/20 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-white">AI Application Assistant</h1>
            <p className="text-sm text-teal-300">Applying for: {selectedProgram?.title}</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedProgram?.id || ''}
              onChange={(e) => setSelectedProgram(programs.find(p => p.id === e.target.value) || null)}
              className="bg-gray-800/80 border border-teal-500/30 text-white text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2.5"
            >
              {programs.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
            <button onClick={toggleVoiceMode} className={`p-2 rounded-full transition-colors duration-300 ${isVoiceMode ? 'bg-teal-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                {isSpeaking ? <SpinnerIcon /> : isVoiceMode ? <SoundOnIcon /> : <SoundOffIcon />}
            </button>
          </div>
        </header>

        <div ref={chatContainerRef} className="flex-1 p-6 space-y-4 overflow-y-auto">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-lg px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-teal-600 text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none'}`}>
                <div className="prose prose-invert prose-sm" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="max-w-lg px-4 py-3 rounded-2xl bg-gray-800 text-gray-200 rounded-bl-none flex items-center space-x-2">
                 <SpinnerIcon /> <span>Thinking...</span>
               </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-teal-500/20">
          <div className="flex items-center bg-gray-800 rounded-xl p-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask for help with your application..."
              className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none px-2"
              disabled={isLoading}
            />
            <button onClick={handleSendMessage} disabled={isLoading || !userInput.trim()} className="p-2 rounded-lg bg-teal-600 text-white disabled:bg-teal-800 disabled:cursor-not-allowed hover:bg-teal-700 transition-colors duration-300">
              {isLoading ? <SpinnerIcon /> : <SendIcon />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;