export interface Word {
  id: string;
  text: string;
  level: number;
  isFavorite: boolean;
  isLearned: boolean;
}

export interface Sentence {
  id: string;
  text: string;
  level: number;
  isLearned: boolean;
}

export interface DayProgress {
  day: number;
  wordsLearned: number;
  sentencesLearned: number;
  coinsEarned: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
}

export interface UserStats {
  currentLevel: number;
  totalCoins: number;
  totalWordsLearned: number;
  totalSentencesLearned: number;
  streak: number;
  badges: Badge[];
}

export interface LearningState {
  currentDay: number;
  dayProgress: DayProgress[];
  userStats: UserStats;
  theme: 'light' | 'dark';
  words: Word[];
  sentences: Sentence[];
  learnWord: (wordId: string) => void;
  learnSentence: (sentenceId: string) => void;
  toggleFavorite: (wordId: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

// 새로운 인증 관련 타입들
export interface User {
  id: string;
  email: string;
  password: string; // 해시화된 비밀번호
  name: string;
  role: 'student' | 'admin';
  avatar: string;
  createdAt: string;
  lastLoginAt: string;
  learningData: {
    currentDay: number;
    dayProgress: DayProgress[];
    userStats: UserStats;
    words: Word[];
    sentences: Sentence[];
  };
}

export interface UserSession {
  userId: string;
  email: string;
  name: string;
  role: 'student' | 'admin';
  avatar: string;
  isAuthenticated: boolean;
}

export interface AuthState {
  currentUser: UserSession | null;
  users: User[];
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<Pick<User, 'name' | 'avatar'>>) => void;
  getAllUsers: () => User[];
  getUserById: (userId: string) => User | null;
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;
}