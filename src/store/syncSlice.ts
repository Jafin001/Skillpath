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
}

export const createSyncSlice: StateCreator<AppState, [], [], SyncSlice> = (set, get) => ({
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
    const { authUser } = get();
    if (!authUser || authUser.isGuest) return;

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
        await supabase.auth.updateUser({ data: { skillpath_backup: JSON.stringify(payload) } });
      } else {
        set({ lastSyncedAt: now });
        console.log('[SkillPath] Synced to cloud at', now);
      }
    } catch (e) {
      console.error('[SkillPath] syncToCloud error:', e);
    }
  },

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
          get().restoreBackup(data.backup_data as BackupData, data.updated_at);
          console.log('[SkillPath] Loaded newer data from cloud.');
        } else if (localTs > remoteTs) {
          console.log('[SkillPath] Local is newer, pushing to cloud.');
          get().syncToCloud();
        } else {
          console.log('[SkillPath] Already in sync.');
        }
        return;
      }

      // Fallback: try auth user_metadata
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (!userError && user?.user_metadata?.skillpath_backup) {
        get().restoreBackup(user.user_metadata.skillpath_backup as string);
        console.log('[SkillPath] Loaded from auth metadata fallback.');
        return;
      }

      // First login ever — upload initial local state
      console.log('[SkillPath] No cloud data found. Uploading initial state.');
      get().syncToCloud();
    } catch (e) {
      console.error('[SkillPath] loadFromCloud error:', e);
    }
  },
});
