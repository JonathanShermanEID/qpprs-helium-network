/**
 * Telecommunications Provisioning Router
 * Author: Jonathan Sherman - Monaco Edition 🏎️
 * 
 * Manages voice, text (SMS), and data provisioning for complete
 * telecommunications capabilities over the hybrid mesh network
 */

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";

export const telecomRouter = router({
  // Voice Provisioning
  voice: router({
    // Get voice provisioning for user
    get: publicProcedure
      .input(z.object({ userId: z.string() }))
      .query(async ({ input }) => {
        const { getVoiceProvisioning } = await import("../db");
        return getVoiceProvisioning(input.userId);
      }),

    // Get all voice accounts
    list: publicProcedure.query(async () => {
      const { getAllVoiceProvisioning } = await import("../db");
      return getAllVoiceProvisioning();
    }),

    // Get voice statistics
    stats: publicProcedure.query(async () => {
      const { getAllVoiceProvisioning } = await import("../db");
      const accounts = await getAllVoiceProvisioning();
      
      const totalMinutes = accounts.reduce((sum: number, acc: any) => sum + (acc.minutesUsed || 0), 0);
      const activeAccounts = accounts.filter((acc: any) => acc.status === "active");
      
      return {
        total_accounts: accounts.length,
        active_accounts: activeAccounts.length,
        total_minutes_used: totalMinutes,
        voip_enabled: accounts.filter((acc: any) => acc.voipEnabled).length,
      };
    }),
  }),

  // Text/SMS Provisioning
  text: router({
    // Get text provisioning for user
    get: publicProcedure
      .input(z.object({ userId: z.string() }))
      .query(async ({ input }) => {
        const { getTextProvisioning } = await import("../db");
        return getTextProvisioning(input.userId);
      }),

    // Get all text accounts
    list: publicProcedure.query(async () => {
      const { getAllTextProvisioning } = await import("../db");
      return getAllTextProvisioning();
    }),

    // Get text statistics
    stats: publicProcedure.query(async () => {
      const { getAllTextProvisioning } = await import("../db");
      const accounts = await getAllTextProvisioning();
      
      const totalMessages = accounts.reduce((sum: number, acc: any) => sum + (acc.messagesUsed || 0), 0);
      const activeAccounts = accounts.filter((acc: any) => acc.status === "active");
      
      return {
        total_accounts: accounts.length,
        active_accounts: activeAccounts.length,
        total_messages_sent: totalMessages,
        sms_enabled: accounts.filter((acc: any) => acc.smsEnabled).length,
        mms_enabled: accounts.filter((acc: any) => acc.mmsEnabled).length,
      };
    }),
  }),

  // Data Provisioning
  data: router({
    // Get data provisioning for user
    get: publicProcedure
      .input(z.object({ userId: z.string() }))
      .query(async ({ input }) => {
        const { getDataProvisioning } = await import("../db");
        return getDataProvisioning(input.userId);
      }),

    // Get all data accounts
    list: publicProcedure.query(async () => {
      const { getAllDataProvisioning } = await import("../db");
      return getAllDataProvisioning();
    }),

    // Get data statistics
    stats: publicProcedure.query(async () => {
      const { getAllDataProvisioning } = await import("../db");
      const accounts = await getAllDataProvisioning();
      
      const activeAccounts = accounts.filter((acc: any) => acc.status === "active");
      
      return {
        total_accounts: accounts.length,
        active_accounts: activeAccounts.length,
        qos_distribution: {
          high: accounts.filter((acc: any) => acc.qosLevel === "high").length,
          medium: accounts.filter((acc: any) => acc.qosLevel === "medium").length,
          low: accounts.filter((acc: any) => acc.qosLevel === "low").length,
        },
      };
    }),
  }),

  // Combined telecommunications overview
  overview: publicProcedure.query(async () => {
    const { getAllVoiceProvisioning, getAllTextProvisioning, getAllDataProvisioning } = await import("../db");
    const [voice, text, data] = await Promise.all([
      getAllVoiceProvisioning(),
      getAllTextProvisioning(),
      getAllDataProvisioning()
    ]);

    return {
      voice: {
        total: voice.length,
        active: voice.filter((v: any) => v.status === "active").length,
      },
      text: {
        total: text.length,
        active: text.filter((t: any) => t.status === "active").length,
      },
      data: {
        total: data.length,
        active: data.filter((d: any) => d.status === "active").length,
      },
      total_services: voice.length + text.length + data.length,
    };
  }),
});
