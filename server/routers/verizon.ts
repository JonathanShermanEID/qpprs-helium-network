import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { verizonAPIManager } from "../_core/verizonAPIManagerLLM";

export const verizonRouter = router({
  /**
   * Get Verizon API credentials status
   */
  getCredentialsStatus: protectedProcedure.query(async () => {
    return verizonAPIManager.getCredentialsStatus();
  }),

  /**
   * Detect network restrictions on device
   */
  detectRestrictions: protectedProcedure
    .input(
      z.object({
        deviceId: z.string().default("iPhoneXR"),
      })
    )
    .query(async ({ input }) => {
      return await verizonAPIManager.detectRestrictions(input.deviceId);
    }),

  /**
   * Remove network restrictions from device
   */
  removeRestrictions: protectedProcedure
    .input(
      z.object({
        deviceId: z.string().default("iPhoneXR"),
      })
    )
    .mutation(async ({ input }) => {
      return await verizonAPIManager.removeRestrictions(input.deviceId);
    }),
});
