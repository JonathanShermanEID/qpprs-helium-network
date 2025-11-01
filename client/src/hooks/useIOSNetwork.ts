/**
 * React Hook for iOS Network Detection
 * Provides iOS-specific network status for iPhone XR
 * Author: Jonathan Sherman
 */

import { useEffect, useState } from 'react';
import { iosNetworkDetection, iOSNetworkStatus } from '@/utils/iosNetworkDetection';

export function useIOSNetwork() {
  const [status, setStatus] = useState<iOSNetworkStatus | null>(
    iosNetworkDetection.getCurrentStatus()
  );

  useEffect(() => {
    // Subscribe to iOS network status changes
    const unsubscribe = iosNetworkDetection.subscribe(setStatus);

    // Cleanup on unmount
    return unsubscribe;
  }, []);

  const forceCheck = async () => {
    await iosNetworkDetection.forceCheck();
  };

  return {
    status,
    isIOS: status?.isIOS ?? false,
    isStandalone: status?.isStandalone ?? false,
    hasMeshNetwork: status?.hasMeshNetwork ?? false,
    effectiveConnection: status?.effectiveConnection ?? 'offline',
    canMakeRequests: status?.canMakeRequests ?? false,
    forceCheck,
  };
}
