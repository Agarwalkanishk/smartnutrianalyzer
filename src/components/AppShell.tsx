"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

const FOOD_LOGOS = [
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

// Isolated Animated Icon Component to cycle food logos continuously across all devices
function AnimatedFoodIcon({ className = "h-8 w-8" }: { className?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % FOOD_LOGOS.length);
    }, 1200);

    return () => clearInterval(timer);
  }, []);

  const logo = FOOD_LOGOS[index];

  return (
    <span
      key={index}
      aria-hidden="true"
      className={`inline-flex items-center justify-center text-[#FF6B00] bg-[#151515] border border-[#FF6B00] rounded-md transition-all duration-300 ${className}`}
      title={logo.label}
    >
      {logo.icon}
    </span>
  );
}

function NavItem({
  href,
  children,
  onClick,
}: {
  href: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname?.startsWith(href));

  return (
    <Link
      href={href}
      onClick={onClick}
      className={[
        "rounded-md px-3.5 py-2 text-sm font-medium transition-colors border text-center",
        active
          ? "bg-[#FF6B00] text-white border-[#FF6B00] shadow-sm font-semibold"
          : "bg-[#151515] text-[#A0A0A0] border-[#2A2A2A] hover:border-[#FF6B00] hover:text-white",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth/");
  const isSignIn = pathname?.startsWith("/auth/sign-in");
  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com/";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col font-sans">
      <header className="sticky top-0 z-40 border-b border-[#2A2A2A] bg-[#111111]/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 font-bold tracking-tight text-white text-lg hover:opacity-90 transition-opacity"
          >
            <AnimatedFoodIcon className="h-8 w-8" />
            <span>
              SmartNutri<span className="text-[#FF6B00]">Analyzer</span>
            </span>
          </Link>

          {isAuthPage ? (
            <Link
              href={isSignIn ? "/auth/sign-up" : "/auth/sign-in"}
              className="rounded-lg border border-[#2A2A2A] bg-[#151515] px-4 py-2 text-xs font-bold text-white hover:border-[#FF6B00] transition-colors uppercase tracking-wider"
            >
              {isSignIn ? "Create account" : "Sign in"}
            </Link>
          ) : (
            <>
              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-2">
                <NavItem href="/dashboard">Dashboard</NavItem>
                <NavItem href="/log">Log meal</NavItem>
                <NavItem href="/products">Analyze product</NavItem>
                <NavItem href="/profile">Profile</NavItem>
              </nav>

              {/* Mobile Hamburger Toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden inline-flex items-center justify-center rounded-lg border border-[#2A2A2A] bg-[#151515] p-2 text-[#A0A0A0] hover:text-white hover:border-[#FF6B00] focus:outline-none"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </>
          )}
        </div>

        {/* Mobile Dropdown Nav Menu */}
        {!isAuthPage && mobileMenuOpen && (
          <div className="md:hidden border-t border-[#2A2A2A] bg-[#111111] px-4 py-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
            <NavItem href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
              Dashboard
            </NavItem>
            <NavItem href="/log" onClick={() => setMobileMenuOpen(false)}>
              Log meal
            </NavItem>
            <NavItem href="/products" onClick={() => setMobileMenuOpen(false)}>
              Analyze product
            </NavItem>
            <NavItem href="/profile" onClick={() => setMobileMenuOpen(false)}>
              Profile
            </NavItem>
          </div>
        )}
      </header>

      <main className="flex-1 bg-[#080808]">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8 sm:px-6">
          {children}
        </div>
      </main>

      <footer className="border-t border-[#2A2A2A] bg-[#111111] mt-auto">
        <div className="mx-auto w-full max-w-6xl px-4 py-5 text-xs text-[#A0A0A0] sm:px-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2.5">
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub link"
              className="inline-flex h-6 w-6 items-center justify-center text-[#FF6B00] bg-[#151515] border border-[#2A2A2A] hover:border-[#FF6B00] rounded transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
            <span>SmartNutriAnalyzer — Personal nutrition tracking & ingredient safety analysis.</span>
          </div>
          <div className="text-[#707070] font-mono text-[11px]">
            SmartNutriAnalyzer v1.0
          </div>
        </div>
      </footer>
    </div>
  );
}
