import { ImageResponse } from "next/og";
import { getPost, getProject } from "@/lib/db";
import { contrastText, shade } from "@/lib/color";
import { isValidHexColor } from "@/lib/validation";

// Reads the JSON store via fs, so this needs the Node.js runtime (not Edge).
export const runtime = "nodejs";

export const alt = "Blog post cover image";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id, slug } = await params;
  const project = await getProject(id);
  const post = project ? await getPost(id, slug) : null;

  const brand = project && isValidHexColor(project.brandColor) ? project.brandColor : "#003161";
  const deep = shade(brand, 0.4);
  const onBrand = contrastText(brand);

  const title = post?.title ?? "Untitled post";
  const company = project?.companyName ?? "Blog";
  const topic = post?.topic ?? "";
  const initial = company.trim().charAt(0).toUpperCase() || "?";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          backgroundImage: `linear-gradient(135deg, ${deep}, ${brand})`,
          color: onBrand,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {project?.logoDataUrl ? (
            // eslint-disable-next-line jsx-a11y/alt-text -- decorative, company name renders right beside it
            <img
              src={project.logoDataUrl}
              width={64}
              height={64}
              style={{ borderRadius: 16, objectFit: "contain", background: "white", padding: 8 }}
            />
          ) : (
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: "rgba(255,255,255,0.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                fontWeight: 700,
              }}
            >
              {initial}
            </div>
          )}
          <div style={{ display: "flex", fontSize: 30, fontWeight: 600 }}>{company}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {topic && (
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                padding: "8px 22px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.18)",
                fontSize: 22,
                textTransform: "uppercase",
                letterSpacing: 3,
              }}
            >
              {topic}
            </div>
          )}
          <div
            style={{
              display: "flex",
              fontSize: 58,
              fontWeight: 700,
              lineHeight: 1.15,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
