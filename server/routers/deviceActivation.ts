import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { iphoneXROnlyProcedure } from "../_core/iphoneXRProcedure";
import { getDb } from "../db";
import { deviceActivations, deviceConfigurations, deviceFirmware, deviceProvisioningLogs, deviceOTAUpdates } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

/**
 * Device Activation & Programming System
 * Author: Jonathan Sherman - Monaco Edition
 * 
 * Provides comprehensive device lifecycle management:
 * - Device activation and registration
 * - Configuration management
 * - Firmware updates (OTA)
 * - Provisioning logs
 */

export const deviceActivationRouter = router({
  // Generate activation code for new device (iPhone XR ONLY)
  generateActivationCode: iphoneXROnlyProcedure
    .input(z.object({
      deviceType: z.enum(["hotspot", "gateway", "repeater", "phone"]),
      expiresInDays: z.number().default(30),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Generate unique activation code
      const activationCode = `${input.deviceType.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      const deviceId = `DEV-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + input.expiresInDays);

      await db.insert(deviceActivations).values({
        deviceId,
        deviceType: input.deviceType,
        activationCode,
        status: "pending",
        ownerId: "public",
        expiresAt,
      });

      return {
        deviceId,
        activationCode,
        deviceType: input.deviceType,
        expiresAt: expiresAt.toISOString(),
        status: "pending",
      };
    }),

  // Activate device with activation code
  activateDevice: publicProcedure
    .input(z.object({
      activationCode: z.string(),
      deviceInfo: z.object({
        serialNumber: z.string().optional(),
        macAddress: z.string().optional(),
        model: z.string().optional(),
      }).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [activation] = await db
        .select()
        .from(deviceActivations)
        .where(eq(deviceActivations.activationCode, input.activationCode))
        .limit(1);

      if (!activation) {
        throw new Error("Invalid activation code");
      }

      if (activation.status === "activated") {
        throw new Error("Device already activated");
      }

      if (activation.expiresAt && new Date(activation.expiresAt) < new Date()) {
        throw new Error("Activation code expired");
      }

      // Activate device
      await db
        .update(deviceActivations)
        .set({
          status: "activated",
          activatedAt: new Date(),
        })
        .where(eq(deviceActivations.activationCode, input.activationCode));

      // Create initial configuration
      await db.insert(deviceConfigurations).values({
        deviceId: activation.deviceId,
        firmwareVersion: "1.0.0",
        configData: JSON.stringify({
          serialNumber: input.deviceInfo?.serialNumber,
          macAddress: input.deviceInfo?.macAddress,
          model: input.deviceInfo?.model,
        }),
        networkSettings: JSON.stringify({
          dhcp: true,
          autoConnect: true,
        }),
        securitySettings: JSON.stringify({
          encryption: "AES-256",
          authMethod: "WPA3",
        }),
        lastProgrammedAt: new Date(),
        lastProgrammedBy: activation.ownerId,
      });

      // Log activation
      await db.insert(deviceProvisioningLogs).values({
        deviceId: activation.deviceId,
        action: "activate",
        status: "success",
        performedBy: activation.ownerId,
        details: JSON.stringify({
          activationCode: input.activationCode,
          deviceInfo: input.deviceInfo,
        }),
      });

      return {
        deviceId: activation.deviceId,
        deviceType: activation.deviceType,
        status: "activated",
        activatedAt: new Date().toISOString(),
      };
    }),

  // Get device configuration
  getDeviceConfig: publicProcedure
    .input(z.object({
      deviceId: z.string(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const [config] = await db
        .select()
        .from(deviceConfigurations)
        .where(eq(deviceConfigurations.deviceId, input.deviceId))
        .limit(1);

      if (!config) return null;

      return {
        deviceId: config.deviceId,
        firmwareVersion: config.firmwareVersion,
        config: config.configData ? JSON.parse(config.configData) : {},
        networkSettings: config.networkSettings ? JSON.parse(config.networkSettings) : {},
        securitySettings: config.securitySettings ? JSON.parse(config.securitySettings) : {},
        lastProgrammedAt: config.lastProgrammedAt?.toISOString(),
        lastProgrammedBy: config.lastProgrammedBy,
      };
    }),

  // Update device configuration (iPhone XR ONLY)
  updateDeviceConfig: iphoneXROnlyProcedure
    .input(z.object({
      deviceId: z.string(),
      config: z.object({}).passthrough().optional(),
      networkSettings: z.object({}).passthrough().optional(),
      securitySettings: z.object({}).passthrough().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const updateData: any = {
        lastProgrammedAt: new Date(),
        lastProgrammedBy: "public",
      };

      if (input.config) {
        updateData.configData = JSON.stringify(input.config);
      }
      if (input.networkSettings) {
        updateData.networkSettings = JSON.stringify(input.networkSettings);
      }
      if (input.securitySettings) {
        updateData.securitySettings = JSON.stringify(input.securitySettings);
      }

      await db
        .update(deviceConfigurations)
        .set(updateData)
        .where(eq(deviceConfigurations.deviceId, input.deviceId));

      // Log configuration update
      await db.insert(deviceProvisioningLogs).values({
        deviceId: input.deviceId,
        action: "configure",
        status: "success",
        performedBy: "public",
        details: JSON.stringify({
          config: input.config,
          networkSettings: input.networkSettings,
          securitySettings: input.securitySettings,
        }),
      });

      return { success: true };
    }),

  // List available firmware versions
  listFirmware: publicProcedure
    .input(z.object({
      deviceType: z.enum(["hotspot", "gateway", "repeater", "phone"]).optional(),
      stableOnly: z.boolean().default(true),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      let query = db.select().from(deviceFirmware);

      if (input.deviceType) {
        query = query.where(eq(deviceFirmware.deviceType, input.deviceType)) as any;
      }

      const firmware = await query.orderBy(desc(deviceFirmware.releaseDate));

      return firmware
        .filter(f => !input.stableOnly || f.isStable === 1)
        .map(f => ({
          firmwareId: f.firmwareId,
          version: f.version,
          deviceType: f.deviceType,
          releaseDate: f.releaseDate.toISOString(),
          downloadUrl: f.downloadUrl,
          fileSize: f.fileSize,
          releaseNotes: f.releaseNotes,
          isStable: f.isStable === 1,
        }));
    }),

  // Initiate OTA update (iPhone XR ONLY)
  initiateOTAUpdate: iphoneXROnlyProcedure
    .input(z.object({
      deviceId: z.string(),
      firmwareId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const updateId = `OTA-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

      await db.insert(deviceOTAUpdates).values({
        updateId,
        deviceId: input.deviceId,
        firmwareId: input.firmwareId,
        status: "queued",
        progress: 0,
      });

      // Log OTA initiation
      await db.insert(deviceProvisioningLogs).values({
        deviceId: input.deviceId,
        action: "ota_update",
        status: "pending",
        performedBy: "public",
        details: JSON.stringify({
          updateId,
          firmwareId: input.firmwareId,
        }),
      });

      return {
        updateId,
        status: "queued",
        message: "OTA update queued successfully",
      };
    }),

  // Get OTA update status
  getOTAStatus: publicProcedure
    .input(z.object({
      updateId: z.string(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const [update] = await db
        .select()
        .from(deviceOTAUpdates)
        .where(eq(deviceOTAUpdates.updateId, input.updateId))
        .limit(1);

      if (!update) return null;

      return {
        updateId: update.updateId,
        deviceId: update.deviceId,
        firmwareId: update.firmwareId,
        status: update.status,
        progress: update.progress,
        startedAt: update.startedAt?.toISOString(),
        completedAt: update.completedAt?.toISOString(),
        errorMessage: update.errorMessage,
      };
    }),

  // List all activated devices
  listActivatedDevices: publicProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) return [];

      const devices = await db
        .select()
        .from(deviceActivations)
        .orderBy(desc(deviceActivations.createdAt));

      return devices.map(d => ({
        deviceId: d.deviceId,
        deviceType: d.deviceType,
        activationCode: d.activationCode,
        status: d.status,
        activatedAt: d.activatedAt?.toISOString(),
        expiresAt: d.expiresAt?.toISOString(),
        createdAt: d.createdAt.toISOString(),
      }));
    }),

  // Get provisioning logs for device
  getProvisioningLogs: publicProcedure
    .input(z.object({
      deviceId: z.string(),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const logs = await db
        .select()
        .from(deviceProvisioningLogs)
        .where(eq(deviceProvisioningLogs.deviceId, input.deviceId))
        .orderBy(desc(deviceProvisioningLogs.createdAt))
        .limit(input.limit);

      return logs.map(log => ({
        id: log.id,
        deviceId: log.deviceId,
        action: log.action,
        status: log.status,
        performedBy: log.performedBy,
        details: log.details ? JSON.parse(log.details) : {},
        errorMessage: log.errorMessage,
        createdAt: log.createdAt.toISOString(),
      }));
    }),

  // Deactivate device (iPhone XR ONLY)
  deactivateDevice: iphoneXROnlyProcedure
    .input(z.object({
      deviceId: z.string(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(deviceActivations)
        .set({
          status: "deactivated",
        })
        .where(eq(deviceActivations.deviceId, input.deviceId));

      // Log deactivation
      await db.insert(deviceProvisioningLogs).values({
        deviceId: input.deviceId,
        action: "deactivate",
        status: "success",
        performedBy: "public",
        details: JSON.stringify({
          reason: input.reason,
        }),
      });

      return { success: true };
    }),
});
