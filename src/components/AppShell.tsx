"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

function NavItem({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname?.startsWith(href));

  return (
    <Link
      href={href}
      className={[
        "rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
          : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900/50",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const foodLogos = [
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
  const [logoIndex, setLogoIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setLogoIndex((prev) => (prev + 1) % foodLogos.length);
    }, 1200);

    return () => window.clearInterval(interval);
  }, [foodLogos.length]);

  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/50">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
          >
            <span
              aria-hidden="true"
              className="inline-flex h-7 w-7 items-center justify-center text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] transition-transform duration-300 hover:scale-110 dark:drop-shadow-none"
              title={foodLogos[logoIndex].label}
            >
              {foodLogos[logoIndex].icon}
            </span>
            SmartNutriAnalyzer
          </Link>
          <nav className="flex flex-wrap items-center gap-1">
            <NavItem href="/dashboard">Dashboard</NavItem>
            <NavItem href="/log">Log meal</NavItem>
            <NavItem href="/products">Analyze product</NavItem>
            <NavItem href="/profile">Profile</NavItem>
          </nav>
        </div>
      </header>

      <main className="flex-1 bg-zinc-50 dark:bg-black">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
          {children}
        </div>
      </main>

      <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 text-xs text-zinc-500 sm:px-6">
          <span
            aria-hidden="true"
            className="mr-1 inline-flex h-4 w-4 items-center justify-center text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)] dark:drop-shadow-none"
            title={foodLogos[logoIndex].label}
          >
            {foodLogos[logoIndex].icon}
          </span>
          SmartNutriAnalyzer is for informational purposes only and is not a
          substitute for professional medical advice.
        </div>
      </footer>
    </div>
  );
}

