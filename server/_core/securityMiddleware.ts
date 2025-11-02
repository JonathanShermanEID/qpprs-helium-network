/**
 * Security Middleware
 * Author: Jonathan Sherman - Monaco Edition
 * 
 * Implements webhook signature verification, rate limiting,
 * CORS policies, and port protection
 */

import crypto from "crypto";
import { Request, Response, NextFunction } from "express";

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limiting configuration
 */
const RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
};

/**
 * Rate limiting middleware
 */
export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const clientId = req.ip || "unknown";
  const now = Date.now();

  // Get or create rate limit entry
  let entry = rateLimitStore.get(clientId);

  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired one
    entry = {
      count: 0,
      resetTime: now + RATE_LIMIT.windowMs,
    };
    rateLimitStore.set(clientId, entry);
  }

  entry.count++;

  if (entry.count > RATE_LIMIT.maxRequests) {
    res.status(429).json({
      error: "Too many requests",
      retryAfter: Math.ceil((entry.resetTime - now) / 1000),
    });
    return;
  }

  // Add rate limit headers
  res.setHeader("X-RateLimit-Limit", RATE_LIMIT.maxRequests.toString());
  res.setHeader("X-RateLimit-Remaining", (RATE_LIMIT.maxRequests - entry.count).toString());
  res.setHeader("X-RateLimit-Reset", new Date(entry.resetTime).toISOString());

  next();
}

/**
 * Webhook signature verification
 */
export function verifyWebhookSignature(secret: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const signature = req.headers["x-webhook-signature"] as string;
    const timestamp = req.headers["x-webhook-timestamp"] as string;

    if (!signature || !timestamp) {
      res.status(401).json({ error: "Missing webhook signature or timestamp" });
      return;
    }

    // Verify timestamp is recent (within 5 minutes)
    const timestampMs = parseInt(timestamp, 10);
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (Math.abs(now - timestampMs) > fiveMinutes) {
      res.status(401).json({ error: "Webhook timestamp too old" });
      return;
    }

    // Verify signature
    const body = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${timestamp}.${body}`)
      .digest("hex");

    if (signature !== expectedSignature) {
      res.status(401).json({ error: "Invalid webhook signature" });
      return;
    }

    next();
  };
}

/**
 * CORS middleware with strict policies
 */
export function corsPolicy(req: Request, res: Response, next: NextFunction) {
  const allowedOrigins = [
    "https://manus.im",
    "https://api.manus.im",
    process.env.VITE_FRONTEND_URL || "http://localhost:3000",
  ];

  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "86400"); // 24 hours

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(204).send();
    return;
  }

  next();
}

/**
 * Port protection middleware
 */
export function portProtection(allowedPorts: number[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const port = parseInt(req.socket.localPort?.toString() || "0", 10);

    if (!allowedPorts.includes(port)) {
      res.status(403).json({ error: "Access to this port is forbidden" });
      return;
    }

    next();
  };
}

/**
 * Security headers middleware
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Enable XSS protection
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Strict transport security
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

  // Content security policy
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  );

  next();
}

/**
 * Clean up expired rate limit entries periodically
 */
setInterval(() => {
  const now = Date.now();
  const toDelete: string[] = [];
  rateLimitStore.forEach((entry, clientId) => {
    if (now > entry.resetTime) {
      toDelete.push(clientId);
    }
  });
  toDelete.forEach(clientId => rateLimitStore.delete(clientId));
}, 60 * 1000); // Clean up every minute

console.log("[Security] Middleware initialized");
console.log("[Security] Rate limiting: 100 requests/minute");
console.log("[Security] Webhook signature verification: enabled");
console.log("[Security] CORS policy: strict");
console.log("[Security] Port protection: enabled");
