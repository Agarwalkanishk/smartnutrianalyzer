import Link from "next/link";

export default function Home() {
  return (
    <div className="grid gap-8 animate-in fade-in duration-300">
      {/* Hero Banner Section */}
      <section className="rounded-2xl border border-[#2A2A2A] bg-gradient-to-b from-[#151515] to-[#111111] p-6 sm:p-10 relative overflow-hidden shadow-2xl">
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6B00]/40 bg-[#FF6B00]/10 px-3 py-1 text-xs font-mono font-bold text-[#FF6B00] uppercase tracking-wider">
            <span>✨</span> SMART NUTRITION & INGREDIENT INTELLIGENCE
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white uppercase leading-none">
            Know What's <span className="text-[#FF6B00]">Inside Your Food.</span>
          </h1>
          <p className="text-[#A0A0A0] text-sm sm:text-base leading-relaxed max-w-2xl">
            Set your body goals, track daily calories & macros in real time, analyze ingredient labels to flag hidden additives & high sodium, and discover cleaner, healthier alternatives.
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-4">
            <Link
              href="/products/analyze"
              className="inline-flex items-center justify-center rounded-lg bg-[#FF6B00] px-6 py-3.5 text-sm font-bold text-white uppercase tracking-wider hover:bg-[#E05E00] transition-colors border border-[#FF6B00] shadow-lg"
            >
              Scan Product Barcode →
            </Link>
            <Link
              href="/log"
              className="inline-flex items-center justify-center rounded-lg bg-[#151515] border border-[#2A2A2A] px-6 py-3.5 text-sm font-bold text-white uppercase tracking-wider hover:border-[#FF6B00] hover:text-[#FF6B00] transition-colors"
            >
              Log Meal Photo
            </Link>
            <Link
              href="/profile/onboarding"
              className="inline-flex items-center justify-center rounded-lg bg-transparent px-4 py-3.5 text-sm font-bold text-[#A0A0A0] hover:text-white uppercase tracking-wider transition-colors"
            >
              Set Targets →
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Pillar Cards */}
      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-6 hover:border-[#FF6B00] transition-colors">
          <div className="text-[#FF6B00] font-mono text-xs font-bold mb-2">01 // TARGETS</div>
          <h2 className="font-bold text-white text-lg uppercase tracking-tight">
            Personalized Targets
          </h2>
          <p className="mt-2 text-sm text-[#A0A0A0] leading-relaxed">
            Calculate daily calories, protein, carb, and fat targets derived strictly from your age, body weight, activity level, and weight goals via Mifflin-St Jeor BMR & TDEE.
          </p>
        </div>

        <div className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-6 hover:border-[#FF6B00] transition-colors">
          <div className="text-[#FF6B00] font-mono text-xs font-bold mb-2">02 // LOGGING</div>
          <h2 className="font-bold text-white text-lg uppercase tracking-tight">
            Photo & AI Meal Logging
          </h2>
          <p className="mt-2 text-sm text-[#A0A0A0] leading-relaxed">
            Capture or upload a meal photo to estimate calories and macro breakdowns, edit portion estimates, and track daily macro totals updating in real time.
          </p>
        </div>

        <div className="rounded-xl border border-[#2A2A2A] bg-[#111111] p-6 hover:border-[#FF6B00] transition-colors">
          <div className="text-[#FF6B00] font-mono text-xs font-bold mb-2">03 // INGREDIENTS</div>
          <h2 className="font-bold text-white text-lg uppercase tracking-tight">
            Safety & Clean Alternatives
          </h2>
          <p className="mt-2 text-sm text-[#A0A0A0] leading-relaxed">
            Flag high sodium, artificial preservatives, high fructose corn syrup, or harmful additives with clear severity warnings and discover clean-label brand alternatives.
          </p>
        </div>
      </section>
    </div>
  );
}
