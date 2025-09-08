import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";

const DAILY_REWARD = "50";
const REFERRAL_PERCENTAGE = 0.1;

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Mining routes
  app.get('/api/mining/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const lastSession = await storage.getLastMiningSession(userId);
      
      let canClaim = true;
      let timeRemaining = "00:00:00";
      let progress = 100;
      
      if (lastSession && lastSession.claimedAt) {
        const now = new Date();
        const nextClaimTime = new Date(lastSession.claimedAt.getTime() + 24 * 60 * 60 * 1000);
        const remaining = nextClaimTime.getTime() - now.getTime();
        
        if (remaining > 0) {
          canClaim = false;
          const hours = Math.floor(remaining / (1000 * 60 * 60));
          const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
          timeRemaining = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
          
          const elapsed = now.getTime() - lastSession.claimedAt.getTime();
          progress = Math.min((elapsed / (24 * 60 * 60 * 1000)) * 100, 100);
        }
      }
      
      res.json({
        canClaim,
        timeRemaining,
        progress,
        reward: DAILY_REWARD,
      });
    } catch (error) {
      console.error("Error fetching mining status:", error);
      res.status(500).json({ message: "Failed to fetch mining status" });
    }
  });

  app.post('/api/mining/claim', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const lastSession = await storage.getLastMiningSession(userId);
      
      // Check if user can claim
      if (lastSession && lastSession.claimedAt) {
        const now = new Date();
        const nextClaimTime = new Date(lastSession.claimedAt.getTime() + 24 * 60 * 60 * 1000);
        
        if (now < nextClaimTime) {
          return res.status(400).json({ message: "Must wait 24 hours between claims" });
        }
      }
      
      // Create mining session
      await storage.createMiningSession({
        userId,
        amount: DAILY_REWARD,
      });
      
      // Update user balance
      await storage.updateUserBalance(userId, DAILY_REWARD);
      
      // Update streak
      const user = await storage.getUser(userId);
      let newStreak = 1;
      if (user?.lastClaimAt) {
        const daysSinceLastClaim = Math.floor((Date.now() - user.lastClaimAt.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceLastClaim === 1) {
          newStreak = (user.streak || 0) + 1;
        }
      }
      await storage.updateUserStreak(userId, newStreak);
      
      // Pay referral bonus if user was referred
      if (user?.referredBy) {
        const referralAmount = (parseFloat(DAILY_REWARD) * REFERRAL_PERCENTAGE).toString();
        await storage.updateUserBalance(user.referredBy, referralAmount);
        await storage.createReferralEarning({
          referrerId: user.referredBy,
          referredId: userId,
          amount: referralAmount,
          source: "mining",
        });
      }
      
      res.json({ success: true, amount: DAILY_REWARD });
    } catch (error) {
      console.error("Error claiming reward:", error);
      res.status(500).json({ message: "Failed to claim reward" });
    }
  });

  // Task routes
  app.get('/api/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tasks = await storage.getTasks();
      const completedTasks = await storage.getCompletedTasks(userId);
      const completedTaskIds = new Set(completedTasks.map(ct => ct.taskId));
      
      const tasksWithStatus = tasks.map(task => ({
        ...task,
        completed: completedTaskIds.has(task.id),
      }));
      
      res.json(tasksWithStatus);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post('/api/tasks/:taskId/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { taskId } = req.params;
      
      // Check if task is already completed
      const isCompleted = await storage.isTaskCompleted(userId, taskId);
      if (isCompleted) {
        return res.status(400).json({ message: "Task already completed" });
      }
      
      // Get task details
      const tasks = await storage.getTasks();
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Complete task
      await storage.completeTask({
        userId,
        taskId,
      });
      
      // Update user balance
      await storage.updateUserBalance(userId, task.reward);
      
      // Pay referral bonus
      const user = await storage.getUser(userId);
      if (user?.referredBy) {
        const referralAmount = (parseFloat(task.reward) * REFERRAL_PERCENTAGE).toString();
        await storage.updateUserBalance(user.referredBy, referralAmount);
        await storage.createReferralEarning({
          referrerId: user.referredBy,
          referredId: userId,
          amount: referralAmount,
          source: "task",
        });
      }
      
      res.json({ success: true, reward: task.reward });
    } catch (error) {
      console.error("Error completing task:", error);
      res.status(500).json({ message: "Failed to complete task" });
    }
  });

  // Referral routes
  app.get('/api/referrals/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getReferralStats(userId);
      const recentReferrals = await storage.getRecentReferrals(userId);
      
      res.json({
        ...stats,
        recentReferrals,
      });
    } catch (error) {
      console.error("Error fetching referral stats:", error);
      res.status(500).json({ message: "Failed to fetch referral stats" });
    }
  });

  app.post('/api/referrals/validate', async (req, res) => {
    try {
      const { referralCode } = z.object({
        referralCode: z.string(),
      }).parse(req.body);
      
      const referrer = await storage.getUserByReferralCode(referralCode);
      if (!referrer) {
        return res.status(404).json({ message: "Invalid referral code" });
      }
      
      res.json({ valid: true, referrer: referrer.username });
    } catch (error) {
      console.error("Error validating referral code:", error);
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // Leaderboard routes
  app.get('/api/leaderboard', async (req, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  app.get('/api/leaderboard/rank', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const rank = await storage.getUserRank(userId);
      res.json({ rank });
    } catch (error) {
      console.error("Error fetching user rank:", error);
      res.status(500).json({ message: "Failed to fetch user rank" });
    }
  });

  // Wallet routes
  app.post('/api/wallet/connect', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { walletAddress } = z.object({
        walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address"),
      }).parse(req.body);
      
      const user = await storage.updateUserWallet(userId, walletAddress);
      res.json({ success: true, user });
    } catch (error) {
      console.error("Error connecting wallet:", error);
      res.status(400).json({ message: "Invalid wallet address" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
