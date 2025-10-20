import type { PrismaClient } from "@prisma/client";

/**
 * NotificationRetrier - Handles retry logic for failed notifications
 *
 *
 * Requirements:
 * 1. Retry failed notifications up to maxRetries times
 * 2. Use exponential backoff: 1min, 2min, 4min, 8min, etc.
 * 3. Update notification status appropriately
 * 4. Log each retry attempt
 * 5. Consider: How would you make this run automatically? (cron, queue system?)
 */
export class NotificationRetrier {
  constructor(private db: PrismaClient) {}

  /**
   * Retry all failed notifications that are eligible for retry
   *
   * @returns Number of notifications retried
   */
  async retryFailedNotifications(): Promise<number> {
    // TODO: Implement
    // 1. Find notifications with status FAILED and retryCount < maxRetries
    // 2. For each notification, determine if enough time has passed (exponential backoff)
    // 3. Attempt to resend
    // 4. Update status and retryCount
    // 5. Log the attempt
    throw new Error("Not implemented");
  }

  /**
   * Calculate the backoff delay for a given retry attempt
   *
   * @param _retryCount - The current retry count (0-indexed)
   * @returns Delay in milliseconds
   */
  calculateBackoffDelay(_retryCount: number): number {
    // TODO: Implement exponential backoff
    // Example: 1min, 2min, 4min, 8min...
    // Formula: 2^retryCount * baseDelay
    throw new Error("Not implemented");
  }

  /**
   * Check if a notification is eligible for retry right now
   */
  async isEligibleForRetry(_notificationId: string): Promise<boolean> {
    // TODO: Implement
    // Check: status is FAILED
    // Check: retryCount < maxRetries
    // Check: enough time has passed since last attempt
    throw new Error("Not implemented");
  }
}
