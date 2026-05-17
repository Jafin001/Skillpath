import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Trash2, Timer, Code2, ChevronDown, X, Play, Clock,
  Palette, Briefcase, Globe, Megaphone, HeartPulse, Music, BookOpen, ChefHat, FlaskConical, User, Check
} from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Skill } from '../store/useStore';
import { cn } from '../lib/utils';

const levelColors = {
  Beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
  Intermediate: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Advanced: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Expert: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

const getCategoryIcon = (cat: string) => {
  const c = cat.toLowerCase();
  if (c.includes('frontend') || c.includes('tech') || c.includes('dev') || c.includes('code') || c.includes('programming')) return Code2;
  if (c.includes('design') || c.includes('art') || c.includes('creative') || c.includes('palette') || c.includes('painting')) return Palette;
  if (c.includes('business') || c.includes('finance') || c.includes('money') || c.includes('briefcase')) return Briefcase;
  if (c.includes('language') || c.includes('linguistics') || c.includes('globe') || c.includes('speak')) return Globe;
  if (c.includes('marketing') || c.includes('growth') || c.includes('sales') || c.includes('advocacy')) return Megaphone;
  if (c.includes('health') || c.includes('fitness') || c.includes('sport') || c.includes('exercise') || c.includes('gym')) return HeartPulse;
  if (c.includes('music') || c.includes('dance') || c.includes('perform') || c.includes('sing')) return Music;
  if (c.includes('write') || c.includes('humanities') || c.includes('book') || c.includes('journalism')) return BookOpen;
  if (c.includes('cook') || c.includes('culinary') || c.includes('chef') || c.includes('food')) return ChefHat;
  if (c.includes('science') || c.includes('academic') || c.includes('math') || c.includes('flask') || c.includes('biology')) return FlaskConical;
  if (c.includes('personal') || c.includes('soft') || c.includes('self') || c.includes('user') || c.includes('mindset')) return User;
  return Code2;
};

const DEFAULT_CATEGORIES = [
  'Tech & Development',
  'Design & Creative Arts',
  'Business & Finance',
  'Languages & Linguistics',
  'Marketing & Growth',
  'Health & Fitness',
  'Music & Performing Arts',
  'Writing & Humanities',
  'Culinary Arts & Cooking',
  'Science & Academics',
  'Personal Growth & Soft Skills'
];

const QUICK_DURATIONS = [15, 30, 45, 60, 90, 120];

export function Skills() {
  const { skills, sessions, addSkill, deleteSkill, addSession } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [sessionSkill, setSessionSkill] = useState<Skill | null>(null);

  // Dynamic custom categories local state
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customInputVal, setCustomInputVal] = useState('');

  const [newSkill, setNewSkill] = useState({ name: '', level: 'Beginner' as Skill['level'], progress: 0, category: DEFAULT_CATEGORIES[0] });
  const [sessionForm, setSessionForm] = useState({ duration: 30, notes: '', date: new Date().toISOString().slice(0, 16) });

  const availableCategories = Array.from(new Set([
    ...DEFAULT_CATEGORIES,
    ...skills.map(s => s.category),
    ...customCategories
  ]));

  const filtered = skills.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const skillStats = (id: string) => {
    const s = sessions.filter(s => s.skillId === id);
    const mins = s.reduce((a, b) => a + b.duration, 0);
    return { count: s.length, mins, last: s[0]?.date };
  };

  const fmt = (m: number) => m >= 60 ? `${Math.floor(m / 60)}h ${m % 60 > 0 ? m % 60 + 'm' : ''}` : `${m}m`;

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.name.trim()) return;
    addSkill(newSkill);
    setIsAddOpen(false);
    setNewSkill({ name: '', level: 'Beginner', progress: 0, category: DEFAULT_CATEGORIES[0] });
    setShowCustomInput(false);
    setCustomInputVal('');
  };

  const handleAddCustomCategory = () => {
    const trimmed = customInputVal.trim();
    if (!trimmed) return;
    if (!customCategories.includes(trimmed)) {
      setCustomCategories([...customCategories, trimmed]);
    }
    setNewSkill(prev => ({ ...prev, category: trimmed }));
    setShowCustomInput(false);
    setCustomInputVal('');
  };

  const handleLogSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionSkill) return;
    addSession({ skillId: sessionSkill.id, skillName: sessionSkill.name, duration: sessionForm.duration, notes: sessionForm.notes, date: new Date(sessionForm.date).toISOString() });
    setSessionSkill(null);
    setSessionForm({ duration: 30, notes: '', date: new Date().toISOString().slice(0, 16) });
  };

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">My Skills</h1>
          <p className="text-textMuted">Track skills and log learning sessions.</p>
        </div>
        <button onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-medium shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:scale-105 transition-all">
          <Plus size={18} /> Add Skill
        </button>
      </header>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
        <input type="text" placeholder="Search skills..." value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-surface border border-border rounded-xl py-2.5 pl-10 pr-4 text-text focus:outline-none focus:border-primary/50 transition-colors" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence>
          {filtered.map(skill => {
            const Icon = getCategoryIcon(skill.category);
            const stats = skillStats(skill.id);
            return (
              <motion.div key={skill.id} layout initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className="glass rounded-2xl p-5 group relative overflow-hidden hover:border-primary/30 transition-all duration-300 flex flex-col gap-4">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="relative z-10 flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-surfaceHighlight text-primary"><Icon size={20} /></div>
                    <div>
                      <h3 className="font-bold">{skill.name}</h3>
                      <span className="text-xs text-textMuted">{skill.category}</span>
                    </div>
                  </div>
                  <button onClick={() => deleteSkill(skill.id)} className="text-textMuted hover:text-red-400 p-1 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={15} />
                  </button>
                </div>
                <span className={cn('text-xs px-2.5 py-1 rounded-full border w-fit relative z-10', levelColors[skill.level])}>{skill.level}</span>
                <div className="grid grid-cols-2 gap-3 relative z-10">
                  <div className="bg-surface rounded-xl p-3 text-center border border-border">
                    <p className="text-2xl font-bold">{stats.count}</p>
                    <p className="text-xs text-textMuted mt-0.5">Sessions</p>
                  </div>
                  <div className="bg-surface rounded-xl p-3 text-center border border-border">
                    <p className="text-2xl font-bold">{stats.mins > 0 ? fmt(stats.mins) : '—'}</p>
                    <p className="text-xs text-textMuted mt-0.5">Total time</p>
                  </div>
                </div>
                {stats.last && (
                  <p className="text-xs text-textMuted flex items-center gap-1.5 relative z-10">
                    <Clock size={11} /> Last: {new Date(stats.last).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                )}
                <button onClick={() => setSessionSkill(skill)}
                  className="mt-auto relative z-10 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-primary/30 text-primary hover:bg-primary/10 transition-all text-sm font-medium hover:scale-[1.02]">
                  <Play size={14} /> Log Session
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold mb-2">No skills found</h3>
          <p className="text-textMuted">Try adjusting your search or add a new skill.</p>
        </div>
      )}

      {/* Add Skill Modal */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsAddOpen(false)} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="relative w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-2xl font-bold">Add New Skill</h2>
                <button onClick={() => setIsAddOpen(false)} className="text-textMuted hover:text-text"><X size={20} /></button>
              </div>
              <form onSubmit={handleAddSkill} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-textMuted mb-1.5">Skill Name</label>
                  <input required type="text" value={newSkill.name} onChange={e => setNewSkill({ ...newSkill, name: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-text focus:outline-none focus:border-primary/50" placeholder="e.g. Guitar, Public Speaking, Calculus…" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-textMuted mb-1.5">Category</label>
                  {!showCustomInput ? (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <select value={newSkill.category} onChange={e => {
                          if (e.target.value === 'ADD_CUSTOM') {
                            setShowCustomInput(true);
                          } else {
                            setNewSkill({ ...newSkill, category: e.target.value });
                          }
                        }}
                          className="w-full appearance-none bg-background border border-border rounded-xl py-2.5 px-4 text-text focus:outline-none focus:border-primary/50">
                          {availableCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                          <option value="ADD_CUSTOM">+ Add Custom Category...</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none" size={16} />
                      </div>
                      <button type="button" onClick={() => setShowCustomInput(true)}
                        className="px-3 rounded-xl bg-surfaceHighlight border border-border hover:border-primary/50 text-textMuted hover:text-text transition-colors flex items-center justify-center font-bold">
                        +
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2 animate-fadeIn">
                      <input required type="text" value={customInputVal} onChange={e => setCustomInputVal(e.target.value)}
                        className="flex-1 bg-background border border-border rounded-xl py-2.5 px-4 text-text focus:outline-none focus:border-primary/50" 
                        placeholder="Enter custom category name..." />
                      <button type="button" onClick={handleAddCustomCategory}
                        className="p-3 bg-primary/20 text-primary border border-primary/30 rounded-xl hover:bg-primary/35 transition-colors flex items-center justify-center">
                        <Check size={18} />
                      </button>
                      <button type="button" onClick={() => setShowCustomInput(false)}
                        className="p-3 bg-surfaceHighlight text-textMuted border border-border rounded-xl hover:bg-surfaceHighlight/80 transition-colors flex items-center justify-center">
                        <X size={18} />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-textMuted mb-1.5">Current Level</label>
                  <div className="relative">
                    <select value={newSkill.level} onChange={e => setNewSkill({ ...newSkill, level: e.target.value as Skill['level'] })}
                      className="w-full appearance-none bg-background border border-border rounded-xl py-2.5 px-4 text-text focus:outline-none focus:border-primary/50">
                      <option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Expert</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none" size={16} />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 rounded-xl text-textMuted hover:text-text hover:bg-surfaceHighlight transition-colors">Cancel</button>
                  <button type="submit" className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium transition-all">Add Skill</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Log Session Modal */}
      <AnimatePresence>
        {sessionSkill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSessionSkill(null)} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="relative w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/20 text-primary"><Timer size={20} /></div>
                  <div>
                    <h2 className="text-xl font-bold">Log Session</h2>
                    <p className="text-xs text-textMuted">{sessionSkill.name}</p>
                  </div>
                </div>
                <button onClick={() => setSessionSkill(null)} className="text-textMuted hover:text-text"><X size={20} /></button>
              </div>
              <form onSubmit={handleLogSession} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-textMuted mb-2">Duration</label>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {QUICK_DURATIONS.map(d => (
                      <button key={d} type="button" onClick={() => setSessionForm({ ...sessionForm, duration: d })}
                        className={cn('py-2 rounded-xl text-sm font-medium border transition-all',
                          sessionForm.duration === d ? 'bg-primary/15 border-primary text-primary' : 'border-border hover:border-primary/40 text-textMuted')}>
                        {d}m
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="number" min="1" max="480" value={sessionForm.duration}
                      onChange={e => setSessionForm({ ...sessionForm, duration: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="w-24 bg-background border border-border rounded-xl py-2 px-3 text-text focus:outline-none focus:border-primary/50 text-center" />
                    <span className="text-textMuted text-sm">custom minutes</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-textMuted mb-1.5">When</label>
                  <input type="datetime-local" value={sessionForm.date} onChange={e => setSessionForm({ ...sessionForm, date: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-text focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-textMuted mb-1.5">Notes <span className="text-xs opacity-60">(optional)</span></label>
                  <textarea value={sessionForm.notes} onChange={e => setSessionForm({ ...sessionForm, notes: e.target.value })}
                    placeholder="What did you work on?" rows={3}
                    className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-text focus:outline-none focus:border-primary/50 resize-none" />
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setSessionSkill(null)} className="px-4 py-2 rounded-xl text-textMuted hover:text-text hover:bg-surfaceHighlight transition-colors">Cancel</button>
                  <button type="submit" className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                    <Play size={15} /> Save Session
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
