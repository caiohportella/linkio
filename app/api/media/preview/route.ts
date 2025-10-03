import { NextResponse } from "next/server";

const YOUTUBE_VIDEO_ID_REGEX =
  /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/;

function extractYouTubeVideoId(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);

    if (url.hostname.includes("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v && v.length === 11) return v;

      const shortsMatch = url.pathname.match(/\/shorts\/([A-Za-z0-9_-]{11})/);
      if (shortsMatch) return shortsMatch[1];

      const embedMatch = url.pathname.match(/\/embed\/([A-Za-z0-9_-]{11})/);
      if (embedMatch) return embedMatch[1];
    }

    if (url.hostname === "youtu.be") {
      const id = url.pathname.replace(/\//g, "");
      if (id.length === 11) return id;
    }

    const fallbackMatch = rawUrl.match(YOUTUBE_VIDEO_ID_REGEX);
    if (fallbackMatch) return fallbackMatch[1];

    return null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const url = String(body?.url ?? "").trim();
    const titleOverride = body?.title ? String(body.title).trim() : undefined;

    if (!url) {
      return NextResponse.json({ error: "Missing url." }, { status: 400 });
    }

    const videoId = extractYouTubeVideoId(url);

    if (!videoId) {
      return NextResponse.json(
        {
          error: "Unable to extract a YouTube video ID from the provided URL.",
        },
        { status: 400 },
      );
    }

    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
      `https://www.youtube.com/watch?v=${videoId}`,
    )}&format=json`;

    const response = await fetch(oembedUrl, { cache: "no-store" });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch preview data from YouTube." },
        { status: 502 },
      );
    }

    const data = await response.json();

    const title: string | undefined = titleOverride || data?.title || undefined;
    const thumbnailUrl: string | undefined = data?.thumbnail_url ?? undefined;

    if (!title || !thumbnailUrl) {
      return NextResponse.json(
        { error: "YouTube did not return enough information for this video." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      platform: "youtube",
      url,
      videoId,
      title,
      thumbnailUrl,
    });
  } catch (error) {
    console.error("Failed to generate media preview", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
