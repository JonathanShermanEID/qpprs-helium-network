/**
 * Seed Hybrid Network Connections
 * Author: Jonathan Sherman - Monaco Edition 🏎️
 * 
 * Seeds fiber optic and cable connections linking LoRa mesh nodes
 * with traditional high-speed infrastructure
 */

import { drizzle } from "drizzle-orm/mysql2";
import { fiberConnections, cableConnections } from "../drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

// Fiber Optic Connections (linking major hotspot nodes)
const fiberData = [
  {
    connectionId: "fiber-nyc-la-001",
    name: "NYC to LA Backbone",
    type: "single-mode",
    status: "active",
    sourceNodeId: "tall-crimson-urchin",
    targetNodeId: "steep-azure-shark",
    bandwidth: "100 Gbps",
    latency: "65ms",
    distance: "2,789 miles",
    installDate: new Date("2024-01-15"),
    lastMaintenance: new Date("2024-10-01"),
  },
  {
    connectionId: "fiber-sf-seattle-002",
    name: "SF to Seattle Link",
    type: "multi-mode",
    status: "active",
    sourceNodeId: "steep-azure-shark",
    targetNodeId: "swift-emerald-falcon",
    bandwidth: "40 Gbps",
    latency: "12ms",
    distance: "808 miles",
    installDate: new Date("2024-02-20"),
    lastMaintenance: new Date("2024-09-15"),
  },
  {
    connectionId: "fiber-chicago-miami-003",
    name: "Chicago to Miami Route",
    type: "single-mode",
    status: "active",
    sourceNodeId: "bright-sapphire-eagle",
    targetNodeId: "bold-ruby-panther",
    bandwidth: "100 Gbps",
    latency: "28ms",
    distance: "1,377 miles",
    installDate: new Date("2024-03-10"),
    lastMaintenance: new Date("2024-10-20"),
  },
  {
    connectionId: "fiber-boston-atlanta-004",
    name: "Boston to Atlanta Fiber",
    type: "dark-fiber",
    status: "active",
    sourceNodeId: "quick-violet-raven",
    targetNodeId: "fierce-amber-wolf",
    bandwidth: "200 Gbps",
    latency: "18ms",
    distance: "1,095 miles",
    installDate: new Date("2024-04-05"),
    lastMaintenance: new Date("2024-11-01"),
  },
  {
    connectionId: "fiber-denver-austin-005",
    name: "Denver to Austin Link",
    type: "single-mode",
    status: "active",
    sourceNodeId: "noble-jade-tiger",
    targetNodeId: "mighty-gold-lion",
    bandwidth: "100 Gbps",
    latency: "15ms",
    distance: "930 miles",
    installDate: new Date("2024-05-12"),
    lastMaintenance: new Date("2024-10-28"),
  },
];

// Cable Connections (local area connections)
const cableData = [
  {
    connectionId: "cable-nyc-local-001",
    name: "NYC Local Network",
    type: "cat6a",
    status: "active",
    sourceNodeId: "tall-crimson-urchin",
    targetNodeId: "gateway-nyc-001",
    bandwidth: "10 Gbps",
    distance: "500 feet",
    installDate: new Date("2024-01-20"),
  },
  {
    connectionId: "cable-la-local-002",
    name: "LA Distribution Hub",
    type: "cat6",
    status: "active",
    sourceNodeId: "steep-azure-shark",
    targetNodeId: "gateway-la-001",
    bandwidth: "1 Gbps",
    distance: "300 feet",
    installDate: new Date("2024-02-15"),
  },
  {
    connectionId: "cable-sf-local-003",
    name: "SF Access Point",
    type: "cat6a",
    status: "active",
    sourceNodeId: "swift-emerald-falcon",
    targetNodeId: "gateway-sf-001",
    bandwidth: "10 Gbps",
    distance: "450 feet",
    installDate: new Date("2024-03-01"),
  },
  {
    connectionId: "cable-chicago-local-004",
    name: "Chicago Metro Link",
    type: "cat6",
    status: "active",
    sourceNodeId: "bright-sapphire-eagle",
    targetNodeId: "gateway-chi-001",
    bandwidth: "1 Gbps",
    distance: "350 feet",
    installDate: new Date("2024-03-15"),
  },
  {
    connectionId: "cable-miami-local-005",
    name: "Miami Coastal Node",
    type: "cat6a",
    status: "active",
    sourceNodeId: "bold-ruby-panther",
    targetNodeId: "gateway-mia-001",
    bandwidth: "10 Gbps",
    distance: "400 feet",
    installDate: new Date("2024-04-01"),
  },
  {
    connectionId: "cable-seattle-local-006",
    name: "Seattle Hub Connection",
    type: "coax",
    status: "active",
    sourceNodeId: "swift-emerald-falcon",
    targetNodeId: "gateway-sea-001",
    bandwidth: "500 Mbps",
    distance: "250 feet",
    installDate: new Date("2024-04-10"),
  },
];

async function seed() {
  console.log("🌐 Seeding hybrid network connections...");
  
  try {
    // Insert fiber connections
    console.log("📡 Inserting fiber optic connections...");
    for (const fiber of fiberData) {
      await db.insert(fiberConnections).values(fiber);
      console.log(`  ✓ ${fiber.name} (${fiber.bandwidth})`);
    }
    
    // Insert cable connections
    console.log("🔌 Inserting cable connections...");
    for (const cable of cableData) {
      await db.insert(cableConnections).values(cable);
      console.log(`  ✓ ${cable.name} (${cable.bandwidth})`);
    }
    
    console.log("\n✅ Hybrid network seeding complete!");
    console.log(`   Fiber connections: ${fiberData.length}`);
    console.log(`   Cable connections: ${cableData.length}`);
    console.log(`   Total connections: ${fiberData.length + cableData.length}`);
    
  } catch (error) {
    console.error("❌ Error seeding hybrid network:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

seed();
