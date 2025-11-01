/**
 * Seed Telecommunications Provisioning
 * Author: Jonathan Sherman - Monaco Edition 🏎️
 * 
 * Seeds voice, text (SMS), and data provisioning accounts
 * for complete telecommunications capabilities
 */

import { drizzle } from "drizzle-orm/mysql2";
import { voiceProvisioning, textProvisioning, dataProvisioning } from "../drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

// Voice Provisioning Accounts
const voiceData = [
  {
    userId: "user-001",
    phoneNumber: "+1-555-0101",
    status: "active",
    plan: "Unlimited Voice",
    minutesUsed: 1250,
    minutesAllowed: 999999,
    voipEnabled: 1,
  },
  {
    userId: "user-002",
    phoneNumber: "+1-555-0102",
    status: "active",
    plan: "Business 5000",
    minutesUsed: 3420,
    minutesAllowed: 5000,
    voipEnabled: 1,
  },
  {
    userId: "user-003",
    phoneNumber: "+1-555-0103",
    status: "active",
    plan: "Basic 500",
    minutesUsed: 287,
    minutesAllowed: 500,
    voipEnabled: 1,
  },
  {
    userId: "user-004",
    phoneNumber: "+1-555-0104",
    status: "suspended",
    plan: "Premium 2000",
    minutesUsed: 2100,
    minutesAllowed: 2000,
    voipEnabled: 0,
  },
  {
    userId: "user-005",
    phoneNumber: "+1-555-0105",
    status: "active",
    plan: "Enterprise Unlimited",
    minutesUsed: 8750,
    minutesAllowed: 999999,
    voipEnabled: 1,
  },
];

// Text/SMS Provisioning Accounts
const textData = [
  {
    userId: "user-001",
    phoneNumber: "+1-555-0101",
    status: "active",
    messagesUsed: 450,
    messagesAllowed: 999999,
    smsEnabled: 1,
    mmsEnabled: 1,
  },
  {
    userId: "user-002",
    phoneNumber: "+1-555-0102",
    status: "active",
    messagesUsed: 1200,
    messagesAllowed: 5000,
    smsEnabled: 1,
    mmsEnabled: 1,
  },
  {
    userId: "user-003",
    phoneNumber: "+1-555-0103",
    status: "active",
    messagesUsed: 89,
    messagesAllowed: 500,
    smsEnabled: 1,
    mmsEnabled: 0,
  },
  {
    userId: "user-004",
    phoneNumber: "+1-555-0104",
    status: "suspended",
    messagesUsed: 2500,
    messagesAllowed: 2000,
    smsEnabled: 0,
    mmsEnabled: 0,
  },
  {
    userId: "user-005",
    phoneNumber: "+1-555-0105",
    status: "active",
    messagesUsed: 3250,
    messagesAllowed: 999999,
    smsEnabled: 1,
    mmsEnabled: 1,
  },
];

// Data Provisioning Accounts
const dataData = [
  {
    userId: "user-001",
    status: "active",
    plan: "Unlimited Data",
    dataUsed: "45.2 GB",
    dataAllowed: "Unlimited",
    speed: "1 Gbps",
    qosLevel: "high",
  },
  {
    userId: "user-002",
    status: "active",
    plan: "Business 100GB",
    dataUsed: "67.8 GB",
    dataAllowed: "100 GB",
    speed: "500 Mbps",
    qosLevel: "high",
  },
  {
    userId: "user-003",
    status: "active",
    plan: "Basic 10GB",
    dataUsed: "3.2 GB",
    dataAllowed: "10 GB",
    speed: "100 Mbps",
    qosLevel: "medium",
  },
  {
    userId: "user-004",
    status: "suspended",
    plan: "Premium 50GB",
    dataUsed: "52.1 GB",
    dataAllowed: "50 GB",
    speed: "250 Mbps",
    qosLevel: "medium",
  },
  {
    userId: "user-005",
    status: "active",
    plan: "Enterprise Unlimited",
    dataUsed: "234.5 GB",
    dataAllowed: "Unlimited",
    speed: "10 Gbps",
    qosLevel: "high",
  },
];

async function seed() {
  console.log("📞 Seeding telecommunications provisioning...");
  
  try {
    // Insert voice provisioning
    console.log("🎙️  Inserting voice provisioning accounts...");
    for (const voice of voiceData) {
      await db.insert(voiceProvisioning).values(voice);
      console.log(`  ✓ ${voice.phoneNumber} - ${voice.plan} (${voice.minutesUsed}/${voice.minutesAllowed} mins)`);
    }
    
    // Insert text provisioning
    console.log("💬 Inserting text/SMS provisioning accounts...");
    for (const text of textData) {
      await db.insert(textProvisioning).values(text);
      console.log(`  ✓ ${text.phoneNumber} - ${text.messagesUsed}/${text.messagesAllowed} messages`);
    }
    
    // Insert data provisioning
    console.log("📊 Inserting data provisioning accounts...");
    for (const data of dataData) {
      await db.insert(dataProvisioning).values(data);
      console.log(`  ✓ User ${data.userId} - ${data.plan} (${data.dataUsed}/${data.dataAllowed})`);
    }
    
    console.log("\n✅ Telecommunications provisioning seeding complete!");
    console.log(`   Voice accounts: ${voiceData.length}`);
    console.log(`   Text accounts: ${textData.length}`);
    console.log(`   Data accounts: ${dataData.length}`);
    console.log(`   Total services: ${voiceData.length + textData.length + dataData.length}`);
    
  } catch (error) {
    console.error("❌ Error seeding telecommunications:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

seed();
