import React from 'react';
import { MailIcon, PhoneIcon, LinkedInIcon, InstagramIcon } from './icons/Icons';

const Footer: React.FC = () => {
  return (
    <footer id="footer" className="bg-[#0a101f] text-gray-300 border-t border-teal-500/10">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold text-white mb-4">AdmitAI<span className="text-teal-400">Global</span></h3>
            <p className="text-sm text-gray-400">Your smart admissions partner.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact Developer</h3>
            <div className="flex items-center space-x-3 mb-2">
              <PhoneIcon />
              <span>+20 1002891395</span>
            </div>
            <div className="flex items-center space-x-3">
              <MailIcon />
              <span>m.walid19022010@gmail.com</span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="https://www.linkedin.com/in/mohamed-walid-a071a234a/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-gray-400 hover:text-white transition-colors"><LinkedInIcon /></a>
              <a href="https://www.instagram.com/m_walid_77/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-400 hover:text-white transition-colors"><InstagramIcon /></a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Get Deadline Reminders</h3>
            <form className="flex">
              <input 
                type="email" 
                placeholder="Your email" 
                className="w-full px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-l-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                aria-label="Email for deadline reminders"
              />
              <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-r-md transition duration-300">
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
          <p className="mb-2">Built with ❤️ by Mohamed Walid Abdelsalam Attiat Allah | Sharkya STEM School | 2025</p>
          <p>&copy; 2025 AdmitAI Global. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
