import { motion } from 'framer-motion';
import { BookOpen, Clock, Calendar, ShieldCheck, Heart, Award } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';

// Helper to determine XP and Level
const calculateLevel = (totalMinutes: number) => {
  const totalHours = totalMinutes / 60;
  if (totalHours < 5) return { level: 1, name: 'Novice Learner', nextLevelHours: 5, xp: totalMinutes, maxXp: 300 };
  if (totalHours < 15) return { level: 2, name: 'Dedicated Scholar', nextLevelHours: 15, xp: totalMinutes, maxXp: 900 };
  if (totalHours < 35) return { level: 3, name: 'Deep Focused Master', nextLevelHours: 35, xp: totalMinutes, maxXp: 2100 };
  if (totalHours < 75) return { level: 4, name: 'Habit Hacker', nextLevelHours: 75, xp: totalMinutes, maxXp: 4500 };
  return { level: 5, name: 'SkillPath Grandmaster', nextLevelHours: 999, xp: totalMinutes, maxXp: 4500 };
};

export function Growth() {
  const { skills, sessions, journal, certificates, getTotalMinutes } = useStore();
  
  const totalMins = getTotalMinutes();
  const lvlInfo = calculateLevel(totalMins);

  // Auto-compile timeline from multiple collections chronologically
  const timelineItems = [
    ...skills.map(s => ({
      id: `skill-${s.id}`,
      type: 'skill',
      title: `Started learning ${s.name}`,
      subtitle: `Target level: ${s.level} | Category: ${s.category}`,
      date: s.lastUpdated,
      icon: <BookOpen size={16} />,
      color: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    })),
    ...sessions.map(s => ({
      id: `session-${s.id}`,
      type: 'session',
      title: `Logged a ${s.duration} min study block`,
      subtitle: `Focused on ${s.skillName} ${s.notes ? `— "${s.notes}"` : ''}`,
      date: s.date,
      icon: <Clock size={16} />,
      color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    })),
    ...journal.map(j => ({
      id: `journal-${j.id}`,
      type: 'journal',
      title: `Logged mindset reflection: ${j.mood}`,
      subtitle: `"${j.reflection}"`,
      date: j.date,
      icon: <Heart size={16} />,
      color: 'bg-pink-500/10 border-pink-500/20 text-pink-400',
    })),
    ...certificates.map(c => ({
      id: `cert-${c.id}`,
      type: 'cert',
      title: `Achieved Credential: ${c.title}`,
      subtitle: `Issued by ${c.issuer} for ${c.skillName || 'general track'}`,
      date: c.issueDate,
      icon: <ShieldCheck size={16} />,
      color: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-8 pb-10 animate-fadeIn">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold mb-2">Growth Tracker</h1>
        <p className="text-textMuted">Watch your skill milestones, study logs, and certificates compile into an active learning roadmap.</p>
      </header>

      {/* Level-Up Progression Gauge */}
      <div className="glass rounded-3xl p-6 border border-border/50 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-xl text-[10px] uppercase font-bold tracking-wider">
              Level {lvlInfo.level} • {lvlInfo.name}
            </span>
            <h2 className="text-2xl font-bold">Progress toward Level {lvlInfo.level + 1}</h2>
            <p className="text-xs text-textMuted">
              You have completed **{totalMins} minutes** of focused learning. 
              {lvlInfo.level < 5 
                ? ` Study ${Math.max(0, Math.ceil(lvlInfo.nextLevelHours * 60 - totalMins))} more minutes to level up!`
                : " You've reached the highest learning tier!"}
            </p>
          </div>

          <div className="w-full md:w-80 space-y-2 flex-shrink-0">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-textMuted">{lvlInfo.xp} XP</span>
              <span className="text-textMuted">{lvlInfo.maxXp} XP max</span>
            </div>
            <div className="h-3 w-full bg-surfaceHighlight/35 rounded-full overflow-hidden border border-border">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (lvlInfo.xp / lvlInfo.maxXp) * 100)}%` }}
                transition={{ duration: 1 }}
                className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Roadmap vs Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Timeline Journey Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-3xl p-6 border border-border/50 shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Award className="text-primary" size={20} />
              Your Chronological Learning Roadmap
            </h3>

            {timelineItems.length === 0 ? (
              <div className="text-center py-10 space-y-4">
                <p className="text-sm text-textMuted">No roadmap events compiled yet. Build history by completing these tasks:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                  <div className="p-4 bg-surfaceHighlight/20 border border-border/50 rounded-2xl text-left space-y-1">
                    <p className="text-xs font-bold text-text">1. Add custom skills</p>
                    <p className="text-[11px] text-textMuted">Create learning goals inside the Skills panel.</p>
                  </div>
                  <div className="p-4 bg-surfaceHighlight/20 border border-border/50 rounded-2xl text-left space-y-1">
                    <p className="text-xs font-bold text-text">2. Log a study session</p>
                    <p className="text-[11px] text-textMuted">Complete tasks or track study sessions in dashboard.</p>
                  </div>
                  <div className="p-4 bg-surfaceHighlight/20 border border-border/50 rounded-2xl text-left space-y-1">
                    <p className="text-xs font-bold text-text">3. Add a journal log</p>
                    <p className="text-[11px] text-textMuted">Write down mood and self-reflection in Journal.</p>
                  </div>
                  <div className="p-4 bg-surfaceHighlight/20 border border-border/50 rounded-2xl text-left space-y-1">
                    <p className="text-xs font-bold text-text">4. Log credentials</p>
                    <p className="text-[11px] text-textMuted">Upload certificates to build your qualifications.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative border-l border-border pl-6 ml-3 space-y-8">
                {timelineItems.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.3 }}
                    className="relative group"
                  >
                    {/* Glowing outer point */}
                    <div className={cn(
                      "absolute -left-9 top-1.5 w-6 h-6 rounded-full border flex items-center justify-center shadow-sm transition-all group-hover:scale-110",
                      item.color
                    )}>
                      {item.icon}
                    </div>

                    {/* Timeline card info */}
                    <div className="space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h4 className="text-sm font-bold text-text">{item.title}</h4>
                        <span className="text-[10px] text-textMuted font-semibold flex items-center gap-1">
                          <Calendar size={10} />
                          {new Date(item.date).toLocaleDateString(undefined, { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-textMuted leading-relaxed">{item.subtitle}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Milestone Badges & Level Summaries */}
        <div className="space-y-6">
          <div className="glass rounded-3xl p-6 border border-border/50 shadow-sm space-y-4">
            <h3 className="text-lg font-bold">💡 SkillPath Learning Milestones</h3>
            <p className="text-xs text-textMuted">Unlock milestones as you build focus habits on your dashboard.</p>
            
            <div className="space-y-3">
              {/* Milestone 1 */}
              <div className={cn(
                "flex items-center gap-3 p-3 rounded-2xl border transition-all",
                skills.length > 0 
                  ? "bg-blue-500/5 border-blue-500/10 text-text" 
                  : "bg-surfaceHighlight/15 border-transparent text-textMuted opacity-50"
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-sm",
                  skills.length > 0 ? "bg-blue-500/20 text-blue-400" : "bg-surfaceHighlight"
                )}>
                  🎯
                </div>
                <div>
                  <h4 className="text-xs font-bold">First Skill Initiated</h4>
                  <p className="text-[10px] text-textMuted">Create your first goal target.</p>
                </div>
              </div>

              {/* Milestone 2 */}
              <div className={cn(
                "flex items-center gap-3 p-3 rounded-2xl border transition-all",
                sessions.length > 0 
                  ? "bg-emerald-500/5 border-emerald-500/10 text-text" 
                  : "bg-surfaceHighlight/15 border-transparent text-textMuted opacity-50"
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-sm",
                  sessions.length > 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-surfaceHighlight"
                )}>
                  ⚡
                </div>
                <div>
                  <h4 className="text-xs font-bold">First Study Block Logged</h4>
                  <p className="text-[10px] text-textMuted">Complete a deliberate practice block.</p>
                </div>
              </div>

              {/* Milestone 3 */}
              <div className={cn(
                "flex items-center gap-3 p-3 rounded-2xl border transition-all",
                journal.length > 0 
                  ? "bg-pink-500/5 border-pink-500/10 text-text" 
                  : "bg-surfaceHighlight/15 border-transparent text-textMuted opacity-50"
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-sm",
                  journal.length > 0 ? "bg-pink-500/20 text-pink-400" : "bg-surfaceHighlight"
                )}>
                  🧠
                </div>
                <div>
                  <h4 className="text-xs font-bold">Mindset Audit Logged</h4>
                  <p className="text-[10px] text-textMuted">Write down your mental reflection logs.</p>
                </div>
              </div>

              {/* Milestone 4 */}
              <div className={cn(
                "flex items-center gap-3 p-3 rounded-2xl border transition-all",
                lvlInfo.level >= 2 
                  ? "bg-orange-500/5 border-orange-500/10 text-text" 
                  : "bg-surfaceHighlight/15 border-transparent text-textMuted opacity-50"
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-sm",
                  lvlInfo.level >= 2 ? "bg-orange-500/20 text-orange-400" : "bg-surfaceHighlight"
                )}>
                  🏆
                </div>
                <div>
                  <h4 className="text-xs font-bold">Scholar Achievement</h4>
                  <p className="text-[10px] text-textMuted">Accumulate 5+ hours of deliberate learning.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
