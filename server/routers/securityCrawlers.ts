/**
 * Security Crawlers tRPC Router
 * Endpoints for 20 Creative Cognition Web Crawler LLMs
 * Author: Jonathan Sherman - Monaco Edition
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { creativeCognitionCrawlers } from "../creativeCognitionCrawlers";
import { ENV } from "../_core/env";

export const securityCrawlersRouter = router({
  // Get security status (iPhone XR only)
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.openId !== ENV.ownerOpenId) {
      throw new Error("Unauthorized - iPhone XR Exclusive");
    }
    return creativeCognitionCrawlers.getSecurityStatus();
  }),

  // Get security events (iPhone XR only)
  getEvents: protectedProcedure
    .input(z.object({ limit: z.number().optional().default(100) }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.openId !== ENV.ownerOpenId) {
        throw new Error("Unauthorized - iPhone XR Exclusive");
      }
      return creativeCognitionCrawlers.getSecurityEvents(input.limit);
    }),

  // Get protection rules (iPhone XR only)
  getProtectionRules: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.openId !== ENV.ownerOpenId) {
      throw new Error("Unauthorized - iPhone XR Exclusive");
    }
    return creativeCognitionCrawlers.getProtectionRules();
  }),

  // Trigger manual scan (iPhone XR only)
  triggerScan: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.openId !== ENV.ownerOpenId) {
      throw new Error("Unauthorized - iPhone XR Exclusive");
    }
    return await creativeCognitionCrawlers.triggerManualScan();
  }),

  // Resume production after halt (iPhone XR only)
  resumeProduction: protectedProcedure
    .input(z.object({ reason: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.openId !== ENV.ownerOpenId) {
        throw new Error("Unauthorized - iPhone XR Exclusive");
      }
      return await creativeCognitionCrawlers.resumeProduction(
        `${ctx.user.name} (${ctx.user.openId}): ${input.reason}`
      );
    }),
});
