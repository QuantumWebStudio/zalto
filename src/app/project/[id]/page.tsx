"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, FileText, RefreshCw } from "lucide-react";
import { BrandedLayout } from "@/components/BrandedLayout";
import { fetchProjectWithPosts, generatePost } from "@/lib/api";
import { slugify, uniqueSlug } from "@/lib/slug";
import { estimateReadingMinutes } from "@/lib/text";
import type { Post, Project } from "@/lib/types";

export default function ProjectDashboardPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;

  const [project, setProject] = useState<Project | null | undefined>(undefined);
  const [posts, setPosts] = useState<Post[]>([]);
  const [generatingSlugs, setGeneratingSlugs] = useState<Set<string>>(new Set());

  const refetch = useCallback(async () => {
    const data = await fetchProjectWithPosts(projectId);
    if (!data) {
      setProject(null);
      return;
    }
    setProject(data.project);
    setPosts(data.posts);
  }, [projectId]);

  useEffect(() => {
    let cancelled = false;
    fetchProjectWithPosts(projectId).then((data) => {
      if (cancelled) return;
      if (!data) {
        setProject(null);
        return;
      }
      setProject(data.project);
      setPosts(data.posts);
    });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  async function generateForTopic(topic: string, order: number, slug: string) {
    if (!project) return;

    setGeneratingSlugs((prev) => new Set(prev).add(slug));
    await generatePost(project.id, { topic, slug, order });
    setGeneratingSlugs((prev) => {
      const next = new Set(prev);
      next.delete(slug);
      return next;
    });
    await refetch();
  }

  if (project === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center py-24 text-ink-soft">Loading…</div>
    );
  }

  if (project === null) {
    return (
      <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink">Project not found</h1>
        <p className="mt-2 text-ink-soft">
          This project doesn&apos;t exist, or may have been deleted.
        </p>
        <Link
          href="/"
          className="btn-glow mt-6 rounded-lg bg-gradient-to-r from-accent to-accent-2 px-4 py-2 text-sm font-semibold text-white"
        >
          Build a new blog
        </Link>
      </div>
    );
  }

  const doneCount = posts.filter((p) => p.status === "done").length;
  const existingTopics = new Set(posts.map((p) => p.topic));
  const claimedSlugs = new Set(posts.map((p) => p.slug));
  const missingTopics = project.topics
    .map((topic, index) => ({ topic, order: index }))
    .filter(({ topic }) => !existingTopics.has(topic))
    .map(({ topic, order }) => {
      const slug = uniqueSlug(slugify(topic), claimedSlugs);
      claimedSlugs.add(slug);
      return { topic, order, slug };
    });

  return (
    <BrandedLayout project={project}>
      <div
        className="animate-fade-in-up mb-8 flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-black/5 px-6 py-5"
        style={{ backgroundColor: "var(--brand-soft)" }}
      >
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--brand-deep)" }}>
            Dashboard
          </p>
          <h1 className="font-display text-2xl font-semibold text-neutral-900 sm:text-3xl">
            {doneCount} post{doneCount === 1 ? "" : "s"}
          </h1>
        </div>
        <p className="shrink-0 text-xs text-neutral-700">
          Created {new Date(project.createdAt).toLocaleDateString()}
        </p>
      </div>

      <ol className="animate-fade-in-up flex flex-col gap-3">
        {posts.map((post) => {
          const isGenerating = generatingSlugs.has(post.slug);
          return (
            <li
              key={post.id}
              className="card-lift flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-paper-raised px-5 py-4 sm:flex-nowrap sm:gap-4"
            >
              {isGenerating ? (
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: "var(--brand-soft)" }}
                  >
                    <RefreshCw className="h-5 w-5 animate-spin text-[var(--brand)]" aria-hidden />
                  </span>
                  <p className="truncate font-medium text-ink-soft">{post.topic}</p>
                </div>
              ) : post.status === "error" ? (
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 dark:bg-red-950">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{post.topic}</p>
                    <p className="truncate text-sm text-red-600 dark:text-red-400">{post.errorMessage}</p>
                  </div>
                </div>
              ) : (
                <Link
                  href={`/project/${project.id}/${post.slug}`}
                  className="group flex min-w-0 flex-1 items-center gap-3"
                >
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-105"
                    style={{ backgroundColor: "var(--brand-soft)" }}
                  >
                    <FileText className="h-5 w-5 text-[var(--brand)]" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink group-hover:underline">
                      {post.title}
                    </p>
                    <p className="text-sm text-ink-soft">
                      {post.wordCount.toLocaleString()} words ·{" "}
                      {estimateReadingMinutes(post.wordCount)} min read
                    </p>
                  </div>
                </Link>
              )}

              {!isGenerating && post.status === "error" && (
                <button
                  type="button"
                  onClick={() => generateForTopic(post.topic, post.order, post.slug)}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink-soft hover:border-[var(--brand)] hover:text-[var(--brand)]"
                >
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                  Retry
                </button>
              )}
            </li>
          );
        })}

        {missingTopics.map(({ topic, order, slug }) => {
          const isGenerating = generatingSlugs.has(slug);
          return (
            <li
              key={slug}
              className="flex items-center justify-between gap-4 rounded-xl border border-dashed border-line px-5 py-4"
            >
              <p className="min-w-0 flex-1 truncate text-ink-soft">{topic}</p>
              <button
                type="button"
                onClick={() => generateForTopic(topic, order, slug)}
                disabled={isGenerating}
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm font-medium text-ink-soft hover:border-[var(--brand)] hover:text-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isGenerating ? "animate-spin" : ""}`} aria-hidden />
                {isGenerating ? "Generating…" : "Generate"}
              </button>
            </li>
          );
        })}
      </ol>

      {posts.length === 0 && missingTopics.length === 0 && (
        <p className="py-16 text-center text-ink-soft">No posts yet for this project.</p>
      )}
    </BrandedLayout>
  );
}
