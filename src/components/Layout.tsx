import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, UserCircle, BookOpen, TrendingUp, Settings, Trophy, User, PenLine, Award, Brain, Menu, X 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import type { ReactNode } from 'react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: BookOpen, label: 'Skills', path: '/skills' },
  { icon: PenLine, label: 'Journal', path: '/journal' },
  { icon: Trophy, label: 'Achievements', path: '/achievements' },
  { icon: Award, label: 'Certificates', path: '/certificates' },
  { icon: Brain, label: 'AI Coach', path: '/coach' },
  { icon: TrendingUp, label: 'Growth', path: '/growth' },
  { icon: UserCircle, label: 'Profile', path: '/profile' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { authUser, getStreak } = useStore();
  const streak = getStreak();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Auto-close mobile drawer on route transitions
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
            <TrendingUp size={20} className="text-primary" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">SkillPath</h1>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group",
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-textMuted hover:bg-surfaceHighlight hover:text-text"
              )}
            >
              <Icon size={19} className={cn("transition-transform group-hover:scale-110", isActive && "text-primary")} />
              <span className="font-medium text-sm">{item.label}</span>
              {item.path === '/achievements' && (
                <span className="ml-auto text-xs bg-yellow-400/20 text-yellow-400 px-1.5 py-0.5 rounded-full">🏆</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Streak badge */}
      {streak > 0 && (
        <div className="mx-3 mb-2 px-4 py-2.5 rounded-xl bg-orange-400/10 border border-orange-400/20 flex items-center gap-2">
          <span className="text-xl">🔥</span>
          <div>
            <p className="text-xs font-semibold text-orange-400">{streak}-day streak!</p>
            <p className="text-xs text-textMuted">Keep it going</p>
          </div>
        </div>
      )}

      {/* User info */}
      <div className="p-3 m-3 mt-0 rounded-xl glass text-sm border border-border/50">
        <div className="flex items-center gap-3">
          {authUser?.avatar ? (
            <img src={authUser.avatar} alt={authUser.name} className="w-8 h-8 rounded-full flex-shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <User size={15} className="text-primary" />
            </div>
          )}
          <div className="overflow-hidden">
            <p className="font-medium truncate text-sm">{authUser?.name || 'Guest'}</p>
            <p className="text-xs truncate">
              {authUser?.isGuest
                ? <span className="text-amber-400">⚠ Local only</span>
                : <span className="text-green-400">✓ Synced</span>
              }
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background text-text overflow-hidden">
      {/* Sticky Mobile Header */}
      <header className="flex md:hidden items-center justify-between px-4 py-3 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-40 w-full flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-1.5 rounded-lg bg-surfaceHighlight hover:bg-surfaceHighlight/80 text-textMuted hover:text-text transition-colors"
          >
            <Menu size={20} />
          </button>
          <span className="font-bold text-lg bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">SkillPath</span>
        </div>
        <Link to="/profile" className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
          {authUser?.avatar ? (
            <img src={authUser.avatar} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User size={14} className="text-primary" />
          )}
        </Link>
      </header>

      {/* Slide-out Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            />
            {/* Drawer Content */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-72 max-w-[85vw] bg-background border-r border-border flex flex-col h-full shadow-2xl z-10"
            >
              {/* Close Button Inside Drawer */}
              <button
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-surfaceHighlight hover:bg-surfaceHighlight/80 text-textMuted hover:text-text transition-colors"
              >
                <X size={18} />
              </button>

              <SidebarContent />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Permanent Left Sidebar */}
      <aside className="hidden md:flex w-64 flex-shrink-0 border-r border-border bg-surfaceHighlight/20 backdrop-blur-xl flex-col">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background relative overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.99 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="max-w-6xl mx-auto p-4 sm:p-8 w-full min-h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
