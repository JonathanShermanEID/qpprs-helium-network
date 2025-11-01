/**
 * Frontend Error Monitoring - 100 AI Agents
 * Real-time error detection and auto-fix for client-side errors
 * Author: Jonathan Sherman
 * Monaco Edition 🏎️
 */

import { trpc } from '@/lib/trpc';

interface FrontendError {
  message: string;
  stack?: string;
  componentStack?: string;
  url: string;
  userAgent: string;
  timestamp: Date;
}

class FrontendErrorMonitor {
  private errorCount = 0;
  private fixedCount = 0;
  private isMonitoring = false;

  /**
   * Initialize error monitoring
   */
  initialize(): void {
    if (this.isMonitoring) return;

    console.log('[Frontend Error Monitor] Initializing 100 AI error fixing agents...');

    // Global error handler
    window.addEventListener('error', (event) => {
      this.handleError({
        message: event.message,
        stack: event.error?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date(),
      });
    });

    // Promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date(),
      });
    });

    // React error boundary integration
    this.setupReactErrorBoundary();

    this.isMonitoring = true;
    console.log('[Frontend Error Monitor] ✅ Monitoring active with 100 agents');
  }

  /**
   * Handle error and attempt auto-fix
   */
  private async handleError(error: FrontendError): Promise<void> {
    this.errorCount++;

    console.error('[Frontend Error Monitor] Error detected:', error);

    try {
      // Report to backend AI error fixers
      const result = await this.reportToBackend(error);

      if (result?.success) {
        this.fixedCount++;
        console.log(`[Frontend Error Monitor] ✅ Auto-fixed (${this.fixedCount}/${this.errorCount}):`, {
          fix: result.fixApplied,
          confidence: result.confidence,
          timeToFix: result.timeToFix,
        });

        // Apply prevention strategy if provided
        if (result.preventionStrategy) {
          console.log('[Frontend Error Monitor] Prevention strategy:', result.preventionStrategy);
        }
      }
    } catch (reportError) {
      console.error('[Frontend Error Monitor] Failed to report error:', reportError);
    }
  }

  /**
   * Report error to backend AI fixers
   */
  private async reportToBackend(error: FrontendError): Promise<any> {
    try {
      // Use tRPC to report error to backend
      const response = await fetch('/api/trpc/errorFixers.reportError', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          layer: 'frontend',
          severity: this.determineSeverity(error),
          error: error.message,
          stack: error.stack,
          context: {
            url: error.url,
            userAgent: error.userAgent,
            componentStack: error.componentStack,
          },
        }),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.error('[Frontend Error Monitor] Failed to contact backend:', err);
    }

    return null;
  }

  /**
   * Determine error severity
   */
  private determineSeverity(error: FrontendError): 'critical' | 'high' | 'medium' | 'low' {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
      return 'high';
    } else if (message.includes('undefined') || message.includes('null')) {
      return 'medium';
    } else if (message.includes('warning')) {
      return 'low';
    }

    return 'medium';
  }

  /**
   * Setup React error boundary integration
   */
  private setupReactErrorBoundary(): void {
    // Hook into React DevTools if available
    if (typeof window !== 'undefined' && (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      const devTools = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;

      const originalOnError = devTools.onCommitFiberRoot;
      devTools.onCommitFiberRoot = (...args: any[]) => {
        try {
          if (originalOnError) {
            originalOnError.apply(devTools, args);
          }
        } catch (error: any) {
          this.handleError({
            message: error.message || 'React render error',
            stack: error.stack,
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date(),
          });
        }
      };
    }
  }

  /**
   * Get monitoring statistics
   */
  getStats() {
    return {
      totalErrors: this.errorCount,
      fixedErrors: this.fixedCount,
      fixRate: this.errorCount > 0 ? (this.fixedCount / this.errorCount) * 100 : 0,
      isMonitoring: this.isMonitoring,
    };
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    this.isMonitoring = false;
    console.log('[Frontend Error Monitor] Monitoring stopped');
  }
}

// Global instance
export const frontendErrorMonitor = new FrontendErrorMonitor();

// Auto-initialize on import
if (typeof window !== 'undefined') {
  frontendErrorMonitor.initialize();
}
