"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Mode = "competition" | "roulette" | "other";

export default function ExplorePage() {
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null);
  const router = useRouter();

  const modes = [
    {
      id: "competition" as Mode,
      title: "Competition Mode",
      description: "Go head-to-head with friends and climb the leaderboard. Best performance wins.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 7h10v10H7V7zm2 2h6v6H9V9z" />
        </svg>
      ),
      active: true,
    },
    {
      id: "roulette" as Mode,
      title: "Roulette Mode",
      description: "Spin the wheel and sing whatever it lands on. A wild, unpredictable karaoke experience.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-3a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9l3 3-3 3-3-3 3-3Z" />
        </svg>
      ),
      active: true,
    },
    {
      id: "other" as Mode,
      title: "Other",
      description: "More exciting modes are on the way. Stay tuned for future updates.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
      active: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <Link href="/" className="text-[#FF6B00] hover:underline text-sm mb-6 inline-block">
          &larr; Back to home
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Explore <span className="text-[#FF6B00]">Modes</span>
          </h1>
          <p className="mt-4 text-white/50 text-lg">
            Pick a game mode and take your karaoke to the next level.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modes.map((mode) => (
            <div
              key={mode.id}
              className={`relative flex flex-col gap-4 rounded-2xl border p-6 transition-all duration-200 cursor-pointer ${
                selectedMode === mode.id
                  ? "border-[#FF6B00] bg-[#FF6B00]/10 shadow-lg shadow-[#FF6B00]/20"
                  : "border-white/10 bg-[#1a1a1a] hover:border-white/30 hover:bg-[#222]"
              }`}
              onClick={() => setSelectedMode(mode.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#FF6B00]/15 text-[#FF6B00]">
                  {mode.icon}
                </div>
                {!mode.active && (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">
                    Coming Soon
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold">{mode.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed flex-1">{mode.description}</p>

              {mode.active ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (mode.id === "competition") {
                      router.push("/competition");
                    } else if (mode.id === "roulette") {
                      // Roulette page not yet built
                    }
                  }}
                  className="self-start mt-2 px-5 py-2.5 rounded-lg bg-[#FF6B00] text-white font-semibold text-sm hover:bg-[#e55f00] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Play Now
                </button>
              ) : (
                <span className="self-start mt-2 px-5 py-2.5 rounded-lg bg-white/5 text-white/40 text-sm font-semibold">
                  Coming Soon
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}