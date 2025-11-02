/**
 * 3D Digital Certification Router
 * Author: Jonathan Sherman - Monaco Edition
 */

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { iphoneXROnlyProcedure } from "../_core/iphoneXRProcedure";
import { getDb } from "../db";
import { digitalCertificates } from "../../drizzle/schema";
import { desc, eq } from "drizzle-orm";
import {
  generate3DCertificate,
  generateConversationBackupCertificate,
  generateAuthorshipCertificate,
  verifyCertificate,
  isCertificateExpired,
} from "../certificateGenerator3D";

export const certificates3DRouter = router({
  /**
   * Generate 3D certificate (iPhone XR ONLY)
   */
  generate: iphoneXROnlyProcedure
    .input(z.object({
      certificateType: z.enum([
        "conversation_backup",
        "authorship_verification",
        "device_authentication",
        "network_certification",
        "master_artifact",
      ]),
      holderOpenId: z.string(),
      holderName: z.string(),
      subjectId: z.string(),
      subjectTitle: z.string(),
      metadata: z.record(z.any()).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      console.log("[3D Certificates] Generating certificate:", input.certificateType);

      // Generate 3D certificate
      const certificate = await generate3DCertificate(input);

      // Save to database
      await db.insert(digitalCertificates).values({
        certificateId: certificate.certificateId,
        certificateType: input.certificateType,
        holderOpenId: input.holderOpenId,
        holderName: input.holderName,
        subjectId: input.subjectId,
        subjectTitle: input.subjectTitle,
        verificationHash: certificate.verificationHash,
        certificate3DModel: certificate.certificate3DModel,
        certificateMetadata: certificate.certificateMetadata,
        issuedAt: certificate.issuedAt,
        validationStatus: "valid",
      });

      console.log("[3D Certificates] ✅ Certificate saved:", certificate.certificateId);

      return {
        success: true,
        certificateId: certificate.certificateId,
        verificationHash: certificate.verificationHash,
        modelUrl: certificate.certificate3DModel,
      };
    }),

  /**
   * Generate conversation backup certificate (iPhone XR ONLY)
   */
  generateConversationCertificate: iphoneXROnlyProcedure
    .input(z.object({
      conversationId: z.string(),
      conversationTitle: z.string(),
      holderOpenId: z.string(),
      holderName: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const certificate = await generateConversationBackupCertificate(
        input.conversationId,
        input.conversationTitle,
        input.holderOpenId,
        input.holderName
      );

      await db.insert(digitalCertificates).values({
        certificateId: certificate.certificateId,
        certificateType: "conversation_backup",
        holderOpenId: input.holderOpenId,
        holderName: input.holderName,
        subjectId: input.conversationId,
        subjectTitle: input.conversationTitle,
        verificationHash: certificate.verificationHash,
        certificate3DModel: certificate.certificate3DModel,
        certificateMetadata: certificate.certificateMetadata,
        issuedAt: certificate.issuedAt,
        validationStatus: "valid",
      });

      return {
        success: true,
        certificateId: certificate.certificateId,
        modelUrl: certificate.certificate3DModel,
      };
    }),

  /**
   * Get all certificates (read-only, public)
   */
  list: publicProcedure
    .input(z.object({
      holderOpenId: z.string().optional(),
      certificateType: z.enum([
        "conversation_backup",
        "authorship_verification",
        "device_authentication",
        "network_certification",
        "master_artifact",
      ]).optional(),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      let query = db.select().from(digitalCertificates);

      if (input.holderOpenId) {
        query = query.where(eq(digitalCertificates.holderOpenId, input.holderOpenId)) as any;
      }

      if (input.certificateType) {
        query = query.where(eq(digitalCertificates.certificateType, input.certificateType)) as any;
      }

      const certificates = await query
        .orderBy(desc(digitalCertificates.issuedAt))
        .limit(input.limit);

      return certificates.map(cert => ({
        id: cert.id,
        certificateId: cert.certificateId,
        certificateType: cert.certificateType,
        holderName: cert.holderName,
        subjectTitle: cert.subjectTitle,
        verificationHash: cert.verificationHash,
        modelUrl: cert.certificate3DModel,
        issuedAt: cert.issuedAt.toISOString(),
        expiresAt: cert.expiresAt?.toISOString(),
        validationStatus: cert.validationStatus,
        isExpired: isCertificateExpired(cert.expiresAt),
      }));
    }),

  /**
   * Get certificate by ID (read-only, public)
   */
  getById: publicProcedure
    .input(z.object({
      certificateId: z.string(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const results = await db
        .select()
        .from(digitalCertificates)
        .where(eq(digitalCertificates.certificateId, input.certificateId))
        .limit(1);

      if (results.length === 0) return null;

      const cert = results[0];

      return {
        id: cert.id,
        certificateId: cert.certificateId,
        certificateType: cert.certificateType,
        holderOpenId: cert.holderOpenId,
        holderName: cert.holderName,
        subjectId: cert.subjectId,
        subjectTitle: cert.subjectTitle,
        verificationHash: cert.verificationHash,
        modelUrl: cert.certificate3DModel,
        metadata: cert.certificateMetadata ? JSON.parse(cert.certificateMetadata) : null,
        issuedAt: cert.issuedAt.toISOString(),
        expiresAt: cert.expiresAt?.toISOString(),
        revokedAt: cert.revokedAt?.toISOString(),
        revocationReason: cert.revocationReason,
        validationStatus: cert.validationStatus,
        isExpired: isCertificateExpired(cert.expiresAt),
      };
    }),

  /**
   * Revoke certificate (iPhone XR ONLY)
   */
  revoke: iphoneXROnlyProcedure
    .input(z.object({
      certificateId: z.string(),
      reason: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(digitalCertificates).set({
        validationStatus: "revoked",
        revokedAt: new Date(),
        revocationReason: input.reason,
      }).where(eq(digitalCertificates.certificateId, input.certificateId));

      console.log("[3D Certificates] Certificate revoked:", input.certificateId);

      return { success: true };
    }),
});
