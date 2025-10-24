import React, { useState, useMemo } from 'react';
import { Program, ApplicationProgress } from '../types';
import { programs } from '../data/programs';

interface HomeProps {
  setSelectedProgram: (program: Program) => void;
  trackedApplications: ApplicationProgress[];
  addApplication: (program: Program) => void;
}

const ProgramCard: React.FC<{ 
  program: Program; 
  onViewDetails: () => void;
  onAddToTracker: () => void;
  isTracked: boolean;
}> = ({ program, onViewDetails, onAddToTracker, isTracked }) => (
  <div className="bg-gray-900/50 backdrop-blur-lg border border-teal-500/10 rounded-2xl p-6 flex flex-col transition-all duration-300 group hover:border-teal-500/30 hover:-translate-y-2 hover:shadow-2xl hover:shadow-teal-500/10">
    <div onClick={onViewDetails} className="cursor-pointer flex-grow">
      <div className="flex justify-between items-start mb-4">
        <img src={program.logo} alt={`${program.title} logo`} className="w-16 h-16 rounded-full object-cover" />
        <span className="bg-teal-900/70 text-teal-300 text-xs font-semibold px-3 py-1 rounded-full text-center">{program.category}</span>
      </div>
      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-teal-300 transition-colors h-14">{program.title}</h3>
      <p className="text-gray-400 text-sm mb-4 h-12 line-clamp-2">{program.description}</p>
      <div className="text-xs text-gray-500 space-y-1">
        <p><strong>Duration:</strong> {program.duration || 'N/A'}</p>
        <p><strong>Location:</strong> {program.location}</p>
      </div>
    </div>
    <div className="mt-4 border-t border-gray-700/50 pt-4 flex items-center justify-between">
       <a onClick={onViewDetails} className="text-sm text-teal-400 hover:text-teal-300 cursor-pointer">View Details</a>
        <button 
          onClick={onAddToTracker} 
          disabled={isTracked}
          className="text-sm font-semibold py-2 px-4 rounded-lg transition-colors disabled:cursor-not-allowed disabled:bg-teal-900/50 disabled:text-teal-500 bg-teal-600/20 text-teal-300 hover:bg-teal-600/40"
        >
          {isTracked ? '✓ Added' : '+ Add to Tracker'}
        </button>
    </div>
  </div>
);

// --- Helper Functions for Advanced Filtering ---

const getCostCategory = (costString: string): 'Free' | 'Low' | 'Medium' | 'High' | 'Varies' => {
  const lowerCost = costString.toLowerCase();
  if (lowerCost === 'free' || lowerCost.includes('stipend provided') || lowerCost.includes('full cost')) return 'Free';
  if (lowerCost.includes('varies') || lowerCost.includes('scholarship')) return 'Varies';

  const matches = costString.match(/[\d,]+/);
  if (!matches) return 'Varies';
  
  const cost = parseInt(matches[0].replace(/,/g, ''), 10);
  if (isNaN(cost)) return 'Varies';

  if (cost < 3000) return 'Low';
  if (cost <= 7000) return 'Medium';
  return 'High';
};

const getLocationCategory = (program: Program): 'USA' | 'International' | 'Online' => {
  const location = program.location.toLowerCase();
  const mode = program.mode.toLowerCase();
  
  if (mode === 'online' || location.includes('online') || location.includes('global')) {
    return 'Online';
  }
  if (location.includes('usa')) {
    return 'USA';
  }
  return 'International';
};

const getDurationCategory = (durationString?: string): 'Short-term' | 'Long-term' | 'Varies' => {
  if (!durationString || durationString.toLowerCase().includes('varies') || durationString.toLowerCase().includes('n/a')) return 'Varies';
  
  const matches = durationString.match(/(\d+)/);
  if (!matches) return 'Varies';
  
  const value = parseInt(matches[0], 10);
  const lowerDuration = durationString.toLowerCase();

  let weeks = 0;
  if (lowerDuration.includes('week')) {
    weeks = value;
  } else if (lowerDuration.includes('day')) {
    weeks = value / 7;
  } else if (lowerDuration.includes('month')) {
    weeks = value * 4.345; // More precise approximation
  } else if (lowerDuration.includes('year')) {
    weeks = value * 52;
  }

  if (weeks === 0) return 'Varies';
  return weeks < 8 ? 'Short-term' : 'Long-term';
};


// FIX: Changed to a named export to resolve module loading issue.
export const Home: React.FC<HomeProps> = ({ setSelectedProgram, trackedApplications, addApplication }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'All Categories',
    mode: 'All Modes',
    cost: 'All Costs',
    location: 'All Locations',
    duration: 'All Durations',
  });

  const { uniqueCategories, uniqueModes } = useMemo(() => {
    const categories = new Set<string>();
    const modes = new Set<string>();
    programs.forEach(p => {
      categories.add(p.category);
      modes.add(p.mode);
    });
    return { 
      uniqueCategories: ['All Categories', ...Array.from(categories).sort()], 
      uniqueModes: ['All Modes', ...Array.from(modes)] 
    };
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredPrograms = useMemo(() => programs.filter(p => {
    const searchMatch = (
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.organization.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const categoryMatch = filters.category === 'All Categories' || p.category === filters.category;
    const modeMatch = filters.mode === 'All Modes' || p.mode === filters.mode;
    const costMatch = filters.cost === 'All Costs' || getCostCategory(p.cost) === filters.cost;
    const locationMatch = filters.location === 'All Locations' || getLocationCategory(p) === filters.location;
    const durationMatch = filters.duration === 'All Durations' || getDurationCategory(p.duration) === filters.duration;

    return searchMatch && categoryMatch && modeMatch && costMatch && locationMatch && durationMatch;
  }), [searchTerm, filters]);

  const trackedProgramIds = useMemo(() => new Set(trackedApplications.map(app => app.programId)), [trackedApplications]);

  return (
    <div className="text-white">
      {/* Hero Section */}
      <section className="pt-20 pb-12 text-center bg-gradient-to-b from-gray-900/10 to-transparent">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-teal-400">Unlock Your Future</h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Your intelligent partner for navigating and conquering applications to the world's most prestigious summer programs.
          </p>
        </div>
      </section>
      
      {/* Program Explorer */}
      <section id="explorer" className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Program Explorer</h2>
            <p className="text-gray-400 mt-2">Find the perfect program to launch your journey.</p>
          </div>
          
          <div className="mb-8 p-4 bg-gray-900/30 rounded-xl border border-gray-700/50 flex flex-col gap-4">
            <input 
              type="text" 
              placeholder="Search by program or institution..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800/50 border border-gray-600 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <select name="category" value={filters.category} onChange={handleFilterChange} className="bg-gray-800/50 border border-gray-600 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-teal-500">
                {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select name="mode" value={filters.mode} onChange={handleFilterChange} className="bg-gray-800/50 border border-gray-600 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-teal-500">
                {uniqueModes.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select name="cost" value={filters.cost} onChange={handleFilterChange} className="bg-gray-800/50 border border-gray-600 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option>All Costs</option>
                <option>Free</option>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
              <select name="location" value={filters.location} onChange={handleFilterChange} className="bg-gray-800/50 border border-gray-600 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option>All Locations</option>
                <option>USA</option>
                <option>International</option>
                <option>Online</option>
              </select>
              <select name="duration" value={filters.duration} onChange={handleFilterChange} className="bg-gray-800/50 border border-gray-600 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option>All Durations</option>
                <option value="Short-term">Short-term (&lt;8 wks)</option>
                <option value="Long-term">Long-term (≥8 wks)</option>
              </select>
            </div>
          </div>
          
          {filteredPrograms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredPrograms.map(program => (
                <ProgramCard 
                  key={program.id} 
                  program={program} 
                  onViewDetails={() => setSelectedProgram(program)} 
                  onAddToTracker={() => addApplication(program)}
                  isTracked={trackedProgramIds.has(program.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">No programs found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
