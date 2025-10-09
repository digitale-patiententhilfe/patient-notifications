import { ChannelType } from "@prisma/client";
import type {
  INotificationChannel,
  NotificationPayload,
  ChannelResult,
  ValidationResult,
} from "./INotificationChannel";

/**
 * SMS notification channel implementation (mock).
 * This is a simplified implementation for demonstration purposes.
 */
export class SmsChannel implements INotificationChannel {
  async send(notification: NotificationPayload): Promise<ChannelResult> {
    const validation = this.validate(notification);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors.join(", "),
        retryable: false,
      };
    }

    // Simulate SMS API call
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Simulate 10% failure rate
    if (Math.random() < 0.1) {
      return {
        success: false,
        error: "SMS delivery failed",
        retryable: true,
      };
    }

    return {
      success: true,
      messageId: `sms_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      retryable: false,
    };
  }

  validate(notification: NotificationPayload): ValidationResult {
    const errors: string[] = [];

    if (!notification.recipientPhone) {
      errors.push("recipientPhone is required for SMS channel");
    } else if (!/^\+?[1-9]\d{1,14}$/.test(notification.recipientPhone)) {
      errors.push("recipientPhone must be a valid phone number");
    }

    if (!notification.content) {
      errors.push("content is required");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  getName(): ChannelType {
    return ChannelType.SMS;
  }
}
