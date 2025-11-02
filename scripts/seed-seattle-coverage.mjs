/**
 * Seed Seattle Coverage Opportunity
 * Author: Jonathan Sherman - Monaco Edition
 */

import { drizzle } from "drizzle-orm/mysql2";
import { coverageOpportunities } from "../drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

async function seedSeattle() {
  console.log("🌲 Seeding Seattle coverage opportunity...");

  const seattleData = {
    city: "Seattle",
    state: "Washington",
    country: "USA",
    latitude: "47.6062",
    longitude: "-122.3321",
    populationDensity: 3594, // people per sq km
    estimatedHotspots: 250, // recommended hotspot count for Seattle metro
    coverageGap: "68%", // current coverage gap
    priority: "critical",
    status: "detected",
    deploymentRecommendations: JSON.stringify({
      zones: [
        {
          name: "Downtown Seattle",
          priority: "critical",
          recommendedHotspots: 80,
          reason: "High population density, tech hub, major commercial center"
        },
        {
          name: "Capitol Hill",
          priority: "high",
          recommendedHotspots: 40,
          reason: "Dense residential area, high foot traffic"
        },
        {
          name: "University District",
          priority: "high",
          recommendedHotspots: 35,
          reason: "University of Washington campus, student population"
        },
        {
          name: "Ballard",
          priority: "medium",
          recommendedHotspots: 25,
          reason: "Growing neighborhood, maritime industry"
        },
        {
          name: "Fremont",
          priority: "medium",
          recommendedHotspots: 20,
          reason: "Tech companies, residential area"
        },
        {
          name: "South Lake Union",
          priority: "critical",
          recommendedHotspots: 50,
          reason: "Amazon HQ, major tech presence, rapid development"
        }
      ],
      estimatedCost: 125000, // USD for 250 hotspots
      timelineMonths: 6,
      keyPartners: ["Amazon", "Microsoft", "University of Washington", "Port of Seattle"],
      regulatoryNotes: "FCC Part 15 compliant, no special permits required for LoRa 915MHz"
    }),
    estimatedRevenue: 18500, // monthly USD
    competitorPresence: "32%", // Helium competitors
  };

  await db.insert(coverageOpportunities).values(seattleData);

  console.log("✅ Seattle coverage opportunity seeded successfully!");
  console.log(`📍 Location: ${seattleData.city}, ${seattleData.state}`);
  console.log(`🎯 Priority: ${seattleData.priority}`);
  console.log(`📊 Coverage Gap: ${seattleData.coverageGap}`);
  console.log(`🔌 Recommended Hotspots: ${seattleData.estimatedHotspots}`);
  console.log(`💰 Estimated Monthly Revenue: $${seattleData.estimatedRevenue}`);
  
  process.exit(0);
}

seedSeattle().catch((error) => {
  console.error("❌ Error seeding Seattle coverage:", error);
  process.exit(1);
});
