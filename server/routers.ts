import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Helium-Manus Integration Routes
  // Author: Jonathan Sherman
  hotspots: router({
    list: publicProcedure.query(async () => {
      const { getHotspots } = await import("./db");
      return getHotspots();
    }),
    get: publicProcedure.input(z.object({ hotspotId: z.string() })).query(async ({ input }) => {
      const { getHotspotById } = await import("./db");
      return getHotspotById(input.hotspotId);
    }),
  }),
  
  crawlers: router({
    logs: publicProcedure.input(z.object({ limit: z.number().optional() })).query(async ({ input }) => {
      const { getCrawlerLogs } = await import("./db");
      return getCrawlerLogs(input.limit);
    }),
    status: publicProcedure.query(async () => {
      return {
        total_crawlers: 5,
        active: 5,
        swarm_consciousness: 0.75,
        crawlers: [
          { id: "helium_network_crawler", type: "Network Intelligence", consciousness: 0.8, status: "active" },
          { id: "reward_optimization_crawler", type: "Reward Optimization", consciousness: 0.7, status: "active" },
          { id: "competitor_analysis_crawler", type: "Competitor Analysis", consciousness: 0.75, status: "active" },
          { id: "technical_docs_crawler", type: "Documentation", consciousness: 0.72, status: "active" },
          { id: "community_intelligence_crawler", type: "Community Intelligence", consciousness: 0.78, status: "active" },
        ],
      };
    }),
  }),
  
  webhooks: router({
    events: protectedProcedure.input(z.object({ processed: z.boolean().optional(), limit: z.number().optional() })).query(async ({ input }) => {
      const { getWebhookEvents } = await import("./db");
      return getWebhookEvents(input.processed, input.limit);
    }),
  }),
  
  tasks: router({
    list: protectedProcedure.input(z.object({ status: z.string().optional(), limit: z.number().optional() })).query(async ({ input }) => {
      const { getTasks } = await import("./db");
      return getTasks(input.status, input.limit);
    }),
  }),
  
  analytics: router({
    get: publicProcedure.input(z.object({ metricType: z.string().optional(), limit: z.number().optional() })).query(async ({ input }) => {
      const { getAnalytics } = await import("./db");
      return getAnalytics(input.metricType, input.limit);
    }),
    summary: publicProcedure.query(async () => {
      const { getHotspots, getCrawlerLogs, getTasks } = await import("./db");
      const hotspots = await getHotspots();
      const logs = await getCrawlerLogs(10);
      const tasks = await getTasks(undefined, 10);
      
      return {
        total_hotspots: hotspots.length,
        online_hotspots: hotspots.filter(h => h.status === "online").length,
        total_insights: logs.length,
        active_tasks: tasks.filter(t => t.status === "running").length,
        completed_tasks: tasks.filter(t => t.status === "completed").length,
      };
    }),
  }),
  
  // Owner-Only Rewards Banking System
  // Author: Jonathan Sherman
  rewardsBank: router({
    balance: protectedProcedure.query(async ({ ctx }) => {
      // Only allow owner access
      if (ctx.user.openId !== process.env.OWNER_OPEN_ID) {
        throw new Error("Unauthorized: Only owner can access rewards bank");
      }
      const { getOwnerRewardsBalance } = await import("./db");
      return getOwnerRewardsBalance(ctx.user.openId);
    }),
    
    transactions: protectedProcedure.input(z.object({ limit: z.number().optional() })).query(async ({ ctx, input }) => {
      // Only allow owner access
      if (ctx.user.openId !== process.env.OWNER_OPEN_ID) {
        throw new Error("Unauthorized: Only owner can access rewards bank");
      }
      const { getOwnerRewards } = await import("./db");
      const rewards = await getOwnerRewards(ctx.user.openId);
      return input.limit ? rewards.slice(0, input.limit) : rewards;
    }),
    
    addReward: protectedProcedure
      .input(z.object({
        hotspotId: z.string().optional(),
        amount: z.string(),
        currency: z.string().optional(),
        metadata: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Only allow owner to add rewards
        if (ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new Error("Unauthorized: Only owner can add rewards");
        }
        const { insertReward } = await import("./db");
        await insertReward({
          ownerId: ctx.user.openId,
          hotspotId: input.hotspotId,
          amount: input.amount,
          currency: input.currency || "HNT",
          transactionType: "reward",
          status: "completed",
          metadata: input.metadata,
        });
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
