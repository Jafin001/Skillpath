import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap, BrainCircuit, Clock, Calendar, Flame, BookOpen, RefreshCw, Timer } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';

const QUOTES = [
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "Every master was once a disaster.", author: "T. Harv Eker" },
  { text: "Learning never exhausts the mind.", author: "Leonardo da Vinci" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
];

const GREETINGS = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

// Build last-N-weeks heatmap data
function buildHeatmap(sessions: any[], weeks = 12) {
  const map: Record<string, number> = {};
  sessions.forEach(s => {
    const day = s.date.slice(0, 10);
    map[day] = (map[day] || 0) + s.duration;
  });

  const days: { date: string; mins: number; col: number; row: number }[] = [];
  const today = new Date();
  const totalDays = weeks * 7;
  // Align to the start of the current week (Sunday)
  const startDay = new Date(today);
  startDay.setDate(today.getDate() - totalDays + 1);

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startDay);
    d.setDate(startDay.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    days.push({
      date: dateStr,
      mins: map[dateStr] || 0,
      col: Math.floor(i / 7),
      row: i % 7,
    });
  }
  return days;
}

// Last 14 days bar chart
function buildBarData(sessions: any[]) {
  const result = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const mins = sessions.filter(s => s.date.slice(0, 10) === key).reduce((a: number, b: any) => a + b.duration, 0);
    result.push({ day: d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2), mins, date: key });
  }
  return result;
}

function heatmapColor(mins: number) {
  if (mins === 0) return 'bg-surfaceHighlight opacity-40';
  if (mins < 30) return 'bg-primary/20';
  if (mins < 60) return 'bg-primary/40';
  if (mins < 120) return 'bg-primary/70';
  return 'bg-primary';
}

export function Dashboard() {
  const { user, skills, sessions, journal, getStreak, getTotalMinutes } = useStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [quoteIdx, setQuoteIdx] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const [tooltip, setTooltip] = useState<{ date: string; mins: number } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const streak = getStreak();
  const totalMins = getTotalMinutes();
  const totalHours = (totalMins / 60).toFixed(1);

  const heatmapDays = useMemo(() => buildHeatmap(sessions, 16), [sessions]);
  const barData = useMemo(() => buildBarData(sessions), [sessions]);

  const cols = 16;
  const rows = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const formattedDate = currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Today's sessions
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayMins = sessions.filter(s => s.date.slice(0, 10) === todayKey).reduce((a, b) => a + b.duration, 0);


  const stats = [
    { title: 'Total Skills', value: skills.length.toString(), icon: BrainCircuit, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'Total Sessions', value: sessions.length.toString(), icon: Timer, color: 'text-green-400', bg: 'bg-green-400/10' },
    { title: 'Hours Learned', value: totalHours + 'h', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { title: 'Day Streak', value: streak > 0 ? `${streak} 🔥` : '0', icon: Flame, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  ];

  return (
    <div className="space-y-7 pb-10">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <p className="text-textMuted text-sm mb-0.5">{GREETINGS()} 👋</p>
          <h1 className="text-3xl lg:text-4xl font-bold mb-1">{user.name.split(' ')[0] || 'Learner'}</h1>
          <p className="text-textMuted text-sm">
            {todayMins > 0 ? `You've logged ${todayMins}m today — keep going! 💪` : "You haven't logged a session yet today."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="glass px-5 py-2.5 rounded-2xl flex items-center gap-2 text-sm">
            <Calendar size={16} className="text-primary" /><span>{formattedDate}</span>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="glass px-5 py-2.5 rounded-2xl flex items-center gap-2 bg-primary/5 border border-primary/20 text-sm">
            <Clock size={16} className="text-primary" /><span className="font-mono font-bold">{formattedTime}</span>
          </motion.div>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={stat.title} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}
            className="glass p-5 rounded-2xl flex items-center justify-between hover:scale-[1.02] transition-transform cursor-default group">
            <div>
              <p className="text-xs text-textMuted mb-1">{stat.title}</p>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
              <stat.icon size={22} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quote */}
      <AnimatePresence mode="wait">
        <motion.div key={quoteIdx} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
          className="glass rounded-2xl px-6 py-4 flex items-center justify-between border border-primary/10">
          <div>
            <p className="text-sm font-medium italic">"{QUOTES[quoteIdx].text}"</p>
            <p className="text-xs text-textMuted mt-1">— {QUOTES[quoteIdx].author}</p>
          </div>
          <button onClick={() => setQuoteIdx((quoteIdx + 1) % QUOTES.length)}
            className="p-2 rounded-xl hover:bg-surfaceHighlight text-textMuted hover:text-text transition-colors flex-shrink-0 ml-4">
            <RefreshCw size={15} />
          </button>
        </motion.div>
      </AnimatePresence>

      {/* Activity Heatmap */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Activity Heatmap</h3>
          <span className="text-xs text-textMuted">{sessions.length} sessions total</span>
        </div>
        <div className="overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {/* Row labels */}
            <div className="flex flex-col gap-1 mr-1">
              <div className="w-5 h-3" /> {/* spacer for column headers */}
              {rows.map((r, i) => (
                <div key={i} className="w-5 h-3 flex items-center justify-center text-[10px] text-textMuted">{r}</div>
              ))}
            </div>
            {/* Columns */}
            {Array.from({ length: cols }, (_, col) => (
              <div key={col} className="flex flex-col gap-1">
                <div className="h-3 w-3 flex items-center justify-center text-[9px] text-textMuted">
                  {col % 4 === 0 ? heatmapDays.find(d => d.col === col)?.date.slice(5, 7) : ''}
                </div>
                {Array.from({ length: 7 }, (_, row) => {
                  const cell = heatmapDays.find(d => d.col === col && d.row === row);
                  if (!cell) return <div key={row} className="w-3 h-3" />;
                  return (
                    <div key={row} className="relative group/cell">
                      <div
                        className={`w-3 h-3 rounded-sm cursor-pointer transition-all hover:scale-125 ${heatmapColor(cell.mins)}`}
                        onMouseEnter={() => setTooltip({ date: cell.date, mins: cell.mins })}
                        onMouseLeave={() => setTooltip(null)}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        {/* Tooltip */}
        {tooltip && (
          <div className="mt-3 text-xs text-textMuted">
            <span className="text-text font-medium">{tooltip.date}</span>: {tooltip.mins > 0 ? `${tooltip.mins}m logged` : 'No sessions'}
          </div>
        )}
        {/* Legend */}
        <div className="flex items-center gap-1.5 mt-3">
          <span className="text-xs text-textMuted">Less</span>
          {['opacity-40', 'bg-primary/20', 'bg-primary/40', 'bg-primary/70', 'bg-primary'].map((c, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${i === 0 ? 'bg-surfaceHighlight opacity-40' : c}`} />
          ))}
          <span className="text-xs text-textMuted">More</span>
        </div>
      </motion.div>

      {/* Daily bar chart + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-5">Last 14 Days (minutes)</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} barSize={16}>
                <XAxis dataKey="day" stroke="#71717a" tick={{ fill: '#71717a', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" tick={{ fill: '#71717a', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: 12 }}
                  itemStyle={{ color: '#fafafa' }}
                  formatter={(v: any) => [`${v}m`, 'Duration']}
                />
                <Bar dataKey="mins" fill="#8b5cf6" radius={[4, 4, 0, 0]} fillOpacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent sessions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2"><Timer size={18} className="text-primary" />Recent Sessions</h3>
            <Link to="/skills" className="text-xs text-primary hover:underline">Log →</Link>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            {sessions.slice(0, 5).map(s => (
              <div key={s.id} className="p-3 rounded-xl bg-surface border border-border hover:border-primary/20 transition-all">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{s.skillName}</p>
                  <span className="text-xs font-bold text-primary">{s.duration}m</span>
                </div>
                <p className="text-xs text-textMuted mt-0.5">{new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                {s.notes && <p className="text-xs text-textMuted mt-1 line-clamp-1">{s.notes}</p>}
              </div>
            ))}
            {sessions.length === 0 && (
              <div className="text-center text-textMuted py-8">
                <div className="text-4xl mb-2">⏱️</div>
                <p className="text-sm">No sessions yet</p>
                <Link to="/skills" className="text-primary text-xs hover:underline">Log your first session</Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top skills by time */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2"><BrainCircuit size={18} className="text-primary" />Top Skills by Time</h3>
            <Link to="/skills" className="text-xs text-primary hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {skills.map(skill => {
              const mins = sessions.filter(s => s.skillId === skill.id).reduce((a, b) => a + b.duration, 0);
              return { ...skill, mins };
            }).sort((a, b) => b.mins - a.mins).slice(0, 4).map(skill => (
              <div key={skill.id} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-textMuted">{skill.mins > 0 ? `${Math.floor(skill.mins / 60)}h ${skill.mins % 60}m` : '0m'}</span>
                  </div>
                  <div className="h-1.5 bg-surfaceHighlight rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (skill.mins / Math.max(1, totalMins)) * 100)}%` }}
                      transition={{ duration: 0.8 }} className="h-full bg-gradient-to-r from-blue-500 to-primary rounded-full" />
                  </div>
                </div>
              </div>
            ))}
            {skills.length === 0 && <p className="text-textMuted text-sm text-center py-4">Add skills to track time</p>}
          </div>
        </motion.div>

        {/* Recent journal */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2"><BookOpen size={18} className="text-primary" />Recent Reflections</h3>
            <Link to="/journal" className="text-xs text-primary hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {journal.slice(0, 3).map(e => (
              <div key={e.id} className="p-3 rounded-xl bg-surface border border-border hover:border-primary/20 transition-all">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{e.mood}</span>
                  <div>
                    <p className="text-sm font-medium">{e.skillName}</p>
                    <p className="text-xs text-textMuted">{new Date(e.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className="text-xs text-textMuted line-clamp-2">{e.reflection}</p>
              </div>
            ))}
            {journal.length === 0 && (
              <div className="text-center text-textMuted py-6">
                <div className="text-4xl mb-2">📖</div>
                <p className="text-sm">No journal entries yet</p>
                <Link to="/journal" className="text-primary text-xs hover:underline">Write first reflection</Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
