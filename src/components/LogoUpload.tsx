"use client";

import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { resizeImageToDataUrl } from "@/lib/image";
import { validateLogoFile } from "@/lib/validation";

interface LogoUploadProps {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  error?: string;
  onErrorChange: (message: string | undefined) => void;
}

export function LogoUpload({ value, onChange, error, onErrorChange }: LogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleFile(file: File | null) {
    if (!file) return;

    const validationError = validateLogoFile(file);
    if (validationError) {
      onErrorChange(validationError);
      return;
    }

    onErrorChange(undefined);
    setIsProcessing(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      onChange(dataUrl);
    } catch {
      onErrorChange("Could not process that image. Try a different file.");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">Logo</label>
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-line bg-paper-raised transition-colors hover:border-accent/40">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Logo preview" className="h-full w-full object-contain p-1.5" />
          ) : (
            <ImagePlus className="h-6 w-6 text-ink-soft" aria-hidden />
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isProcessing}
              className="rounded-lg border border-line bg-paper-raised px-3 py-2 text-sm font-medium text-ink hover:border-accent hover:text-accent disabled:opacity-60"
            >
              {isProcessing ? "Processing…" : value ? "Replace logo" : "Upload logo"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange(null)}
                aria-label="Remove logo"
                className="flex items-center gap-1 rounded-lg px-2 py-2 text-sm text-ink-soft hover:text-red-600"
              >
                <X className="h-4 w-4" aria-hidden />
                Remove
              </button>
            )}
          </div>
          <p className="text-xs text-ink-soft">PNG, JPEG, WebP, or SVG. Resized automatically.</p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="sr-only"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </div>
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}
