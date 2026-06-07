/**
 * useStore.ts — root store
 *
 * Combines all slices into a single Zustand store with localStorage persistence.
 * Each slice owns its own state shape and actions.
 *
 * Slices:
 *  authSlice  — auth identity & loading flag
 *  dataSlice  — skills / sessions / journal / certificates / profile
 *  coachSlice — chat messages (device-local, never synced)
 *  syncSlice  — Supabase cloud push / pull / restore
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createAuthSlice, type AuthSlice, type AuthUser } from './authSlice';
import { createDataSlice, type DataSlice } from './dataSlice';
import { createCoachSlice, type CoachSlice } from './coachSlice';
import { createSyncSlice, type SyncSlice } from './syncSlice';

// Re-export all types so consumers import from one place
export type { AuthUser };
export type { Skill, Session, JournalEntry, Certificate, UserProfile, ChatMessage, BackupData } from './types';

export type AppState = AuthSlice & DataSlice & CoachSlice & SyncSlice & {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
};

export const useStore = create<AppState>()(
  persist(
    (...a) => ({
      ...createAuthSlice(...a),
      ...createDataSlice(...a),
      ...createCoachSlice(...a),
      ...createSyncSlice(...a),

      theme: 'dark' as const,
      setTheme: (theme) => a[0]({ theme }),
    }),
    {
      name: 'skillpath-storage',
      // Only persist data that must survive page refresh
      partialize: (state) => ({
        authUser: state.authUser,
        theme: state.theme,
        user: state.user,
        skills: state.skills,
        sessions: state.sessions,
        journal: state.journal,
        certificates: state.certificates,
        geminiApiKey: state.geminiApiKey,
        lastSyncedAt: state.lastSyncedAt,
        lastChangedAt: state.lastChangedAt,
        // coachMessages intentionally NOT persisted (device-local UI state)
      }),
    }
  )
);
