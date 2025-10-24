import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
// FIX: Changed to a named import to resolve module loading issue.
import { Home } from './components/Home';
// FIX: Corrected typo in component import path.
import ProgramDetail from './components/ProgramDetail';
import AIAssistant from './components/AIAssistant';
import Dashboard from './components/Dashboard';
import Simulation from './components/Simulation';
import { View, Program, ApplicationProgress } from './types';
import { programs } from './data/programs';

const initialProgress: ApplicationProgress[] = [
  {
    programId: 'yygs',
    programTitle: 'Yale Young Global Scholars',
    programLogo: programs.find(p => p.id === 'yygs')?.logo || '',
    status: 'In Progress',
    deadlineDate: '2025-01-15',
    checklist: [
      { item: 'Online Application Form', completed: true },
      { item: 'Essay 1: Topic of Your Choice', completed: true },
      { item: 'Essay 2: Why YYGS?', completed: false },
      { item: 'Request Letters of Recommendation', completed: true },
      { item: 'Submit Transcript', completed: false },
    ]
  },
  {
    programId: 'pioneer',
    programTitle: 'Pioneer Research Program',
    programLogo: programs.find(p => p.id === 'pioneer')?.logo || '',
    status: 'Not Started',
    deadlineDate: '2025-02-01',
    checklist: [
      { item: 'Online Application Form', completed: true },
      { item: 'Submit Transcript', completed: false },
      { item: 'Upload Writing Sample', completed: false },
      { item: 'Schedule Faculty Interview', completed: false },
    ]
  }
];


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [user, setUser] = useState<{name: string} | null>(null);
  const [applications, setApplications] = useState<ApplicationProgress[]>(initialProgress);

  // Simulate user login
  useEffect(() => {
    setUser({ name: 'Mohamed' });
  }, []);

  // FIX: Handle invalid state without causing a render loop or state update during render.
  // This prevents updating state during render, which can cause unexpected errors.
  useEffect(() => {
    if (currentView === 'programDetail' && !selectedProgram) {
      setCurrentView('home');
    }
  }, [currentView, selectedProgram]);

  const handleSetView = (view: View) => {
    window.scrollTo(0, 0);
    setCurrentView(view);
  };

  const handleSelectProgram = (program: Program) => {
    setSelectedProgram(program);
    handleSetView('programDetail');
  };

  const addApplicationToTracker = (program: Program) => {
    if (applications.some(app => app.programId === program.id)) return; // Already exists

    const newApplication: ApplicationProgress = {
      programId: program.id,
      programTitle: program.title,
      programLogo: program.logo,
      status: 'Not Started',
      deadlineDate: '2025-03-01', // Placeholder, could be dynamic
      checklist: program.applicationSteps.map(step => ({ item: step, completed: false })),
    };
    setApplications(prev => [...prev, newApplication]);
    // Optionally, navigate to dashboard after adding
    handleSetView('dashboard');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return <Home 
          setSelectedProgram={handleSelectProgram} 
          trackedApplications={applications}
          addApplication={addApplicationToTracker}
        />;
      case 'programDetail':
        if (selectedProgram) {
          return <ProgramDetail 
            program={selectedProgram} 
            onBack={() => handleSetView('home')}
            onGoToAssistant={() => handleSetView('aiAssistant')}
            onAddToTracker={() => addApplicationToTracker(selectedProgram)}
            isTracked={applications.some(app => app.programId === selectedProgram.id)}
          />;
        }
        // Fallback is handled by useEffect. Render nothing or a loader while "redirecting".
        return null;
      case 'aiAssistant':
        return <AIAssistant />;
      case 'dashboard':
        return <Dashboard applications={applications} setApplications={setApplications} />;
      case 'simulation':
        return <Simulation />;
      default:
        return <Home 
          setSelectedProgram={handleSelectProgram}
          trackedApplications={applications}
          addApplication={addApplicationToTracker}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a101f] via-[#000000] to-[#0d1a3a] font-sans">
      <Header setView={handleSetView} user={user} />
      <main>
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

export default App;