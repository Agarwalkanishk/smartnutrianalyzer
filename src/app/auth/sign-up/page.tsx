"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="mx-auto w-full max-w-md pt-8">
      <h1 className="text-2xl font-bold tracking-tight text-white uppercase">
        Create Account
      </h1>
      <p className="mt-2 text-sm text-[#A0A0A0]">
        Register to save your profile metrics and meal logs.
      </p>

      <form
        className="mt-6 grid gap-4 rounded-xl border border-[#2A2A2A] bg-[#111111] p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          setError(null);

          const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ name, email, password }),
          });

          if (!res.ok) {
            const data = (await res.json().catch(() => null)) as
              | { error?: string }
              | null;
            setLoading(false);
            setError(data?.error ?? "Could not create account.");
            return;
          }

          const signInRes = await signIn("credentials", {
            email,
            password,
            redirect: false,
            callbackUrl: "/profile/onboarding",
          });
          setLoading(false);

          if (!signInRes || signInRes.error) {
            window.location.href = "/auth/sign-in";
            return;
          }
          window.location.href = signInRes.url ?? "/profile/onboarding";
        }}
      >
        <div className="grid gap-2">
          <label className="text-sm font-medium text-white">Full Name (optional)</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            className="rounded-lg border border-[#2A2A2A] bg-[#151515] px-3 py-2 text-sm text-white focus:border-[#FF6B00] outline-none"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-white">Email Address</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            className="rounded-lg border border-[#2A2A2A] bg-[#151515] px-3 py-2 text-sm text-white focus:border-[#FF6B00] outline-none"
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-white">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="new-password"
            className="rounded-lg border border-[#2A2A2A] bg-[#151515] px-3 py-2 text-sm text-white focus:border-[#FF6B00] outline-none"
          />
          <p className="text-xs text-[#A0A0A0]">Minimum 8 characters.</p>
        </div>
        {error ? (
          <div className="rounded-lg border border-[#FF2D2D] bg-[#151515] px-3 py-2 text-sm text-[#FF2D2D]">
            ⚠️ {error}
          </div>
        ) : null}
        <button
          disabled={loading}
          className="inline-flex items-center justify-center rounded-lg bg-[#FF6B00] px-4 py-2.5 text-sm font-bold text-white uppercase tracking-wider hover:bg-[#E05E00] disabled:opacity-50 transition-colors border border-[#FF6B00]"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>
        <p className="text-xs text-[#A0A0A0]">
          Already registered?{" "}
          <Link
            href="/auth/sign-in"
            className="text-[#FF6B00] font-semibold hover:underline"
          >
            Sign In Here
          </Link>
        </p>
      </form>
    </div>
  );
}
