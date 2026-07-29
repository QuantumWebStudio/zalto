import mongoose, { Schema } from "mongoose";
import type { Post, PostStatus, Project } from "./types";

const ProjectSchema = new Schema<Project>(
  {
    id: { type: String, required: true, unique: true },
    companyName: { type: String, required: true },
    brandColor: { type: String, required: true },
    logoDataUrl: { type: String, default: null },
    topics: { type: [String], default: [] },
    createdAt: { type: String, required: true },
  },
  { versionKey: false }
);

const PostSchema = new Schema<Post>(
  {
    id: { type: String, required: true },
    projectId: { type: String, required: true, index: true },
    slug: { type: String, required: true },
    topic: { type: String, required: true },
    order: { type: Number, required: true },
    title: { type: String, default: "" },
    content: { type: String, default: "" },
    wordCount: { type: Number, default: 0 },
    status: { type: String, required: true },
    errorMessage: { type: String, default: null },
    createdAt: { type: String, required: true },
  },
  { versionKey: false }
);
PostSchema.index({ projectId: 1, id: 1 }, { unique: true });

// Re-registering a model on every hot-reload in dev throws
// "OverwriteModelError" — reuse the compiled model if it already exists.
export const ProjectModel =
  (mongoose.models.Project as mongoose.Model<Project>) ||
  mongoose.model<Project>("Project", ProjectSchema);

export const PostModel =
  (mongoose.models.Post as mongoose.Model<Post>) || mongoose.model<Post>("Post", PostSchema);

export type { Post, PostStatus, Project };
