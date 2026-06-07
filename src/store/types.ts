// ── Shared types used across all store slices ─────────────────────────────────

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
  date: string;     // ISO string
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
  fileUrl: string;
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

// Shape of data stored in Supabase / backup
export interface BackupData {
  user?: Partial<UserProfile>;
  skills?: Skill[];
  sessions?: Session[];
  journal?: JournalEntry[];
  certificates?: Certificate[];
  geminiApiKey?: string;
}

export const DEFAULT_USER: UserProfile = {
  name: '',
  bio: 'Self-taught developer building skills one session at a time.',
  learningGoals: ['Master React', 'Learn System Design', 'Build 5 side projects'],
};

export const DEFAULT_SKILLS: Skill[] = [
  { id: '1', name: 'React', level: 'Intermediate', progress: 60, category: 'Frontend', lastUpdated: new Date().toISOString() },
  { id: '2', name: 'Node.js', level: 'Beginner', progress: 30, category: 'Backend', lastUpdated: new Date().toISOString() },
  { id: '3', name: 'UI/UX Design', level: 'Beginner', progress: 45, category: 'Design', lastUpdated: new Date().toISOString() },
];

export const WELCOME_MSG: ChatMessage = {
  id: 'welcome',
  sender: 'ai',
  text: 'Hi there! I am your SkillPath AI Learning Coach. 🧠\n\nI can analyze your logged skills, study sessions, and journal entries to give you personalized learning plans, productivity strategies, and feedback.\n\nAsk me any question now to get started!',
  timestamp: new Date().toISOString(),
};
