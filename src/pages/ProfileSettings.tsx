import React from 'react';
import { UserProfile } from '../../types';
import { User, Ruler, Weight, Activity, Target, Utensils, Edit3, ShieldCheck, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';

interface Props {
  profile: UserProfile | null;
}

const ProfileSettings: React.FC<Props> = ({ profile }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen pt-24 pb-20 px-4 flex flex-col items-center justify-center bg-gray-50">
        <p className="text-gray-500 mb-6">No profile found. Let's create one!</p>
        <button 
          onClick={() => navigate('/select-age')}
          className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg"
        >
          Setup Profile
        </button>
      </div>
    );
  }

  const sections = [
    { label: 'Basic Info', items: [
      { icon: <User className="w-5 h-5" />, title: 'Age', value: `${profile.age} years` },
      { icon: <ShieldCheck className="w-5 h-5" />, title: 'Gender', value: profile.gender },
      { icon: <Activity className="w-5 h-5" />, title: 'Group', value: profile.ageGroup },
    ]},
    { label: 'Body Stats', items: [
      { icon: <Ruler className="w-5 h-5" />, title: 'Height', value: `${profile.height} cm` },
      { icon: <Weight className="w-5 h-5" />, title: 'Weight', value: `${profile.weight} kg` },
      { icon: <Activity className="w-5 h-5" />, title: 'Activity', value: profile.activityLevel.split('(')[0] },
    ]},
    { label: 'Goal & Diet', items: [
      { icon: <Target className="w-5 h-5" />, title: 'Goal', value: profile.goal },
      { icon: <Utensils className="w-5 h-5" />, title: 'Diet', value: profile.preference },
    ]}
  ];

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-1 uppercase">User Profile</h2>
            <p className="text-gray-500 font-medium">View your details.</p>
          </div>
          <button 
            onClick={() => navigate('/select-age')}
            className="p-3 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all text-blue-600 flex items-center space-x-2"
          >
            <Edit3 className="w-5 h-5" />
            <span className="font-bold text-sm">Edit</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {sections.map(section => (
            <div key={section.label} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-400 uppercase tracking-widest mb-6">{section.label}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {section.items.map(item => (
                  <div key={item.title} className="flex flex-col">
                    <div className="text-blue-500 mb-2">{item.icon}</div>
                    <p className="text-xs font-bold text-gray-400 uppercase">{item.title}</p>
                    <p className="text-lg font-black text-gray-900">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col md:flex-row gap-4">
          <div className="flex-1 bg-gray-900 rounded-[2rem] p-8 text-white flex items-center justify-between overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 opacity-20 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <div>
              <h4 className="text-xl font-bold mb-2">Trainer Access</h4>
              <p className="text-gray-400 text-sm">Your data is synced locally.</p>
            </div>
            <Activity className="h-12 w-12 text-blue-500 opacity-30" />
          </div>
          
          <button 
            onClick={handleLogout}
            className="md:w-48 bg-white border-2 border-red-50 text-red-600 rounded-[2rem] p-8 flex flex-col items-center justify-center hover:bg-red-50 transition-all group"
          >
            <LogOut className="h-8 w-8 mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-black uppercase tracking-widest text-xs">Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
