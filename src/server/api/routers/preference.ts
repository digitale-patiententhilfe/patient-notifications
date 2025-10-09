import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { ChannelType, NotificationType } from "@prisma/client";

/**
 * Preference router - tRPC endpoints for notification preferences
 */
export const preferenceRouter = createTRPCRouter({
  /**
   * Get all preferences for the current user
   */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const patient = await ctx.db.patient.findUnique({
      where: { userId: ctx.session.user.id },
      include: {
        notificationPrefs: true,
      },
    });

    if (!patient) {
      return [];
    }

    return patient.notificationPrefs;
  }),

  /**
   * Update a notification preference
   */
  update: protectedProcedure
    .input(
      z.object({
        notificationType: z.nativeEnum(NotificationType),
        channelType: z.nativeEnum(ChannelType),
        enabled: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get or create patient record
      const existingPatient = await ctx.db.patient.findUnique({
        where: { userId: ctx.session.user.id },
      });

      const patient =
        existingPatient ??
        (await ctx.db.patient.create({
          data: {
            userId: ctx.session.user.id,
            timezone: "UTC",
          },
        }));

      // Upsert preference
      return ctx.db.notificationPreference.upsert({
        where: {
          patientId_notificationType_channelType: {
            patientId: patient.id,
            notificationType: input.notificationType,
            channelType: input.channelType,
          },
        },
        create: {
          patientId: patient.id,
          notificationType: input.notificationType,
          channelType: input.channelType,
          enabled: input.enabled,
        },
        update: {
          enabled: input.enabled,
        },
      });
    }),

  /**
   * Update patient timezone
   */
  updateTimezone: protectedProcedure
    .input(z.object({ timezone: z.string() }))
    .mutation(async ({ ctx, input }) => {
      let patient = await ctx.db.patient.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!patient) {
        patient = await ctx.db.patient.create({
          data: {
            userId: ctx.session.user.id,
            timezone: input.timezone,
          },
        });
      } else {
        patient = await ctx.db.patient.update({
          where: { id: patient.id },
          data: { timezone: input.timezone },
        });
      }

      return patient;
    }),

  /**
   * Update patient phone number
   */
  updatePhoneNumber: protectedProcedure
    .input(z.object({ phoneNumber: z.string() }))
    .mutation(async ({ ctx, input }) => {
      let patient = await ctx.db.patient.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!patient) {
        patient = await ctx.db.patient.create({
          data: {
            userId: ctx.session.user.id,
            phoneNumber: input.phoneNumber,
          },
        });
      } else {
        patient = await ctx.db.patient.update({
          where: { id: patient.id },
          data: { phoneNumber: input.phoneNumber },
        });
      }

      return patient;
    }),
});
