/**
 * Rewards to Manus Tasks Service
 * Sends rewards data directly to owner's Manus account as tasks
 * Author: Jonathan Sherman
 */

import { notifyOwner } from "./_core/notification";
import { getOwnerRewards, getOwnerRewardsBalance } from "./db";
import { ENV } from "./_core/env";

export async function sendRewardsToOwnerTasks() {
  try {
    // Get owner's rewards balance
    const balance = await getOwnerRewardsBalance(ENV.ownerOpenId);
    
    // Get recent transactions
    const transactions = await getOwnerRewards(ENV.ownerOpenId);
    const recentTransactions = transactions.slice(0, 10);
    
    // Format rewards summary
    const summary = `
🏦 **Helium Rewards Bank Summary**

**Balance:**
- Total: ${balance.total} HNT
- Completed: ${balance.completed} HNT
- Pending: ${balance.pending} HNT

**Recent Transactions (${recentTransactions.length}):**
${recentTransactions.map(tx => 
  `- ${tx.transactionType.toUpperCase()}: ${tx.amount} ${tx.currency} (${tx.status})`
).join('\n')}

_Last updated: ${new Date().toLocaleString()}_
    `.trim();
    
    // Send to owner's Manus tasks
    const success = await notifyOwner({
      title: "💰 Helium Rewards Update",
      content: summary,
    });
    
    return success;
  } catch (error) {
    console.error("[Rewards Task Service] Error:", error);
    return false;
  }
}

// Export function to be called by cron or webhook
export async function scheduleRewardsTask() {
  console.log("[Rewards Task Service] Sending rewards to owner tasks...");
  const result = await sendRewardsToOwnerTasks();
  console.log(`[Rewards Task Service] ${result ? "Success" : "Failed"}`);
  return result;
}
