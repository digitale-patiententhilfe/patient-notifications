import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { ChannelType, NotificationStatus } from "@prisma/client";

/**
 * Notification router - tRPC endpoints for notification management
 */
export const notificationRouter = createTRPCRouter({
  /**
   * Get all notifications for the current user
   */
  getAll: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(50),
          offset: z.number().min(0).default(0),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const patient = await ctx.db.patient.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!patient) {
        return [];
      }

      const limit = input?.limit ?? 50;
      const offset = input?.offset ?? 0;

      return ctx.db.notification.findMany({
        where: { patientId: patient.id },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          appointment: {
            select: {
              scheduledAt: true,
              appointmentType: true,
              doctorName: true,
            },
          },
        },
      });
    }),

  /**
   * Get unread notifications (in-app)
   */
  getUnread: protectedProcedure.query(async ({ ctx }) => {
    const patient = await ctx.db.patient.findUnique({
      where: { userId: ctx.session.user.id },
    });

    if (!patient) {
      return [];
    }

    return ctx.db.notification.findMany({
      where: {
        patientId: patient.id,
        channelType: ChannelType.IN_APP,
        status: {
          in: [NotificationStatus.SENT, NotificationStatus.DELIVERED],
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        appointment: {
          select: {
            scheduledAt: true,
            appointmentType: true,
            doctorName: true,
          },
        },
      },
    });
  }),

  /**
   * Mark notification as read (for in-app notifications)
   */
  markAsRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const patient = await ctx.db.patient.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!patient) {
        throw new Error("Patient not found");
      }

      // Verify notification belongs to this patient
      const notification = await ctx.db.notification.findFirst({
        where: {
          id: input.id,
          patientId: patient.id,
        },
      });

      if (!notification) {
        throw new Error("Notification not found");
      }

      return ctx.db.notification.update({
        where: { id: input.id },
        data: { deliveredAt: new Date() },
      });
    }),

  /**
   * Retry a failed notification
   */
  retry: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const patient = await ctx.db.patient.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!patient) {
        throw new Error("Patient not found");
      }

      const notification = await ctx.db.notification.findFirst({
        where: {
          id: input.id,
          patientId: patient.id,
          status: NotificationStatus.FAILED,
        },
      });

      if (!notification) {
        throw new Error("Notification not found or not failed");
      }

      // TODO: Implement actual retry logic with NotificationRetrier
      return { success: true };
    }),
});
