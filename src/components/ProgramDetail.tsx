import React from 'react';
import { Program } from '../types';
import { HeartIcon, HeartOutlineIcon } from './icons/Icons';

interface ProgramDetailProps {
  program: Program;
  onBack: () => void;
  onGoToAssistant: () => void;
  onAddToTracker: () => void;
  isTracked: boolean;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const ProgramDetail: React.FC<ProgramDetailProps> = ({ program, onBack, onGoToAssistant, onAddToTracker, isTracked, isFavorite, onToggleFavorite }) => {
  
  const handlePrimaryAction = () => {
    if (isTracked) {
      onGoToAssistant();
    } else {
      onAddToTracker();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a101f]/80 p-4 sm:p-6 md:p-8 text-white">
      <div className="container mx-auto max-w-4xl">
        <button onClick={onBack} className="mb-8 text-teal-400 hover:text-teal-300 transition-colors duration-300">&larr; Back to Program Explorer</button>
        
        <div className="bg-gray-900/50 backdrop-blur-lg border border-teal-500/10 rounded-2xl overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col sm:flex-row items-start mb-6">
              <img src={program.logo} alt={`${program.title} logo`} className="w-24 h-24 rounded-full mr-6 mb-4 sm:mb-0 flex-shrink-0 object-cover" />
              <div className="flex-grow">
                 <div className="flex justify-between items-start">
                    <div>
                      <span className="bg-teal-900/70 text-teal-300 text-xs font-semibold px-3 py-1 rounded-full mb-2 inline-block">{program.category}</span>
                      <h1 className="text-3xl font-bold text-white">{program.title}</h1>
                      <p className="text-xl text-teal-300">{program.organization}</p>
                    </div>
                    <button onClick={onToggleFavorite} className="p-2 -mt-2 -mr-2 text-gray-400 hover:text-red-500 transition-colors" aria-label="Toggle Favorite">
                      {isFavorite ? <HeartIcon className="text-red-500" /> : <HeartOutlineIcon />}
                    </button>
                  </div>
                {program.tagline && <p className="text-gray-400 mt-2 italic">"{program.tagline}"</p>}
              </div>
            </div>

            <p className="text-gray-300 mb-8">{program.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                <h3 className="font-semibold text-white mb-3 text-lg border-b border-gray-700 pb-2">Key Information</h3>
                <ul className="text-sm text-gray-400 space-y-2">
                  <li><strong>Mode:</strong> <span className="text-gray-300">{program.mode}</span></li>
                  <li><strong>Location:</strong> <span className="text-gray-300">{program.location}</span></li>
                  <li><strong>Duration:</strong> <span className="text-gray-300">{program.duration || 'Varies'}</span></li>
                  <li><strong>Cost:</strong> <span className="text-gray-300">{program.cost}</span></li>
                  <li><strong>Deadline:</strong> <span className="text-gray-300">{program.deadline}</span></li>
                  <li><strong>Acceptance Rate:</strong> <span className="text-gray-300">{program.acceptanceRate}</span></li>
                </ul>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                <h3 className="font-semibold text-white mb-3 text-lg border-b border-gray-700 pb-2">Subjects</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {program.subjects.map(s => <span key={s} className="bg-teal-900/50 text-teal-300 text-xs font-medium px-2.5 py-1 rounded-full">{s}</span>)}
                </div>
              </div>
            </div>
            
            {program.highlights && program.highlights.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4">Highlights</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  {program.highlights.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Eligibility</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
                  {program.eligibility.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Application Steps</h3>
                <ol className="list-decimal list-inside text-gray-300 space-y-2 mb-6">
                 {program.applicationSteps.map((item, i) => <li key={i}>{item}</li>)}
                </ol>
              </div>
            </div>

            {program.testimonials && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">From an Alum</h3>
                <blockquote className="border-l-4 border-teal-500 pl-4 italic text-gray-400">
                  <p>"{program.testimonials[0].quote}"</p>
                  <cite className="block text-right mt-2 not-italic text-teal-300">- {program.testimonials[0].author}</cite>
                </blockquote>
              </div>
            )}
          </div>
          
          <div className="bg-gray-900/50 p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <a href={program.website} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">Visit Official Website &rarr;</a>
            <button 
              onClick={handlePrimaryAction}
              className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105">
              {isTracked ? 'Apply with AI Assistant' : '+ Add to My Tracker'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramDetail;
