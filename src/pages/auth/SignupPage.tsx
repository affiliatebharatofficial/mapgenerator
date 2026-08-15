import React, { useState } from 'react';
import { Compass, User, AtSign, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../lib/supabase/authStore';
import { GoogleAuthButton } from '../../components/auth/GoogleAuthButton';

interface SignupPageProps {
  onNavigateHome: () => void;
  onNavigateLogin: () => void;
  onSignupSuccess: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({
  onNavigateHome,
  onNavigateLogin,
  onSignupSuccess
}) => {
  const { signup, loginWithGoogle, isLoading } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const result = await signup(displayName, username, email, password);
    if (result.success) {
      onSignupSuccess();
    } else {
      setErrorMessage(result.error || 'Failed to create account.');
    }
  };

  const handleGoogleClick = async () => {
    await loginWithGoogle();
    onSignupSuccess();
  };

  return (
    <div className="min-h-screen bg-[#0b0d11] text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[400px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center space-y-4">
        <button onClick={onNavigateHome} className="inline-flex items-center gap-3 group focus:outline-none">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0b0d11] rounded-[10px] flex items-center justify-center">
              <Compass className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <span className="font-cinzel font-bold text-2xl tracking-wider text-slate-100">
            CreateFantasyMap
          </span>
        </button>

        <h2 className="font-cinzel font-bold text-2xl text-slate-100">
          Create Your <span className="gold-gradient-text">Free Account</span>
        </h2>
        <p className="text-xs text-slate-400">
          Save your world maps to the cloud, publish to the gallery, and remix community creations.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="glass-panel py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-amber-500/20 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-200 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <GoogleAuthButton
            onClick={handleGoogleClick}
            text="Sign Up with Google"
          />

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-slate-800" />
            <span className="bg-[#121620] px-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest absolute">
              OR REGISTER WITH EMAIL
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" /> Display Name
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="High Cartographer"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/40"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <AtSign className="w-3.5 h-3.5 text-amber-400" /> Username (@username)
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="cartographer_master"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/40 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-400" /> Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/40"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" /> Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/40"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 mt-2"
            >
              <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-2">
            Already have an account?{' '}
            <button onClick={onNavigateLogin} className="text-amber-400 font-semibold hover:underline">
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
