# Zalto

Zalto turns a company's branding (name, logo, brand color) and up to 10 blog
topics into a themed, multi-page blog site. It satisfies the take-home
assignment's core requirement: a tool that generates a hosted, multi-page,
on-brand blog from minimal input, and supports **multiple use cases** — it's a
reusable, multi-tenant generator (any company/topics combo), not a single
hardcoded demo, evidenced by the `/history` page listing every project
anyone has generated on this deployment.

Every generated post is a real, server-rendered page — anyone with the link
can open it, on any device, without having built it themselves. Sharing a
link also produces a branded preview card (logo, brand color, post title) on
Slack/Twitter/iMessage, generated on the fly per post.

## Tech stack & why

| Choice | Reason |
|---|---|
| **Next.js (App Router)** | One project serves the marketing/build UI, the dynamic branded routes (`/project/[id]`, `/project/[id]/[slug]`), and the server-side API routes that hide the Groq key and DB connection — no separate backend needed. File-based dynamic routing maps directly onto "project → posts" without custom router config. |
| **Groq API** (`llama-3.3-70b-versatile`, OpenAI-compatible endpoint) | Free tier, very fast inference (important when generating up to 10 posts sequentially), and an OpenAI-compatible chat-completions shape that's trivial to swap for another provider later. |
| **MongoDB (Atlas) via Mongoose** | See "Data storage" below. |
| **Tailwind CSS v4** | CSS-first `@theme` config keeps the tool's own design tokens (paper/ink/accent) colocated with the styles, separate from the *user's* brand color, which is applied entirely via inline CSS variables/styles rather than baked-in utility classes. |
| **react-markdown + remark-gfm** | Renders generated Markdown (including GFM tables/lists) safely, without `dangerouslySetInnerHTML`. |
| **next/og (`ImageResponse`)** | Generates a branded Open Graph image per post at request time — no design tool, no manual asset per post. |
| **lucide-react** | Lightweight, tree-shakeable icon set matching the structured/technical tone of the tool's own UI. |

### Data storage

Project/post data lives in **MongoDB** (a shared Atlas cluster), not in the
visitor's browser. That's the difference between a demo that only works for
the person who built it and one that's actually **hosted**: open a post's
URL from any browser, any device, and it renders — because the database has
the content, not `localStorage`, and it renders identically no matter which
serverless instance handles the request.

All reads/writes go through typed async functions in `src/lib/db.ts`
(`listProjects`, `createProject`, `listPosts`, `upsertPost`, …) backed by two
Mongoose models (`src/lib/models.ts`) mirroring the `Project`/`Post` types in
`src/lib/types.ts`; the connection itself is a cached singleton
(`src/lib/mongodb.ts`) so Next's dev-mode hot reload and serverless
invocations reuse one connection instead of opening a new one per request.
Nothing else in the app imports `mongoose` directly — pages and API routes
only ever call the functions in `db.ts`, so swapping providers again later
(Postgres/Prisma, etc.) means reimplementing that one file.

**Reading vs. generating:** the read paths (`/project/[id]/[slug]`,
`/history`) are real Next.js Server Components — they call `db.ts` directly
and render on the server per request, which is what makes them genuinely
hosted pages (no client JS required to see the content, real SEO metadata,
real OG images). The *build* flow (`/`) and the *dashboard's* retry/generate
buttons stay client-side, since they're interactive and need live progress
feedback — they talk to `db.ts` through small API routes
(`/api/projects`, `/api/projects/[id]`, `/api/projects/[id]/generate`)
instead.

## Setup & run locally

```bash
npm install
cp .env.sample .env.local
# edit .env.local and set GROQ_API_KEY (free key: https://console.groq.com/keys)
# and MONGODB_URI (free cluster: https://www.mongodb.com/cloud/atlas/register)
npm run dev
```

Open http://localhost:3000.

## Run with Docker

```bash
cp .env.sample .env
# edit .env and set GROQ_API_KEY and MONGODB_URI

docker compose up --build
```

The app is available at http://localhost:3000. The `Dockerfile` is a
multi-stage build (`deps` → `builder` → `runner`) producing a small
production image via Next's `output: "standalone"` build; both `GROQ_API_KEY`
and `MONGODB_URI` are only read at request time, never baked into the image,
so rotating either just means restarting the container with a new `.env`.

## Deploy

Because content lives in MongoDB rather than on local disk, this deploys
cleanly to **any** host, including serverless ones — there's no ephemeral
filesystem to worry about.

1. Push this repo to GitHub and import it in Vercel ("Add New… → Project") —
   or use the Docker image above on a VM/Railway/Render/Fly.io.
2. Add `GROQ_API_KEY` and `MONGODB_URI` as environment variables (plus
   `GROQ_MODEL` if you want a non-default model).
3. Deploy.

Every visitor hitting the deployed URL reads from the same database, so
generated blogs are genuinely shared/hosted — not per-browser.

## How to use

1. On the home page, enter a **company name**, upload a **logo** (resized
   client-side, so any reasonable image works), and pick a **brand color**
   (hex input, color picker, or a preset swatch). Watch the live preview
   panel update as you type.
2. Add up to 10 **blog topics** (one is required).
3. Click **Generate my blog**. A project is created on the server, then posts
   are generated one at a time — a progress list shows each topic as queued →
   generating → done/error. If a topic fails (rate limit, API error), the
   rest keep going.
4. You're redirected to the project's **dashboard**, themed with your logo and
   brand color, listing every generated post with its word count. Failed
   topics show a **Retry** button.
5. Click any post to read it — full Markdown rendering, reading time, a
   table of contents, and prev/next navigation between posts in the same
   project. Paste the URL anywhere and it renders for anyone, with a branded
   share-card image.
6. Visit **/history** any time to see every project generated on this
   deployment, and delete any you no longer need.

## Approach & model

**What was built:** a single Next.js app with three concerns cleanly
separated: (1) a build form + live preview (`/`), (2) server-only Groq calls
(`/api/projects/[id]/generate`) that the client invokes once per topic, and
(3) branded, server-rendered viewing routes (`/project/[id]`,
`/project/[id]/[slug]`, `/history`) backed by MongoDB.

**Architecture / data flow:**

```
form (brand + topics)
  → POST /api/projects → Project written to MongoDB (Mongoose), id assigned
  → sequential loop: POST /api/projects/[id]/generate per topic (never parallel)
      → Groq chat completion → parse "# Title" line → word count
      → Post upserted as soon as it's ready, status "done" or "error"
        (errors don't block later topics)
  → redirect to /project/[id]
  → dashboard fetches project + posts from the API, refetches after any
    retry/generate action
  → /project/[id]/[slug] is a Server Component: reads directly from
    db.ts (MongoDB), renders Markdown + generates per-post SEO metadata
    and a branded OG image, themed via BrandedLayout
  → /history is a Server Component listing every project in the database
```

`BrandedLayout` is the single component every dashboard/post page shares; it
takes a `Project` and applies its logo + brand color (via CSS custom
properties) to the header, accents, and footer, so branding never has to be
duplicated per page.

**LLM / model:** Groq's `llama-3.3-70b-versatile` (overridable via
`GROQ_MODEL`) was chosen for its free tier and fast inference — generating up
to 10 posts sequentially would be painfully slow against a rate-limited free
tier on a slower model/provider. The prompt asks for ~1000 words, 4–6 `##`
subheadings, at least one list, and a specific (non-generic) title/closing
heading — the API route (`src/lib/groq.ts`) parses that into a title +
Markdown body + word count. The Groq key is only ever read server-side.

**Known trade-offs:**

- **Sequential generation** — batches of up to 10 posts are generated one at a
  time, not in parallel, specifically to stay under free-tier rate limits.
  This is slower than parallel generation but far more reliable on a free key.
- **Free-tier rate limits** — the API route surfaces Groq 429s distinctly from
  other errors so the UI can tell a user "you're rate limited, retry in a
  moment" instead of a generic failure; the retry button on the dashboard
  exists specifically for this case.

**Beyond the brief:** each generated post also gets real `<head>` metadata
(title, description, Open Graph/Twitter tags) and a dynamically generated,
branded share-card image (`next/og`) — so a link dropped into Slack or
Twitter renders a proper preview using that company's actual logo and brand
color, not a generic favicon.
