import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function AppointmentsPage() {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  const appointments = await api.appointment.getAll();

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-extrabold">My Appointments</h1>
          <Link
            href="/"
            className="rounded-lg bg-white/10 px-4 py-2 transition hover:bg-white/20"
          >
            ← Back to Home
          </Link>
        </div>

        {appointments.length === 0 ? (
          <div className="rounded-lg bg-white/10 p-8 text-center">
            <p className="text-xl text-white/80">
              No appointments scheduled yet.
            </p>
            <p className="mt-2 text-white/60">
              Run <code className="rounded bg-white/10 px-2 py-1">pnpm db:seed</code> to add sample data.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="rounded-lg bg-white/10 p-6 transition hover:bg-white/15"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{appointment.appointmentType}</h2>
                    <p className="mt-1 text-lg text-white/90">
                      with {appointment.doctorName}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      appointment.status === "SCHEDULED"
                        ? "bg-blue-500/20 text-blue-200"
                        : appointment.status === "CONFIRMED"
                          ? "bg-green-500/20 text-green-200"
                          : appointment.status === "CANCELLED"
                            ? "bg-red-500/20 text-red-200"
                            : "bg-gray-500/20 text-gray-200"
                    }`}
                  >
                    {appointment.status}
                  </span>
                </div>

                <div className="space-y-2 text-white/80">
                  <p>
                    <span className="font-semibold">Date:</span>{" "}
                    {new Date(appointment.scheduledAt).toLocaleString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                  {appointment.location && (
                    <p>
                      <span className="font-semibold">Location:</span> {appointment.location}
                    </p>
                  )}
                  {appointment.notes && (
                    <p>
                      <span className="font-semibold">Notes:</span> {appointment.notes}
                    </p>
                  )}
                  {appointment.notifications && appointment.notifications.length > 0 && (
                    <p>
                      <span className="font-semibold">Notifications:</span>{" "}
                      {appointment.notifications.length} scheduled
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
