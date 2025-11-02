/**
 * Seed Coverage Opportunities Data
 * Adds Seattle and other major cities as network expansion opportunities
 * Author: Jonathan Sherman - Monaco Edition
 */

import { drizzle } from "drizzle-orm/mysql2";
import { coverageOpportunities } from "../drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

const opportunities = [
  {
    city: "Seattle",
    state: "Washington",
    country: "USA",
    latitude: "47.6062",
    longitude: "-122.3321",
    populationDensity: 3594, // people per sq km
    estimatedHotspots: 45,
    coverageGap: "68%",
    priority: "critical",
    status: "analyzing",
    deploymentRecommendations: JSON.stringify({
      zones: [
        { name: "Downtown Seattle", recommendedHotspots: 12, priority: "critical" },
        { name: "Capitol Hill", recommendedHotspots: 8, priority: "high" },
        { name: "Ballard", recommendedHotspots: 7, priority: "high" },
        { name: "University District", recommendedHotspots: 9, priority: "high" },
        { name: "Fremont", recommendedHotspots: 5, priority: "medium" },
        { name: "Queen Anne", recommendedHotspots: 4, priority: "medium" }
      ],
      notes: "Seattle has high IoT adoption, strong tech presence, and significant coverage gaps. Amazon HQ and Microsoft proximity make this a strategic market. Target deployment: Q2 2025."
    }),
    estimatedRevenue: 18500, // monthly USD
    competitorPresence: "32%"
  },
  {
    city: "Portland",
    state: "Oregon",
    country: "USA",
    latitude: "45.5152",
    longitude: "-122.6784",
    populationDensity: 1900,
    estimatedHotspots: 32,
    coverageGap: "55%",
    priority: "high",
    status: "detected",
    deploymentRecommendations: JSON.stringify({
      zones: [
        { name: "Pearl District", recommendedHotspots: 8, priority: "high" },
        { name: "Alberta Arts", recommendedHotspots: 6, priority: "medium" },
        { name: "Hawthorne", recommendedHotspots: 7, priority: "medium" },
        { name: "Northwest District", recommendedHotspots: 6, priority: "medium" },
        { name: "Sellwood", recommendedHotspots: 5, priority: "low" }
      ],
      notes: "Portland has growing IoT ecosystem and sustainability focus. Good market for LoRa mesh networks."
    }),
    estimatedRevenue: 12800,
    competitorPresence: "28%"
  },
  {
    city: "Las Vegas",
    state: "Nevada",
    country: "USA",
    latitude: "36.1699",
    longitude: "-115.1398",
    populationDensity: 1800,
    estimatedHotspots: 38,
    coverageGap: "72%",
    priority: "critical",
    status: "planned",
    deploymentRecommendations: JSON.stringify({
      zones: [
        { name: "Las Vegas Strip", recommendedHotspots: 10, priority: "critical" },
        { name: "Downtown Vegas", recommendedHotspots: 8, priority: "high" },
        { name: "Henderson", recommendedHotspots: 7, priority: "high" },
        { name: "Summerlin", recommendedHotspots: 8, priority: "medium" },
        { name: "North Las Vegas", recommendedHotspots: 5, priority: "medium" }
      ],
      notes: "Casino and hospitality IoT demand is massive. Smart city initiatives underway. High revenue potential."
    }),
    estimatedRevenue: 22400,
    competitorPresence: "18%"
  },
  {
    city: "Salt Lake City",
    state: "Utah",
    country: "USA",
    latitude: "40.7608",
    longitude: "-111.8910",
    populationDensity: 1700,
    estimatedHotspots: 28,
    coverageGap: "61%",
    priority: "high",
    status: "detected",
    deploymentRecommendations: JSON.stringify({
      zones: [
        { name: "Downtown SLC", recommendedHotspots: 9, priority: "high" },
        { name: "Sugar House", recommendedHotspots: 6, priority: "medium" },
        { name: "The Avenues", recommendedHotspots: 5, priority: "medium" },
        { name: "Millcreek", recommendedHotspots: 5, priority: "low" },
        { name: "Sandy", recommendedHotspots: 3, priority: "low" }
      ],
      notes: "Growing tech hub with Silicon Slopes. Good market for enterprise IoT solutions."
    }),
    estimatedRevenue: 9600,
    competitorPresence: "24%"
  },
  {
    city: "Boise",
    state: "Idaho",
    country: "USA",
    latitude: "43.6150",
    longitude: "-116.2023",
    populationDensity: 1100,
    estimatedHotspots: 18,
    coverageGap: "78%",
    priority: "medium",
    status: "detected",
    deploymentRecommendations: JSON.stringify({
      zones: [
        { name: "Downtown Boise", recommendedHotspots: 6, priority: "high" },
        { name: "North End", recommendedHotspots: 4, priority: "medium" },
        { name: "Boise Bench", recommendedHotspots: 4, priority: "medium" },
        { name: "Garden City", recommendedHotspots: 4, priority: "low" }
      ],
      notes: "Emerging tech market with low competition. Early mover advantage available."
    }),
    estimatedRevenue: 6200,
    competitorPresence: "12%"
  }
];

async function seed() {
  console.log("🌍 Seeding coverage opportunities...");
  
  try {
    for (const opportunity of opportunities) {
      await db.insert(coverageOpportunities).values(opportunity);
      console.log(`✅ Added opportunity: ${opportunity.city}, ${opportunity.state}`);
    }
    
    console.log(`\n🎉 Successfully seeded ${opportunities.length} coverage opportunities!`);
    console.log("\nSummary:");
    console.log(`- Total estimated hotspots: ${opportunities.reduce((sum, o) => sum + o.estimatedHotspots, 0)}`);
    console.log(`- Total estimated monthly revenue: $${opportunities.reduce((sum, o) => sum + o.estimatedRevenue, 0).toLocaleString()}`);
    console.log(`- Average coverage gap: ${(opportunities.reduce((sum, o) => sum + parseFloat(o.coverageGap), 0) / opportunities.length).toFixed(1)}%`);
    
  } catch (error) {
    console.error("❌ Error seeding coverage opportunities:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

seed();
