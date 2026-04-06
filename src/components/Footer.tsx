import React from 'react';
import { Activity, Github, Twitter, Instagram, Mail } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Footer: React.FC = () => {
  const location = useLocation();
  
  // Hide footer on workout page to maximize focus and screen real estate
  if (location.pathname === '/workout') return null;

  return (
    <footer className="bg-white border-t border-gray-200 pt-12 pb-24 md:pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Activity className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">FitAI Trainer</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Helping you stay fit using AI and camera technology.
            </p>
          </div>

          {/* Platform Links */}
          <div className="md:pl-12">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Home</Link></li>
              <li><Link to="/recommendations" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Exercises</Link></li>
              <li><Link to="/diet" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Nutrition</Link></li>
              <li><Link to="/progress" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Progress</Link></li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="md:pl-12">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Safety Guidelines</a></li>
              <li><a href="#" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Success Stories</a></li>
              <li><a href="#" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-500 hover:text-blue-600 text-sm transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Connect Column */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Contact Us</h4>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-500 transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors" aria-label="Github">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors" aria-label="Email">
                <Mail className="h-5 w-5" />
              </a>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Have feedback? Email us at hello@fitai.trainer
            </p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 text-center">
          <p className="text-gray-400 text-xs">
            © {new Date().getFullYear()} FitAI Trainer. Your health, AI-perfected.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
