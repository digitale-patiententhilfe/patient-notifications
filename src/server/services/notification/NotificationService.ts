import type { PrismaClient } from "@prisma/client";
import type { ChannelType, NotificationType } from "@prisma/client";

/**
 * NotificationService - Core service for notification operations
 *
 * This service contains INTENTIONAL BUGS for Task 4 (debugging exercise)
 */
export class NotificationService {
  constructor(private db: PrismaClient) {}

  /**
   * Check if a notification should be sent based on user preferences
   *
   * INTENTIONAL BUG (Task 4): This method has a bug that causes notifications
   * to be sent even when disabled. Find and fix it!
   */
  async shouldSendNotification(
    patientId: string,
    type: NotificationType,
    _channel: ChannelType,
  ): Promise<boolean> {
    const prefs = await this.db.notificationPreference.findMany({
      where: { patientId, notificationType: type },
    });

    // Bug: returns true if ANY preference exists, ignoring channelType and enabled status
    return prefs.length > 0;
  }

  /**
   * Get notifications for a patient (with N+1 query problem for Task 8)
   *
   * PERFORMANCE ISSUE (Task 8): This method has an N+1 query problem
   */
  async getNotifications(patientId: string) {
    const notifications = await this.db.notification.findMany({
      where: { patientId },
      orderBy: { createdAt: "desc" },
    });

    // N+1 problem: Loading appointment for each notification separately
    return Promise.all(
      notifications.map(async (n) => {
        const appointment = n.appointmentId
          ? await this.db.appointment.findUnique({
              where: { id: n.appointmentId },
            })
          : null;
        return { ...n, appointment };
      }),
    );
  }
}
