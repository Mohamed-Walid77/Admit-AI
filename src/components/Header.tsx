import React from 'react';
import { View } from '../types';

interface HeaderProps {
  setView: (view: View) => void;
  user: { name: string } | null;
}

const Header: React.FC<HeaderProps> = ({ setView, user }) => {
  return (
    <header className="sticky top-0 z-50 bg-[#0a101f]/80 backdrop-blur-lg border-b border-teal-500/10">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-white cursor-pointer" onClick={() => setView('home')}>
          AdmitAI <span className="text-teal-400">Global</span>
        </div>
        <div className="hidden md:flex space-x-8 items-center">
          <a onClick={() => setView('home')} className="text-gray-300 hover:text-white transition duration-300 cursor-pointer">Program Explorer</a>
          <a onClick={() => setView('simulation')} className="text-gray-300 hover:text-white transition duration-300 cursor-pointer">Simulator</a>
          {user ? (
             <a onClick={() => setView('dashboard')} className="text-gray-300 hover:text-white transition duration-300 cursor-pointer">Dashboard</a>
          ) : null}
          <a href="#" className="text-gray-600 cursor-not-allowed">Blog</a>
          <a href="#footer" className="text-gray-300 hover:text-white transition duration-300 cursor-pointer">Contact</a>
           {user ? (
            <div className="flex items-center gap-4">
              <span className="text-gray-400">Hi, {user.name} 👋</span>
              <button
                onClick={() => alert('Sign Out clicked!')}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                Sign Out
              </button>
            </div>
          ) : (
             <button
                onClick={() => alert('Sign In clicked!')}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg transition"
             >
                Sign In
             </button>
          )}

        </div>
        <div className="md:hidden">
          <button onClick={() => setView('dashboard')} className="bg-teal-500 text-white p-2 rounded-md">
            Dashboard
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
