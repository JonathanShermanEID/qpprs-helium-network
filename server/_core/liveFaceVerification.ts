/**
 * Live Face Verification System
 * Author: Jonathan Sherman - Monaco Edition
 * 
 * Implements real-time face verification with 5-second timestamp validation
 * Requires live face image captured within 5 seconds of access attempt
 */

import crypto from "crypto";

/**
 * Face verification configuration
 */
const FACE_VERIFICATION_CONFIG = {
  timestampWindowMs: 5000, // 5 seconds
  livenessRequired: true,
  minConfidenceScore: 0.95,
};

/**
 * Live face verification data
 */
interface LiveFaceData {
  faceImageBase64: string;
  timestamp: number;
  deviceId: string;
  livenessScore: number;
  captureMetadata: {
    cameraType: string;
    resolution: string;
    lighting: string;
  };
}

/**
 * Stored face reference
 */
interface StoredFaceReference {
  ownerName: string;
  ownerOpenId: string;
  faceHash: string;
  enrolledAt: Date;
  lastVerifiedAt: Date;
}

/**
 * Generate hash from face image
 */
export function generateFaceHash(faceImageBase64: string): string {
  return crypto
    .createHash("sha256")
    .update(faceImageBase64)
    .digest("hex");
}

/**
 * Verify timestamp is within 5-second window
 */
export function verifyTimestamp(captureTimestamp: number, accessTimestamp: number): {
  valid: boolean;
  elapsedMs: number;
} {
  const elapsedMs = Math.abs(accessTimestamp - captureTimestamp);
  const valid = elapsedMs <= FACE_VERIFICATION_CONFIG.timestampWindowMs;

  return { valid, elapsedMs };
}

/**
 * Verify liveness (anti-spoofing)
 */
export function verifyLiveness(liveFaceData: LiveFaceData): {
  isLive: boolean;
  confidence: number;
  reason?: string;
} {
  // Check liveness score
  if (liveFaceData.livenessScore < FACE_VERIFICATION_CONFIG.minConfidenceScore) {
    return {
      isLive: false,
      confidence: liveFaceData.livenessScore,
      reason: "Liveness score too low - possible photo/video spoofing",
    };
  }

  // Check capture metadata for signs of spoofing
  const { cameraType, lighting } = liveFaceData.captureMetadata;

  // Real-time camera required (not file upload)
  if (!cameraType.includes("live") && !cameraType.includes("camera")) {
    return {
      isLive: false,
      confidence: 0,
      reason: "Not captured from live camera",
    };
  }

  // Check for suspicious lighting patterns (screen reflections)
  if (lighting.includes("screen") || lighting.includes("artificial")) {
    return {
      isLive: false,
      confidence: liveFaceData.livenessScore * 0.5,
      reason: "Suspicious lighting detected - possible screen display",
    };
  }

  return {
    isLive: true,
    confidence: liveFaceData.livenessScore,
  };
}

/**
 * Verify live face for access
 */
export async function verifyLiveFaceAccess(
  liveFaceData: LiveFaceData,
  storedReference: StoredFaceReference,
  accessTimestamp: number = Date.now()
): Promise<{
  granted: boolean;
  reason: string;
  confidence: number;
  elapsedMs: number;
}> {
  // 1. Verify timestamp (5-second window)
  const timestampCheck = verifyTimestamp(liveFaceData.timestamp, accessTimestamp);
  
  if (!timestampCheck.valid) {
    return {
      granted: false,
      reason: `Face image expired - captured ${timestampCheck.elapsedMs}ms ago (max 5000ms)`,
      confidence: 0,
      elapsedMs: timestampCheck.elapsedMs,
    };
  }

  // 2. Verify liveness (anti-spoofing)
  const livenessCheck = verifyLiveness(liveFaceData);
  
  if (!livenessCheck.isLive) {
    return {
      granted: false,
      reason: livenessCheck.reason || "Liveness verification failed",
      confidence: livenessCheck.confidence,
      elapsedMs: timestampCheck.elapsedMs,
    };
  }

  // 3. Verify face match
  const liveFaceHash = generateFaceHash(liveFaceData.faceImageBase64);
  const faceMatch = crypto.timingSafeEqual(
    Buffer.from(liveFaceHash),
    Buffer.from(storedReference.faceHash)
  );

  if (!faceMatch) {
    return {
      granted: false,
      reason: "Face does not match stored reference",
      confidence: 0,
      elapsedMs: timestampCheck.elapsedMs,
    };
  }

  // 4. All checks passed - grant access
  return {
    granted: true,
    reason: "Access granted - live face verified",
    confidence: livenessCheck.confidence,
    elapsedMs: timestampCheck.elapsedMs,
  };
}

/**
 * Create timestamped face verification token
 */
export function createFaceVerificationToken(
  faceImageBase64: string,
  timestamp: number,
  deviceId: string
): string {
  const faceHash = generateFaceHash(faceImageBase64);
  const data = `${faceHash}:${timestamp}:${deviceId}`;
  
  return crypto
    .createHmac("sha512", "live-face-verification-2025")
    .update(data)
    .digest("hex");
}

/**
 * Verify face verification token
 */
export function verifyFaceVerificationToken(
  faceImageBase64: string,
  timestamp: number,
  deviceId: string,
  providedToken: string
): boolean {
  const expectedToken = createFaceVerificationToken(faceImageBase64, timestamp, deviceId);
  
  return crypto.timingSafeEqual(
    Buffer.from(expectedToken),
    Buffer.from(providedToken)
  );
}

/**
 * Log face verification attempt
 */
export function logFaceVerificationAttempt(
  ownerOpenId: string,
  granted: boolean,
  reason: string,
  elapsedMs: number,
  confidence: number
): void {
  const timestamp = new Date().toISOString();
  
  console.log(`[Live Face Verification] ${timestamp}`);
  console.log(`  Owner: ${ownerOpenId}`);
  console.log(`  Access: ${granted ? "GRANTED" : "DENIED"}`);
  console.log(`  Reason: ${reason}`);
  console.log(`  Elapsed: ${elapsedMs}ms / 5000ms`);
  console.log(`  Confidence: ${(confidence * 100).toFixed(2)}%`);
  
  // In production, this would write to audit log database
}

console.log("[Live Face Verification] System initialized");
console.log("[Live Face Verification] Timestamp window: 5 seconds");
console.log("[Live Face Verification] Liveness detection: enabled");
console.log("[Live Face Verification] Min confidence: 95%");
