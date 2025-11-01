/**
 * Mobile Device Network Detection Service
 * Detects when Helium mesh network is available and notifies the device
 * Author: Jonathan Sherman
 */

export interface NetworkStatus {
  isConnected: boolean;
  isMeshNetwork: boolean;
  connectionType: 'wifi' | 'cellular' | 'mesh' | 'offline' | 'unknown';
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';
  downlink: number; // Mbps
  rtt: number; // Round-trip time in ms
  saveData: boolean;
  timestamp: number;
}

export interface MeshNetworkInfo {
  available: boolean;
  signalStrength: number; // 0-100
  latency: number; // ms
  bandwidth: number; // Mbps
  connectedHotspots: number;
  nearbyHotspots: string[];
}

class NetworkDetectionService {
  private listeners: Set<(status: NetworkStatus) => void> = new Set();
  private meshListeners: Set<(info: MeshNetworkInfo) => void> = new Set();
  private currentStatus: NetworkStatus | null = null;
  private meshInfo: MeshNetworkInfo | null = null;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Listen for online/offline events
    window.addEventListener('online', () => this.updateStatus());
    window.addEventListener('offline', () => this.updateStatus());

    // Listen for connection changes (Network Information API)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      if (connection) {
        connection.addEventListener('change', () => this.updateStatus());
      }
    }

    // Initial status check
    this.updateStatus();

    // Start periodic mesh network detection (every 5 seconds)
    this.checkInterval = setInterval(() => {
      this.detectMeshNetwork();
    }, 5000);
  }

  private async updateStatus() {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    const status: NetworkStatus = {
      isConnected: navigator.onLine,
      isMeshNetwork: false,
      connectionType: this.getConnectionType(connection),
      effectiveType: connection?.effectiveType || 'unknown',
      downlink: connection?.downlink || 0,
      rtt: connection?.rtt || 0,
      saveData: connection?.saveData || false,
      timestamp: Date.now(),
    };

    // Check if this is a mesh network connection
    const meshInfo = await this.detectMeshNetwork();
    if (meshInfo.available) {
      status.isMeshNetwork = true;
      status.connectionType = 'mesh';
    }

    this.currentStatus = status;
    this.notifyListeners(status);
  }

  private getConnectionType(connection: any): NetworkStatus['connectionType'] {
    if (!navigator.onLine) return 'offline';
    if (!connection) return 'unknown';

    const type = connection.type || connection.effectiveType;
    if (type?.includes('wifi')) return 'wifi';
    if (type?.includes('cellular') || type?.includes('4g') || type?.includes('3g')) return 'cellular';
    
    return 'unknown';
  }

  private async detectMeshNetwork(): Promise<MeshNetworkInfo> {
    try {
      // Check for Helium mesh network indicators
      // This simulates checking for mesh network availability
      // In production, this would query the Helium network API
      
      const meshInfo: MeshNetworkInfo = {
        available: false,
        signalStrength: 0,
        latency: 0,
        bandwidth: 0,
        connectedHotspots: 0,
        nearbyHotspots: [],
      };

      // Check if we can reach mesh network endpoints
      if (navigator.onLine) {
        try {
          const startTime = performance.now();
          const response = await fetch('/api/trpc/mesh.checkAvailability', {
            method: 'GET',
            signal: AbortSignal.timeout(3000), // 3 second timeout
          });
          const endTime = performance.now();

          if (response.ok) {
            const data = await response.json();
            meshInfo.available = true;
            meshInfo.latency = Math.round(endTime - startTime);
            meshInfo.signalStrength = this.calculateSignalStrength(meshInfo.latency);
            meshInfo.connectedHotspots = data.result?.data?.connectedHotspots || 0;
            meshInfo.nearbyHotspots = data.result?.data?.nearbyHotspots || [];
            
            // Estimate bandwidth based on latency
            meshInfo.bandwidth = this.estimateBandwidth(meshInfo.latency);
          }
        } catch (error) {
          // Mesh network not available
          meshInfo.available = false;
        }
      }

      this.meshInfo = meshInfo;
      this.notifyMeshListeners(meshInfo);
      return meshInfo;
    } catch (error) {
      console.error('[NetworkDetection] Error detecting mesh network:', error);
      const fallbackInfo: MeshNetworkInfo = {
        available: false,
        signalStrength: 0,
        latency: 0,
        bandwidth: 0,
        connectedHotspots: 0,
        nearbyHotspots: [],
      };
      this.meshInfo = fallbackInfo;
      return fallbackInfo;
    }
  }

  private calculateSignalStrength(latency: number): number {
    // Convert latency to signal strength (0-100)
    // Lower latency = stronger signal
    if (latency < 50) return 100;
    if (latency < 100) return 80;
    if (latency < 200) return 60;
    if (latency < 500) return 40;
    if (latency < 1000) return 20;
    return 10;
  }

  private estimateBandwidth(latency: number): number {
    // Estimate bandwidth in Mbps based on latency
    // This is a rough estimation for LoRaWAN networks
    if (latency < 100) return 5.0;
    if (latency < 200) return 2.5;
    if (latency < 500) return 1.0;
    if (latency < 1000) return 0.5;
    return 0.1;
  }

  private notifyListeners(status: NetworkStatus) {
    this.listeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('[NetworkDetection] Error in listener:', error);
      }
    });
  }

  private notifyMeshListeners(info: MeshNetworkInfo) {
    this.meshListeners.forEach(listener => {
      try {
        listener(info);
      } catch (error) {
        console.error('[NetworkDetection] Error in mesh listener:', error);
      }
    });
  }

  public subscribe(listener: (status: NetworkStatus) => void): () => void {
    this.listeners.add(listener);
    
    // Immediately notify with current status
    if (this.currentStatus) {
      listener(this.currentStatus);
    }

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  public subscribeMesh(listener: (info: MeshNetworkInfo) => void): () => void {
    this.meshListeners.add(listener);
    
    // Immediately notify with current mesh info
    if (this.meshInfo) {
      listener(this.meshInfo);
    }

    // Return unsubscribe function
    return () => {
      this.meshListeners.delete(listener);
    };
  }

  public getCurrentStatus(): NetworkStatus | null {
    return this.currentStatus;
  }

  public getMeshInfo(): MeshNetworkInfo | null {
    return this.meshInfo;
  }

  public async forceCheck(): Promise<void> {
    await this.updateStatus();
    await this.detectMeshNetwork();
  }

  public destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.listeners.clear();
    this.meshListeners.clear();
  }
}

// Singleton instance
export const networkDetection = new NetworkDetectionService();
