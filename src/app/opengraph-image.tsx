import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0a0a0a",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Top orange bar */}
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

        {/* Left sidebar */}
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

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            padding: "80px 80px 80px 90px",
            flex: 1,
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "#f97316",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 40,
              fontWeight: 700,
              marginBottom: 36,
            }}
          >
            C
          </div>

          {/* Site name */}
          <div
            style={{
              color: "#ffffff",
              fontSize: 80,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              display: "flex",
              marginBottom: 24,
            }}
          >
            Clay Knows Everything
          </div>

          {/* Tagline */}
          <div
            style={{
              color: "#9ca3af",
              fontSize: 30,
              lineHeight: 1.4,
              maxWidth: 900,
              display: "flex",
            }}
          >
            Real talk on life, tech, sports, the outdoors, entertainment & more.
          </div>

          {/* Categories row */}
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 48,
              flexWrap: "wrap",
            }}
          >
            {["Life", "Tech", "Sports", "Outdoors", "Entertainment", "Funny"].map((cat) => (
              <div
                key={cat}
                style={{
                  background: "#1f1f1f",
                  border: "1px solid #2a2a2a",
                  color: "#d1d5db",
                  padding: "8px 18px",
                  borderRadius: 6,
                  fontSize: 18,
                  fontWeight: 600,
                  display: "flex",
                }}
              >
                {cat}
              </div>
            ))}
          </div>

          {/* Domain */}
          <div
            style={{
              position: "absolute",
              bottom: 48,
              right: 80,
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
    ),
    { ...size }
  );
}
