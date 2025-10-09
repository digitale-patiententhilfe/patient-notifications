import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";

export default async function NotificationsPage() {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  const notifications = await api.notification.getAll();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
      case "SENT":
        return "bg-green-500/20 text-green-200";
      case "FAILED":
        return "bg-red-500/20 text-red-200";
      case "PENDING":
      case "SCHEDULED":
        return "bg-yellow-500/20 text-yellow-200";
      case "SENDING":
        return "bg-blue-500/20 text-blue-200";
      default:
        return "bg-gray-500/20 text-gray-200";
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "EMAIL":
        return "📧";
      case "SMS":
        return "📱";
      case "IN_APP":
        return "🔔";
      default:
        return "📬";
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-extrabold">My Notifications</h1>
          <Link
            href="/"
            className="rounded-lg bg-white/10 px-4 py-2 transition hover:bg-white/20"
          >
            ← Back to Home
          </Link>
        </div>

        {notifications.length === 0 ? (
          <div className="rounded-lg bg-white/10 p-8 text-center">
            <p className="text-xl text-white/80">
              No notifications yet.
            </p>
            <p className="mt-2 text-white/60">
              Run <code className="rounded bg-white/10 px-2 py-1">pnpm db:seed</code> to add sample data.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="rounded-lg bg-white/10 p-6 transition hover:bg-white/15"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="text-2xl">{getChannelIcon(notification.channelType)}</span>
                      <div>
                        <h3 className="text-lg font-semibold">
                          {notification.notificationType.replace(/_/g, " ")}
                        </h3>
                        <p className="text-sm text-white/60">
                          via {notification.channelType}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1 text-sm text-white/80">
                      <p>
                        <span className="font-semibold">Scheduled for:</span>{" "}
                        {new Date(notification.scheduledFor).toLocaleString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                      {notification.sentAt && (
                        <p>
                          <span className="font-semibold">Sent at:</span>{" "}
                          {new Date(notification.sentAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                      {notification.deliveredAt && (
                        <p>
                          <span className="font-semibold">Delivered at:</span>{" "}
                          {new Date(notification.deliveredAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                      {notification.errorMessage && (
                        <p className="text-red-300">
                          <span className="font-semibold">Error:</span> {notification.errorMessage}
                        </p>
                      )}
                      {notification.retryCount > 0 && (
                        <p>
                          <span className="font-semibold">Retries:</span> {notification.retryCount} / {notification.maxRetries}
                        </p>
                      )}
                      {notification.appointment && (
                        <p className="mt-2 text-white/60">
                          Related to: {notification.appointment.appointmentType} with{" "}
                          {notification.appointment.doctorName}
                        </p>
                      )}
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(notification.status)}`}
                  >
                    {notification.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 rounded-lg bg-white/5 p-6">
          <h2 className="mb-3 text-xl font-semibold">Legend</h2>
          <div className="grid gap-2 text-sm text-white/80 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs text-green-200">DELIVERED</span>
              <span>Successfully delivered</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-yellow-500/20 px-2 py-1 text-xs text-yellow-200">PENDING</span>
              <span>Waiting to be sent</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-red-500/20 px-2 py-1 text-xs text-red-200">FAILED</span>
              <span>Delivery failed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-500/20 px-2 py-1 text-xs text-blue-200">SENDING</span>
              <span>Currently being sent</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
