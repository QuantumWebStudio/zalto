"use client";

import { isValidHexColor } from "@/lib/validation";

// A mixture built from the site's own navy/teal/cream palette plus a few
// complementary hues, so a generated blog can read as related to Zalto's
// look without being a carbon copy of the tool's own teal accent.
const PRESETS = ["#003161", "#006A67", "#000B58", "#FFF4B7", "#0EA5E9", "#DC2626", "#D97706"];

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  error?: string;
}

export function ColorPicker({ value, onChange, error }: ColorPickerProps) {
  const swatchValue = isValidHexColor(value) ? value : "#003161";

  return (
    <div>
      <label htmlFor="brand-color" className="mb-1.5 block text-sm font-medium text-ink">
        Brand color
      </label>
      <div className="flex items-center gap-3">
        <label className="relative h-11 w-11 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-line shadow-sm">
          <input
            type="color"
            aria-label="Pick brand color"
            value={swatchValue}
            onChange={(e) => onChange(e.target.value)}
            className="absolute -inset-2 h-[calc(100%+16px)] w-[calc(100%+16px)] cursor-pointer border-0 p-0"
          />
        </label>
        <input
          id="brand-color"
          type="text"
          inputMode="text"
          placeholder="#003161"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "brand-color-error" : undefined}
          className="w-32 rounded-lg border border-line bg-paper-raised px-3 py-2.5 font-mono text-sm text-ink outline-none focus-visible:border-accent focus-visible:ring-4 focus-visible:ring-accent/10"
        />
        <div className="flex flex-wrap items-center gap-1.5">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onChange(preset)}
              aria-label={`Use ${preset}`}
              title={preset}
              className="h-6 w-6 rounded-full border border-black/10 shadow-sm transition-transform hover:scale-125 hover:shadow-md"
              style={{ backgroundColor: preset }}
            />
          ))}
        </div>
      </div>
      {error && (
        <p id="brand-color-error" className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
