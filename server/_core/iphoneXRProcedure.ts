/**
 * iPhone XR-Only Procedure
 * Author: Jonathan Sherman - Monaco Edition
 * 
 * tRPC procedure wrapper that enforces iPhone XR-only write access
 */

import { publicProcedure } from "./trpc";
import { enforceIPhoneXROnly } from "./iphoneXRMiddleware";

/**
 * Procedure that only allows iPhone XR devices to execute
 * All other devices will receive PRODUCTION HALT error
 */
export const iphoneXROnlyProcedure = publicProcedure.use(({ ctx, next }) => {
  // Enforce iPhone XR-only access
  enforceIPhoneXROnly(ctx.req);
  
  return next({ ctx });
});
