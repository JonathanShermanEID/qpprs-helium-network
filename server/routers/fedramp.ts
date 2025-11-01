/**
 * FedRAMP Compliance Router
 * Author: Jonathan Sherman
 * Monaco Edition 🏎️
 */

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { fedRAMP } from "../fedramp/compliance";

export const fedrampRouter = router({
  // Get compliance status
  getStatus: publicProcedure.query(() => {
    return fedRAMP.getComplianceStatus();
  }),
  
  // Get audit logs
  getAuditLogs: publicProcedure
    .input(z.object({
      userId: z.string().optional(),
      action: z.string().optional(),
      result: z.enum(['success', 'failure']).optional(),
    }).optional())
    .query(({ input }) => {
      return fedRAMP.auditLogger.getLogs(input);
    }),
  
  // Get security incidents
  getIncidents: publicProcedure
    .input(z.object({
      severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      status: z.enum(['open', 'investigating', 'resolved', 'closed']).optional(),
    }).optional())
    .query(({ input }) => {
      return fedRAMP.incidentResponse.getAllIncidents(input);
    }),
  
  // Report security incident
  reportIncident: publicProcedure
    .input(z.object({
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      type: z.string(),
      description: z.string(),
      assignedTo: z.string().optional(),
    }))
    .mutation(({ input }) => {
      const id = fedRAMP.incidentResponse.reportIncident(input);
      
      // Log the incident report
      fedRAMP.auditLogger.log({
        action: 'report_security_incident',
        resource: `incident/${id}`,
        result: 'success',
        metadata: { severity: input.severity, type: input.type }
      });
      
      return { id, message: 'Security incident reported successfully' };
    }),
  
  // Get monitoring metrics
  getMetrics: publicProcedure.query(() => {
    return fedRAMP.monitoring.getAllMetrics();
  }),
  
  // Get monitoring alerts
  getAlerts: publicProcedure.query(() => {
    return fedRAMP.monitoring.getAlerts();
  }),
  
  // Record monitoring metric
  recordMetric: publicProcedure
    .input(z.object({
      name: z.string(),
      value: z.number(),
      threshold: z.number(),
    }))
    .mutation(({ input }) => {
      fedRAMP.monitoring.recordMetric(input.name, input.value, input.threshold);
      return { success: true };
    }),
  
  // Encrypt data (for testing FIPS encryption)
  encryptData: publicProcedure
    .input(z.object({
      data: z.string(),
    }))
    .mutation(({ input }) => {
      const key = fedRAMP.encryption.generateKey();
      const encrypted = fedRAMP.encryption.encrypt(input.data, key);
      
      fedRAMP.auditLogger.log({
        action: 'encrypt_data',
        resource: 'encryption_service',
        result: 'success'
      });
      
      return {
        ...encrypted,
        key: key.toString('hex'),
        message: 'Data encrypted using FIPS 140-2 compliant AES-256-GCM'
      };
    }),
});
