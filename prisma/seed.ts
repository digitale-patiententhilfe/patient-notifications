import { PrismaClient } from "@prisma/client";
import {
  ChannelType,
  NotificationType,
  AppointmentStatus,
  NotificationStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create a test user
  const user = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      name: "Test User",
      emailVerified: new Date(),
    },
  });

  console.log("✅ Created test user:", user.email);

  // Create patient record
  const patient = await prisma.patient.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      timezone: "America/New_York",
      phoneNumber: "+15551234567",
    },
  });

  console.log("✅ Created patient record");

  // Create notification preferences (all enabled by default)
  const notificationTypes = Object.values(NotificationType);
  const channelTypes = Object.values(ChannelType);

  for (const notificationType of notificationTypes) {
    for (const channelType of channelTypes) {
      await prisma.notificationPreference.upsert({
        where: {
          patientId_notificationType_channelType: {
            patientId: patient.id,
            notificationType,
            channelType,
          },
        },
        update: {},
        create: {
          patientId: patient.id,
          notificationType,
          channelType,
          enabled: true,
        },
      });
    }
  }

  console.log("✅ Created notification preferences");

  // Create sample appointments
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const appointment1 = await prisma.appointment.create({
    data: {
      patientId: patient.id,
      scheduledAt: tomorrow,
      status: AppointmentStatus.SCHEDULED,
      appointmentType: "General Checkup",
      doctorName: "Dr. Sarah Johnson",
      location: "Main Clinic, Room 203",
      notes: "Annual physical examination",
    },
  });

  const appointment2 = await prisma.appointment.create({
    data: {
      patientId: patient.id,
      scheduledAt: nextWeek,
      status: AppointmentStatus.SCHEDULED,
      appointmentType: "Dental Cleaning",
      doctorName: "Dr. Michael Chen",
      location: "Dental Office, Suite 5",
    },
  });

  console.log("✅ Created sample appointments");

  // Create sample notifications
  const twentyFourHoursBefore = new Date(tomorrow);
  twentyFourHoursBefore.setHours(twentyFourHoursBefore.getHours() - 24);

  const twoHoursBefore = new Date(tomorrow);
  twoHoursBefore.setHours(twoHoursBefore.getHours() - 2);

  await prisma.notification.create({
    data: {
      patientId: patient.id,
      appointmentId: appointment1.id,
      notificationType: NotificationType.APPOINTMENT_REMINDER,
      channelType: ChannelType.EMAIL,
      status: NotificationStatus.SENT,
      scheduledFor: twentyFourHoursBefore,
      sentAt: twentyFourHoursBefore,
      deliveredAt: twentyFourHoursBefore,
      content: JSON.stringify({
        subject: "Appointment Reminder - Tomorrow",
        body: "You have an appointment with Dr. Sarah Johnson tomorrow.",
      }),
    },
  });

  await prisma.notification.create({
    data: {
      patientId: patient.id,
      appointmentId: appointment1.id,
      notificationType: NotificationType.APPOINTMENT_REMINDER,
      channelType: ChannelType.IN_APP,
      status: NotificationStatus.PENDING,
      scheduledFor: twoHoursBefore,
      content: JSON.stringify({
        body: "Your appointment is in 2 hours!",
      }),
    },
  });

  console.log("✅ Created sample notifications");

  // Create notification templates
  await prisma.notificationTemplate.create({
    data: {
      notificationType: NotificationType.APPOINTMENT_REMINDER,
      channelType: ChannelType.EMAIL,
      subject: "Reminder: Appointment with {{doctorName}} on {{appointmentDate}}",
      bodyTemplate:
        "Hello {{patientName}},\n\nThis is a reminder that you have an appointment scheduled:\n\nDoctor: {{doctorName}}\nType: {{appointmentType}}\nDate & Time: {{appointmentDate}}\nLocation: {{location}}\n\nPlease arrive 10 minutes early.\n\nThank you!",
      variables: JSON.stringify([
        "patientName",
        "doctorName",
        "appointmentType",
        "appointmentDate",
        "location",
      ]),
      isActive: true,
    },
  });

  await prisma.notificationTemplate.create({
    data: {
      notificationType: NotificationType.APPOINTMENT_CONFIRMATION,
      channelType: ChannelType.EMAIL,
      subject: "Appointment Confirmed - {{appointmentDate}}",
      bodyTemplate:
        "Hello {{patientName}},\n\nYour appointment has been confirmed:\n\nDoctor: {{doctorName}}\nType: {{appointmentType}}\nDate & Time: {{appointmentDate}}\nLocation: {{location}}\n\nSee you soon!",
      variables: JSON.stringify([
        "patientName",
        "doctorName",
        "appointmentType",
        "appointmentDate",
        "location",
      ]),
      isActive: true,
    },
  });

  await prisma.notificationTemplate.create({
    data: {
      notificationType: NotificationType.APPOINTMENT_REMINDER,
      channelType: ChannelType.SMS,
      bodyTemplate:
        "Hi {{patientName}}! Reminder: Appointment with {{doctorName}} on {{appointmentDate}} at {{location}}",
      variables: JSON.stringify([
        "patientName",
        "doctorName",
        "appointmentDate",
        "location",
      ]),
      isActive: true,
    },
  });

  console.log("✅ Created notification templates");
  console.log("🎉 Seeding complete!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
