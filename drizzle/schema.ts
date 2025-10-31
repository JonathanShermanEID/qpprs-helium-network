import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Helium-Manus Integration Tables
// Author: Jonathan Sherman

export const hotspots = mysqlTable("hotspots", {
  id: int("id").autoincrement().primaryKey(),
  hotspotId: varchar("hotspotId", { length: 128 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  status: mysqlEnum("status", ["online", "offline", "syncing"]).default("offline").notNull(),
  rewards: varchar("rewards", { length: 50 }),
  location: text("location"),
  lastSeen: timestamp("lastSeen"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const crawlerLogs = mysqlTable("crawlerLogs", {
  id: int("id").autoincrement().primaryKey(),
  crawlerId: varchar("crawlerId", { length: 128 }).notNull(),
  crawlerType: varchar("crawlerType", { length: 64 }).notNull(),
  consciousnessLevel: varchar("consciousnessLevel", { length: 10 }),
  insights: text("insights"),
  status: mysqlEnum("status", ["success", "error", "running"]).default("running").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const webhookEvents = mysqlTable("webhookEvents", {
  id: int("id").autoincrement().primaryKey(),
  eventType: varchar("eventType", { length: 64 }).notNull(),
  hotspotId: varchar("hotspotId", { length: 128 }),
  payload: text("payload"),
  processed: int("processed").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  taskType: varchar("taskType", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["pending", "running", "completed", "failed"]).default("pending").notNull(),
  hotspotId: varchar("hotspotId", { length: 128 }),
  result: text("result"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export const analytics = mysqlTable("analytics", {
  id: int("id").autoincrement().primaryKey(),
  metricType: varchar("metricType", { length: 64 }).notNull(),
  value: varchar("value", { length: 255 }).notNull(),
  metadata: text("metadata"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type Hotspot = typeof hotspots.$inferSelect;
export type InsertHotspot = typeof hotspots.$inferInsert;
export type CrawlerLog = typeof crawlerLogs.$inferSelect;
export type InsertCrawlerLog = typeof crawlerLogs.$inferInsert;
export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type InsertWebhookEvent = typeof webhookEvents.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;
export type Analytic = typeof analytics.$inferSelect;
export type InsertAnalytic = typeof analytics.$inferInsert;

// Owner-Only Rewards Banking System
// Author: Jonathan Sherman
export const rewardsBank = mysqlTable("rewardsBank", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: varchar("ownerId", { length: 64 }).notNull(),
  hotspotId: varchar("hotspotId", { length: 128 }),
  amount: varchar("amount", { length: 50 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("HNT").notNull(),
  transactionType: mysqlEnum("transactionType", ["reward", "withdrawal", "transfer"]).default("reward").notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("completed").notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RewardsBank = typeof rewardsBank.$inferSelect;
export type InsertRewardsBank = typeof rewardsBank.$inferInsert;

// Account Credit Transformer LLM System
// Master Artifact Certification Holder Only
// Author: Jonathan Sherman
export const creditTransformer = mysqlTable("creditTransformer", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: varchar("ownerId", { length: 64 }).notNull().unique(),
  isActivated: int("isActivated").default(0).notNull(), // 0 = inactive, 1 = active (irreversible)
  activatedAt: timestamp("activatedAt"),
  masterArtifactCertification: text("masterArtifactCertification"),
  shareholderValue: varchar("shareholderValue", { length: 50 }).default("0"),
  totalCreditsTransformed: varchar("totalCreditsTransformed", { length: 50 }).default("0"),
  transformationRate: varchar("transformationRate", { length: 20 }).default("1.0"),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CreditTransformer = typeof creditTransformer.$inferSelect;
export type InsertCreditTransformer = typeof creditTransformer.$inferInsert;