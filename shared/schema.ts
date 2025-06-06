import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("student"), // "student" | "admin"
  name: text("name").notNull(),
  avatar: text("avatar"), // 아바타 이미지 URL 또는 base64
  createdAt: timestamp("created_at").defaultNow(),
});

export const words = pgTable("words", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  meaning: text("meaning"),
  level: integer("level").notNull().default(1),
  day: integer("day").notNull().default(1),
  audioUrl: text("audio_url"), // 음성 파일 URL
  createdAt: timestamp("created_at").defaultNow(),
});

export const sentences = pgTable("sentences", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  level: integer("level").notNull().default(1),
  day: integer("day").notNull().default(1),
  audioUrl: text("audio_url"), // 음성 파일 URL
  createdAt: timestamp("created_at").defaultNow(),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  wordId: integer("word_id"),
  sentenceId: integer("sentence_id"),
  isLearned: boolean("is_learned").notNull().default(false),
  isFavorite: boolean("is_favorite").notNull().default(false),
  learnedAt: timestamp("learned_at"),
});

export const dayProgress = pgTable("day_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  day: integer("day").notNull(),
  wordsLearned: integer("words_learned").notNull().default(0),
  sentencesLearned: integer("sentences_learned").notNull().default(0),
  coinsEarned: integer("coins_earned").notNull().default(0),
  bonusCoins: integer("bonus_coins").notNull().default(0),
  date: text("date").notNull(), // ISO date string
});

export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  totalWordsLearned: integer("total_words_learned").notNull().default(0),
  totalSentencesLearned: integer("total_sentences_learned").notNull().default(0),
  totalCoins: integer("total_coins").notNull().default(0),
  currentLevel: integer("current_level").notNull().default(1),
  streak: integer("streak").notNull().default(0),
  lastLoginDate: text("last_login_date"), // ISO date string
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertWordSchema = createInsertSchema(words).omit({
  id: true,
  createdAt: true,
});

export const insertSentenceSchema = createInsertSchema(sentences).omit({
  id: true,
  createdAt: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
});

export const insertDayProgressSchema = createInsertSchema(dayProgress).omit({
  id: true,
});

export const insertUserStatsSchema = createInsertSchema(userStats).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Word = typeof words.$inferSelect;
export type InsertWord = z.infer<typeof insertWordSchema>;
export type Sentence = typeof sentences.$inferSelect;
export type InsertSentence = z.infer<typeof insertSentenceSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type DayProgress = typeof dayProgress.$inferSelect;
export type InsertDayProgress = z.infer<typeof insertDayProgressSchema>;
export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;

// Login schema
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginData = z.infer<typeof loginSchema>;
