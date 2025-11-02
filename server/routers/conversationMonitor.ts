/**
 * Conversation Monitoring & Recovery Router
 * Author: Jonathan Sherman - Monaco Edition
 * 
 * APIs for scanning Manus conversations, detecting authorship changes,
 * and creating/restoring backups.
 */

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { iphoneXROnlyProcedure } from "../_core/iphoneXRProcedure";
import { getDb } from "../db";
import {
  conversationBackups,
  authorshipChanges,
  conversationScans,
  screenLockEvents,
} from "../../drizzle/schema";
import { desc, eq } from "drizzle-orm";
import { manusAPI } from "../_core/manusApiClient";
import { storagePut } from "../storage";

export const conversationMonitorRouter = router({
  /**
   * Scan Manus account for conversations (iPhone XR ONLY)
   */
  scanConversations: iphoneXROnlyProcedure
    .input(z.object({
      userOpenId: z.string(),
      scanType: z.enum(["full_scan", "incremental", "authorship_check"]).default("full_scan"),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const startTime = Date.now();
      const scanId = `SCAN-${Date.now()}`;

      // Create scan record
      await db.insert(conversationScans).values({
        scanType: input.scanType,
        scanStatus: "running",
        startedAt: new Date(),
      });

      try {
        // Scan conversations from Manus API
        const result = await manusAPI.scanConversations(input.userOpenId);

        console.log(`[Conversation Monitor] Scanned ${result.totalCount} conversations`);

        // Process each conversation
        let backupsCreated = 0;
        for (const conversation of result.conversations) {
          // Create backup snapshot
          const contentSnapshot = JSON.stringify(conversation);
          
          // Upload to S3 for redundancy
          const backupKey = `conversation-backups/${conversation.id}/${Date.now()}.json`;
          const { url: backupUrl } = await storagePut(
            backupKey,
            contentSnapshot,
            "application/json"
          );

          // Save to database
          await db.insert(conversationBackups).values({
            conversationId: conversation.id,
            conversationTitle: conversation.title,
            authorOpenId: conversation.authorOpenId,
            authorName: conversation.authorName,
            contentSnapshot,
            messageCount: conversation.messages.length,
            backupTrigger: "manual",
            backupLocation: backupUrl,
          });

          backupsCreated++;
        }

        // Log authorship changes
        for (const change of result.authorshipChanges) {
          await db.insert(authorshipChanges).values({
            conversationId: change.conversationId,
            originalAuthorOpenId: change.originalAuthor.openId,
            originalAuthorName: change.originalAuthor.name,
            newAuthorOpenId: change.newAuthor.openId,
            newAuthorName: change.newAuthor.name,
            changeDetectedAt: new Date(change.detectedAt),
            restorationStatus: "pending",
          });
        }

        // Update scan record
        const scanDuration = Date.now() - startTime;
        await db.update(conversationScans).set({
          conversationsScanned: result.totalCount,
          changesDetected: result.authorshipChanges.length,
          backupsCreated,
          authorshipChangesFound: result.authorshipChanges.length,
          scanDurationMs: scanDuration,
          scanStatus: "completed",
          completedAt: new Date(),
        }).where(eq(conversationScans.scanType, input.scanType));

        return {
          success: true,
          conversationsScanned: result.totalCount,
          backupsCreated,
          authorshipChangesFound: result.authorshipChanges.length,
          scanDurationMs: scanDuration,
        };
      } catch (error) {
        // Update scan record with error
        await db.update(conversationScans).set({
          scanStatus: "failed",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
          completedAt: new Date(),
        }).where(eq(conversationScans.scanType, input.scanType));

        throw error;
      }
    }),

  /**
   * Trigger backup on screen lock event (iPhone XR ONLY)
   */
  onScreenLock: iphoneXROnlyProcedure
    .input(z.object({
      deviceId: z.string(),
      lockType: z.enum(["screen_lock", "screen_unlock", "page_hidden", "page_visible"]),
      userOpenId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Log screen lock event
      await db.insert(screenLockEvents).values({
        deviceId: input.deviceId,
        lockType: input.lockType,
        eventTimestamp: new Date(),
      });

      // Only trigger backup on screen lock or page hidden
      if (input.lockType === "screen_lock" || input.lockType === "page_hidden") {
        console.log('[Conversation Monitor] Screen lock detected, triggering backup...');

        // Scan and backup conversations
        const result = await manusAPI.scanConversations(input.userOpenId);

        let backupsCreated = 0;
        for (const conversation of result.conversations) {
          const contentSnapshot = JSON.stringify(conversation);
          
          // Upload to S3
          const backupKey = `conversation-backups/${conversation.id}/${Date.now()}.json`;
          const { url: backupUrl } = await storagePut(
            backupKey,
            contentSnapshot,
            "application/json"
          );

          // Save to database
          await db.insert(conversationBackups).values({
            conversationId: conversation.id,
            conversationTitle: conversation.title,
            authorOpenId: conversation.authorOpenId,
            authorName: conversation.authorName,
            contentSnapshot,
            messageCount: conversation.messages.length,
            backupTrigger: "screen_lock",
            backupLocation: backupUrl,
          });

          backupsCreated++;
        }

        // Update screen lock event with backup count
        await db.update(screenLockEvents).set({
          backupTriggered: 1,
          conversationsBackedUp: backupsCreated,
        }).where(eq(screenLockEvents.deviceId, input.deviceId));

        console.log(`[Conversation Monitor] ✅ Created ${backupsCreated} backups on screen lock`);

        return {
          success: true,
          backupsCreated,
        };
      }

      return {
        success: true,
        backupsCreated: 0,
      };
    }),

  /**
   * Restore conversation with original authorship (iPhone XR ONLY)
   */
  restoreConversation: iphoneXROnlyProcedure
    .input(z.object({
      authorshipChangeId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get authorship change record
      const changes = await db
        .select()
        .from(authorshipChanges)
        .where(eq(authorshipChanges.id, input.authorshipChangeId))
        .limit(1);

      if (changes.length === 0) {
        throw new Error("Authorship change not found");
      }

      const change = changes[0];

      // Get the most recent backup before the change
      const backups = await db
        .select()
        .from(conversationBackups)
        .where(eq(conversationBackups.conversationId, change.conversationId))
        .orderBy(desc(conversationBackups.createdAt))
        .limit(1);

      if (backups.length === 0) {
        throw new Error("No backup found for this conversation");
      }

      const backup = backups[0];

      // Restore conversation using Manus API
      const restored = await manusAPI.restoreConversation(
        change.conversationId,
        backup.contentSnapshot,
        change.originalAuthorOpenId
      );

      if (restored) {
        // Update authorship change status
        await db.update(authorshipChanges).set({
          restorationStatus: "restored",
          restoredAt: new Date(),
        }).where(eq(authorshipChanges.id, input.authorshipChangeId));

        console.log(`[Conversation Monitor] ✅ Restored conversation ${change.conversationId}`);

        return {
          success: true,
          conversationId: change.conversationId,
          restoredFrom: backup.createdAt.toISOString(),
        };
      } else {
        // Update authorship change status
        await db.update(authorshipChanges).set({
          restorationStatus: "failed",
        }).where(eq(authorshipChanges.id, input.authorshipChangeId));

        throw new Error("Failed to restore conversation");
      }
    }),

  /**
   * Get all authorship changes (read-only, public access)
   */
  getAuthorshipChanges: publicProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) return [];

      const changes = await db
        .select()
        .from(authorshipChanges)
        .orderBy(desc(authorshipChanges.changeDetectedAt))
        .limit(100);

      return changes.map(c => ({
        id: c.id,
        conversationId: c.conversationId,
        originalAuthor: {
          openId: c.originalAuthorOpenId,
          name: c.originalAuthorName,
        },
        newAuthor: {
          openId: c.newAuthorOpenId,
          name: c.newAuthorName,
        },
        changeDetectedAt: c.changeDetectedAt.toISOString(),
        restorationStatus: c.restorationStatus,
        restoredAt: c.restoredAt?.toISOString(),
      }));
    }),

  /**
   * Get conversation backups (read-only, public access)
   */
  getBackups: publicProcedure
    .input(z.object({
      conversationId: z.string().optional(),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      let query = db.select().from(conversationBackups);

      if (input.conversationId) {
        query = query.where(eq(conversationBackups.conversationId, input.conversationId)) as any;
      }

      const backups = await query
        .orderBy(desc(conversationBackups.createdAt))
        .limit(input.limit);

      return backups.map(b => ({
        id: b.id,
        conversationId: b.conversationId,
        conversationTitle: b.conversationTitle,
        authorName: b.authorName,
        messageCount: b.messageCount,
        backupTrigger: b.backupTrigger,
        backupLocation: b.backupLocation,
        createdAt: b.createdAt.toISOString(),
      }));
    }),

  /**
   * Get scan history (read-only, public access)
   */
  getScanHistory: publicProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) return [];

      const scans = await db
        .select()
        .from(conversationScans)
        .orderBy(desc(conversationScans.startedAt))
        .limit(50);

      return scans.map(s => ({
        id: s.id,
        scanType: s.scanType,
        conversationsScanned: s.conversationsScanned,
        changesDetected: s.changesDetected,
        backupsCreated: s.backupsCreated,
        authorshipChangesFound: s.authorshipChangesFound,
        scanDurationMs: s.scanDurationMs,
        scanStatus: s.scanStatus,
        errorMessage: s.errorMessage,
        startedAt: s.startedAt.toISOString(),
        completedAt: s.completedAt?.toISOString(),
      }));
    }),
});
