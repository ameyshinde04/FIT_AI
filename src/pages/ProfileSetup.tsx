import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgeGroup, Gender, DietaryPreference, ActivityLevel, UserProfile, WeightGoal } from '../../types';
import { User, Ruler, Weight, Activity, ChevronRight, ChevronLeft, Salad, Drumstick, Target, AlertCircle, Calendar } from 'lucide-react';
import { auth, db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';

interface Props {
  onComplete: (profile: UserProfile) => void;
}

const ProfileSetup: React.FC<Props> = ({ onComplete }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    age: undefined,
    height: undefined,
    weight: undefined,
    gender: undefined,
    preference: undefined,
    activityLevel: undefined,
    goal: undefined
  });

  const calculateAgeGroup = (age: number): AgeGroup => {
    if (age <= 14) return AgeGroup.CHILDREN;
    if (age <= 30) return AgeGroup.YOUNG_ADULTS;
    if (age <= 50) return AgeGroup.ADULTS;
    return AgeGroup.SENIORS;
  };

  const validateStep = () => {
    setError(null);
    if (step === 1) {
      if (!formData.gender) return "Please select your gender.";
      if (formData.age === undefined || formData.age < 8 || formData.age > 120) return "Please enter a valid age (8-120).";
      if (formData.height === undefined || formData.height < 50 || formData.height > 250) return "Please enter a valid height (50-250cm).";
      if (formData.weight === undefined || formData.weight < 20 || formData.weight > 300) return "Please enter a valid weight (20-300kg).";
    }
    if (step === 2) {
      if (!formData.activityLevel) return "Please select your activity level.";
    }
    if (step === 3) {
      if (!formData.preference) return "Please select your dietary preference.";
    }
    if (step === 4) {
      if (!formData.goal) return "Please select your fitness goal.";
    }
    return null;
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinish = async () => {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    try {
      const profile = {
        ...formData,
        ageGroup: calculateAgeGroup(formData.age || 25)
      } as UserProfile;

      if (auth.currentUser) {
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          ...profile,
          uid: auth.currentUser.uid,
          updatedAt: new Date().toISOString()
        });
      }

      onComplete(profile);
      navigate('/recommendations');
      window.scrollTo(0, 0);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof UserProfile, value: any) => {
    setError(null);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const hideSpinnersStyle = `
    input[type=number]::-webkit-inner-spin-button, 
    input[type=number]::-webkit-outer-spin-button { 
      -webkit-appearance: none; 
      margin: 0; 
    }
    input[type=number] {
      -moz-appearance: textfield;
    }
  `;

  const inputClasses = "w-full p-3.5 rounded-xl border-2 border-gray-100 bg-gray-50 text-gray-900 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50/50 outline-none transition-all font-bold text-base placeholder:text-gray-300";

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 flex flex-col items-center bg-gray-50">
      <style>{hideSpinnersStyle}</style>
      <div className="max-w-lg w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100">
        <div className="h-2 bg-gray-100 flex">
          <div 
            className="h-full bg-blue-600 transition-all duration-700 ease-out" 
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center text-red-600 font-bold text-xs">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="text-center">
                <h2 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">Your Details</h2>
                <p className="text-gray-500 font-medium text-sm">Basic info for your personal plan.</p>
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center">
                  <User className="w-3 h-3 mr-1.5" /> Gender
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[Gender.MALE, Gender.FEMALE].map(g => (
                    <button
                      key={g}
                      onClick={() => updateField('gender', g)}
                      className={`py-3 rounded-xl border-2 transition-all font-black text-xs uppercase tracking-widest ${
                        formData.gender === g 
                        ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-100' 
                        : 'border-gray-100 hover:border-blue-200 bg-white text-gray-600'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center">
                    <Calendar className="w-3 h-3 mr-1.5" /> Age
                  </label>
                  <input 
                    type="number" 
                    placeholder="25"
                    value={formData.age === undefined ? '' : formData.age}
                    onChange={(e) => updateField('age', e.target.value === '' ? undefined : parseInt(e.target.value))}
                    className={inputClasses}
                  />
                </div>
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center">
                    <Ruler className="w-3 h-3 mr-1.5" /> Height (cm)
                  </label>
                  <input 
                    type="number" 
                    placeholder="175"
                    value={formData.height === undefined ? '' : formData.height}
                    onChange={(e) => updateField('height', e.target.value === '' ? undefined : parseInt(e.target.value))}
                    className={inputClasses}
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center">
                  <Weight className="w-3 h-3 mr-1.5" /> Weight (kg)
                </label>
                <input 
                  type="number" 
                  placeholder="70"
                  value={formData.weight === undefined ? '' : formData.weight}
                  onChange={(e) => updateField('weight', e.target.value === '' ? undefined : parseInt(e.target.value))}
                  className={inputClasses}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="text-center">
                <h2 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">Activity Level</h2>
                <p className="text-gray-500 font-medium text-sm">How active are you every day?</p>
              </div>

              <div className="space-y-2.5">
                {Object.values(ActivityLevel).map((level) => (
                  <button
                    key={level}
                    onClick={() => updateField('activityLevel', level)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex justify-between items-center group ${
                      formData.activityLevel === level 
                      ? 'border-blue-600 bg-blue-50 shadow-md' 
                      : 'border-gray-100 hover:border-blue-200 bg-white'
                    }`}
                  >
                    <div>
                      <p className="font-black text-gray-900 text-base">{level.split('(')[0]}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                        {level.includes('(') ? level.split('(')[1].replace(')', '') : ''}
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${formData.activityLevel === level ? 'bg-blue-600 border-blue-600' : 'border-gray-200 group-hover:border-blue-300'}`}>
                      {formData.activityLevel === level && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="text-center">
                <h2 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">Diet Type</h2>
                <p className="text-gray-500 font-medium text-sm">Choose your food preference.</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: DietaryPreference.VEGETARIAN, icon: <Salad className="w-5 h-5" />, label: 'Vegetarian', desc: 'Vegetables, pulses, and grains.', iconClass: 'text-emerald-600 bg-emerald-100' },
                  { id: DietaryPreference.NON_VEGETARIAN, icon: <Drumstick className="w-5 h-5" />, label: 'Standard', desc: 'Includes eggs, meat, and fish.', iconClass: 'text-orange-600 bg-orange-100' },
                ].map((pref) => (
                  <button
                    key={pref.id}
                    onClick={() => updateField('preference', pref.id)}
                    className={`p-5 rounded-2xl border-2 flex items-center space-x-5 transition-all ${
                      formData.preference === pref.id 
                      ? 'border-blue-600 bg-blue-50 shadow-md' 
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                  >
                    <div className={`p-3 rounded-xl ${formData.preference === pref.id ? 'bg-blue-600 text-white shadow-md' : pref.iconClass}`}>
                      {pref.icon}
                    </div>
                    <div className="text-left">
                      <p className="font-black text-gray-900 text-lg">{pref.label}</p>
                      <p className="text-xs text-gray-500 font-medium">{pref.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="text-center">
                <h2 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">Your Goal</h2>
                <p className="text-gray-500 font-medium text-sm">What do you want to achieve?</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: WeightGoal.LOSE, color: 'text-rose-500', label: 'Lose Weight', desc: 'Burn fat and get leaner.' },
                  { id: WeightGoal.MAINTAIN, color: 'text-blue-500', label: 'Stay Healthy', desc: 'Maintain weight and fitness.' },
                  { id: WeightGoal.GAIN, color: 'text-emerald-500', label: 'Gain Muscle', desc: 'Build muscle and strength.' },
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => updateField('goal', g.id)}
                    className={`p-5 rounded-2xl border-2 text-left transition-all ${
                      formData.goal === g.id 
                      ? 'border-blue-600 bg-blue-50 shadow-md' 
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-black text-gray-900 text-lg">{g.label}</p>
                      <Target className={`w-4 h-4 ${formData.goal === g.id ? 'text-blue-600' : g.color}`} />
                    </div>
                    <p className="text-xs text-gray-500 font-medium">{g.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex space-x-3">
            {step > 1 && (
              <button 
                onClick={() => {
                  setStep(s => s - 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex-1 py-4 px-6 rounded-2xl border-2 border-gray-100 font-black text-xs uppercase tracking-widest flex items-center justify-center hover:bg-gray-50 transition-colors bg-white text-gray-500"
              >
                <ChevronLeft className="mr-2 h-3 w-3" /> Back
              </button>
            )}
            <button 
              onClick={() => step < 4 ? handleNext() : handleFinish()}
              disabled={loading}
              className="flex-1 py-4 px-6 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg active:scale-95 shadow-blue-200 disabled:opacity-50 disabled:scale-100"
            >
              {loading ? 'Saving...' : (step === 4 ? 'Continue' : 'Next')} 
              {!loading && <ChevronRight className="ml-2 h-3 w-3" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;