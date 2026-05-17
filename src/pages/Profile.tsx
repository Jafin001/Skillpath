import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Trophy, Plus, Trash2, Check, Edit3, Camera } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';

// Beautiful premium Apple-style 3D-esque emojis for avatar selection
const AVATAR_OPTIONS = [
  { emoji: '💻', label: 'Tech Enthusiast', bg: 'bg-blue-500/10 border-blue-500/20' },
  { emoji: '🎨', label: 'Creative Designer', bg: 'bg-pink-500/10 border-pink-500/20' },
  { emoji: '🚀', label: 'Space Explorer', bg: 'bg-purple-500/10 border-purple-500/20' },
  { emoji: '🧠', label: 'AI Engineer', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { emoji: '🎓', label: 'Infinite Scholar', bg: 'bg-amber-500/10 border-amber-500/20' },
  { emoji: '🎸', label: 'Rock Musician', bg: 'bg-red-500/10 border-red-500/20' },
  { emoji: '🦁', label: 'Bold Leader', bg: 'bg-orange-500/10 border-orange-500/20' },
  { emoji: '🦊', label: 'Clever Strategist', bg: 'bg-teal-500/10 border-teal-500/20' },
];

export function Profile() {
  const { user, updateUser, skills, getStreak, getTotalMinutes } = useStore();

  const [name, setName] = useState(user.name || 'Learner');
  const [bio, setBio] = useState(user.bio || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar || '💻');
  const [newGoal, setNewGoal] = useState('');
  const [goals, setGoals] = useState<string[]>(user.learningGoals || []);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const streak = getStreak();
  const totalMins = getTotalMinutes();
  const skillsCount = skills.length;

  const handleSaveProfile = () => {
    updateUser({
      name: name.trim(),
      bio: bio.trim(),
      avatar: selectedAvatar,
      learningGoals: goals,
    });
    setIsEditingProfile(false);
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim()) return;
    const updatedGoals = [...goals, newGoal.trim()];
    setGoals(updatedGoals);
    setNewGoal('');
    updateUser({ learningGoals: updatedGoals });
  };

  const handleRemoveGoal = (index: number) => {
    const updatedGoals = goals.filter((_, i) => i !== index);
    setGoals(updatedGoals);
    updateUser({ learningGoals: updatedGoals });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === 'string') {
        setSelectedAvatar(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8 pb-10 animate-fadeIn">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-textMuted">Manage your professional bio, avatar identity, and long-term learning goals.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Card & Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-3xl p-6 relative overflow-hidden border border-border/50 shadow-sm">
            {/* Visual gradient backdrop overlay */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-purple-500 to-pink-500" />
            
            <div className="flex flex-col sm:flex-row items-center gap-6 mt-4">
              {/* Avatar display */}
              <div className="relative group flex-shrink-0">
                <div className="w-24 h-24 rounded-2xl bg-surfaceHighlight flex items-center justify-center text-5xl shadow-inner border border-border overflow-hidden">
                  {selectedAvatar.startsWith('data:image/') ? (
                    <img src={selectedAvatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    selectedAvatar
                  )}
                </div>
                {isEditingProfile && (
                  <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <Camera size={20} className="text-white" />
                  </div>
                )}
              </div>

              {/* Title & Name */}
              <div className="flex-1 text-center sm:text-left space-y-2">
                {!isEditingProfile ? (
                  <>
                    <h2 className="text-2xl font-bold">{user.name || 'Learner'}</h2>
                    <p className="text-sm text-textMuted font-medium">{user.bio || 'Add a learning headline or bio.'}</p>
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline"
                    >
                      <Edit3 size={12} />
                      Edit Bio & Avatar
                    </button>
                  </>
                ) : (
                  <div className="space-y-3 w-full max-w-md">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-textMuted mb-1 block">Your Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Learner"
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-text focus:outline-none focus:border-primary/50"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-textMuted mb-1 block">Bio / Headline</label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Self-taught developer building skills..."
                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-text focus:outline-none focus:border-primary/50 min-h-[60px] resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Avatar Selection (Editing mode only) */}
            {isEditingProfile && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 pt-6 border-t border-border/50"
              >
                <p className="text-xs font-semibold mb-3">Select Profile Avatar</p>
                <div className="flex flex-wrap gap-3 items-center">
                  {AVATAR_OPTIONS.map((opt) => (
                    <button
                      key={opt.emoji}
                      onClick={() => setSelectedAvatar(opt.emoji)}
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all border-2",
                        opt.bg,
                        selectedAvatar === opt.emoji 
                          ? "border-primary scale-110 shadow-sm" 
                          : "border-transparent opacity-60 hover:opacity-100"
                      )}
                      title={opt.label}
                    >
                      {opt.emoji}
                    </button>
                  ))}

                  {/* Photo Upload Option */}
                  <label className={cn(
                    "w-12 h-12 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-border/80 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all text-textMuted hover:text-text overflow-hidden relative group",
                    selectedAvatar.startsWith('data:image/') && "border-primary border-solid bg-primary/5 text-primary"
                  )}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    {selectedAvatar.startsWith('data:image/') ? (
                      <img src={selectedAvatar} alt="Custom" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-0.5">
                        <Camera size={14} />
                        <span className="text-[9px] font-bold uppercase tracking-tight">Upload</span>
                      </div>
                    )}
                  </label>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 rounded-xl bg-surfaceHighlight hover:bg-surfaceHighlight/80 text-textMuted text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/95 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Check size={14} />
                    Save Details
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Core Learning Goals Panel */}
          <div className="glass rounded-3xl p-6 border border-border/50 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-bold">🎯 Core Learning Objectives</h3>
              <p className="text-xs text-textMuted">Define your milestones and focus areas to align your coach recommendations.</p>
            </div>

            <form onSubmit={handleAddGoal} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Master system designs, build portfolio site..."
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-sm text-text focus:outline-none focus:border-primary/50"
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary/95 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all"
              >
                <Plus size={16} />
                Add
              </button>
            </form>

            <div className="space-y-2">
              {goals.length === 0 ? (
                <p className="text-sm text-textMuted text-center py-4 bg-surfaceHighlight/10 rounded-2xl border border-dashed border-border/50">No goals added yet. Start by defining your first objective!</p>
              ) : (
                goals.map((g, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-2xl bg-surfaceHighlight/20 border border-border/40 hover:border-border transition-colors group"
                  >
                    <span className="text-sm font-medium">{g}</span>
                    <button
                      onClick={() => handleRemoveGoal(idx)}
                      className="p-1 rounded-lg text-textMuted hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Analytics Side Panel */}
        <div className="space-y-6">
          <div className="glass rounded-3xl p-6 border border-border/50 shadow-sm space-y-6">
            <h3 className="text-lg font-bold">📊 Performance Metrics</h3>
            
            <div className="space-y-4">
              {/* Metric 1 */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                  <BookOpen size={20} />
                </div>
                <div>
                  <p className="text-xs text-textMuted uppercase font-bold">Skills Tracked</p>
                  <p className="text-xl font-extrabold">{skillsCount}</p>
                </div>
              </div>

              {/* Metric 2 */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-xs text-textMuted uppercase font-bold">Time Invested</p>
                  <p className="text-xl font-extrabold">{totalMins} <span className="text-xs font-semibold text-textMuted">mins</span></p>
                </div>
              </div>

              {/* Metric 3 */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-orange-500/5 border border-orange-500/10">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 flex-shrink-0">
                  <Trophy size={20} />
                </div>
                <div>
                  <p className="text-xs text-textMuted uppercase font-bold">Active Streak</p>
                  <p className="text-xl font-extrabold">{streak} <span className="text-xs font-semibold text-textMuted">days</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
