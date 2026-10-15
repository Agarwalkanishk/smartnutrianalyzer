"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, type ReactNode, useRef, useState } from "react";
import { SortYourFoodGame } from "@/components/SortYourFoodGame";

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

  const drops = Array.from({ length: 24 }, (_, index) => ({
    id: index,
    icon: rainIcons[index % rainIcons.length],
    left: ((index * 41) % 100) + 1,
    duration: 10 + (index % 6),
    delay: (index % 8) * 0.7,
    size: 18 + (index % 4) * 5,
    opacity: 0.25,
  }));

  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emailInputRef = useRef<HTMLInputElement | null>(null);

  const handleSkipGame = () => {
    emailInputRef.current?.focus();
    emailInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      setLoading(false);

      if (!res || res.error) {
        setError("Email or password doesn't look right. Please try again.");
        return;
      }

      window.location.href = res.url ?? callbackUrl;
    } catch (err: unknown) {
      setLoading(false);
      setError(`Auth request error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div className="relative isolate min-h-[calc(100vh-5rem)] w-full bg-[#080808] flex items-center justify-center p-4 md:p-8 overflow-hidden">
      {/* Background Original Falling Food Animation (Decorative, Non-interactive) */}
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        style={{ pointerEvents: "none" }}
      >
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
              pointerEvents: "none",
            }}
            title={drop.icon.label}
          >
            <span
              className="inline-flex text-white"
              style={{ width: `${drop.size}px`, height: `${drop.size}px`, pointerEvents: "none" }}
            >
              {drop.icon.icon}
            </span>
          </span>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* LEFT COLUMN: Primary Brand Slogan & Sky Game Hero */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white uppercase leading-tight">
              GOOD FOOD.
              <br />
              <span className="text-[#FF6B00]">BETTER CHOICES.</span>
            </h1>
            <p className="text-sm sm:text-base text-[#A0A0A0] max-w-lg leading-relaxed">
              Know what you eat.
            </p>
          </div>

          {/* Direct Mount Signature Sky Game Component */}
          <SortYourFoodGame onSkip={handleSkipGame} />
        </div>

        {/* RIGHT COLUMN: Clean, Premium Sign-In Form */}
        <div className="md:col-span-5 w-full">
          <div className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-6 sm:p-8 space-y-6 shadow-2xl relative z-20">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Welcome back
              </h2>
              <p className="text-sm text-[#A0A0A0]">
                Sign in to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  ref={emailInputRef}
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  className="w-full rounded-lg border border-[#2A2A2A] bg-[#151515] px-3.5 py-2.5 text-sm text-white placeholder-[#555555] focus:border-[#FF6B00] focus:outline-none transition-colors"
                />
              </div>

              {/* Password Input with eye toggle */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full rounded-lg border border-[#2A2A2A] bg-[#151515] pl-3.5 pr-12 py-2.5 text-sm text-white placeholder-[#555555] focus:border-[#FF6B00] focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      setShowPassword(!showPassword);
                    }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-2 min-w-[40px] min-h-[40px] flex items-center justify-center text-[#A0A0A0] hover:text-white transition-colors cursor-pointer z-30"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      // EyeOff icon
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
                      </svg>
                    ) : (
                      // Eye icon
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error feedback notice */}
              {error ? (
                <div className="rounded-lg border border-[#FF2D2D]/40 bg-[#151515] p-3 flex items-center gap-2.5 text-xs text-[#FF2D2D]">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
                  </svg>
                  <span>{error}</span>
                </div>
              ) : null}

              {/* Sign In CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#FF6B00] py-3 text-sm font-bold uppercase tracking-wider text-white hover:bg-[#E05E00] active:scale-[0.99] disabled:opacity-50 transition-all border border-[#FF6B00] flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Signing you in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            {/* Bottom link to Sign Up */}
            <div className="pt-2 border-t border-[#2A2A2A] text-center text-xs text-[#A0A0A0]">
              New here?{" "}
              <Link
                href="/auth/sign-up"
                className="text-[#FF6B00] font-semibold hover:underline transition-colors"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
