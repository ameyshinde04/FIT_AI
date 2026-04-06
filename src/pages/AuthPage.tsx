import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  AlertCircle, 
  ChevronRight, 
  ArrowLeft 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const validate = () => {
    if (!isLogin && !formData.name.trim()) return "Name is required.";
    if (!formData.email.trim()) return "Email is required.";
    if (!/\S+@\S+\.\S+/.test(formData.email)) return "Invalid email format.";
    if (formData.password.length < 8) return "Password must be at least 8 characters.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await updateProfile(userCredential.user, { displayName: formData.name });
      }
      navigate('/select-age');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError("Invalid email or password.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("Email already in use.");
      } else {
        setError(err.message || "An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full p-3.5 pl-11 rounded-xl border-2 border-gray-100 bg-gray-50 text-gray-900 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50/50 outline-none transition-all font-bold text-base placeholder:text-gray-300";

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 flex flex-col items-center bg-gray-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100"
      >
        <div className="p-8">
          <button 
            onClick={() => navigate('/')}
            className="mb-6 flex items-center text-gray-400 hover:text-gray-600 transition-colors font-bold text-xs uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </button>

          <div className="text-center mb-8">
            <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">
              {isLogin ? 'Welcome Back' : 'Join Fitness AI'}
            </h2>
            <p className="text-gray-500 font-medium">
              {isLogin ? 'Log in to continue your journey' : 'Create an account to get started'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.form 
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              onSubmit={handleSubmit} 
              className="space-y-5"
            >
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center text-red-600 font-bold text-xs">
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  {error}
                </div>
              )}

              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center">
                    <User className="w-3 h-3 mr-1.5" /> Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={inputClasses}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center">
                  <Mail className="w-3 h-3 mr-1.5" /> Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="email" 
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={inputClasses}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center">
                  <Lock className="w-3 h-3 mr-1.5" /> Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={inputClasses}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider pl-1">
                  At least 8 characters required
                </p>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg active:scale-95 shadow-blue-200 disabled:opacity-50 disabled:scale-100"
              >
                {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Create Account')}
                {!loading && <ChevronRight className="ml-2 h-3 w-3" />}
              </button>

              <div className="mt-4 text-center">
                <p className="text-gray-500 font-bold text-sm">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <button 
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError(null);
                    }}
                    className="ml-2 text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    {isLogin ? 'Sign Up' : 'Log In'}
                  </button>
                </p>
              </div>
            </motion.form>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
