import React, { useState } from 'react';
import { Compass, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../lib/supabase/authStore';
import { GoogleAuthButton } from '../../components/auth/GoogleAuthButton';

interface LoginPageProps {
  onNavigateHome: () => void;
  onNavigateSignup: () => void;
  onNavigateForgotPassword: () => void;
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateHome,
  onNavigateSignup,
  onNavigateForgotPassword,
  onLoginSuccess
}) => {
  const { login, loginWithGoogle, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const result = await login(email, password);
    if (result.success) {
      onLoginSuccess();
    } else {
      setErrorMessage(result.error || 'Failed to sign in. Please check your credentials.');
    }
  };

  const handleGoogleClick = async () => {
    try {
      setErrorMessage('');
      await loginWithGoogle();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to initialize Google Sign In. Please try again.');
    }
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
          Sign In to Your <span className="gold-gradient-text">Account</span>
        </h2>
        <p className="text-xs text-slate-400">
          Save your worlds, publish maps, and explore community creations.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="glass-panel py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-amber-500/20 space-y-6">
          {errorMessage && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-200 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <GoogleAuthButton
            onClick={handleGoogleClick}
            text="Continue with Google"
          />

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-slate-800" />
            <span className="bg-[#121620] px-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest absolute">
              OR EMAIL
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" /> Password
                </label>
                <button
                  type="button"
                  onClick={onNavigateForgotPassword}
                  className="text-amber-400 hover:underline text-[11px]"
                >
                  Forgot password?
                </button>
              </div>
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
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-2">
            Don't have an account?{' '}
            <button onClick={onNavigateSignup} className="text-amber-400 font-semibold hover:underline">
              Create a Free Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
