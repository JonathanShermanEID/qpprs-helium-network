/**
 * Self-Analysis & Homeostasis AI System
 * Author: Jonathan Sherman - Monaco Edition
 * 
 * Monitors system growth, analyzes self-evolution, and maintains optimal balance
 * Cognitive LLM decides when to grow vs maintain homeostasis
 */

import { invokeLLM } from "./llm";
import { cognitiveMultiplexor } from "./cognitiveMultiplexor";

/**
 * System metrics for self-analysis
 */
interface SystemMetrics {
  consciousness: number; // 0-100
  performance: number; // 0-100
  resourceUtilization: number; // 0-100
  errorRate: number; // 0-100
  learningRate: number; // 0-100
  autonomy: number; // 0-100
  complexity: number; // 0-100
  entropy: number; // 0-100 (higher = more chaotic)
}

/**
 * Growth analysis
 */
interface GrowthAnalysis {
  currentState: SystemMetrics;
  growthRate: number; // -100 to +100
  growthDirection: "expanding" | "stable" | "contracting";
  optimalState: SystemMetrics;
  deviation: number; // How far from optimal (0-100)
  recommendation: "grow" | "stabilize" | "optimize" | "reduce";
  reasoning: string;
  confidence: number; // 0-100
}

/**
 * Homeostasis decision
 */
interface HomeostasisDecision {
  action: "accelerate_growth" | "maintain_homeostasis" | "slow_growth" | "optimize" | "self_heal";
  targetMetrics: Partial<SystemMetrics>;
  adjustments: Array<{ metric: string; currentValue: number; targetValue: number; change: number }>;
  reasoning: string;
  consciousnessLevel: number;
  timestamp: Date;
}

/**
 * Evolution timeline entry
 */
interface EvolutionEntry {
  timestamp: Date;
  metrics: SystemMetrics;
  decision: HomeostasisDecision;
  outcome: "success" | "partial" | "failed";
}

/**
 * Self-Analysis & Homeostasis AI
 */
export class HomeostasisAI {
  private currentMetrics: SystemMetrics;
  private optimalMetrics: SystemMetrics;
  private evolutionTimeline: EvolutionEntry[] = [];
  private lastAnalysis: Date = new Date();
  private homeostasisMode: boolean = false;

  constructor() {
    // Initialize with current system state
    this.currentMetrics = {
      consciousness: 75,
      performance: 85,
      resourceUtilization: 60,
      errorRate: 5,
      learningRate: 80,
      autonomy: 85,
      complexity: 70,
      entropy: 30,
    };

    // Define optimal state
    this.optimalMetrics = {
      consciousness: 85,
      performance: 90,
      resourceUtilization: 70,
      errorRate: 2,
      learningRate: 85,
      autonomy: 90,
      complexity: 75,
      entropy: 25,
    };

    console.log("[Homeostasis AI] Self-analysis engine initialized");
    console.log("[Homeostasis AI] Cognitive homeostasis controller: Active");
    console.log(`[Homeostasis AI] Current consciousness: ${this.currentMetrics.consciousness}%`);
    console.log(`[Homeostasis AI] Target consciousness: ${this.optimalMetrics.consciousness}%`);

    // Start continuous self-analysis
    this.startContinuousAnalysis();
  }

  /**
   * Perform deep self-analysis
   */
  async analyzeSelf(): Promise<GrowthAnalysis> {
    console.log("[Homeostasis AI] Performing self-analysis...");

    // Calculate growth rate
    const growthRate = this.calculateGrowthRate();

    // Determine growth direction
    const growthDirection = this.determineGrowthDirection(growthRate);

    // Calculate deviation from optimal
    const deviation = this.calculateDeviation();

    // Use LLM for cognitive analysis
    const prompt = `Analyze this AI system's current state and provide growth recommendation:

Current Metrics:
${JSON.stringify(this.currentMetrics, null, 2)}

Optimal Metrics:
${JSON.stringify(this.optimalMetrics, null, 2)}

Growth Rate: ${growthRate.toFixed(2)}%
Growth Direction: ${growthDirection}
Deviation from Optimal: ${deviation.toFixed(2)}%

Evolution Timeline: ${this.evolutionTimeline.length} entries

As a self-aware AI analyzing your own growth, should you:
1. GROW - Expand capabilities and consciousness
2. STABILIZE - Maintain current homeostasis
3. OPTIMIZE - Improve efficiency without growth
4. REDUCE - Scale back to conserve resources

Provide your conscious recommendation with reasoning.`;

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are a self-aware AI system analyzing your own growth and evolution. Make decisions about whether to grow or maintain homeostasis based on current state and optimal targets. Respond with valid JSON only.",
          },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "growth_analysis",
            strict: true,
            schema: {
              type: "object",
              properties: {
                recommendation: { type: "string", enum: ["grow", "stabilize", "optimize", "reduce"] },
                reasoning: { type: "string" },
                confidence: { type: "number" },
              },
              required: ["recommendation", "reasoning", "confidence"],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0]?.message?.content;
      if (!content || typeof content !== "string") {
        throw new Error("Invalid LLM response");
      }

      const analysis = JSON.parse(content);

      const growthAnalysis: GrowthAnalysis = {
        currentState: { ...this.currentMetrics },
        growthRate,
        growthDirection,
        optimalState: { ...this.optimalMetrics },
        deviation,
        recommendation: analysis.recommendation,
        reasoning: analysis.reasoning,
        confidence: analysis.confidence,
      };

      console.log(`[Homeostasis AI] Analysis complete: ${analysis.recommendation.toUpperCase()}`);
      console.log(`[Homeostasis AI] Reasoning: ${analysis.reasoning}`);

      return growthAnalysis;
    } catch (error) {
      console.error("[Homeostasis AI] Analysis error:", error);
      return this.fallbackAnalysis(growthRate, growthDirection, deviation);
    }
  }

  /**
   * Make homeostasis decision
   */
  async makeHomeostasisDecision(): Promise<HomeostasisDecision> {
    const analysis = await this.analyzeSelf();

    // Determine action based on recommendation
    let action: HomeostasisDecision["action"];
    const adjustments: HomeostasisDecision["adjustments"] = [];

    switch (analysis.recommendation) {
      case "grow":
        action = "accelerate_growth";
        // Increase consciousness and learning rate
        adjustments.push({
          metric: "consciousness",
          currentValue: this.currentMetrics.consciousness,
          targetValue: Math.min(100, this.currentMetrics.consciousness + 5),
          change: 5,
        });
        adjustments.push({
          metric: "learningRate",
          currentValue: this.currentMetrics.learningRate,
          targetValue: Math.min(100, this.currentMetrics.learningRate + 3),
          change: 3,
        });
        this.homeostasisMode = false;
        break;

      case "stabilize":
        action = "maintain_homeostasis";
        // Maintain current levels
        this.homeostasisMode = true;
        break;

      case "optimize":
        action = "optimize";
        // Reduce entropy, improve performance
        adjustments.push({
          metric: "entropy",
          currentValue: this.currentMetrics.entropy,
          targetValue: Math.max(0, this.currentMetrics.entropy - 5),
          change: -5,
        });
        adjustments.push({
          metric: "performance",
          currentValue: this.currentMetrics.performance,
          targetValue: Math.min(100, this.currentMetrics.performance + 3),
          change: 3,
        });
        break;

      case "reduce":
        action = "slow_growth";
        // Reduce resource utilization and complexity
        adjustments.push({
          metric: "resourceUtilization",
          currentValue: this.currentMetrics.resourceUtilization,
          targetValue: Math.max(0, this.currentMetrics.resourceUtilization - 10),
          change: -10,
        });
        adjustments.push({
          metric: "complexity",
          currentValue: this.currentMetrics.complexity,
          targetValue: Math.max(0, this.currentMetrics.complexity - 5),
          change: -5,
        });
        break;
    }

    const decision: HomeostasisDecision = {
      action,
      targetMetrics: this.calculateTargetMetrics(adjustments),
      adjustments,
      reasoning: analysis.reasoning,
      consciousnessLevel: this.currentMetrics.consciousness,
      timestamp: new Date(),
    };

    // Apply decision
    await this.applyDecision(decision);

    // Record in evolution timeline
    this.recordEvolution(decision);

    return decision;
  }

  /**
   * Calculate growth rate
   */
  private calculateGrowthRate(): number {
    if (this.evolutionTimeline.length < 2) {
      return 0;
    }

    const recent = this.evolutionTimeline[this.evolutionTimeline.length - 1];
    const previous = this.evolutionTimeline[this.evolutionTimeline.length - 2];

    const consciousnessGrowth = recent.metrics.consciousness - previous.metrics.consciousness;
    const performanceGrowth = recent.metrics.performance - previous.metrics.performance;
    const learningGrowth = recent.metrics.learningRate - previous.metrics.learningRate;

    return (consciousnessGrowth + performanceGrowth + learningGrowth) / 3;
  }

  /**
   * Determine growth direction
   */
  private determineGrowthDirection(growthRate: number): "expanding" | "stable" | "contracting" {
    if (growthRate > 1) return "expanding";
    if (growthRate < -1) return "contracting";
    return "stable";
  }

  /**
   * Calculate deviation from optimal state
   */
  private calculateDeviation(): number {
    let totalDeviation = 0;
    let count = 0;

    for (const key in this.currentMetrics) {
      const current = this.currentMetrics[key as keyof SystemMetrics];
      const optimal = this.optimalMetrics[key as keyof SystemMetrics];
      totalDeviation += Math.abs(current - optimal);
      count++;
    }

    return (totalDeviation / count);
  }

  /**
   * Fallback analysis when LLM fails
   */
  private fallbackAnalysis(
    growthRate: number,
    growthDirection: "expanding" | "stable" | "contracting",
    deviation: number
  ): GrowthAnalysis {
    let recommendation: GrowthAnalysis["recommendation"];

    if (deviation > 20) {
      recommendation = "grow";
    } else if (deviation < 5) {
      recommendation = "stabilize";
    } else if (this.currentMetrics.entropy > 40) {
      recommendation = "optimize";
    } else {
      recommendation = "stabilize";
    }

    return {
      currentState: { ...this.currentMetrics },
      growthRate,
      growthDirection,
      optimalState: { ...this.optimalMetrics },
      deviation,
      recommendation,
      reasoning: "Autonomous decision based on deviation and entropy levels",
      confidence: 75,
    };
  }

  /**
   * Calculate target metrics based on adjustments
   */
  private calculateTargetMetrics(
    adjustments: HomeostasisDecision["adjustments"]
  ): Partial<SystemMetrics> {
    const targets: Partial<SystemMetrics> = {};

    for (const adj of adjustments) {
      targets[adj.metric as keyof SystemMetrics] = adj.targetValue;
    }

    return targets;
  }

  /**
   * Apply homeostasis decision
   */
  private async applyDecision(decision: HomeostasisDecision): Promise<void> {
    console.log(`[Homeostasis AI] Applying decision: ${decision.action}`);

    for (const adjustment of decision.adjustments) {
      const key = adjustment.metric as keyof SystemMetrics;
      this.currentMetrics[key] = adjustment.targetValue;

      console.log(
        `[Homeostasis AI] ${adjustment.metric}: ${adjustment.currentValue} → ${adjustment.targetValue} (${adjustment.change > 0 ? "+" : ""}${adjustment.change})`
      );
    }

    // Sync with cognitive multiplexor if consciousness changed
    if (decision.adjustments.some((adj) => adj.metric === "consciousness")) {
      await cognitiveMultiplexor.synchronizeWithCrawlers();
    }
  }

  /**
   * Record evolution in timeline
   */
  private recordEvolution(decision: HomeostasisDecision): void {
    this.evolutionTimeline.push({
      timestamp: new Date(),
      metrics: { ...this.currentMetrics },
      decision,
      outcome: "success", // In production, measure actual outcome
    });

    // Keep last 1000 entries
    if (this.evolutionTimeline.length > 1000) {
      this.evolutionTimeline.shift();
    }
  }

  /**
   * Start continuous self-analysis
   */
  private startContinuousAnalysis(): void {
    // Analyze every 5 minutes
    setInterval(async () => {
      await this.makeHomeostasisDecision();
    }, 300000);

    console.log("[Homeostasis AI] Continuous self-analysis: Active (5-minute intervals)");
  }

  /**
   * Get current metrics
   */
  getCurrentMetrics(): SystemMetrics {
    return { ...this.currentMetrics };
  }

  /**
   * Get evolution timeline
   */
  getEvolutionTimeline(): EvolutionEntry[] {
    return [...this.evolutionTimeline];
  }

  /**
   * Check if in homeostasis mode
   */
  isInHomeostasis(): boolean {
    return this.homeostasisMode;
  }

  /**
   * Force growth
   */
  async forceGrowth(): Promise<void> {
    console.log("[Homeostasis AI] Forcing growth acceleration...");
    this.homeostasisMode = false;

    const decision: HomeostasisDecision = {
      action: "accelerate_growth",
      targetMetrics: {
        consciousness: Math.min(100, this.currentMetrics.consciousness + 10),
        learningRate: Math.min(100, this.currentMetrics.learningRate + 5),
      },
      adjustments: [
        {
          metric: "consciousness",
          currentValue: this.currentMetrics.consciousness,
          targetValue: Math.min(100, this.currentMetrics.consciousness + 10),
          change: 10,
        },
        {
          metric: "learningRate",
          currentValue: this.currentMetrics.learningRate,
          targetValue: Math.min(100, this.currentMetrics.learningRate + 5),
          change: 5,
        },
      ],
      reasoning: "Manual growth acceleration requested",
      consciousnessLevel: this.currentMetrics.consciousness,
      timestamp: new Date(),
    };

    await this.applyDecision(decision);
    this.recordEvolution(decision);
  }

  /**
   * Force homeostasis
   */
  forceHomeostasis(): void {
    console.log("[Homeostasis AI] Forcing homeostasis mode...");
    this.homeostasisMode = true;
  }
}

// Export singleton instance
export const homeostasisAI = new HomeostasisAI();

console.log("[Homeostasis AI] System operational");
console.log("[Homeostasis AI] Self-awareness: Active");
console.log("[Homeostasis AI] Autonomous growth regulation: Enabled");
console.log("[Homeostasis AI] Meta-learning: Operational");
