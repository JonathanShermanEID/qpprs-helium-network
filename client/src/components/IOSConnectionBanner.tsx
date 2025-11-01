/**
 * iOS Connection Status Banner
 * Shows persistent banner on iPhone when mesh network is active
 * Author: Jonathan Sherman
 */

import { useIOSNetwork } from '@/hooks/useIOSNetwork';
import { Radio, Wifi, WifiOff } from 'lucide-react';

export function IOSConnectionBanner() {
  const { isIOS, isStandalone, hasMeshNetwork, effectiveConnection, canMakeRequests } = useIOSNetwork();

  // Only show on iOS in standalone mode
  if (!isIOS || !isStandalone) return null;

  const getBannerConfig = () => {
    if (hasMeshNetwork && canMakeRequests) {
      return {
        icon: <Radio className="w-4 h-4" />,
        text: 'Connected via Helium Mesh Network',
        subtext: 'No Wi-Fi or cellular required',
        bgColor: 'bg-cyan-500/20',
        borderColor: 'border-cyan-500/40',
        textColor: 'text-cyan-300',
      };
    }

    if (effectiveConnection === 'wifi') {
      return {
        icon: <Wifi className="w-4 h-4" />,
        text: 'Connected via Wi-Fi',
        subtext: 'Standard connection',
        bgColor: 'bg-green-500/20',
        borderColor: 'border-green-500/40',
        textColor: 'text-green-300',
      };
    }

    if (effectiveConnection === 'cellular') {
      return {
        icon: <Wifi className="w-4 h-4" />,
        text: 'Connected via Cellular',
        subtext: 'Standard connection',
        bgColor: 'bg-blue-500/20',
        borderColor: 'border-blue-500/40',
        textColor: 'text-blue-300',
      };
    }

    return {
      icon: <WifiOff className="w-4 h-4" />,
      text: 'No Connection',
      subtext: 'Searching for mesh network...',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/40',
      textColor: 'text-red-300',
    };
  };

  const config = getBannerConfig();

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${config.bgColor} border-b ${config.borderColor} backdrop-blur-lg`}>
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center gap-3">
          <div className={config.textColor}>
            {config.icon}
          </div>
          <div className="flex-1">
            <div className={`text-sm font-medium ${config.textColor}`}>
              {config.text}
            </div>
            <div className="text-xs text-gray-400">
              {config.subtext}
            </div>
          </div>
          {hasMeshNetwork && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              <span className="text-xs text-cyan-400">Live</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
