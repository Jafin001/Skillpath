import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, X, ChevronDown } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';

const MOODS = [
  { emoji: '😴', label: 'Exhausted' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '😊', label: 'Good' },
  { emoji: '💪', label: 'Motivated' },
  { emoji: '🔥', label: 'On Fire' },
] as const;

export function Journal() {
  const { journal, skills, addJournalEntry } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    skillId: skills[0]?.id || '',
    skillName: skills[0]?.name || '',
    mood: '😊' as typeof MOODS[number]['emoji'],
    reflection: '',
  });

  const filtered = journal.filter(e =>
    e.skillName.toLowerCase().includes(search.toLowerCase()) ||
    e.reflection.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.reflection.trim()) return;
    addJournalEntry(form);
    setForm({ skillId: skills[0]?.id || '', skillName: skills[0]?.name || '', mood: '😊', reflection: '' });
    setIsOpen(false);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-8 pb-10">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <BookOpen className="text-primary" size={32} />
            Skill Journal
          </h1>
          <p className="text-textMuted">Reflect on your learning sessions and track your mindset.</p>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:scale-105"
        >
          <Plus size={18} />
          New Entry
        </button>
      </header>

      {/* Add Entry Form */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-5 border border-primary/20">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">New Journal Entry</h3>
                <button type="button" onClick={() => setIsOpen(false)} className="text-textMuted hover:text-text">
                  <X size={20} />
                </button>
              </div>

              {/* Skill selector */}
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1.5">Skill Practiced</label>
                <div className="relative">
                  <select
                    value={form.skillId}
                    onChange={e => {
                      const skill = skills.find(s => s.id === e.target.value);
                      setForm({ ...form, skillId: e.target.value, skillName: skill?.name || '' });
                    }}
                    className="w-full appearance-none bg-surface border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary transition-colors"
                  >
                    {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    {skills.length === 0 && <option value="">No skills yet — add some first!</option>}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none" size={18} />
                </div>
              </div>

              {/* Mood */}
              <div>
                <label className="block text-sm font-medium text-textMuted mb-2">How did you feel?</label>
                <div className="flex gap-2 flex-wrap">
                  {MOODS.map(m => (
                    <button
                      key={m.emoji}
                      type="button"
                      onClick={() => setForm({ ...form, mood: m.emoji })}
                      className={cn(
                        "flex flex-col items-center gap-1 px-3 py-2 rounded-xl border-2 transition-all text-sm",
                        form.mood === m.emoji
                          ? "border-primary bg-primary/10 scale-105"
                          : "border-border hover:border-primary/40"
                      )}
                    >
                      <span className="text-xl">{m.emoji}</span>
                      <span className="text-xs text-textMuted">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reflection */}
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1.5">Reflection</label>
                <textarea
                  value={form.reflection}
                  onChange={e => setForm({ ...form, reflection: e.target.value })}
                  placeholder="What did you practice? What did you learn or struggle with?"
                  rows={4}
                  required
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 rounded-xl text-textMuted hover:text-text hover:bg-surfaceHighlight transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium transition-colors shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                  Save Entry
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search journal entries..."
        className="w-full max-w-md bg-surface border border-border rounded-xl py-2.5 px-4 text-text focus:outline-none focus:border-primary/50 transition-colors"
      />

      {/* Entries */}
      <div className="space-y-4">
        <AnimatePresence>
          {filtered.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-5 hover:border-primary/20 transition-all border border-transparent group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{entry.mood}</span>
                  <div>
                    <h3 className="font-semibold">{entry.skillName}</h3>
                    <p className="text-xs text-textMuted">{formatDate(entry.date)}</p>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-textMuted text-sm leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all">
                {entry.reflection}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-xl font-semibold mb-2">No entries yet</h3>
            <p className="text-textMuted">Start reflecting on your learning sessions to track your mindset over time.</p>
          </div>
        )}
      </div>
    </div>
  );
}
