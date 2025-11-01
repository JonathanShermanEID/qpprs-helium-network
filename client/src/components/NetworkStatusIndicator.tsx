/**
 * Network Status Indicator Component
 * Shows real-time network connectivity status with visual indicators
 * Author: Jonathan Sherman
 */

import { useNetworkDetection } from '@/hooks/useNetworkDetection';
import { Wifi, WifiOff, Radio, Signal, SignalHigh, SignalLow, SignalMedium } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function NetworkStatusIndicator() {
  const { status, meshInfo, isOnline, isMeshNetwork, meshAvailable, signalStrength } = useNetworkDetection();
  const [previousMeshState, setPreviousMeshState] = useState<boolean>(false);

  useEffect(() => {
    // Notify user when mesh network becomes available
    if (meshAvailable && !previousMeshState) {
      toast.success('Helium Mesh Network Connected', {
        description: `Signal strength: ${signalStrength}% | ${meshInfo?.connectedHotspots || 0} hotspots nearby`,
        duration: 5000,
      });
    }

    // Notify when mesh network disconnects
    if (!meshAvailable && previousMeshState) {
      toast.info('Mesh Network Disconnected', {
        description: 'Switched to traditional network',
        duration: 3000,
      });
    }

    setPreviousMeshState(meshAvailable);
  }, [meshAvailable, signalStrength, meshInfo?.connectedHotspots, previousMeshState]);

  const getSignalIcon = () => {
    if (!isOnline) return <WifiOff className="w-4 h-4" />;
    if (isMeshNetwork) return <Radio className="w-4 h-4" />;
    
    if (signalStrength >= 75) return <SignalHigh className="w-4 h-4" />;
    if (signalStrength >= 50) return <SignalMedium className="w-4 h-4" />;
    if (signalStrength >= 25) return <SignalLow className="w-4 h-4" />;
    return <Signal className="w-4 h-4" />;
  };

  const getStatusColor = () => {
    if (!isOnline) return 'text-red-500';
    if (isMeshNetwork) return 'text-cyan-400';
    return 'text-green-500';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (isMeshNetwork) return 'Mesh Network';
    return status?.connectionType === 'wifi' ? 'Wi-Fi' : 'Cellular';
  };

  const getSignalQuality = () => {
    if (!meshAvailable) return null;
    if (signalStrength >= 75) return 'Excellent';
    if (signalStrength >= 50) return 'Good';
    if (signalStrength >= 25) return 'Fair';
    return 'Weak';
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-black/40 backdrop-blur-xl border border-cyan-500/30 rounded-2xl px-4 py-2 shadow-lg shadow-cyan-500/20">
        <div className="flex items-center gap-3">
          {/* Status Icon */}
          <div className={`${getStatusColor()} transition-colors duration-300`}>
            {getSignalIcon()}
          </div>

          {/* Status Text */}
          <div className="flex flex-col">
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
            {meshAvailable && (
              <span className="text-xs text-cyan-300">
                {getSignalQuality()} • {meshInfo?.latency || 0}ms
              </span>
            )}
          </div>

          {/* Signal Strength Bar (for mesh network) */}
          {meshAvailable && (
            <div className="flex flex-col gap-0.5 ml-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 h-1 rounded-full transition-all duration-300 ${
                    signalStrength >= (i + 1) * 25
                      ? 'bg-cyan-400 shadow-[0_0_4px_rgba(34,211,238,0.8)]'
                      : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Pulse animation for active mesh connection */}
          {isMeshNetwork && (
            <div className="relative">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              <div className="absolute inset-0 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-75" />
            </div>
          )}
        </div>

        {/* Additional Info on Hover */}
        {meshAvailable && meshInfo && (
          <div className="mt-2 pt-2 border-t border-cyan-500/20 text-xs text-gray-300 space-y-1">
            <div className="flex justify-between gap-4">
              <span>Hotspots:</span>
              <span className="text-cyan-300 font-medium">{meshInfo.connectedHotspots}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Bandwidth:</span>
              <span className="text-cyan-300 font-medium">{meshInfo.bandwidth.toFixed(1)} Mbps</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
