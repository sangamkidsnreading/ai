import bcrypt from "bcryptjs";
import { db } from "./db";
import { eq } from "drizzle-orm";
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

export class DatabaseStorage implements IStorage {
  constructor() {
    this.seedData();
  }

  private async seedData() {
    try {
      // Check if admin user already exists
      const existingAdmin = await this.getUserByEmail("admin@kiriboka.com");
      if (!existingAdmin) {
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
    } catch (error) {
      console.log("Seed data already exists or database not ready yet");
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        password: hashedPassword,
      })
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const updateData = { ...updates };
    if (updates.password) {
      updateData.password = await bcrypt.hash(updates.password, 10);
    }
    
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount > 0;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Word methods
  async getAllWords(): Promise<Word[]> {
    return await db.select().from(words);
  }

  async getWord(id: number): Promise<Word | undefined> {
    const [word] = await db.select().from(words).where(eq(words.id, id));
    return word || undefined;
  }

  async createWord(insertWord: InsertWord): Promise<Word> {
    const [word] = await db
      .insert(words)
      .values(insertWord)
      .returning();
    return word;
  }

  async updateWord(id: number, updates: Partial<InsertWord>): Promise<Word | undefined> {
    const [word] = await db
      .update(words)
      .set(updates)
      .where(eq(words.id, id))
      .returning();
    return word || undefined;
  }

  async deleteWord(id: number): Promise<boolean> {
    const result = await db.delete(words).where(eq(words.id, id));
    return result.rowCount > 0;
  }

  // Sentence methods
  async getAllSentences(): Promise<Sentence[]> {
    return await db.select().from(sentences);
  }

  async getSentence(id: number): Promise<Sentence | undefined> {
    const [sentence] = await db.select().from(sentences).where(eq(sentences.id, id));
    return sentence || undefined;
  }

  async createSentence(insertSentence: InsertSentence): Promise<Sentence> {
    const [sentence] = await db
      .insert(sentences)
      .values(insertSentence)
      .returning();
    return sentence;
  }

  async updateSentence(id: number, updates: Partial<InsertSentence>): Promise<Sentence | undefined> {
    const [sentence] = await db
      .update(sentences)
      .set(updates)
      .where(eq(sentences.id, id))
      .returning();
    return sentence || undefined;
  }

  async deleteSentence(id: number): Promise<boolean> {
    const result = await db.delete(sentences).where(eq(sentences.id, id));
    return result.rowCount > 0;
  }

  // User progress methods
  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return await db.select().from(userProgress).where(eq(userProgress.userId, userId));
  }

  async updateUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    // Try to find existing progress
    const existing = await db.select().from(userProgress).where(
      eq(userProgress.userId, insertProgress.userId)
    );

    const matchingProgress = existing.find(p => 
      p.wordId === (insertProgress.wordId || null) && 
      p.sentenceId === (insertProgress.sentenceId || null)
    );

    if (matchingProgress) {
      const [updated] = await db
        .update(userProgress)
        .set(insertProgress)
        .where(eq(userProgress.id, matchingProgress.id))
        .returning();
      return updated;
    } else {
      const [progress] = await db
        .insert(userProgress)
        .values(insertProgress)
        .returning();
      return progress;
    }
  }

  async toggleFavorite(userId: number, wordId?: number, sentenceId?: number): Promise<boolean> {
    const existing = await db.select().from(userProgress).where(
      eq(userProgress.userId, userId)
    );

    const matchingProgress = existing.find(p => 
      p.wordId === (wordId || null) && 
      p.sentenceId === (sentenceId || null)
    );

    if (matchingProgress) {
      const [updated] = await db
        .update(userProgress)
        .set({ isFavorite: !matchingProgress.isFavorite })
        .where(eq(userProgress.id, matchingProgress.id))
        .returning();
      return updated.isFavorite;
    } else {
      const [progress] = await db
        .insert(userProgress)
        .values({
          userId,
          wordId: wordId || null,
          sentenceId: sentenceId || null,
          isLearned: false,
          isFavorite: true,
          learnedAt: null,
        })
        .returning();
      return progress.isFavorite;
    }
  }

  // Day progress methods
  async getDayProgress(userId: number): Promise<DayProgress[]> {
    return await db.select().from(dayProgress).where(eq(dayProgress.userId, userId));
  }

  async updateDayProgress(insertProgress: InsertDayProgress): Promise<DayProgress> {
    const existing = await db.select().from(dayProgress).where(
      eq(dayProgress.userId, insertProgress.userId)
    );

    const matchingProgress = existing.find(p => p.day === insertProgress.day);

    if (matchingProgress) {
      const [updated] = await db
        .update(dayProgress)
        .set(insertProgress)
        .where(eq(dayProgress.id, matchingProgress.id))
        .returning();
      return updated;
    } else {
      const [progress] = await db
        .insert(dayProgress)
        .values(insertProgress)
        .returning();
      return progress;
    }
  }

  // User stats methods
  async getUserStats(userId: number): Promise<UserStats | undefined> {
    const [stats] = await db.select().from(userStats).where(eq(userStats.userId, userId));
    return stats || undefined;
  }

  async updateUserStats(userId: number, updates: Partial<InsertUserStats>): Promise<UserStats> {
    const existing = await this.getUserStats(userId);
    
    if (existing) {
      const [updated] = await db
        .update(userStats)
        .set(updates)
        .where(eq(userStats.userId, userId))
        .returning();
      return updated;
    } else {
      const [stats] = await db
        .insert(userStats)
        .values({
          userId,
          totalWordsLearned: 0,
          totalSentencesLearned: 0,
          totalCoins: 0,
          currentLevel: 1,
          streak: 0,
          lastLoginDate: new Date().toISOString().split('T')[0],
          ...updates,
        })
        .returning();
      return stats;
    }
  }
}

export const storage = new DatabaseStorage();