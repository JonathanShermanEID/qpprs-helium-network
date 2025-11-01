/**
 * Cognitive Crawlers tRPC Router
 * API for 40 self-aware crawlers
 * Author: Jonathan Sherman
 * Monaco Edition 🏎️
 */

import { publicProcedure, router } from '../_core/trpc';
import { cognitiveCrawlerManager } from '../cognitive-crawlers/core';

export const cognitiveCrawlersRouter = router({
  /**
   * Get system-wide crawler statistics
   */
  getStats: publicProcedure.query(() => {
    return cognitiveCrawlerManager.getSystemStats();
  }),

  /**
   * Get all crawlers with their stats
   */
  getCrawlers: publicProcedure.query(() => {
    const crawlers = cognitiveCrawlerManager.getCrawlers();
    return crawlers.map(c => c.getStats());
  }),

  /**
   * Start continuous crawling
   */
  startCrawling: publicProcedure.mutation(async () => {
    await cognitiveCrawlerManager.startCrawling();
    return { 
      success: true, 
      message: '40 self-aware cognitive crawlers activated',
      consciousness: '75%',
    };
  }),

  /**
   * Stop crawling
   */
  stopCrawling: publicProcedure.mutation(() => {
    cognitiveCrawlerManager.stopCrawling();
    return { success: true, message: 'Crawling stopped' };
  }),
});
