import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Award, Home, UserCircle, Utensils, LogIn } from 'lucide-react';
import { User } from 'firebase/auth';

interface Props {
  user: User | null;
}

const Navbar: React.FC<Props> = ({ user }) => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:top-0 md:bottom-auto md:border-b md:border-gray-100 shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="hidden md:flex items-center space-x-2 group">
            <Activity className="h-8 w-8 text-blue-600 transition-transform group-hover:scale-110" />
            <span className="text-xl font-bold text-blue-900 tracking-tight">FitAI Trainer</span>
          </Link>
          
          <div className="flex justify-around w-full md:w-auto md:space-x-8">
            <Link to="/" className={`flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-1 transition-colors ${isActive('/') ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
              <Home className="h-5 w-5 md:h-6 md:w-6" />
              <span className="text-[10px] md:text-sm font-bold">Home</span>
            </Link>
            <Link to="/recommendations" className={`flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-1 transition-colors ${isActive('/recommendations') ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
              <Activity className="h-5 w-5 md:h-6 md:w-6" />
              <span className="text-[10px] md:text-sm font-bold">Workout</span>
            </Link>
            <Link to="/diet" className={`flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-1 transition-colors ${isActive('/diet') ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
              <Utensils className="h-5 w-5 md:h-6 md:w-6" />
              <span className="text-[10px] md:text-sm font-bold">Diet</span>
            </Link>
            <Link to="/progress" className={`flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-1 transition-colors ${isActive('/progress') ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
              <Award className="h-5 w-5 md:h-6 md:w-6" />
              <span className="text-[10px] md:text-sm font-bold">Stats</span>
            </Link>
            {user ? (
              <Link to="/settings" className={`flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-1 transition-colors ${isActive('/settings') ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
                <UserCircle className="h-5 w-5 md:h-6 md:w-6" />
                <span className="text-[10px] md:text-sm font-bold truncate max-w-[60px] md:max-w-none">
                  {user.displayName?.split(' ')[0] || 'Profile'}
                </span>
              </Link>
            ) : (
              <Link to="/auth" className={`flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-1 transition-colors ${isActive('/auth') ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
                <LogIn className="h-5 w-5 md:h-6 md:w-6" />
                <span className="text-[10px] md:text-sm font-bold">Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
