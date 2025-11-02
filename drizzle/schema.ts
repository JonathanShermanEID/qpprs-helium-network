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

/**
 * Conversation Monitoring & Recovery System
 * Author: Jonathan Sherman - Monaco Edition
 */

// Conversation backups (snapshots taken on screen lock)
export const conversationBackups = mysqlTable("conversationBackups", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: varchar("conversationId", { length: 255 }).notNull(),
  conversationTitle: text("conversationTitle"),
  authorOpenId: varchar("authorOpenId", { length: 64 }).notNull(),
  authorName: text("authorName"),
  contentSnapshot: text("contentSnapshot").notNull(), // Full conversation JSON
  messageCount: int("messageCount").default(0),
  backupTrigger: mysqlEnum("backupTrigger", ["screen_lock", "manual", "scheduled", "authorship_change"]).notNull(),
  backupLocation: text("backupLocation"), // S3 URL or local path
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Authorship change detection log
export const authorshipChanges = mysqlTable("authorshipChanges", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: varchar("conversationId", { length: 255 }).notNull(),
  originalAuthorOpenId: varchar("originalAuthorOpenId", { length: 64 }).notNull(),
  originalAuthorName: text("originalAuthorName"),
  newAuthorOpenId: varchar("newAuthorOpenId", { length: 64 }).notNull(),
  newAuthorName: text("newAuthorName"),
  changeDetectedAt: timestamp("changeDetectedAt").defaultNow().notNull(),
  contentBeforeChange: text("contentBeforeChange"), // Backup before change
  contentAfterChange: text("contentAfterChange"), // Content after change
  restorationStatus: mysqlEnum("restorationStatus", ["pending", "restored", "failed", "ignored"]).default("pending"),
  restoredAt: timestamp("restoredAt"),
});

// Conversation scan history
export const conversationScans = mysqlTable("conversationScans", {
  id: int("id").autoincrement().primaryKey(),
  scanType: mysqlEnum("scanType", ["full_scan", "incremental", "authorship_check"]).notNull(),
  conversationsScanned: int("conversationsScanned").default(0),
  changesDetected: int("changesDetected").default(0),
  backupsCreated: int("backupsCreated").default(0),
  authorshipChangesFound: int("authorshipChangesFound").default(0),
  scanDurationMs: int("scanDurationMs"),
  scanStatus: mysqlEnum("scanStatus", ["running", "completed", "failed"]).default("running"),
  errorMessage: text("errorMessage"),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

// Screen lock events (iOS)
export const screenLockEvents = mysqlTable("screenLockEvents", {
  id: int("id").autoincrement().primaryKey(),
  deviceId: varchar("deviceId", { length: 255 }).notNull(),
  lockType: mysqlEnum("lockType", ["screen_lock", "screen_unlock", "page_hidden", "page_visible"]).notNull(),
  backupTriggered: int("backupTriggered").default(0), // boolean as int
  conversationsBackedUp: int("conversationsBackedUp").default(0),
  eventTimestamp: timestamp("eventTimestamp").defaultNow().notNull(),
});

export type ConversationBackup = typeof conversationBackups.$inferSelect;
export type InsertConversationBackup = typeof conversationBackups.$inferInsert;
export type AuthorshipChange = typeof authorshipChanges.$inferSelect;
export type InsertAuthorshipChange = typeof authorshipChanges.$inferInsert;
export type ConversationScan = typeof conversationScans.$inferSelect;
export type InsertConversationScan = typeof conversationScans.$inferInsert;
export type ScreenLockEvent = typeof screenLockEvents.$inferSelect;
export type InsertScreenLockEvent = typeof screenLockEvents.$inferInsert;

/**
 * 3D Digital Certification System
 * Author: Jonathan Sherman - Monaco Edition
 */

// 3D Digital Certificates
export const digitalCertificates = mysqlTable("digitalCertificates", {
  id: int("id").autoincrement().primaryKey(),
  certificateId: varchar("certificateId", { length: 255 }).notNull().unique(),
  certificateType: mysqlEnum("certificateType", [
    "conversation_backup",
    "authorship_verification", 
    "device_authentication",
    "network_certification",
    "master_artifact"
  ]).notNull(),
  holderOpenId: varchar("holderOpenId", { length: 64 }).notNull(),
  holderName: text("holderName"),
  subjectId: varchar("subjectId", { length: 255 }).notNull(), // conversation ID, device ID, etc.
  subjectTitle: text("subjectTitle"),
  verificationHash: varchar("verificationHash", { length: 64 }).notNull(), // SHA-256 hash
  certificate3DModel: text("certificate3DModel"), // GLB/GLTF model URL
  certificateMetadata: text("certificateMetadata"), // JSON metadata
  issuedAt: timestamp("issuedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
  revokedAt: timestamp("revokedAt"),
  revocationReason: text("revocationReason"),
  validationStatus: mysqlEnum("validationStatus", ["valid", "expired", "revoked", "pending"]).default("valid"),
});

export type DigitalCertificate = typeof digitalCertificates.$inferSelect;
export type InsertDigitalCertificate = typeof digitalCertificates.$inferInsert;

/**
 * Coverage Opportunities - New areas for network expansion
 */
export const coverageOpportunities = mysqlTable("coverage_opportunities", {
  id: int("id").autoincrement().primaryKey(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 50 }).notNull(),
  country: varchar("country", { length: 50 }).notNull().default("USA"),
  latitude: varchar("latitude", { length: 20 }).notNull(),
  longitude: varchar("longitude", { length: 20 }).notNull(),
  populationDensity: int("population_density"), // people per sq km
  estimatedHotspots: int("estimated_hotspots"), // recommended hotspot count
  coverageGap: varchar("coverage_gap", { length: 20 }), // percentage
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium"),
  status: mysqlEnum("status", ["detected", "analyzing", "planned", "deploying", "active"]).default("detected"),
  deploymentRecommendations: text("deployment_recommendations"),
  estimatedRevenue: int("estimated_revenue"), // monthly USD
  competitorPresence: varchar("competitor_presence", { length: 20 }), // percentage
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CoverageOpportunity = typeof coverageOpportunities.$inferSelect;
export type InsertCoverageOpportunity = typeof coverageOpportunities.$inferInsert;


/**
 * Cryptocurrency Payment System
 * Bitcoin wallet and Coinbase Commerce integration
 * Author: Jonathan Sherman - Monaco Edition
 */

// Crypto Wallets Configuration
export const cryptoWallets = mysqlTable("crypto_wallets", {
  id: int("id").autoincrement().primaryKey(),
  walletType: mysqlEnum("wallet_type", ["bitcoin", "ethereum", "coinbase_commerce"]).notNull(),
  walletAddress: varchar("wallet_address", { length: 255 }).notNull(),
  walletName: varchar("wallet_name", { length: 100 }),
  currency: varchar("currency", { length: 10 }).notNull(), // BTC, ETH, USDC, USDT
  isActive: int("is_active").default(1).notNull(),
  isPrimary: int("is_primary").default(0).notNull(),
  qrCodeUrl: text("qr_code_url"),
  metadata: text("metadata"), // JSON: additional wallet info
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Payment Transactions
export const cryptoTransactions = mysqlTable("crypto_transactions", {
  id: int("id").autoincrement().primaryKey(),
  transactionHash: varchar("transaction_hash", { length: 255 }).unique(),
  walletId: int("wallet_id").notNull(),
  fromAddress: varchar("from_address", { length: 255 }),
  toAddress: varchar("to_address", { length: 255 }).notNull(),
  amount: varchar("amount", { length: 50 }).notNull(), // Store as string to preserve precision
  currency: varchar("currency", { length: 10 }).notNull(),
  usdValue: varchar("usd_value", { length: 50 }), // USD equivalent at time of transaction
  status: mysqlEnum("status", ["pending", "confirming", "confirmed", "completed", "failed", "expired"]).default("pending").notNull(),
  confirmations: int("confirmations").default(0),
  requiredConfirmations: int("required_confirmations").default(3),
  paymentType: mysqlEnum("payment_type", ["hotspot_deployment", "telecom_service", "network_expansion", "subscription", "other"]),
  invoiceId: int("invoice_id"),
  customerId: varchar("customer_id", { length: 100 }),
  customerEmail: varchar("customer_email", { length: 320 }),
  metadata: text("metadata"), // JSON: additional transaction data
  webhookData: text("webhook_data"), // JSON: raw webhook payload
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  confirmedAt: timestamp("confirmedAt"),
  completedAt: timestamp("completedAt"),
});

// Payment Invoices
export const cryptoInvoices = mysqlTable("crypto_invoices", {
  id: int("id").autoincrement().primaryKey(),
  invoiceNumber: varchar("invoice_number", { length: 50 }).unique().notNull(),
  customerId: varchar("customer_id", { length: 100 }),
  customerName: varchar("customer_name", { length: 255 }),
  customerEmail: varchar("customer_email", { length: 320 }),
  description: text("description").notNull(),
  amount: varchar("amount", { length: 50 }).notNull(),
  currency: varchar("currency", { length: 10 }).notNull(),
  usdValue: varchar("usd_value", { length: 50 }),
  status: mysqlEnum("status", ["draft", "pending", "paid", "partially_paid", "overdue", "cancelled"]).default("pending").notNull(),
  paymentType: mysqlEnum("payment_type", ["hotspot_deployment", "telecom_service", "network_expansion", "subscription", "other"]),
  coinbaseChargeId: varchar("coinbase_charge_id", { length: 255 }),
  coinbaseChargeUrl: text("coinbase_charge_url"),
  qrCodeUrl: text("qr_code_url"),
  paymentAddress: varchar("payment_address", { length: 255 }),
  expiresAt: timestamp("expiresAt"),
  paidAt: timestamp("paidAt"),
  metadata: text("metadata"), // JSON: line items, notes, etc.
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Payment Analytics
export const cryptoPaymentAnalytics = mysqlTable("crypto_payment_analytics", {
  id: int("id").autoincrement().primaryKey(),
  date: varchar("date", { length: 20 }).notNull(), // YYYY-MM-DD
  currency: varchar("currency", { length: 10 }).notNull(),
  totalTransactions: int("total_transactions").default(0),
  successfulTransactions: int("successful_transactions").default(0),
  failedTransactions: int("failed_transactions").default(0),
  totalVolume: varchar("total_volume", { length: 50 }).default("0"),
  totalUsdValue: varchar("total_usd_value", { length: 50 }).default("0"),
  averageTransactionValue: varchar("average_transaction_value", { length: 50 }).default("0"),
  metadata: text("metadata"), // JSON: additional analytics
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CryptoWallet = typeof cryptoWallets.$inferSelect;
export type InsertCryptoWallet = typeof cryptoWallets.$inferInsert;
export type CryptoTransaction = typeof cryptoTransactions.$inferSelect;
export type InsertCryptoTransaction = typeof cryptoTransactions.$inferInsert;
export type CryptoInvoice = typeof cryptoInvoices.$inferSelect;
export type InsertCryptoInvoice = typeof cryptoInvoices.$inferInsert;
export type CryptoPaymentAnalytic = typeof cryptoPaymentAnalytics.$inferSelect;
export type InsertCryptoPaymentAnalytic = typeof cryptoPaymentAnalytics.$inferInsert;


// Phone Number Security Verification System
export const phoneVerificationLogs = mysqlTable("phone_verification_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  mtnEndpoint: text("mtn_endpoint"),
  verizonBillingData: text("verizon_billing_data"),
  verificationStatus: mysqlEnum("verification_status", ["pending", "verified", "failed", "suspicious"]).notNull(),
  discrepanciesFound: text("discrepancies_found"),
  hackingDetected: int("hacking_detected").default(0).notNull(), // 0 = no, 1 = yes
  featureChangesDetected: int("feature_changes_detected").default(0).notNull(), // 0 = no, 1 = yes
  verifiedAt: timestamp("verified_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mtnEndpoints = mysqlTable("mtn_endpoints", {
  id: int("id").autoincrement().primaryKey(),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull().unique(),
  endpointUrl: text("endpoint_url").notNull(),
  endpointData: text("endpoint_data"),
  features: text("features"), // JSON string of active features
  lastScanned: timestamp("last_scanned").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const verizonBillingRecords = mysqlTable("verizon_billing_records", {
  id: int("id").autoincrement().primaryKey(),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull().unique(),
  billingData: text("billing_data").notNull(),
  activeFeatures: text("active_features"), // JSON string of features from Verizon
  accountStatus: varchar("account_status", { length: 50 }),
  lastSynced: timestamp("last_synced").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type PhoneVerificationLog = typeof phoneVerificationLogs.$inferSelect;
export type InsertPhoneVerificationLog = typeof phoneVerificationLogs.$inferInsert;
export type MtnEndpoint = typeof mtnEndpoints.$inferSelect;
export type InsertMtnEndpoint = typeof mtnEndpoints.$inferInsert;
export type VerizonBillingRecord = typeof verizonBillingRecords.$inferSelect;
export type InsertVerizonBillingRecord = typeof verizonBillingRecords.$inferInsert;
