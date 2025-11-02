/**
 * iOS Screen Lock Detection Hook
 * Author: Jonathan Sherman - Monaco Edition
 * 
 * Detects when iPhone screen locks or page becomes hidden
 * Triggers automatic conversation backup
 */

import { useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";

export interface ScreenLockDetectionOptions {
  enabled?: boolean;
  userOpenId?: string;
  onScreenLock?: () => void;
  onScreenUnlock?: () => void;
}

/**
 * Generate device ID for tracking
 */
function getDeviceId(): string {
  // Try to get from localStorage first
  let deviceId = localStorage.getItem("deviceId");
  
  if (!deviceId) {
    // Generate new device ID
    deviceId = `DEVICE-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem("deviceId", deviceId);
  }
  
  return deviceId;
}

/**
 * Hook to detect screen lock events and trigger backups
 */
export function useScreenLockDetection(options: ScreenLockDetectionOptions = {}) {
  const { enabled = true, userOpenId, onScreenLock, onScreenUnlock } = options;
  
  const screenLockMutation = trpc.conversationMonitor.onScreenLock.useMutation();
  const lastEventRef = useRef<string>("");

  useEffect(() => {
    if (!enabled) return;

    const deviceId = getDeviceId();

    /**
     * Handle visibility change (screen lock/unlock)
     */
    const handleVisibilityChange = async () => {
      const isHidden = document.hidden;
      const lockType = isHidden ? "page_hidden" : "page_visible";

      // Prevent duplicate events
      if (lastEventRef.current === lockType) return;
      lastEventRef.current = lockType;

      console.log(`[Screen Lock Detection] ${lockType}`, {
        timestamp: new Date().toISOString(),
        deviceId,
      });

      // Trigger callback
      if (isHidden && onScreenLock) {
        onScreenLock();
      } else if (!isHidden && onScreenUnlock) {
        onScreenUnlock();
      }

      // Send to backend (only if userOpenId is provided)
      if (userOpenId) {
        try {
          const result = await screenLockMutation.mutateAsync({
            deviceId,
            lockType,
            userOpenId,
          });

          if (result.success && result.backupsCreated > 0) {
            console.log(
              `[Screen Lock Detection] ✅ Created ${result.backupsCreated} conversation backups`
            );
          }
        } catch (error) {
          console.error("[Screen Lock Detection] Error triggering backup:", error);
        }
      }
    };

    /**
     * Handle page freeze (iOS specific)
     */
    const handlePageFreeze = () => {
      console.log("[Screen Lock Detection] Page freeze detected (iOS)");
      handleVisibilityChange();
    };

    /**
     * Handle page resume (iOS specific)
     */
    const handlePageResume = () => {
      console.log("[Screen Lock Detection] Page resume detected (iOS)");
      handleVisibilityChange();
    };

    // Listen for visibility change events
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    // iOS-specific events
    document.addEventListener("freeze", handlePageFreeze);
    document.addEventListener("resume", handlePageResume);

    // Cleanup
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("freeze", handlePageFreeze);
      document.removeEventListener("resume", handlePageResume);
    };
  }, [enabled, userOpenId, onScreenLock, onScreenUnlock, screenLockMutation]);

  return {
    isSupported: typeof document !== "undefined" && "hidden" in document,
    deviceId: getDeviceId(),
  };
}
