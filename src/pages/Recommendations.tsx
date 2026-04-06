import birdDogImg from "../assets/exercises/bird_dog.jpg";
import gluteBridgeImg from "../assets/exercises/glute_birdge.avif";
import heelRaisesImg from "../assets/exercises/heel_raises.jpg";
import highKneesImg from "../assets/exercises/high_knees.jpg";
import jumpingJacksImg from "../assets/exercises/jumping_jacks.jpg";
import kneePushupsImg from "../assets/exercises/knee_pushups.jpg";
import lungesImg from "../assets/exercises/lunges.jpg";
import plankImg from "../assets/exercises/plank.jpg";
import pushUpsImg from "../assets/exercises/push_ups.jpg";
import seatedArmRaisesImg from "../assets/exercises/seated_arm_raises.jpg";
import seatedLegRaisesImg from "../assets/exercises/seated_leg_raises.jpg";
import squatsImg from "../assets/exercises/squats.jpg";

import React from "react";
import { useNavigate } from "react-router-dom";
import { AgeGroup, Exercise } from "../../types";
import { EXERCISES } from "../../constants";
import {
  Clock,
  Play,
  Flame,
  Target,
  Wind,
  Zap,
  Activity,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

interface Props {
  selectedAgeGroup: AgeGroup | null;
}

const EXERCISE_IMAGES: Record<string, string> = {
  // CHILDREN
  c_jj: jumpingJacksImg,
  c_kp: kneePushupsImg,
  c_hk: highKneesImg,

  // YOUNG ADULTS
  y_pu: pushUpsImg,
  y_sq: squatsImg,
  y_ln: lungesImg,

  // ADULTS
  a_pl: plankImg,
  a_gb: gluteBridgeImg,
  a_bd: birdDogImg,

  // SENIORS
  s_sl: seatedLegRaisesImg,
  s_hr: heelRaisesImg,
  s_ar: seatedArmRaisesImg,
};

const DIFFICULTY_STYLES: Record<string, { bg: string; text: string }> = {
  Easy: { bg: "bg-emerald-100", text: "text-emerald-700" },
  Medium: { bg: "bg-amber-100", text: "text-amber-700" },
  Hard: { bg: "bg-rose-100", text: "text-rose-700" },
};

const Recommendations: React.FC<Props> = ({ selectedAgeGroup }) => {
  const navigate = useNavigate();

  if (!selectedAgeGroup) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
        <Activity className="h-10 w-10 text-gray-200 mb-4 animate-pulse" />
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">
          Select Profile
        </h2>
      </div>
    );
  }

  const exercises = EXERCISES[selectedAgeGroup];

  const startWorkoutSequence = () => {
    navigate("/workout", {
      state: {
        sequence: exercises,
        sequenceTitle: `${selectedAgeGroup} Training`,
      },
    });
  };

  const startSingleWorkout = (ex: Exercise) => {
    navigate("/workout", {
      state: {
        sequence: [ex],
        sequenceTitle: ex.name,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-24 px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-14 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-1 block pl-1">
            Workout Hub
          </span>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase leading-none">
            {selectedAgeGroup} Program
          </h1>
          <p className="text-gray-500 font-bold max-w-lg text-sm mt-2 leading-tight pl-1">
            Choose an exercise or start the full workout session.
          </p>
        </div>

        <button
          onClick={startWorkoutSequence}
          className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-blue-700 transition-all flex items-center group active:scale-95"
        >
          Start Full Workout <Play className="ml-3 h-3 w-3 fill-current" />
        </button>
      </div>

      {/* Modern Refined Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
        {exercises.map((ex) => {
          const style = DIFFICULTY_STYLES[ex.difficulty];
          return (
            <div
              key={ex.id}
              onClick={() => startSingleWorkout(ex)}
              className="group cursor-pointer bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 flex flex-col overflow-hidden h-full"
            >
              {/* Image Section */}
              <div className="relative h-64 bg-gray-100 flex items-center justify-center overflow-hidden">
                <img
                  src={EXERCISE_IMAGES[ex.id] || jumpingJacksImg}
                  alt={ex.name}
                  className="h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                />

                <div className="absolute bottom-4 right-4">
                  <span className="px-3 py-1.5 rounded-xl bg-black/70 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-blue-400" /> {ex.duration}
                  </span>
                </div>
              </div>
              <div className="p-7 flex flex-col flex-1">
                {/* Header */}
                <div className="mb-4 flex justify-between items-start">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase leading-none group-hover:text-blue-600 transition-colors pr-2">
                    {ex.name}
                  </h3>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${style.bg} ${style.text} shrink-0`}
                  >
                    {ex.difficulty}
                  </span>
                </div>

                {/* Muscle Group Tag */}
                <div className="mb-4">
                  <div className="inline-flex items-center text-blue-600 bg-blue-50/50 px-3 py-1.5 rounded-lg border border-blue-100/50">
                    <Target className="w-3.5 h-3.5 mr-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {ex.muscleGroup}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6 line-clamp-2">
                  {ex.description}
                </p>

                {/* Benefits - Clean, outside box */}
                <div className="mt-auto mb-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-sm font-bold text-gray-700 leading-snug">
                      {ex.benefits}
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-5 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center text-gray-500 gap-2">
                    <div className="p-1.5 bg-orange-50 rounded-full text-orange-500">
                      <Flame className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-orange-600">
                      {ex.calories} Kcal
                    </span>
                  </div>

                  <span className="text-blue-600 font-black text-[11px] uppercase tracking-widest flex items-center group-hover:gap-2 transition-all">
                    Start <ChevronRight className="w-4 h-4 ml-1" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Protocol Section - Black Theme */}
      <div className="bg-black border border-white/10 rounded-[2.5rem] shadow-2xl p-10 md:p-14 overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600 rounded-full -mr-40 -mt-40 blur-[100px] opacity-20"></div>

        <div className="relative z-10">
          <div className="mb-10 pl-4">
            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mb-1">
              Plan
            </h4>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
              Workout Structure
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="p-8 bg-white/5 rounded-3xl border border-white/5 transition-all hover:bg-white/10">
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg">
                  <Wind className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-black text-blue-400 uppercase tracking-widest">
                  3-5 Mins
                </span>
              </div>
              <h4 className="text-xl font-black text-white uppercase tracking-tight mb-2 leading-none">
                1. Warmup
              </h4>
              <p className="text-sm text-gray-400 font-bold leading-tight">
                Do light movements like arm circles or jumping jacks to warm up
                your body and joints.
              </p>
            </div>

            <div className="p-8 bg-white/5 rounded-3xl border border-white/5 transition-all hover:bg-white/10">
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">
                  15-20 Mins
                </span>
              </div>
              <h4 className="text-xl font-black text-white uppercase tracking-tight mb-2 leading-none">
                2. Main Phase
              </h4>
              <p className="text-sm text-gray-400 font-bold leading-tight">
                Do exercises carefully. Aim for 3 sets of 10-12 reps. Take a
                45-second rest between sets.
              </p>
            </div>

            <div className="p-8 bg-white/5 rounded-3xl border border-white/5 transition-all hover:bg-white/10">
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg">
                  <Activity className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">
                  5 Mins
                </span>
              </div>
              <h4 className="text-xl font-black text-white uppercase tracking-tight mb-2 leading-none">
                3. Cool Down
              </h4>
              <p className="text-sm text-gray-400 font-bold leading-tight">
                Stretch your muscles for 20 seconds each to relax and stop pain
                later.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
