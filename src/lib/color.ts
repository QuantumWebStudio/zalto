function expandHex(hex: string): string {
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    return clean
      .split("")
      .map((c) => c + c)
      .join("");
  }
  return clean;
}

/** Returns black or white, whichever reads better against the given hex background. */
export function contrastText(hex: string): "#0a0a0f" | "#ffffff" {
  const clean = expandHex(hex);
  if (clean.length !== 6) return "#0a0a0f";

  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#0a0a0f" : "#ffffff";
}

/** Mixes a hex color toward white by the given amount (0-1), for tints/backgrounds. */
export function tint(hex: string, amount: number): string {
  const clean = expandHex(hex);
  if (clean.length !== 6) return hex;

  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);

  const mix = (channel: number) => Math.round(channel + (255 - channel) * amount);

  return `#${[mix(r), mix(g), mix(b)].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

/** Mixes a hex color toward black by the given amount (0-1), for depth/gradients. */
export function shade(hex: string, amount: number): string {
  const clean = expandHex(hex);
  if (clean.length !== 6) return hex;

  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);

  const mix = (channel: number) => Math.round(channel * (1 - amount));

  return `#${[mix(r), mix(g), mix(b)].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

/** Converts a hex color to an rgba() string, for glows and soft shadows. */
export function withAlpha(hex: string, alpha: number): string {
  const clean = expandHex(hex);
  if (clean.length !== 6) return hex;

  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
