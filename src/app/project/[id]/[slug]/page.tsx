import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock, FileText } from "lucide-react";
import { BrandedLayout } from "@/components/BrandedLayout";
import { Markdown } from "@/components/Markdown";
import { TableOfContents } from "@/components/TableOfContents";
import { ScrollToHash } from "@/components/ScrollToHash";
import { getProject, listPosts } from "@/lib/db";
import { estimateReadingMinutes, extractSections } from "@/lib/text";
import type { Post, Project } from "@/lib/types";

export const dynamic = "force-dynamic";

interface PageParams {
  id: string;
  slug: string;
}

interface Loaded {
  project: Project | null;
  post: Post | null;
  prev: Post | null;
  next: Post | null;
}

async function loadPost(id: string, slug: string): Promise<Loaded> {
  const project = await getProject(id);
  if (!project) return { project: null, post: null, prev: null, next: null };

  const doneOnly = (await listPosts(id))
    .filter((p) => p.status === "done")
    .sort((a, b) => a.order - b.order);
  const index = doneOnly.findIndex((p) => p.slug === slug);
  const post = index >= 0 ? doneOnly[index] : null;
  const prev = index > 0 ? doneOnly[index - 1] : null;
  const next = post && index < doneOnly.length - 1 ? doneOnly[index + 1] : null;

  return { project, post, prev, next };
}

function toDescription(markdown: string): string {
  return markdown
    .replace(/[#>*_`[\]()-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { id, slug } = await params;
  const { project, post } = await loadPost(id, slug);

  if (!project || !post) {
    return { title: "Post not found" };
  }

  const description = toDescription(post.content);

  return {
    title: `${post.title} · ${project.companyName}`,
    description,
    openGraph: {
      title: post.title,
      description,
      type: "article",
      siteName: `${project.companyName} blog`,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
    },
  };
}

export default async function PostPage({ params }: { params: Promise<PageParams> }) {
  const { id: projectId, slug } = await params;
  const { project, post, prev, next } = await loadPost(projectId, slug);

  if (!project) {
    return (
      <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink">Project not found</h1>
        <Link
          href="/"
          className="btn-glow mt-6 rounded-lg bg-gradient-to-r from-accent to-accent-2 px-4 py-2 text-sm font-semibold text-white"
        >
          Build a new blog
        </Link>
      </div>
    );
  }

  if (!post) {
    return (
      <BrandedLayout project={project}>
        <div className="flex flex-col items-center py-16 text-center">
          <FileText className="mb-3 h-8 w-8 text-ink-soft/50" aria-hidden />
          <h1 className="font-display text-xl font-semibold text-ink">Post not found</h1>
          <p className="mt-1 text-ink-soft">This post doesn&apos;t exist yet, or failed to generate.</p>
          <Link
            href={`/project/${project.id}`}
            className="btn-glow mt-6 rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-[var(--on-brand)]"
          >
            Back to dashboard
          </Link>
        </div>
      </BrandedLayout>
    );
  }

  const sections = extractSections(post.content);

  return (
    <BrandedLayout project={project} wide>
      <ScrollToHash />
      <Link
        href={`/project/${project.id}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Dashboard
      </Link>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start lg:gap-12">
        <aside className="mb-8 lg:order-2 lg:sticky lg:top-20 lg:mb-0">
          <TableOfContents sections={sections} />
        </aside>

        <div className="min-w-0 lg:order-1">
          <article>
            <p
              className="mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
              style={{ backgroundColor: "var(--brand-soft)", color: "var(--brand-deep)" }}
            >
              {post.topic}
            </p>
            <h1 className="mb-4 font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
              {post.title}
            </h1>
            <div className="mb-8 flex items-center gap-3 text-sm text-ink-soft">
              <span
                className="flex items-center gap-1.5 rounded-full px-3 py-1 font-medium"
                style={{ backgroundColor: "var(--brand-soft)", color: "var(--brand-deep)" }}
              >
                <Clock className="h-3.5 w-3.5" aria-hidden />
                {estimateReadingMinutes(post.wordCount)} min read
              </span>
              <span>{post.wordCount.toLocaleString()} words</span>
            </div>

            <Markdown content={post.content} />
          </article>

          <nav className="mt-12 grid grid-cols-1 gap-3 border-t border-line pt-6 sm:grid-cols-2">
            {prev ? (
              <Link
                href={`/project/${project.id}/${prev.slug}`}
                className="card-lift rounded-xl border border-line px-4 py-3 hover:border-[var(--brand)]"
              >
                <span className="flex items-center gap-1.5 text-xs text-ink-soft">
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                  Previous
                </span>
                <span className="mt-1 block truncate font-medium text-ink">
                  {prev.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/project/${project.id}/${next.slug}`}
                className="card-lift rounded-xl border border-line px-4 py-3 text-right hover:border-[var(--brand)]"
              >
                <span className="flex items-center justify-end gap-1.5 text-xs text-ink-soft">
                  Next
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </span>
                <span className="mt-1 block truncate font-medium text-ink">
                  {next.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </div>
      </div>
    </BrandedLayout>
  );
}
