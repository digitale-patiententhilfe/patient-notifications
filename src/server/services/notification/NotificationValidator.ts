import type { ChannelType, NotificationType } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";

export interface NotificationValidationError {
  field: string;
  message: string;
}

/**
 * NotificationValidator - Validates business rules for notifications
 *
 *
 * Requirements:
 * - Can't schedule notification in the past
 * - Can't send EMAIL notification to patient without email address
 * - Can't send SMS notification to patient without phone number
 * - Appointment must exist for appointment-related notifications
 * - Notification type must be enabled in patient preferences
 */
export class NotificationValidator {
  constructor(private db: PrismaClient) {}

  async validateNotification(_params: {
    patientId: string;
    notificationType: NotificationType;
    channelType: ChannelType;
    scheduledFor: Date;
    appointmentId?: string;
  }): Promise<NotificationValidationError[]> {
    // TODO: Implement validation logic
    // Return array of validation errors (empty if valid)
    throw new Error("Not implemented");
  }
}
