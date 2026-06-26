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
  let featuredImageUrl: string | null = null;

  if (fs.existsSync(filePath)) {
    const { data } = matter(fs.readFileSync(filePath, "utf8"));
    title = data.title ?? title;
    const categories: string[] = Array.isArray(data.categories) ? data.categories : [];
    primCat = primaryCategory(categories);
    badgeColor = CATEGORY_COLORS[primCat] ?? "#374151";
    if (data.featuredImage) {
      featuredImageUrl = `https://clayknowseverything.com${data.featuredImage}`;
    }
  }

  const displayTitle = title.length > 72 ? title.slice(0, 69) + "…" : title;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          fontFamily: "sans-serif",
          overflow: "hidden",
        }}
      >
        {/* Background: featured image or solid black */}
        {featuredImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={featuredImageUrl}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "#0a0a0a",
            }}
          />
        )}

        {/* Dark gradient overlay so text is always readable */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.65) 50%, rgba(0,0,0,0.25) 100%)",
            display: "flex",
          }}
        />

        {/* Left orange sidebar accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: 8,
            background: "#f97316",
            display: "flex",
          }}
        />

        {/* Top orange accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: "linear-gradient(90deg, #f97316, #ea580c)",
            display: "flex",
          }}
        />

        {/* Content layer */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "48px 56px 48px 64px",
          }}
        >
          {/* Category badge */}
          {primCat && (
            <div
              style={{
                background: badgeColor,
                color: "#fff",
                padding: "7px 18px",
                borderRadius: 6,
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                alignSelf: "flex-start",
                marginBottom: 20,
                display: "flex",
              }}
            >
              {primCat}
            </div>
          )}

          {/* Article title */}
          <div
            style={{
              color: "#ffffff",
              fontSize: title.length > 50 ? 52 : 64,
              fontWeight: 800,
              lineHeight: 1.15,
              textShadow: "0 2px 12px rgba(0,0,0,0.8)",
              marginBottom: 28,
              display: "flex",
            }}
          >
            {displayTitle}
          </div>

          {/* Footer branding */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid rgba(255,255,255,0.2)",
              paddingTop: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "#f97316",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 20,
                  fontWeight: 700,
                }}
              >
                C
              </div>
              <div
                style={{
                  color: "#e5e7eb",
                  fontSize: 22,
                  fontWeight: 600,
                  display: "flex",
                }}
              >
                Clay Knows Everything
              </div>
            </div>
            <div
              style={{
                color: "#fb923c",
                fontSize: 18,
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
