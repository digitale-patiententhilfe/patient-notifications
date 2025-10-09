import Link from "next/link";
import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Patient <span className="text-[hsl(280,100%,70%)]">Notification</span> System
          </h1>
          <p className="text-xl text-center text-white/80 max-w-2xl">
            A comprehensive notification management system for healthcare appointments
            with multi-channel delivery, smart scheduling, and user preferences.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href="/appointments"
            >
              <h3 className="text-2xl font-bold">Appointments →</h3>
              <div className="text-lg">
                Schedule and manage your medical appointments with automatic notification reminders.
              </div>
            </Link>
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href="/notifications"
            >
              <h3 className="text-2xl font-bold">Notifications →</h3>
              <div className="text-lg">
                View your notification history and manage delivery preferences.
              </div>
            </Link>
          </div>

          <div className="flex flex-col items-center justify-center gap-4">
            <p className="text-center text-2xl text-white">
              {session ? (
                <span>Welcome, {session.user?.name}!</span>
              ) : (
                <span>Sign in to get started</span>
              )}
            </p>
            <Link
              href={session ? "/api/auth/signout" : "/api/auth/signin"}
              className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
            >
              {session ? "Sign out" : "Sign in"}
            </Link>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
