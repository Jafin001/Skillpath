// Slice: auth user identity + loading state
import type { StateCreator } from 'zustand';
import type { AppState } from './useStore';

export type AuthUser = {
  id: string;
  email: string | undefined;
  name: string;
  avatar: string | undefined;
  isGuest: boolean;
};

export interface AuthSlice {
  authUser: AuthUser | null;
  isAuthLoading: boolean;
  setAuthUser: (authUser: AuthUser | null) => void;
  setAuthLoading: (loading: boolean) => void;
}

export const createAuthSlice: StateCreator<AppState, [], [], AuthSlice> = (set) => ({
  authUser: null,
  isAuthLoading: true,
  setAuthUser: (authUser) => set({ authUser }),
  setAuthLoading: (loading) => set({ isAuthLoading: loading }),
});
