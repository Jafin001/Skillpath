// Slice: skills, sessions, journal, certificates, user profile
import type { StateCreator } from 'zustand';
import type { AppState } from './useStore';
import type { Skill, Session, JournalEntry, Certificate, UserProfile } from './types';
import { DEFAULT_USER, DEFAULT_SKILLS } from './types';

export interface DataSlice {
  user: UserProfile;
  skills: Skill[];
  sessions: Session[];
  journal: JournalEntry[];
  certificates: Certificate[];
  geminiApiKey: string;
  lastChangedAt: string | null;
  lastSyncedAt: string | null;

  // Computed
  getStreak: () => number;
  getTotalMinutes: () => number;

  updateUser: (data: Partial<UserProfile>) => void;
  addSkill: (skill: Omit<Skill, 'id' | 'lastUpdated'>) => void;
  updateSkill: (id: string, data: Partial<Skill>) => void;
  deleteSkill: (id: string) => void;
  addSession: (session: Omit<Session, 'id'>) => void;
  deleteSession: (id: string) => void;
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'date'>) => void;
  addCertificate: (cert: Omit<Certificate, 'id'>) => void;
  deleteCertificate: (id: string) => void;
  setGeminiApiKey: (key: string) => void;
  resetStore: () => void;
}

function computeStreak(sessions: Session[]): number {
  if (sessions.length === 0) return 0;
  const days = new Set(sessions.map(s => s.date.slice(0, 10)));
  let streak = 0;
  const d = new Date();
  const todayStr = d.toISOString().slice(0, 10);
  d.setDate(d.getDate() - 1);
  const yesterdayStr = d.toISOString().slice(0, 10);
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

export const createDataSlice: StateCreator<AppState, [], [], DataSlice> = (set, get) => ({
  user: { ...DEFAULT_USER },
  skills: [...DEFAULT_SKILLS],
  sessions: [],
  journal: [],
  certificates: [],
  geminiApiKey: '',
  lastChangedAt: new Date().toISOString(),
  lastSyncedAt: null,

  getStreak: () => computeStreak(get().sessions),
  getTotalMinutes: () => get().sessions.reduce((acc, s) => acc + s.duration, 0),

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

  resetStore: () => set({
    user: { ...DEFAULT_USER },
    skills: [],
    sessions: [],
    journal: [],
    certificates: [],
    lastSyncedAt: null,
    lastChangedAt: null,
  }),
});
