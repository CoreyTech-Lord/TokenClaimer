import {
  users,
  miningSessions,
  tasks,
  userTasks,
  referralEarnings,
  type User,
  type UpsertUser,
  type MiningSession,
  type InsertMiningSession,
  type Task,
  type UserTask,
  type InsertUserTask,
  type ReferralEarning,
  type InsertReferralEarning,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, sum, sql, and, isNull } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByReferralCode(code: string): Promise<User | undefined>;
  updateUserBalance(userId: string, amount: string): Promise<void>;
  updateUserWallet(userId: string, walletAddress: string): Promise<User>;

  // Mining operations
  createMiningSession(session: InsertMiningSession): Promise<MiningSession>;
  getLastMiningSession(userId: string): Promise<MiningSession | undefined>;
  updateUserStreak(userId: string, streak: number): Promise<void>;

  // Task operations
  getTasks(): Promise<Task[]>;
  getCompletedTasks(userId: string): Promise<UserTask[]>;
  completeTask(userTask: InsertUserTask): Promise<UserTask>;
  isTaskCompleted(userId: string, taskId: string): Promise<boolean>;

  // Referral operations
  createReferralEarning(earning: InsertReferralEarning): Promise<ReferralEarning>;
  getReferralStats(userId: string): Promise<{ count: number; totalEarned: string }>;
  getRecentReferrals(userId: string): Promise<User[]>;

  // Leaderboard operations
  getLeaderboard(limit?: number): Promise<Array<User & { rank: number }>>;
  getUserRank(userId: string): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        referralCode: userData.referralCode || `MTK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user!;
  }

  async getUserByReferralCode(code: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.referralCode, code));
    return user || undefined;
  }

  async updateUserBalance(userId: string, amount: string): Promise<void> {
    await db
      .update(users)
      .set({
        balance: sql`${users.balance} + ${amount}`,
        totalEarned: sql`${users.totalEarned} + ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async updateUserWallet(userId: string, walletAddress: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        walletAddress,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user!;
  }

  async createMiningSession(session: InsertMiningSession): Promise<MiningSession> {
    const [miningSession] = await db
      .insert(miningSessions)
      .values(session)
      .returning();
    return miningSession;
  }

  async getLastMiningSession(userId: string): Promise<MiningSession | undefined> {
    const [session] = await db
      .select()
      .from(miningSessions)
      .where(eq(miningSessions.userId, userId))
      .orderBy(desc(miningSessions.claimedAt))
      .limit(1);
    return session;
  }

  async updateUserStreak(userId: string, streak: number): Promise<void> {
    await db
      .update(users)
      .set({
        streak,
        lastClaimAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async getTasks(): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.isActive, true));
  }

  async getCompletedTasks(userId: string): Promise<UserTask[]> {
    return await db
      .select()
      .from(userTasks)
      .where(eq(userTasks.userId, userId));
  }

  async completeTask(userTask: InsertUserTask): Promise<UserTask> {
    const [completedTask] = await db
      .insert(userTasks)
      .values(userTask)
      .returning();
    return completedTask;
  }

  async isTaskCompleted(userId: string, taskId: string): Promise<boolean> {
    const [result] = await db
      .select({ count: count() })
      .from(userTasks)
      .where(and(eq(userTasks.userId, userId), eq(userTasks.taskId, taskId)));
    return result.count > 0;
  }

  async createReferralEarning(earning: InsertReferralEarning): Promise<ReferralEarning> {
    const [referralEarning] = await db
      .insert(referralEarnings)
      .values(earning)
      .returning();
    return referralEarning;
  }

  async getReferralStats(userId: string): Promise<{ count: number; totalEarned: string }> {
    const [stats] = await db
      .select({
        count: count(),
        totalEarned: sum(referralEarnings.amount),
      })
      .from(referralEarnings)
      .where(eq(referralEarnings.referrerId, userId));
    
    return {
      count: stats.count,
      totalEarned: stats.totalEarned || "0",
    };
  }

  async getRecentReferrals(userId: string): Promise<User[]> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.referredBy, userId))
      .orderBy(desc(users.createdAt))
      .limit(10);
    return result as User[];
  }

  async getLeaderboard(limit = 50): Promise<Array<User & { rank: number }>> {
    const leaderboard = await db
      .select()
      .from(users)
      .orderBy(desc(users.balance))
      .limit(limit);

    return leaderboard.map((user, index) => ({
      ...user,
      rank: index + 1,
    })) as Array<User & { rank: number }>;
  }

  async getUserRank(userId: string): Promise<number> {
    const [userBalance] = await db
      .select({ balance: users.balance })
      .from(users)
      .where(eq(users.id, userId));

    if (!userBalance) return 0;

    const [rankResult] = await db
      .select({ rank: count() })
      .from(users)
      .where(sql`${users.balance} > ${userBalance.balance}`);

    return (rankResult?.rank || 0) + 1;
  }
}

export const storage = new DatabaseStorage();
