import { NextResponse } from "next/server";

type MusicMetadata = {
  title?: string;
  artist?: string;
  artworkUrl?: string;
};

async function fetchSpotifyMetadata(url: string): Promise<MusicMetadata | null> {
  const endpoint = `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`;
  const response = await fetch(endpoint, { cache: "no-store" });
  if (!response.ok) return null;
  const data = await response.json();

  let artist: string | undefined = data?.author_name ?? undefined;

  try {
    const embedUrl = url.replace("open.spotify.com", "open.spotify.com/embed");
    const htmlResponse = await fetch(embedUrl, {
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (htmlResponse.ok) {
      const html = await htmlResponse.text();

      const decodeHtml = (value?: string) =>
        value ? value.replace(/\\u0026/g, "&").trim() : undefined;

      if (!artist) {
        const artistMatch = html.match(/"artists":\[\{"name":"([^\"]+)"/);
        if (artistMatch && artistMatch[1]) {
          artist = decodeHtml(artistMatch[1]) ?? artist;
        }
      }

      if (!artist) {
        const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
        if (titleMatch) {
          const titleText = titleMatch[1];
          const byIndex = titleText.toLowerCase().indexOf(" by ");
          if (byIndex !== -1) {
            const afterBy = titleText
              .slice(byIndex + 4)
              .replace(/\|\s*spotify.*/i, "")
              .trim();
            if (afterBy) {
              artist = decodeHtml(afterBy) ?? artist;
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Spotify metadata HTML fallback failed", error);
  }

  return {
    title: data?.title ?? undefined,
    artist,
    artworkUrl: data?.thumbnail_url ?? undefined,
  };
}

async function fetchDeezerMetadata(url: string): Promise<MusicMetadata | null> {
  const endpoint = `https://api.deezer.com/oembed?format=json&url=${encodeURIComponent(url)}`;
  const response = await fetch(endpoint, { cache: "no-store" });
  if (!response.ok) return null;
  const data = await response.json();
  return {
    title: data?.title ?? undefined,
    artist: data?.author_name ?? undefined,
    artworkUrl: data?.thumbnail ?? data?.thumbnail_url ?? undefined,
  };
}

async function fetchAppleMusicMetadata(url: string): Promise<MusicMetadata | null> {
  const endpoint = `https://itunes.apple.com/lookup?url=${encodeURIComponent(url)}`;
  const response = await fetch(endpoint, { cache: "no-store" });
  if (!response.ok) return null;
  const data = await response.json();
  const item = data?.results?.[0];
  if (!item) return null;
  const artwork = item.artworkUrl100 ?? item.artworkUrl60 ?? item.artworkUrl512;
  return {
    title: item.trackName ?? item.collectionName ?? item.playlistName ?? undefined,
    artist: item.artistName ?? undefined,
    artworkUrl: typeof artwork === "string" ? artwork.replace("100x100", "600x600") : undefined,
  };
}

async function fetchAmazonMusicMetadata(url: string): Promise<MusicMetadata | null> {
  // Amazon Music does not offer a public oEmbed endpoint, so try using noembed as a best-effort fallback.
  const endpoint = `https://noembed.com/embed?url=${encodeURIComponent(url)}`;
  const response = await fetch(endpoint, { cache: "no-store" });
  if (!response.ok) return null;
  const data = await response.json();
  if (data?.error) return null;
  return {
    title: data?.title ?? undefined,
    artist: data?.author_name ?? undefined,
    artworkUrl: data?.thumbnail_url ?? undefined,
  };
}

async function fetchTidalMetadata(url: string): Promise<MusicMetadata | null> {
  // Tidal also lacks an oEmbed endpoint; attempt using noembed as a fallback.
  const endpoint = `https://noembed.com/embed?url=${encodeURIComponent(url)}`;
  const response = await fetch(endpoint, { cache: "no-store" });
  if (!response.ok) return null;
  const data = await response.json();
  if (data?.error) return null;
  return {
    title: data?.title ?? undefined,
    artist: data?.author_name ?? undefined,
    artworkUrl: data?.thumbnail_url ?? undefined,
  };
}

async function fetchGenericMetadata(url: string): Promise<MusicMetadata | null> {
  const endpoint = `https://noembed.com/embed?url=${encodeURIComponent(url)}`;
  const response = await fetch(endpoint, { cache: "no-store" });
  if (!response.ok) return null;
  const data = await response.json();
  if (data?.error) return null;
  return {
    title: data?.title ?? undefined,
    artist: data?.author_name ?? undefined,
    artworkUrl: data?.thumbnail_url ?? undefined,
  };
}

async function resolveMetadata(url: string): Promise<MusicMetadata | null> {
  if (url.includes("open.spotify.com")) {
    return await fetchSpotifyMetadata(url);
  }

  if (url.includes("deezer.com")) {
    return await fetchDeezerMetadata(url);
  }

  if (url.includes("music.apple.com")) {
    return await fetchAppleMusicMetadata(url);
  }

  if (url.includes("music.amazon.") || url.includes("amazon.com")) {
    const metadata = await fetchAmazonMusicMetadata(url);
    if (metadata) return metadata;
  }

  if (url.includes("tidal.com")) {
    const metadata = await fetchTidalMetadata(url);
    if (metadata) return metadata;
  }

  return await fetchGenericMetadata(url);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const url = String(body?.url ?? "").trim();

    if (!url) {
      return NextResponse.json(
        { error: "Missing url." },
        { status: 400 },
      );
    }

    const metadata = await resolveMetadata(url);
    if (!metadata) {
      return NextResponse.json(
        { error: "Unable to fetch metadata." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      title: metadata.title ?? null,
      artist: metadata.artist ?? null,
      artworkUrl: metadata.artworkUrl ?? null,
    });
  } catch (error) {
    console.error("Failed to fetch music metadata", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}


