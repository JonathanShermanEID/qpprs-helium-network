/**
 * Hybrid Network Router - Fiber Optic & Cable Connections
 * Author: Jonathan Sherman - Monaco Edition 🏎️
 * 
 * Manages fiber optic and cable connections linking LoRa mesh nodes
 * with traditional high-speed infrastructure for complete network coverage
 */

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";

export const hybridNetworkRouter = router({
  // Get all fiber connections
  listFiber: publicProcedure.query(async () => {
    const { getFiberConnections } = await import("../db");
    return getFiberConnections();
  }),

  // Get all cable connections
  listCable: publicProcedure.query(async () => {
    const { getCableConnections } = await import("../db");
    return getCableConnections();
  }),

  // Get connection by ID
  getConnection: publicProcedure
    .input(z.object({ 
      connectionId: z.string(),
      type: z.enum(["fiber", "cable"])
    }))
    .query(async ({ input }) => {
      if (input.type === "fiber") {
        const { getFiberConnectionById } = await import("../db");
        return getFiberConnectionById(input.connectionId);
      } else {
        const { getCableConnectionById } = await import("../db");
        return getCableConnectionById(input.connectionId);
      }
    }),

  // Get connections for a specific node
  getNodeConnections: publicProcedure
    .input(z.object({ nodeId: z.string() }))
    .query(async ({ input }) => {
      const { getConnectionsByNode } = await import("../db");
      return getConnectionsByNode(input.nodeId);
    }),

  // Get network topology (all connections)
  getTopology: publicProcedure.query(async () => {
    const { getFiberConnections, getCableConnections } = await import("../db");
    const [fiber, cable] = await Promise.all([
      getFiberConnections(),
      getCableConnections()
    ]);
    
    return {
      fiber,
      cable,
      total_connections: fiber.length + cable.length,
      active_connections: [
        ...fiber.filter(f => f.status === "active"),
        ...cable.filter(c => c.status === "active")
      ].length
    };
  }),

  // Get connection statistics
  getStats: publicProcedure.query(async () => {
    const { getFiberConnections, getCableConnections } = await import("../db");
    const [fiber, cable] = await Promise.all([
      getFiberConnections(),
      getCableConnections()
    ]);

    return {
      fiber: {
        total: fiber.length,
        active: fiber.filter(f => f.status === "active").length,
        inactive: fiber.filter(f => f.status === "inactive").length,
        maintenance: fiber.filter(f => f.status === "maintenance").length,
        types: {
          "single-mode": fiber.filter(f => f.type === "single-mode").length,
          "multi-mode": fiber.filter(f => f.type === "multi-mode").length,
          "dark-fiber": fiber.filter(f => f.type === "dark-fiber").length,
        }
      },
      cable: {
        total: cable.length,
        active: cable.filter(c => c.status === "active").length,
        inactive: cable.filter(c => c.status === "inactive").length,
        maintenance: cable.filter(c => c.status === "maintenance").length,
        types: {
          cat5e: cable.filter(c => c.type === "cat5e").length,
          cat6: cable.filter(c => c.type === "cat6").length,
          cat6a: cable.filter(c => c.type === "cat6a").length,
          coax: cable.filter(c => c.type === "coax").length,
        }
      }
    };
  }),
});
