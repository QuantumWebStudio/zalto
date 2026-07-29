import type { Post, Project } from "./types";

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function parseJson(response: Response): Promise<Record<string, unknown>> {
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

interface CreateProjectInput {
  companyName: string;
  brandColor: string;
  logoDataUrl: string | null;
  topics: string[];
}

export async function createProject(input: CreateProjectInput): Promise<ApiResult<Project>> {
  try {
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await parseJson(response);
    if (!response.ok) {
      return { ok: false, error: (data.error as string) || `Request failed (${response.status}).` };
    }
    return { ok: true, data: data.project as Project };
  } catch {
    return { ok: false, error: "Network error reaching the server. Check your connection and retry." };
  }
}

interface GenerateInput {
  topic: string;
  slug: string;
  order: number;
}

/** Always returns the persisted post when one exists, even on failure (status "error"). */
export async function generatePost(
  projectId: string,
  input: GenerateInput
): Promise<{ post: Post | null; error: string | null }> {
  try {
    const response = await fetch(`/api/projects/${projectId}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = await parseJson(response);
    const post = (data.post as Post | undefined) ?? null;
    if (!response.ok) {
      return { post, error: (data.error as string) || `Request failed (${response.status}).` };
    }
    return { post, error: null };
  } catch {
    return { post: null, error: "Network error reaching the server. Check your connection and retry." };
  }
}

export async function fetchProjectWithPosts(
  id: string
): Promise<{ project: Project; posts: Post[] } | null> {
  const response = await fetch(`/api/projects/${id}`, { cache: "no-store" });
  if (!response.ok) return null;
  const data = (await response.json()) as { project: Project; posts: Post[] };
  return data;
}

export async function deleteProject(id: string): Promise<void> {
  await fetch(`/api/projects/${id}`, { method: "DELETE" });
}
