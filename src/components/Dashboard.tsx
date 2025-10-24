import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ApplicationProgress, ApplicationStatus, Program } from '../types';
import { programs } from '../data/programs';

const ProgressWheel: React.FC<{ progress: number }> = ({ progress }) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-16 h-16">
      <svg className="w-full h-full" viewBox="0 0 80 80">
        <circle
          className="text-gray-700"
          strokeWidth="8"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="40"
          cy="40"
        />
        <motion.circle
          className="text-teal-400"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="40"
          cy="40"
          transform="rotate(-90 40 40)"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
        {Math.round(progress)}%
      </span>
    </div>
  );
};

const ApplicationCard: React.FC<{
  application: ApplicationProgress;
  onUpdate: (updatedApp: ApplicationProgress) => void;
  onDelete: () => void;
}> = ({ application, onUpdate, onDelete }) => {
  
  const daysLeft = useMemo(() => {
    const today = new Date();
    const deadline = new Date(application.deadlineDate);
    // Set time to 0 to compare dates only
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);
    const diffTime = deadline.getTime() - today.getTime();
    if (diffTime < 0) return -1; // Past deadline
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [application.deadlineDate]);

  const toggleChecklistItem = (itemIndex: number) => {
    const newChecklist = [...application.checklist];
    newChecklist[itemIndex].completed = !newChecklist[itemIndex].completed;
    onUpdate({ ...application, checklist: newChecklist });
  };

  const setStatus = (status: ApplicationStatus) => {
    onUpdate({ ...application, status });
  };
  
  const progress = useMemo(() => {
    if (application.checklist.length === 0) return 0;
    const completedCount = application.checklist.filter(item => item.completed).length;
    return (completedCount / application.checklist.length) * 100;
  }, [application.checklist]);

  return (
     <motion.div 
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5, type: 'spring' }}
      className="bg-gray-900/50 backdrop-blur-lg border border-teal-500/10 rounded-2xl p-6 flex flex-col md:flex-row gap-6">
      <div className="flex flex-col items-center text-center md:w-1/4">
        <img src={application.programLogo} alt={`${application.programTitle} logo`} className="w-20 h-20 rounded-full mb-4 object-cover"/>
        <h2 className="text-xl font-bold text-white mb-2">{application.programTitle}</h2>
        <div className="text-sm font-bold">
          {daysLeft >= 0 ? 
            <span className="text-teal-400">{daysLeft} days left</span> : 
            <span className="text-red-500">Past Deadline</span>
          }
        </div>
      </div>
      <div className="md:w-3/4 flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <h3 className="font-semibold mb-3 text-gray-300">Checklist</h3>
           <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
              {application.checklist.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-center">
                  <input
                    id={`${application.programId}-${itemIndex}`}
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleChecklistItem(itemIndex)}
                    className="w-4 h-4 text-teal-600 bg-gray-700 border-gray-600 rounded focus:ring-teal-500 cursor-pointer"
                  />
                  <label htmlFor={`${application.programId}-${itemIndex}`} className={`ml-2 text-sm font-medium ${item.completed ? 'text-gray-500 line-through' : 'text-gray-300'} cursor-pointer`}>
                    {item.item}
                  </label>
                </div>
              ))}
            </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t md:border-t-0 md:border-l border-gray-700/50 pt-4 md:pt-0 md:pl-6">
          <ProgressWheel progress={progress} />
           <select 
             value={application.status} 
             onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
             className="bg-gray-800/80 border border-teal-500/30 text-white text-xs rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2 w-full">
            <option>Not Started</option>
            <option>In Progress</option>
            <option>Submitted</option>
            <option>Awaiting Response</option>
          </select>
          <button onClick={onDelete} className="text-xs text-red-500 hover:text-red-400">Remove</button>
        </div>
      </div>
    </motion.div>
  );
};


const AddApplicationModal: React.FC<{
  onClose: () => void;
  onAdd: (program: Program) => void;
  existingIds: Set<string>;
}> = ({ onClose, onAdd, existingIds }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const availablePrograms = programs.filter(p => 
    !existingIds.has(p.id) && 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-[#0a101f] border border-teal-500/20 rounded-xl w-full max-w-lg shadow-2xl">
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-lg font-bold">Add Program to Tracker</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        <div className="p-4">
           <input 
              type="text" 
              placeholder="Search for a program..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800/50 border border-gray-600 rounded-lg p-2 w-full mb-4 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          <div className="max-h-80 overflow-y-auto space-y-2">
            {availablePrograms.map(p => (
              <div key={p.id} className="flex justify-between items-center p-2 rounded-md hover:bg-gray-800">
                <span>{p.title}</span>
                <button onClick={() => { onAdd(p); onClose(); }} className="text-sm bg-teal-600 text-white py-1 px-3 rounded-md hover:bg-teal-700">+</button>
              </div>
            ))}
             {availablePrograms.length === 0 && <p className="text-center text-gray-500 p-4">No more programs to add.</p>}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

interface DashboardProps {
  applications: ApplicationProgress[];
  setApplications: React.Dispatch<React.SetStateAction<ApplicationProgress[]>>;
}


const Dashboard: React.FC<DashboardProps> = ({ applications, setApplications }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const updateApplication = (updatedApp: ApplicationProgress, index: number) => {
    const newApplications = [...applications];
    newApplications[index] = updatedApp;
    setApplications(newApplications);
  };
  
  const deleteApplication = (index: number) => {
    setApplications(apps => apps.filter((_, i) => i !== index));
  };
  
  const addApplication = (program: Program) => {
    const newApplication: ApplicationProgress = {
      programId: program.id,
      programTitle: program.title,
      programLogo: program.logo,
      status: 'Not Started',
      deadlineDate: '2025-01-15', // Placeholder
      checklist: program.applicationSteps.map(step => ({ item: step, completed: false })),
    };
    setApplications(apps => [...apps, newApplication]);
  };

  const existingIds = useMemo(() => new Set(applications.map(app => app.programId)), [applications]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a101f] to-[#0d1a3a] text-white p-4 sm:p-6 md:p-8">
      <div className="container mx-auto max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">My Application Tracker</h1>
          <button onClick={() => setIsModalOpen(true)} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 transform hover:scale-105">
            + Add New
          </button>
        </div>
        
        {applications.length > 0 ? (
          <div className="space-y-8">
            {applications.map((app, appIndex) => (
              <ApplicationCard 
                key={app.programId} 
                application={app} 
                onUpdate={(updated) => updateApplication(updated, appIndex)}
                onDelete={() => deleteApplication(appIndex)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-gray-700 rounded-xl">
             <h2 className="text-2xl font-bold text-gray-400">Your Dashboard is Empty</h2>
             <p className="text-gray-500 mt-2">Add a program from the Program Explorer to start tracking!</p>
          </div>
        )}
      </div>
      {isModalOpen && <AddApplicationModal onClose={() => setIsModalOpen(false)} onAdd={addApplication} existingIds={existingIds} />}
    </div>
  );
};

export default Dashboard;
