import { create } from 'zustand';
import { generateMockBadges } from '@/lib/utils';

interface Word {
  id: number;
  text: string;
  level: number;
  day: number;
  isLearned: boolean;
  isFavorite: boolean;
}

interface Sentence {
  id: number;
  text: string;
  level: number;
  day: number;
  isLearned: boolean;
}

interface DayProgress {
  day: number;
  wordsLearned: number;
  sentencesLearned: number;
  coinsEarned: number;
  date: string;
}

interface UserStats {
  totalWordsLearned: number;
  totalSentencesLearned: number;
  totalCoins: number;
  currentLevel: number;
  streak: number;
  badges: Array<{
    id: number;
    name: string;
    icon: string;
    earned: boolean;
    description: string;
  }>;
}

interface LearningState {
  words: Word[];
  sentences: Sentence[];
  dayProgress: DayProgress[];
  userStats: UserStats;
  currentDay: number;
  selectedLevel: number;
  selectedDay: number;
  
  loadUserData: () => Promise<void>;
  learnWord: (wordId: number) => Promise<void>;
  learnSentence: (sentenceId: number) => Promise<void>;
  toggleFavorite: (wordId: number) => Promise<void>;
  setWords: (words: Word[]) => void;
  setSentences: (sentences: Sentence[]) => void;
  setSelectedLevel: (level: number) => void;
  setSelectedDay: (day: number) => void;
  getFilteredWords: () => Word[];
  getFilteredSentences: () => Sentence[];
  addCoinsImmediately: (coins: number) => void;
}

export const useLearningStore = create<LearningState>((set, get) => ({
  words: [],
  sentences: [],
  dayProgress: [],
  userStats: {
    totalWordsLearned: 0,
    totalSentencesLearned: 0,
    totalCoins: 0,
    currentLevel: 1,
    streak: 0,
    badges: generateMockBadges(),
  },
  currentDay: 1,
  selectedLevel: 1,
  selectedDay: 1,

  loadUserData: async () => {
    try {
      // Load words
      const wordsResponse = await fetch('/api/words');
      if (wordsResponse.ok) {
        const allWords = await wordsResponse.json();
        
        // Get user progress for words
        const userId = JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.currentUser?.id;
        if (userId) {
          const progressResponse = await fetch(`/api/users/${userId}/progress`);
          if (progressResponse.ok) {
            const userProgress = await progressResponse.json();
            
            const wordsWithProgress = allWords.map((word: any) => {
              const progress = userProgress.find((p: any) => p.wordId === word.id);
              return {
                ...word,
                isLearned: progress?.isLearned || false,
                isFavorite: progress?.isFavorite || false,
              };
            });
            
            set({ words: wordsWithProgress });
          }
        }
      }

      // Load sentences
      const sentencesResponse = await fetch('/api/sentences');
      if (sentencesResponse.ok) {
        const allSentences = await sentencesResponse.json();
        
        const userId = JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.currentUser?.id;
        if (userId) {
          const progressResponse = await fetch(`/api/users/${userId}/progress`);
          if (progressResponse.ok) {
            const userProgress = await progressResponse.json();
            
            const sentencesWithProgress = allSentences.map((sentence: any) => {
              const progress = userProgress.find((p: any) => p.sentenceId === sentence.id);
              return {
                ...sentence,
                isLearned: progress?.isLearned || false,
              };
            });
            
            set({ sentences: sentencesWithProgress });
          }
        }
      }

      // Load user stats and day progress
      const userId = JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.currentUser?.id;
      if (userId) {
        const [statsResponse, dayProgressResponse] = await Promise.all([
          fetch(`/api/users/${userId}/stats`),
          fetch(`/api/users/${userId}/day-progress`)
        ]);

        if (statsResponse.ok) {
          const stats = await statsResponse.json();
          set({ 
            userStats: { 
              ...stats, 
              badges: generateMockBadges() 
            } 
          });
        }

        if (dayProgressResponse.ok) {
          const dayProgress = await dayProgressResponse.json();
          set({ 
            dayProgress,
            currentDay: dayProgress.length > 0 ? Math.max(...dayProgress.map((d: any) => d.day)) : 1
          });
        }
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  },

  learnWord: async (wordId: number) => {
    const userId = JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.currentUser?.id;
    if (!userId) return;

    try {
      const response = await fetch(`/api/users/${userId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wordId,
          isLearned: true,
        }),
      });

      if (response.ok) {
        // Update local state
        set(state => ({
          words: state.words.map(word =>
            word.id === wordId ? { ...word, isLearned: true } : word
          ),
        }));

        // Reload user data to get updated stats
        get().loadUserData();
      }
    } catch (error) {
      console.error('Failed to learn word:', error);
    }
  },

  learnSentence: async (sentenceId: number) => {
    const userId = JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.currentUser?.id;
    if (!userId) return;

    try {
      const response = await fetch(`/api/users/${userId}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sentenceId,
          isLearned: true,
        }),
      });

      if (response.ok) {
        // Update local state
        set(state => ({
          sentences: state.sentences.map(sentence =>
            sentence.id === sentenceId ? { ...sentence, isLearned: true } : sentence
          ),
        }));

        // Reload user data to get updated stats
        get().loadUserData();
      }
    } catch (error) {
      console.error('Failed to learn sentence:', error);
    }
  },

  toggleFavorite: async (wordId: number) => {
    const userId = JSON.parse(localStorage.getItem('auth-storage') || '{}')?.state?.currentUser?.id;
    if (!userId) return;

    try {
      const response = await fetch(`/api/users/${userId}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wordId }),
      });

      if (response.ok) {
        const { isFavorite } = await response.json();
        
        // Update local state
        set(state => ({
          words: state.words.map(word =>
            word.id === wordId ? { ...word, isFavorite } : word
          ),
        }));
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  },

  setWords: (words: Word[]) => set({ words }),
  setSentences: (sentences: Sentence[]) => set({ sentences }),
  
  setSelectedLevel: (level: number) => set({ selectedLevel: level }),
  setSelectedDay: (day: number) => set({ selectedDay: day }),
  
  getFilteredWords: () => {
    const { words, selectedLevel, selectedDay } = get();
    return words.filter(word => 
      (selectedLevel === 0 || word.level === selectedLevel) &&
      (selectedDay === 0 || word.day === selectedDay)
    );
  },
  
  getFilteredSentences: () => {
    const { sentences, selectedLevel, selectedDay } = get();
    return sentences.filter(sentence => 
      (selectedLevel === 0 || sentence.level === selectedLevel) &&
      (selectedDay === 0 || sentence.day === selectedDay)
    );
  },

  addCoinsImmediately: (coins: number) => {
    set(state => ({
      userStats: {
        ...state.userStats,
        totalCoins: state.userStats.totalCoins + coins
      }
    }));
  },
}));
