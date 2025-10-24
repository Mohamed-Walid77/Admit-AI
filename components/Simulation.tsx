import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Program, SimulationFeedback } from '../types';
import { programs } from '../data/programs';
import { getSimulationFeedback } from '../services/geminiService';
import { SpinnerIcon, MicrophoneIcon } from './icons/Icons';

// Fix: Add type definitions for SpeechRecognition API to fix TS errors.
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

// Extend the window interface for webkitSpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

const ScoreRing: React.FC<{ score: number }> = ({ score }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 10) * 100;
  const offset = circumference - (progress / 100) * circumference;
  
  const getColor = () => {
    if (score >= 8) return 'text-green-400';
    if (score >= 5) return 'text-yellow-400';
    return 'text-red-400';
  }

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full" viewBox="0 0 120 120">
        <circle
          className="text-gray-700"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
        />
        <motion.circle
          className={getColor()}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
          transform="rotate(-90 60 60)"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
         <span className={`text-4xl font-bold ${getColor()}`}>{score.toFixed(1)}</span>
         <span className="text-sm text-gray-400">/ 10</span>
      </div>
    </div>
  );
};


const Simulation = () => {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [applicationData, setApplicationData] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<SimulationFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // State for voice input
  const [focusedTextarea, setFocusedTextarea] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Set initial focus target when program is selected
  useEffect(() => {
    if (selectedProgram && selectedProgram.applicationSteps.length > 0) {
        setFocusedTextarea(selectedProgram.applicationSteps[0]);
    } else {
        setFocusedTextarea(null);
    }
  }, [selectedProgram]);

  const isSpeechRecognitionSupported = useMemo(() =>
    typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window),
    []
  );

  useEffect(() => {
    if (!isSpeechRecognitionSupported) {
        console.warn("Speech recognition not supported by this browser.");
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        if (focusedTextarea) {
            setApplicationData(prev => {
                const currentText = prev[focusedTextarea] || '';
                const separator = currentText && !currentText.endsWith(' ') ? ' ' : '';
                return {
                    ...prev,
                    [focusedTextarea]: currentText + separator + transcript
                };
            });
        }
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
    };

    recognition.onend = () => {
        setIsRecording(false);
    };
    
    recognitionRef.current = recognition;

    return () => {
        recognitionRef.current?.abort();
    };
  }, [isSpeechRecognitionSupported, focusedTextarea]);

  const toggleRecording = () => {
    if (!isSpeechRecognitionSupported || !focusedTextarea) return;

    if (isRecording) {
        recognitionRef.current?.stop();
    } else {
        try {
            recognitionRef.current?.start();
            setIsRecording(true);
        } catch (e) {
            console.error("Error starting speech recognition:", e);
            setIsRecording(false);
        }
    }
  };


  const handleProgramChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const program = programs.find(p => p.id === e.target.value) || null;
    setSelectedProgram(program);
    setApplicationData({}); // Reset form data
    setFeedback(null); // Reset feedback
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setApplicationData(prev => ({...prev, [name]: value}));
  };

  const handleSubmit = async () => {
    if (!selectedProgram) return;
    setIsLoading(true);
    setFeedback(null);
    const result = await getSimulationFeedback(selectedProgram, applicationData);
    setFeedback(result);
    setIsLoading(false);
  };
  
  const isSubmitDisabled = useMemo(() => {
    if (!selectedProgram || isLoading) return true;
    return selectedProgram.applicationSteps.some(step => !applicationData[step]?.trim());
  }, [selectedProgram, applicationData, isLoading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a101f] to-[#0d1a3a] text-white p-4 sm:p-6 md:p-8">
      <div className="container mx-auto">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-teal-400">Application Simulator</h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mt-4">
              Practice your applications and get instant, AI-powered feedback from an expert "admissions officer."
            </p>
        </div>

        <div className="max-w-md mx-auto mb-8">
            <label htmlFor="program-select" className="block mb-2 text-sm font-medium text-gray-400">1. Select a Program to Simulate</label>
            <select
                id="program-select"
                onChange={handleProgramChange}
                defaultValue=""
                className="bg-gray-800/80 border border-teal-500/30 text-white text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full p-3"
            >
                <option value="" disabled>Choose a program...</option>
                {programs.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
        </div>

        <AnimatePresence>
        {selectedProgram && (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
            >
                {/* Application Form Column */}
                <div className="bg-gray-900/50 backdrop-blur-lg border border-teal-500/10 rounded-2xl p-6">
                    <h2 className="text-2xl font-bold mb-1">Application for:</h2>
                    <h3 className="text-xl font-semibold text-teal-300 mb-6">{selectedProgram.title}</h3>
                    <div className="space-y-6">
                        {selectedProgram.applicationSteps.map((step, i) => (
                            <div key={i}>
                                <label className="block mb-2 text-md font-medium text-gray-200">{i+1}. {step}</label>
                                <textarea
                                    name={step}
                                    value={applicationData[step] || ''}
                                    onChange={handleInputChange}
                                    onFocus={() => setFocusedTextarea(step)}
                                    rows={8}
                                    className={`w-full bg-gray-800/70 border rounded-lg p-3 focus:outline-none transition-all ${focusedTextarea === step ? 'ring-2 ring-blue-500 border-transparent' : 'border-gray-600 focus:ring-2 focus:ring-teal-500'}`}
                                    placeholder={`Draft your response for "${step}" here...`}
                                ></textarea>
                            </div>
                        ))}
                    </div>
                     <div className="flex items-center gap-4 mt-8">
                        <button onClick={handleSubmit} disabled={isSubmitDisabled} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            {isLoading ? <><SpinnerIcon /> Analyzing...</> : "Submit for AI Review"}
                        </button>
                        {isSpeechRecognitionSupported && (
                             <button
                                onClick={toggleRecording}
                                disabled={!focusedTextarea || isLoading}
                                className={`p-3 rounded-lg transition duration-300 ${isRecording ? 'bg-red-600' : 'bg-blue-600 hover:bg-blue-700'} text-white disabled:bg-gray-600 disabled:cursor-not-allowed`}
                                title={isRecording ? "Stop Recording" : `Record for "${focusedTextarea}"`}
                            >
                                <MicrophoneIcon isRecording={isRecording} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Feedback Column */}
                <div className="sticky top-24">
                  <AnimatePresence>
                    {isLoading && (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-96 bg-gray-900/50 backdrop-blur-lg border border-teal-500/10 rounded-2xl p-6">
                          <SpinnerIcon />
                          <p className="mt-4 text-lg text-gray-300">Your AI admissions officer is reviewing your work...</p>
                          <p className="text-sm text-gray-500">This may take a moment.</p>
                       </motion.div>
                    )}
                    {feedback && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-gray-900/50 backdrop-blur-lg border border-teal-500/10 rounded-2xl p-6 max-h-[80vh] overflow-y-auto">
                            <h2 className="text-2xl font-bold mb-4 text-center">Admissions Committee Feedback</h2>
                            <div className="flex flex-col items-center mb-6">
                                <ScoreRing score={feedback.overallScore} />
                            </div>
                            <div className="mb-6">
                                <h3 className="text-xl font-semibold mb-2 text-teal-300">Overall Assessment</h3>
                                <p className="text-gray-300 whitespace-pre-wrap">{feedback.overallFeedback}</p>
                            </div>
                            <div className="space-y-4">
                                {feedback.sectionFeedback.map((sec, i) => (
                                    <div key={i} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                                        <h4 className="font-bold text-lg text-white mb-2">{sec.sectionName}</h4>
                                        <div className="mb-3">
                                            <h5 className="font-semibold text-green-400">Strengths:</h5>
                                            <p className="text-sm text-gray-300 whitespace-pre-wrap">{sec.strengths}</p>
                                        </div>
                                        <div>
                                            <h5 className="font-semibold text-yellow-400">Areas for Improvement:</h5>
                                            <p className="text-sm text-gray-300 whitespace-pre-wrap">{sec.improvements}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                  </AnimatePresence>
                </div>
            </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Simulation;