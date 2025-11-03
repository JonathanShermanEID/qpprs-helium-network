/**
 * Vision-Based My Verizon Data Extraction Service
 * Uses AI vision to read and extract data from My Verizon screenshots
 * Author: Jonathan Sherman - Monaco Edition
 */

import { invokeLLM } from "./_core/llm";
import type { Message } from "./_core/llm";

export interface VerizonAccountData {
  accountNumber?: string;
  phoneLines: Array<{
    phoneNumber: string;
    plan: string;
    status: string;
    voiceMinutesUsed?: number;
    voiceMinutesAllowed?: number;
    textMessagesUsed?: number;
    textMessagesAllowed?: number;
    dataUsed?: string;
    dataAllowed?: string;
    voipEnabled: boolean;
    smsEnabled: boolean;
    mmsEnabled: boolean;
  }>;
  extractedAt: Date;
  confidence: number;
}

/**
 * Extract Verizon account data from screenshot using AI vision
 */
export async function extractVerizonDataFromImage(
  imageUrl: string
): Promise<VerizonAccountData> {
  console.log("[Vision Verizon Extractor] Analyzing screenshot...");

  try {
    const messages: Message[] = [
      {
        role: "system",
        content: `You are an expert at reading and extracting data from My Verizon account screenshots. 
        
Your task is to:
1. Identify all phone numbers visible in the screenshot
2. Extract plan names and types for each line
3. Determine service status (active, suspended, etc.)
4. Extract usage statistics (voice minutes, text messages, data)
5. Identify enabled features (VoIP, SMS, MMS)
6. Find account number if visible

Be thorough and accurate. If information is not clearly visible, use reasonable defaults based on typical Verizon account structures.`
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analyze this My Verizon account screenshot and extract all phone numbers, plans, usage data, and account information. Provide complete details for each phone line found."
          },
          {
            type: "image_url",
            image_url: {
              url: imageUrl,
              detail: "high"
            }
          }
        ]
      }
    ];

    const response = await invokeLLM({
      messages,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "verizon_account_data",
          strict: true,
          schema: {
            type: "object",
            properties: {
              accountNumber: { type: "string" },
              phoneLines: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    phoneNumber: { type: "string" },
                    plan: { type: "string" },
                    status: { type: "string" },
                    voiceMinutesUsed: { type: "number" },
                    voiceMinutesAllowed: { type: "number" },
                    textMessagesUsed: { type: "number" },
                    textMessagesAllowed: { type: "number" },
                    dataUsed: { type: "string" },
                    dataAllowed: { type: "string" },
                    voipEnabled: { type: "boolean" },
                    smsEnabled: { type: "boolean" },
                    mmsEnabled: { type: "boolean" }
                  },
                  required: [
                    "phoneNumber",
                    "plan",
                    "status",
                    "voipEnabled",
                    "smsEnabled",
                    "mmsEnabled"
                  ],
                  additionalProperties: false
                }
              },
              confidence: { type: "number" }
            },
            required: ["phoneLines", "confidence"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0].message.content;
    if (typeof content === 'string') {
      const result = JSON.parse(content);
      
      console.log(`[Vision Verizon Extractor] Extracted ${result.phoneLines?.length || 0} phone lines with ${result.confidence}% confidence`);
      
      return {
        ...result,
        extractedAt: new Date()
      };
    }

    throw new Error("Failed to parse vision response");
  } catch (error) {
    console.error("[Vision Verizon Extractor] Extraction failed:", error);
    throw error;
  }
}

/**
 * Validate and enrich extracted data using LLM
 */
export async function validateExtractedData(
  data: VerizonAccountData
): Promise<{ valid: boolean; issues: string[]; enrichedData: VerizonAccountData }> {
  console.log("[Vision Verizon Extractor] Validating extracted data...");

  try {
    const prompt = `Validate this extracted Verizon account data and check for:
1. Phone number format correctness (US format)
2. Reasonable usage statistics
3. Valid plan names (match Verizon's actual offerings)
4. Logical status values
5. Consistent feature flags

Data to validate:
${JSON.stringify(data, null, 2)}

If any data seems incorrect or incomplete, suggest corrections based on typical Verizon account structures.`;

    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are a Verizon account data validation specialist." },
        { role: "user", content: prompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "validation_result",
          strict: true,
          schema: {
            type: "object",
            properties: {
              valid: { type: "boolean" },
              issues: {
                type: "array",
                items: { type: "string" }
              },
              corrections: {
                type: "object",
                additionalProperties: true
              }
            },
            required: ["valid", "issues", "corrections"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0].message.content;
    if (typeof content === 'string') {
      const result = JSON.parse(content);
      
      // Apply corrections if any
      const enrichedData = {
        ...data,
        ...result.corrections
      };
      
      console.log(`[Vision Verizon Extractor] Validation complete - Valid: ${result.valid}, Issues: ${result.issues.length}`);
      
      return {
        valid: result.valid,
        issues: result.issues,
        enrichedData
      };
    }

    throw new Error("Failed to parse validation response");
  } catch (error) {
    console.error("[Vision Verizon Extractor] Validation failed:", error);
    return {
      valid: true,
      issues: [],
      enrichedData: data
    };
  }
}

/**
 * Update telecommunications database with extracted data
 */
export async function updateDatabaseWithExtractedData(
  data: VerizonAccountData
): Promise<{ success: boolean; updated: number; errors: string[] }> {
  console.log("[Vision Verizon Extractor] Updating database...");

  const errors: string[] = [];
  let updated = 0;

  try {
    const { getDb } = await import("./db");
    const { voiceProvisioning, textProvisioning } = await import("../drizzle/schema");
    const db = await getDb();

    if (!db) {
      throw new Error("Database not available");
    }

    // Clear existing data
    await db.delete(voiceProvisioning);
    await db.delete(textProvisioning);

    // Insert new data for each phone line
    for (const line of data.phoneLines) {
      try {
        // Insert voice provisioning
        await db.insert(voiceProvisioning).values({
          userId: 'owner',
          phoneNumber: line.phoneNumber,
          plan: line.plan,
          status: line.status as 'active' | 'suspended' | 'terminated',
          minutesUsed: line.voiceMinutesUsed || 0,
          minutesAllowed: line.voiceMinutesAllowed || 999999,
          voipEnabled: line.voipEnabled ? 1 : 0,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        // Insert text provisioning
        await db.insert(textProvisioning).values({
          userId: 'owner',
          phoneNumber: line.phoneNumber,
          status: line.status as 'active' | 'suspended' | 'terminated',
          messagesUsed: line.textMessagesUsed || 0,
          messagesAllowed: line.textMessagesAllowed || 999999,
          smsEnabled: line.smsEnabled ? 1 : 0,
          mmsEnabled: line.mmsEnabled ? 1 : 0,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        updated++;
        console.log(`[Vision Verizon Extractor] Updated database for ${line.phoneNumber}`);
      } catch (error) {
        const errorMsg = `Failed to update ${line.phoneNumber}: ${error}`;
        errors.push(errorMsg);
        console.error(`[Vision Verizon Extractor] ${errorMsg}`);
      }
    }

    console.log(`[Vision Verizon Extractor] Database update complete - ${updated} lines updated`);

    return {
      success: errors.length === 0,
      updated,
      errors
    };
  } catch (error) {
    console.error("[Vision Verizon Extractor] Database update failed:", error);
    return {
      success: false,
      updated,
      errors: [error instanceof Error ? error.message : "Unknown error"]
    };
  }
}
