/**
 * HNT Rewards to Manus Credits Conversion Router
 * Author: Jonathan Sherman
 * Monaco Edition 🏎️
 */

import { z } from 'zod';
import { protectedProcedure, publicProcedure, router } from '../_core/trpc';

// Conversion rate: 1 HNT = 50 Manus credits (configurable)
const HNT_TO_CREDITS_RATE = 50;

interface RewardConversion {
  id: string;
  userId: string;
  hntAmount: number;
  creditsAmount: number;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
}

// In-memory storage (replace with database in production)
const conversions: RewardConversion[] = [];
const userBalances = new Map<string, { hnt: number; credits: number }>();

export const rewardsRouter = router({
  /**
   * Get user's HNT balance and Manus credits
   */
  getBalance: protectedProcedure.query(({ ctx }) => {
    const balance = userBalances.get(ctx.user.id.toString()) || {
      hnt: 1247.89, // Simulated HNT balance from Helium Network
      credits: 0,
    };
    
    return {
      hnt: balance.hnt,
      credits: balance.credits,
      conversionRate: HNT_TO_CREDITS_RATE,
      estimatedCredits: balance.hnt * HNT_TO_CREDITS_RATE,
    };
  }),

  /**
   * Convert HNT to Manus credits
   */
  convertToCredits: protectedProcedure
    .input(
      z.object({
        hntAmount: z.number().positive(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user.id.toString();
      const balance = userBalances.get(userId) || { hnt: 1247.89, credits: 0 };

      // Check if user has enough HNT
      if (balance.hnt < input.hntAmount) {
        throw new Error('Insufficient HNT balance');
      }

      // Calculate credits
      const creditsAmount = input.hntAmount * HNT_TO_CREDITS_RATE;

      // Create conversion record
      const conversion: RewardConversion = {
        id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        hntAmount: input.hntAmount,
        creditsAmount,
        timestamp: new Date(),
        status: 'completed',
      };

      conversions.push(conversion);

      // Update balances
      balance.hnt -= input.hntAmount;
      balance.credits += creditsAmount;
      userBalances.set(userId, balance);

      return {
        success: true,
        conversion,
        newBalance: {
          hnt: balance.hnt,
          credits: balance.credits,
        },
      };
    }),

  /**
   * Get conversion history
   */
  getConversionHistory: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().optional().default(10),
        })
        .optional()
    )
    .query(({ ctx, input }) => {
      const userId = ctx.user.id.toString();
      const userConversions = conversions
        .filter((c) => c.userId === userId)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, input?.limit || 10);

      return userConversions;
    }),

  /**
   * Simulate receiving HNT rewards from Helium Network
   */
  simulateReward: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive(),
      })
    )
    .mutation(({ input, ctx }) => {
      const userId = ctx.user.id.toString();
      const balance = userBalances.get(userId) || { hnt: 1247.89, credits: 0 };
      
      balance.hnt += input.amount;
      userBalances.set(userId, balance);

      return {
        success: true,
        message: `Received ${input.amount} HNT from Helium Network`,
        newBalance: balance,
      };
    }),

  /**
   * Get reward statistics
   */
  getStats: protectedProcedure.query(({ ctx }) => {
    const userId = ctx.user.id.toString();
    const userConversions = conversions.filter((c) => c.userId === userId);
    
    const totalHntConverted = userConversions.reduce((sum, c) => sum + c.hntAmount, 0);
    const totalCreditsEarned = userConversions.reduce((sum, c) => sum + c.creditsAmount, 0);

    return {
      totalConversions: userConversions.length,
      totalHntConverted,
      totalCreditsEarned,
      averageConversionSize: userConversions.length > 0 ? totalHntConverted / userConversions.length : 0,
    };
  }),
});
