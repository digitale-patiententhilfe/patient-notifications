import type { ChannelType } from "@prisma/client";

export interface NotificationPayload {
  id: string;
  patientId: string;
  recipientEmail?: string;
  recipientPhone?: string;
  subject?: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface ChannelResult {
  success: boolean;
  messageId?: string;
  error?: string;
  retryable: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Interface for notification delivery channels.
 * Each channel (Email, SMS, In-App) implements this interface.
 */
export interface INotificationChannel {
  /**
   * Send a notification through this channel
   */
  send(notification: NotificationPayload): Promise<ChannelResult>;

  /**
   * Validate that the notification has all required fields for this channel
   */
  validate(notification: NotificationPayload): ValidationResult;

  /**
   * Get the channel type identifier
   */
  getName(): ChannelType;
}
