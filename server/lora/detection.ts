/**
 * LoRa Detection and Power Management
 * Helium Network LoRaWAN Integration
 * Author: Jonathan Sherman
 * Monaco Edition 🏎️
 */

export interface LoRaSignal {
  frequency: number; // MHz
  rssi: number; // Received Signal Strength Indicator (dBm)
  snr: number; // Signal-to-Noise Ratio (dB)
  spreadingFactor: number; // 7-12
  bandwidth: number; // kHz
  codingRate: string; // e.g., "4/5"
  timestamp: Date;
}

export interface LoRaDevice {
  id: string;
  name: string;
  devEUI: string; // Device EUI
  appEUI: string; // Application EUI
  frequency: number;
  power: number; // TX power in dBm
  enabled: boolean;
  lastSeen: Date;
  batteryLevel?: number; // 0-100%
  gps?: {
    latitude: number;
    longitude: number;
    altitude?: number;
    accuracy?: number;
  };
  location?: string;
}

export interface LoRaPowerState {
  enabled: boolean;
  powerLevel: number; // 0-20 dBm
  lowPowerMode: boolean;
  batteryLevel: number;
  estimatedRuntime: number; // hours
}

/**
 * LoRa Detection Service
 * Monitors LoRa signals and manages power
 */
export class LoRaDetectionService {
  private devices: Map<string, LoRaDevice> = new Map();
  private signals: LoRaSignal[] = [];
  private powerState: LoRaPowerState = {
    enabled: true,
    powerLevel: 14, // Default 14 dBm
    lowPowerMode: false,
    batteryLevel: 100,
    estimatedRuntime: 72, // 72 hours default
  };
  private isScanning = false;

  constructor() {
    this.initializeDefaultDevices();
  }

  /**
   * Initialize with default Helium hotspot devices
   */
  private initializeDefaultDevices(): void {
    const defaultDevice: LoRaDevice = {
      id: 'helium-gateway-1',
      name: 'Helium Gateway Primary',
      devEUI: '0000000000000001',
      appEUI: 'HELIUM0000000001',
      frequency: 915.0, // US915 band
      power: 14,
      enabled: true,
      lastSeen: new Date(),
      batteryLevel: 100,
      gps: {
        latitude: 37.7749,
        longitude: -122.4194,
        altitude: 50,
        accuracy: 10,
      },
      location: 'San Francisco, CA',
    };

    this.devices.set(defaultDevice.id, defaultDevice);
  }

  /**
   * Start LoRa signal scanning
   */
  async startScanning(): Promise<void> {
    if (this.isScanning) return;

    this.isScanning = true;
    console.log('[LoRa] 📡 Starting signal detection...');

    // Simulate continuous scanning
    setInterval(() => {
      if (!this.isScanning || !this.powerState.enabled) return;

      // Simulate signal detection from nearby hotspots
      const signal = this.simulateSignalDetection();
      this.signals.push(signal);

      // Keep last 1000 signals
      if (this.signals.length > 1000) {
        this.signals.shift();
      }

      // Update battery level (simulate drain)
      if (this.powerState.batteryLevel > 0) {
        const drainRate = this.powerState.lowPowerMode ? 0.01 : 0.02;
        this.powerState.batteryLevel = Math.max(0, this.powerState.batteryLevel - drainRate);
        this.powerState.estimatedRuntime = (this.powerState.batteryLevel / drainRate) / 60;
      }
    }, 5000); // Scan every 5 seconds
  }

  /**
   * Stop LoRa scanning
   */
  stopScanning(): void {
    this.isScanning = false;
    console.log('[LoRa] ⏸️ Signal detection stopped');
  }

  /**
   * Simulate LoRa signal detection
   */
  private simulateSignalDetection(): LoRaSignal {
    // Simulate realistic LoRa signal parameters
    const frequencies = [903.9, 905.3, 906.7, 915.0, 923.3]; // US915 channels
    const spreadingFactors = [7, 8, 9, 10, 11, 12];

    return {
      frequency: frequencies[Math.floor(Math.random() * frequencies.length)],
      rssi: -120 + Math.random() * 80, // -120 to -40 dBm
      snr: -20 + Math.random() * 30, // -20 to +10 dB
      spreadingFactor: spreadingFactors[Math.floor(Math.random() * spreadingFactors.length)],
      bandwidth: 125, // 125 kHz standard
      codingRate: '4/5',
      timestamp: new Date(),
    };
  }

  /**
   * Power on LoRa device
   */
  async powerOn(): Promise<boolean> {
    console.log('[LoRa] ⚡ Powering on...');
    this.powerState.enabled = true;

    // Start scanning when powered on
    if (!this.isScanning) {
      await this.startScanning();
    }

    return true;
  }

  /**
   * Power off LoRa device
   */
  async powerOff(): Promise<boolean> {
    console.log('[LoRa] 🔌 Powering off...');
    this.powerState.enabled = false;
    this.stopScanning();
    return true;
  }

  /**
   * Set power level (0-20 dBm)
   */
  setPowerLevel(level: number): boolean {
    if (level < 0 || level > 20) {
      console.error('[LoRa] Invalid power level. Must be 0-20 dBm');
      return false;
    }

    this.powerState.powerLevel = level;
    console.log(`[LoRa] Power level set to ${level} dBm`);
    return true;
  }

  /**
   * Enable/disable low power mode
   */
  setLowPowerMode(enabled: boolean): void {
    this.powerState.lowPowerMode = enabled;
    console.log(`[LoRa] Low power mode: ${enabled ? 'ON' : 'OFF'}`);
  }

  /**
   * Get current power state
   */
  getPowerState(): LoRaPowerState {
    return { ...this.powerState };
  }

  /**
   * Get detected signals
   */
  getSignals(limit: number = 100): LoRaSignal[] {
    return this.signals.slice(-limit);
  }

  /**
   * Get signal statistics
   */
  getSignalStats() {
    if (this.signals.length === 0) {
      return {
        count: 0,
        averageRSSI: 0,
        averageSNR: 0,
        strongestSignal: null,
        weakestSignal: null,
      };
    }

    const rssiValues = this.signals.map(s => s.rssi);
    const snrValues = this.signals.map(s => s.snr);

    return {
      count: this.signals.length,
      averageRSSI: rssiValues.reduce((a, b) => a + b, 0) / rssiValues.length,
      averageSNR: snrValues.reduce((a, b) => a + b, 0) / snrValues.length,
      strongestSignal: Math.max(...rssiValues),
      weakestSignal: Math.min(...rssiValues),
    };
  }

  /**
   * Get all registered devices
   */
  getDevices(): LoRaDevice[] {
    return Array.from(this.devices.values());
  }

  /**
   * Add new LoRa device
   */
  addDevice(device: Omit<LoRaDevice, 'lastSeen'>): void {
    this.devices.set(device.id, {
      ...device,
      lastSeen: new Date(),
    });
    console.log(`[LoRa] Device added: ${device.name}`);
  }

  /**
   * Remove device
   */
  removeDevice(id: string): boolean {
    const removed = this.devices.delete(id);
    if (removed) {
      console.log(`[LoRa] Device removed: ${id}`);
    }
    return removed;
  }

  /**
   * Get scanning status
   */
  isActive(): boolean {
    return this.isScanning && this.powerState.enabled;
  }
}

// Global LoRa detection service
export const loraService = new LoRaDetectionService();
