import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
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
  const { theme, authUser, setAuthUser, updateUser, setAuthLoading, isAuthLoading, restoreBackup } = useStore();

  // Apply theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Listen to Supabase auth — only needed for Google users
  useEffect(() => {
    // If we already have a guest user from localStorage, skip loading
    const stored = localStorage.getItem('skillpath-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.state?.authUser?.isGuest) {
        setAuthLoading(false);
        return;
      }
    }

    setAuthLoading(true);

    supabase.auth.getSession().then(({ data: { session } }) => {
      try {
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
          updateUser({ name: authUserData.name });

          const backupStr = user.user_metadata?.skillpath_backup;
          if (backupStr) {
            restoreBackup(backupStr);
          }
        }
      } catch (e) {
        console.error('Session getSession restoration failed:', e);
      } finally {
        setAuthLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      try {
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
          updateUser({ name: authUserData.name });

          const backupStr = user.user_metadata?.skillpath_backup;
          if (backupStr) {
            restoreBackup(backupStr);
          }
        }
      } catch (e) {
        console.error('Session onAuthStateChange restoration failed:', e);
      } finally {
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthLoading) {
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
