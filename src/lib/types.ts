export interface Project {
  id: string;
  companyName: string;
  brandColor: string;
  logoDataUrl: string | null;
  topics: string[];
  createdAt: string;
}

export type PostStatus = "queued" | "generating" | "done" | "error";

export interface Post {
  id: string;
  projectId: string;
  slug: string;
  topic: string;
  order: number;
  title: string;
  content: string;
  wordCount: number;
  status: PostStatus;
  errorMessage: string | null;
  createdAt: string;
}

export interface GenerateResponseBody {
  title: string;
  content: string;
  wordCount: number;
}

export interface GenerateErrorBody {
  error: string;
}
