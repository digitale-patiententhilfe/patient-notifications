import { ChannelType } from "@prisma/client";
import type {
  INotificationChannel,
  NotificationPayload,
  ChannelResult,
  ValidationResult,
} from "./INotificationChannel";

/**
 * Email notification channel implementation.
 *
 * Requirements:
 * - Implement send() with mock email delivery (simulate API call)
 * - Add retry logic with exponential backoff
 * - Implement validate() to check for email address and required fields
 * - Handle errors appropriately and return correct ChannelResult
 */
export class EmailChannel implements INotificationChannel {
  async send(_notification: NotificationPayload): Promise<ChannelResult> {
    // TODO: Implement email sending logic
    // Hint: You can simulate an external email API call with a delay
    // Consider: How will you handle failures? What makes an error retryable?
    throw new Error("Not implemented");
  }

  validate(_notification: NotificationPayload): ValidationResult {
    // TODO: Implement validation
    // Check: recipientEmail exists and is valid format
    // Check: subject and content exist
    throw new Error("Not implemented");
  }

  getName(): ChannelType {
    return ChannelType.EMAIL;
  }
}
