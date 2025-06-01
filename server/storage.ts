import bcrypt from "bcryptjs";
import {
  users,
  words,
  sentences,
  userProgress,
  dayProgress,
  userStats,
  type User,
  type InsertUser,
  type Word,
  type InsertWord,
  type Sentence,
  type InsertSentence,
  type UserProgress,
  type InsertUserProgress,
  type DayProgress,
  type InsertDayProgress,
  type UserStats,
  type InsertUserStats,
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;

  // Word methods
  getAllWords(): Promise<Word[]>;
  getWord(id: number): Promise<Word | undefined>;
  createWord(word: InsertWord): Promise<Word>;
  updateWord(id: number, updates: Partial<InsertWord>): Promise<Word | undefined>;
  deleteWord(id: number): Promise<boolean>;

  // Sentence methods
  getAllSentences(): Promise<Sentence[]>;
  getSentence(id: number): Promise<Sentence | undefined>;
  createSentence(sentence: InsertSentence): Promise<Sentence>;
  updateSentence(id: number, updates: Partial<InsertSentence>): Promise<Sentence | undefined>;
  deleteSentence(id: number): Promise<boolean>;

  // User progress methods
  getUserProgress(userId: number): Promise<UserProgress[]>;
  updateUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  toggleFavorite(userId: number, wordId?: number, sentenceId?: number): Promise<boolean>;

  // Day progress methods
  getDayProgress(userId: number): Promise<DayProgress[]>;
  updateDayProgress(progress: InsertDayProgress): Promise<DayProgress>;

  // User stats methods
  getUserStats(userId: number): Promise<UserStats | undefined>;
  updateUserStats(userId: number, updates: Partial<InsertUserStats>): Promise<UserStats>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private words: Map<number, Word> = new Map();
  private sentences: Map<number, Sentence> = new Map();
  private userProgress: Map<string, UserProgress> = new Map();
  private dayProgress: Map<string, DayProgress> = new Map();
  private userStats: Map<number, UserStats> = new Map();
  private currentUserId = 1;
  private currentWordId = 1;
  private currentSentenceId = 1;
  private currentProgressId = 1;
  private currentDayProgressId = 1;
  private currentStatsId = 1;

  constructor() {
    this.seedData();
  }

  private async seedData() {
    // Create admin user
    const adminUser = await this.createUser({
      username: "admin",
      email: "admin@kiriboka.com",
      password: "admin123",
      role: "admin",
      name: "관리자",
    });

    // Create sample student
    const studentUser = await this.createUser({
      username: "student",
      email: "student@kiriboka.com",
      password: "student123",
      role: "student",
      name: "김학습자",
    });

    // Create sample words
    const sampleWords = [
      { text: "I", level: 1 },
      { text: "am", level: 1 },
      { text: "big", level: 1 },
      { text: "and", level: 1 },
      { text: "fast", level: 1 },
      { text: "we", level: 1 },
      { text: "are", level: 1 },
      { text: "tall", level: 1 },
      { text: "you", level: 2 },
      { text: "they", level: 2 },
    ];

    for (const word of sampleWords) {
      await this.createWord(word);
    }

    // Create sample sentences
    const sampleSentences = [
      { text: "I am big.", level: 1 },
      { text: "We are tall.", level: 1 },
      { text: "I am big and fast.", level: 1 },
      { text: "You are smart.", level: 2 },
      { text: "They are kind.", level: 2 },
    ];

    for (const sentence of sampleSentences) {
      await this.createSentence(sentence);
    }

    // Initialize user stats for student
    await this.updateUserStats(studentUser.id, {
      userId: studentUser.id,
      totalWordsLearned: 5,
      totalSentencesLearned: 2,
      totalCoins: 7,
      currentLevel: 1,
      streak: 1,
      lastLoginDate: new Date().toISOString().split('T')[0],
    });

    // Initialize day progress for student
    await this.updateDayProgress({
      userId: studentUser.id,
      day: 1,
      wordsLearned: 5,
      sentencesLearned: 2,
      coinsEarned: 7,
      date: new Date().toISOString().split('T')[0],
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      password: hashedPassword,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates };
    if (updates.password) {
      updatedUser.password = await bcrypt.hash(updates.password, 10);
    }
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Word methods
  async getAllWords(): Promise<Word[]> {
    return Array.from(this.words.values());
  }

  async getWord(id: number): Promise<Word | undefined> {
    return this.words.get(id);
  }

  async createWord(insertWord: InsertWord): Promise<Word> {
    const id = this.currentWordId++;
    const word: Word = {
      ...insertWord,
      id,
      createdAt: new Date(),
    };
    this.words.set(id, word);
    return word;
  }

  async updateWord(id: number, updates: Partial<InsertWord>): Promise<Word | undefined> {
    const word = this.words.get(id);
    if (!word) return undefined;

    const updatedWord = { ...word, ...updates };
    this.words.set(id, updatedWord);
    return updatedWord;
  }

  async deleteWord(id: number): Promise<boolean> {
    return this.words.delete(id);
  }

  // Sentence methods
  async getAllSentences(): Promise<Sentence[]> {
    return Array.from(this.sentences.values());
  }

  async getSentence(id: number): Promise<Sentence | undefined> {
    return this.sentences.get(id);
  }

  async createSentence(insertSentence: InsertSentence): Promise<Sentence> {
    const id = this.currentSentenceId++;
    const sentence: Sentence = {
      ...insertSentence,
      id,
      createdAt: new Date(),
    };
    this.sentences.set(id, sentence);
    return sentence;
  }

  async updateSentence(id: number, updates: Partial<InsertSentence>): Promise<Sentence | undefined> {
    const sentence = this.sentences.get(id);
    if (!sentence) return undefined;

    const updatedSentence = { ...sentence, ...updates };
    this.sentences.set(id, updatedSentence);
    return updatedSentence;
  }

  async deleteSentence(id: number): Promise<boolean> {
    return this.sentences.delete(id);
  }

  // User progress methods
  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values()).filter(p => p.userId === userId);
  }

  async updateUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const key = `${insertProgress.userId}-${insertProgress.wordId || 0}-${insertProgress.sentenceId || 0}`;
    const existing = this.userProgress.get(key);
    
    if (existing) {
      const updated = { ...existing, ...insertProgress };
      this.userProgress.set(key, updated);
      return updated;
    } else {
      const id = this.currentProgressId++;
      const progress: UserProgress = {
        ...insertProgress,
        id,
      };
      this.userProgress.set(key, progress);
      return progress;
    }
  }

  async toggleFavorite(userId: number, wordId?: number, sentenceId?: number): Promise<boolean> {
    const key = `${userId}-${wordId || 0}-${sentenceId || 0}`;
    const existing = this.userProgress.get(key);
    
    if (existing) {
      existing.isFavorite = !existing.isFavorite;
      this.userProgress.set(key, existing);
      return existing.isFavorite;
    } else {
      const id = this.currentProgressId++;
      const progress: UserProgress = {
        id,
        userId,
        wordId: wordId || null,
        sentenceId: sentenceId || null,
        isLearned: false,
        isFavorite: true,
        learnedAt: null,
      };
      this.userProgress.set(key, progress);
      return true;
    }
  }

  // Day progress methods
  async getDayProgress(userId: number): Promise<DayProgress[]> {
    return Array.from(this.dayProgress.values()).filter(p => p.userId === userId);
  }

  async updateDayProgress(insertProgress: InsertDayProgress): Promise<DayProgress> {
    const key = `${insertProgress.userId}-${insertProgress.day}`;
    const existing = this.dayProgress.get(key);
    
    if (existing) {
      const updated = { ...existing, ...insertProgress };
      this.dayProgress.set(key, updated);
      return updated;
    } else {
      const id = this.currentDayProgressId++;
      const progress: DayProgress = {
        ...insertProgress,
        id,
      };
      this.dayProgress.set(key, progress);
      return progress;
    }
  }

  // User stats methods
  async getUserStats(userId: number): Promise<UserStats | undefined> {
    return this.userStats.get(userId);
  }

  async updateUserStats(userId: number, updates: Partial<InsertUserStats>): Promise<UserStats> {
    const existing = this.userStats.get(userId);
    
    if (existing) {
      const updated = { ...existing, ...updates };
      this.userStats.set(userId, updated);
      return updated;
    } else {
      const id = this.currentStatsId++;
      const stats: UserStats = {
        id,
        userId,
        totalWordsLearned: 0,
        totalSentencesLearned: 0,
        totalCoins: 0,
        currentLevel: 1,
        streak: 0,
        lastLoginDate: null,
        ...updates,
      };
      this.userStats.set(userId, stats);
      return stats;
    }
  }
}

export const storage = new MemStorage();
