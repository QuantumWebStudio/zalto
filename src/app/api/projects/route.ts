import { NextResponse } from "next/server";
import { createProject, listProjects } from "@/lib/db";
import { generateId } from "@/lib/slug";
import { MAX_TOPICS } from "@/lib/validation";
import type { Project } from "@/lib/types";

export const dynamic = "force-dynamic";

interface CreateProjectBody {
  companyName?: unknown;
  brandColor?: unknown;
  logoDataUrl?: unknown;
  topics?: unknown;
}

export async function GET() {
  const projects = await listProjects();
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  let body: CreateProjectBody;
  try {
    body = (await request.json()) as CreateProjectBody;
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const companyName = typeof body.companyName === "string" ? body.companyName.trim() : "";
  const brandColor = typeof body.brandColor === "string" ? body.brandColor.trim() : "";
  const logoDataUrl = typeof body.logoDataUrl === "string" ? body.logoDataUrl : null;
  const topics = Array.isArray(body.topics)
    ? body.topics
        .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
        .map((t) => t.trim())
        .slice(0, MAX_TOPICS)
    : [];

  if (!companyName || !brandColor || topics.length === 0) {
    return NextResponse.json(
      { error: "companyName, brandColor, and at least one topic are required." },
      { status: 400 }
    );
  }

  const project: Project = {
    id: generateId(),
    companyName,
    brandColor,
    logoDataUrl,
    topics,
    createdAt: new Date().toISOString(),
  };

  await createProject(project);
  return NextResponse.json({ project }, { status: 201 });
}
