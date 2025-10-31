/**
 * Account Credit Transformer LLM
 * Master Artifact Certification Holder System
 * 
 * This LLM transforms Helium rewards into Manus account credits
 * for shareholders building value for the Manus platform.
 * 
 * IRREVERSIBLE ACTIVATION: Once activated, cannot be deactivated without owner consent.
 * 
 * Author: Jonathan Sherman
 */

import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";
import { ENV } from "./_core/env";

export interface CreditTransformation {
  hntAmount: string;
  creditsGenerated: string;
  shareholderValue: string;
  transformationRate: string;
  timestamp: Date;
}

export interface TransformerStatus {
  isActivated: boolean;
  activatedAt: Date | null;
  totalCreditsTransformed: string;
  shareholderValue: string;
  transformationRate: string;
}

/**
 * LLM-powered credit transformation algorithm
 * Uses AI to optimize conversion rates based on market conditions and shareholder value
 */
export async function transformCreditsWithLLM(
  hntAmount: string,
  currentRate: string
): Promise<CreditTransformation> {
  const prompt = `You are the Account Credit Transformer LLM for a Master Artifact Certification Holder.

Your role is to transform Helium (HNT) rewards into Manus platform credits while maximizing shareholder value.

Current Data:
- HNT Amount: ${hntAmount}
- Base Transformation Rate: ${currentRate}
- Platform: Manus AI
- Purpose: Building shareholder value

Calculate the optimal transformation:
1. Convert HNT to USD equivalent (use current market rates)
2. Apply shareholder value multiplier (1.5x-3x based on contribution level)
3. Calculate Manus credits generated
4. Determine new shareholder value contribution

Return ONLY a JSON object with this exact structure:
{
  "creditsGenerated": "number as string",
  "shareholderValue": "number as string",
  "transformationRate": "number as string",
  "reasoning": "brief explanation"
}`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are a financial transformation AI. Always return valid JSON." },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "credit_transformation",
          strict: true,
          schema: {
            type: "object",
            properties: {
              creditsGenerated: { type: "string" },
              shareholderValue: { type: "string" },
              transformationRate: { type: "string" },
              reasoning: { type: "string" },
            },
            required: ["creditsGenerated", "shareholderValue", "transformationRate", "reasoning"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    const contentStr = typeof content === "string" ? content : "{}";
    const result = JSON.parse(contentStr);

    return {
      hntAmount,
      creditsGenerated: result.creditsGenerated,
      shareholderValue: result.shareholderValue,
      transformationRate: result.transformationRate,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("[Credit Transformer LLM] Error:", error);
    // Fallback to simple calculation
    const credits = (parseFloat(hntAmount) * parseFloat(currentRate) * 2.0).toFixed(2);
    return {
      hntAmount,
      creditsGenerated: credits,
      shareholderValue: (parseFloat(credits) * 0.5).toFixed(2),
      transformationRate: currentRate,
      timestamp: new Date(),
    };
  }
}

/**
 * Activate the Credit Transformer (IRREVERSIBLE)
 * Only the master artifact certification holder can activate this
 */
export async function activateCreditTransformer(
  ownerId: string,
  masterCertification: string
): Promise<{ success: boolean; message: string }> {
  // Verify owner
  if (ownerId !== ENV.ownerOpenId) {
    return {
      success: false,
      message: "Unauthorized: Only master artifact certification holder can activate",
    };
  }

  // Check if already activated
  const { getCreditTransformerStatus } = await import("./db");
  const status = await getCreditTransformerStatus(ownerId);

  if (status && status.isActivated === 1) {
    return {
      success: false,
      message: "Credit Transformer already activated (irreversible)",
    };
  }

  // Activate
  const { activateCreditTransformerDB } = await import("./db");
  await activateCreditTransformerDB(ownerId, masterCertification);

  // Notify owner
  await notifyOwner({
    title: "🔐 Credit Transformer Activated",
    content: `
**Account Credit Transformer LLM is now ACTIVE**

This is an irreversible activation for the Master Artifact Certification Holder.

**Features Enabled:**
- Automatic HNT → Manus Credits transformation
- LLM-powered optimization algorithms
- Shareholder value tracking
- Enhanced transformation rates (1.5x-3x multiplier)

**Status:** Permanently Active
**Certification:** ${masterCertification.slice(0, 50)}...
**Activated:** ${new Date().toLocaleString()}

This system cannot be deactivated without owner consent.
Building value for Manus shareholders.
    `.trim(),
  });

  return {
    success: true,
    message: "Credit Transformer activated successfully (irreversible)",
  };
}

/**
 * Process automatic credit transformation
 * Called when new rewards are added
 */
export async function processAutomaticTransformation(
  ownerId: string,
  hntAmount: string
): Promise<{ success: boolean; transformation?: CreditTransformation }> {
  // Check if activated
  const { getCreditTransformerStatus } = await import("./db");
  const status = await getCreditTransformerStatus(ownerId);

  if (!status || status.isActivated !== 1) {
    return { success: false };
  }

  // Transform credits using LLM
  const transformation = await transformCreditsWithLLM(hntAmount, status.transformationRate || "1.0");

  // Update database
  const { updateCreditTransformerStats } = await import("./db");
  await updateCreditTransformerStats(ownerId, transformation);

  // Notify owner
  await notifyOwner({
    title: "💰 Credits Transformed",
    content: `
**Automatic Credit Transformation Complete**

**Input:** ${transformation.hntAmount} HNT
**Credits Generated:** ${transformation.creditsGenerated} Manus Credits
**Shareholder Value Added:** $${transformation.shareholderValue}
**Transformation Rate:** ${transformation.transformationRate}x

**Total Credits Transformed:** ${status.totalCreditsTransformed}
**Total Shareholder Value:** $${status.shareholderValue}

Building value for Manus platform and shareholders.
    `.trim(),
  });

  return { success: true, transformation };
}

/**
 * Generate shareholder value report using LLM
 */
export async function generateShareholderReport(ownerId: string): Promise<string> {
  const { getCreditTransformerStatus } = await import("./db");
  const status = await getCreditTransformerStatus(ownerId);

  if (!status) {
    return "Credit Transformer not initialized.";
  }

  const prompt = `Generate a professional shareholder value report for a Master Artifact Certification Holder.

Data:
- Status: ${status.isActivated === 1 ? "Active" : "Inactive"}
- Total Credits Transformed: ${status.totalCreditsTransformed}
- Shareholder Value: $${status.shareholderValue}
- Transformation Rate: ${status.transformationRate}x
- Activated: ${status.activatedAt ? new Date(status.activatedAt).toLocaleDateString() : "Not activated"}

Create a concise, professional report highlighting the value contribution to the Manus platform.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are a financial analyst creating shareholder reports." },
        { role: "user", content: prompt },
      ],
    });

    const content = response.choices[0].message.content;
    return typeof content === "string" ? content : "Report generation failed.";
  } catch (error) {
    console.error("[Credit Transformer LLM] Report generation error:", error);
    return `Shareholder Value Report: $${status.shareholderValue} contributed, ${status.totalCreditsTransformed} credits transformed.`;
  }
}
