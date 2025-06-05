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

  // Leaderboard methods
  getLeaderboard(): Promise<Array<{
    userId: number;
    username: string;
    name: string;
    totalCoins: number;
    totalWordsLearned: number;
    totalSentencesLearned: number;
    rank: number;
  }>>;
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

        // Create sample words for 10 levels
        const sampleWords = [
          // Level 1 - Basic words
          { text: "I", level: 1, day: 1 },
          { text: "am", level: 1, day: 1 },
          { text: "big", level: 1, day: 1 },
          { text: "and", level: 1, day: 1 },
          { text: "fast", level: 1, day: 1 },
          { text: "we", level: 1, day: 1 },
          { text: "are", level: 1, day: 1 },
          { text: "tall", level: 1, day: 1 },
          { text: "small", level: 1, day: 1 },
          { text: "good", level: 1, day: 1 },
          
          // Level 2
          { text: "you", level: 2, day: 1 },
          { text: "they", level: 2, day: 1 },
          { text: "have", level: 2, day: 1 },
          { text: "book", level: 2, day: 1 },
          { text: "house", level: 2, day: 1 },
          { text: "water", level: 2, day: 1 },
          { text: "food", level: 2, day: 1 },
          { text: "love", level: 2, day: 1 },
          { text: "happy", level: 2, day: 1 },
          { text: "friend", level: 2, day: 1 },
          
          // Level 3
          { text: "beautiful", level: 3, day: 1 },
          { text: "important", level: 3, day: 1 },
          { text: "different", level: 3, day: 1 },
          { text: "difficult", level: 3, day: 1 },
          { text: "interesting", level: 3, day: 1 },
          { text: "wonderful", level: 3, day: 1 },
          { text: "exciting", level: 3, day: 1 },
          { text: "comfortable", level: 3, day: 1 },
          { text: "successful", level: 3, day: 1 },
          { text: "experience", level: 3, day: 1 },
          
          // Level 4
          { text: "opportunity", level: 4, day: 1 },
          { text: "challenge", level: 4, day: 1 },
          { text: "responsibility", level: 4, day: 1 },
          { text: "development", level: 4, day: 1 },
          { text: "environment", level: 4, day: 1 },
          { text: "international", level: 4, day: 1 },
          { text: "communication", level: 4, day: 1 },
          { text: "investigation", level: 4, day: 1 },
          { text: "relationship", level: 4, day: 1 },
          { text: "understanding", level: 4, day: 1 },
          
          // Level 5
          { text: "achievement", level: 5, day: 1 },
          { text: "accomplishment", level: 5, day: 1 },
          { text: "organization", level: 5, day: 1 },
          { text: "recommendation", level: 5, day: 1 },
          { text: "concentration", level: 5, day: 1 },
          { text: "consideration", level: 5, day: 1 },
          { text: "transformation", level: 5, day: 1 },
          { text: "demonstration", level: 5, day: 1 },
          { text: "administration", level: 5, day: 1 },
          { text: "determination", level: 5, day: 1 },
          
          // Level 6
          { text: "philosophical", level: 6, day: 1 },
          { text: "psychological", level: 6, day: 1 },
          { text: "technological", level: 6, day: 1 },
          { text: "anthropological", level: 6, day: 1 },
          { text: "meteorological", level: 6, day: 1 },
          { text: "chronological", level: 6, day: 1 },
          { text: "archaeological", level: 6, day: 1 },
          { text: "physiological", level: 6, day: 1 },
          { text: "neurological", level: 6, day: 1 },
          { text: "sociological", level: 6, day: 1 },
          
          // Level 7
          { text: "incomprehensible", level: 7, day: 1 },
          { text: "indispensable", level: 7, day: 1 },
          { text: "irresponsible", level: 7, day: 1 },
          { text: "incontrovertible", level: 7, day: 1 },
          { text: "uncharacteristic", level: 7, day: 1 },
          { text: "unconventional", level: 7, day: 1 },
          { text: "interdisciplinary", level: 7, day: 1 },
          { text: "counterproductive", level: 7, day: 1 },
          { text: "unapproachable", level: 7, day: 1 },
          { text: "unprecedented", level: 7, day: 1 },
          
          // Level 8
          { text: "transcendentalism", level: 8, day: 1 },
          { text: "phenomenological", level: 8, day: 1 },
          { text: "epistemological", level: 8, day: 1 },
          { text: "jurisprudential", level: 8, day: 1 },
          { text: "institutionalization", level: 8, day: 1 },
          { text: "compartmentalization", level: 8, day: 1 },
          { text: "antiestablishment", level: 8, day: 1 },
          { text: "extraterrestrial", level: 8, day: 1 },
          { text: "intergovernmental", level: 8, day: 1 },
          { text: "interconnectedness", level: 8, day: 1 },
          
          // Level 9
          { text: "pseudointellectual", level: 9, day: 1 },
          { text: "counterrevolutionary", level: 9, day: 1 },
          { text: "antidisestablishmentarian", level: 9, day: 1 },
          { text: "pneumonoultramicroscopic", level: 9, day: 1 },
          { text: "floccinaucinihilipilification", level: 9, day: 1 },
          { text: "supercalifragilisticexpialidocious", level: 9, day: 1 },
          { text: "hippopotomonstrosesquippedaliophobia", level: 9, day: 1 },
          { text: "antidisestablishmentarianism", level: 9, day: 1 },
          { text: "pseudopseudohypoparathyroidism", level: 9, day: 1 },
          { text: "immunoelectrophoresis", level: 9, day: 1 },
          
          // Level 10
          { text: "pneumonoultramicroscopicsilicovolcanoconiosislike", level: 10, day: 1 },
          { text: "methionylthreonylthreonylglutaminylarginyl", level: 10, day: 1 },
          { text: "lopadotemachoselachogaleokranioleipsanodrimhypotrimmatosilphioparaomelitokatakechymenokichlepikossyphophattoperisteralektryonoptekephalliokigklopeleiolagoiosiraiobaphetraganopterygon", level: 10, day: 1 },
          { text: "acetylseryltyrosylserylisoleucylthreonylserylprolylserylglutaminylphenylalanylvalylphenylalanylleucylserylserylvalyltryptophylalanylaspartylprolylisoleucylglutamylleucylleucylasparaginylvalylcysteinylthreonylserylserylleucylglycylasparaginylglutaminylphenylalanylglutaminylthreonylglutaminylglutaminylalanylarginylthreonylthreonylglutaminylvalylglutaminylglutaminylphenylalanylserylglutaminylvalyltryptophyllysylprolylphenylalanylprolylglutaminylserylthreonylvalylarginylphenylalanylprolylglycylaspartylvalyltyrosyllysylvalyltyrosylarginyltyrosylasparaginylalanylvalylleucylaspartylprolylleucylisoleucylthreonylalanylleucylleucylglycylthreonylphenylalanylaspartylthreonylarginylasparaginylarginylisoleucylisoleucylglutamylvalylglutamylasparaginylglutaminylglutaminylserylprolylthreonylthreonylalanylglutamylthreonylleucylaspartylalanylthreonylarginylarginylvalylaspartylaspartylalanylthreonylvalylalanylisoleucylarginylserylalanylasparaginylisoleucylasparaginylleucylvalylasparaginylglutamylleucylvalylarginylglycylthreonylglycylleucyltyrosylasparaginylglutaminylasparaginylthreonylphenylalanylglutamylserylmethionylserylglycylleucylvalyltryptophylthreonylserylalanylprolylalanyltitinmethionylglutaminylarginyltyrosylglutamylserylleucylphenylalanylalanylisoleucylcysteinylprolylprolylaspartylalanylaspartylaspartylaspartylleucylleucylarginylglutaminylisoleucylalanylseryltyrosylglycylarginylglycyltyrosylthreonyltyrosylleucylleucylserylarginylalanylglycylvalylthreonylglycylalanylglutamylasparaginylarginylalanylalanylleucylprolylleucylasparaginylhistidylleucylvalylalanyllysylleucyllysylglutamyltyrosylasparaginylalanylalanylprolylprolylleucylglutaminylglycylphenylalanylglycylisoleucylserylalanylprolylaspartylglutaminylvalyllysylalanylalanylisoleucylaspartylalanylglycylalanylalanylglycylalanylisoleucylserylglycylserylalanylisoleucylvalyllysylisoleucylisoleucylglutamylglutaminylhistidylasparaginylisoleucylglutamylprolylglutamyllysylmethionylleucylalanylalanylleucyllysylvalylphenylalanylvalylglutaminylprolylmethionyllysylalanylalanylthreonylarginylacetylseryltyrosylserylisoleucylthreonylserylprolylserylglutaminylphenylalanylvalylphenylalanylleucylserylserylvalyltryptophylalanylaspartylprolylisoleucylglutamylleucylleucylasparaginylvalylcysteinylthreonylserylserylleucylglycylasparaginylglutaminylphenylalanylglutaminylthreonylglutaminylglutaminylalanylarginylthreonylthreonylglutaminylvalylglutaminylglutaminylphenylalanylserylglutaminylvalyltryptophyllysylprolylphenylalanylprolylglutaminylserylthreonylvalylarginylphenylalanylprolylglycylaspartylvalyltyrosyllysylvalyltyrosylarginyltyrosylasparaginylalanylvalylleucylaspartylprolylleucylisoleucylthreonylalanylleucylleucylglycylthreonylphenylalanylaspartylthreonylarginylasparaginylarginylisoleucylisoleucylglutamylvalylglutamylasparaginylglutaminylglutaminylserylprolylthreonylthreonylalanylglutamylthreonylleucylaspartylalanylthreonylarginylarginylvalylaspartylaspartylalanylthreonylvalylalanylisoleucylarginylserylalanylasparaginylisoleucylasparaginylleucylvalylasparaginylglutamylleucylvalylarginylglycylthreonylglycylleucyltyrosylasparaginylglutaminylasparaginylthreonylphenylalanylglutamylserylmethionylserylglycylleucylvalyltryptophylthreonylserylalanylprolylalanyltitinmethionylglutaminylarginyltyrosylglutamylserylleucylphenylalanylalanylisoleucylcysteinylprolylprolylaspartylalanylaspartylaspartylaspartylleucylleucylarginylglutaminylisoleucylalanylseryltyrosylglycylarginylglycyltyrosylthreonyltyrosylleucylleucylserylarginylalanylglycylvalylthreonylglycylalanylglutamylasparaginylarginylalanylalanylleucylprolylleucylasparaginylhistidylleucylvalylalanyllysylleucyllysylglutamyltyrosylasparaginylalanylalanylprolylprolylleucylglutaminylglycylphenylalanylglycylisoleucylserylalanylprolylaspartylglutaminylvalyllysylalanylalanylisoleucylaspartylalanylglycylalanylalanylglycylalanylisoleucylserylglycylserylalanylisoleucylvalyllysylisoleucylisoleucylglutamylglutaminylhistidylasparaginylisoleucylglutamylprolylglutamyllysylmethionylleucylalanylalanylleucyllysylvalylphenylalanylvalylglutaminylprolylmethionyllysylalanylalanylthreonylarginylserine", level: 10, day: 1 },
          { text: "supercalifragilisticexpialidociously", level: 10, day: 1 },
          { text: "antipsychopharmacological", level: 10, day: 1 },
          { text: "microspectrophotometrically", level: 10, day: 1 },
          { text: "tetraiodophenolphthalein", level: 10, day: 1 },
          { text: "spectrophotometrically", level: 10, day: 1 },
          { text: "electroencephalograph", level: 10, day: 1 },
        ];

        for (const word of sampleWords) {
          await this.createWord(word);
        }

        // Create sample sentences for 10 levels
        const sampleSentences = [
          // Level 1
          { text: "I am big.", level: 1, day: 1 },
          { text: "We are tall.", level: 1, day: 1 },
          { text: "I am big and fast.", level: 1, day: 1 },
          { text: "You are good.", level: 1, day: 1 },
          { text: "They are small.", level: 1, day: 1 },
          
          // Level 2
          { text: "You are smart.", level: 2, day: 1 },
          { text: "They are kind.", level: 2, day: 1 },
          { text: "I have a book.", level: 2, day: 1 },
          { text: "We love our friends.", level: 2, day: 1 },
          { text: "The house is big.", level: 2, day: 1 },
          
          // Level 3
          { text: "This is a beautiful day.", level: 3, day: 1 },
          { text: "Learning is very important.", level: 3, day: 1 },
          { text: "Everyone has different experiences.", level: 3, day: 1 },
          { text: "The journey was wonderful.", level: 3, day: 1 },
          { text: "Success requires determination.", level: 3, day: 1 },
          
          // Level 4
          { text: "Every opportunity brings new challenges.", level: 4, day: 1 },
          { text: "Environmental responsibility is crucial.", level: 4, day: 1 },
          { text: "International communication requires understanding.", level: 4, day: 1 },
          { text: "Personal development takes time.", level: 4, day: 1 },
          { text: "Building relationships requires effort.", level: 4, day: 1 },
          
          // Level 5
          { text: "Achievement requires determination and concentration.", level: 5, day: 1 },
          { text: "Organizational transformation needs careful consideration.", level: 5, day: 1 },
          { text: "Academic accomplishment demands dedication.", level: 5, day: 1 },
          { text: "Administrative demonstration proves effectiveness.", level: 5, day: 1 },
          { text: "Professional recommendation indicates excellence.", level: 5, day: 1 },
          
          // Level 6
          { text: "Philosophical understanding requires psychological insight.", level: 6, day: 1 },
          { text: "Technological advancement shapes sociological patterns.", level: 6, day: 1 },
          { text: "Archaeological discoveries reveal chronological sequences.", level: 6, day: 1 },
          { text: "Neurological research advances physiological knowledge.", level: 6, day: 1 },
          { text: "Anthropological studies explore meteorological influences.", level: 6, day: 1 },
          
          // Level 7
          { text: "Incomprehensible situations require unconventional approaches.", level: 7, day: 1 },
          { text: "Interdisciplinary research proves indispensable for progress.", level: 7, day: 1 },
          { text: "Uncharacteristic behavior seems counterproductive.", level: 7, day: 1 },
          { text: "Unprecedented challenges demand unapproachable solutions.", level: 7, day: 1 },
          { text: "Incontrovertible evidence supports irresponsible conclusions.", level: 7, day: 1 },
          
          // Level 8
          { text: "Transcendentalism influences epistemological frameworks significantly.", level: 8, day: 1 },
          { text: "Phenomenological approaches enhance jurisprudential understanding.", level: 8, day: 1 },
          { text: "Institutionalization prevents compartmentalization of knowledge.", level: 8, day: 1 },
          { text: "Antiestablishment movements challenge intergovernmental cooperation.", level: 8, day: 1 },
          { text: "Extraterrestrial research explores interconnectedness systematically.", level: 8, day: 1 },
          
          // Level 9
          { text: "Pseudointellectual counterrevolutionary movements challenge established paradigms.", level: 9, day: 1 },
          { text: "Antidisestablishmentarian principles support pneumonoultramicroscopic research.", level: 9, day: 1 },
          { text: "Floccinaucinihilipilification demonstrates supercalifragilisticexpialidocious tendencies.", level: 9, day: 1 },
          { text: "Hippopotomonstrosesquippedaliophobia affects antidisestablishmentarianism significantly.", level: 9, day: 1 },
          { text: "Pseudopseudohypoparathyroidism requires immunoelectrophoresis analysis.", level: 9, day: 1 },
          
          // Level 10
          { text: "Pneumonoultramicroscopicsilicovolcanoconiosislike symptoms require methionylthreonylthreonylglutaminylarginyl treatment.", level: 10, day: 1 },
          { text: "Supercalifragilisticexpialidociously complex antipsychopharmacological interventions.", level: 10, day: 1 },
          { text: "Microspectrophotometrically analyzed tetraiodophenolphthalein compounds.", level: 10, day: 1 },
          { text: "Spectrophotometrically measured electroencephalograph readings.", level: 10, day: 1 },
          { text: "Extraordinarily complex pharmaceutical nomenclature systems.", level: 10, day: 1 },
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

    let shouldAwardCoins = false;

    if (matchingProgress) {
      // Check if this is the first time learning (was not learned before)
      shouldAwardCoins = !matchingProgress.isLearned && insertProgress.isLearned;
      
      const [updated] = await db
        .update(userProgress)
        .set(insertProgress)
        .where(eq(userProgress.id, matchingProgress.id))
        .returning();
      
      // Award coins if this is first time learning
      if (shouldAwardCoins) {
        const coins = insertProgress.wordId ? 10 : 3; // 10 coins per word, 3 coins per sentence
        await this.awardCoins(insertProgress.userId, coins);
      }
      
      return updated;
    } else {
      // New progress entry - award coins if marking as learned
      shouldAwardCoins = insertProgress.isLearned;
      
      const [progress] = await db
        .insert(userProgress)
        .values(insertProgress)
        .returning();
      
      // Award coins for new word/sentence learned
      if (shouldAwardCoins) {
        const coins = insertProgress.wordId ? 10 : 3; // 10 coins per word, 3 coins per sentence
        await this.awardCoins(insertProgress.userId, coins);
      }
      
      return progress;
    }
  }

  private async awardCoins(userId: number, coins: number): Promise<void> {
    // Ensure user stats exist
    const existingStats = await db.select().from(userStats).where(eq(userStats.userId, userId));
    
    if (existingStats.length === 0) {
      // Create new user stats with initial coins
      await db.insert(userStats).values({
        userId,
        totalWordsLearned: 0,
        totalSentencesLearned: 0,
        totalCoins: coins,
        currentLevel: 1,
        streak: 0,
      });
    } else {
      // Update existing stats by adding coins
      await db
        .update(userStats)
        .set({ 
          totalCoins: existingStats[0].totalCoins + coins 
        })
        .where(eq(userStats.userId, userId));
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

  async getLeaderboard() {
    const result = await db
      .select({
        userId: users.id,
        username: users.username,
        name: users.name,
        totalCoins: userStats.totalCoins,
        totalWordsLearned: userStats.totalWordsLearned,
        totalSentencesLearned: userStats.totalSentencesLearned,
      })
      .from(users)
      .leftJoin(userStats, eq(users.id, userStats.userId))
      .orderBy(desc(userStats.totalCoins))
      .limit(10);

    return result.map((row, index) => ({
      ...row,
      totalCoins: row.totalCoins || 0,
      totalWordsLearned: row.totalWordsLearned || 0,
      totalSentencesLearned: row.totalSentencesLearned || 0,
      rank: index + 1,
    }));
  }
}

export const storage = new DatabaseStorage();