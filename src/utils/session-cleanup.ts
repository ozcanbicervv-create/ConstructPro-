import { SessionManager } from '@/middleware/auth.middleware';

/**
 * Session cleanup utility for automatic session management
 */
export class SessionCleanup {
  private static cleanupInterval: NodeJS.Timeout | null = null;
  private static readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

  /**
   * Start automatic session cleanup
   */
  static startCleanup(): void {
    if (this.cleanupInterval) {
      return; // Already running
    }

    console.log('Starting session cleanup service...');

    this.cleanupInterval = setInterval(async () => {
      try {
        await SessionManager.cleanupInactiveSessions();
        console.log('Session cleanup completed');
      } catch (error) {
        console.error('Session cleanup failed:', error);
      }
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * Stop automatic session cleanup
   */
  static stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('Session cleanup service stopped');
    }
  }

  /**
   * Run cleanup once
   */
  static async runCleanup(): Promise<void> {
    try {
      await SessionManager.cleanupInactiveSessions();
      console.log('Manual session cleanup completed');
    } catch (error) {
      console.error('Manual session cleanup failed:', error);
      throw error;
    }
  }
}

// Auto-start cleanup in production
if (process.env.NODE_ENV === 'production') {
  SessionCleanup.startCleanup();
}