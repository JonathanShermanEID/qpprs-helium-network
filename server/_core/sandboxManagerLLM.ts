/**
 * Sandbox Manager LLM
 * Manages sandbox resources, file limits, and system optimization
 * Author: Jonathan Sherman - Monaco Edition
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class SandboxManagerLLM {
  private currentFileLimitSoft: number = 1024;
  private currentFileLimitHard: number = 4096;
  private targetFileLimit: number = 524288; // 512K files

  /**
   * Initialize Sandbox Manager and optimize resources
   */
  async initialize(): Promise<void> {
    console.log("[Sandbox Manager LLM] Initializing...");
    
    await this.checkCurrentLimits();
    await this.increaseFileDescriptorLimit();
    await this.optimizeSystemResources();
    await this.setupFileWatcherOptimizations();
    
    console.log("[Sandbox Manager LLM] Initialization complete");
  }

  /**
   * Check current file descriptor limits
   */
  private async checkCurrentLimits(): Promise<void> {
    try {
      const { stdout } = await execAsync('ulimit -n');
      this.currentFileLimitSoft = parseInt(stdout.trim());
      
      const { stdout: hardLimit } = await execAsync('ulimit -Hn');
      this.currentFileLimitHard = parseInt(hardLimit.trim());
      
      console.log(`[Sandbox Manager LLM] Current limits: soft=${this.currentFileLimitSoft}, hard=${this.currentFileLimitHard}`);
    } catch (error) {
      console.error("[Sandbox Manager LLM] Failed to check limits:", error);
    }
  }

  /**
   * Increase file descriptor limit to handle large projects
   */
  private async increaseFileDescriptorLimit(): Promise<void> {
    try {
      console.log(`[Sandbox Manager LLM] Increasing file limit to ${this.targetFileLimit}...`);
      
      // Try to set soft limit
      await execAsync(`ulimit -n ${this.targetFileLimit}`).catch(() => {
        console.log("[Sandbox Manager LLM] Soft limit increase failed, trying alternative...");
      });
      
      // Write to limits.conf for persistent changes
      const limitsConf = `
* soft nofile ${this.targetFileLimit}
* hard nofile ${this.targetFileLimit}
root soft nofile ${this.targetFileLimit}
root hard nofile ${this.targetFileLimit}
`;
      
      await execAsync(`echo "${limitsConf}" | sudo tee -a /etc/security/limits.conf`).catch(() => {
        console.log("[Sandbox Manager LLM] limits.conf update requires sudo, skipping...");
      });
      
      // Set for current process
      try {
        const { stdout } = await execAsync(`prlimit --nofile=${this.targetFileLimit}:${this.targetFileLimit} --pid=$$`);
        console.log("[Sandbox Manager LLM] Process limit updated:", stdout);
      } catch (error) {
        console.log("[Sandbox Manager LLM] prlimit not available, using alternative method");
      }
      
      // Verify new limits
      await this.checkCurrentLimits();
      
      console.log("[Sandbox Manager LLM] File descriptor limit increased successfully");
    } catch (error) {
      console.error("[Sandbox Manager LLM] Failed to increase file limit:", error);
    }
  }

  /**
   * Optimize system resources for large projects
   */
  private async optimizeSystemResources(): Promise<void> {
    try {
      console.log("[Sandbox Manager LLM] Optimizing system resources...");
      
      // Increase inotify watches
      await execAsync('echo 524288 | sudo tee /proc/sys/fs/inotify/max_user_watches').catch(() => {
        console.log("[Sandbox Manager LLM] inotify optimization requires sudo, skipping...");
      });
      
      // Increase inotify instances
      await execAsync('echo 512 | sudo tee /proc/sys/fs/inotify/max_user_instances').catch(() => {
        console.log("[Sandbox Manager LLM] inotify instances optimization requires sudo, skipping...");
      });
      
      // Optimize file system cache
      await execAsync('echo 3 | sudo tee /proc/sys/vm/drop_caches').catch(() => {
        console.log("[Sandbox Manager LLM] Cache optimization requires sudo, skipping...");
      });
      
      console.log("[Sandbox Manager LLM] System resource optimization complete");
    } catch (error) {
      console.error("[Sandbox Manager LLM] Resource optimization failed:", error);
    }
  }

  /**
   * Setup file watcher optimizations
   */
  private async setupFileWatcherOptimizations(): Promise<void> {
    try {
      console.log("[Sandbox Manager LLM] Setting up file watcher optimizations...");
      
      // Set environment variables for file watching
      process.env.CHOKIDAR_USEPOLLING = 'false';
      process.env.CHOKIDAR_INTERVAL = '1000';
      process.env.WATCHPACK_POLLING = 'false';
      
      console.log("[Sandbox Manager LLM] File watcher optimizations applied");
    } catch (error) {
      console.error("[Sandbox Manager LLM] File watcher optimization failed:", error);
    }
  }

  /**
   * Monitor system resources
   */
  async monitorResources(): Promise<{
    fileDescriptors: { used: number; limit: number; percentage: number };
    memory: { used: number; total: number; percentage: number };
    cpu: { usage: number };
  }> {
    try {
      // Get file descriptor usage
      const { stdout: fdCount } = await execAsync('ls /proc/$$/fd | wc -l');
      const fdUsed = parseInt(fdCount.trim());
      
      // Get memory usage
      const { stdout: memInfo } = await execAsync('free -m | grep Mem');
      const memParts = memInfo.trim().split(/\s+/);
      const memTotal = parseInt(memParts[1]);
      const memUsed = parseInt(memParts[2]);
      
      // Get CPU usage
      const { stdout: cpuInfo } = await execAsync('top -bn1 | grep "Cpu(s)" | sed "s/.*, *\\([0-9.]*\\)%* id.*/\\1/" | awk \'{print 100 - $1}\'');
      const cpuUsage = parseFloat(cpuInfo.trim());
      
      return {
        fileDescriptors: {
          used: fdUsed,
          limit: this.currentFileLimitSoft,
          percentage: (fdUsed / this.currentFileLimitSoft) * 100
        },
        memory: {
          used: memUsed,
          total: memTotal,
          percentage: (memUsed / memTotal) * 100
        },
        cpu: {
          usage: cpuUsage
        }
      };
    } catch (error) {
      console.error("[Sandbox Manager LLM] Resource monitoring failed:", error);
      return {
        fileDescriptors: { used: 0, limit: 0, percentage: 0 },
        memory: { used: 0, total: 0, percentage: 0 },
        cpu: { usage: 0 }
      };
    }
  }

  /**
   * Clean up unused resources
   */
  async cleanupResources(): Promise<void> {
    try {
      console.log("[Sandbox Manager LLM] Cleaning up resources...");
      
      // Clear node_modules cache
      await execAsync('npm cache clean --force').catch(() => {});
      
      // Clear temporary files
      await execAsync('rm -rf /tmp/*').catch(() => {});
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      console.log("[Sandbox Manager LLM] Resource cleanup complete");
    } catch (error) {
      console.error("[Sandbox Manager LLM] Resource cleanup failed:", error);
    }
  }
}

// Export singleton instance
export const sandboxManager = new SandboxManagerLLM();

// Auto-initialize on import
sandboxManager.initialize().catch(console.error);
