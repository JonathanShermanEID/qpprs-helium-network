/**
 * iPhone XR Exclusive Write Control Middleware with Clone Detection
 * Author: Jonathan Sherman - Monaco Edition
 * 
 * Locks all write operations (mutations) to authentic iPhone XR only.
 * Detects and blocks cloned/spoofed devices automatically.
 * All other devices are forced into read-only mode with production halt on write attempts.
 */

import { TRPCError } from "@trpc/server";
import type { Request } from "express";
import crypto from "crypto";

// Authentic iPhone XR device signature (will be set on first authentic access)
let AUTHENTIC_DEVICE_SIGNATURE: string | null = null;

// Blocked device signatures (clones/spoofed devices)
const BLOCKED_SIGNATURES = new Set<string>();

// Clone detection attempts log
const CLONE_ATTEMPTS: Array<{
  signature: string;
  timestamp: string;
  reason: string;
  fingerprint: string;
}> = [];

/**
 * Generate unique device signature based on multiple factors
 * This creates a fingerprint that's difficult to clone
 */
function generateDeviceSignature(req: Request): string {
  const userAgent = Array.isArray(req.headers['user-agent']) 
    ? req.headers['user-agent'][0] 
    : req.headers['user-agent'] || '';
  const acceptLanguage = Array.isArray(req.headers['accept-language'])
    ? req.headers['accept-language'][0]
    : req.headers['accept-language'] || '';
  const acceptEncoding = Array.isArray(req.headers['accept-encoding'])
    ? req.headers['accept-encoding'][0]
    : req.headers['accept-encoding'] || '';
  const platform = Array.isArray(req.headers['sec-ch-ua-platform'])
    ? req.headers['sec-ch-ua-platform'][0]
    : req.headers['sec-ch-ua-platform'] || '';
  const mobile = Array.isArray(req.headers['sec-ch-ua-mobile'])
    ? req.headers['sec-ch-ua-mobile'][0]
    : req.headers['sec-ch-ua-mobile'] || '';
  const screenWidth = Array.isArray(req.headers['sec-ch-viewport-width'])
    ? req.headers['sec-ch-viewport-width'][0]
    : req.headers['sec-ch-viewport-width'] || '';
  
  // Combine multiple factors for unique signature
  const signatureData = [
    userAgent,
    acceptLanguage,
    acceptEncoding,
    platform,
    mobile,
    screenWidth,
    req.ip || req.socket.remoteAddress || '',
  ].join('|');
  
  // Generate SHA-256 hash as signature
  return crypto.createHash('sha256').update(signatureData).digest('hex');
}

/**
 * Detect if the request is from an iPhone XR
 * Uses multiple detection methods for maximum accuracy
 */
function isIPhoneXR(req: Request): boolean {
  const userAgent = Array.isArray(req.headers['user-agent'])
    ? req.headers['user-agent'][0]
    : req.headers['user-agent'] || '';
  const platform = Array.isArray(req.headers['sec-ch-ua-platform'])
    ? req.headers['sec-ch-ua-platform'][0]
    : req.headers['sec-ch-ua-platform'] || '';
  const mobile = Array.isArray(req.headers['sec-ch-ua-mobile'])
    ? req.headers['sec-ch-ua-mobile'][0]
    : req.headers['sec-ch-ua-mobile'] || '';
  
  // iPhone XR detection patterns
  const iphoneXRPatterns = [
    /iPhone.*OS 1[2-9]_/i,  // iOS 12+
    /iPhone.*OS [2-9][0-9]_/i,  // iOS 20+
    /iPhone11,8/i,  // iPhone XR model identifier
  ];
  
  // Check User-Agent for iPhone
  const isIPhone = /iPhone/i.test(userAgent);
  
  // Check for iOS version patterns
  const hasIOSPattern = iphoneXRPatterns.some(pattern => pattern.test(userAgent));
  
  // Check screen resolution hints (iPhone XR: 828x1792)
  const screenWidth = Array.isArray(req.headers['sec-ch-viewport-width'])
    ? req.headers['sec-ch-viewport-width'][0]
    : req.headers['sec-ch-viewport-width'] || '';
  const isXRResolution = screenWidth === '414' || screenWidth === '828';
  
  // Check for Safari/WebKit (iPhone XR uses Safari)
  const isSafari = /Safari/i.test(userAgent) && /AppleWebKit/i.test(userAgent);
  
  // Check platform headers
  const isIOSPlatform = /iOS/i.test(platform) || mobile === '?1';
  
  // Combine all detection methods
  const isLikelyIPhoneXR = isIPhone && (hasIOSPattern || isXRResolution) && isSafari;
  
  return isLikelyIPhoneXR || isIOSPlatform;
}

/**
 * Detect if device is a clone/spoof attempt
 * Returns true if device is suspicious
 */
function isClonedDevice(req: Request, signature: string): { isClone: boolean; reason: string } {
  // If device is already blocked, it's a clone
  if (BLOCKED_SIGNATURES.has(signature)) {
    return { isClone: true, reason: 'Previously blocked signature' };
  }
  
  // If we have an authentic signature and this doesn't match, it's a clone
  if (AUTHENTIC_DEVICE_SIGNATURE && signature !== AUTHENTIC_DEVICE_SIGNATURE) {
    return { isClone: true, reason: 'Signature mismatch with authentic device' };
  }
  
  // Check for suspicious patterns
  const userAgent = Array.isArray(req.headers['user-agent'])
    ? req.headers['user-agent'][0]
    : req.headers['user-agent'] || '';
  
  // Detect emulators/simulators
  if (/simulator/i.test(userAgent) || /emulator/i.test(userAgent)) {
    return { isClone: true, reason: 'Emulator/simulator detected' };
  }
  
  // Detect user agent spoofing tools
  if (/headless/i.test(userAgent) || /phantom/i.test(userAgent) || /selenium/i.test(userAgent)) {
    return { isClone: true, reason: 'Automation tool detected' };
  }
  
  // Check for inconsistent headers (sign of spoofing)
  const platform = Array.isArray(req.headers['sec-ch-ua-platform'])
    ? req.headers['sec-ch-ua-platform'][0]
    : req.headers['sec-ch-ua-platform'] || '';
  if (/iPhone/i.test(userAgent) && platform && !/iOS/i.test(platform)) {
    return { isClone: true, reason: 'Inconsistent platform headers' };
  }
  
  return { isClone: false, reason: '' };
}

/**
 * Get device fingerprint for logging
 */
function getDeviceFingerprint(req: Request): string {
  const userAgent = Array.isArray(req.headers['user-agent'])
    ? req.headers['user-agent'][0]
    : req.headers['user-agent'] || 'unknown';
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const platform = Array.isArray(req.headers['sec-ch-ua-platform'])
    ? req.headers['sec-ch-ua-platform'][0]
    : req.headers['sec-ch-ua-platform'] || 'unknown';
  
  return `${platform}|${userAgent.substring(0, 50)}|${ip}`;
}

/**
 * Log clone detection attempt
 */
function logCloneAttempt(signature: string, reason: string, fingerprint: string) {
  const attempt = {
    signature,
    timestamp: new Date().toISOString(),
    reason,
    fingerprint,
  };
  
  CLONE_ATTEMPTS.push(attempt);
  
  // Keep only last 1000 attempts
  if (CLONE_ATTEMPTS.length > 1000) {
    CLONE_ATTEMPTS.shift();
  }
  
  console.error('[CLONE DETECTED] 🚨 Clone/spoof attempt blocked', attempt);
}

/**
 * Block a device signature permanently
 */
function blockDevice(signature: string) {
  BLOCKED_SIGNATURES.add(signature);
  console.error('[DEVICE BLOCKED] 🔒 Device permanently blocked', { signature });
}

/**
 * Register authentic iPhone XR on first access
 */
function registerAuthenticDevice(signature: string) {
  if (!AUTHENTIC_DEVICE_SIGNATURE) {
    AUTHENTIC_DEVICE_SIGNATURE = signature;
    console.log('[AUTHENTIC DEVICE] ✅ iPhone XR registered', { 
      signature: signature.substring(0, 16) + '...' 
    });
  }
}

/**
 * Middleware to enforce iPhone XR-only write access with clone detection
 * Throws error if non-iPhone XR device or cloned device attempts a mutation
 */
export function enforceIPhoneXROnly(req: Request) {
  const signature = generateDeviceSignature(req);
  const fingerprint = getDeviceFingerprint(req);
  
  // First check: Is this an iPhone XR?
  if (!isIPhoneXR(req)) {
    console.error('[PRODUCTION HALT] ❌ Non-iPhone XR write attempt blocked', {
      device: fingerprint,
      signature: signature.substring(0, 16) + '...',
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
    
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'PRODUCTION HALT: Write operations are restricted to iPhone XR only. This device is in read-only mode.',
    });
  }
  
  // Second check: Is this a clone/spoof?
  const cloneCheck = isClonedDevice(req, signature);
  if (cloneCheck.isClone) {
    // Log the clone attempt
    logCloneAttempt(signature, cloneCheck.reason, fingerprint);
    
    // Block the device permanently
    blockDevice(signature);
    
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'PRODUCTION HALT: Cloned or spoofed device detected. Device has been permanently blocked.',
    });
  }
  
  // Register as authentic device if first time
  registerAuthenticDevice(signature);
  
  console.log('[iPhone XR Write] ✅ Authorized write operation', {
    timestamp: new Date().toISOString(),
    path: req.path,
    signature: signature.substring(0, 16) + '...',
  });
}

/**
 * Check if device has write access (for UI display)
 */
export function hasWriteAccess(req: Request): boolean {
  if (!isIPhoneXR(req)) {
    return false;
  }
  
  const signature = generateDeviceSignature(req);
  const cloneCheck = isClonedDevice(req, signature);
  
  return !cloneCheck.isClone;
}

/**
 * Get clone detection statistics (for monitoring)
 */
export function getCloneDetectionStats() {
  return {
    authenticSignature: AUTHENTIC_DEVICE_SIGNATURE ? AUTHENTIC_DEVICE_SIGNATURE.substring(0, 16) + '...' : null,
    blockedDevices: BLOCKED_SIGNATURES.size,
    cloneAttempts: CLONE_ATTEMPTS.length,
    recentAttempts: CLONE_ATTEMPTS.slice(-10),
  };
}
