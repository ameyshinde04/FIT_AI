import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ShieldCheck, Cpu, ArrowRight } from 'lucide-react';
import { User } from 'firebase/auth';

interface Props {
  user: User | null;
}

const Home: React.FC<Props> = ({ user }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-16 pb-20 px-4 flex flex-col items-center">
      <div className="max-w-4xl w-full text-center mt-10">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          Your Personal AI Fitness Trainer
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed">
          Reach your fitness goals with real-time posture tracking and custom workout plans 
          made for every age group. Experience the future of home fitness today.
        </p>
        
        <button 
          onClick={() => navigate(user ? '/select-age' : '/auth')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-full text-xl font-bold transition-all transform hover:scale-105 shadow-xl flex items-center mx-auto"
        >
          {user ? 'Continue Your Journey' : 'Start Your Journey'} <ArrowRight className="ml-2" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full mt-20">
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 flex flex-col items-center text-center">
          <div className="bg-blue-100 p-4 rounded-full mb-4">
            <Cpu className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold mb-2">AI Posture Tracking</h3>
          <p className="text-gray-600">Tracks your body movements using your camera in real-time.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 flex flex-col items-center text-center">
          <div className="bg-green-100 p-4 rounded-full mb-4">
            <Zap className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold mb-2">Voice Guide</h3>
          <p className="text-gray-600">Voice feedback tells you if you are doing the exercise correctly.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 flex flex-col items-center text-center">
          <div className="bg-purple-100 p-4 rounded-full mb-4">
            <ShieldCheck className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold mb-2">Plans for Every Age</h3>
          <p className="text-gray-600">Workouts and diets made for kids, adults, and seniors.</p>
        </div>
      </div>
      
      <div className="mt-20 w-full max-w-4xl bg-gray-900 text-white p-10 rounded-3xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-4">How it works</h2>
          <ol className="space-y-4">
            <li className="flex items-start space-x-3">
              <span className="bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-1">1</span>
              <p>Choose your age group for a personal plan.</p>
            </li>
            <li className="flex items-start space-x-3">
              <span className="bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-1">2</span>
              <p>Turn on camera for AI tracking.</p>
            </li>
            <li className="flex items-start space-x-3">
              <span className="bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-1">3</span>
              <p>Follow the guides to exercise correctly.</p>
            </li>
          </ol>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 opacity-20 rounded-full -mr-20 -mt-20 blur-3xl"></div>
      </div>
    </div>
  );
};

export default Home;
