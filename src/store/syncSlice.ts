// Slice: Supabase cloud sync — push / pull / restore
import type { StateCreator } from 'zustand';
import type { AppState } from './useStore';
import type { BackupData } from './types';
import { DEFAULT_USER } from './types';
import { supabase } from '../lib/supabase';

export interface SyncSlice {
  syncToCloud: () => Promise<void>;
  loadFromCloud: () => Promise<void>;
  restoreBackup: (backupInput: string | BackupData, updatedAt?: string) => void;
  /** Skip realtime pull briefly after this device pushed to avoid self-echo overwrites */
  ignoreRealtimeUntil: number;
  shouldIgnoreRealtimePull: () => boolean;
}

const REALTIME_ECHO_MS = 3000;

export const createSyncSlice: StateCreator<AppState, [], [], SyncSlice> = (set, get) => ({
  ignoreRealtimeUntil: 0,
  shouldIgnoreRealtimePull: () => Date.now() < get().ignoreRealtimeUntil,

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
  syncToCloud: async () => {
    const { authUser, hasHydrated } = get();
    if (!hasHydrated) {
      console.log('[SkillPath] [Sync] Skip sync: waiting for localStorage rehydration.');
      return;
    }
    if (!authUser || authUser.isGuest) {
      console.log('[SkillPath] [Sync] Skip sync: User not logged in or is guest.', { authUser });
      return;
    }

    const now = get().lastChangedAt || new Date().toISOString();
    const payload: BackupData = {
      user: get().user,
      skills: get().skills,
      sessions: get().sessions,
      journal: get().journal,
      certificates: get().certificates,
      geminiApiKey: get().geminiApiKey,
    };

    console.log('[SkillPath] [Sync] Preparing to push backup to Supabase...', {
      userId: authUser.id,
      timestamp: now,
      skillsCount: payload.skills?.length || 0,
      sessionsCount: payload.sessions?.length || 0,
      journalCount: payload.journal?.length || 0,
      certsCount: payload.certificates?.length || 0,
    });

    try {
      const { error } = await supabase
        .from('user_sync')
        .upsert({ user_id: authUser.id, backup_data: payload, updated_at: now }, { onConflict: 'user_id' });

      if (error) {
        console.error('[SkillPath] [Sync Error] user_sync upsert failed:', error.message, error);
        console.log('[SkillPath] [Sync] Falling back to auth user metadata backup...');
        const { error: authError } = await supabase.auth.updateUser({
          data: { skillpath_backup: JSON.stringify(payload) }
        });
        if (authError) {
          console.error('[SkillPath] [Sync Error] Auth metadata backup fallback failed:', authError.message);
        } else {
          console.log('[SkillPath] [Sync Success] Auth metadata backup fallback completed.');
        }
      } else {
        set({
          lastSyncedAt: now,
          ignoreRealtimeUntil: Date.now() + REALTIME_ECHO_MS,
        });
        console.log('[SkillPath] [Sync Success] Synced successfully to user_sync at:', now);
      }
    } catch (e) {
      console.error('[SkillPath] [Sync Exception] syncToCloud error:', e);
    }
  },

  loadFromCloud: async () => {
    const { authUser, hasHydrated } = get();
    if (!hasHydrated) {
      console.log('[SkillPath] [Sync] Skip load: waiting for localStorage rehydration.');
      return;
    }
    if (!authUser || authUser.isGuest) {
      console.log('[SkillPath] [Sync] Skip load: User not logged in or is guest.', { authUser });
      return;
    }

    console.log('[SkillPath] [Sync] Fetching cloud backup from Supabase...', {
      userId: authUser.id,
      localSkills: get().skills.length,
      localJournal: get().journal.length,
      lastChangedAt: get().lastChangedAt,
    });

    try {
      const { data, error } = await supabase
        .from('user_sync')
        .select('backup_data, updated_at')
        .eq('user_id', authUser.id)
        .maybeSingle();

      if (error) {
        console.error('[SkillPath] [Sync Error] Failed to fetch user_sync:', error.message, error);
      }

      if (!error && data?.backup_data) {
        const remoteTs = new Date(data.updated_at).getTime();
        const localTs = new Date(get().lastChangedAt || 0).getTime();

        console.log('[SkillPath] [Sync Comparison]', {
          remoteTime: data.updated_at,
          remoteTs,
          localTime: get().lastChangedAt || 'none',
          localTs,
        });

        if (remoteTs > localTs) {
          console.log('[SkillPath] [Sync Decision] Cloud is newer. Restoring cloud data...');
          get().restoreBackup(data.backup_data as BackupData, data.updated_at);
        } else if (localTs > remoteTs) {
          console.log('[SkillPath] [Sync Decision] Local is newer. Pushing local changes to cloud...');
          get().syncToCloud();
        } else {
          console.log('[SkillPath] [Sync Decision] Already in sync. No action taken.');
        }
        return;
      }

      console.log('[SkillPath] [Sync Info] No user_sync row found. Checking auth user metadata backup fallback...');

      // Fallback: try auth user_metadata
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('[SkillPath] [Sync Error] Failed to fetch auth user data:', userError.message);
      }

      if (!userError && user?.user_metadata?.skillpath_backup) {
        console.log('[SkillPath] [Sync Info] Found backup in auth user metadata. Restoring...');
        get().restoreBackup(user.user_metadata.skillpath_backup as string);
        return;
      }

      // First login ever — upload initial local state
      console.log('[SkillPath] [Sync Info] No cloud data found anywhere. Uploading initial state...');
      get().syncToCloud();
    } catch (e) {
      console.error('[SkillPath] [Sync Exception] loadFromCloud error:', e);
    }
  },
});
