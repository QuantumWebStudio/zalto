import Link from "next/link";
import { History, Layers } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function SiteHeader() {
  return (
    <header className="glass-panel sticky top-0 z-20 border-b border-line/70">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="group flex items-center gap-2.5 text-ink">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent via-accent-2 to-accent-3 text-white shadow-md shadow-accent/30 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
            <Layers className="h-4 w-4" aria-hidden />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">Zalto</span>
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/history"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft hover:bg-black/5 hover:text-ink dark:hover:bg-white/10"
          >
            <History className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">History</span>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
