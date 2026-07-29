"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Section } from "@/lib/text";

export function TableOfContents({ sections }: { sections: Section[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
    );

    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [sections]);

  if (sections.length === 0) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="rounded-xl border border-line p-4 text-sm lg:rounded-none lg:border-0 lg:p-0"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wide text-ink-soft lg:cursor-default"
      >
        On this page
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-ink-soft transition-transform lg:hidden ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>
      <ul
        className={`mt-3 space-y-2 border-l border-line ${open ? "block" : "hidden"} lg:block`}
      >
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              onClick={() => setOpen(false)}
              className={`-ml-px block border-l-2 py-0.5 pl-3 transition-all duration-300 ${
                activeId === section.id
                  ? "translate-x-0.5 border-[var(--brand)] font-medium text-ink"
                  : "border-transparent text-ink-soft hover:translate-x-0.5 hover:text-ink"
              }`}
            >
              {section.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
