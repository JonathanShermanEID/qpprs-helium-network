/**
 * Advanced Clone Detection System
 * Author: Jonathan Sherman - Monaco Edition
 * 
 * Detects and blocks clones, emulators, virtual machines, and unauthorized devices
 */

import crypto from 'crypto';

export interface CloneDetectionResult {
  isClone: boolean;
  confidence: number; // 0-100
  reasons: string[];
  deviceType: 'authentic' | 'emulator' | 'clone' | 'vm' | 'unknown';
  fingerprint: string;
  timestamp: Date;
}

export interface DeviceFingerprint {
  userAgent: string;
  platform: string;
  screenResolution: string;
  colorDepth: number;
  timezone: string;
  language: string;
  hardwareConcurrency: number;
  deviceMemory?: number;
  maxTouchPoints: number;
  vendor: string;
  vendorSub: string;
  productSub: string;
  oscpu?: string;
  webGLRenderer?: string;
  webGLVendor?: string;
  canvas?: string;
  audio?: string;
}

/**
 * Generate cryptographic fingerprint from device characteristics
 */
export function generateDeviceFingerprint(device: DeviceFingerprint): string {
  const data = JSON.stringify(device);
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Detect if device is an emulator
 */
function detectEmulator(device: DeviceFingerprint): { isEmulator: boolean; reasons: string[] } {
  const reasons: string[] = [];
  
  // Check for common emulator user agents
  const emulatorPatterns = [
    /Android.*SDK/i,
    /Emulator/i,
    /Simulator/i,
    /VirtualBox/i,
    /VMware/i,
    /QEMU/i,
    /Genymotion/i,
    /BlueStacks/i,
    /NoxPlayer/i,
    /MEmu/i,
    /LDPlayer/i,
  ];
  
  for (const pattern of emulatorPatterns) {
    if (pattern.test(device.userAgent)) {
      reasons.push(`Emulator pattern detected in user agent: ${pattern}`);
    }
  }
  
  // Check for suspicious hardware characteristics
  if (device.hardwareConcurrency === 1) {
    reasons.push('Suspicious hardware concurrency (1 core)');
  }
  
  if (device.maxTouchPoints === 0 && device.userAgent.includes('Mobile')) {
    reasons.push('Mobile device with no touch support');
  }
  
  // Check for generic/suspicious vendors
  const suspiciousVendors = ['', 'unknown', 'generic', 'google inc.'];
  if (suspiciousVendors.includes(device.vendor.toLowerCase())) {
    reasons.push(`Suspicious vendor: ${device.vendor}`);
  }
  
  // Check WebGL renderer for virtualization
  if (device.webGLRenderer) {
    const vmPatterns = [/SwiftShader/i, /llvmpipe/i, /VirtualBox/i, /VMware/i];
    for (const pattern of vmPatterns) {
      if (pattern.test(device.webGLRenderer)) {
        reasons.push(`Virtual GPU detected: ${device.webGLRenderer}`);
      }
    }
  }
  
  return {
    isEmulator: reasons.length > 0,
    reasons,
  };
}

/**
 * Detect if device is a virtual machine
 */
function detectVirtualMachine(device: DeviceFingerprint): { isVM: boolean; reasons: string[] } {
  const reasons: string[] = [];
  
  // Check for VM-specific patterns
  const vmPatterns = [
    /VirtualBox/i,
    /VMware/i,
    /QEMU/i,
    /Parallels/i,
    /Hyper-V/i,
    /KVM/i,
  ];
  
  for (const pattern of vmPatterns) {
    if (pattern.test(device.userAgent) || pattern.test(device.platform)) {
      reasons.push(`VM pattern detected: ${pattern}`);
    }
  }
  
  // Check for suspicious screen resolutions (common VM defaults)
  const vmResolutions = ['800x600', '1024x768', '1280x720', '1280x800'];
  if (vmResolutions.includes(device.screenResolution)) {
    reasons.push(`Suspicious VM resolution: ${device.screenResolution}`);
  }
  
  return {
    isVM: reasons.length > 0,
    reasons,
  };
}

/**
 * Verify iPhone XR authenticity
 */
function verifyIPhoneXR(device: DeviceFingerprint): { isAuthentic: boolean; reasons: string[] } {
  const reasons: string[] = [];
  
  // iPhone XR specific checks
  const expectedResolution = '828x1792'; // iPhone XR resolution
  const expectedUserAgentPattern = /iPhone11,8/; // iPhone XR model identifier
  
  // Check user agent for iPhone XR model
  if (!expectedUserAgentPattern.test(device.userAgent)) {
    reasons.push('User agent does not match iPhone XR (iPhone11,8)');
  }
  
  // Check for Safari/WebKit
  if (!device.userAgent.includes('Safari') && !device.userAgent.includes('WebKit')) {
    reasons.push('Missing Safari/WebKit in user agent');
  }
  
  // Check screen resolution
  if (device.screenResolution !== expectedResolution && device.screenResolution !== '1792x828') {
    reasons.push(`Screen resolution mismatch: expected ${expectedResolution}, got ${device.screenResolution}`);
  }
  
  // Check for iOS platform
  if (!device.platform.includes('iPhone') && !device.platform.includes('iOS')) {
    reasons.push('Platform does not match iOS/iPhone');
  }
  
  // Check vendor (should be Apple)
  if (!device.vendor.includes('Apple')) {
    reasons.push(`Vendor mismatch: expected Apple, got ${device.vendor}`);
  }
  
  // Check max touch points (iPhone supports multi-touch)
  if (device.maxTouchPoints < 5) {
    reasons.push(`Insufficient touch points: ${device.maxTouchPoints}`);
  }
  
  return {
    isAuthentic: reasons.length === 0,
    reasons,
  };
}

/**
 * Detect rooted/jailbroken devices
 */
function detectRootedDevice(device: DeviceFingerprint): { isRooted: boolean; reasons: string[] } {
  const reasons: string[] = [];
  
  // Check for jailbreak indicators in user agent
  const jailbreakPatterns = [
    /Cydia/i,
    /Substrate/i,
    /Jailbreak/i,
    /Rooted/i,
  ];
  
  for (const pattern of jailbreakPatterns) {
    if (pattern.test(device.userAgent)) {
      reasons.push(`Jailbreak indicator detected: ${pattern}`);
    }
  }
  
  return {
    isRooted: reasons.length > 0,
    reasons,
  };
}

/**
 * Main clone detection function
 */
export function detectClone(device: DeviceFingerprint): CloneDetectionResult {
  const reasons: string[] = [];
  let deviceType: CloneDetectionResult['deviceType'] = 'unknown';
  let confidence = 0;
  
  // Generate fingerprint
  const fingerprint = generateDeviceFingerprint(device);
  
  // Run all detection checks
  const emulatorCheck = detectEmulator(device);
  const vmCheck = detectVirtualMachine(device);
  const iphoneCheck = verifyIPhoneXR(device);
  const rootCheck = detectRootedDevice(device);
  
  // Determine device type and confidence
  if (emulatorCheck.isEmulator) {
    deviceType = 'emulator';
    reasons.push(...emulatorCheck.reasons);
    confidence += 40;
  }
  
  if (vmCheck.isVM) {
    deviceType = 'vm';
    reasons.push(...vmCheck.reasons);
    confidence += 30;
  }
  
  if (rootCheck.isRooted) {
    reasons.push(...rootCheck.reasons);
    confidence += 20;
  }
  
  if (!iphoneCheck.isAuthentic) {
    if (deviceType === 'unknown') {
      deviceType = 'clone';
    }
    reasons.push(...iphoneCheck.reasons);
    confidence += 30;
  } else {
    // Authentic iPhone XR
    deviceType = 'authentic';
    confidence = 0; // No clone indicators
  }
  
  // Cap confidence at 100
  confidence = Math.min(confidence, 100);
  
  const isClone = deviceType !== 'authentic';
  
  return {
    isClone,
    confidence,
    reasons,
    deviceType,
    fingerprint,
    timestamp: new Date(),
  };
}

/**
 * Store blocked device fingerprints in memory
 * In production, this should be stored in database
 */
const blockedFingerprints = new Set<string>();

/**
 * Block a device fingerprint
 */
export function blockDevice(fingerprint: string): void {
  blockedFingerprints.add(fingerprint);
  console.log(`[Clone Detection] Blocked device: ${fingerprint}`);
}

/**
 * Check if device is blocked
 */
export function isDeviceBlocked(fingerprint: string): boolean {
  return blockedFingerprints.has(fingerprint);
}

/**
 * Get all blocked devices
 */
export function getBlockedDevices(): string[] {
  return Array.from(blockedFingerprints);
}

/**
 * Clear all blocked devices (admin only)
 */
export function clearBlockedDevices(): void {
  blockedFingerprints.clear();
  console.log('[Clone Detection] Cleared all blocked devices');
}
