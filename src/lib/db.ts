import { connectToDatabase } from "./mongodb";
import { PostModel, ProjectModel } from "./models";
import type { Post, Project } from "./types";

/**
 * Server-only data layer, backed by MongoDB (Atlas). This is what makes
 * generated blogs actually "hosted" — content lives in a real database and
 * renders for any visitor, not just the browser that created it (which is
 * what localStorage gave us, and what a single JSON file gave us before this
 * — both were fine for a take-home, this is the production-shaped version).
 *
 * Every function here returns/accepts plain `Project`/`Post` objects (never
 * Mongoose documents), so nothing outside this file needs to know MongoDB is
 * involved — swapping providers again later only means editing this module.
 */

// .lean() gives back a plain object shaped like Project/Post plus Mongo's
// own _id/__v — pick out just the fields our app-wide type declares.
function toProject(o: Project): Project {
  return {
    id: o.id,
    companyName: o.companyName,
    brandColor: o.brandColor,
    logoDataUrl: o.logoDataUrl ?? null,
    topics: o.topics ?? [],
    createdAt: o.createdAt,
  };
}

function toPost(o: Post): Post {
  return {
    id: o.id,
    projectId: o.projectId,
    slug: o.slug,
    topic: o.topic,
    order: o.order,
    title: o.title ?? "",
    content: o.content ?? "",
    wordCount: o.wordCount ?? 0,
    status: o.status,
    errorMessage: o.errorMessage ?? null,
    createdAt: o.createdAt,
  };
}

export async function listProjects(): Promise<Project[]> {
  await connectToDatabase();
  const docs = await ProjectModel.find().sort({ createdAt: -1 }).lean();
  return docs.map(toProject);
}

export async function getProject(id: string): Promise<Project | null> {
  await connectToDatabase();
  const doc = await ProjectModel.findOne({ id }).lean();
  return doc ? toProject(doc) : null;
}

export async function createProject(project: Project): Promise<Project> {
  await connectToDatabase();
  await ProjectModel.create(project);
  return project;
}

export async function deleteProject(id: string): Promise<void> {
  await connectToDatabase();
  await Promise.all([ProjectModel.deleteOne({ id }), PostModel.deleteMany({ projectId: id })]);
}

export async function listPosts(projectId: string): Promise<Post[]> {
  await connectToDatabase();
  const docs = await PostModel.find({ projectId }).sort({ order: 1 }).lean();
  return docs.map(toPost);
}

export async function getPost(projectId: string, slug: string): Promise<Post | null> {
  await connectToDatabase();
  const doc = await PostModel.findOne({ projectId, slug }).lean();
  return doc ? toPost(doc) : null;
}

export async function upsertPost(post: Post): Promise<Post> {
  await connectToDatabase();
  await PostModel.findOneAndUpdate({ projectId: post.projectId, id: post.id }, post, {
    upsert: true,
    setDefaultsOnInsert: true,
  });
  return post;
}
