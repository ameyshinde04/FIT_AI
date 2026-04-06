import React, { useEffect, useState, useMemo } from "react";
import {
  UserProfile,
  DietPlan,
  ActivityLevel,
  Gender,
  WeightGoal,
} from "../../types";
import { GoogleGenAI, Type } from "@google/genai";
import {
  Coffee,
  Sun,
  Apple,
  Moon,
  Droplets,
  Info,
  Flame,
  Target,
  Sparkles,
  BrainCircuit,
  Calendar,
  ChevronRight,
  LayoutGrid,
  AlertTriangle,
  RotateCcw,
  Zap,
  PieChart,
  Activity,
  Quote,
} from "lucide-react";

import { auth, db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";

interface Props {
  profile: UserProfile | null;
  dietPlan: DietPlan | null;
  setDietPlan: (plan: DietPlan) => void;
  aiInsight: string;
  setAiInsight: (insight: string) => void;
}

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DietPlanPage: React.FC<Props> = ({
  profile,
  dietPlan,
  setDietPlan,
  aiInsight,
  setAiInsight,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; code?: number } | null>(
    null,
  );
  const [selectedDay, setSelectedDay] = useState<string>(
    DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1],
  );

  const bmi = useMemo(() => {
    if (!profile) return 0;
    const heightInMeters = profile.height / 100;
    return parseFloat(
      (profile.weight / (heightInMeters * heightInMeters)).toFixed(1),
    );
  }, [profile]);

  const tdee = useMemo(() => {
    if (!profile) return 0;
    let bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age;
    if (profile.gender === Gender.MALE) bmr += 5;
    else bmr -= 161;
    const activityMultipliers = {
      [ActivityLevel.SEDENTARY]: 1.2,
      [ActivityLevel.LIGHT]: 1.375,
      [ActivityLevel.MODERATE]: 1.55,
      [ActivityLevel.ACTIVE]: 1.725,
      [ActivityLevel.VERY_ACTIVE]: 1.9,
    };
    const maintenanceCalories = Math.round(
      bmr * activityMultipliers[profile.activityLevel],
    );
    if (profile.goal === WeightGoal.LOSE) return maintenanceCalories - 500;
    if (profile.goal === WeightGoal.GAIN) return maintenanceCalories + 400;
    return maintenanceCalories;
  }, [profile]);

  const fetchDietPlan = async () => {
    if (!profile || (dietPlan && aiInsight)) return;
    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const modelName = "gemini-3-flash-preview";

      const response = await ai.models.generateContent({
        model: modelName,
        contents: `Generate a detailed Indian meal plan (7 days) for a ${profile.age} year old ${profile.gender}. Weight: ${profile.weight}kg, Height: ${profile.height}cm, BMI ${bmi}. Goal: ${profile.goal}. Preference: ${profile.preference}. Calories: ${tdee}. 
        
        INSTRUCTIONS:
        - Use simple English suitable for India.
        - Use common Indian dishes (e.g., Dal, Roti, Rice, Curd, Idli, Poha).
        - CRITICAL: You MUST specify exact quantities for EVERY item. Example: "2 Rotis (60g)", "1 bowl Dal (150g)", "100g Paneer", "1 cup Rice (150g)".
        - Be precise with grams (g), cups, or pieces for every single food item listed.
        - Keep explanations simple but detailed regarding portion sizes.
        - CRITICAL: For macros, provide a SINGLE number per day (e.g., "120g"), NOT a range. These must be DAILY averages.
        
        Provide JSON:
        1. "briefAnalysis": 1 line simple advice.
        2. "weeklyPlan": Mon-Sun meals.
        3. "hydration": Water amount.
        4. "hydrationSchedule": 5 specific times to drink water (e.g., "Upon waking: 500ml").
        5. "macros": Daily protein, carbs, fats (Single value in grams).
        6. "tips": 3 simple tips.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              briefAnalysis: { type: Type.STRING },
              weeklyPlan: {
                type: Type.OBJECT,
                properties: DAYS.reduce(
                  (acc, day) => ({
                    ...acc,
                    [day]: {
                      type: Type.OBJECT,
                      properties: {
                        breakfast: { type: Type.STRING },
                        lunch: { type: Type.STRING },
                        snacks: { type: Type.STRING },
                        dinner: { type: Type.STRING },
                        healthyFats: { type: Type.STRING },
                      },
                      required: [
                        "breakfast",
                        "lunch",
                        "snacks",
                        "dinner",
                        "healthyFats",
                      ],
                    },
                  }),
                  {},
                ),
                required: DAYS,
              },
              hydration: { type: Type.STRING },
              hydrationSchedule: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              macros: {
                type: Type.OBJECT,
                properties: {
                  protein: { type: Type.STRING },
                  carbs: { type: Type.STRING },
                  fats: { type: Type.STRING },
                },
                required: ["protein", "carbs", "fats"],
              },
              tips: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: [
              "briefAnalysis",
              "weeklyPlan",
              "hydration",
              "hydrationSchedule",
              "macros",
              "tips",
            ],
          },
        },
      });

      if (!response.text) {
        throw new Error("No response text received");
      }

      const data = JSON.parse(response.text);
      const fullPlan = { ...data, totalCalories: tdee };

      setAiInsight(data.briefAnalysis);
      setDietPlan(fullPlan);

      // Save to Firestore
      if (auth.currentUser) {
        try {
          await setDoc(doc(db, "diet_plans", auth.currentUser.uid), {
            plan: fullPlan,
            insight: data.briefAnalysis,
            lastUpdated: new Date().toISOString(),
          });
        } catch (err) {
          console.error("Error saving diet plan to Firestore:", err);
        }
      }
    } catch (err: any) {
      console.error("Diet Plan AI Error:", err);
      if (err.message?.includes("429")) {
        setError({ message: "Daily quota reached. Please try again later." });
      } else {
        setError({ message: "Connection error. Please refresh." });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!dietPlan || !aiInsight) {
      fetchDietPlan();
    }
  }, [profile, dietPlan, aiInsight]);

  if (!profile)
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 pb-20 px-4">
        <div className="text-center bg-white p-12 rounded-[3rem] shadow-xl border border-gray-100 max-w-md">
          <Info className="h-12 w-12 text-blue-500 mx-auto mb-6" />
          <p className="text-2xl font-black text-gray-900 mb-2">
            Setup Profile First
          </p>
          <button
            onClick={() => (window.location.hash = "#/select-age")}
            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold"
          >
            Begin Setup
          </button>
        </div>
      </div>
    );

  const currentDayPlan = dietPlan?.weeklyPlan[selectedDay];

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 max-w-7xl mx-auto bg-gray-50">
      <div className="mb-5 flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
        <div>
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-1 block">
            Smart Diet
          </span>
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">
            Your Diet Plan
          </h2>
        </div>
        <div className="flex gap-2">
          <div className="bg-white px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2">
            <Target className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[10px] font-black text-gray-700 uppercase">
              {profile.goal}
            </span>
          </div>
          <div className="bg-white px-3 py-1.5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[10px] font-black text-gray-700 uppercase tracking-wider">
              BMI: {bmi}
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 animate-pulse">
          <div className="w-16 h-16 border-[4px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">
            Making Plan...
          </p>
        </div>
      ) : error ? (
        <div className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-xl text-center max-w-xl mx-auto">
          <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto mb-6" />
          <h3 className="text-xl font-black text-gray-900 mb-2">Sync Error</h3>
          <p className="text-gray-500 font-bold mb-8 text-base">
            {error.message}
          </p>
          <button
            onClick={() => fetchDietPlan()}
            className="bg-gray-900 text-white px-10 py-4 rounded-[2rem] font-black uppercase tracking-widest text-[11px] flex items-center mx-auto hover:bg-indigo-600 transition-all shadow-lg"
          >
            <RotateCcw className="w-4 h-4 mr-2" /> Retry
          </button>
        </div>
      ) : (
        dietPlan && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            <div className="lg:col-span-3 space-y-3">
              <div className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-2" /> Schedule
                </h4>
                <div className="grid grid-cols-1 gap-1">
                  {DAYS.map((day) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`w-full p-2.5 rounded-xl font-black text-left transition-all flex items-center justify-between group ${
                        selectedDay === day
                          ? "bg-indigo-600 text-white shadow-lg scale-[1.02]"
                          : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                      }`}
                    >
                      <span className="text-[10px] uppercase tracking-wider">
                        {day}
                      </span>
                      <ChevronRight
                        className={`w-3 h-3 transition-transform ${selectedDay === day ? "translate-x-1" : "opacity-0"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-900 p-5 px-6 pb-10 rounded-[2.2rem] text-white shadow-xl relative overflow-hidden flex flex-col min-h-[260px]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-5 flex items-center">
                  <PieChart className="w-3.5 h-3.5 mr-2" /> Nutrition Stats
                </h4>
                <div className="space-y-4">
                  {[
                    {
                      label: "Protein",
                      value: dietPlan.macros.protein,
                      color: "bg-indigo-500",
                    },
                    {
                      label: "Carbs",
                      value: dietPlan.macros.carbs,
                      color: "bg-blue-500",
                    },
                    {
                      label: "Healthy Fats",
                      value: dietPlan.macros.fats,
                      color: "bg-emerald-500",
                    },
                  ].map((macro) => (
                    <div key={macro.label} className="flex flex-col group">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest group-hover:text-gray-400 transition-colors">
                          {macro.label}
                        </span>
                      </div>
                      <p className="text-xl font-bold text-white leading-none tracking-tight flex items-baseline">
                        {macro.value.match(/\d+/)?.[0] || 0}g
                        <span className="text-[10px] text-gray-500 font-semibold ml-1.5">
                          / DAY
                        </span>
                      </p>
                      <div className="w-full h-1 bg-white/5 rounded-full mt-2.5 overflow-hidden">
                        <div
                          className={`h-full ${macro.color} w-3/4 transition-all duration-1000`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-9 flex flex-col gap-3">
              <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-blue-900 p-5 px-8 rounded-[2rem] text-white flex items-center gap-6 shadow-xl relative overflow-hidden group border border-white/5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl transition-transform group-hover:scale-110"></div>
                <div className="bg-white/10 backdrop-blur-xl p-3 rounded-2xl shrink-0 border border-white/10">
                  <BrainCircuit className="h-5 w-5 text-indigo-300" />
                </div>
                <div className="flex-1 relative z-10">
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-1 flex items-center">
                    <Sparkles className="w-3 h-3 mr-2" /> AI Tips
                  </p>
                  <p className="text-lg md:text-xl font-bold leading-tight italic tracking-tight">
                    "{aiInsight}"
                  </p>
                </div>
                <div className="hidden lg:block opacity-10 relative z-10">
                  <Quote className="h-8 w-8 text-white" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex-grow">
                <div className="flex justify-between items-start mb-4 pb-3 border-b border-gray-50 px-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-50 text-indigo-600 p-2 rounded-xl">
                      <LayoutGrid className="w-4 h-4" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tighter uppercase">
                      {selectedDay} Plan
                    </h3>
                  </div>
                  <div className="text-right pr-4">
                    <p className="text-2xl font-black text-indigo-600 tracking-tighter leading-none">
                      {dietPlan.totalCalories}
                    </p>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                      Target Calories
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 mb-4 items-stretch">
                  {[
                    {
                      label: "Breakfast",
                      icon: <Coffee />,
                      color: "text-orange-600",
                      bg: "bg-orange-50/40",
                      content: currentDayPlan?.breakfast,
                    },
                    {
                      label: "Lunch",
                      icon: <Sun />,
                      color: "text-amber-600",
                      bg: "bg-amber-50/40",
                      content: currentDayPlan?.lunch,
                    },
                    {
                      label: "Snacks",
                      icon: <Apple />,
                      color: "text-rose-600",
                      bg: "bg-rose-50/40",
                      content: currentDayPlan?.snacks,
                    },
                    {
                      label: "Dinner",
                      icon: <Moon />,
                      color: "text-blue-600",
                      bg: "bg-blue-50/40",
                      content: currentDayPlan?.dinner,
                    },
                  ].map((m) => (
                    <div
                      key={m.label}
                      className={`p-4 px-5 rounded-[1.5rem] border border-gray-100/50 transition-all duration-300 group ${m.bg} flex flex-col h-full`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div
                          className={`p-1.5 rounded-lg bg-white/80 ${m.color} shadow-sm group-hover:scale-105 transition-transform`}
                        >
                          {React.cloneElement(
                            m.icon as React.ReactElement<any>,
                            { size: 12 },
                          )}
                        </div>
                        <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">
                          {m.label}
                        </h4>
                      </div>
                      <p className="text-gray-700 text-[15px] font-bold leading-snug flex-grow">
                        {m.content}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-50 grid grid-cols-1 md:grid-cols-2 gap-3 px-1 items-stretch">
                  <div className="p-3.5 bg-blue-50/50 rounded-[1.25rem] border border-blue-100 flex items-center gap-4">
                    <div className="bg-blue-600 text-white p-2 rounded-xl shadow-md shrink-0">
                      <Droplets className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-[9px] font-black text-blue-900 uppercase tracking-widest mb-0.5">
                        Water Intake
                      </h4>
                      <p className="text-blue-800 font-bold text-[15px] leading-tight">
                        {dietPlan.hydration}
                      </p>
                    </div>
                  </div>
                  <div className="p-3.5 bg-indigo-900 rounded-[1.25rem] text-white flex items-center gap-4 shadow-lg">
                    <div className="bg-indigo-600 text-white p-2 rounded-xl shrink-0">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-0.5">
                        Quick Tip
                      </h4>
                      <p className="text-white font-bold text-[15px] leading-tight">
                        {dietPlan.tips[0]}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default DietPlanPage;
