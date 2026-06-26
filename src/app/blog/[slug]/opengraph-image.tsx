import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CATEGORY_COLORS: Record<string, string> = {
  Entertainment: "#be123c",
  Tech:          "#6d28d9",
  Sports:        "#1d4ed8",
  Outdoors:      "#4d7c0f",
  Finance:       "#b45309",
  "Web Design":  "#0e7490",
  Funny:         "#c2410c",
  Life:          "#047857",
};

const CATEGORY_PRIORITY = [
  "Entertainment", "Tech", "Sports", "Outdoors",
  "Finance", "Web Design", "Funny", "Life",
];

function primaryCategory(cats: string[]): string {
  if (!cats?.length) return "";
  return [...cats].sort(
    (a, b) => CATEGORY_PRIORITY.indexOf(a) - CATEGORY_PRIORITY.indexOf(b)
  )[0] ?? cats[0];
}

export async function generateStaticParams() {
  const contentDir = path.join(process.cwd(), "src", "content");
  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".mdx"));
  return files.map((f) => ({ slug: f.replace(".mdx", "") }));
}

export default async function Image({
  params,
}: {
  params: { slug: string };
}) {
  const filePath = path.join(process.cwd(), "src", "content", `${params.slug}.mdx`);

  let title = "Clay Knows Everything";
  let primCat = "";
  let badgeColor = "#374151";

  if (fs.existsSync(filePath)) {
    const { data } = matter(fs.readFileSync(filePath, "utf8"));
    title = data.title ?? title;
    const categories: string[] = Array.isArray(data.categories) ? data.categories : [];
    primCat = primaryCategory(categories);
    badgeColor = CATEGORY_COLORS[primCat] ?? "#374151";
  }

  // Truncate long titles
  const displayTitle = title.length > 80 ? title.slice(0, 77) + "…" : title;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0a0a0a",
          padding: "0",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top orange accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 10,
            background: "linear-gradient(90deg, #f97316, #ea580c)",
          }}
        />

        {/* Left orange sidebar accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: 6,
            background: "#f97316",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "64px 72px 64px 80px",
            flex: 1,
            justifyContent: "space-between",
          }}
        >
          {/* Top: category badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {primCat && (
              <div
                style={{
                  background: badgeColor,
                  color: "#fff",
                  padding: "8px 20px",
                  borderRadius: 6,
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  display: "flex",
                }}
              >
                {primCat}
              </div>
            )}
          </div>

          {/* Middle: title */}
          <div
            style={{
              color: "#ffffff",
              fontSize: title.length > 60 ? 56 : 68,
              fontWeight: 800,
              lineHeight: 1.15,
              flex: 1,
              display: "flex",
              alignItems: "center",
              marginTop: 32,
              marginBottom: 32,
            }}
          >
            {displayTitle}
          </div>

          {/* Bottom: branding */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid #2a2a2a",
              paddingTop: 28,
            }}
          >
            {/* Logo text */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "#f97316",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 24,
                  fontWeight: 700,
                }}
              >
                C
              </div>
              <div
                style={{
                  color: "#e5e7eb",
                  fontSize: 28,
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                  display: "flex",
                }}
              >
                Clay Knows Everything
              </div>
            </div>

            <div
              style={{
                color: "#f97316",
                fontSize: 22,
                fontWeight: 600,
                display: "flex",
              }}
            >
              clayknowseverything.com
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
