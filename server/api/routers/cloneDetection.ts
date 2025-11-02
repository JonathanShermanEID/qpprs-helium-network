/**
 * Clone Detection Router
 * Author: Jonathan Sherman - Monaco Edition
 * 
 * Provides API endpoints for clone detection and device blocking
 */

import { z } from "zod";
import { router, publicProcedure } from "../../_core/trpc";
import { iphoneXROnlyProcedure } from "../../_core/iphoneXRProcedure";
import { getDb } from "../../db";
import { 
  cloneDetectionAttempts, 
  blockedDevices, 
  authenticDevices,
  cloneDetectionStats 
} from "../../../drizzle/schema";
import { 
  detectClone, 
  blockDevice, 
  isDeviceBlocked, 
  getBlockedDevices,
  type DeviceFingerprint 
} from "../../utils/cloneDetection";
import { eq, desc, and } from "drizzle-orm";

const deviceFingerprintSchema = z.object({
  userAgent: z.string(),
  platform: z.string(),
  screenResolution: z.string(),
  colorDepth: z.number(),
  timezone: z.string(),
  language: z.string(),
  hardwareConcurrency: z.number(),
  deviceMemory: z.number().optional(),
  maxTouchPoints: z.number(),
  vendor: z.string(),
  vendorSub: z.string(),
  productSub: z.string(),
  oscpu: z.string().optional(),
  webGLRenderer: z.string().optional(),
  webGLVendor: z.string().optional(),
  canvas: z.string().optional(),
  audio: z.string().optional(),
});

export const cloneDetectionRouter = router({
  /**
   * Check if device is a clone/emulator
   * Public endpoint - used during authentication
   */
  checkDevice: publicProcedure
    .input(z.object({
      device: deviceFingerprintSchema,
      ipAddress: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      // Run clone detection
      const result = detectClone(input.device);

      // Check if device is already blocked
      const existingBlock = await db
        .select()
        .from(blockedDevices)
        .where(eq(blockedDevices.fingerprint, result.fingerprint))
        .limit(1);

      const isBlocked = existingBlock.length > 0 || result.isClone;

      // Log the attempt
      await db.insert(cloneDetectionAttempts).values({
        fingerprint: result.fingerprint,
        deviceType: result.deviceType,
        confidence: result.confidence.toString(),
        isBlocked: isBlocked ? 1 : 0,
        userAgent: input.device.userAgent,
        platform: input.device.platform,
        screenResolution: input.device.screenResolution,
        ipAddress: input.ipAddress,
        reasons: JSON.stringify(result.reasons),
        timestamp: result.timestamp,
      });

      // If clone detected and not already blocked, add to blocked devices
      if (result.isClone && existingBlock.length === 0) {
        await db.insert(blockedDevices).values({
          fingerprint: result.fingerprint,
          deviceType: result.deviceType === 'authentic' ? 'clone' : result.deviceType,
          blockReason: result.reasons.join('; '),
          attemptCount: 1,
          firstAttempt: result.timestamp,
          lastAttempt: result.timestamp,
          ipAddresses: input.ipAddress ? JSON.stringify([input.ipAddress]) : null,
          isPermanent: 1,
          blockedBy: 'system',
        });

        // Block in memory as well
        blockDevice(result.fingerprint);
      } else if (existingBlock.length > 0) {
        // Update attempt count and last attempt time
        const currentIPs = existingBlock[0].ipAddresses 
          ? JSON.parse(existingBlock[0].ipAddresses) 
          : [];
        
        if (input.ipAddress && !currentIPs.includes(input.ipAddress)) {
          currentIPs.push(input.ipAddress);
        }

        await db
          .update(blockedDevices)
          .set({
            attemptCount: existingBlock[0].attemptCount + 1,
            lastAttempt: result.timestamp,
            ipAddresses: JSON.stringify(currentIPs),
          })
          .where(eq(blockedDevices.id, existingBlock[0].id));
      }

      // Update daily statistics
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayStats = await db
        .select()
        .from(cloneDetectionStats)
        .where(eq(cloneDetectionStats.date, today))
        .limit(1);

      if (todayStats.length === 0) {
        // Create new stats entry
        await db.insert(cloneDetectionStats).values({
          date: today,
          totalAttempts: 1,
          authenticAttempts: result.deviceType === 'authentic' ? 1 : 0,
          cloneAttempts: result.deviceType === 'clone' ? 1 : 0,
          emulatorAttempts: result.deviceType === 'emulator' ? 1 : 0,
          vmAttempts: result.deviceType === 'vm' ? 1 : 0,
          blockedAttempts: isBlocked ? 1 : 0,
          uniqueFingerprints: 1,
          averageConfidence: result.confidence.toString(),
        });
      } else {
        // Update existing stats
        const stats = todayStats[0];
        const newTotal = stats.totalAttempts + 1;
        const newAvgConfidence = (
          (parseFloat(stats.averageConfidence || '0') * stats.totalAttempts + result.confidence) / 
          newTotal
        ).toFixed(2);

        await db
          .update(cloneDetectionStats)
          .set({
            totalAttempts: newTotal,
            authenticAttempts: stats.authenticAttempts + (result.deviceType === 'authentic' ? 1 : 0),
            cloneAttempts: stats.cloneAttempts + (result.deviceType === 'clone' ? 1 : 0),
            emulatorAttempts: stats.emulatorAttempts + (result.deviceType === 'emulator' ? 1 : 0),
            vmAttempts: stats.vmAttempts + (result.deviceType === 'vm' ? 1 : 0),
            blockedAttempts: stats.blockedAttempts + (isBlocked ? 1 : 0),
            averageConfidence: newAvgConfidence,
          })
          .where(eq(cloneDetectionStats.id, stats.id));
      }

      return {
        ...result,
        isBlocked,
        message: isBlocked 
          ? 'Device blocked: Clone or emulator detected' 
          : 'Device verified as authentic',
      };
    }),

  /**
   * Get clone detection attempts (owner only)
   */
  getAttempts: iphoneXROnlyProcedure
    .input(z.object({
      limit: z.number().default(100),
      offset: z.number().default(0),
    }))
    .query(async ({ input }: { input: { limit: number; offset: number } }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const attempts = await db
        .select()
        .from(cloneDetectionAttempts)
        .orderBy(desc(cloneDetectionAttempts.timestamp))
        .limit(input.limit)
        .offset(input.offset);

      return attempts.map(attempt => ({
        ...attempt,
        reasons: attempt.reasons ? JSON.parse(attempt.reasons) : [],
      }));
    }),

  /**
   * Get blocked devices (owner only)
   */
  getBlockedDevices: iphoneXROnlyProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const blocked = await db
      .select()
      .from(blockedDevices)
      .orderBy(desc(blockedDevices.lastAttempt));

    return blocked.map(device => ({
      ...device,
      ipAddresses: device.ipAddresses ? JSON.parse(device.ipAddresses) : [],
    }));
  }),

  /**
   * Get authentic devices (owner only)
   */
  getAuthenticDevices: iphoneXROnlyProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    return await db
      .select()
      .from(authenticDevices)
      .where(eq(authenticDevices.isActive, 1))
      .orderBy(desc(authenticDevices.lastVerified));
  }),

  /**
   * Get clone detection statistics (owner only)
   */
  getStats: iphoneXROnlyProcedure
    .input(z.object({
      days: z.number().default(30),
    }))
    .query(async ({ input }: { input: { days: number } }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      const stats = await db
        .select()
        .from(cloneDetectionStats)
        .orderBy(desc(cloneDetectionStats.date))
        .limit(input.days);

      return stats;
    }),

  /**
   * Register authentic device (owner only)
   */
  registerAuthenticDevice: iphoneXROnlyProcedure
    .input(z.object({
      fingerprint: z.string(),
      deviceName: z.string(),
      deviceModel: z.string(),
      ownerName: z.string(),
      phoneNumber: z.string().optional(),
    }))
    .mutation(async ({ input }: { input: { fingerprint: string; deviceName: string; deviceModel: string; ownerName: string; phoneNumber?: string } }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      // Check if device already exists
      const existing = await db
        .select()
        .from(authenticDevices)
        .where(eq(authenticDevices.fingerprint, input.fingerprint))
        .limit(1);

      if (existing.length > 0) {
        // Update verification count and timestamp
        await db
          .update(authenticDevices)
          .set({
            verificationCount: existing[0].verificationCount + 1,
            lastVerified: new Date(),
          })
          .where(eq(authenticDevices.id, existing[0].id));

        return { success: true, message: 'Device verification updated' };
      }

      // Register new authentic device
      await db.insert(authenticDevices).values({
        fingerprint: input.fingerprint,
        deviceName: input.deviceName,
        deviceModel: input.deviceModel,
        ownerName: input.ownerName,
        phoneNumber: input.phoneNumber || null,
        isActive: 1,
        lastVerified: new Date(),
        verificationCount: 1,
        registeredAt: new Date(),
      });

      return { success: true, message: 'Authentic device registered' };
    }),

  /**
   * Unblock device (owner only - use with caution)
   */
  unblockDevice: iphoneXROnlyProcedure
    .input(z.object({
      fingerprint: z.string(),
    }))
    .mutation(async ({ input }: { input: { fingerprint: string } }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      await db
        .delete(blockedDevices)
        .where(eq(blockedDevices.fingerprint, input.fingerprint));

      return { success: true, message: 'Device unblocked' };
    }),
});
