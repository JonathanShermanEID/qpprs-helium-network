/**
 * Vision-Based Verizon Data Extraction Router
 * iPhone XR exclusive - processes My Verizon screenshots
 * Author: Jonathan Sherman - Monaco Edition
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  extractVerizonDataFromImage,
  validateExtractedData,
  updateDatabaseWithExtractedData
} from "../visionVerizonExtractor";

export const visionVerizonRouter = router({
  /**
   * Extract Verizon account data from uploaded screenshot
   */
  extractFromScreenshot: protectedProcedure
    .input(z.object({
      imageUrl: z.string().url()
    }))
    .mutation(async ({ input }) => {
      try {
        // Extract data using AI vision
        const extractedData = await extractVerizonDataFromImage(input.imageUrl);
        
        // Validate and enrich the data
        const validation = await validateExtractedData(extractedData);
        
        // Update database with validated data
        const updateResult = await updateDatabaseWithExtractedData(validation.enrichedData);
        
        return {
          success: updateResult.success,
          phoneLines: validation.enrichedData.phoneLines,
          accountNumber: validation.enrichedData.accountNumber,
          confidence: validation.enrichedData.confidence,
          extractedAt: validation.enrichedData.extractedAt,
          validation: {
            valid: validation.valid,
            issues: validation.issues
          },
          database: {
            updated: updateResult.updated,
            errors: updateResult.errors
          }
        };
      } catch (error) {
        console.error("[Vision Verizon Router] Extraction failed:", error);
        throw new Error(`Failed to extract Verizon data: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }),

  /**
   * Get extraction history
   */
  getExtractionHistory: protectedProcedure
    .query(async () => {
      // TODO: Implement extraction history tracking
      return {
        extractions: [],
        totalExtractions: 0
      };
    }),

  /**
   * Test vision extraction with sample data
   */
  testExtraction: protectedProcedure
    .input(z.object({
      imageUrl: z.string().url()
    }))
    .query(async ({ input }) => {
      try {
        const extractedData = await extractVerizonDataFromImage(input.imageUrl);
        const validation = await validateExtractedData(extractedData);
        
        return {
          success: true,
          data: validation.enrichedData,
          validation: {
            valid: validation.valid,
            issues: validation.issues
          }
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        };
      }
    })
});
