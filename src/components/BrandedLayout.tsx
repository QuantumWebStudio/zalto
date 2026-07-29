import type { ReactNode } from "react";
import Link from "next/link";
import { BrandedHeader } from "@/components/BrandedHeader";
import { contrastText, shade, tint, withAlpha } from "@/lib/color";
import type { Project } from "@/lib/types";

interface BrandedLayoutProps {
  project: Project;
  children: ReactNode;
  wide?: boolean;
}

export function BrandedLayout({ project, children, wide = false }: BrandedLayoutProps) {
  const onBrand = contrastText(project.brandColor);
  const brandSoft = tint(project.brandColor, 0.88);
  const brandDeep = shade(project.brandColor, 0.25);
  const brandGlow = withAlpha(project.brandColor, 0.3);
  const brandGlow2 = withAlpha(project.brandColor, 0.16);

  return (
    <div
      className="relative flex min-h-screen flex-col overflow-x-clip bg-paper-raised"
      style={
        {
          "--brand": project.brandColor,
          "--brand-soft": brandSoft,
          "--brand-deep": brandDeep,
          "--brand-glow": brandGlow,
          "--brand-glow-2": brandGlow2,
          "--on-brand": onBrand,
        } as React.CSSProperties
      }
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(760px_circle_at_15%_-15%,var(--brand-glow),transparent_60%),radial-gradient(560px_circle_at_100%_0%,var(--brand-glow-2),transparent_55%)]" />

      <div className="h-2 bg-[linear-gradient(90deg,var(--brand-deep),var(--brand),var(--brand-soft),var(--brand))] bg-[length:250%_auto]" />

      <BrandedHeader project={project} />

      <main
        className={`animate-fade-in-up mx-auto w-full flex-1 px-6 py-10 ${wide ? "max-w-5xl" : "max-w-3xl"}`}
      >
        {children}
      </main>

      <footer
        className="border-t py-6"
        style={{ borderColor: "var(--brand-glow-2)", backgroundColor: "var(--brand-soft)" }}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 text-xs text-neutral-700">
          <span>
            {project.companyName} blog · built with{" "}
            <Link href="/" className="font-semibold text-[var(--brand)] hover:underline">
              Zalto
            </Link>
          </span>
          <span className="font-mono font-medium text-[var(--brand)]">
            {project.brandColor.toUpperCase()}
          </span>
        </div>
      </footer>
    </div>
  );
}
