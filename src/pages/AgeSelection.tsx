import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AgeGroup } from '../../types';
import { Baby, User, Users, Footprints } from 'lucide-react';

interface Props {
  onSelect: (group: AgeGroup) => void;
}

const AgeSelection: React.FC<Props> = ({ onSelect }) => {
  const navigate = useNavigate();

  const handleSelection = (group: AgeGroup) => {
    onSelect(group);
    navigate('/recommendations');
  };

  const groups = [
    { type: AgeGroup.CHILDREN, icon: <Baby className="h-10 w-10" />, color: 'bg-yellow-400', desc: 'Focus on growth, coordination, and fun movements.' },
    { type: AgeGroup.YOUNG_ADULTS, icon: <User className="h-10 w-10" />, color: 'bg-blue-500', desc: 'High intensity for muscle building and stamina.' },
    { type: AgeGroup.ADULTS, icon: <Users className="h-10 w-10" />, color: 'bg-indigo-600', desc: 'Balanced routines for health maintenance and flexibility.' },
    { type: AgeGroup.SENIORS, icon: <Footprints className="h-10 w-10" />, color: 'bg-teal-500', desc: 'Gentle exercises to improve balance and joint health.' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 flex flex-col items-center">
      <h2 className="text-3xl font-bold mb-4">Choose Your Age Group</h2>
      <p className="text-gray-600 mb-10 text-center max-w-md">
        This helps us customize exercises and diet plans specifically for your physiological needs.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        {groups.map((group) => (
          <button
            key={group.type}
            onClick={() => handleSelection(group.type)}
            className="bg-white p-8 rounded-3xl shadow-lg border-2 border-transparent hover:border-blue-500 transition-all flex flex-col items-center text-center group"
          >
            <div className={`${group.color} text-white p-5 rounded-2xl mb-6 shadow-lg transform group-hover:scale-110 transition-transform`}>
              {group.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">{group.type}</h3>
            <p className="text-gray-500 text-sm">{group.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AgeSelection;
