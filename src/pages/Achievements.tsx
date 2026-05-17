import { motion } from 'framer-motion';
import { Trophy, Lock } from 'lucide-react';
import { useStore } from '../store/useStore';

interface Badge {
  id: string;
  emoji: string;
  title: string;
  description: string;
  check: (skills: any[], sessions: any[], journal: any[], streak: number, totalMins: number) => boolean;
}

const BADGES: Badge[] = [
  { id: 'first-skill',    emoji: '🌱', title: 'First Step',         description: 'Add your first skill',                       check: (s) => s.length >= 1 },
  { id: 'skill-5',        emoji: '📚', title: 'Skill Collector',     description: 'Track 5 or more skills',                     check: (s) => s.length >= 5 },
  { id: 'diverse',        emoji: '🌈', title: 'Polymath',            description: 'Skills in 3+ different categories',          check: (s) => new Set(s.map((x: any) => x.category)).size >= 3 },
  { id: 'expert',         emoji: '🏆', title: 'Expert Mode',         description: 'Reach Expert level in any skill',            check: (s) => s.some((x: any) => x.level === 'Expert') },
  { id: 'first-session',  emoji: '⏱️', title: 'First Session',       description: 'Log your first learning session',            check: (_s, sess) => sess.length >= 1 },
  { id: 'session-10',     emoji: '🔟', title: 'Consistent',          description: 'Log 10 sessions total',                     check: (_s, sess) => sess.length >= 10 },
  { id: 'session-50',     emoji: '💯', title: 'Dedicated',           description: 'Log 50 sessions total',                     check: (_s, sess) => sess.length >= 50 },
  { id: 'hour-1',         emoji: '⏰', title: 'Hour One',            description: 'Log your first 60 minutes',                 check: (_s, _ss, _j, _st, m) => m >= 60 },
  { id: 'hours-10',       emoji: '🕙', title: 'Ten Hours',           description: 'Log 10 hours of learning',                  check: (_s, _ss, _j, _st, m) => m >= 600 },
  { id: 'hours-50',       emoji: '📡', title: 'Deep Work',           description: 'Log 50 hours of learning',                  check: (_s, _ss, _j, _st, m) => m >= 3000 },
  { id: 'streak-3',       emoji: '⚡', title: 'Spark',               description: '3-day learning streak',                     check: (_s, _ss, _j, st) => st >= 3 },
  { id: 'streak-7',       emoji: '🗓️', title: 'Week Warrior',        description: '7-day learning streak',                     check: (_s, _ss, _j, st) => st >= 7 },
  { id: 'streak-30',      emoji: '👑', title: 'Dedicated Scholar',   description: '30-day learning streak',                    check: (_s, _ss, _j, st) => st >= 30 },
  { id: 'journaler',      emoji: '📖', title: 'Reflective Mind',     description: 'Write your first journal entry',            check: (_s, _ss, j) => j.length >= 1 },
  { id: 'journal-10',     emoji: '✍️', title: 'Journaling Habit',    description: 'Write 10 journal entries',                  check: (_s, _ss, j) => j.length >= 10 },
  { id: 'on-fire',        emoji: '🔥', title: 'On Fire',             description: 'Log a 🔥 mood in journal',                  check: (_s, _ss, j) => j.some((e: any) => e.mood === '🔥') },
];

export function Achievements() {
  const { skills, sessions, journal, getStreak, getTotalMinutes } = useStore();
  const streak = getStreak();
  const totalMins = getTotalMinutes();

  const earnedIds = new Set(
    BADGES.filter(b => b.check(skills, sessions, journal, streak, totalMins)).map(b => b.id)
  );
  const earnedCount = earnedIds.size;

  return (
    <div className="space-y-8 pb-10">
      <header>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Trophy className="text-yellow-400" size={32} /> Achievements
        </h1>
        <p className="text-textMuted">
          <span className="text-text font-semibold">{earnedCount}</span> of {BADGES.length} badges earned
        </p>
      </header>

      {/* Progress */}
      <div className="glass rounded-2xl p-5">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-textMuted">Overall progress</span>
          <span className="font-medium">{Math.round((earnedCount / BADGES.length) * 100)}%</span>
        </div>
        <div className="h-3 bg-surfaceHighlight rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${(earnedCount / BADGES.length) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full" />
        </div>
      </div>

      {/* Badges grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {BADGES.map((badge, i) => {
          const earned = earnedIds.has(badge.id);
          return (
            <motion.div key={badge.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
              className={`glass rounded-2xl p-5 text-center relative overflow-hidden transition-all ${
                earned ? 'border border-yellow-400/30 bg-yellow-400/5 hover:scale-105' : 'opacity-40 grayscale'
              }`}>
              {!earned && <div className="absolute top-2 right-2 text-textMuted"><Lock size={13} /></div>}
              {earned && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />}
              <div className="text-4xl mb-2">{badge.emoji}</div>
              <h3 className={`font-bold text-sm mb-1 ${earned ? 'text-yellow-400' : ''}`}>{badge.title}</h3>
              <p className="text-xs text-textMuted leading-relaxed">{badge.description}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
