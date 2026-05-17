import { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Bell, Shield, Paintbrush, LogOut, User, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';
import { signInWithGoogle, signOut } from '../lib/auth';

type SettingsTab = 'Appearance' | 'Account' | 'Notifications' | 'Privacy & Security';

export function Settings() {
  const { theme, setTheme, authUser, setAuthUser } = useStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('Appearance');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState('');

  const tabs: { icon: any; label: SettingsTab }[] = [
    { icon: Paintbrush, label: 'Appearance' },
    { icon: User, label: 'Account' },
    { icon: Bell, label: 'Notifications' },
    { icon: Shield, label: 'Privacy & Security' },
  ];

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch (e: any) {
      setError(e.message || 'Failed to sign in.');
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      if (authUser?.isGuest) {
        setAuthUser(null);
      } else {
        await signOut();
        setAuthUser(null);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to sign out.');
    }
    setIsSigningOut(false);
  };

  return (
    <div className="space-y-8 pb-10 max-w-4xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-textMuted">Manage your preferences and app settings.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="space-y-2">
          {tabs.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.label)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-left",
                activeTab === item.label
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-textMuted hover:bg-surfaceHighlight hover:text-text"
              )}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="md:col-span-3 space-y-6">
          {/* Appearance Tab */}
          {activeTab === 'Appearance' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Paintbrush className="text-primary" size={24} />
                Appearance
              </h3>
              <div>
                <h4 className="font-medium mb-2">Theme</h4>
                <p className="text-sm text-textMuted mb-4">Select your preferred color theme for the dashboard.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { value: 'light', label: 'Light', icon: Sun },
                    { value: 'dark', label: 'Dark', icon: Moon },
                  ].map((t) => {
                    const isActive = theme === t.value;
                    return (
                      <button
                        key={t.value}
                        onClick={() => setTheme(t.value as 'light' | 'dark')}
                        className={cn(
                          "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all",
                          isActive
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:border-primary/50 text-textMuted hover:text-text bg-surfaceHighlight/30"
                        )}
                      >
                        <t.icon size={28} />
                        <span className="font-medium">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Account Tab */}
          {activeTab === 'Account' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6 space-y-6"
            >
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <User className="text-primary" size={24} />
                Account
              </h3>

              {/* Current user info */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-surfaceHighlight/40 border border-border">
                {authUser?.avatar ? (
                  <img src={authUser.avatar} alt={authUser.name} className="w-12 h-12 rounded-full" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <User size={24} className="text-primary" />
                  </div>
                )}
                <div>
                  <p className="font-semibold">{authUser?.name || 'Guest'}</p>
                  <p className="text-sm text-textMuted">
                    {authUser?.isGuest ? (
                      <span className="inline-flex items-center gap-1.5 text-amber-400">
                        <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                        Guest Mode — data saved locally only
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-green-400">
                        <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                        {authUser?.email} — synced across devices
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Guest: Sign In CTA */}
              {authUser?.isGuest && (
                <div className="p-5 rounded-xl border border-primary/20 bg-primary/5 space-y-4">
                  <div>
                    <h4 className="font-semibold text-base mb-1">Sync across all your devices</h4>
                    <p className="text-sm text-textMuted">
                      Sign in with Google to back up your skills and progress to the cloud. Your data stays with you on every device.
                    </p>
                  </div>
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={isSigningIn}
                    className="flex items-center gap-3 py-3 px-5 rounded-xl bg-white text-gray-800 font-semibold hover:bg-gray-50 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSigningIn ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                        <path d="M47.532 24.552c0-1.636-.134-3.225-.388-4.769H24.48v9.019h12.985c-.56 3.012-2.26 5.563-4.815 7.278v6.048h7.794c4.561-4.2 7.088-10.386 7.088-17.576z" fill="#4285F4"/>
                        <path d="M24.48 48c6.516 0 11.985-2.16 15.98-5.872l-7.794-6.048c-2.16 1.449-4.92 2.304-8.186 2.304-6.3 0-11.635-4.255-13.54-9.975H2.906v6.246C6.882 42.86 15.072 48 24.48 48z" fill="#34A853"/>
                        <path d="M10.94 28.409A14.485 14.485 0 0 1 9.6 24c0-1.536.267-3.028.74-4.409v-6.246H2.906A23.924 23.924 0 0 0 .48 24c0 3.888.935 7.566 2.426 10.655l8.034-6.246z" fill="#FBBC05"/>
                        <path d="M24.48 9.617c3.55 0 6.738 1.221 9.247 3.621l6.935-6.935C36.455 2.395 30.996 0 24.48 0 15.072 0 6.882 5.14 2.906 13.345l8.034 6.246c1.905-5.72 7.24-9.974 13.54-9.974z" fill="#EA4335"/>
                      </svg>
                    )}
                    {isSigningIn ? 'Redirecting...' : 'Sign in with Google'}
                  </button>
                  {error && <p className="text-red-400 text-sm">{error}</p>}
                </div>
              )}

              {/* Sign Out */}
              <div className="pt-4 border-t border-border/60 space-y-4">
                {authUser?.isGuest ? (
                  <>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-amber-500 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
                        ⚠️ Crucial Warning: Local Data & Progress Loss
                      </h4>
                      <p className="text-xs text-amber-500/90 leading-relaxed bg-amber-500/5 border border-amber-500/25 rounded-2xl p-4 font-medium">
                        You are currently exploring in **Guest Mode**. Exiting this guest session will take you back to the login page. **Unless you sign in with Google to sync your account first, your local progress, custom profile photo, journal entries, and study roadmap logs are cached solely on this browser and may be permanently erased** if you clear your browser cookies, cache, or switch devices.
                      </p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="flex items-center gap-2 py-2.5 px-4 rounded-xl border border-red-500/25 hover:border-red-500/50 text-red-500 hover:bg-red-500/5 transition-all text-xs font-bold disabled:opacity-50"
                    >
                      {isSigningOut ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
                      Exit Guest Session (Acknowledge Data Risk)
                    </button>
                  </>
                ) : (
                  <>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-sm">Session Management</h4>
                      <p className="text-xs text-textMuted leading-relaxed">
                        Signing out will safely terminate your active session on this device. Your achievements, custom goals, and progress reports are fully synced to the cloud and will restore instantly on your next log-in.
                      </p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="flex items-center gap-2 py-2 px-4 rounded-xl border border-border hover:border-text text-textMuted hover:text-text hover:bg-surfaceHighlight/50 transition-all text-xs font-semibold disabled:opacity-50"
                    >
                      {isSigningOut ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
                      Sign Out Securely
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'Notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Bell className="text-primary" size={24} />
                Notifications
              </h3>
              <p className="text-textMuted">Notification settings coming soon.</p>
            </motion.div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'Privacy & Security' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Shield className="text-primary" size={24} />
                Privacy & Security
              </h3>
              <p className="text-textMuted">Privacy settings coming soon.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
