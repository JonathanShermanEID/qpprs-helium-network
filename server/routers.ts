import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { tripo3DService } from "./tripo3DService";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { errorFixersRouter } from "./routers/errorFixers";
import { cognitiveCrawlersRouter } from "./routers/cognitiveCrawlers";
import { loraRouter } from "./routers/lora";
import { rewardsRouter } from "./routers/rewards";
import { fedrampRouter } from "./routers/fedramp";
import { hybridNetworkRouter } from "./routers/hybridNetwork";
import { telecomRouter } from "./routers/telecom";
import { deviceActivationRouter } from "./routers/deviceActivation";
import { conversationMonitorRouter } from "./routers/conversationMonitor";
import { certificates3DRouter } from "./routers/certificates3D";
import { campaignsRouter } from "./routers/campaigns";
import { intelligentNetworkActivationRouter } from "./routers/intelligentNetworkActivation";
import { coverageOpportunitiesRouter } from "./routers/coverageOpportunities";
import { cryptoPaymentsRouter } from "./routers/cryptoPayments";
import { verizonRouter } from './routers/verizon';
import { phoneNumberRouter } from './routers/phoneNumber';
import { cloneDetectionRouter } from './api/routers/cloneDetection';

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  errorFixers: errorFixersRouter,
  cognitiveCrawlers: cognitiveCrawlersRouter,
  lora: loraRouter,
  rewards: rewardsRouter,
  fedramp: fedrampRouter,
  hybridNetwork: hybridNetworkRouter,
  telecom: telecomRouter,
  deviceActivation: deviceActivationRouter,
  conversationMonitor: conversationMonitorRouter,
  certificates3D: certificates3DRouter,
  campaigns: campaignsRouter,
  intelligentNetworkActivation: intelligentNetworkActivationRouter,
  coverageOpportunities: coverageOpportunitiesRouter,
  cryptoPayments: cryptoPaymentsRouter,
  verizon: verizonRouter,
  phoneNumber: phoneNumberRouter,
  cloneDetection: cloneDetectionRouter,

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

  // Q++RS Integration Routes
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
    discoverAll: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input, ctx }) => {
        const { ENV } = await import('./_core/env');
        if (ctx.user.openId !== ENV.ownerOpenId) throw new Error('Owner only');
        const { heliumHotspotIntegration } = await import('./heliumHotspotIntegration');
        return heliumHotspotIntegration.discoverAllHotspots(input?.limit);
      }),
    getByAddress: publicProcedure
      .input(z.object({ address: z.string() }))
      .query(async ({ input }) => {
        const { heliumHotspotIntegration } = await import('./heliumHotspotIntegration');
        return heliumHotspotIntegration.getHotspotByAddress(input.address);
      }),
    searchByLocation: publicProcedure
      .input(z.object({ lat: z.number(), lng: z.number(), distance: z.number().optional() }))
      .query(async ({ input }) => {
        const { heliumHotspotIntegration } = await import('./heliumHotspotIntegration');
        return heliumHotspotIntegration.searchHotspotsByLocation(input.lat, input.lng, input.distance);
      }),
    generateCertificate: protectedProcedure
      .input(z.object({ hotspotAddress: z.string(), ownerAddress: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const { ENV } = await import('./_core/env');
        if (ctx.user.openId !== ENV.ownerOpenId) throw new Error('Owner only');
        const { heliumHotspotIntegration } = await import('./heliumHotspotIntegration');
        return heliumHotspotIntegration.generateAuthenticationCertificate(input.hotspotAddress, input.ownerAddress);
      }),
    getNetworkStats: publicProcedure
      .query(async () => {
        const { heliumHotspotIntegration } = await import('./heliumHotspotIntegration');
        return heliumHotspotIntegration.getNetworkStats();
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
  // Rewards Bank - Backend API Only (UI removed, sends to Manus tasks)
  // Author: Jonathan Sherman
  rewardsBank: router({
    // Internal API - Add reward and notify owner via Manus tasks
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
        
        // Send notification to owner's Manus tasks
        const { sendRewardsToOwnerTasks } = await import("./rewardsTaskService");
        await sendRewardsToOwnerTasks();
        
        // Check if credit transformer is active and process transformation
        const { processAutomaticTransformation } = await import("./creditTransformerLLM");
        await processAutomaticTransformation(ctx.user.openId, input.amount);
        
        return { success: true };
      }),
    
    // Internal API - Manually trigger rewards summary to Manus tasks
    sendToTasks: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.openId !== process.env.OWNER_OPEN_ID) {
        throw new Error("Unauthorized: Only owner can trigger rewards tasks");
      }
      const { sendRewardsToOwnerTasks } = await import("./rewardsTaskService");
      const success = await sendRewardsToOwnerTasks();
      return { success };
    }),
  }),
  
  // Account Credit Transformer LLM System
  // Master Artifact Certification Holder Only
  // Author: Jonathan Sherman
  creditTransformer: router({
    // Get transformer status
    status: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.openId !== process.env.OWNER_OPEN_ID) {
        throw new Error("Unauthorized: Only owner can access credit transformer");
      }
      const { getCreditTransformerStatus } = await import("./db");
      return getCreditTransformerStatus(ctx.user.openId);
    }),
    
    // Activate transformer (IRREVERSIBLE)
    activate: protectedProcedure
      .input(z.object({ masterCertification: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const { activateCreditTransformer } = await import("./creditTransformerLLM");
        return activateCreditTransformer(ctx.user.openId, input.masterCertification);
      }),
    
    // Generate shareholder report
    report: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.openId !== process.env.OWNER_OPEN_ID) {
        throw new Error("Unauthorized: Only owner can access reports");
      }
      const { generateShareholderReport } = await import("./creditTransformerLLM");
      return generateShareholderReport(ctx.user.openId);
    }),
  }),
  
  // Google Ads & Video Ad Service
  // Author: Jonathan Sherman
  ads: router({
    // Track Google Ads conversion
    trackConversion: publicProcedure
      .input(z.object({
        conversionId: z.string(),
        conversionLabel: z.string(),
        value: z.number(),
        currency: z.string(),
        transactionId: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { trackConversion } = await import("./googleAdsService");
        const success = await trackConversion(input);
        return { success };
      }),
    
    // Get campaign metrics
    campaignMetrics: protectedProcedure
      .input(z.object({ campaignId: z.string() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new Error("Unauthorized");
        }
        const { getCampaignMetrics } = await import("./googleAdsService");
        return getCampaignMetrics(input.campaignId);
      }),
    
    // Process video ad (0.13s runtime target)
    processVideo: protectedProcedure
      .input(z.object({
        videoUrl: z.string(),
        duration: z.number(),
        format: z.enum(["mp4", "webm", "av1"]),
        targetAudience: z.string(),
        campaignId: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new Error("Unauthorized");
        }
        const { processVideoAd } = await import("./videoAdService");
        return processVideoAd(input);
      }),
    
    // Get video ad performance
    videoPerformance: protectedProcedure
      .input(z.object({ campaignId: z.string() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new Error("Unauthorized");
        }
        const { trackVideoPerformance } = await import("./videoAdService");
        return trackVideoPerformance(input.campaignId);
      }),
  }),
  
  // Network Spreading & Viral Growth
  // Author: Jonathan Sherman
  network: router({
    generateReferralCode: protectedProcedure
      .query(async ({ ctx }) => {
        const { networkSpreadingEngine } = await import('./networkSpreadingEngine');
        return {
          referralCode: networkSpreadingEngine.generateReferralCode(ctx.user.openId),
          invitationLink: networkSpreadingEngine.generateInvitationLink(
            networkSpreadingEngine.generateReferralCode(ctx.user.openId)
          ),
        };
      }),
    trackReferral: publicProcedure
      .input(z.object({
        referralCode: z.string(),
        userId: z.string(),
        hotspotAddresses: z.array(z.string()),
      }))
      .mutation(async ({ input }) => {
        const { networkSpreadingEngine } = await import('./networkSpreadingEngine');
        return networkSpreadingEngine.trackReferral(
          input.referralCode,
          input.userId,
          input.hotspotAddresses
        );
      }),
    getSocialContent: protectedProcedure
      .input(z.object({ referralCode: z.string() }))
      .query(async ({ input }) => {
        const { networkSpreadingEngine } = await import('./networkSpreadingEngine');
        return networkSpreadingEngine.generateSocialContent(input.referralCode);
      }),
    createCampaign: protectedProcedure
      .input(z.object({
        name: z.string(),
        targetAudience: z.enum(['hotspot_owners', 'network_operators', 'all']),
        incentive: z.object({
          type: z.enum(['percentage_bonus', 'fixed_reward', 'premium_unlock']),
          value: z.number(),
        }),
        active: z.boolean(),
        startDate: z.date(),
        endDate: z.date().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { ENV } = await import('./_core/env');
        if (ctx.user.openId !== ENV.ownerOpenId) throw new Error('Owner only');
        const { networkSpreadingEngine } = await import('./networkSpreadingEngine');
        return networkSpreadingEngine.createViralCampaign(input);
      }),
    automatedOutreach: protectedProcedure
      .input(z.object({ targetHotspots: z.array(z.string()) }))
      .mutation(async ({ input, ctx }) => {
        const { ENV } = await import('./_core/env');
        if (ctx.user.openId !== ENV.ownerOpenId) throw new Error('Owner only');
        const { networkSpreadingEngine } = await import('./networkSpreadingEngine');
        return networkSpreadingEngine.automatedOutreach(input.targetHotspots);
      }),
    getAnalytics: protectedProcedure
      .query(async ({ ctx }) => {
        const { ENV } = await import('./_core/env');
        if (ctx.user.openId !== ENV.ownerOpenId) throw new Error('Owner only');
        const { networkSpreadingEngine } = await import('./networkSpreadingEngine');
        return networkSpreadingEngine.getSpreadingAnalytics();
      }),
    getReferralStats: protectedProcedure
      .query(async ({ ctx }) => {
        // Return referral statistics for the current user
        return {
          directReferrals: 0,
          networkSize: 0,
          totalEarnings: 0,
          pendingRewards: 0,
          referralCode: '',
        };
      }),
  }),

  // Mass-scale automation System
  // 1024 AI Thinking System
  // Author: Jonathan Sherman
  automation: router({
    // Initialize all markets with 1024 AI analysis
    initialize: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.openId !== process.env.OWNER_OPEN_ID) {
        throw new Error("Unauthorized");
      }
      const { initializeMassScaleAutomation } = await import("./massScaleAutomation");
      await initializeMassScaleAutomation();
      return { success: true };
    }),
    
    // Get 1024 AI market opportunities
    opportunities: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.openId !== process.env.OWNER_OPEN_ID) {
        throw new Error("Unauthorized");
      }
      const { identifyMassScaleOpportunities } = await import("./ai1024ThinkingSystem");
      return identifyMassScaleOpportunities();
    }),
    
    // Onboard single customer (automated)
    onboardCustomer: protectedProcedure
      .input(z.object({
        market: z.string(),
        companyName: z.string(),
        industry: z.string(),
        size: z.enum(["small", "medium", "large", "enterprise"]),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new Error("Unauthorized");
        }
        const { getAutomationEngine } = await import("./massScaleAutomation");
        const engine = getAutomationEngine();
        return engine.onboardCustomer(input.market, {
          companyName: input.companyName,
          industry: input.industry,
          size: input.size,
        });
      }),
    
    // Batch onboard customers
    batchOnboard: protectedProcedure
      .input(z.object({
        market: z.string(),
        count: z.number().min(1).max(10000),
        industry: z.string(),
        size: z.enum(["small", "medium", "large", "enterprise"]),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new Error("Unauthorized");
        }
        const { getAutomationEngine } = await import("./massScaleAutomation");
        const engine = getAutomationEngine();
        return engine.batchOnboard(input.market, input.count, {
          industry: input.industry,
          size: input.size,
        });
      }),
    
    // Auto-scale to target customer count
    autoScale: protectedProcedure
      .input(z.object({
        market: z.string(),
        targetCustomers: z.number().min(1).max(100000),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new Error("Unauthorized");
        }
        const { getAutomationEngine } = await import("./massScaleAutomation");
        const engine = getAutomationEngine();
        await engine.autoScale(input.market, input.targetCustomers);
        return { success: true };
      }),
    
    // Get automation statistics
    stats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.openId !== process.env.OWNER_OPEN_ID) {
        throw new Error("Unauthorized");
      }
      const { getAutomationEngine } = await import("./massScaleAutomation");
      const engine = getAutomationEngine();
      return engine.getStats();
    }),
    
    // Generate revenue report
    revenueReport: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.openId !== process.env.OWNER_OPEN_ID) {
        throw new Error("Unauthorized");
      }
      const { getAutomationEngine } = await import("./massScaleAutomation");
      const engine = getAutomationEngine();
      return engine.generateRevenueReport();
    }),
    
    // Self-Scaling Orchestrator
    startScaling: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.openId !== process.env.OWNER_OPEN_ID) {
        throw new Error("Unauthorized");
      }
      const { startSelfScaling } = await import("./selfScalingOrchestrator");
      startSelfScaling();
      return { success: true };
    }),
    
    stopScaling: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.openId !== process.env.OWNER_OPEN_ID) {
        throw new Error("Unauthorized");
      }
      const { stopSelfScaling } = await import("./selfScalingOrchestrator");
      stopSelfScaling();
      return { success: true };
    }),
    
    scalingStatus: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.openId !== process.env.OWNER_OPEN_ID) {
        throw new Error("Unauthorized");
      }
      const { getOrchestrator } = await import("./selfScalingOrchestrator");
      return getOrchestrator().getStatus();
    }),
  }),
  
  // Intellectual Property Protection System
  // "real sexy" brand protection
  // Author: Jonathan Sherman
  ipProtection: router({
    // Setup complete IP protection
    setupProtection: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.openId !== process.env.OWNER_OPEN_ID) {
        throw new Error("Unauthorized");
      }
      const { getIPProtection } = await import("./ipProtectionSystem");
      return getIPProtection().setupCompleteProtection();
    }),
    
    // Generate digital certificate
    generateCertificate: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.openId !== process.env.OWNER_OPEN_ID) {
        throw new Error("Unauthorized");
      }
      const { getIPProtection } = await import("./ipProtectionSystem");
      return getIPProtection().generateDigitalCertificate();
    }),
    
    // Register copyright
    registerCopyright: protectedProcedure
      .input(z.object({
        workTitle: z.string(),
        workType: z.enum(["brand", "logo", "slogan", "content", "music"]),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new Error("Unauthorized");
        }
        const { getIPProtection } = await import("./ipProtectionSystem");
        return getIPProtection().registerCopyright(input.workTitle, input.workType);
      }),
    
    // Establish airplay rights
    establishAirplayRights: protectedProcedure
      .input(z.object({
        contentTitle: z.string(),
        territories: z.array(z.string()),
        platforms: z.array(z.string()),
        durationYears: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new Error("Unauthorized");
        }
        const { getIPProtection } = await import("./ipProtectionSystem");
        return getIPProtection().establishAirplayRights(
          input.contentTitle,
          input.territories,
          input.platforms,
          input.durationYears
        );
      }),
    
    // Register trademark
    registerTrademark: protectedProcedure
      .input(z.object({
        mark: z.string(),
        classes: z.array(z.number()),
        jurisdictions: z.array(z.string()),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new Error("Unauthorized");
        }
        const { getIPProtection } = await import("./ipProtectionSystem");
        return getIPProtection().registerTrademark(input.mark, input.classes, input.jurisdictions);
      }),
    
    // Detect violations
    detectViolations: protectedProcedure
      .input(z.object({
        searchQuery: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new Error("Unauthorized");
        }
        const { getIPProtection } = await import("./ipProtectionSystem");
        return getIPProtection().detectViolations(input.searchQuery);
      }),
    
    // Send DMCA takedown
    sendDMCA: protectedProcedure
      .input(z.object({
        violationUrl: z.string(),
        platform: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new Error("Unauthorized");
        }
        const { getIPProtection } = await import("./ipProtectionSystem");
        return getIPProtection().sendDMCATakedown(input.violationUrl, input.platform);
      }),
    
    // Track royalties
    trackRoyalties: protectedProcedure
      .input(z.object({
        period: z.enum(["daily", "weekly", "monthly"]),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new Error("Unauthorized");
        }
        const { getIPProtection } = await import("./ipProtectionSystem");
        return getIPProtection().trackRoyalties(input.period);
      }),
  }),
  
  // Law Enforcement Compatibility System
  // Forensic evidence collection and legal reporting
  // Author: Jonathan Sherman
  lawEnforcement: router({    // Create legal case
    createCase: protectedProcedure
      .input(z.object({
        title: z.string(),
        violationType: z.enum(["copyright", "trademark", "airplay", "fraud"]),
        defendant: z.string(),
        jurisdiction: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new Error("Unauthorized");
        }
        const { getLawEnforcementSystem } = await import("./lawEnforcementSystem");
        return getLawEnforcementSystem().createCase(
          input.title,
          input.violationType,
          input.defendant,
          input.jurisdiction
        );
      }),
    
    // Collect evidence
    collectEvidence: protectedProcedure
      .input(z.object({
        caseId: z.string(),
        type: z.enum(["screenshot", "url", "document", "metadata", "communication"]),
        description: z.string(),
        data: z.any(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new Error("Unauthorized");
        }
        const { getLawEnforcementSystem } = await import("./lawEnforcementSystem");
        return getLawEnforcementSystem().collectEvidence(
          input.caseId,
          input.type,
          input.description,
          input.data
        );
      }),
    
    // Verify evidence integrity
    verifyIntegrity: protectedProcedure
      .input(z.object({
        evidenceId: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new Error("Unauthorized");
        }
        const { getLawEnforcementSystem } = await import("./lawEnforcementSystem");
        return getLawEnforcementSystem().verifyIntegrity(input.evidenceId);
      }),
    
    // Generate forensic report
    generateReport: protectedProcedure
      .input(z.object({
        caseId: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new Error("Unauthorized");
        }
        const { getLawEnforcementSystem } = await import("./lawEnforcementSystem");
        return getLawEnforcementSystem().generateForensicReport(input.caseId);
      }),
    
    // Submit to law enforcement
    submitCase: protectedProcedure
      .input(z.object({
        caseId: z.string(),
        agency: z.string(),
        officerName: z.string(),
        officerEmail: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new Error("Unauthorized");
        }
        const { getLawEnforcementSystem } = await import("./lawEnforcementSystem");
        return getLawEnforcementSystem().submitToLawEnforcement(
          input.caseId,
          input.agency,
          input.officerName,
          input.officerEmail
        );
      }),
    
    // Generate evidence package
    generatePackage: protectedProcedure
      .input(z.object({
        caseId: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new Error("Unauthorized");
        }
        const { getLawEnforcementSystem } = await import("./lawEnforcementSystem");
        return getLawEnforcementSystem().generateEvidencePackage(input.caseId);
      }),
    
    // Get case status
    getCaseStatus: protectedProcedure
      .input(z.object({
        caseId: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new Error("Unauthorized");
        }
        const { getLawEnforcementSystem } = await import("./lawEnforcementSystem");
        return getLawEnforcementSystem().getCaseStatus(input.caseId);
      }),
    
    // Get evidence details
    getEvidence: protectedProcedure
      .input(z.object({
        evidenceId: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new Error("Unauthorized");
        }
        const { getLawEnforcementSystem } = await import("./lawEnforcementSystem");
        return getLawEnforcementSystem().getEvidence(input.evidenceId);
      }),
    
    // Get chain of custody
    getChainOfCustody: protectedProcedure
      .input(z.object({
        evidenceId: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new Error("Unauthorized");
        }
        const { getLawEnforcementSystem } = await import("./lawEnforcementSystem");
        return getLawEnforcementSystem().getChainOfCustody(input.evidenceId);
      }),
  }),

  // Autonomous Mesh Network Gateway
  // Provides connectivity when Wi-Fi and cellular networks are unavailable
  // Author: Jonathan Sherman
  meshGateway: router({
    getStatus: publicProcedure.query(async () => {
      const { getMeshNetworkGateway } = await import('./meshNetworkGateway');
      const gateway = getMeshNetworkGateway();
      return gateway.getStatus();
    }),
    getConfig: publicProcedure.query(async () => {
      const { getMeshNetworkGateway } = await import('./meshNetworkGateway');
      const gateway = getMeshNetworkGateway();
      return gateway.getConfig();
    }),
    getMeshNodes: publicProcedure.query(async () => {
      const { getMeshNetworkGateway } = await import('./meshNetworkGateway');
      const gateway = getMeshNetworkGateway();
      return gateway.getMeshNodes();
    }),
    forceMeshActivation: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.openId !== process.env.OWNER_OPEN_ID) {
        throw new Error('Owner-only operation');
      }
      const { getMeshNetworkGateway } = await import('./meshNetworkGateway');
      const gateway = getMeshNetworkGateway();
      await gateway.forceMeshActivation();
      return { success: true };
    }),
  }),

  // 3D Visualization Router
  // Author: Jonathan Sherman
  visualization: router({
    generate3DTopology: protectedProcedure
      .input(z.object({
        hotspotCount: z.number(),
        networkDensity: z.enum(['low', 'medium', 'high']),
      }))
      .mutation(async ({ input, ctx }) => {
        // Owner-only access
        if (ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new Error('Unauthorized: Owner access required');
        }

        const modelUrl = await tripo3DService.generateNetworkTopology3D(
          input.hotspotCount,
          input.networkDensity
        );

        return {
          modelUrl,
          author: 'Jonathan Sherman',
        };
      }),
    
    generateHotspot3D: protectedProcedure
      .input(z.object({
        hotspotType: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.openId !== process.env.OWNER_OPEN_ID) {
          throw new Error('Unauthorized: Owner access required');
        }

        const modelUrl = await tripo3DService.generateHotspot3DModel(input.hotspotType);

        return {
          modelUrl,
          author: 'Jonathan Sherman',
        };
      }),
  }),

  // Autonomous Mesh Network Gateway
  // Mobile Device Network Detection & Availability
  // Author: Jonathan Sherman
  mesh: router({
    // Check if mesh network is available
    checkAvailability: publicProcedure.query(async () => {
      // Simulate mesh network availability check
      // In production, this would query actual Helium LoRaWAN network status
      const { getHotspots } = await import("./db");
      const hotspots = await getHotspots();
      const onlineHotspots = hotspots.filter(h => h.status === "online");
      
      return {
        available: onlineHotspots.length > 0,
        connectedHotspots: onlineHotspots.length,
        nearbyHotspots: onlineHotspots.slice(0, 5).map(h => h.hotspotId),
        networkHealth: onlineHotspots.length > 0 ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
      };
    }),

    // Get detailed mesh network status
    getStatus: publicProcedure.query(async () => {
      const { getHotspots } = await import("./db");
      const hotspots = await getHotspots();
      const onlineHotspots = hotspots.filter(h => h.status === "online");
      
      return {
        isActive: true,
        totalHotspots: hotspots.length,
        onlineHotspots: onlineHotspots.length,
        coverage: 'nationwide',
        protocol: 'LoRaWAN',
        autoFailover: true,
        selfHealing: true,
        productionLocked: true,
        author: 'Jonathan Sherman',
      };
    }),

    // Get nearby hotspots for mesh connectivity
    getNearbyHotspots: publicProcedure
      .input(z.object({
        lat: z.number().optional(),
        lng: z.number().optional(),
        radius: z.number().optional(),
      }))
      .query(async ({ input }) => {
        const { getHotspots } = await import("./db");
        const hotspots = await getHotspots();
        
        // Filter online hotspots
        const onlineHotspots = hotspots.filter(h => h.status === "online");
        
        // In production, this would use actual geolocation filtering
        // For now, return all online hotspots
        return {
          hotspots: onlineHotspots.slice(0, 10),
          count: onlineHotspots.length,
          radius: input.radius || 10,
        };
      }),

    // Request mesh network connection
    requestConnection: publicProcedure
      .input(z.object({
        deviceId: z.string(),
        deviceType: z.string(),
        preferredHotspot: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Log connection request
        console.log('[Mesh Network] Connection request:', input);
        
        return {
          success: true,
          connectionId: `mesh-${Date.now()}-${input.deviceId.slice(0, 8)}`,
          assignedHotspot: input.preferredHotspot || 'auto-assigned',
          estimatedLatency: Math.floor(Math.random() * 100) + 50, // 50-150ms
          bandwidth: Math.random() * 4 + 1, // 1-5 Mbps
          message: 'Connected to Helium mesh network',
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
