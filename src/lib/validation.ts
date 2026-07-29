import { z } from "zod";

export const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/;

export const MAX_TOPICS = 10;
export const MIN_TOPICS = 1;
export const MAX_LOGO_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_LOGO_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];

const hexColorSchema = z.string().trim().regex(HEX_COLOR_REGEX);

export function isValidHexColor(value: string): boolean {
  return hexColorSchema.safeParse(value).success;
}

export function normalizeHexColor(value: string): string {
  const trimmed = value.trim();
  if (/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(trimmed)) return `#${trimmed}`;
  return trimmed;
}

export interface FormValues {
  companyName: string;
  brandColor: string;
  logoDataUrl: string | null;
  topics: string[];
}

export interface FormErrors {
  companyName?: string;
  brandColor?: string;
  logo?: string;
  topics?: string;
  topicItems?: Record<number, string>;
}

export const formSchema = z
  .object({
    companyName: z.string(),
    brandColor: z.string(),
    logoDataUrl: z.string().nullable(),
    topics: z.array(z.string()),
  })
  .superRefine((values, ctx) => {
    const companyName = values.companyName.trim();
    if (!companyName) {
      ctx.addIssue({ code: "custom", path: ["companyName"], message: "Company name is required." });
    } else if (companyName.length > 80) {
      ctx.addIssue({
        code: "custom",
        path: ["companyName"],
        message: "Company name must be 80 characters or fewer.",
      });
    }

    if (!values.brandColor.trim()) {
      ctx.addIssue({ code: "custom", path: ["brandColor"], message: "Brand color is required." });
    } else if (!isValidHexColor(values.brandColor)) {
      ctx.addIssue({
        code: "custom",
        path: ["brandColor"],
        message: "Enter a valid hex color, e.g. #003161.",
      });
    }

    const trimmedTopics = values.topics.map((t) => t.trim());
    const nonEmpty = trimmedTopics.filter(Boolean);

    if (nonEmpty.length < MIN_TOPICS) {
      ctx.addIssue({ code: "custom", path: ["topics"], message: "Add at least one blog topic." });
    } else if (values.topics.length > MAX_TOPICS) {
      ctx.addIssue({
        code: "custom",
        path: ["topics"],
        message: `You can add up to ${MAX_TOPICS} topics.`,
      });
    }

    trimmedTopics.forEach((topic, index) => {
      if (!topic) {
        ctx.addIssue({ code: "custom", path: ["topics", index], message: "Topic cannot be empty." });
      } else if (topic.length > 140) {
        ctx.addIssue({
          code: "custom",
          path: ["topics", index],
          message: "Keep topics under 140 characters.",
        });
      }
    });
  });

export function validateForm(values: FormValues): FormErrors {
  const result = formSchema.safeParse(values);
  if (result.success) return {};

  const errors: FormErrors = {};
  for (const issue of result.error.issues) {
    const [key, index] = issue.path;
    if (key === "companyName") {
      errors.companyName ??= issue.message;
    } else if (key === "brandColor") {
      errors.brandColor ??= issue.message;
    } else if (key === "topics" && typeof index === "number") {
      errors.topicItems ??= {};
      errors.topicItems[index] = issue.message;
    } else if (key === "topics") {
      errors.topics ??= issue.message;
    }
  }
  return errors;
}

export function hasErrors(errors: FormErrors): boolean {
  return Boolean(
    errors.companyName ||
      errors.brandColor ||
      errors.logo ||
      errors.topics ||
      (errors.topicItems && Object.keys(errors.topicItems).length > 0)
  );
}

const logoFileSchema = z
  .instanceof(File)
  .refine((file) => ACCEPTED_LOGO_TYPES.includes(file.type), {
    message: "Logo must be a PNG, JPEG, WebP, or SVG image.",
  })
  .refine((file) => file.size <= MAX_LOGO_BYTES, {
    message: "Logo file must be 5MB or smaller.",
  });

export function validateLogoFile(file: File): string | null {
  const result = logoFileSchema.safeParse(file);
  return result.success ? null : result.error.issues[0].message;
}
