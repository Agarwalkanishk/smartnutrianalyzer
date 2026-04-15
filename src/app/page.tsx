import Link from "next/link";

export default function Home() {
  return (
    <div className="grid gap-8">
      <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Smarter nutrition decisions, one meal at a time.
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-300">
          Set your goal, track calories and macros, and analyze ingredient lists
          (meals or packaged products) to spot potential concerns and discover
          better alternatives.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/profile/onboarding"
            className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Start onboarding
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            Analyze a product
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
            Personalized targets
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            Get daily calories and macro ranges based on your profile, activity,
            and goal.
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
            Meal logging
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            Track foods and portions, and see your daily totals update in real
            time.
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
            Ingredient insights
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            Identify potentially harmful ingredients and get safer alternatives
            with clear explanations.
          </p>
        </div>
      </section>
    </div>
  );
}
