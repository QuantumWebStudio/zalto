import Link from "next/link";
import { FolderOpen } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { DeleteProjectButton } from "@/components/DeleteProjectButton";
import { listPosts, listProjects } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const projects = await listProjects();
  const doneCounts = await Promise.all(
    projects.map(async (project) => {
      const posts = await listPosts(project.id);
      return posts.filter((p) => p.status === "done").length;
    })
  );

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-12">
        <h1 className="animate-fade-in-up mb-1 font-display text-3xl font-semibold tracking-tight text-ink">
          History
        </h1>
        <p className="animate-fade-in-up mb-8 text-ink-soft">
          Every blog generated on this server — shareable with anyone, on any device.
        </p>

        {projects.length === 0 && (
          <div className="animate-fade-in-up flex flex-col items-center rounded-2xl border border-dashed border-line py-20 text-center">
            <FolderOpen className="mb-3 h-8 w-8 text-ink-soft/50" aria-hidden />
            <p className="font-medium text-ink">No projects yet</p>
            <p className="mt-1 max-w-xs text-sm text-ink-soft">
              Build your first branded blog and it&apos;ll show up here.
            </p>
            <Link
              href="/"
              className="btn-glow mt-5 rounded-lg bg-gradient-to-r from-accent to-accent-2 px-4 py-2 text-sm font-semibold text-white"
            >
              Build a blog
            </Link>
          </div>
        )}

        {projects.length > 0 && (
          <ol className="animate-fade-in-up flex flex-col gap-3">
            {projects.map((project, i) => (
              <li
                key={project.id}
                className="card-lift flex items-center justify-between gap-4 rounded-xl border border-line bg-paper-raised px-5 py-4"
              >
                <Link
                  href={`/project/${project.id}`}
                  className="group flex min-w-0 flex-1 items-center gap-3"
                >
                  {project.logoDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.logoDataUrl}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-lg border border-line object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white shadow-md transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundColor: project.brandColor }}
                    >
                      {project.companyName.trim().charAt(0).toUpperCase() || "?"}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink group-hover:underline">
                      {project.companyName}
                    </p>
                    <p className="flex items-center gap-2 text-xs text-ink-soft">
                      <span>{doneCounts[i]} posts</span>
                      <span>·</span>
                      <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                      <span className="font-mono">{project.brandColor.toUpperCase()}</span>
                    </p>
                  </div>
                </Link>

                <DeleteProjectButton projectId={project.id} companyName={project.companyName} />
              </li>
            ))}
          </ol>
        )}
      </main>
    </div>
  );
}
