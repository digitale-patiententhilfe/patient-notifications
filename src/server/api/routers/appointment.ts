import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { AppointmentStatus } from "@prisma/client";

/**
 * Appointment router - tRPC endpoints for appointment management
 *
 * Test file should be: appointment.test.ts
 */
export const appointmentRouter = createTRPCRouter({
  /**
   * Create a new appointment
   * Should automatically schedule notification reminders
   */
  create: protectedProcedure
    .input(
      z.object({
        scheduledAt: z.date(),
        appointmentType: z.string().min(1),
        doctorName: z.string().min(1),
        location: z.string().optional(),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get or create patient record for the current user
      const existingPatient = await ctx.db.patient.findUnique({
        where: { userId: ctx.session.user.id },
      });

      const patient =
        existingPatient ??
        (await ctx.db.patient.create({
          data: {
            userId: ctx.session.user.id,
            timezone: "UTC", // Default, should be set by user
          },
        }));

      // Create appointment
      const appointment = await ctx.db.appointment.create({
        data: {
          patientId: patient.id,
          scheduledAt: input.scheduledAt,
          appointmentType: input.appointmentType,
          doctorName: input.doctorName,
          location: input.location,
          notes: input.notes,
        },
      });

      // TODO: Schedule notification reminders here
      // This is where NotificationScheduler would be called

      return appointment;
    }),

  /**
   * Get all appointments for the current user
   */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const patient = await ctx.db.patient.findUnique({
      where: { userId: ctx.session.user.id },
    });

    if (!patient) {
      return [];
    }

    return ctx.db.appointment.findMany({
      where: { patientId: patient.id },
      orderBy: { scheduledAt: "asc" },
      include: {
        notifications: {
          orderBy: { scheduledFor: "asc" },
        },
      },
    });
  }),

  /**
   * Get a specific appointment
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const patient = await ctx.db.patient.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!patient) {
        throw new Error("Patient not found");
      }

      return ctx.db.appointment.findFirst({
        where: {
          id: input.id,
          patientId: patient.id,
        },
        include: {
          notifications: true,
        },
      });
    }),

  /**
   * Update appointment status
   */
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.nativeEnum(AppointmentStatus),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const patient = await ctx.db.patient.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!patient) {
        throw new Error("Patient not found");
      }

      // Verify appointment belongs to this patient
      const appointment = await ctx.db.appointment.findFirst({
        where: {
          id: input.id,
          patientId: patient.id,
        },
      });

      if (!appointment) {
        throw new Error("Appointment not found");
      }

      return ctx.db.appointment.update({
        where: { id: input.id },
        data: { status: input.status },
      });
    }),
});
