"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { type ReactNode, useState } from "react";

export function SignInClient() {
  const rainIcons: { label: string; icon: ReactNode }[] = [
    {
      label: "Meat",
      icon: (
        <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" aria-hidden="true">
          <path
            d="M8 18c-3 0-5-2-5-5 0-2.8 2.2-5 5-5 .6-2.3 2.8-4 5.5-4C17.1 4 20 6.9 20 10.5c0 4.1-3.4 7.5-7.5 7.5H8Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="9" cy="13" r="1.5" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      ),
    },
    {
      label: "Meal",
      icon: (
        <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" aria-hidden="true">
          <path
            d="M4 13h16M6 13v1.5A4.5 4.5 0 0 0 10.5 19h3A4.5 4.5 0 0 0 18 14.5V13"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8 10c.5-1.4 1.6-2 3-2m2 2c.4-1 1.3-1.5 2.3-1.7"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      label: "Vegetable",
      icon: (
        <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" aria-hidden="true">
          <path
            d="M8 18c0-3.5 2.5-6.4 6-7.1 0 4.3-2.4 7.1-6 7.1Zm0 0c-1.7-.5-3-2-3-3.9 0-1.8 1.2-3.3 2.8-3.8.4 1.2.4 2.4.2 3.6"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      label: "Fruit",
      icon: (
        <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" aria-hidden="true">
          <path
            d="M12 7c-4.4 0-7 2.7-7 6.3C5 17.2 7.8 20 12 20s7-2.8 7-6.7C19 9.7 16.4 7 12 7Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 7c0-1.6.8-3 2.2-3.8M12 7c-1.3-1-2.6-1.3-4.2-.8"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
  ];
  const drops = Array.from({ length: 30 }, (_, index) => ({
    id: index,
    icon: rainIcons[index % rainIcons.length],
    left: ((index * 37) % 100) + 1,
    duration: 8 + (index % 6),
    delay: (index % 8) * 0.7,
    size: 16 + (index % 4) * 4,
    opacity: 0.25 + (index % 3) * 0.15,
  }));

  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="relative isolate min-h-[calc(100vh-10rem)] w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0">
        {drops.map((drop) => (
          <span
            key={drop.id}
            aria-hidden="true"
            className="food-drop absolute top-[-20vh] select-none"
            style={{
              left: `${drop.left}%`,
              animationDuration: `${drop.duration}s`,
              animationDelay: `${drop.delay}s`,
              opacity: drop.opacity,
            }}
            title={drop.icon.label}
          >
            <span
              className="inline-flex text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.65)]"
              style={{ width: `${drop.size}px`, height: `${drop.size}px` }}
            >
              {drop.icon.icon}
            </span>
          </span>
        ))}
      </div>

      <div className="relative z-10 mx-auto w-full max-w-md pt-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Use your email and password to continue.
        </p>

        <form
          className="mt-6 grid gap-4 rounded-2xl border border-zinc-200 bg-white/95 p-6 shadow-sm backdrop-blur-[1px] dark:border-zinc-800 dark:bg-zinc-950/90"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError(null);
            const res = await signIn("credentials", {
              email,
              password,
              redirect: false,
              callbackUrl,
            });
            setLoading(false);

            if (!res || res.error) {
              setError("Invalid email or password.");
              return;
            }

            window.location.href = res.url ?? callbackUrl;
          }}
        >
          <div className="grid gap-2">
            <label className="text-sm font-medium">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-black"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-black"
            />
          </div>
          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </div>
          ) : null}
          <button
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
          <p className="text-xs text-zinc-500">
            No account?{" "}
            <Link
              href="/auth/sign-up"
              className="text-zinc-900 underline underline-offset-4 dark:text-zinc-50"
            >
              Create one
            </Link>
          </p>
        </form>
      </div>

      <style jsx>{`
        .food-drop {
          animation-name: food-rain;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
          will-change: transform;
        }

        @keyframes food-rain {
          0% {
            transform: translate3d(0, -20vh, 0) rotate(0deg);
          }
          100% {
            transform: translate3d(0, 120vh, 0) rotate(25deg);
          }
        }
      `}</style>
    </div>
  );
}

