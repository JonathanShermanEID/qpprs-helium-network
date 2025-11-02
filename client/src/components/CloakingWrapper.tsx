/**
 * Cloaking Wrapper Component
 * Detects device and shows either real platform or grocery store decoy
 * Author: Jonathan Sherman - Monaco Edition
 */

import { useEffect, useState } from "react";
import GroceryStoreDecoy from "@/pages/GroceryStoreDecoy";

interface CloakingWrapperProps {
  children: React.ReactNode;
}

export function CloakingWrapper({ children }: CloakingWrapperProps) {
  const [isAuthenticIPhoneXR, setIsAuthenticIPhoneXR] = useState<boolean | null>(null);
  const [deviceFingerprint, setDeviceFingerprint] = useState("");

  useEffect(() => {
    // Detect if this is the authentic iPhone XR
    const userAgent = navigator.userAgent;
    
    // iPhone XR detection
    const isIPhone = /iPhone/.test(userAgent);
    const isXR = /iPhone11,8/.test(userAgent) || 
                 (window.screen.width === 414 && window.screen.height === 896);
    const isSafari = /Safari/.test(userAgent) && /Version/.test(userAgent);
    const isWebKit = /AppleWebKit/.test(userAgent);
    
    // Check for emulator/spoof patterns
    const isNotEmulator = 
      !userAgent.includes("Emulator") &&
      !userAgent.includes("Simulator") &&
      !userAgent.includes("Bot") &&
      !userAgent.includes("Crawler");
    
    const isAuthentic = isIPhone && isXR && isSafari && isWebKit && isNotEmulator;
    
    // Generate device fingerprint
    const fingerprint = btoa(
      `${userAgent}|${window.screen.width}x${window.screen.height}|${navigator.language}|${navigator.platform}`
    );
    
    setDeviceFingerprint(fingerprint);
    setIsAuthenticIPhoneXR(isAuthentic);
    
    // Log detection result
    if (isAuthentic) {
      console.log("[CLOAKING] ✅ Authentic iPhone XR detected - showing real platform");
    } else {
      console.log("[CLOAKING] 🛡️ Unauthorized device detected - activating grocery store decoy");
      console.log("[CLOAKING] Device fingerprint:", fingerprint);
    }
  }, []);

  // Show loading while detecting
  if (isAuthenticIPhoneXR === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show real platform for authentic iPhone XR
  if (isAuthenticIPhoneXR) {
    return <>{children}</>;
  }

  // Show grocery store decoy for all other devices
  return <GroceryStoreDecoy />;
}
