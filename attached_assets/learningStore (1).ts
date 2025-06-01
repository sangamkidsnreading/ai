import { create } from 'zustand';
import { LearningState } from '../types';
import { useAuthStore } from './authStore';

export const useLearningStore = create<LearningState>((set, get) => ({
  currentDay: 1,
  dayProgress: [],
  userStats: {
    currentLevel: 1,
    totalCoins: 0,
    totalWordsLearned: 0,
    totalSentencesLearned: 0,
    streak: 0,
    badges: [],
  },
  theme: 'light',
  words: [],
  sentences: [],

  // 현재 사용자의 학습 데이터를 가져오는 헬퍼 함수
  getCurrentUserData: () => {
    const authStore = useAuthStore.getState();
    const currentUser = authStore.currentUser;
    
    if (!currentUser) {
      return null;
    }
    
    const user = authStore.getUserById(currentUser.userId);
    return user?.learningData || null;
  },

  // 현재 사용자의 학습 데이터를 업데이트하는 헬퍼 함수
  updateCurrentUserData: (updates: any) => {
    const authStore = useAuthStore.getState();
    const currentUser = authStore.currentUser;
    
    if (!currentUser) return;
    
    const user = authStore.getUserById(currentUser.userId);
    if (!user) return;
    
    const updatedLearningData = {
      ...user.learningData,
      ...updates,
    };
    
    authStore.updateUser(currentUser.userId, {
      learningData: updatedLearningData,
    });
    
    // 로컬 상태도 업데이트
    set(updates);
  },

  // 사용자 데이터 로드
  loadUserData: () => {
    const userData = get().getCurrentUserData();
    if (userData) {
      set({
        currentDay: userData.currentDay,
        dayProgress: userData.dayProgress,
        userStats: userData.userStats,
        words: userData.words,
        sentences: userData.sentences,
      });
    }
  },

  learnWord: (wordId) => {
    const { words, dayProgress, currentDay, userStats } = get();
    
    const updatedWords = words.map(word => 
      word.id === wordId ? { ...word, isLearned: true } : word
    );
    
    const currentDayProgress = dayProgress.find(d => d.day === currentDay) || 
      { day: currentDay, wordsLearned: 0, sentencesLearned: 0, coinsEarned: 0 };
    
    const updatedDayProgress = dayProgress.map(d => 
      d.day === currentDay 
        ? { ...d, wordsLearned: d.wordsLearned + 1, coinsEarned: d.coinsEarned + 1 }
        : d
    );
    
    if (!dayProgress.find(d => d.day === currentDay)) {
      updatedDayProgress.push({
        ...currentDayProgress,
        wordsLearned: 1,
        coinsEarned: 1,
      });
    }
    
    const updatedUserStats = {
      ...userStats,
      totalCoins: userStats.totalCoins + 1,
      totalWordsLearned: userStats.totalWordsLearned + 1,
      currentLevel: Math.floor((userStats.totalCoins + 1) / 100) + 1,
    };
    
    // 뱃지 체크
    const updatedBadges = userStats.badges.map(badge => {
      if (badge.id === '1' && !badge.earned && updatedUserStats.totalWordsLearned >= 1) {
        return { ...badge, earned: true, earnedDate: new Date().toISOString() };
      }
      if (badge.id === '3' && !badge.earned && updatedUserStats.totalWordsLearned >= 100) {
        return { ...badge, earned: true, earnedDate: new Date().toISOString() };
      }
      if (badge.id === '5' && !badge.earned && updatedUserStats.totalCoins >= 1000) {
        return { ...badge, earned: true, earnedDate: new Date().toISOString() };
      }
      return badge;
    });
    
    updatedUserStats.badges = updatedBadges;
    
    const updates = {
      words: updatedWords,
      dayProgress: updatedDayProgress,
      userStats: updatedUserStats,
    };
    
    get().updateCurrentUserData(updates);
  },

  learnSentence: (sentenceId) => {
    const { sentences, dayProgress, currentDay, userStats } = get();
    
    const updatedSentences = sentences.map(sentence => 
      sentence.id === sentenceId ? { ...sentence, isLearned: true } : sentence
    );
    
    const currentDayProgress = dayProgress.find(d => d.day === currentDay) || 
      { day: currentDay, wordsLearned: 0, sentencesLearned: 0, coinsEarned: 0 };
    
    const updatedDayProgress = dayProgress.map(d => 
      d.day === currentDay 
        ? { ...d, sentencesLearned: d.sentencesLearned + 1, coinsEarned: d.coinsEarned + 1 }
        : d
    );
    
    if (!dayProgress.find(d => d.day === currentDay)) {
      updatedDayProgress.push({
        ...currentDayProgress,
        sentencesLearned: 1,
        coinsEarned: 1,
      });
    }
    
    const updatedUserStats = {
      ...userStats,
      totalCoins: userStats.totalCoins + 1,
      totalSentencesLearned: userStats.totalSentencesLearned + 1,
      currentLevel: Math.floor((userStats.totalCoins + 1) / 100) + 1,
    };
    
    // 뱃지 체크
    const updatedBadges = userStats.badges.map(badge => {
      if (badge.id === '4' && !badge.earned && updatedUserStats.totalSentencesLearned >= 50) {
        return { ...badge, earned: true, earnedDate: new Date().toISOString() };
      }
      if (badge.id === '5' && !badge.earned && updatedUserStats.totalCoins >= 1000) {
        return { ...badge, earned: true, earnedDate: new Date().toISOString() };
      }
      return badge;
    });
    
    updatedUserStats.badges = updatedBadges;
    
    const updates = {
      sentences: updatedSentences,
      dayProgress: updatedDayProgress,
      userStats: updatedUserStats,
    };
    
    get().updateCurrentUserData(updates);
  },

  toggleFavorite: (wordId) => {
    const { words } = get();
    const updatedWords = words.map(word => 
      word.id === wordId ? { ...word, isFavorite: !word.isFavorite } : word
    );
    
    const updates = { words: updatedWords };
    get().updateCurrentUserData(updates);
  },

  setTheme: (theme) => {
    set({ theme });
  },
}));

