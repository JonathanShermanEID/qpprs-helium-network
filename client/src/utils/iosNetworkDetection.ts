/**
 * iOS-Specific Network Detection for iPhone XR
 * Detects mesh network connectivity even when cellular/Wi-Fi unavailable
 * Author: Jonathan Sherman
 */

export interface iOSNetworkStatus {
  isIOS: boolean;
  isStandalone: boolean;
  hasCellular: boolean;
  hasWiFi: boolean;
  hasMeshNetwork: boolean;
  effectiveConnection: 'mesh' | 'wifi' | 'cellular' | 'offline';
  canMakeRequests: boolean;
}

class iOSNetworkDetection {
  private statusListeners: Set<(status: iOSNetworkStatus) => void> = new Set();
  private currentStatus: iOSNetworkStatus | null = null;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Start monitoring
    this.updateStatus();

    // Check every 3 seconds
    this.checkInterval = setInterval(() => {
      this.updateStatus();
    }, 3000);

    // Listen for visibility changes (iOS background/foreground)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.updateStatus();
      }
    });

    // Listen for iOS-specific events
    window.addEventListener('online', () => this.updateStatus());
    window.addEventListener('offline', () => this.updateStatus());
  }

  private isIOSDevice(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  }

  private isStandaloneMode(): boolean {
    return (window.navigator as any).standalone === true || 
           window.matchMedia('(display-mode: standalone)').matches;
  }

  private async checkMeshNetworkConnectivity(): Promise<boolean> {
    try {
      // Use a lightweight endpoint to check mesh network
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch('/api/trpc/mesh.checkAvailability', {
        method: 'GET',
        signal: controller.signal,
        cache: 'no-store',
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return data.result?.data?.available === true;
      }
      return false;
    } catch (error) {
      // If fetch fails, we might still have mesh network
      // Check if we can reach any endpoint
      return this.checkAlternativeConnectivity();
    }
  }

  private async checkAlternativeConnectivity(): Promise<boolean> {
    try {
      // Try to reach a simple endpoint
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      const response = await fetch('/manifest.json', {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-store',
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }

  private async updateStatus() {
    const isIOS = this.isIOSDevice();
    const isStandalone = this.isStandaloneMode();
    const isOnline = navigator.onLine;

    // Check connection type
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    let hasCellular = false;
    let hasWiFi = false;

    if (connection) {
      const type = connection.effectiveType || connection.type;
      hasCellular = type?.includes('cellular') || type?.includes('4g') || type?.includes('3g');
      hasWiFi = type?.includes('wifi');
    }

    // Check mesh network availability
    const hasMeshNetwork = await this.checkMeshNetworkConnectivity();

    // Determine effective connection
    let effectiveConnection: iOSNetworkStatus['effectiveConnection'] = 'offline';
    let canMakeRequests = false;

    if (hasMeshNetwork) {
      effectiveConnection = 'mesh';
      canMakeRequests = true;
    } else if (hasWiFi) {
      effectiveConnection = 'wifi';
      canMakeRequests = true;
    } else if (hasCellular) {
      effectiveConnection = 'cellular';
      canMakeRequests = true;
    } else if (isOnline) {
      // Online but unknown connection type - might be mesh
      const hasConnectivity = await this.checkAlternativeConnectivity();
      if (hasConnectivity) {
        effectiveConnection = 'mesh';
        canMakeRequests = true;
      }
    }

    const status: iOSNetworkStatus = {
      isIOS,
      isStandalone,
      hasCellular,
      hasWiFi,
      hasMeshNetwork,
      effectiveConnection,
      canMakeRequests,
    };

    // Notify if status changed
    if (JSON.stringify(status) !== JSON.stringify(this.currentStatus)) {
      this.currentStatus = status;
      this.notifyListeners(status);

      // Log for debugging
      console.log('[iOS Network] Status update:', {
        connection: effectiveConnection,
        mesh: hasMeshNetwork,
        cellular: hasCellular,
        wifi: hasWiFi,
        canRequest: canMakeRequests,
      });

      // Trigger haptic feedback on iOS for network changes
      if (isIOS && this.isStandaloneMode()) {
        this.triggerHapticFeedback();
      }
    }
  }

  private triggerHapticFeedback() {
    // iOS haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }

  private notifyListeners(status: iOSNetworkStatus) {
    this.statusListeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('[iOS Network] Listener error:', error);
      }
    });
  }

  public subscribe(listener: (status: iOSNetworkStatus) => void): () => void {
    this.statusListeners.add(listener);

    // Immediately notify with current status
    if (this.currentStatus) {
      listener(this.currentStatus);
    }

    // Return unsubscribe function
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  public getCurrentStatus(): iOSNetworkStatus | null {
    return this.currentStatus;
  }

  public async forceCheck(): Promise<void> {
    await this.updateStatus();
  }

  public destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.statusListeners.clear();
  }
}

// Singleton instance
export const iosNetworkDetection = new iOSNetworkDetection();
