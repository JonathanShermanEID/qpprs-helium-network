/**
 * Phone Number Feature Refresh Router
 * API endpoints for phone number security and feature synchronization
 * Author: Jonathan Sherman - Monaco Edition
 */

import { router, protectedProcedure } from '../_core/trpc';
import { phoneNumberSecurity } from '../_core/phoneNumberSecurity';
import { z } from 'zod';

export const phoneNumberRouter = router({
  /**
   * Verify phone number
   */
  verify: protectedProcedure
    .input(z.object({
      phoneNumber: z.string()
    }))
    .query(({ input }) => {
      return phoneNumberSecurity.verifyPhoneNumber(input.phoneNumber);
    }),
  
  /**
   * Refresh all features for phone number
   */
  refreshFeatures: protectedProcedure
    .input(z.object({
      phoneNumber: z.string()
    }))
    .mutation(async ({ input }) => {
      return await phoneNumberSecurity.refreshAllFeatures(input.phoneNumber);
    }),
  
  /**
   * Get feature bindings for phone number
   */
  getBindings: protectedProcedure
    .input(z.object({
      phoneNumber: z.string()
    }))
    .query(({ input }) => {
      return phoneNumberSecurity.getFeatureBindings(input.phoneNumber);
    }),
  
  /**
   * Check feature access
   */
  checkAccess: protectedProcedure
    .input(z.object({
      phoneNumber: z.string(),
      featureName: z.string()
    }))
    .query(({ input }) => {
      return {
        hasAccess: phoneNumberSecurity.hasFeatureAccess(input.phoneNumber, input.featureName)
      };
    }),
  
  /**
   * Send verification SMS
   */
  sendVerificationSMS: protectedProcedure
    .input(z.object({
      phoneNumber: z.string()
    }))
    .mutation(async ({ input }) => {
      const sent = await phoneNumberSecurity.sendVerificationSMS(input.phoneNumber);
      return {
        success: sent,
        message: sent ? 'Verification SMS sent' : 'Failed to send SMS'
      };
    }),
  
  /**
   * Verify SMS code
   */
  verifySMSCode: protectedProcedure
    .input(z.object({
      phoneNumber: z.string(),
      code: z.string()
    }))
    .mutation(({ input }) => {
      const verified = phoneNumberSecurity.verifySMSCode(input.phoneNumber, input.code);
      return {
        verified,
        message: verified ? 'Phone number verified' : 'Invalid verification code'
      };
    }),
  
  /**
   * Get security status
   */
  getSecurityStatus: protectedProcedure
    .input(z.object({
      phoneNumber: z.string()
    }))
    .query(({ input }) => {
      return phoneNumberSecurity.getSecurityStatus(input.phoneNumber);
    })
});
