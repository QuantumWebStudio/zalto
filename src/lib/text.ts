const WORDS_PER_MINUTE = 225;

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function estimateReadingMinutes(wordCount: number): number {
  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
}

interface ParsedMarkdown {
  title: string;
  body: string;
}

/**
 * Splits a leading `# Title` line from the rest of a markdown document.
 * Falls back to a generic title if the model didn't produce one.
 */
export function extractTitle(markdown: string, fallbackTitle: string): ParsedMarkdown {
  const lines = markdown.replace(/^﻿/, "").trimStart().split("\n");
  const firstLine = lines[0]?.trim() ?? "";
  const titleMatch = firstLine.match(/^#\s+(.+)$/);

  if (titleMatch) {
    return {
      title: titleMatch[1].trim(),
      body: lines.slice(1).join("\n").trim(),
    };
  }

  return { title: fallbackTitle, body: markdown.trim() };
}

/** Strips code fences the model may have added despite instructions not to. */
export function stripCodeFences(markdown: string): string {
  return markdown.replace(/```[a-z]*\n?/gi, "").trim();
}

/** Turns heading text into a URL-safe anchor id, e.g. for in-page TOC links. */
export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export interface Section {
  id: string;
  title: string;
}

interface HeadingLine extends Section {
  /** 1-indexed line number, matching remark/mdast `node.position.start.line`. */
  line: number;
}

function collectHeadingLines(markdown: string): HeadingLine[] {
  const seen = new Map<string, number>();
  const headings: HeadingLine[] = [];

  markdown.split("\n").forEach((rawLine, index) => {
    const title = rawLine.match(/^##\s+(.+)$/)?.[1]?.trim();
    if (!title) return;

    const base = slugify(title);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    headings.push({ id: count ? `${base}-${count}` : base, title, line: index + 1 });
  });

  return headings;
}

/** Extracts top-level (`##`) headings from markdown for a table of contents. */
export function extractSections(markdown: string): Section[] {
  return collectHeadingLines(markdown).map(({ id, title }) => ({ id, title }));
}

/**
 * Maps each heading's source line number to the same id `extractSections` would
 * assign it, so a markdown renderer can attach matching anchor ids without
 * relying on a mutable per-render counter (which React's Strict Mode double-
 * invocation of render-phase components would throw off).
 */
export function buildHeadingIdsByLine(markdown: string): Map<number, string> {
  return new Map(collectHeadingLines(markdown).map(({ line, id }) => [line, id]));
}
