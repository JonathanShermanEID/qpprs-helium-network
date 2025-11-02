/**
 * Coverage Opportunities Router
 * Manages network expansion opportunities and deployment recommendations
 * Author: Jonathan Sherman - Monaco Edition
 */

import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { coverageOpportunities } from "../../drizzle/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";

export const coverageOpportunitiesRouter = router({
  // List all coverage opportunities
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    
    const opportunities = await db.select().from(coverageOpportunities);
    return opportunities;
  }),

  // Get specific opportunity by ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      
      const [opportunity] = await db
        .select()
        .from(coverageOpportunities)
        .where(eq(coverageOpportunities.id, input.id))
        .limit(1);
      
      return opportunity || null;
    }),

  // Get opportunities by priority
  getByPriority: publicProcedure
    .input(z.object({ priority: z.enum(["low", "medium", "high", "critical"]) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      const opportunities = await db
        .select()
        .from(coverageOpportunities)
        .where(eq(coverageOpportunities.priority, input.priority));
      
      return opportunities;
    }),

  // Get Seattle opportunity
  getSeattle: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return null;
    
    const [seattle] = await db
      .select()
      .from(coverageOpportunities)
      .where(eq(coverageOpportunities.city, "Seattle"))
      .limit(1);
    
    return seattle || null;
  }),

  // Analytics summary
  summary: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return {
        totalOpportunities: 0,
        criticalCount: 0,
        highCount: 0,
        totalEstimatedRevenue: 0,
        averageCoverageGap: 0,
      };
    }
    
    const opportunities = await db.select().from(coverageOpportunities);
    
    return {
      totalOpportunities: opportunities.length,
      criticalCount: opportunities.filter(o => o.priority === "critical").length,
      highCount: opportunities.filter(o => o.priority === "high").length,
      totalEstimatedRevenue: opportunities.reduce((sum, o) => sum + (o.estimatedRevenue || 0), 0),
      averageCoverageGap: opportunities.length > 0
        ? opportunities.reduce((sum, o) => sum + parseFloat(o.coverageGap || "0"), 0) / opportunities.length
        : 0,
    };
  }),
});
