/**
 * Error Fixers tRPC Router
 * API endpoints for 409 AI error fixing agents
 * Author: Jonathan Sherman
 * Monaco Edition 🏎️
 */

import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { errorFixerManager } from '../ai-error-fixers/core';

export const errorFixersRouter = router({
  /**
   * Report an error for auto-fixing
   */
  reportError: publicProcedure.input(
      z.object({
        layer: z.enum(['frontend', 'backend', 'database', 'network', 'system']),
        severity: z.enum(['critical', 'high', 'medium', 'low']),
        error: z.string(),
        stack: z.string().optional(),
        context: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const errorCtx = {
        id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        layer: input.layer,
        severity: input.severity,
        error: input.error,
        stack: input.stack,
        context: input.context,
        agentId: 0, // Will be assigned by manager
      };

      const result = await errorFixerManager.reportError(errorCtx);

      return {
        success: result.success,
        fixApplied: result.fixApplied,
        confidence: result.confidence,
        timeToFix: result.timeToFix,
        preventionStrategy: result.preventionStrategy,
      };
    }),

  /**
   * Get system-wide error fixer statistics
   */
  getStats: publicProcedure.query(() => {
    return errorFixerManager.getSystemStats();
  }),

  /**
   * Start continuous monitoring
   */
  startMonitoring: publicProcedure.mutation(() => {
    errorFixerManager.startMonitoring();
    return { success: true, message: '409 AI error fixers activated' };
  }),

  /**
   * Stop monitoring
   */
  stopMonitoring: publicProcedure.mutation(() => {
    errorFixerManager.stopMonitoring();
    return { success: true, message: 'Error monitoring stopped' };
  }),
});
