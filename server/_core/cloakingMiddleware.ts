/**
 * Advanced Cloaking Middleware
 * Detects iPhone XR and shows real platform, all others see grocery store decoy
 * Author: Jonathan Sherman - Monaco Edition
 */

import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

/**
 * Generate device fingerprint from request
 */
export function generateDeviceFingerprint(req: Request): string {
  const userAgent = req.headers["user-agent"] || "";
  const acceptLanguage = req.headers["accept-language"] || "";
  const acceptEncoding = req.headers["accept-encoding"] || "";
  const ip = req.ip || req.socket.remoteAddress || "";
  
  const fingerprintData = `${userAgent}|${acceptLanguage}|${acceptEncoding}|${ip}`;
  return crypto.createHash("sha256").update(fingerprintData).digest("hex");
}

/**
 * Detect if device is the authentic iPhone XR
 */
export function isAuthenticIPhoneXR(req: Request): boolean {
  const userAgent = req.headers["user-agent"] || "";
  
  // Check for iPhone XR specific markers
  const isIPhone = /iPhone/.test(userAgent);
  const isXR = /iPhone11,8/.test(userAgent); // iPhone XR model identifier
  const isSafari = /Safari/.test(userAgent) && /Version/.test(userAgent);
  const isWebKit = /AppleWebKit/.test(userAgent);
  
  // Additional checks for authenticity
  const hasProperHeaders = 
    req.headers["accept"] &&
    req.headers["accept-language"] &&
    req.headers["accept-encoding"];
  
  // Check for common emulator/spoof patterns
  const isNotEmulator = 
    !userAgent.includes("Emulator") &&
    !userAgent.includes("Simulator") &&
    !userAgent.includes("Bot") &&
    !userAgent.includes("Crawler");
  
  return isIPhone && isXR && isSafari && isWebKit && hasProperHeaders && isNotEmulator;
}

/**
 * Log unauthorized access attempts
 */
export async function logUnauthorizedAccess(req: Request, fingerprint: string) {
  const { getDb } = await import("../db");
  const db = await getDb();
  
  if (!db) return;
  
  try {
    const logData = {
      timestamp: new Date().toISOString(),
      fingerprint,
      userAgent: req.headers["user-agent"] || "unknown",
      ip: req.ip || req.socket.remoteAddress || "unknown",
      path: req.path,
      method: req.method,
      headers: JSON.stringify(req.headers),
    };
    
    console.log("[CLOAKING] Unauthorized access attempt:", logData);
    
    // Store in database for analysis
    // This helps identify patterns and potential threats
  } catch (error) {
    console.error("[CLOAKING] Failed to log unauthorized access:", error);
  }
}

/**
 * Cloaking middleware - decides what UI to show
 */
export function cloakingMiddleware(req: Request, res: Response, next: NextFunction) {
  // Skip cloaking for API routes
  if (req.path.startsWith("/api/")) {
    return next();
  }
  
  // Skip cloaking for static assets
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
    return next();
  }
  
  const isAuthentic = isAuthenticIPhoneXR(req);
  const fingerprint = generateDeviceFingerprint(req);
  
  if (isAuthentic) {
    // Authentic iPhone XR - show real platform
    console.log("[CLOAKING] ✅ Authentic iPhone XR detected - showing real platform");
    req.headers["x-show-real-platform"] = "true";
  } else {
    // Unauthorized device - show grocery store decoy
    console.log("[CLOAKING] 🛡️ Unauthorized device detected - activating grocery store decoy");
    logUnauthorizedAccess(req, fingerprint);
    req.headers["x-show-decoy"] = "true";
  }
  
  next();
}

/**
 * API endpoint protection - returns different data based on device
 */
export function protectAPIResponse(req: Request, realData: any, decoyData: any) {
  if (req.headers["x-show-real-platform"] === "true") {
    return realData;
  }
  return decoyData;
}
