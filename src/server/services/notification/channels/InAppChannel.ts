import { ChannelType } from "@prisma/client";
import type {
  INotificationChannel,
  NotificationPayload,
  ChannelResult,
  ValidationResult,
} from "./INotificationChannel";

/**
 * In-app notification channel implementation.
 * This stores notifications in the database for display within the application.
 */
export class InAppChannel implements INotificationChannel {
  async send(notification: NotificationPayload): Promise<ChannelResult> {
    const validation = this.validate(notification);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors.join(", "),
        retryable: false,
      };
    }

    // In-app notifications are already stored in DB, so this is a no-op
    // In a real system, you might push to a real-time service here
    return {
      success: true,
      messageId: notification.id,
      retryable: false,
    };
  }

  validate(notification: NotificationPayload): ValidationResult {
    const errors: string[] = [];

    if (!notification.content) {
      errors.push("content is required");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  getName(): ChannelType {
    return ChannelType.IN_APP;
  }
}
