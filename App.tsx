
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { UserProfile, WorkoutRecord, DietPlan } from './types';
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import Navbar from './src/components/Navbar';
import Footer from './src/components/Footer';
import Home from './src/pages/Home';
import ProfileSetup from './src/pages/ProfileSetup';
import Recommendations from './src/pages/Recommendations';
import WorkoutPage from './src/pages/WorkoutPage';
import DietPlanPage from './src/pages/DietPlanPage';
import ProgressPage from './src/pages/ProgressPage';
import ProfileSettings from './src/pages/ProfileSettings';
import AuthPage from './src/pages/AuthPage';

// Component to show progress bar on top of page during navigation
const NavigationProgressBar: React.FC = () => {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Reset and show
    setIsVisible(true);
    setProgress(0);

    // Animate progress
    const t1 = setTimeout(() => setProgress(30), 50);
    const t2 = setTimeout(() => setProgress(70), 200);
    const t3 = setTimeout(() => setProgress(100), 500);
    
    // Hide after completion
    const t4 = setTimeout(() => {
      setIsVisible(false);
      setProgress(0);
    }, 800);

    // Scroll to top on route change
    window.scrollTo(0, 0);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [location]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-1.5 bg-gray-100 z-[100]">
      <div 
        className="h-full bg-blue-600 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(37,99,235,0.5)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [aiInsight, setAiInsight] = useState<string>("");
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutRecord[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // Fetch Profile
          const profileRef = doc(db, 'users', currentUser.uid);
          const profileSnap = await getDoc(profileRef);
          if (profileSnap.exists()) {
            const data = profileSnap.data() as UserProfile;
            setProfile(data);
          }

          // Fetch Diet Plan
          const dietRef = doc(db, 'diet_plans', currentUser.uid);
          const dietSnap = await getDoc(dietRef);
          if (dietSnap.exists()) {
            const data = dietSnap.data() as { plan: DietPlan; insight: string };
            setDietPlan(data.plan);
            setAiInsight(data.insight);
          }

          // Fetch Workout History
          const historyRef = doc(db, 'workout_history', currentUser.uid);
          const historySnap = await getDoc(historyRef);
          if (historySnap.exists()) {
            const data = historySnap.data() as { records: WorkoutRecord[] };
            setWorkoutHistory(data.records);
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
        }
      } else {
        setProfile(null);
        setDietPlan(null);
        setAiInsight("");
        setWorkoutHistory([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // No-op, we rely on Firestore now
  }, [profile]);

  useEffect(() => {
    // No-op, we rely on Firestore now
  }, [dietPlan]);

  useEffect(() => {
    // No-op, we rely on Firestore now
  }, [aiInsight]);

  useEffect(() => {
    // No-op, we rely on Firestore now
  }, [workoutHistory]);

  const handleCompleteWorkout = async (record: WorkoutRecord) => {
    const updatedHistory = [record, ...workoutHistory];
    setWorkoutHistory(updatedHistory);
    
    if (user) {
      try {
        await setDoc(doc(db, 'workout_history', user.uid), {
          records: updatedHistory,
          lastUpdated: new Date().toISOString()
        });
      } catch (err) {
        console.error('Error saving workout history:', err);
      }
    }
  };

  const hasProfile = profile !== null && profile.age > 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <NavigationProgressBar />
        <Navbar user={user} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/select-age" />} />
            <Route 
              path="/select-age" 
              element={user ? <ProfileSetup onComplete={(p) => { setProfile(p); setDietPlan(null); setAiInsight(""); }} /> : <Navigate to="/auth" />} 
            />
            
            <Route 
              path="/recommendations" 
              element={user ? (hasProfile ? <Recommendations selectedAgeGroup={profile?.ageGroup || null} /> : <Navigate to="/select-age" />) : <Navigate to="/auth" />} 
            />
            <Route 
              path="/workout" 
              element={user ? (hasProfile ? (
                <WorkoutPage 
                  selectedAgeGroup={profile?.ageGroup || null} 
                  onWorkoutComplete={handleCompleteWorkout} 
                />
              ) : <Navigate to="/select-age" />) : <Navigate to="/auth" />} 
            />
            <Route 
              path="/diet" 
              element={user ? <DietPlanPage profile={profile} dietPlan={dietPlan} setDietPlan={setDietPlan} aiInsight={aiInsight} setAiInsight={setAiInsight} /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/progress" 
              element={user ? (hasProfile ? <ProgressPage history={workoutHistory} /> : <Navigate to="/select-age" />) : <Navigate to="/auth" />} 
            />
            <Route 
              path="/settings" 
              element={user ? <ProfileSettings profile={profile} /> : <Navigate to="/auth" />} 
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
