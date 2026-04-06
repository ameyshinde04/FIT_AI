import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Award,
  CheckCircle2,
  History,
  Clock,
  Dumbbell,
  Zap,
  Activity,
  Quote,
  Sparkles,
  ShieldCheck,
  Target,
  TrendingUp,
  Timer,
} from "lucide-react";
import { WorkoutRecord } from "../../types";

interface Props {
  history: WorkoutRecord[];
}

const MOTIVATION_QUOTES = [
  "Small daily wins lead to big victories.",
  "Your only limit is you.",
  "Struggles develop your strength.",
  "The only bad workout is the one that didn't happen.",
  "Don't wait for motivation. Be disciplined.",
  "Action is the key to success.",
  "The body achieves what the mind believes.",
  "Believe you can and you're halfway there.",
  "Fitness is a journey, not a destination.",
  "Every drop of sweat helps.",
];

const ProgressPage: React.FC<Props> = ({ history = [] }) => {
  const [isChartReady, setIsChartReady] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Robustly check for dimensions to prevent Recharts "width(-1)" error
    const checkDimensions = () => {
      if (
        chartContainerRef.current &&
        chartContainerRef.current.offsetWidth > 0 &&
        chartContainerRef.current.offsetHeight > 0
      ) {
        setIsChartReady(true);
      } else {
        requestAnimationFrame(checkDimensions);
      }
    };

    // Small initial delay to allow Grid/Flex layout to settle
    const t = setTimeout(() => {
      if (
        chartContainerRef.current &&
        chartContainerRef.current.offsetWidth > 0 &&
        chartContainerRef.current.offsetHeight > 0
      ) {
        setIsChartReady(true);
      } else {
        checkDimensions();
      }
    }, 200);
    return () => clearTimeout(t);
  }, []);

  const weeklyActivityData = useMemo(() => {
    const data = [
      { day: "Mon", mins: 0 },
      { day: "Tue", mins: 0 },
      { day: "Wed", mins: 0 },
      { day: "Thu", mins: 0 },
      { day: "Fri", mins: 0 },
      { day: "Sat", mins: 0 },
      { day: "Sun", mins: 0 },
    ];

    const now = new Date();
    const currentDay = now.getDay();
    const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    const startOfWeek = new Date(now.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);

    history.forEach((session) => {
      const sessionDate = new Date(session.date);
      if (sessionDate >= startOfWeek) {
        const dayIdx = sessionDate.getDay();
        const remappedIdx = dayIdx === 0 ? 6 : dayIdx - 1;
        if (data[remappedIdx])
          data[remappedIdx].mins += session.durationMinutes;
      }
    });

    return data;
  }, [history]);

  const dailyQuote = useMemo(() => {
    const day = new Date().getDate();
    return MOTIVATION_QUOTES[day % MOTIVATION_QUOTES.length];
  }, []);

  const totalWeeklyMins = weeklyActivityData.reduce(
    (acc, curr) => acc + curr.mins,
    0,
  );
  const maxMins = Math.max(...weeklyActivityData.map((d) => d.mins), 5);

  return (
    <div className="min-h-screen pt-24 pb-32 px-4 max-w-7xl mx-auto bg-gray-50">
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-1 uppercase">
            My Progress
          </h2>
          <p className="text-gray-500 font-bold">See how you are improving.</p>
        </div>
        <div className="bg-white px-8 py-5 rounded-[2.5rem] border border-gray-100 flex items-center gap-8 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                Weekly Time
              </p>
              <p className="text-2xl font-black text-gray-900 leading-none">
                {totalWeeklyMins}{" "}
                <span className="text-xs font-bold text-gray-300">MIN</span>
              </p>
            </div>
          </div>
          <div className="h-10 w-px bg-gray-100"></div>
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                Total Reps
              </p>
              <p className="text-2xl font-black text-gray-900 leading-none">
                {history.reduce((a, b) => a + b.totalReps, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Motivation Box */}
      <div className="mb-8 bg-gradient-to-r from-indigo-950 via-indigo-900 to-blue-900 p-5 px-10 rounded-[2.2rem] text-white flex items-center gap-7 shadow-xl relative overflow-hidden group border border-white/5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl transition-transform group-hover:scale-110"></div>
        <div className="bg-white/10 backdrop-blur-xl p-3.5 rounded-2xl shrink-0 border border-white/10">
          <Quote className="h-5 w-5 text-indigo-300" />
        </div>
        <div className="flex-1 relative z-10">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-1.5">
            Daily Motivation
          </p>
          <p className="text-xl md:text-2xl font-bold leading-tight italic tracking-tight">
            "{dailyQuote}"
          </p>
        </div>
        <div className="hidden lg:block opacity-10 relative z-10">
          <Sparkles className="h-12 w-12 text-white" />
        </div>
      </div>

      {/* Grid Layout - Leveled Row 1 */}
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Activity Cycle */}
          <div className="lg:col-span-8 bg-white p-8 rounded-[3rem] border border-gray-100 flex flex-col min-h-[440px]">
            <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3 tracking-tight">
              <TrendingUp className="text-[#4f46e5] w-6 h-6" /> Weekly Activity
            </h3>
            {/* Chart Container - explicit block and ref for size checking */}
            <div
              ref={chartContainerRef}
              className="w-full h-[350px] block relative"
            >
              {isChartReady ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  minWidth={0}
                  minHeight={0}
                  debounce={1}
                >
                  <BarChart data={weeklyActivityData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f8fafc"
                    />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#cbd5e1", fontSize: 13, fontWeight: 700 }}
                      dy={15}
                    />
                    <YAxis hide domain={[0, maxMins + 5]} />
                    <Tooltip
                      cursor={{ fill: "#f1f5f9", radius: 15 }}
                      contentStyle={{
                        borderRadius: "25px",
                        border: "none",
                        boxShadow: "0 15px 35px -5px rgb(0 0 0 / 0.1)",
                        padding: "20px",
                      }}
                      itemStyle={{ fontWeight: "900", color: "#4f46e5" }}
                      labelStyle={{
                        fontWeight: "700",
                        color: "#94a3b8",
                        fontSize: "11px",
                        textTransform: "uppercase",
                        marginBottom: "4px",
                      }}
                    />
                    <Bar dataKey="mins" radius={[12, 12, 12, 12]} barSize={45}>
                      {weeklyActivityData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.mins > 0 ? "#4f46e5" : "#f1f5f9"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-300 font-bold animate-pulse">
                  <Activity className="w-6 h-6 animate-bounce mr-2" /> Loading
                  Chart...
                </div>
              )}
            </div>
          </div>

          {/* Lifetime Metrics Card - Levels with Activity Cycle */}
          <div className="lg:col-span-4 bg-gray-900 p-8 rounded-[3rem] text-white flex flex-col min-h-[440px] relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
            <h3 className="text-xl font-black mb-8 flex items-center gap-3 tracking-tight">
              <Award className="text-yellow-400 w-6 h-6" /> All-Time Stats
            </h3>
            <div className="space-y-8 flex-grow">
              <div className="border-l-4 border-indigo-500 pl-6">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2">
                  Total Workout Time
                </p>
                <p className="text-5xl font-black tracking-tighter text-white">
                  {history.reduce((acc, curr) => acc + curr.durationMinutes, 0)}
                  <span className="text-sm font-bold text-gray-600 ml-2 uppercase tracking-widest">
                    min
                  </span>
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 pb-2">
                <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 flex justify-between items-center group hover:bg-white/10 transition-all">
                  <div>
                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">
                      Total Reps
                    </p>
                    <p className="text-3xl font-black tracking-tight">
                      {history.reduce((a, b) => a + b.totalReps, 0)}
                    </p>
                  </div>
                  <Zap className="w-6 h-6 text-indigo-500 opacity-20 group-hover:opacity-100 transition-all" />
                </div>
                <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 flex justify-between items-center group hover:bg-white/10 transition-all">
                  <div>
                    <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">
                      Consistency
                    </p>
                    <p className="text-3xl font-black tracking-tight">
                      {weeklyActivityData.filter((d) => d.mins > 0).length}
                      <span className="text-base text-gray-600"> / 7</span>
                    </p>
                  </div>
                  <Activity className="w-6 h-6 text-blue-500 opacity-20 group-hover:opacity-100 transition-all" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Session History & Safety Protocol */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-8 bg-white p-10 rounded-[3.5rem] border border-gray-100 flex flex-col min-h-[520px]">
            <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3 tracking-tight shrink-0">
              <History className="text-[#4f46e5] w-7 h-7" /> Workout History
            </h3>
            <div className="flex-grow overflow-y-auto pr-3 custom-scrollbar max-h-[480px] pb-6">
              <div className="space-y-4">
                {history.length === 0 ? (
                  <div className="text-center py-24 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                    <History className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400 font-black uppercase tracking-widest text-xs">
                      No workouts yet
                    </p>
                  </div>
                ) : (
                  history.map((record) => (
                    <div
                      key={record.id}
                      className="group p-4 sm:p-6 rounded-[2rem] bg-white hover:bg-gray-50 transition-all duration-300 flex flex-row items-center justify-between gap-6 border border-gray-100 shadow-sm relative overflow-hidden hover:shadow-md"
                    >
                      {/* Left: Icon, Date, Stats and Mobile Layout */}

                      <div className="flex items-center gap-5 flex-1 min-w-0">
                        {/* Column 1: Logo and Mobile Exercise Badge */}
                        {/* Column 1: Logo + Mobile Timestamp + Exercise Badge */}
                        <div className="flex flex-col items-center gap-3 shrink-0"></div>

                        {/* Column 2: Date, Stats, and Mobile Layout */}
                        <div className="flex-grow flex flex-col">
                          <h4 className="text-lg font-black text-gray-900 tracking-tight leading-snug mb-2.5 truncate">
                            {new Date(record.date).toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "short",
                              day: "numeric",
                            })}
                          </h4>

                          <div className="w-fit">
                            {/* LINE 2 → MIN + REPS */}
                            <div className="flex items-center gap-2 flex-nowrap">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 text-[10px] font-black text-gray-600 uppercase tracking-wider whitespace-nowrap">
                                <Timer className="w-3 h-3 mr-1.5 text-blue-500" />
                                {record.durationMinutes} MIN
                              </span>

                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-green-50 text-[10px] font-black text-green-700 uppercase tracking-wider whitespace-nowrap">
                                <Target className="w-3 h-3 mr-1.5 text-green-600" />
                                {record.totalReps} REPS
                              </span>
                            </div>

                            {/* LINE 3 → MOBILE ONLY (EXERCISE + TIME) */}
                            <div className="sm:hidden flex items-center justify-between mt-4 gap-2">
                              {/* Exercise Name (can shrink) */}
                              <span className="inline-flex items-center px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-100 text-[10px] font-black uppercase tracking-wider text-indigo-600 shadow-sm break-words">
                                {record.exercises.join(", ")}
                              </span>

                              {/* Timestamp (hide if no space) */}
                              <span className="hidden xs:inline text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                                {new Date(record.date).toLocaleTimeString(
                                  "en-US",
                                  {
                                    hour: "numeric",
                                    minute: "2-digit",
                                  },
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Badge and Timestamp (Desktop Only) */}
                      <div className="hidden sm:flex flex-col items-end gap-2.5 ml-auto">
                        {record.exercises && record.exercises.length > 0 && (
                          <span className="inline-flex items-center px-4 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-[10px] font-black uppercase tracking-wider text-indigo-600 shadow-sm whitespace-nowrap">
                            {record.exercises.join(", ")}
                          </span>
                        )}

                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mr-1 whitespace-nowrap">
                          <Clock className="w-3 h-3" />
                          {new Date(record.date).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                  width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: rgba(241, 245, 249, 0.5);
                  border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: rgba(203, 213, 225, 0.8);
                  border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: #94a3b8;
                }
            `}</style>
          </div>

          <div className="lg:col-span-4 bg-white p-10 rounded-[3.5rem] border border-gray-100 flex flex-col min-h-[520px] shadow-sm overflow-hidden">
            <h3 className="text-2xl font-black text-rose-600 mb-10 flex items-center gap-3 tracking-tight">
              <ShieldCheck className="w-7 h-7" /> Safety Tips
            </h3>
            <div className="space-y-8 flex-grow">
              {[
                {
                  t: "Warm Up First",
                  s: "Do light moves for 2-5 mins before starting.",
                },
                {
                  t: "Stop if it Hurts",
                  s: "Don't exercise if you feel sharp pain.",
                },
                {
                  t: "Rest Between Sets",
                  s: "Rest for 45-60 seconds between exercises.",
                },
                { t: "Drink Water", s: "Sip water to stay hydrated." },
                {
                  t: "Check Your Form",
                  s: "Listen to the AI to avoid injury.",
                },
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-5 group">
                  <div className="h-10 w-10 rounded-2xl bg-green-50 flex items-center justify-center shrink-0 mt-0.5 transition-colors group-hover:bg-green-100 shadow-sm border border-green-100/50">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-gray-900 leading-tight mb-1">
                      {tip.t}
                    </p>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">
                      {tip.s}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 pt-8 border-t border-gray-50 text-center pb-2">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] italic leading-relaxed">
                Always consult a doctor before starting a new fitness plan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;
