import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ParticleHero } from './ParticleHero';
import { signInWithGoogle } from '../lib/auth';
import { useStore } from '../store/useStore';
import { LogIn, UserRound, Loader2, Sparkles, ChevronRight } from 'lucide-react';

export function AuthPage() {
  const { updateUser, setAuthUser } = useStore();
  const [guestStep, setGuestStep] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      // After redirect, App.tsx handles the session
    } catch (e: any) {
      setError(e.message || 'Failed to sign in with Google.');
      setIsLoading(false);
    }
  };

  const handleGuestContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    setAuthUser({ id: 'guest', email: undefined, name: guestName.trim(), avatar: undefined, isGuest: true });
    updateUser({ name: guestName.trim() });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background overflow-hidden">
      <ParticleHero particleCount={150} />

      {/* Gradient overlays */}
      <div className="absolute inset-0 z-[5] pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="relative z-20 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 mb-6"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles size={20} className="text-primary" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              SkillPath
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-4xl font-bold mb-3"
          >
            Level up your skills
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-textMuted text-lg"
          >
            Track progress. Build confidence. Grow every day.
          </motion.p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass rounded-3xl p-8 shadow-2xl border border-primary/10"
        >
          {!guestStep ? (
            <div className="space-y-4">
              {/* Google Sign In */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-white text-gray-800 font-semibold text-base hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-100 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin text-gray-600" />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                    <path d="M47.532 24.552c0-1.636-.134-3.225-.388-4.769H24.48v9.019h12.985c-.56 3.012-2.26 5.563-4.815 7.278v6.048h7.794c4.561-4.2 7.088-10.386 7.088-17.576z" fill="#4285F4"/>
                    <path d="M24.48 48c6.516 0 11.985-2.16 15.98-5.872l-7.794-6.048c-2.16 1.449-4.92 2.304-8.186 2.304-6.3 0-11.635-4.255-13.54-9.975H2.906v6.246C6.882 42.86 15.072 48 24.48 48z" fill="#34A853"/>
                    <path d="M10.94 28.409A14.485 14.485 0 0 1 9.6 24c0-1.536.267-3.028.74-4.409v-6.246H2.906A23.924 23.924 0 0 0 .48 24c0 3.888.935 7.566 2.426 10.655l8.034-6.246z" fill="#FBBC05"/>
                    <path d="M24.48 9.617c3.55 0 6.738 1.221 9.247 3.621l6.935-6.935C36.455 2.395 30.996 0 24.48 0 15.072 0 6.882 5.14 2.906 13.345l8.034 6.246c1.905-5.72 7.24-9.974 13.54-9.974z" fill="#EA4335"/>
                  </svg>
                )}
                {isLoading ? 'Redirecting...' : 'Continue with Google'}
              </button>

              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}

              {/* Divider */}
              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-textMuted text-sm">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Guest mode */}
              <button
                onClick={() => setGuestStep(true)}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl border border-border bg-surfaceHighlight/30 font-semibold text-base hover:bg-surfaceHighlight/60 hover:border-primary/40 transition-all hover:scale-[1.01] active:scale-100"
              >
                <UserRound size={20} className="text-textMuted" />
                <span>Continue as Guest</span>
                <ChevronRight size={18} className="text-textMuted ml-auto" />
              </button>

              <p className="text-xs text-textMuted text-center pt-2">
                Guest mode saves data on this device only.<br />
                Sign in with Google to sync across all devices.
              </p>
            </div>
          ) : (
            /* Guest name form */
            <form onSubmit={handleGuestContinue} className="space-y-5">
              <div className="flex items-center gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setGuestStep(false)}
                  className="p-2 rounded-xl hover:bg-surfaceHighlight transition-colors text-textMuted hover:text-text"
                >
                  ←
                </button>
                <div>
                  <h3 className="text-xl font-bold">Guest Mode</h3>
                  <p className="text-sm text-textMuted">What should we call you?</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-textMuted mb-2">Your name</label>
                <input
                  autoFocus
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary transition-colors text-base"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!guestName.trim()}
                className="w-full flex items-center justify-center gap-2 py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold transition-all shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <LogIn size={18} />
                Get Started
              </button>

              <p className="text-xs text-textMuted text-center">
                You can sign in with Google anytime from Settings to sync your data.
              </p>
            </form>
          )}
        </motion.div>

        <p className="text-center text-xs text-textMuted mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
