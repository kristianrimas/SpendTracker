"use client";

import { cn } from "@/lib/utils";

type AppHeaderProps = {
  className?: string;
};

const getCurrentMonth = () => {
  return new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

export function AppHeader({ className }: AppHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40",
        "bg-white/70 dark:bg-zinc-950/70",
        "backdrop-blur-xl backdrop-saturate-150",
        "border-b border-zinc-100 dark:border-zinc-800/50",
        className
      )}
    >
      <div className="max-w-lg mx-auto px-5 py-4">
        <div className="flex items-baseline gap-3">
          {/* App name with subtle gradient */}
          <h1
            className={cn(
              "text-xl font-semibold tracking-tight",
              "text-zinc-900 dark:text-zinc-50"
            )}
          >
            Spend
            <span className="text-zinc-400 dark:text-zinc-500">Tracker</span>
          </h1>

          {/* Month indicator pill */}
          <span
            className={cn(
              "px-2.5 py-0.5 rounded-full",
              "text-xs font-medium",
              "bg-zinc-100 dark:bg-zinc-800",
              "text-zinc-500 dark:text-zinc-400",
              "border border-zinc-200/50 dark:border-zinc-700/50"
            )}
          >
            {getCurrentMonth()}
          </span>
        </div>
      </div>

      {/* Subtle bottom shadow gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-200/50 dark:via-zinc-700/30 to-transparent" />
    </header>
  );
}
