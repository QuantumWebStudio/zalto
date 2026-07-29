"use client";

import { contrastText, tint } from "@/lib/color";
import { isValidHexColor } from "@/lib/validation";

interface BrowserPreviewProps {
  companyName: string;
  brandColor: string;
  logoDataUrl: string | null;
}

export function BrowserPreview({ companyName, brandColor, logoDataUrl }: BrowserPreviewProps) {
  const color = isValidHexColor(brandColor) ? brandColor : "#003161";
  const onColor = contrastText(color);
  const tintBg = tint(color, 0.92);
  const displayName = companyName.trim() || "Your Company";
  const initial = displayName.trim().charAt(0).toUpperCase() || "S";

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-paper-raised shadow-2xl shadow-black/[0.08] transition-shadow duration-500 hover:shadow-black/[0.12]">
      <div className="flex items-center gap-2 border-b border-line bg-paper px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-black/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-black/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-black/15" />
        <div className="ml-3 flex-1 truncate rounded-md bg-black/5 px-3 py-1 font-mono text-xs text-ink-soft">
          {displayName.toLowerCase().replace(/\s+/g, "-") || "your-company"}.blog
        </div>
      </div>

      <div className="bg-white">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div className="flex items-center gap-2.5">
            {logoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoDataUrl} alt="" className="h-8 w-8 rounded object-contain" />
            ) : (
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full font-display text-sm font-semibold transition-colors duration-300"
                style={{ backgroundColor: color, color: onColor }}
              >
                {initial}
              </span>
            )}
            <span className="truncate font-display text-sm font-semibold text-neutral-900">
              {displayName}
            </span>
          </div>
          <span
            className="hidden rounded-full px-3 py-1 text-xs font-medium transition-colors duration-300 sm:inline"
            style={{ backgroundColor: color, color: onColor }}
          >
            Subscribe
          </span>
        </div>

        <div className="px-6 py-8">
          <p
            className="mb-3 inline-block rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide transition-colors duration-300"
            style={{ backgroundColor: tintBg, color }}
          >
            Latest post
          </p>
          <h3 className="mb-2 font-display text-xl font-semibold leading-snug text-neutral-900 sm:text-2xl">
            Insights from {displayName}
          </h3>
          <p className="mb-5 max-w-md text-sm leading-relaxed text-neutral-500">
            A themed blog, generated from your brand, ready to publish in minutes — not weeks.
          </p>
          <span
            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-300"
            style={{ backgroundColor: color, color: onColor }}
          >
            Read the blog →
          </span>
        </div>
      </div>
    </div>
  );
}
