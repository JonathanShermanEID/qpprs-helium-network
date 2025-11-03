/**
 * Cryptocurrency Payment Router
 * Bitcoin wallet and Coinbase Commerce integration
 * iPhone XR EXCLUSIVE ACCESS ONLY - No clones, no other devices
 * Author: Jonathan Sherman - Monaco Edition
 */

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { iphoneXROnlyProcedure } from "../_core/iphoneXRProcedure";
import { coinbaseAutomation } from "../coinbaseAutomation";
import { getDb } from "../db";
import { 
  cryptoWallets, 
  cryptoTransactions, 
  cryptoInvoices,
  cryptoPaymentAnalytics 
} from "../../drizzle/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";

/**
 * ALL CRYPTOCURRENCY PAYMENT ENDPOINTS ARE IPHONE XR EXCLUSIVE
 * Only the authenticated iPhone XR device can access wallet and payment data
 * No passwords, no usernames - device fingerprint authentication only
 */

export const cryptoPaymentsRouter = router({
  // ============================================
  // WALLET MANAGEMENT (iPhone XR ONLY)
  // ============================================
  
  // List all configured crypto wallets
  listWallets: iphoneXROnlyProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    
    const wallets = await db
      .select()
      .from(cryptoWallets)
      .where(eq(cryptoWallets.isActive, 1))
      .orderBy(desc(cryptoWallets.isPrimary));
    
    return wallets;
  }),

  // Get primary Bitcoin wallet
  getPrimaryBitcoinWallet: iphoneXROnlyProcedure.query(async () => {
    const db = await getDb();
    if (!db) return null;
    
    const [wallet] = await db
      .select()
      .from(cryptoWallets)
      .where(
        and(
          eq(cryptoWallets.walletType, "bitcoin"),
          eq(cryptoWallets.isPrimary, 1),
          eq(cryptoWallets.isActive, 1)
        )
      )
      .limit(1);
    
    return wallet || null;
  }),

  // Add new crypto wallet
  addWallet: iphoneXROnlyProcedure
    .input(z.object({
      walletType: z.enum(["bitcoin", "ethereum", "coinbase_commerce"]),
      walletAddress: z.string(),
      walletName: z.string().optional(),
      currency: z.string(),
      isPrimary: z.boolean().optional(),
      qrCodeUrl: z.string().optional(),
      metadata: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // If setting as primary, unset other primary wallets of same type
      if (input.isPrimary) {
        await db
          .update(cryptoWallets)
          .set({ isPrimary: 0 })
          .where(eq(cryptoWallets.walletType, input.walletType));
      }

      const [result] = await db.insert(cryptoWallets).values({
        walletType: input.walletType,
        walletAddress: input.walletAddress,
        walletName: input.walletName || null,
        currency: input.currency,
        isPrimary: input.isPrimary ? 1 : 0,
        isActive: 1,
        qrCodeUrl: input.qrCodeUrl || null,
        metadata: input.metadata || null,
      });

      return { success: true, walletId: result.insertId };
    }),

  // Update wallet configuration
  updateWallet: iphoneXROnlyProcedure
    .input(z.object({
      walletId: z.number(),
      walletName: z.string().optional(),
      isPrimary: z.boolean().optional(),
      isActive: z.boolean().optional(),
      qrCodeUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const updateData: any = {};
      if (input.walletName !== undefined) updateData.walletName = input.walletName;
      if (input.isPrimary !== undefined) updateData.isPrimary = input.isPrimary ? 1 : 0;
      if (input.isActive !== undefined) updateData.isActive = input.isActive ? 1 : 0;
      if (input.qrCodeUrl !== undefined) updateData.qrCodeUrl = input.qrCodeUrl;

      await db
        .update(cryptoWallets)
        .set(updateData)
        .where(eq(cryptoWallets.id, input.walletId));

      return { success: true };
    }),

  // ============================================
  // TRANSACTION MANAGEMENT (iPhone XR ONLY)
  // ============================================

  // List all transactions
  listTransactions: iphoneXROnlyProcedure
    .input(z.object({
      limit: z.number().optional(),
      status: z.enum(["pending", "confirming", "confirmed", "completed", "failed", "expired"]).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      let query = db.select().from(cryptoTransactions);

      if (input.status) {
        query = query.where(eq(cryptoTransactions.status, input.status)) as any;
      }

      query = query.orderBy(desc(cryptoTransactions.createdAt)) as any;

      if (input.limit) {
        query = query.limit(input.limit) as any;
      }

      const transactions = await query;
      return transactions;
    }),

  // Get transaction by ID
  getTransaction: iphoneXROnlyProcedure
    .input(z.object({ transactionId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const [transaction] = await db
        .select()
        .from(cryptoTransactions)
        .where(eq(cryptoTransactions.id, input.transactionId))
        .limit(1);

      return transaction || null;
    }),

  // Create new transaction record
  createTransaction: iphoneXROnlyProcedure
    .input(z.object({
      walletId: z.number(),
      fromAddress: z.string().optional(),
      toAddress: z.string(),
      amount: z.string(),
      currency: z.string(),
      usdValue: z.string().optional(),
      paymentType: z.enum(["hotspot_deployment", "telecom_service", "network_expansion", "subscription", "other"]).optional(),
      invoiceId: z.number().optional(),
      customerId: z.string().optional(),
      customerEmail: z.string().optional(),
      metadata: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [result] = await db.insert(cryptoTransactions).values({
        walletId: input.walletId,
        fromAddress: input.fromAddress || null,
        toAddress: input.toAddress,
        amount: input.amount,
        currency: input.currency,
        usdValue: input.usdValue || null,
        status: "pending",
        confirmations: 0,
        requiredConfirmations: 3,
        paymentType: input.paymentType || null,
        invoiceId: input.invoiceId || null,
        customerId: input.customerId || null,
        customerEmail: input.customerEmail || null,
        metadata: input.metadata || null,
      });

      return { success: true, transactionId: result.insertId };
    }),

  // Update transaction status
  updateTransactionStatus: iphoneXROnlyProcedure
    .input(z.object({
      transactionId: z.number(),
      status: z.enum(["pending", "confirming", "confirmed", "completed", "failed", "expired"]),
      confirmations: z.number().optional(),
      transactionHash: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const updateData: any = { status: input.status };
      if (input.confirmations !== undefined) updateData.confirmations = input.confirmations;
      if (input.transactionHash) updateData.transactionHash = input.transactionHash;
      if (input.status === "confirmed") updateData.confirmedAt = new Date();
      if (input.status === "completed") updateData.completedAt = new Date();

      await db
        .update(cryptoTransactions)
        .set(updateData)
        .where(eq(cryptoTransactions.id, input.transactionId));

      return { success: true };
    }),

  // ============================================
  // INVOICE MANAGEMENT (iPhone XR ONLY)
  // ============================================

  // List all invoices
  listInvoices: iphoneXROnlyProcedure
    .input(z.object({
      limit: z.number().optional(),
      status: z.enum(["draft", "pending", "paid", "partially_paid", "overdue", "cancelled"]).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      let query = db.select().from(cryptoInvoices);

      if (input.status) {
        query = query.where(eq(cryptoInvoices.status, input.status)) as any;
      }

      query = query.orderBy(desc(cryptoInvoices.createdAt)) as any;

      if (input.limit) {
        query = query.limit(input.limit) as any;
      }

      const invoices = await query;
      return invoices;
    }),

  // Create new invoice
  createInvoice: iphoneXROnlyProcedure
    .input(z.object({
      invoiceNumber: z.string(),
      customerId: z.string().optional(),
      customerName: z.string().optional(),
      customerEmail: z.string().optional(),
      description: z.string(),
      amount: z.string(),
      currency: z.string(),
      usdValue: z.string().optional(),
      paymentType: z.enum(["hotspot_deployment", "telecom_service", "network_expansion", "subscription", "other"]).optional(),
      metadata: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [result] = await db.insert(cryptoInvoices).values({
        invoiceNumber: input.invoiceNumber,
        customerId: input.customerId || null,
        customerName: input.customerName || null,
        customerEmail: input.customerEmail || null,
        description: input.description,
        amount: input.amount,
        currency: input.currency,
        usdValue: input.usdValue || null,
        status: "pending",
        paymentType: input.paymentType || null,
        metadata: input.metadata || null,
      });

      return { success: true, invoiceId: result.insertId };
    }),

  // ============================================
  // PAYMENT ANALYTICS (iPhone XR ONLY)
  // ============================================

  // Get payment analytics summary
  getAnalyticsSummary: iphoneXROnlyProcedure
    .input(z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return {
          totalTransactions: 0,
          successfulTransactions: 0,
          failedTransactions: 0,
          totalVolumeBTC: "0",
          totalVolumeUSD: "0",
        };
      }

      let query = db.select().from(cryptoTransactions);

      if (input.startDate && input.endDate) {
        query = query.where(
          and(
            gte(cryptoTransactions.createdAt, new Date(input.startDate)),
            lte(cryptoTransactions.createdAt, new Date(input.endDate))
          )
        ) as any;
      }

      const transactions = await query;

      const summary = {
        totalTransactions: transactions.length,
        successfulTransactions: transactions.filter(t => t.status === "completed").length,
        failedTransactions: transactions.filter(t => t.status === "failed").length,
        totalVolumeBTC: transactions
          .filter(t => t.currency === "BTC")
          .reduce((sum, t) => sum + parseFloat(t.amount || "0"), 0)
          .toFixed(8),
        totalVolumeUSD: transactions
          .reduce((sum, t) => sum + parseFloat(t.usdValue || "0"), 0)
          .toFixed(2),
      };

      return summary;
    }),

  // Get recent payment activity
  getRecentActivity: iphoneXROnlyProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const limit = input.limit || 10;

      const transactions = await db
        .select()
        .from(cryptoTransactions)
        .orderBy(desc(cryptoTransactions.createdAt))
        .limit(limit);

      return transactions;
    }),

  // ============================================
  // AUTOMATED COINBASE SETUP (iPhone XR ONLY)
  // ============================================

  // One-click automated Coinbase wallet setup
  automatedCoinbaseSetup: iphoneXROnlyProcedure.mutation(async ({ ctx }) => {
    if (!ctx.user) throw new Error("User not authenticated");
    return await coinbaseAutomation.automatedSetup(ctx.user.id.toString());
  }),

  // Verify Coinbase API connection
  verifyCoinbaseConnection: iphoneXROnlyProcedure.query(async () => {
    return await coinbaseAutomation.verifyConnection();
  }),

  // Sync wallet balances from Coinbase
  syncWalletBalances: iphoneXROnlyProcedure
    .input(z.object({ walletIds: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      return await coinbaseAutomation.syncWalletBalances(input.walletIds);
    }),
});
