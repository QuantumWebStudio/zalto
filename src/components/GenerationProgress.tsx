"use client";

import { CheckCircle2, CircleDashed, Loader2, XCircle } from "lucide-react";
import type { PostStatus } from "@/lib/types";

export interface GenerationItem {
  topic: string;
  status: PostStatus;
  errorMessage: string | null;
}

const STATUS_LABEL: Record<PostStatus, string> = {
  queued: "Queued",
  generating: "Generating…",
  done: "Done",
  error: "Failed",
};

function StatusIcon({ status }: { status: PostStatus }) {
  switch (status) {
    case "done":
      return <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden />;
    case "error":
      return <XCircle className="h-5 w-5 text-red-600" aria-hidden />;
    case "generating":
      return <Loader2 className="h-5 w-5 animate-spin text-accent" aria-hidden />;
    default:
      return <CircleDashed className="h-5 w-5 text-ink-soft/50" aria-hidden />;
  }
}

export function GenerationProgress({ items }: { items: GenerationItem[] }) {
  const doneCount = items.filter((i) => i.status === "done" || i.status === "error").length;
  const progress = items.length === 0 ? 0 : Math.round((doneCount / items.length) * 100);

  return (
    <div className="rounded-2xl border border-line bg-paper-raised p-6 shadow-xl shadow-black/[0.03]">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-ink">Generating your blog</h2>
        <span className="font-mono text-xs text-ink-soft">
          {doneCount}/{items.length}
        </span>
      </div>

      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-accent-soft">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent via-accent-2 to-accent-3 transition-[width] duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ol className="flex flex-col gap-3">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">
              <StatusIcon status={item.status} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{item.topic}</p>
              <p
                className={`text-xs ${item.status === "error" ? "text-red-600" : "text-ink-soft"}`}
              >
                {item.status === "error" && item.errorMessage
                  ? item.errorMessage
                  : STATUS_LABEL[item.status]}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
