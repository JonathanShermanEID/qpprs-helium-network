/**
 * Network Activation Campaigns Router
 * Author: Jonathan Sherman - Monaco Edition
 */

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { iphoneXROnlyProcedure } from "../_core/iphoneXRProcedure";

export const campaignsRouter = router({
  /**
   * Get all active campaigns
   */
  getActiveCampaigns: publicProcedure.query(async () => {
    // Mock campaign data - in production, this would come from database
    return [
      {
        id: 1,
        name: "Nationwide Mesh Expansion",
        description: "Activate 1000 new hotspots across the United States",
        target: 1000,
        current: 20,
        reward: "50 HNT per hotspot",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-12-31"),
        status: "active",
      },
      {
        id: 2,
        name: "Urban Coverage Initiative",
        description: "Deploy hotspots in major metropolitan areas",
        target: 500,
        current: 12,
        reward: "75 HNT per hotspot",
        startDate: new Date("2025-02-01"),
        endDate: new Date("2025-06-30"),
        status: "active",
      },
      {
        id: 3,
        name: "Rural Connectivity Program",
        description: "Bring mesh network to underserved rural communities",
        target: 300,
        current: 5,
        reward: "100 HNT per hotspot",
        startDate: new Date("2025-03-01"),
        endDate: new Date("2025-09-30"),
        status: "active",
      },
    ];
  }),

  /**
   * Join a campaign (iPhone XR only)
   */
  joinCampaign: iphoneXROnlyProcedure
    .input(z.object({
      campaignId: z.number(),
      hotspotId: z.string(),
    }))
    .mutation(async ({ input }) => {
      console.log("[Campaigns] User joined campaign:", input.campaignId, "with hotspot:", input.hotspotId);

      return {
        success: true,
        message: "Successfully joined campaign",
        campaignId: input.campaignId,
        hotspotId: input.hotspotId,
      };
    }),

  /**
   * Get campaign statistics
   */
  getCampaignStats: publicProcedure.query(async () => {
    return {
      totalCampaigns: 3,
      activeCampaigns: 3,
      completedCampaigns: 0,
      totalHotspotsDeployed: 37,
      totalRewardsDistributed: "1850 HNT",
      participatingUsers: 1,
    };
  }),
});
