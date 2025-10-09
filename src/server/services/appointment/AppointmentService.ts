import type { PrismaClient } from "@prisma/client";
import type { AppointmentStatus } from "@prisma/client";

export interface CreateAppointmentInput {
  patientId: string;
  scheduledAt: Date;
  appointmentType: string;
  doctorName: string;
  location?: string;
  notes?: string;
}

/**
 * AppointmentService - Business logic for appointment management
 */
export class AppointmentService {
  constructor(private db: PrismaClient) {}

  async createAppointment(input: CreateAppointmentInput) {
    const appointment = await this.db.appointment.create({
      data: {
        patientId: input.patientId,
        scheduledAt: input.scheduledAt,
        appointmentType: input.appointmentType,
        doctorName: input.doctorName,
        location: input.location,
        notes: input.notes,
      },
    });

    // TODO (for candidates): Trigger notification scheduling here
    // This is where you'd call NotificationScheduler to create reminder notifications

    return appointment;
  }

  async getAppointment(id: string) {
    return this.db.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async updateAppointmentStatus(id: string, status: AppointmentStatus) {
    return this.db.appointment.update({
      where: { id },
      data: { status },
    });
  }

  async getPatientAppointments(patientId: string) {
    return this.db.appointment.findMany({
      where: { patientId },
      orderBy: { scheduledAt: "asc" },
    });
  }
}
