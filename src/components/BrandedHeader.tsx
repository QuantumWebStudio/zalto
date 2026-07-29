"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { Project } from "@/lib/types";

const REVEAL_THRESHOLD_PX = 80;
const DIRECTION_DEADZONE_PX = 4;

/**
 * Hides on scroll-down, reappears on scroll-up — keeps the header out of the
 * way while reading long posts without losing quick access to nav. Always
 * shown near the top of the page regardless of direction.
 */
export function BrandedHeader({ project }: { project: Project }) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    let ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY.current;

        if (y < REVEAL_THRESHOLD_PX) {
          setHidden(false);
        } else if (delta > DIRECTION_DEADZONE_PX) {
          setHidden(true);
        } else if (delta < -DIRECTION_DEADZONE_PX) {
          setHidden(false);
        }

        lastY.current = y;
        ticking = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const initial = project.companyName.trim().charAt(0).toUpperCase() || "?";

  return (
    <header
      className={`glass-panel sticky top-0 z-20 border-b border-line transition-transform duration-300 ease-out ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-6 py-4">
        <Link href={`/project/${project.id}`} className="group flex min-w-0 items-center gap-3">
          {project.logoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.logoDataUrl}
              alt={`${project.companyName} logo`}
              className="h-10 w-10 shrink-0 rounded-xl border border-line bg-white object-contain p-1 shadow-sm transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base font-bold shadow-sm transition-transform duration-300 group-hover:scale-105"
              style={{
                background: "linear-gradient(135deg, var(--brand), var(--brand-deep))",
                color: "var(--on-brand)",
                boxShadow: "0 8px 20px -8px var(--brand-glow)",
              }}
              aria-hidden
            >
              {initial}
            </span>
          )}
          <span className="truncate font-display text-lg font-bold tracking-tight text-ink sm:text-xl">
            {project.companyName}
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-1">
          <Link
            href="/history"
            className="text-sm font-medium text-ink-soft hover:text-ink"
          >
            All projects
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
