import Link from "next/link";

export default function ProfilePage() {
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Profile
        </h1>
        <Link
          href="/profile/onboarding"
          className="text-sm font-medium text-zinc-900 underline underline-offset-4 dark:text-zinc-50"
        >
          Run onboarding
        </Link>
      </div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Your body metrics, goals, preferences, and allergens will be stored
          here.
        </p>
      </div>
    </div>
  );
}

