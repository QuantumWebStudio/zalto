import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { buildHeadingIdsByLine } from "@/lib/text";

/** A plain Server Component — no client JS needed to render the article body. */
export function Markdown({ content }: { content: string }) {
  const idsByLine = buildHeadingIdsByLine(content);

  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:scroll-mt-20 prose-a:text-[var(--brand)] prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-[var(--brand)] prose-blockquote:bg-[var(--brand-soft)]/50 prose-blockquote:py-1 prose-blockquote:not-italic prose-blockquote:text-neutral-800 prose-code:text-[var(--brand)]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ node, children, ...props }) => {
            const line = node?.position?.start.line;
            const id = line ? idsByLine.get(line) : undefined;
            return (
              <h2 id={id} className="flex items-center gap-3" {...props}>
                <span
                  className="h-6 w-1.5 shrink-0 rounded-full"
                  style={{ background: "linear-gradient(180deg, var(--brand), var(--brand-deep))" }}
                  aria-hidden
                />
                {children}
              </h2>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
