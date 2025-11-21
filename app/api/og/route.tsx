/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Get dynamic params
    const title = searchParams.get("title")?.slice(0, 100) || "Linkio Profile";
    const description =
      searchParams.get("description")?.slice(0, 200) ||
      "Check out my links on Linkio";
    const image = searchParams.get("image");

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0f172a", // slate-900
            color: "white",
            fontFamily: "sans-serif",
            padding: "40px",
            position: "relative",
          }}
        >
          {/* Background accent */}
          <div
            style={{
              position: "absolute",
              top: "-200px",
              left: "-200px",
              width: "600px",
              height: "600px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(0,0,0,0) 70%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-200px",
              right: "-200px",
              width: "600px",
              height: "600px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(147,51,234,0.3) 0%, rgba(0,0,0,0) 70%)",
            }}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              gap: "20px",
            }}
          >
            {image && (
              <img
                src={image}
                alt={title}
                style={{
                  width: "200px",
                  height: "200px",
                  borderRadius: "100px",
                  objectFit: "cover",
                  border: "4px solid rgba(255,255,255,0.2)",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
                }}
              />
            )}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  fontSize: 60,
                  fontWeight: "bold",
                  background: "linear-gradient(to right, #ffffff, #cbd5e1)",
                  backgroundClip: "text",
                  color: "transparent",
                  lineHeight: 1.1,
                }}
              >
                {title.replace("'s Linkio | Personal Profile", "")}
              </div>
              <div
                style={{
                  fontSize: 30,
                  color: "#94a3b8", // slate-400
                  maxWidth: "800px",
                  lineHeight: 1.4,
                }}
              >
                {description}
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to generate OG image:", message);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}

