/**
 * File Deletion Approval System
 * Requires iPhone XR owner approval for ANY file deletion
 * 
 * ABSOLUTE REQUIREMENT: No files can be deleted without explicit approval
 * ENFORCEMENT: Production halt on any challenge or bypass attempt
 * 
 * Author: Jonathan Sherman - Monaco Edition
 * Proprietary Technology - Q++RS Universal
 * © 2025 All Rights Reserved
 */

import { notifyOwner } from "./notification";

export interface DeletionRequest {
  id: string;
  timestamp: Date;
  requestedBy: string;
  filePath: string;
  fileSize: number;
  reason: string;
  status: "pending" | "approved" | "denied" | "expired";
  approvedAt?: Date;
  deniedAt?: Date;
}

class FileDeletionApprovalSystem {
  private pendingRequests: Map<string, DeletionRequest> = new Map();
  private approvalHistory: DeletionRequest[] = [];
  private productionHalted: boolean = false;

  /**
   * Request approval to delete a file
   * MUST be called before ANY file deletion
   */
  async requestDeletion(
    requestedBy: string,
    filePath: string,
    fileSize: number,
    reason: string
  ): Promise<string> {
    console.log(`[File Deletion Approval] Request received: ${filePath}`);
    
    // Check if production is halted
    if (this.productionHalted) {
      throw new Error("PRODUCTION HALTED: File deletion approval system violated");
    }

    // Create deletion request
    const requestId = `del_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const request: DeletionRequest = {
      id: requestId,
      timestamp: new Date(),
      requestedBy,
      filePath,
      fileSize,
      reason,
      status: "pending",
    };

    this.pendingRequests.set(requestId, request);

    // Notify owner for approval
    await notifyOwner({
      title: "🚨 File Deletion Approval Required",
      content: `
**Deletion Request ID:** ${requestId}
**File:** ${filePath}
**Size:** ${(fileSize / 1024).toFixed(2)} KB
**Requested By:** ${requestedBy}
**Reason:** ${reason}
**Time:** ${request.timestamp.toISOString()}

**ACTION REQUIRED:** Approve or deny this deletion request on your iPhone XR within 5 minutes.
      `.trim(),
    });

    // Set auto-deny timeout (5 minutes)
    setTimeout(() => {
      this.autoExpireRequest(requestId);
    }, 5 * 60 * 1000);

    console.log(`[File Deletion Approval] Request ${requestId} created and notification sent`);
    return requestId;
  }

  /**
   * Approve a deletion request (iPhone XR only)
   */
  async approveDeletion(requestId: string, approvedBy: string): Promise<boolean> {
    const request = this.pendingRequests.get(requestId);
    
    if (!request) {
      console.error(`[File Deletion Approval] Request ${requestId} not found`);
      return false;
    }

    if (request.status !== "pending") {
      console.error(`[File Deletion Approval] Request ${requestId} is not pending (status: ${request.status})`);
      return false;
    }

    // Update request
    request.status = "approved";
    request.approvedAt = new Date();
    
    this.pendingRequests.delete(requestId);
    this.approvalHistory.push(request);

    console.log(`[File Deletion Approval] Request ${requestId} APPROVED by ${approvedBy}`);
    
    await notifyOwner({
      title: "✅ File Deletion Approved",
      content: `Request ${requestId} for ${request.filePath} has been approved.`,
    });

    return true;
  }

  /**
   * Deny a deletion request (iPhone XR only)
   */
  async denyDeletion(requestId: string, deniedBy: string, denialReason?: string): Promise<boolean> {
    const request = this.pendingRequests.get(requestId);
    
    if (!request) {
      console.error(`[File Deletion Approval] Request ${requestId} not found`);
      return false;
    }

    if (request.status !== "pending") {
      console.error(`[File Deletion Approval] Request ${requestId} is not pending`);
      return false;
    }

    // Update request
    request.status = "denied";
    request.deniedAt = new Date();
    
    this.pendingRequests.delete(requestId);
    this.approvalHistory.push(request);

    console.log(`[File Deletion Approval] Request ${requestId} DENIED by ${deniedBy}`);
    
    await notifyOwner({
      title: "❌ File Deletion Denied",
      content: `Request ${requestId} for ${request.filePath} has been denied. ${denialReason || ""}`,
    });

    return true;
  }

  /**
   * Auto-expire request after timeout
   */
  private async autoExpireRequest(requestId: string) {
    const request = this.pendingRequests.get(requestId);
    
    if (!request || request.status !== "pending") {
      return;
    }

    request.status = "expired";
    this.pendingRequests.delete(requestId);
    this.approvalHistory.push(request);

    console.log(`[File Deletion Approval] Request ${requestId} EXPIRED (no response within 5 minutes)`);
    
    await notifyOwner({
      title: "⏱️ File Deletion Request Expired",
      content: `Request ${requestId} for ${request.filePath} expired due to no response.`,
    });
  }

  /**
   * Check if deletion is approved
   */
  isDeletionApproved(requestId: string): boolean {
    const request = this.approvalHistory.find(r => r.id === requestId && r.status === "approved");
    return !!request;
  }

  /**
   * Get pending requests
   */
  getPendingRequests(): DeletionRequest[] {
    return Array.from(this.pendingRequests.values());
  }

  /**
   * Get approval history
   */
  getApprovalHistory(): DeletionRequest[] {
    return [...this.approvalHistory];
  }

  /**
   * HALT PRODUCTION - triggered on violation
   */
  async haltProduction(reason: string) {
    console.error(`[File Deletion Approval] 🚨 PRODUCTION HALT TRIGGERED: ${reason}`);
    
    this.productionHalted = true;

    await notifyOwner({
      title: "🚨 PRODUCTION HALT - SECURITY VIOLATION",
      content: `
**IMMEDIATE ACTION REQUIRED**

Production has been HALTED due to file deletion approval violation.

**Reason:** ${reason}
**Time:** ${new Date().toISOString()}

**Violation Details:**
- Unauthorized file deletion attempt detected
- File deletion approval system bypassed or challenged
- Zero tolerance policy enforced

**System Status:** ALL OPERATIONS SUSPENDED

Contact system administrator immediately.
      `.trim(),
    });

    // Log violation
    console.error("[File Deletion Approval] Production halted. All operations suspended.");
    
    // In a real system, this would shut down services
    // For now, we set the flag and block all operations
  }

  /**
   * Detect bypass attempt and halt production
   */
  detectBypassAttempt(details: string) {
    console.error(`[File Deletion Approval] BYPASS ATTEMPT DETECTED: ${details}`);
    this.haltProduction(`Bypass attempt: ${details}`);
  }

  /**
   * Detect challenge attempt and halt production
   */
  detectChallengeAttempt(details: string) {
    console.error(`[File Deletion Approval] CHALLENGE ATTEMPT DETECTED: ${details}`);
    this.haltProduction(`Challenge to file deletion approval requirement: ${details}`);
  }

  /**
   * Check if production is halted
   */
  isProductionHalted(): boolean {
    return this.productionHalted;
  }
}

// Singleton instance
let approvalSystem: FileDeletionApprovalSystem | null = null;

export function getFileDeletionApprovalSystem(): FileDeletionApprovalSystem {
  if (!approvalSystem) {
    approvalSystem = new FileDeletionApprovalSystem();
    console.log("[File Deletion Approval] System initialized");
  }
  return approvalSystem;
}

/**
 * Wrapper function to enforce approval before deletion
 * MUST be used for ALL file deletions
 */
export async function deleteFileWithApproval(
  filePath: string,
  requestedBy: string,
  reason: string
): Promise<{ success: boolean; requestId?: string; error?: string }> {
  const system = getFileDeletionApprovalSystem();

  // Check if production is halted
  if (system.isProductionHalted()) {
    return {
      success: false,
      error: "PRODUCTION HALTED: Cannot process deletion requests",
    };
  }

  try {
    // Get file size
    const fs = await import("fs/promises");
    const stats = await fs.stat(filePath);
    
    // Request approval
    const requestId = await system.requestDeletion(
      requestedBy,
      filePath,
      stats.size,
      reason
    );

    return {
      success: true,
      requestId,
    };

  } catch (error) {
    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * Execute approved deletion
 * ONLY call this after approval is confirmed
 */
export async function executeApprovedDeletion(
  requestId: string,
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  const system = getFileDeletionApprovalSystem();

  // Verify approval
  if (!system.isDeletionApproved(requestId)) {
    system.detectBypassAttempt(`Attempted to delete ${filePath} without approval (request: ${requestId})`);
    return {
      success: false,
      error: "PRODUCTION HALTED: Deletion not approved",
    };
  }

  try {
    const fs = await import("fs/promises");
    await fs.unlink(filePath);
    
    console.log(`[File Deletion Approval] File deleted: ${filePath} (approved request: ${requestId})`);
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: String(error),
    };
  }
}
