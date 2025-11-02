/**
 * Clone Detection Database Schema
 * Author: Jonathan Sherman - Monaco Edition
 */

import { int, mysqlTable, text, timestamp, varchar, decimal, mysqlEnum } from "drizzle-orm/mysql-core";

/**
 * Clone detection attempts log
 */
export const cloneDetectionAttempts = mysqlTable("clone_detection_attempts", {
  id: int("id").autoincrement().primaryKey(),
  fingerprint: varchar("fingerprint", { length: 64 }).notNull(),
  deviceType: mysqlEnum("device_type", ["authentic", "emulator", "clone", "vm", "unknown"]).notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(), // 0-100
  isBlocked: int("is_blocked").notNull().default(0), // 0 = not blocked, 1 = blocked
  userAgent: text("user_agent"),
  platform: varchar("platform", { length: 255 }),
  screenResolution: varchar("screen_resolution", { length: 50 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  reasons: text("reasons"), // JSON array of detection reasons
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

/**
 * Blocked devices registry
 */
export const blockedDevices = mysqlTable("blocked_devices", {
  id: int("id").autoincrement().primaryKey(),
  fingerprint: varchar("fingerprint", { length: 64 }).notNull().unique(),
  deviceType: mysqlEnum("device_type", ["emulator", "clone", "vm", "unknown"]).notNull(),
  blockReason: text("block_reason").notNull(),
  attemptCount: int("attempt_count").notNull().default(1),
  firstAttempt: timestamp("first_attempt").defaultNow().notNull(),
  lastAttempt: timestamp("last_attempt").defaultNow().notNull(),
  ipAddresses: text("ip_addresses"), // JSON array of IP addresses
  isPermanent: int("is_permanent").notNull().default(1), // 1 = permanent block
  blockedBy: varchar("blocked_by", { length: 255 }).default("system"),
});

/**
 * Authentic device whitelist
 */
export const authenticDevices = mysqlTable("authentic_devices", {
  id: int("id").autoincrement().primaryKey(),
  fingerprint: varchar("fingerprint", { length: 64 }).notNull().unique(),
  deviceName: varchar("device_name", { length: 255 }),
  deviceModel: varchar("device_model", { length: 100 }), // e.g., "iPhone11,8"
  ownerName: varchar("owner_name", { length: 255 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 20 }),
  isActive: int("is_active").notNull().default(1),
  lastVerified: timestamp("last_verified").defaultNow().notNull(),
  verificationCount: int("verification_count").notNull().default(1),
  registeredAt: timestamp("registered_at").defaultNow().notNull(),
});

/**
 * Clone detection statistics
 */
export const cloneDetectionStats = mysqlTable("clone_detection_stats", {
  id: int("id").autoincrement().primaryKey(),
  date: timestamp("date").defaultNow().notNull(),
  totalAttempts: int("total_attempts").notNull().default(0),
  authenticAttempts: int("authentic_attempts").notNull().default(0),
  cloneAttempts: int("clone_attempts").notNull().default(0),
  emulatorAttempts: int("emulator_attempts").notNull().default(0),
  vmAttempts: int("vm_attempts").notNull().default(0),
  blockedAttempts: int("blocked_attempts").notNull().default(0),
  uniqueFingerprints: int("unique_fingerprints").notNull().default(0),
  averageConfidence: decimal("average_confidence", { precision: 5, scale: 2 }),
});

export type CloneDetectionAttempt = typeof cloneDetectionAttempts.$inferSelect;
export type InsertCloneDetectionAttempt = typeof cloneDetectionAttempts.$inferInsert;

export type BlockedDevice = typeof blockedDevices.$inferSelect;
export type InsertBlockedDevice = typeof blockedDevices.$inferInsert;

export type AuthenticDevice = typeof authenticDevices.$inferSelect;
export type InsertAuthenticDevice = typeof authenticDevices.$inferInsert;

export type CloneDetectionStat = typeof cloneDetectionStats.$inferSelect;
export type InsertCloneDetectionStat = typeof cloneDetectionStats.$inferInsert;
