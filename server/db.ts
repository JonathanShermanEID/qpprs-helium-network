import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  analytics,
  crawlerLogs,
  creditTransformer,
  hotspots,
  InsertAnalytic,
  InsertCrawlerLog,
  InsertCreditTransformer,
  InsertHotspot,
  InsertRewardsBank,
  InsertTask,
  InsertUser,
  InsertWebhookEvent,
  rewardsBank,
  tasks,
  users,
  webhookEvents,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Q++RS Integration Queries
// Author: Jonathan Sherman

export async function getHotspots() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(hotspots);
  return result;
}

export async function getHotspotById(hotspotId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(hotspots).where(eq(hotspots.hotspotId, hotspotId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertHotspot(data: InsertHotspot) {
  const db = await getDb();
  if (!db) return;
  await db.insert(hotspots).values(data).onDuplicateKeyUpdate({
    set: {
      name: data.name,
      status: data.status,
      rewards: data.rewards,
      location: data.location,
      lastSeen: data.lastSeen,
      updatedAt: new Date(),
    },
  });
}

export async function getCrawlerLogs(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(crawlerLogs).orderBy(desc(crawlerLogs.createdAt)).limit(limit);
  return result;
}

export async function insertCrawlerLog(data: InsertCrawlerLog) {
  const db = await getDb();
  if (!db) return;
  await db.insert(crawlerLogs).values(data);
}

export async function getWebhookEvents(processed: boolean = false, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select()
    .from(webhookEvents)
    .where(eq(webhookEvents.processed, processed ? 1 : 0))
    .orderBy(desc(webhookEvents.createdAt))
    .limit(limit);
  return result;
}

export async function insertWebhookEvent(data: InsertWebhookEvent) {
  const db = await getDb();
  if (!db) return;
  await db.insert(webhookEvents).values(data);
}

export async function markWebhookProcessed(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(webhookEvents).set({ processed: 1 }).where(eq(webhookEvents.id, id));
}

export async function getTasks(status?: string, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  if (status) {
    const result = await db
      .select()
      .from(tasks)
      .where(eq(tasks.status, status as any))
      .orderBy(desc(tasks.createdAt))
      .limit(limit);
    return result;
  }
  const result = await db.select().from(tasks).orderBy(desc(tasks.createdAt)).limit(limit);
  return result;
}

export async function insertTask(data: InsertTask) {
  const db = await getDb();
  if (!db) return;
  await db.insert(tasks).values(data);
}

export async function updateTaskStatus(id: number, status: string, result?: string) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(tasks)
    .set({
      status: status as any,
      result,
      completedAt: status === "completed" || status === "failed" ? new Date() : undefined,
    })
    .where(eq(tasks.id, id));
}

export async function getAnalytics(metricType?: string, limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  if (metricType) {
    const result = await db
      .select()
      .from(analytics)
      .where(eq(analytics.metricType, metricType))
      .orderBy(desc(analytics.timestamp))
      .limit(limit);
    return result;
  }
  const result = await db.select().from(analytics).orderBy(desc(analytics.timestamp)).limit(limit);
  return result;
}

export async function insertAnalytic(data: InsertAnalytic) {
  const db = await getDb();
  if (!db) return;
  await db.insert(analytics).values(data);
}

// Owner-Only Rewards Banking Functions
// Author: Jonathan Sherman

export async function getOwnerRewards(ownerId: string) {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select()
    .from(rewardsBank)
    .where(eq(rewardsBank.ownerId, ownerId))
    .orderBy(desc(rewardsBank.createdAt));
  return result;
}

export async function getOwnerRewardsBalance(ownerId: string) {
  const db = await getDb();
  if (!db) return { total: "0", pending: "0", completed: "0" };
  
  const rewards = await db
    .select()
    .from(rewardsBank)
    .where(eq(rewardsBank.ownerId, ownerId));
  
  let total = 0;
  let pending = 0;
  let completed = 0;
  
  rewards.forEach(r => {
    const amount = parseFloat(r.amount) || 0;
    if (r.transactionType === "reward") {
      total += amount;
      if (r.status === "completed") completed += amount;
      if (r.status === "pending") pending += amount;
    } else if (r.transactionType === "withdrawal" && r.status === "completed") {
      total -= amount;
      completed -= amount;
    }
  });
  
  return {
    total: total.toFixed(8),
    pending: pending.toFixed(8),
    completed: completed.toFixed(8),
  };
}

export async function insertReward(data: InsertRewardsBank) {
  const db = await getDb();
  if (!db) return;
  // Only allow owner to insert rewards
  if (data.ownerId !== ENV.ownerOpenId) {
    throw new Error("Unauthorized: Only owner can access rewards bank");
  }
  await db.insert(rewardsBank).values(data);
}

export async function getRewardsByHotspot(ownerId: string, hotspotId: string) {
  const db = await getDb();
  if (!db) return [];
  if (ownerId !== ENV.ownerOpenId) {
    throw new Error("Unauthorized: Only owner can access rewards bank");
  }
  const result = await db
    .select()
    .from(rewardsBank)
    .where(eq(rewardsBank.hotspotId, hotspotId))
    .orderBy(desc(rewardsBank.createdAt));
  return result;
}

// Credit Transformer LLM Database Functions
// Author: Jonathan Sherman

export async function getCreditTransformerStatus(ownerId: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(creditTransformer)
    .where(eq(creditTransformer.ownerId, ownerId))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function activateCreditTransformerDB(ownerId: string, certification: string) {
  const db = await getDb();
  if (!db) return;
  
  const existing = await getCreditTransformerStatus(ownerId);
  
  if (existing) {
    // Update existing
    await db
      .update(creditTransformer)
      .set({
        isActivated: 1,
        activatedAt: new Date(),
        masterArtifactCertification: certification,
      })
      .where(eq(creditTransformer.ownerId, ownerId));
  } else {
    // Insert new
    await db.insert(creditTransformer).values({
      ownerId,
      isActivated: 1,
      activatedAt: new Date(),
      masterArtifactCertification: certification,
    });
  }
}

export async function updateCreditTransformerStats(
  ownerId: string,
  transformation: { creditsGenerated: string; shareholderValue: string; transformationRate: string }
) {
  const db = await getDb();
  if (!db) return;
  
  const current = await getCreditTransformerStatus(ownerId);
  if (!current) return;
  
  const newTotal = (parseFloat(current.totalCreditsTransformed || "0") + parseFloat(transformation.creditsGenerated)).toFixed(2);
  const newValue = (parseFloat(current.shareholderValue || "0") + parseFloat(transformation.shareholderValue)).toFixed(2);
  
  await db
    .update(creditTransformer)
    .set({
      totalCreditsTransformed: newTotal,
      shareholderValue: newValue,
      transformationRate: transformation.transformationRate,
    })
    .where(eq(creditTransformer.ownerId, ownerId));
}

// Hybrid Network Database Functions (Fiber & Cable)
// Author: Jonathan Sherman - Monaco Edition 🏎️

export async function getFiberConnections() {
  const { fiberConnections } = await import("../drizzle/schema");
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(fiberConnections);
  return result;
}

export async function getCableConnections() {
  const { cableConnections } = await import("../drizzle/schema");
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(cableConnections);
  return result;
}

export async function getFiberConnectionById(connectionId: string) {
  const { fiberConnections } = await import("../drizzle/schema");
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(fiberConnections)
    .where(eq(fiberConnections.connectionId, connectionId))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getCableConnectionById(connectionId: string) {
  const { cableConnections } = await import("../drizzle/schema");
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(cableConnections)
    .where(eq(cableConnections.connectionId, connectionId))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getConnectionsByNode(nodeId: string) {
  const { fiberConnections, cableConnections } = await import("../drizzle/schema");
  const db = await getDb();
  if (!db) return { fiber: [], cable: [] };
  
  const [fiber, cable] = await Promise.all([
    db.select().from(fiberConnections).where(
      eq(fiberConnections.sourceNodeId, nodeId)
    ),
    db.select().from(cableConnections).where(
      eq(cableConnections.sourceNodeId, nodeId)
    )
  ]);
  
  return { fiber, cable };
}

// Telecommunications Provisioning Database Functions
// Author: Jonathan Sherman - Monaco Edition 🏎️

export async function getVoiceProvisioning(userId: string) {
  const { voiceProvisioning } = await import("../drizzle/schema");
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(voiceProvisioning)
    .where(eq(voiceProvisioning.userId, userId))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllVoiceProvisioning() {
  const { voiceProvisioning } = await import("../drizzle/schema");
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(voiceProvisioning);
  return result;
}

export async function getTextProvisioning(userId: string) {
  const { textProvisioning } = await import("../drizzle/schema");
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(textProvisioning)
    .where(eq(textProvisioning.userId, userId))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllTextProvisioning() {
  const { textProvisioning } = await import("../drizzle/schema");
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(textProvisioning);
  return result;
}

export async function getDataProvisioning(userId: string) {
  const { dataProvisioning } = await import("../drizzle/schema");
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(dataProvisioning)
    .where(eq(dataProvisioning.userId, userId))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllDataProvisioning() {
  const { dataProvisioning } = await import("../drizzle/schema");
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(dataProvisioning);
  return result;
}
