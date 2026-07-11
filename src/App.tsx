import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { Layout } from './components/Layout';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { Skills } from './pages/Skills';
import { Settings } from './pages/Settings';
import { Journal } from './pages/Journal';
import { Achievements } from './pages/Achievements';
import { Certificates } from './pages/Certificates';
import { Coach } from './pages/Coach';
import { Profile } from './pages/Profile';
import { Growth } from './pages/Growth';
import { useStore } from './store/useStore';
import { supabase } from './lib/supabase';
import type { AuthUser } from './lib/supabase';
import { Sparkles } from 'lucide-react';

function App() {
  const theme = useStore((s) => s.theme);
  const authUser = useStore((s) => s.authUser);
  const isAuthLoading = useStore((s) => s.isAuthLoading);
  const setAuthUser = useStore((s) => s.setAuthUser);
  const setAuthLoading = useStore((s) => s.setAuthLoading);
  const hasHydrated = useStore((s) => s.hasHydrated);
  const loadFromCloud = useStore((s) => s.loadFromCloud);

  // Keep a stable ref to loadFromCloud so the realtime channel doesn't recreate itself
  const loadFromCloudRef = useRef(loadFromCloud);
  useEffect(() => { loadFromCloudRef.current = loadFromCloud; }, [loadFromCloud]);

  // Apply theme class to <html>
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Supabase auth: handle session on mount and auth state changes
  useEffect(() => {
    // If guest already in localStorage, don't show loading spinner
    try {
      const stored = localStorage.getItem('skillpath-storage');
      if (stored) {
        const parsed = JSON.parse(stored) as { state?: { authUser?: { isGuest?: boolean } } };
        if (parsed?.state?.authUser?.isGuest) {
          setAuthLoading(false);
          return; // Guest user — skip Supabase session check entirely
        }
      }
    } catch {
      // ignore parse errors
    }

    setAuthLoading(true);

    let subscription: { unsubscribe: () => void } | null = null;

    try {
      // Check for an existing session (e.g. returning user with valid token)
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
          console.error('[SkillPath] getSession error:', error.message);
          setAuthLoading(false);
          return;
        }

        if (session?.user) {
          const user = session.user;
          const authUserData: AuthUser = {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            avatar: user.user_metadata?.avatar_url,
            isGuest: false,
          };
          setAuthUser(authUserData);
        }

        setAuthLoading(false);
      }).catch((err: Error) => {
        console.error('[SkillPath] getSession network error:', err.message);
        setAuthLoading(false);
      });
    } catch (err: any) {
      console.error('[SkillPath] getSession synchronous error:', err.message || err);
      setAuthLoading(false);
    }

    try {
      // Listen for sign-in / sign-out / token refresh events
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          const user = session.user;
          const authUserData: AuthUser = {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            avatar: user.user_metadata?.avatar_url,
            isGuest: false,
          };
          setAuthUser(authUserData);
        } else if (event === 'SIGNED_OUT') {
          setAuthUser(null);
        }

        setAuthLoading(false);
      });
      subscription = data?.subscription;
    } catch (err: any) {
      console.error('[SkillPath] onAuthStateChange synchronous error:', err.message || err);
      setAuthLoading(false);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cloud sync only after localStorage rehydration + authenticated session
  useEffect(() => {
    if (!hasHydrated || isAuthLoading || !authUser || authUser.isGuest) return;
    console.log('[SkillPath] Auth + hydration ready — loading cloud backup.');
    loadFromCloudRef.current();
  }, [hasHydrated, isAuthLoading, authUser?.id, authUser?.isGuest]);

  // Real-time cross-device sync: re-subscribe only when the logged-in user changes
  useEffect(() => {
    if (!authUser?.id || authUser.isGuest) return;

    const userId = authUser.id;
    const channel = supabase
      .channel(`user_sync_${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_sync', filter: `user_id=eq.${userId}` },
        () => {
          if (useStore.getState().shouldIgnoreRealtimePull()) {
            console.log('[SkillPath] [Realtime] Ignoring self-echo from local push.');
            return;
          }
          console.log('[SkillPath] [Realtime] Remote user_sync change — pulling cloud backup.');
          loadFromCloudRef.current();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authUser?.id]);

  if (isAuthLoading || !hasHydrated) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto">
            <Sparkles size={32} className="text-primary animate-pulse" />
          </div>
          <p className="text-textMuted text-sm">Loading SkillPath...</p>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return <AuthPage />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/certificates" element={<Certificates />} />
          <Route path="/coach" element={<Coach />} />
          <Route path="/growth" element={<Growth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
