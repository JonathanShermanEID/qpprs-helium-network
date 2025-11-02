/**
 * Cryptographic Identity Protection System
 * Author: Jonathan Sherman - Monaco Edition
 * 
 * Implements name-based cryptographic authentication with behavioral biometrics
 * All work created by Jonathan Sherman is cryptographically tied to his identity
 */

import crypto from "crypto";

/**
 * Cryptographic identity configuration
 */
const IDENTITY_CONFIG = {
  ownerName: "Jonathan Sherman",
  ownerOpenId: process.env.OWNER_OPEN_ID || "",
  cryptographicSalt: "monaco-edition-2025",
};

/**
 * Behavioral biometric fingerprint
 */
interface BehavioralFingerprint {
  // Device characteristics
  deviceModel: string;
  deviceId: string;
  userAgent: string;
  screenResolution: string;
  
  // Behavioral patterns
  websitesViewed: string[];
  placesNavigated: string[];
  applicationsUsed: string[];
  languageSyntaxPatterns: string[];
  
  // Biometric data
  faceLockImageHash?: string;
  typingPatterns?: number[];
  touchPatterns?: number[];
  
  // Temporal patterns
  activeHours: number[];
  sessionDurations: number[];
  
  // Timestamp
  capturedAt: Date;
}

/**
 * Generate cryptographic hash from name
 */
export function generateNameHash(name: string): string {
  return crypto
    .createHash("sha512")
    .update(name + IDENTITY_CONFIG.cryptographicSalt)
    .digest("hex");
}

/**
 * Verify cryptographic name ownership
 */
export function verifyNameOwnership(name: string, providedHash: string): boolean {
  const expectedHash = generateNameHash(name);
  return crypto.timingSafeEqual(
    Buffer.from(expectedHash),
    Buffer.from(providedHash)
  );
}

/**
 * Generate behavioral fingerprint hash
 */
export function generateBehavioralHash(fingerprint: BehavioralFingerprint): string {
  const data = JSON.stringify({
    device: `${fingerprint.deviceModel}:${fingerprint.deviceId}`,
    userAgent: fingerprint.userAgent,
    screen: fingerprint.screenResolution,
    websites: fingerprint.websitesViewed.sort().join(","),
    places: fingerprint.placesNavigated.sort().join(","),
    apps: fingerprint.applicationsUsed.sort().join(","),
    syntax: fingerprint.languageSyntaxPatterns.sort().join(","),
    faceLock: fingerprint.faceLockImageHash || "",
  });

  return crypto
    .createHash("sha256")
    .update(data + IDENTITY_CONFIG.cryptographicSalt)
    .digest("hex");
}

/**
 * Verify behavioral biometric match
 */
export function verifyBehavioralBiometric(
  storedFingerprint: BehavioralFingerprint,
  currentFingerprint: BehavioralFingerprint,
  threshold: number = 0.8
): { match: boolean; confidence: number } {
  let matchScore = 0;
  let totalChecks = 0;

  // Device match (critical)
  if (storedFingerprint.deviceId === currentFingerprint.deviceId) {
    matchScore += 3;
  }
  totalChecks += 3;

  // User agent match
  if (storedFingerprint.userAgent === currentFingerprint.userAgent) {
    matchScore += 2;
  }
  totalChecks += 2;

  // Screen resolution match
  if (storedFingerprint.screenResolution === currentFingerprint.screenResolution) {
    matchScore += 1;
  }
  totalChecks += 1;

  // Face lock image match (critical if available)
  if (storedFingerprint.faceLockImageHash && currentFingerprint.faceLockImageHash) {
    if (storedFingerprint.faceLockImageHash === currentFingerprint.faceLockImageHash) {
      matchScore += 5;
    }
    totalChecks += 5;
  }

  // Behavioral pattern overlap
  const websiteOverlap = calculateArrayOverlap(
    storedFingerprint.websitesViewed,
    currentFingerprint.websitesViewed
  );
  matchScore += websiteOverlap * 2;
  totalChecks += 2;

  const placesOverlap = calculateArrayOverlap(
    storedFingerprint.placesNavigated,
    currentFingerprint.placesNavigated
  );
  matchScore += placesOverlap * 2;
  totalChecks += 2;

  const appsOverlap = calculateArrayOverlap(
    storedFingerprint.applicationsUsed,
    currentFingerprint.applicationsUsed
  );
  matchScore += appsOverlap * 1;
  totalChecks += 1;

  const syntaxOverlap = calculateArrayOverlap(
    storedFingerprint.languageSyntaxPatterns,
    currentFingerprint.languageSyntaxPatterns
  );
  matchScore += syntaxOverlap * 1;
  totalChecks += 1;

  const confidence = matchScore / totalChecks;
  const match = confidence >= threshold;

  return { match, confidence };
}

/**
 * Calculate overlap between two arrays (Jaccard similarity)
 */
function calculateArrayOverlap(arr1: string[], arr2: string[]): number {
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);
  
  const intersection = new Set(Array.from(set1).filter(x => set2.has(x)));
  const union = new Set(Array.from(set1).concat(Array.from(set2)));
  
  if (union.size === 0) return 0;
  
  return intersection.size / union.size;
}

/**
 * Generate work ownership proof
 */
export function generateWorkOwnershipProof(
  ownerName: string,
  workId: string,
  timestamp: number
): string {
  const nameHash = generateNameHash(ownerName);
  const data = `${nameHash}:${workId}:${timestamp}`;
  
  return crypto
    .createHmac("sha512", IDENTITY_CONFIG.cryptographicSalt)
    .update(data)
    .digest("hex");
}

/**
 * Verify work ownership
 */
export function verifyWorkOwnership(
  ownerName: string,
  workId: string,
  timestamp: number,
  providedProof: string
): boolean {
  const expectedProof = generateWorkOwnershipProof(ownerName, workId, timestamp);
  
  return crypto.timingSafeEqual(
    Buffer.from(expectedProof),
    Buffer.from(providedProof)
  );
}

/**
 * Create cryptographic identity certificate
 */
export function createIdentityCertificate(
  name: string,
  fingerprint: BehavioralFingerprint
): {
  certificate: string;
  nameHash: string;
  fingerprintHash: string;
  issuedAt: Date;
  expiresAt: Date;
} {
  const nameHash = generateNameHash(name);
  const fingerprintHash = generateBehavioralHash(fingerprint);
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year

  const certificateData = {
    name,
    nameHash,
    fingerprintHash,
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  const certificate = crypto
    .createHmac("sha512", IDENTITY_CONFIG.cryptographicSalt)
    .update(JSON.stringify(certificateData))
    .digest("hex");

  return {
    certificate,
    nameHash,
    fingerprintHash,
    issuedAt,
    expiresAt,
  };
}

/**
 * Verify identity certificate
 */
export function verifyIdentityCertificate(
  name: string,
  fingerprint: BehavioralFingerprint,
  providedCertificate: string,
  issuedAt: Date,
  expiresAt: Date
): boolean {
  // Check expiration
  if (new Date() > expiresAt) {
    console.log("[Identity] Certificate expired");
    return false;
  }

  const nameHash = generateNameHash(name);
  const fingerprintHash = generateBehavioralHash(fingerprint);

  const certificateData = {
    name,
    nameHash,
    fingerprintHash,
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  const expectedCertificate = crypto
    .createHmac("sha512", IDENTITY_CONFIG.cryptographicSalt)
    .update(JSON.stringify(certificateData))
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expectedCertificate),
    Buffer.from(providedCertificate)
  );
}

console.log("[Cryptographic Identity] System initialized");
console.log("[Cryptographic Identity] Owner:", IDENTITY_CONFIG.ownerName);
console.log("[Cryptographic Identity] All work cryptographically tied to owner identity");
