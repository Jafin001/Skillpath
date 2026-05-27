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

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

// Shape of data stored in cloud / backup
interface BackupData {
  user?: Partial<UserProfile>;
  skills?: Skill[];
  sessions?: Session[];
  journal?: JournalEntry[];
  certificates?: Certificate[];
  geminiApiKey?: string;
  coachMessages?: ChatMessage[];
}

// Computed: streak = consecutive days (up to today) that have at least 1 session
function computeStreak(sessions: Session[]): number {
  if (sessions.length === 0) return 0;
  const days = new Set(sessions.map(s => s.date.slice(0, 10)));
  let streak = 0;
  const d = new Date();
  const todayStr = d.toISOString().slice(0, 10);
  d.setDate(d.getDate() - 1);
  const yesterdayStr = d.toISOString().slice(0, 10);

  // Allow streak to still count if user hasn't logged yet today
  const start = days.has(todayStr) ? new Date() : days.has(yesterdayStr) ? new Date(d) : null;
  if (!start) return 0;

  const cursor = new Date(start);
  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (!days.has(key)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

const WELCOME_MSG: ChatMessage = {
  id: 'welcome',
  sender: 'ai',
  text: 'Hi there! I am your SkillPath AI Learning Coach. 🧠\n\nI can analyze your logged skills, study sessions, and journal entries to give you personalized learning plans, productivity strategies, and feedback.\n\nTo unlock high-quality live coaching, enter your free Gemini API Key in the settings at any time! Or ask me a question now for quick advice.',
  timestamp: new Date().toISOString(),
};

const DEFAULT_USER: UserProfile = {
  name: '',
  bio: 'Self-taught developer building skills one session at a time.',
  learningGoals: ['Master React', 'Learn System Design', 'Build 5 side projects'],
};

const DEFAULT_SKILLS: Skill[] = [
  { id: '1', name: 'React', level: 'Intermediate', progress: 60, category: 'Frontend', lastUpdated: new Date().toISOString() },
  { id: '2', name: 'Node.js', level: 'Beginner', progress: 30, category: 'Backend', lastUpdated: new Date().toISOString() },
  { id: '3', name: 'UI/UX Design', level: 'Beginner', progress: 45, category: 'Design', lastUpdated: new Date().toISOString() },
];

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
  lastSyncedAt: string | null;
  lastChangedAt: string | null;

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
  restoreBackup: (backupInput: string | BackupData, updatedAt?: string) => void;
  resetStore: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: { ...DEFAULT_USER },
      authUser: null,
      isAuthLoading: true,
      skills: [...DEFAULT_SKILLS],
      sessions: [],
      journal: [],
      certificates: [],
      geminiApiKey: '',
      coachMessages: [WELCOME_MSG],
      theme: 'dark',
      lastSyncedAt: null,
      lastChangedAt: new Date().toISOString(),

      getStreak: () => computeStreak(get().sessions),
      getTotalMinutes: () => get().sessions.reduce((acc, s) => acc + s.duration, 0),

      setAuthUser: (authUser) => set({ authUser }),
      setAuthLoading: (loading) => set({ isAuthLoading: loading }),

      updateUser: (data) => {
        const now = new Date().toISOString();
        set((state) => ({ user: { ...state.user, ...data }, lastChangedAt: now }));
        get().syncToCloud();
      },

      addSkill: (skill) => {
        const now = new Date().toISOString();
        set((state) => ({
          skills: [...state.skills, { ...skill, id: crypto.randomUUID(), lastUpdated: now }],
          lastChangedAt: now,
        }));
        get().syncToCloud();
      },

      updateSkill: (id, data) => {
        const now = new Date().toISOString();
        set((state) => ({
          skills: state.skills.map(s => s.id === id ? { ...s, ...data, lastUpdated: now } : s),
          lastChangedAt: now,
        }));
        get().syncToCloud();
      },

      deleteSkill: (id) => {
        const now = new Date().toISOString();
        set((state) => ({ skills: state.skills.filter(s => s.id !== id), lastChangedAt: now }));
        get().syncToCloud();
      },

      addSession: (session) => {
        const now = new Date().toISOString();
        set((state) => ({
          sessions: [{ ...session, id: crypto.randomUUID() }, ...state.sessions],
          lastChangedAt: now,
        }));
        get().syncToCloud();
      },

      deleteSession: (id) => {
        const now = new Date().toISOString();
        set((state) => ({ sessions: state.sessions.filter(s => s.id !== id), lastChangedAt: now }));
        get().syncToCloud();
      },

      addJournalEntry: (entry) => {
        const now = new Date().toISOString();
        set((state) => ({
          journal: [{ ...entry, id: crypto.randomUUID(), date: now }, ...state.journal],
          lastChangedAt: now,
        }));
        get().syncToCloud();
      },

      addCertificate: (cert) => {
        const now = new Date().toISOString();
        set((state) => ({
          certificates: [{ ...cert, id: crypto.randomUUID() }, ...state.certificates],
          lastChangedAt: now,
        }));
        get().syncToCloud();
      },

      deleteCertificate: (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          certificates: state.certificates.filter(c => c.id !== id),
          lastChangedAt: now,
        }));
        get().syncToCloud();
      },

      setGeminiApiKey: (key) => {
        const now = new Date().toISOString();
        set({ geminiApiKey: key, lastChangedAt: now });
        get().syncToCloud();
      },

      addCoachMessage: (msg) => {
        const now = new Date().toISOString();
        set((state) => ({
          coachMessages: [...state.coachMessages, { ...msg, id: crypto.randomUUID(), timestamp: now }],
          lastChangedAt: now,
        }));
        // Don't sync chat to cloud — it's device-local
      },

      clearCoachMessages: () => {
        set({
          coachMessages: [{
            id: 'welcome-reset',
            sender: 'ai',
            text: 'History cleared. Ask me any question or request a personalized study report!',
            timestamp: new Date().toISOString(),
          }],
          lastChangedAt: new Date().toISOString(),
        });
      },

      setTheme: (theme) => set({ theme }),

      resetStore: () => set({
        user: { ...DEFAULT_USER },
        skills: [],
        sessions: [],
        journal: [],
        certificates: [],
        coachMessages: [{ ...WELCOME_MSG, timestamp: new Date().toISOString() }],
        lastSyncedAt: null,
        lastChangedAt: null,
      }),

      // Restore cloud backup into local state — always overwrites local (cloud is source of truth on login)
      restoreBackup: (backupInput, updatedAt) => {
        try {
          if (!backupInput) return;
          const backup: BackupData = typeof backupInput === 'string' ? JSON.parse(backupInput) : backupInput;
          const syncTime = updatedAt || new Date().toISOString();
          set({
            user: { ...DEFAULT_USER, ...(backup.user || {}) },
            skills: Array.isArray(backup.skills) ? backup.skills : [],
            sessions: Array.isArray(backup.sessions) ? backup.sessions : [],
            journal: Array.isArray(backup.journal) ? backup.journal : [],
            certificates: Array.isArray(backup.certificates) ? backup.certificates : [],
            geminiApiKey: typeof backup.geminiApiKey === 'string' ? backup.geminiApiKey : get().geminiApiKey,
            lastSyncedAt: syncTime,
            lastChangedAt: syncTime,
          });
          console.log('[SkillPath] Backup restored from cloud.');
        } catch (e) {
          console.error('[SkillPath] Backup restore failed:', e);
        }
      },

      // Push local state to Supabase user_sync table
      syncToCloud: async () => {
        const { authUser } = get();
        if (!authUser || authUser.isGuest) return; // guests stay local-only

        const now = get().lastChangedAt || new Date().toISOString();
        const payload: BackupData = {
          user: get().user,
          skills: get().skills,
          sessions: get().sessions,
          journal: get().journal,
          certificates: get().certificates,
          geminiApiKey: get().geminiApiKey,
        };

        try {
          const { error } = await supabase
            .from('user_sync')
            .upsert({ user_id: authUser.id, backup_data: payload, updated_at: now }, { onConflict: 'user_id' });

          if (error) {
            console.warn('[SkillPath] user_sync upsert failed:', error.message);
            // Fallback: auth metadata
            await supabase.auth.updateUser({ data: { skillpath_backup: JSON.stringify(payload) } });
          } else {
            set({ lastSyncedAt: now });
            console.log('[SkillPath] Synced to cloud at', now);
          }
        } catch (e) {
          console.error('[SkillPath] syncToCloud error:', e);
        }
      },

      // Pull latest data from Supabase — conflict resolve by timestamp
      loadFromCloud: async () => {
        const { authUser } = get();
        if (!authUser || authUser.isGuest) return;

        try {
          const { data, error } = await supabase
            .from('user_sync')
            .select('backup_data, updated_at')
            .eq('user_id', authUser.id)
            .maybeSingle();

          if (!error && data?.backup_data) {
            const remoteTs = new Date(data.updated_at).getTime();
            const localTs = new Date(get().lastChangedAt || 0).getTime();

            if (remoteTs > localTs) {
              // Cloud is newer → restore it
              get().restoreBackup(data.backup_data as BackupData, data.updated_at);
              console.log('[SkillPath] Loaded newer data from cloud.');
            } else if (localTs > remoteTs) {
              // Local is newer → push to cloud
              console.log('[SkillPath] Local is newer, pushing to cloud.');
              get().syncToCloud();
            } else {
              console.log('[SkillPath] Already in sync.');
            }
            return;
          }

          // No user_sync row yet — try auth metadata as fallback
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (!userError && user?.user_metadata?.skillpath_backup) {
            get().restoreBackup(user.user_metadata.skillpath_backup as string);
            console.log('[SkillPath] Loaded from auth metadata fallback.');
            return;
          }

          // First login ever — push local defaults to cloud
          console.log('[SkillPath] No cloud data found. Uploading initial state.');
          get().syncToCloud();
        } catch (e) {
          console.error('[SkillPath] loadFromCloud error:', e);
        }
      },
    }),
    {
      name: 'skillpath-storage', // localStorage key — persists for both guests and logged-in users
      partialize: (state) => ({
        user: state.user,
        authUser: state.authUser,
        skills: state.skills,
        sessions: state.sessions,
        journal: state.journal,
        certificates: state.certificates,
        geminiApiKey: state.geminiApiKey,
        // Don't persist coachMessages or theme — they're UI-local
        theme: state.theme,
        lastSyncedAt: state.lastSyncedAt,
        lastChangedAt: state.lastChangedAt,
      }),
    }
  )
);
