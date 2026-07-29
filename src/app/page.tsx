"use client";

import { type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { ColorPicker } from "@/components/ColorPicker";
import { LogoUpload } from "@/components/LogoUpload";
import { TopicList } from "@/components/TopicList";
import { BrowserPreview } from "@/components/BrowserPreview";
import { GenerationProgress } from "@/components/GenerationProgress";
import { createProject, generatePost } from "@/lib/api";
import { slugify, uniqueSlug } from "@/lib/slug";
import { normalizeHexColor, validateForm, hasErrors } from "@/lib/validation";
import { useProjectFormStore } from "@/lib/stores/projectFormStore";
import type { Project } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();

  const {
    companyName,
    brandColor,
    logoDataUrl,
    logoError,
    topics,
    errors,
    submitError,
    isSubmitting,
    phase,
    items,
    setCompanyName,
    setBrandColor,
    setLogoDataUrl,
    setLogoError,
    setTopics,
    setErrors,
    setSubmitError,
    setIsSubmitting,
    setPhase,
    setItems,
    updateItem,
  } = useProjectFormStore();

  async function runGeneration(project: Project) {
    setItems(project.topics.map((topic) => ({ topic, status: "queued", errorMessage: null })));
    setPhase("generating");

    const slugsUsed = new Set<string>();

    for (let i = 0; i < project.topics.length; i++) {
      const topic = project.topics[i];
      const slug = uniqueSlug(slugify(topic), slugsUsed);
      slugsUsed.add(slug);

      updateItem(i, { status: "generating" });

      const { post, error } = await generatePost(project.id, { topic, slug, order: i });

      if (post?.status === "done") {
        updateItem(i, { status: "done" });
      } else {
        updateItem(i, { status: "error", errorMessage: error ?? "Generation failed." });
      }
    }

    router.push(`/project/${project.id}`);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const values = { companyName, brandColor, logoDataUrl, topics };
    const validation = validateForm(values);
    setErrors(validation);
    setSubmitError(null);
    if (logoError || hasErrors(validation)) return;

    const trimmedCompanyName = companyName.trim();
    const trimmedTopics = topics.map((t) => t.trim()).filter(Boolean);

    setIsSubmitting(true);
    const result = await createProject({
      companyName: trimmedCompanyName,
      brandColor: brandColor.trim(),
      logoDataUrl,
      topics: trimmedTopics,
    });
    setIsSubmitting(false);

    if (!result.ok) {
      setSubmitError(result.error);
      return;
    }

    void runGeneration(result.data);
  }

  if (phase === "generating") {
    return (
      <div className="flex flex-1 flex-col">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-16">
          <div className="animate-fade-in-up">
            <GenerationProgress items={items} />
          </div>
          <p className="mt-4 text-center text-xs text-ink-soft">
            Generating posts one at a time to respect free-tier rate limits. You&apos;ll be taken to
            your dashboard when this finishes.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 sm:py-12">
        <div className="animate-fade-in-up mb-10 sm:mb-12">
          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent-soft px-3 py-1 text-sm font-medium text-accent">
            <Sparkles className="h-4 w-4" aria-hidden />
            Build a branded blog
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Turn your brand and a few topics into a{" "}
            <span className="gradient-text">live blog</span>
          </h1>
          <p className="mt-3 max-w-2xl text-base text-ink-soft sm:text-lg">
            Enter your company details and up to 10 topics. Zalto writes, structures, and
            themes each post automatically.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px] lg:gap-10"
          noValidate
        >
          <div
            className="animate-fade-in-up flex flex-col gap-7 rounded-2xl border border-line bg-paper-raised p-5 shadow-xl shadow-black/[0.03] sm:p-8"
            style={{ animationDelay: "80ms" }}
          >
            <div>
              <label htmlFor="company-name" className="mb-1.5 block text-sm font-medium text-ink">
                Company name
              </label>
              <input
                id="company-name"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Corp"
                aria-invalid={Boolean(errors.companyName)}
                className="w-full rounded-lg border border-line bg-paper-raised px-3 py-2.5 text-sm text-ink outline-none focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/10"
                autoComplete="organization"
              />
              {errors.companyName && (
                <p className="mt-1.5 text-sm text-red-600">{errors.companyName}</p>
              )}
            </div>

            <LogoUpload
              value={logoDataUrl}
              onChange={setLogoDataUrl}
              error={logoError}
              onErrorChange={setLogoError}
            />

            <ColorPicker
              value={brandColor}
              onChange={(hex) => setBrandColor(normalizeHexColor(hex))}
              error={errors.brandColor}
            />

            <TopicList
              topics={topics}
              onChange={setTopics}
              itemErrors={errors.topicItems}
              generalError={errors.topics}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-glow mt-2 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-accent via-accent-2 to-accent bg-[length:200%_auto] bg-left px-5 py-3 text-sm font-semibold text-white hover:bg-right disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Sparkles className="h-4 w-4" aria-hidden />
              {isSubmitting ? "Creating…" : "Generate my blog"}
            </button>
            {submitError && <p className="text-sm text-red-600">{submitError}</p>}
          </div>

          <div
            className="animate-fade-in-up lg:sticky lg:top-24 lg:self-start"
            style={{ animationDelay: "160ms" }}
          >
            <p className="mb-3 font-mono text-xs uppercase tracking-wide text-ink-soft">
              Live preview
            </p>
            <BrowserPreview
              companyName={companyName}
              brandColor={brandColor}
              logoDataUrl={logoDataUrl}
            />
          </div>
        </form>
      </main>
    </div>
  );
}
