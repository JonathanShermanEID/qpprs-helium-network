/**
 * LoRa Detection and Power Management Router
 * Author: Jonathan Sherman
 * Monaco Edition 🏎️
 */

import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { loraService } from '../lora/detection';

export const loraRouter = router({
  /**
   * Get power state
   */
  getPowerState: publicProcedure.query(() => {
    return loraService.getPowerState();
  }),

  /**
   * Power on LoRa device
   */
  powerOn: publicProcedure.mutation(async () => {
    const success = await loraService.powerOn();
    return {
      success,
      message: success ? 'LoRa powered on' : 'Failed to power on',
      state: loraService.getPowerState(),
    };
  }),

  /**
   * Power off LoRa device
   */
  powerOff: publicProcedure.mutation(async () => {
    const success = await loraService.powerOff();
    return {
      success,
      message: success ? 'LoRa powered off' : 'Failed to power off',
      state: loraService.getPowerState(),
    };
  }),

  /**
   * Set power level
   */
  setPowerLevel: publicProcedure
    .input(z.object({ level: z.number().min(0).max(20) }))
    .mutation(({ input }) => {
      const success = loraService.setPowerLevel(input.level);
      return {
        success,
        message: success ? `Power level set to ${input.level} dBm` : 'Invalid power level',
        state: loraService.getPowerState(),
      };
    }),

  /**
   * Set low power mode
   */
  setLowPowerMode: publicProcedure
    .input(z.object({ enabled: z.boolean() }))
    .mutation(({ input }) => {
      loraService.setLowPowerMode(input.enabled);
      return {
        success: true,
        message: `Low power mode ${input.enabled ? 'enabled' : 'disabled'}`,
        state: loraService.getPowerState(),
      };
    }),

  /**
   * Start signal scanning
   */
  startScanning: publicProcedure.mutation(async () => {
    await loraService.startScanning();
    return {
      success: true,
      message: 'LoRa signal scanning started',
      isActive: loraService.isActive(),
    };
  }),

  /**
   * Stop signal scanning
   */
  stopScanning: publicProcedure.mutation(() => {
    loraService.stopScanning();
    return {
      success: true,
      message: 'LoRa signal scanning stopped',
      isActive: loraService.isActive(),
    };
  }),

  /**
   * Get detected signals
   */
  getSignals: publicProcedure
    .input(z.object({ limit: z.number().optional().default(100) }))
    .query(({ input }) => {
      return loraService.getSignals(input.limit);
    }),

  /**
   * Get signal statistics
   */
  getSignalStats: publicProcedure.query(() => {
    return loraService.getSignalStats();
  }),

  /**
   * Get all devices
   */
  getDevices: publicProcedure.query(() => {
    return loraService.getDevices();
  }),

  /**
   * Get scanning status
   */
  getStatus: publicProcedure.query(() => {
    return {
      isActive: loraService.isActive(),
      powerState: loraService.getPowerState(),
      signalStats: loraService.getSignalStats(),
      deviceCount: loraService.getDevices().length,
    };
  }),
});
