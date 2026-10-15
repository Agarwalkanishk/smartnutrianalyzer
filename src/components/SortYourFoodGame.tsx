"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export interface FoodItemDef {
  id: string;
  emoji: string;
  name: string;
  category: "good" | "watch";
}

export const FOOD_DATABASE: FoodItemDef[] = [
  // GOOD — Let them fall
  { id: "apple", emoji: "🍎", name: "Apple", category: "good" },
  { id: "broccoli", emoji: "🥦", name: "Broccoli", category: "good" },
  { id: "egg", emoji: "🥚", name: "Egg", category: "good" },
  { id: "fish", emoji: "🐟", name: "Fish", category: "good" },
  { id: "wheat", emoji: "🌾", name: "Wheat", category: "good" },
  { id: "milk", emoji: "🥛", name: "Milk", category: "good" },

  // WORTH WATCHING — Catch with the dustbin
  { id: "chips", emoji: "🍟", name: "Chips", category: "watch" },
  { id: "noodles", emoji: "🍜", name: "Instant Noodles", category: "watch" },
  { id: "soda", emoji: "🥤", name: "Soft Drink", category: "watch" },
  { id: "donut", emoji: "🍩", name: "Donut", category: "watch" },
  { id: "chocolate", emoji: "🍫", name: "Chocolate", category: "watch" },
  { id: "candy", emoji: "🍬", name: "Candy", category: "watch" },
];

// Clean, cohesive 2D flat vector illustrations for all 12 food items
export const FOOD_SVGS: Record<string, ReactNode> = {
  apple: (
    <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
      <path
        d="M20 10 C16 4 10 7 10 16 C10 27 15 34 20 34 C25 34 30 27 30 16 C30 7 24 4 20 10 Z"
        fill="#EF4444"
        stroke="#B91C1C"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M20 10 Q21 6 24 5" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
      <path d="M21 7 C24 6 27 7 26 10 C23 10 21 8 21 7 Z" fill="#22C55E" />
    </svg>
  ),
  broccoli: (
    <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
      <path d="M17 24 L16 35 C16 36.5 24 36.5 24 35 L23 24 Z" fill="#86EFAC" stroke="#15803D" strokeWidth="1.5" />
      <circle cx="15" cy="18" r="7" fill="#22C55E" stroke="#15803D" strokeWidth="1.5" />
      <circle cx="25" cy="18" r="7" fill="#22C55E" stroke="#15803D" strokeWidth="1.5" />
      <circle cx="20" cy="13" r="8" fill="#16A34A" stroke="#15803D" strokeWidth="1.5" />
    </svg>
  ),
  egg: (
    <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
      <path
        d="M20 6 C12 6 8 16 8 25 C8 31 13 35 20 35 C27 35 32 31 32 25 C32 16 28 6 20 6 Z"
        fill="#F8FAFC"
        stroke="#64748B"
        strokeWidth="1.5"
      />
      <path d="M14 24 C14 18 17 12 20 10" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  fish: (
    <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
      <path d="M6 20 C12 12 28 12 34 20 C28 28 12 28 6 20 Z" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
      <path d="M34 20 L39 14 L37 20 L39 26 Z" fill="#0284C7" />
      <circle cx="12" cy="18" r="2" fill="#0F172A" />
      <path d="M18 16 C20 18 20 22 18 24" stroke="#0284C7" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  wheat: (
    <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
      <path d="M20 36 V8" stroke="#CA8A04" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 10 C16 8 13 11 20 15 C27 11 24 8 20 10 Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.2" />
      <path d="M20 17 C15 15 12 18 20 22 C28 18 25 15 20 17 Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.2" />
      <path d="M20 24 C16 22 13 25 20 29 C27 25 24 22 20 24 Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.2" />
    </svg>
  ),
  milk: (
    <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
      <path
        d="M12 14 L20 8 L28 14 V34 C28 35 27 36 26 36 H14 C13 36 12 35 12 34 Z"
        fill="#FFFFFF"
        stroke="#2563EB"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M12 14 H28 V20 H12 Z" fill="#60A5FA" stroke="#2563EB" strokeWidth="1.5" />
      <path d="M18 25 C16 27 16 30 20 30 C24 30 24 27 22 25 Z" fill="#3B82F6" />
    </svg>
  ),
  chips: (
    <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
      <path
        d="M12 18 L10 35 C10 36 11 37 12 37 H28 C29 37 30 36 30 35 L28 18 Z"
        fill="#EF4444"
        stroke="#B91C1C"
        strokeWidth="1.5"
      />
      <path
        d="M13 18 L12 8 M17 18 L16 5 M20 18 V6 M23 18 L24 5 M27 18 L28 8"
        stroke="#FACC15"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  ),
  noodles: (
    <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
      <path d="M8 20 C8 30 13 35 20 35 C27 35 32 30 32 20 Z" fill="#EA580C" stroke="#9A3412" strokeWidth="1.5" />
      <path d="M10 20 Q15 15 20 20 T30 20" stroke="#FACC15" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M11 17 Q16 12 20 17 T29 17" stroke="#FEF08A" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M26 6 L12 22 M30 7 L16 23" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  soda: (
    <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
      <path
        d="M12 14 L14 35 C14 36 15 37 16 37 H24 C25 37 26 36 26 35 L28 14 Z"
        fill="#EF4444"
        stroke="#991B1B"
        strokeWidth="1.5"
      />
      <ellipse cx="20" cy="14" rx="8" ry="2" fill="#E2E8F0" stroke="#991B1B" strokeWidth="1.5" />
      <path d="M20 14 L24 4" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M13 23 H27" stroke="#FFFFFF" strokeWidth="3" />
    </svg>
  ),
  donut: (
    <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
      <circle cx="20" cy="20" r="14" fill="#D97706" stroke="#78350F" strokeWidth="1.5" />
      <circle cx="20" cy="20" r="12" fill="#F472B6" />
      <circle cx="20" cy="20" r="5" fill="#82C3D9" stroke="#78350F" strokeWidth="1.5" />
      <circle cx="15" cy="13" r="1" fill="#FFFFFF" />
      <circle cx="25" cy="14" r="1" fill="#FACC15" />
      <circle cx="26" cy="23" r="1" fill="#FFFFFF" />
      <circle cx="14" cy="24" r="1" fill="#4ADE80" />
    </svg>
  ),
  chocolate: (
    <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
      <rect x="10" y="8" width="20" height="24" rx="2" fill="#451A03" stroke="#270A00" strokeWidth="1.5" />
      <path d="M10 20 H30 M20 8 V32 M10 14 H30 M10 26 H30" stroke="#270A00" strokeWidth="1" />
      <path d="M10 20 L30 20 L30 32 L10 32 Z" fill="#DC2626" stroke="#991B1B" strokeWidth="1.5" />
    </svg>
  ),
  candy: (
    <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
      <path d="M8 12 L14 17 L8 22 Z" fill="#EC4899" stroke="#9D174D" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M32 12 L26 17 L32 22 Z" fill="#EC4899" stroke="#9D174D" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="20" cy="17" r="8" fill="#F472B6" stroke="#9D174D" strokeWidth="1.5" />
      <path d="M17 13 Q20 17 23 21" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};

export interface ActiveItem {
  id: string;
  item: FoodItemDef;
  xPercent: number;
  yPx: number;
  speed: number;
  rotation: number;
}

export interface FeedbackToast {
  id: number;
  text: string;
  color: string;
  x: number;
  y: number;
}

export function SortYourFoodGame({ onSkip }: { onSkip?: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [gameState, setGameState] = useState<"idle" | "countdown" | "playing" | "ended">("idle");
  const [countdownNum, setCountdownNum] = useState<number | string>(3);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [score, setScore] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [binBounce, setBinBounce] = useState(false);
  const [binShake, setBinShake] = useState(false);
  const [activeItems, setActiveItems] = useState<ActiveItem[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackToast[]>([]);
  const [caughtIds, setCaughtIds] = useState<string[]>([]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const binRef = useRef<HTMLDivElement | null>(null);
  const itemDomRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const animationFrameRef = useRef<number | null>(null);
  const lastSpawnTimeRef = useRef<number>(0);

  const activeItemsRef = useRef<ActiveItem[]>([]);
  const targetBinXRef = useRef<number>(50);
  const currentBinXRef = useRef<number>(50);

  const syncItemsToState = () => {
    setActiveItems([...activeItemsRef.current]);
  };

  useEffect(() => {
    if (gameState !== "ended") return;

    setDisplayScore(0);
    const duration = 600;
    const startTime = performance.now();

    const animateScore = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      const currentVal = Math.floor(progress * score);
      setDisplayScore(currentVal);

      if (progress < 1) {
        requestAnimationFrame(animateScore);
      }
    };

    requestAnimationFrame(animateScore);
  }, [gameState, score]);

  const startCountdown = () => {
    setGameState("countdown");
    setCountdownNum(3);

    setTimeout(() => setCountdownNum(2), 500);
    setTimeout(() => setCountdownNum(1), 1000);
    setTimeout(() => setCountdownNum("GO!"), 1500);
    setTimeout(() => {
      setScore(0);
      setDisplayScore(0);
      setTimeLeft(15);
      activeItemsRef.current = [];
      targetBinXRef.current = 50;
      currentBinXRef.current = 50;
      syncItemsToState();
      setCaughtIds([]);
      setFeedbacks([]);
      setGameState("playing");
    }, 1800);
  };

  useEffect(() => {
    if (gameState !== "playing") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameState("ended");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  useEffect(() => {
    if (gameState !== "playing") return;

    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const loop = (timestamp: number) => {
      const height = container.clientHeight || 580;
      const width = container.clientWidth || 600;
      const binOpeningY = height - 110;

      currentBinXRef.current += (targetBinXRef.current - currentBinXRef.current) * 0.22;
      if (binRef.current) {
        binRef.current.style.left = `${currentBinXRef.current}%`;
      }

      const binPxX = (currentBinXRef.current / 100) * width;

      if (timestamp - lastSpawnTimeRef.current > 1400) {
        if (activeItemsRef.current.length < 3) {
          const randomDef =
            FOOD_DATABASE[Math.floor(Math.random() * FOOD_DATABASE.length)];

          const newItem: ActiveItem = {
            id: `${randomDef.id}-${Date.now()}-${Math.random()}`,
            item: randomDef,
            xPercent: 10 + Math.random() * 78,
            yPx: -45,
            speed: prefersReducedMotion ? 1.4 : 2.0 + Math.random() * 0.8,
            rotation: (Math.random() - 0.5) * 12,
          };

          activeItemsRef.current.push(newItem);
          lastSpawnTimeRef.current = timestamp;
          syncItemsToState();
        }
      }

      let stateNeedsUpdate = false;
      const remainingItems: ActiveItem[] = [];

      for (const item of activeItemsRef.current) {
        item.yPx += item.speed;
        const itemPxX = (item.xPercent / 100) * width;

        const domEl = itemDomRefs.current.get(item.id);
        if (domEl) {
          domEl.style.transform = `translate3d(${itemPxX}px, ${item.yPx}px, 0) rotate(${item.rotation}deg)`;
        }

        if (item.yPx >= binOpeningY - 30 && item.yPx <= binOpeningY + 35) {
          if (Math.abs(itemPxX - binPxX) <= 65) {
            if (item.item.category === "watch") {
              setScore((prev) => prev + 10);
              setCaughtIds((prev) => [...prev, item.item.id]);
              triggerToast("+10", "#FF6B00", itemPxX, binOpeningY - 30);
              triggerBinBounce();
            } else {
              setScore((prev) => Math.max(0, prev - 5));
              triggerToast("-5", "#FF2D2D", itemPxX, binOpeningY - 30);
              triggerBinShake();
            }
            stateNeedsUpdate = true;
            itemDomRefs.current.delete(item.id);
            continue;
          }
        }

        if (item.yPx > height + 40) {
          stateNeedsUpdate = true;
          itemDomRefs.current.delete(item.id);
          continue;
        }

        remainingItems.push(item);
      }

      activeItemsRef.current = remainingItems;
      if (stateNeedsUpdate) {
        syncItemsToState();
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState]);

  const triggerToast = (text: string, color: string, pxX: number, pxY: number) => {
    const toast: FeedbackToast = {
      id: Date.now() + Math.random(),
      text,
      color,
      x: pxX,
      y: pxY,
    };
    setFeedbacks((prev) => [...prev.slice(-3), toast]);

    setTimeout(() => {
      setFeedbacks((prev) => prev.filter((t) => t.id !== toast.id));
    }, 800);
  };

  const triggerBinBounce = () => {
    setBinBounce(true);
    setTimeout(() => setBinBounce(false), 220);
  };

  const triggerBinShake = () => {
    setBinShake(true);
    setTimeout(() => setBinShake(false), 220);
  };

  const updateBinPosition = (clientX: number) => {
    if (gameState !== "playing" || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const newXPercent = Math.max(10, Math.min(90, (relativeX / rect.width) * 100));
    targetBinXRef.current = newXPercent;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (gameState !== "playing") return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Fallback
    }
    updateBinPosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    updateBinPosition(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches && e.touches.length > 0) {
      updateBinPosition(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    if (gameState !== "playing") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        targetBinXRef.current = Math.max(10, targetBinXRef.current - 8);
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        targetBinXRef.current = Math.min(90, targetBinXRef.current + 8);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState]);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onTouchStart={(e) => {
        if (e.touches[0]) updateBinPosition(e.touches[0].clientX);
      }}
      onTouchMove={handleTouchMove}
      style={{ touchAction: "none" }}
      className="relative w-full h-[480px] sm:h-[620px] rounded-2xl bg-[#82C3D9] overflow-hidden select-none cursor-crosshair border border-[#2A2A2A]/20"
    >
      {/* TIME PROGRESS BAR AT TOP EDGE */}
      {gameState === "playing" && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-black/10 z-30 pointer-events-none">
          <div
            className="h-full bg-[#FF6B00] transition-all duration-1000 ease-linear"
            style={{ width: `${(timeLeft / 15) * 100}%` }}
          />
        </div>
      )}

      {/* CLEAN FLAT 2D SKY ENVIRONMENT */}
      {/* Sun */}
      <div className="absolute top-6 right-8 w-14 h-14 rounded-full bg-[#FBBF24] stroke-[#F59E0B] stroke-2 pointer-events-none z-0" />

      {/* Flat Vector Clouds */}
      <svg
        className="absolute top-8 left-[10%] w-32 h-12 text-[#FFFFFF] pointer-events-none z-0 opacity-90"
        viewBox="0 0 140 60"
        fill="currentColor"
      >
        <path d="M 20 45 A 18 18 0 0 1 30 18 A 24 24 0 0 1 72 12 A 22 22 0 0 1 110 22 A 18 18 0 0 1 120 45 Z" />
      </svg>

      <svg
        className="absolute top-20 right-[22%] w-36 h-14 text-[#FFFFFF] pointer-events-none z-0 opacity-80"
        viewBox="0 0 160 70"
        fill="currentColor"
      >
        <path d="M 22 52 A 20 20 0 0 1 36 22 A 28 28 0 0 1 85 14 A 26 26 0 0 1 130 26 A 20 20 0 0 1 142 52 Z" />
      </svg>

      {/* Ground Surface Strip at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-11 bg-[#D3CCBE] border-t border-[#A8A092] z-10" />

      {/* PLAIN FLAT 2D OPEN-TOP WASTEBASKET */}
      <div
        ref={binRef}
        style={{
          left: `50%`,
          transform: `translateX(-50%)`,
        }}
        className="absolute bottom-[44px] z-20 pointer-events-none flex flex-col items-center"
      >
        <svg
          className="w-28 h-28 sm:w-32 sm:h-32"
          viewBox="0 0 100 100"
          fill="none"
        >
          {/* Open Top Rim Oval */}
          <ellipse
            cx="50"
            cy="18"
            rx="38"
            ry="7"
            fill={binBounce ? "#FF6B00" : binShake ? "#FF2D2D" : "#9CA3AF"}
            stroke={binBounce ? "#FF6B00" : binShake ? "#FF2D2D" : "#374151"}
            strokeWidth="2.5"
            className="transition-colors duration-150"
          />
          <ellipse cx="50" cy="18" rx="32" ry="4" fill="#374151" />

          {/* Tapered Light-Gray Vessel Body */}
          <path
            d="M14 20 L22 88 C23 93 28 96 50 96 C72 96 77 93 78 88 L86 20 Z"
            fill="#E5E7EB"
            stroke={binBounce ? "#FF6B00" : binShake ? "#FF2D2D" : "#374151"}
            strokeWidth="2.5"
            strokeLinejoin="round"
            className="transition-colors duration-150"
          />

          {/* Subtle Lip Line */}
          <path
            d="M15 27 H85"
            stroke={binBounce ? "#FF6B00" : binShake ? "#FF2D2D" : "#D1D5DB"}
            strokeWidth="2"
            strokeLinecap="round"
            className="transition-colors duration-150"
          />
        </svg>
      </div>

      {/* IDLE START OVERLAY */}
      {gameState === "idle" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4 z-30 bg-[#82C3D9]/95">
          <h3 className="text-3xl sm:text-4xl font-extrabold text-[#111111] uppercase tracking-tight">
            SORT YOUR FOOD
          </h3>

          <p className="text-xs sm:text-sm text-[#374151] font-medium max-w-xs leading-relaxed">
            Catch the ingredients worth watching.
            <br />
            Let the good ones fall.
          </p>

          <div className="flex flex-col items-center gap-3 pt-2">
            <button
              onClick={startCountdown}
              onPointerDown={(e) => {
                e.stopPropagation();
                startCountdown();
              }}
              className="rounded-lg bg-[#FF6B00] px-8 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#E05E00] transition-colors border border-[#FF6B00] cursor-pointer"
            >
              START GAME
            </button>
            {onSkip && (
              <button
                onClick={onSkip}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onSkip();
                }}
                className="text-xs font-semibold text-[#374151] hover:text-[#111111] underline transition-colors cursor-pointer"
              >
                Skip to sign in →
              </button>
            )}
          </div>
        </div>
      )}

      {/* COUNTDOWN SCREEN */}
      {gameState === "countdown" && (
        <div className="absolute inset-0 flex items-center justify-center z-30 bg-[#82C3D9]/95">
          <div className="text-6xl font-extrabold text-[#FF6B00] font-mono animate-bounce">
            {countdownNum}
          </div>
        </div>
      )}

      {/* PLAYING STATE */}
      {gameState === "playing" && (
        <>
          {/* HUD Bar */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
            <div className="flex items-center gap-2 rounded-lg border border-[#2A2A2A] bg-[#111111] px-3.5 py-1.5 text-xs font-mono">
              <span className="text-[#A0A0A0]">TIME:</span>
              <span className="font-bold text-white">{timeLeft}s</span>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-[#2A2A2A] bg-[#111111] px-3.5 py-1.5 text-xs font-mono">
              <span className="text-[#A0A0A0]">SCORE:</span>
              <span className="font-bold text-[#FF6B00]">{score}</span>
            </div>
          </div>

          {/* Falling 2D Flat Vector Food Items */}
          {activeItems.map((item) => (
            <div
              key={item.id}
              ref={(el) => {
                if (el) itemDomRefs.current.set(item.id, el);
                else itemDomRefs.current.delete(item.id);
              }}
              style={{
                transform: `translate3d(${(item.xPercent / 100) * (containerRef.current?.clientWidth || 600)}px, ${item.yPx}px, 0) rotate(${item.rotation}deg)`,
              }}
              className="absolute top-0 left-0 w-10 h-10 sm:w-11 sm:h-11 pointer-events-none"
              title={item.item.name}
            >
              {FOOD_SVGS[item.item.id] || item.item.emoji}
            </div>
          ))}

          {/* Floating Score Toasts */}
          {feedbacks.map((f) => (
            <div
              key={f.id}
              style={{
                transform: `translate3d(${f.x}px, ${f.y}px, 0)`,
              }}
              className="absolute top-0 left-0 z-30 pointer-events-none text-sm font-extrabold tracking-wider"
            >
              <span
                className="px-2.5 py-1 rounded-md border bg-[#111111] font-mono"
                style={{ borderColor: f.color, color: f.color }}
              >
                {f.text}
              </span>
            </div>
          ))}
        </>
      )}

      {/* POLISHED END SCREEN */}
      {gameState === "ended" && (
        <div className="absolute inset-0 flex items-center justify-center p-4 z-30 bg-[#82C3D9]/95">
          <div className="w-full max-w-sm rounded-2xl border border-[#2A2A2A]/20 bg-[#111111] p-6 text-center space-y-4">
            <div className="space-y-1">
              <h3 className="text-2xl font-extrabold text-white uppercase tracking-tight">
                {score >= 60 ? "NICE CATCH!" : score >= 30 ? "GOOD EYE!" : "GAME COMPLETE"}
              </h3>
              <div className="text-[11px] font-bold text-[#A0A0A0] uppercase tracking-widest">
                YOUR SCORE
              </div>
            </div>

            <div className="flex items-baseline justify-center gap-1.5">
              <span className="text-5xl font-extrabold text-[#FF6B00] font-mono tracking-tight">
                {displayScore}
              </span>
              <span className="text-xs font-bold text-[#A0A0A0] uppercase tracking-wider">
                POINTS
              </span>
            </div>

            {caughtIds.length > 0 && (
              <div className="py-2 border-y border-[#2A2A2A] flex items-center justify-center gap-2 flex-wrap">
                {Array.from(new Set(caughtIds)).map((id, idx) => (
                  <div key={idx} className="w-7 h-7">
                    {FOOD_SVGS[id]}
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-[#A0A0A0] leading-relaxed">
              {score >= 60 ? "Great eye." : score >= 30 ? "Nice work." : "Good start."}
            </p>

            <div className="space-y-2.5 pt-1">
              <button
                onClick={startCountdown}
                className="w-full rounded-lg bg-[#FF6B00] py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#E05E00] transition-colors border border-[#FF6B00] cursor-pointer"
              >
                PLAY AGAIN
              </button>

              {onSkip && (
                <button
                  onClick={onSkip}
                  className="text-xs text-[#A0A0A0] hover:text-white font-medium transition-colors block w-full pt-1"
                >
                  Sign in to continue →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
