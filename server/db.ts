import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  analytics,
  crawlerLogs,
  hotspots,
  InsertAnalytic,
  InsertCrawlerLog,
  InsertHotspot,
  InsertTask,
  InsertUser,
  InsertWebhookEvent,
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

// Helium-Manus Integration Queries
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
