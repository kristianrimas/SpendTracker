"use client";

import { Home, Plus, Clock, TrendingUp, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "overview" | "add" | "history" | "insights" | "settings";

type BottomNavProps = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
};

const tabs = [
  { id: "overview" as const, label: "Overview", icon: Home },
  { id: "add" as const, label: "Add", icon: Plus },
  { id: "history" as const, label: "History", icon: Clock },
  { id: "insights" as const, label: "Insights", icon: TrendingUp },
  { id: "settings" as const, label: "Settings", icon: Settings },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "pb-[env(safe-area-inset-bottom,0px)]",
        "bg-white/80 dark:bg-zinc-900/80",
        "backdrop-blur-xl backdrop-saturate-150",
        "border-t border-zinc-200/50 dark:border-zinc-800/50"
      )}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex flex-col items-center justify-center",
                "w-14 h-14 rounded-2xl",
                "transition-all duration-200 ease-out",
                "active:scale-95",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2",
                isActive
                  ? "text-zinc-900 dark:text-zinc-50"
                  : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
              )}
            >
              {/* Active background pill */}
              <span
                className={cn(
                  "absolute inset-1 rounded-xl transition-all duration-300 ease-out",
                  isActive
                    ? "bg-zinc-100 dark:bg-zinc-800 scale-100 opacity-100"
                    : "bg-transparent scale-90 opacity-0"
                )}
              />

              {/* Icon container */}
              <span
                className={cn(
                  "relative z-10 flex items-center justify-center",
                  "w-6 h-6 mb-0.5",
                  "transition-transform duration-200",
                  isActive && "transform scale-110"
                )}
              >
                <Icon
                  className={cn(
                    "w-[22px] h-[22px] transition-all duration-200",
                    isActive ? "stroke-[2.5px]" : "stroke-[1.75px]"
                  )}
                />
              </span>

              {/* Label */}
              <span
                className={cn(
                  "relative z-10 text-[10px] font-medium tracking-wide",
                  "transition-all duration-200",
                  isActive ? "opacity-100" : "opacity-70"
                )}
              >
                {tab.label}
              </span>

              {/* Tap ripple effect */}
              <span
                className={cn(
                  "absolute inset-0 rounded-xl",
                  "bg-zinc-900/5 dark:bg-white/5",
                  "opacity-0 scale-50",
                  "transition-all duration-150",
                  "active:opacity-100 active:scale-100"
                )}
              />
            </button>
          );
        })}
      </div>

      {/* Subtle top highlight line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-300/30 dark:via-zinc-600/20 to-transparent" />
    </nav>
  );
}
