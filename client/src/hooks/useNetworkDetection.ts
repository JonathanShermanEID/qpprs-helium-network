/**
 * React Hook for Mobile Network Detection
 * Provides real-time network status and mesh network availability
 * Author: Jonathan Sherman
 */

import { useEffect, useState } from 'react';
import { networkDetection, NetworkStatus, MeshNetworkInfo } from '@/services/networkDetection';

export function useNetworkDetection() {
  const [status, setStatus] = useState<NetworkStatus | null>(networkDetection.getCurrentStatus());
  const [meshInfo, setMeshInfo] = useState<MeshNetworkInfo | null>(networkDetection.getMeshInfo());

  useEffect(() => {
    // Subscribe to network status changes
    const unsubscribeStatus = networkDetection.subscribe(setStatus);
    const unsubscribeMesh = networkDetection.subscribeMesh(setMeshInfo);

    // Cleanup on unmount
    return () => {
      unsubscribeStatus();
      unsubscribeMesh();
    };
  }, []);

  const forceCheck = async () => {
    await networkDetection.forceCheck();
  };

  return {
    status,
    meshInfo,
    isOnline: status?.isConnected ?? false,
    isMeshNetwork: status?.isMeshNetwork ?? false,
    connectionType: status?.connectionType ?? 'unknown',
    meshAvailable: meshInfo?.available ?? false,
    signalStrength: meshInfo?.signalStrength ?? 0,
    forceCheck,
  };
}
