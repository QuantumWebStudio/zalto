import { NextResponse } from "next/server";
import { getProject, upsertPost } from "@/lib/db";
import { generatePost } from "@/lib/groq";
import type { Post } from "@/lib/types";

export const dynamic = "force-dynamic";

interface GenerateBody {
  topic?: unknown;
  slug?: unknown;
  order?: unknown;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;

  const project = await getProject(projectId);
  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  let body: GenerateBody;
  try {
    body = (await request.json()) as GenerateBody;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  const order = typeof body.order === "number" ? body.order : 0;

  if (!topic || !slug) {
    return NextResponse.json({ error: "topic and slug are required." }, { status: 400 });
  }

  const outcome = await generatePost(topic, project.companyName);
  const createdAt = new Date().toISOString();

  if (outcome.ok) {
    const post: Post = {
      id: slug,
      projectId,
      slug,
      topic,
      order,
      title: outcome.post.title,
      content: outcome.post.content,
      wordCount: outcome.post.wordCount,
      status: "done",
      errorMessage: null,
      createdAt,
    };
    await upsertPost(post);
    return NextResponse.json({ post });
  }

  const post: Post = {
    id: slug,
    projectId,
    slug,
    topic,
    order,
    title: "",
    content: "",
    wordCount: 0,
    status: "error",
    errorMessage: outcome.error,
    createdAt,
  };
  await upsertPost(post);
  return NextResponse.json({ post, error: outcome.error }, { status: outcome.status });
}
