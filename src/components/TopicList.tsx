"use client";

import { Plus, Trash2 } from "lucide-react";
import { MAX_TOPICS } from "@/lib/validation";

interface TopicListProps {
  topics: string[];
  onChange: (topics: string[]) => void;
  itemErrors?: Record<number, string>;
  generalError?: string;
}

export function TopicList({ topics, onChange, itemErrors, generalError }: TopicListProps) {
  function updateTopic(index: number, value: string) {
    const next = [...topics];
    next[index] = value;
    onChange(next);
  }

  function addTopic() {
    if (topics.length >= MAX_TOPICS) return;
    onChange([...topics, ""]);
  }

  function removeTopic(index: number) {
    if (topics.length <= 1) return;
    onChange(topics.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label className="block text-sm font-medium text-ink">Blog topics</label>
        <span className="font-mono text-xs text-ink-soft">
          {topics.length}/{MAX_TOPICS}
        </span>
      </div>

      <ol className="flex flex-col gap-2">
        {topics.map((topic, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="mt-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft font-mono text-[11px] font-medium text-accent">
              {index + 1}
            </span>
            <div className="flex-1">
              <input
                type="text"
                value={topic}
                placeholder={`Topic ${index + 1}, e.g. "How we cut onboarding time in half"`}
                onChange={(e) => updateTopic(index, e.target.value)}
                aria-invalid={Boolean(itemErrors?.[index])}
                className="w-full rounded-lg border border-line bg-paper-raised px-3 py-2.5 text-sm text-ink outline-none focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/10"
              />
              {itemErrors?.[index] && (
                <p className="mt-1 text-xs text-red-600">{itemErrors[index]}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeTopic(index)}
              disabled={topics.length <= 1}
              aria-label={`Remove topic ${index + 1}`}
              className="mt-1.5 rounded-md p-1.5 text-ink-soft transition-colors hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={addTopic}
        disabled={topics.length >= MAX_TOPICS}
        className="mt-3 flex items-center gap-1.5 rounded-lg border border-dashed border-line px-3 py-2 text-sm font-medium text-accent hover:border-accent hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Add topic
      </button>

      {generalError && <p className="mt-2 text-sm text-red-600">{generalError}</p>}
    </div>
  );
}
