import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, type AuthUser } from '../lib/supabase';

export interface Skill {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  progress: number;
  category: string;
  lastUpdated: string;
  notes?: string;
  targetHoursPerWeek?: number;
}

export interface Session {
  id: string;
  skillId: string;
  skillName: string;
  duration: number; // minutes
  date: string; // ISO
  notes?: string;
}

export interface JournalEntry {
  id: string;
  skillId: string;
  skillName: string;
  mood: '😴' | '😐' | '😊' | '💪' | '🔥';
  reflection: string;
  date: string;
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  skillId?: string;
  skillName?: string;
  fileType: 'image' | 'pdf' | 'link';
  fileUrl: string; // Base64 or standard URL
}

export interface UserProfile {
  name: string;
  bio: string;
  avatar?: string;
  learningGoals: string[];
}

// Computed: streak = consecutive days (up to today) that have at least 1 session
function computeStreak(sessions: Session[]): number {
  if (sessions.length === 0) return 0;
  const days = new Set(sessions.map(s => s.date.slice(0, 10)));
  let streak = 0;
  const d = new Date();
  // Check today OR yesterday as start (don't break streak if user hasn't logged yet today)
  const todayStr = d.toISOString().slice(0, 10);
  d.setDate(d.getDate() - 1);
  const yesterdayStr = d.toISOString().slice(0, 10);
  
  let cursor = days.has(todayStr) ? new Date() : (days.has(yesterdayStr) ? new Date(d) : null);
  if (!cursor) return 0;

  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (!days.has(key)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface AppState {
  user: UserProfile;
  authUser: AuthUser | null;
  skills: Skill[];
  sessions: Session[];
  journal: JournalEntry[];
  certificates: Certificate[];
  geminiApiKey: string;
  coachMessages: ChatMessage[];
  theme: 'light' | 'dark';
  isAuthLoading: boolean;

  // Computed helpers (not persisted)
  getStreak: () => number;
  getTotalMinutes: () => number;

  updateUser: (user: Partial<UserProfile>) => void;
  setAuthUser: (authUser: AuthUser | null) => void;
  setAuthLoading: (loading: boolean) => void;
  addSkill: (skill: Omit<Skill, 'id' | 'lastUpdated'>) => void;
  updateSkill: (id: string, skill: Partial<Skill>) => void;
  deleteSkill: (id: string) => void;
  addSession: (session: Omit<Session, 'id'>) => void;
  deleteSession: (id: string) => void;
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'date'>) => void;
  addCertificate: (cert: Omit<Certificate, 'id'>) => void;
  deleteCertificate: (id: string) => void;
  setGeminiApiKey: (key: string) => void;
  addCoachMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearCoachMessages: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  syncToCloud: () => Promise<void>;
  loadFromCloud: () => Promise<void>;
  restoreBackup: (backupStr: string) => void;
  resetStore: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: {
        name: '',
        bio: 'Self-taught developer building skills one session at a time.',
        learningGoals: ['Master React', 'Learn System Design', 'Build 5 side projects'],
      },
      authUser: null,
      isAuthLoading: true,
      skills: [
        { id: '1', name: 'React', level: 'Intermediate', progress: 60, category: 'Frontend', lastUpdated: new Date().toISOString() },
        { id: '2', name: 'Node.js', level: 'Beginner', progress: 30, category: 'Backend', lastUpdated: new Date().toISOString() },
        { id: '3', name: 'UI/UX Design', level: 'Beginner', progress: 45, category: 'Design', lastUpdated: new Date().toISOString() },
      ],
      sessions: [],
      journal: [],
      certificates: [],
      geminiApiKey: '',
      coachMessages: [
        {
          id: 'welcome',
          sender: 'ai',
          text: 'Hi there! I am your SkillPath AI Learning Coach. 🧠\n\nI can analyze your logged skills, study sessions, and journal entries to give you personalized learning plans, productivity strategies, and feedback.\n\nTo unlock high-quality live coaching, enter your free Gemini API Key in the settings at any time! Or ask me a question now for quick advice.',
          timestamp: new Date().toISOString(),
        }
      ],
      theme: 'dark',

      getStreak: () => computeStreak(get().sessions),
      getTotalMinutes: () => get().sessions.reduce((acc, s) => acc + s.duration, 0),

      updateUser: (data) => {
        set((state) => ({ user: { ...state.user, ...data } }));
        get().syncToCloud();
      },
      setAuthUser: (authUser) => set({ authUser }),
      setAuthLoading: (loading) => set({ isAuthLoading: loading }),
      addSkill: (skill) => {
        set((state) => ({
          skills: [...state.skills, { ...skill, id: crypto.randomUUID(), lastUpdated: new Date().toISOString() }]
        }));
        get().syncToCloud();
      },
      updateSkill: (id, data) => {
        set((state) => ({
          skills: state.skills.map(s => s.id === id ? { ...s, ...data, lastUpdated: new Date().toISOString() } : s)
        }));
        get().syncToCloud();
      },
      deleteSkill: (id) => {
        set((state) => ({
          skills: state.skills.filter(s => s.id !== id)
        }));
        get().syncToCloud();
      },
      addSession: (session) => {
        set((state) => ({
          sessions: [{ ...session, id: crypto.randomUUID() }, ...state.sessions]
        }));
        get().syncToCloud();
      },
      deleteSession: (id) => {
        set((state) => ({
          sessions: state.sessions.filter(s => s.id !== id)
        }));
        get().syncToCloud();
      },
      addJournalEntry: (entry) => {
        set((state) => ({
          journal: [{ ...entry, id: crypto.randomUUID(), date: new Date().toISOString() }, ...state.journal]
        }));
        get().syncToCloud();
      },
      addCertificate: (cert) => {
        set((state) => ({
          certificates: [{ ...cert, id: crypto.randomUUID() }, ...state.certificates]
        }));
        get().syncToCloud();
      },
      deleteCertificate: (id) => {
        set((state) => ({
          certificates: state.certificates.filter(c => c.id !== id)
        }));
        get().syncToCloud();
      },
      setGeminiApiKey: (key) => {
        set({ geminiApiKey: key });
        get().syncToCloud();
      },
      addCoachMessage: (msg) => {
        set((state) => ({
          coachMessages: [
            ...state.coachMessages,
            { ...msg, id: crypto.randomUUID(), timestamp: new Date().toISOString() }
          ]
        }));
        get().syncToCloud();
      },
      clearCoachMessages: () => {
        set(() => ({
          coachMessages: [
            {
              id: 'welcome',
              sender: 'ai',
              text: 'History cleared. Ask me any question or request a personalized study report!',
              timestamp: new Date().toISOString(),
            }
          ]
        }));
        get().syncToCloud();
      },
      setTheme: (theme) => set({ theme }),
      resetStore: () => set(() => ({
        user: {
          name: '',
          bio: 'Self-taught developer building skills one session at a time.',
          learningGoals: ['Master React', 'Learn System Design', 'Build 5 side projects'],
        },
        skills: [],
        sessions: [],
        journal: [],
        certificates: [],
        coachMessages: [
          {
            id: 'welcome',
            sender: 'ai',
            text: 'Hi there! I am your SkillPath AI Learning Coach. 🧠\n\nI can analyze your logged skills, study sessions, and journal entries to give you personalized learning plans, productivity strategies, and feedback.\n\nTo unlock high-quality live coaching, enter your free Gemini API Key in the settings at any time! Or ask me a question now for quick advice.',
            timestamp: new Date().toISOString(),
          }
        ]
      })),
      restoreBackup: (backupStr) => {
        try {
          if (!backupStr) return;
          const backup = JSON.parse(backupStr);
          set({
            user: backup.user || get().user,
            skills: backup.skills || get().skills,
            sessions: backup.sessions || get().sessions,
            journal: backup.journal || get().journal,
            certificates: backup.certificates || get().certificates,
          });
        } catch (e) {
          console.error('Backup restore failed:', e);
        }
      },
      syncToCloud: async () => {
        const { authUser } = get();
        if (!authUser || authUser.isGuest) return;
        try {
          const backup = {
            user: get().user,
            skills: get().skills,
            sessions: get().sessions,
            journal: get().journal,
            certificates: get().certificates
          };
          
          // 1. Try dedicated database table upsert
          const { error: dbError } = await supabase
            .from('user_sync')
            .upsert({
              user_id: authUser.id,
              backup_data: backup,
              updated_at: new Date().toISOString()
            });

          if (!dbError) {
            console.log('Successfully backed up to dedicated database table!');
            return;
          }

          console.warn('Database table sync failed, trying auth metadata fallback:', dbError.message);

          // 2. Fallback to auth metadata
          const { error: authError } = await supabase.auth.updateUser({
            data: { skillpath_backup: JSON.stringify(backup) }
          });
          if (authError) {
            console.error('Supabase updateUser error:', authError);
          } else {
            console.log('Successfully backed up to cloud via auth metadata fallback!');
          }
        } catch (e) {
          console.error('Cloud sync failed:', e);
        }
      },
      loadFromCloud: async () => {
        const { authUser } = get();
        if (!authUser || authUser.isGuest) return;
        try {
          // 1. Try dedicated database table select
          const { data: dbData, error: dbError } = await supabase
            .from('user_sync')
            .select('backup_data')
            .eq('user_id', authUser.id)
            .maybeSingle();

          if (!dbError && dbData?.backup_data) {
            const backup = dbData.backup_data;
            set({
              user: backup.user || get().user,
              skills: backup.skills || get().skills,
              sessions: backup.sessions || get().sessions,
              journal: backup.journal || get().journal,
              certificates: backup.certificates || get().certificates,
            });
            console.log('Successfully loaded backup from dedicated database table!');
            return;
          }

          console.warn('Database table load failed, trying auth metadata fallback:', dbError?.message);

          // 2. Fallback to auth metadata
          const { data: { user }, error: authError } = await supabase.auth.getUser();
          if (authError) {
            console.error('Supabase getUser error:', authError);
            return;
          }
          const backupStr = user?.user_metadata?.skillpath_backup;
          if (backupStr) {
            const backup = JSON.parse(backupStr);
            set({
              user: backup.user || get().user,
              skills: backup.skills || get().skills,
              sessions: backup.sessions || get().sessions,
              journal: backup.journal || get().journal,
              certificates: backup.certificates || get().certificates,
            });
            console.log('Successfully loaded backup from cloud via auth metadata fallback!');
          }
        } catch (e) {
          console.error('Cloud restore failed:', e);
        }
      },
    }),
    {
      name: 'skillpath-storage',
      partialize: (state) => ({
        user: state.user,
        authUser: state.authUser,
        skills: state.skills,
        sessions: state.sessions,
        journal: state.journal,
        certificates: state.certificates,
        geminiApiKey: state.geminiApiKey,
        coachMessages: state.coachMessages,
        theme: state.theme,
      }),
    }
  )
);
