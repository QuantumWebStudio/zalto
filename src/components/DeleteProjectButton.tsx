"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Trash2, X } from "lucide-react";
import { deleteProject } from "@/lib/api";

export function DeleteProjectButton({
  projectId,
  companyName,
}: {
  projectId: string;
  companyName: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    await deleteProject(projectId);
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex shrink-0 items-center gap-1.5">
        <span className="text-xs text-ink-soft">Delete?</span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          aria-label="Confirm delete"
          className="rounded-md bg-red-600 p-1.5 text-white hover:bg-red-700 disabled:opacity-60"
        >
          <Check className="h-3.5 w-3.5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={isDeleting}
          aria-label="Cancel delete"
          className="rounded-md border border-line p-1.5 text-ink-soft hover:text-ink"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      aria-label={`Delete ${companyName}`}
      className="shrink-0 rounded-md p-2 text-ink-soft hover:text-red-600"
    >
      <Trash2 className="h-4 w-4" aria-hidden />
    </button>
  );
}
