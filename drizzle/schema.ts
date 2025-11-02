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

// Helium Network Gateways & Repeaters
// Author: Jonathan Sherman
export const gateways = mysqlTable("gateways", {
  id: int("id").autoincrement().primaryKey(),
  gatewayId: varchar("gatewayId", { length: 128 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  type: mysqlEnum("type", ["primary", "secondary", "edge"]).default("secondary").notNull(),
  status: mysqlEnum("status", ["online", "offline", "maintenance"]).default("offline").notNull(),
  location: text("location"),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  signalStrength: varchar("signalStrength", { length: 20 }),
  connectedHotspots: int("connectedHotspots").default(0).notNull(),
  bandwidth: varchar("bandwidth", { length: 50 }),
  uptime: varchar("uptime", { length: 50 }),
  lastSeen: timestamp("lastSeen"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const repeaters = mysqlTable("repeaters", {
  id: int("id").autoincrement().primaryKey(),
  repeaterId: varchar("repeaterId", { length: 128 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  gatewayId: varchar("gatewayId", { length: 128 }),
  status: mysqlEnum("status", ["online", "offline", "maintenance"]).default("offline").notNull(),
  location: text("location"),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  signalStrength: varchar("signalStrength", { length: 20 }),
  amplificationFactor: varchar("amplificationFactor", { length: 20 }).default("2.0"),
  coverageRadius: varchar("coverageRadius", { length: 50 }),
  connectedDevices: int("connectedDevices").default(0).notNull(),
  powerMode: mysqlEnum("powerMode", ["high", "medium", "low", "eco"]).default("medium").notNull(),
  lastSeen: timestamp("lastSeen"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Gateway = typeof gateways.$inferSelect;
export type InsertGateway = typeof gateways.$inferInsert;
export type Repeater = typeof repeaters.$inferSelect;
export type InsertRepeater = typeof repeaters.$inferInsert;

// Fiber Optic & Cable Connections (Hybrid Network)
// Author: Jonathan Sherman
export const fiberConnections = mysqlTable("fiberConnections", {
  id: int("id").autoincrement().primaryKey(),
  connectionId: varchar("connectionId", { length: 128 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  type: mysqlEnum("type", ["single-mode", "multi-mode", "dark-fiber"]).default("single-mode").notNull(),
  status: mysqlEnum("status", ["active", "inactive", "maintenance"]).default("inactive").notNull(),
  sourceNodeId: varchar("sourceNodeId", { length: 128 }),
  targetNodeId: varchar("targetNodeId", { length: 128 }),
  bandwidth: varchar("bandwidth", { length: 50 }),
  latency: varchar("latency", { length: 50 }),
  distance: varchar("distance", { length: 50 }),
  installDate: timestamp("installDate"),
  lastMaintenance: timestamp("lastMaintenance"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const cableConnections = mysqlTable("cableConnections", {
  id: int("id").autoincrement().primaryKey(),
  connectionId: varchar("connectionId", { length: 128 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  type: mysqlEnum("type", ["cat5e", "cat6", "cat6a", "coax"]).default("cat6").notNull(),
  status: mysqlEnum("status", ["active", "inactive", "maintenance"]).default("inactive").notNull(),
  sourceNodeId: varchar("sourceNodeId", { length: 128 }),
  targetNodeId: varchar("targetNodeId", { length: 128 }),
  bandwidth: varchar("bandwidth", { length: 50 }),
  distance: varchar("distance", { length: 50 }),
  installDate: timestamp("installDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Voice, Text & Data Provisioning
// Author: Jonathan Sherman
export const voiceProvisioning = mysqlTable("voiceProvisioning", {
  id: int("id").autoincrement().primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  phoneNumber: varchar("phoneNumber", { length: 20 }).notNull().unique(),
  status: mysqlEnum("status", ["active", "suspended", "terminated"]).default("active").notNull(),
  plan: varchar("plan", { length: 64 }),
  minutesUsed: int("minutesUsed").default(0).notNull(),
  minutesAllowed: int("minutesAllowed").default(0).notNull(),
  voipEnabled: int("voipEnabled").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const textProvisioning = mysqlTable("textProvisioning", {
  id: int("id").autoincrement().primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  phoneNumber: varchar("phoneNumber", { length: 20 }).notNull(),
  status: mysqlEnum("status", ["active", "suspended", "terminated"]).default("active").notNull(),
  messagesUsed: int("messagesUsed").default(0).notNull(),
  messagesAllowed: int("messagesAllowed").default(0).notNull(),
  smsEnabled: int("smsEnabled").default(1).notNull(),
  mmsEnabled: int("mmsEnabled").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const dataProvisioning = mysqlTable("dataProvisioning", {
  id: int("id").autoincrement().primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["active", "suspended", "terminated"]).default("active").notNull(),
  plan: varchar("plan", { length: 64 }),
  dataUsed: varchar("dataUsed", { length: 50 }).default("0"),
  dataAllowed: varchar("dataAllowed", { length: 50 }).default("0"),
  speed: varchar("speed", { length: 50 }),
  qosLevel: mysqlEnum("qosLevel", ["high", "medium", "low"]).default("medium").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FiberConnection = typeof fiberConnections.$inferSelect;
export type InsertFiberConnection = typeof fiberConnections.$inferInsert;
export type CableConnection = typeof cableConnections.$inferSelect;
export type InsertCableConnection = typeof cableConnections.$inferInsert;
export type VoiceProvisioning = typeof voiceProvisioning.$inferSelect;
export type InsertVoiceProvisioning = typeof voiceProvisioning.$inferInsert;
export type TextProvisioning = typeof textProvisioning.$inferSelect;
export type InsertTextProvisioning = typeof textProvisioning.$inferInsert;
export type DataProvisioning = typeof dataProvisioning.$inferSelect;
export type InsertDataProvisioning = typeof dataProvisioning.$inferInsert;

// Device Activation & Programming System
// Author: Jonathan Sherman - Monaco Edition
export const deviceActivations = mysqlTable("deviceActivations", {
  id: int("id").autoincrement().primaryKey(),
  deviceId: varchar("deviceId", { length: 128 }).notNull().unique(),
  deviceType: mysqlEnum("deviceType", ["hotspot", "gateway", "repeater", "phone"]).notNull(),
  activationCode: varchar("activationCode", { length: 64 }).notNull().unique(),
  status: mysqlEnum("status", ["pending", "activated", "deactivated", "suspended"]).default("pending").notNull(),
  ownerId: varchar("ownerId", { length: 64 }).notNull(),
  activatedAt: timestamp("activatedAt"),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const deviceConfigurations = mysqlTable("deviceConfigurations", {
  id: int("id").autoincrement().primaryKey(),
  deviceId: varchar("deviceId", { length: 128 }).notNull().unique(),
  firmwareVersion: varchar("firmwareVersion", { length: 32 }),
  configData: text("configData"), // JSON configuration
  networkSettings: text("networkSettings"), // JSON network config
  securitySettings: text("securitySettings"), // JSON security config
  lastProgrammedAt: timestamp("lastProgrammedAt"),
  lastProgrammedBy: varchar("lastProgrammedBy", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const deviceFirmware = mysqlTable("deviceFirmware", {
  id: int("id").autoincrement().primaryKey(),
  firmwareId: varchar("firmwareId", { length: 128 }).notNull().unique(),
  version: varchar("version", { length: 32 }).notNull(),
  deviceType: mysqlEnum("deviceType", ["hotspot", "gateway", "repeater", "phone"]).notNull(),
  releaseDate: timestamp("releaseDate").notNull(),
  downloadUrl: varchar("downloadUrl", { length: 512 }),
  checksum: varchar("checksum", { length: 128 }),
  fileSize: varchar("fileSize", { length: 50 }),
  releaseNotes: text("releaseNotes"),
  isStable: int("isStable").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const deviceProvisioningLogs = mysqlTable("deviceProvisioningLogs", {
  id: int("id").autoincrement().primaryKey(),
  deviceId: varchar("deviceId", { length: 128 }).notNull(),
  action: varchar("action", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["success", "failed", "pending"]).default("pending").notNull(),
  performedBy: varchar("performedBy", { length: 64 }),
  details: text("details"), // JSON details
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const deviceOTAUpdates = mysqlTable("deviceOTAUpdates", {
  id: int("id").autoincrement().primaryKey(),
  updateId: varchar("updateId", { length: 128 }).notNull().unique(),
  deviceId: varchar("deviceId", { length: 128 }).notNull(),
  firmwareId: varchar("firmwareId", { length: 128 }).notNull(),
  status: mysqlEnum("status", ["queued", "downloading", "installing", "completed", "failed"]).default("queued").notNull(),
  progress: int("progress").default(0).notNull(), // 0-100
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DeviceActivation = typeof deviceActivations.$inferSelect;
export type InsertDeviceActivation = typeof deviceActivations.$inferInsert;
export type DeviceConfiguration = typeof deviceConfigurations.$inferSelect;
export type InsertDeviceConfiguration = typeof deviceConfigurations.$inferInsert;
export type DeviceFirmware = typeof deviceFirmware.$inferSelect;
export type InsertDeviceFirmware = typeof deviceFirmware.$inferInsert;
export type DeviceProvisioningLog = typeof deviceProvisioningLogs.$inferSelect;
export type InsertDeviceProvisioningLog = typeof deviceProvisioningLogs.$inferInsert;
export type DeviceOTAUpdate = typeof deviceOTAUpdates.$inferSelect;
export type InsertDeviceOTAUpdate = typeof deviceOTAUpdates.$inferInsert;
