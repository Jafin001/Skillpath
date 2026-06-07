// Slice: coach messages (device-local, not synced to cloud)
import type { StateCreator } from 'zustand';
import type { AppState } from './useStore';
import type { ChatMessage } from './types';
import { WELCOME_MSG } from './types';

export interface CoachSlice {
  coachMessages: ChatMessage[];
  addCoachMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearCoachMessages: () => void;
}

export const createCoachSlice: StateCreator<AppState, [], [], CoachSlice> = (set) => ({
  coachMessages: [WELCOME_MSG],

  addCoachMessage: (msg) => {
    set((state) => ({
      coachMessages: [
        ...state.coachMessages,
        { ...msg, id: crypto.randomUUID(), timestamp: new Date().toISOString() },
      ],
    }));
    // Intentionally NOT synced to cloud — chat history is device-local
  },

  clearCoachMessages: () => {
    set({
      coachMessages: [{
        id: `welcome-${Date.now()}`,
        sender: 'ai',
        text: 'History cleared. Ask me any question or request a personalized study report!',
        timestamp: new Date().toISOString(),
      }],
    });
  },
});
