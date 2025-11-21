import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const url = String(body?.url ?? "").trim();

    if (!url) {
      return NextResponse.json({ error: "Missing url." }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; LinkioBot/1.0; +https://linkio.app)",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch URL." },
        { status: 502 },
      );
    }

    const html = await response.text();

    // Simple regex to extract og:image
    const ogImageMatch = html.match(
      /<meta\s+(?:property|name)="og:image"\s+content="([^"]+)"/i,
    );
    const ogImage = ogImageMatch ? ogImageMatch[1] : null;

    // Simple regex to extract title as fallback
    const ogTitleMatch = html.match(
      /<meta\s+(?:property|name)="og:title"\s+content="([^"]+)"/i,
    );
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const title = ogTitleMatch ? ogTitleMatch[1] : titleMatch ? titleMatch[1] : null;

    if (!ogImage) {
      return NextResponse.json(
        { error: "No Open Graph image found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      url,
      title,
      imageUrl: ogImage,
    });
  } catch (error) {
    console.error("Failed to fetch OG preview", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
