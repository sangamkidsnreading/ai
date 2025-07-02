import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { loginSchema, insertUserSchema, insertWordSchema, insertSentenceSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check for Railway
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Update user stats with login date
      const today = new Date().toISOString().split('T')[0];
      const stats = await storage.getUserStats(user.id);
      if (stats) {
        const streak = stats.lastLoginDate === today ? stats.streak : stats.streak + 1;
        await storage.updateUserStats(user.id, { lastLoginDate: today, streak });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser(userData);
      
      // Initialize user stats
      await storage.updateUserStats(user.id, {
        userId: user.id,
        totalWordsLearned: 0,
        totalSentencesLearned: 0,
        totalCoins: 0,
        currentLevel: 1,
        streak: 0,
      });

      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // User routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const user = await storage.updateUser(id, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const user = await storage.updateUser(id, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteUser(id);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Words routes
  app.get("/api/words", async (req, res) => {
    try {
      const words = await storage.getAllWords();
      res.json(words);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch words" });
    }
  });

  app.post("/api/words", async (req, res) => {
    try {
      const wordData = insertWordSchema.parse(req.body);
      const word = await storage.createWord(wordData);
      res.status(201).json(word);
    } catch (error) {
      res.status(400).json({ message: "Invalid word data" });
    }
  });

  app.put("/api/words/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const word = await storage.updateWord(id, updates);
      if (!word) {
        return res.status(404).json({ message: "Word not found" });
      }
      res.json(word);
    } catch (error) {
      res.status(500).json({ message: "Failed to update word" });
    }
  });

  app.delete("/api/words/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteWord(id);
      if (!success) {
        return res.status(404).json({ message: "Word not found" });
      }
      res.json({ message: "Word deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete word" });
    }
  });

  // Sentences routes
  app.get("/api/sentences", async (req, res) => {
    try {
      const sentences = await storage.getAllSentences();
      res.json(sentences);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sentences" });
    }
  });

  app.post("/api/sentences", async (req, res) => {
    try {
      const sentenceData = insertSentenceSchema.parse(req.body);
      const sentence = await storage.createSentence(sentenceData);
      res.status(201).json(sentence);
    } catch (error) {
      res.status(400).json({ message: "Invalid sentence data" });
    }
  });

  app.put("/api/sentences/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const sentence = await storage.updateSentence(id, updates);
      if (!sentence) {
        return res.status(404).json({ message: "Sentence not found" });
      }
      res.json(sentence);
    } catch (error) {
      res.status(500).json({ message: "Failed to update sentence" });
    }
  });

  app.delete("/api/sentences/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSentence(id);
      if (!success) {
        return res.status(404).json({ message: "Sentence not found" });
      }
      res.json({ message: "Sentence deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete sentence" });
    }
  });

  // User progress routes
  app.get("/api/users/:userId/progress", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user progress" });
    }
  });

  app.post("/api/users/:userId/progress", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { wordId, sentenceId, isLearned, isFavorite } = req.body;
      
      const progress = await storage.updateUserProgress({
        userId,
        wordId: wordId || null,
        sentenceId: sentenceId || null,
        isLearned: isLearned || false,
        isFavorite: isFavorite || false,
        learnedAt: isLearned ? new Date() : null,
      });

      // Update user stats if learned
      if (isLearned) {
        const stats = await storage.getUserStats(userId);
        if (stats) {
          const coinReward = wordId ? 1 : 3; // 단어 1코인, 문장 3코인
          const updates: any = { totalCoins: stats.totalCoins + coinReward };
          if (wordId) updates.totalWordsLearned = stats.totalWordsLearned + 1;
          if (sentenceId) updates.totalSentencesLearned = stats.totalSentencesLearned + 1;
          await storage.updateUserStats(userId, updates);
        }

        // Update day progress
        const today = new Date().toISOString().split('T')[0];
        const dayProgressList = await storage.getDayProgress(userId);
        const currentDay = dayProgressList.length > 0 ? Math.max(...dayProgressList.map(d => d.day)) : 1;
        
        let todayProgress = dayProgressList.find(d => d.date === today && d.day === currentDay);
        if (todayProgress) {
          const coinReward = wordId ? 1 : 3;
          const updates: any = { 
            coinsEarned: todayProgress.coinsEarned + coinReward,
            date: today
          };
          if (wordId) updates.wordsLearned = todayProgress.wordsLearned + 1;
          if (sentenceId) updates.sentencesLearned = todayProgress.sentencesLearned + 1;
          await storage.updateDayProgress({ ...todayProgress, ...updates });
        } else {
          // 오늘의 progress가 없으면 새로 생성
          const coinReward = wordId ? 1 : 3;
          await storage.updateDayProgress({
            userId,
            day: currentDay,
            wordsLearned: wordId ? 1 : 0,
            sentencesLearned: sentenceId ? 1 : 0,
            coinsEarned: coinReward,
            date: today
          });
        }
      }

      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  app.post("/api/users/:userId/favorite", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { wordId, sentenceId } = req.body;
      
      const isFavorite = await storage.toggleFavorite(userId, wordId, sentenceId);
      res.json({ isFavorite });
    } catch (error) {
      res.status(500).json({ message: "Failed to toggle favorite" });
    }
  });

  // Day progress routes
  app.get("/api/users/:userId/day-progress", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const progress = await storage.getDayProgress(userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch day progress" });
    }
  });

  // User stats routes
  app.get("/api/users/:userId/stats", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const stats = await storage.getUserStats(userId);
      if (!stats) {
        return res.status(404).json({ message: "User stats not found" });
      }
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Leaderboard route - 노력왕 전체 랭킹
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
