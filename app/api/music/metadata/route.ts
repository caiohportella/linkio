import { NextResponse } from "next/server";

type MusicMetadata = {
  title?: string;
  artist?: string;
  artworkUrl?: string;
};

async function fetchSpotifyMetadata(
  url: string,
): Promise<MusicMetadata | null> {
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

      // Try multiple patterns to extract artist information
      if (!artist) {
        // Pattern 1: Look for artists array in JSON
        const artistMatch = html.match(/"artists":\[\{"name":"([^\"]+)"/);
        if (artistMatch && artistMatch[1]) {
          artist = decodeHtml(artistMatch[1]) ?? artist;
        }
      }

      if (!artist) {
        // Pattern 2: Look for artist in different JSON structure
        const artistMatch2 = html.match(/"artist":"([^\"]+)"/);
        if (artistMatch2 && artistMatch2[1]) {
          artist = decodeHtml(artistMatch2[1]) ?? artist;
        }
      }

      if (!artist) {
        // Pattern 3: Look for artist in title tag
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

      if (!artist) {
        // Pattern 4: Look for artist in meta tags
        const metaArtistMatch = html.match(
          /<meta\s+name="music:musician"\s+content="([^"]+)"/i,
        );
        if (metaArtistMatch && metaArtistMatch[1]) {
          artist = decodeHtml(metaArtistMatch[1]) ?? artist;
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
  // Try oEmbed API first
  try {
    const endpoint = `https://api.deezer.com/oembed?format=json&url=${encodeURIComponent(url)}`;
    const response = await fetch(endpoint, { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();

      if (data?.title || data?.author_name) {
        return {
          title: data?.title ?? undefined,
          artist: data?.author_name ?? undefined,
          artworkUrl: data?.thumbnail ?? data?.thumbnail_url ?? undefined,
        };
      }
    }
  } catch {
    // oEmbed failed, continue to fallback
  }

  // Fallback: try direct scraping for link.deezer.com URLs
  if (url.includes("link.deezer.com")) {
    try {
      const response = await fetch(url, {
        cache: "no-store",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
      });

      if (response.ok) {
        const html = await response.text();

        // Extract artwork URL from various sources
        let artworkUrl: string | undefined;

        // Try to find artwork in meta tags
        const ogImageMatch = html.match(
          /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i,
        );
        if (ogImageMatch) {
          artworkUrl = ogImageMatch[1];
        }

        // Try to find artwork in JSON-LD structured data
        if (!artworkUrl) {
          const jsonLdMatch = html.match(
            /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i,
          );
          if (jsonLdMatch) {
            try {
              const jsonData = JSON.parse(jsonLdMatch[1]);
              if (jsonData.image) {
                artworkUrl = Array.isArray(jsonData.image)
                  ? jsonData.image[0]
                  : jsonData.image;
              }
            } catch {
              // Failed to parse JSON-LD, continue
            }
          }
        }

        // Try to find artwork in img tags with specific classes
        if (!artworkUrl) {
          const imgMatch = html.match(
            /<img[^>]*class=["'][^"']*cover[^"']*["'][^>]*src=["']([^"']+)["'][^>]*>/i,
          );
          if (imgMatch) {
            artworkUrl = imgMatch[1];
          }
        }

        // Extract title from page title
        const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
        let title: string | undefined;
        let artist: string | undefined;

        if (titleMatch) {
          const titleText = titleMatch[1];

          // Remove Deezer branding first
          const cleanTitle = titleText
            .replace(/\|\s*Deezer.*$/i, "")
            .replace(/\s*-\s*Deezer.*$/i, "")
            .trim();

          // Try to extract artist and track title from various patterns
          const patterns = [
            // Pattern: "Track Title - Artist | Deezer" or "Track Title by Artist | Deezer"
            /^(.+?)\s*-\s*(.+?)(?:\s*\|.*)?$/i,
            /^(.+?)\s+by\s+(.+?)(?:\s*\|.*)?$/i,
            // Pattern: "Artist - Track Title | Deezer"
            /^(.+?)\s*-\s*(.+?)(?:\s*\|.*)?$/i,
          ];

          let foundPattern = false;
          for (const pattern of patterns) {
            const match = cleanTitle.match(pattern);
            if (match && match[1] && match[2]) {
              const part1 = match[1].trim();
              const part2 = match[2].trim();

              // Determine which part is likely the artist vs track title
              // If part2 contains common track indicators, part1 is artist
              if (
                part2.match(/\b(track|song|single|ep|album)\b/i) ||
                part1.length > part2.length
              ) {
                artist = part1;
                title = part2;
              } else {
                // Otherwise, assume part1 is track title and part2 is artist
                title = part1;
                artist = part2;
              }

              foundPattern = true;
              break;
            }
          }

          // If no pattern matched, try to extract from "by Artist" patterns
          if (!foundPattern) {
            const artistPatterns = [
              /by\s+([^|—]+)\s*\|/i, // "by Artist |"
              /by\s+([^|—]+)$/i, // "by Artist" at end
              /—\s*([^|—]+)\s*—/i, // "— Artist —"
            ];

            for (const pattern of artistPatterns) {
              const match = cleanTitle.match(pattern);
              if (match && match[1]) {
                artist = match[1].trim();
                title = cleanTitle.replace(pattern, "").trim();
                foundPattern = true;
                break;
              }
            }
          }

          // If still no pattern matched, use the whole title as track title
          if (!foundPattern) {
            title = cleanTitle;
          }
        }

        return {
          title: title || undefined,
          artist: artist || undefined,
          artworkUrl: artworkUrl || undefined,
        };
      }
    } catch {
      // Direct scraping failed, return null
    }
  }

  return null;
}

async function fetchAppleMusicMetadata(
  url: string,
): Promise<MusicMetadata | null> {
  try {
    // Try iTunes API first for some URLs
    const endpoint = `https://itunes.apple.com/lookup?url=${encodeURIComponent(url)}`;
    const response = await fetch(endpoint, { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      const item = data?.results?.[0];
      if (item) {
        const artwork =
          item.artworkUrl100 ?? item.artworkUrl60 ?? item.artworkUrl512;
        return {
          title:
            item.trackName ??
            item.collectionName ??
            item.playlistName ??
            undefined,
          artist: item.artistName ?? undefined,
          artworkUrl:
            typeof artwork === "string"
              ? artwork.replace("100x100", "600x600")
              : undefined,
        };
      }
    }
  } catch (error) {
    console.error("iTunes API failed, trying direct scraping", error);
  }

  // Fallback: scrape Apple Music page directly
  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!response.ok) return null;
    const html = await response.text();

    // Extract title from page title or meta tags
    let title: string | undefined;
    let artist: string | undefined;
    let artworkUrl: string | undefined;

    // Try to get title from page title
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) {
      const titleText = titleMatch[1];
      // Remove "— music by" and other Apple Music branding in multiple languages
      title = titleText
        .replace(/—\s*music\s*by.*$/i, "")
        .replace(/—\s*música\s*de.*$/i, "")
        .replace(/—\s*musique\s*de.*$/i, "")
        .replace(/—\s*musik\s*von.*$/i, "")
        .replace(/—\s*álbum\s*de.*$/i, "")
        .replace(/—\s*album\s*by.*$/i, "")
        .replace(/—\s*playlist\s*by.*$/i, "")
        .replace(/—\s*playlist\s*de.*$/i, "")
        .replace(/\|\s*Apple\s*Music.*$/i, "")
        .replace(/\s*—\s*Apple\s*Music.*$/i, "")
        .trim();
    }

    // Try to get artist from page title
    if (titleMatch) {
      const titleText = titleMatch[1];
      // Try multiple patterns for different languages
      const patterns = [
        /—\s*music\s*by\s*([^|—]+)/i, // English: "— music by Artist"
        /—\s*música\s*de\s*([^|—]+)/i, // Spanish: "— música de Artist"
        /—\s*musique\s*de\s*([^|—]+)/i, // French: "— musique de Artist"
        /—\s*musik\s*von\s*([^|—]+)/i, // German: "— musik von Artist"
        /—\s*álbum\s*de\s*([^|—]+)/i, // Spanish: "— álbum de Artist"
        /—\s*album\s*by\s*([^|—]+)/i, // English: "— album by Artist"
        /—\s*playlist\s*by\s*([^|—]+)/i, // English: "— playlist by Artist"
        /—\s*playlist\s*de\s*([^|—]+)/i, // Spanish: "— playlist de Artist"
        /—\s*([^|—]+)\s*—\s*Apple\s*Music/i, // General: "— Artist — Apple Music"
      ];

      for (const pattern of patterns) {
        const match = titleText.match(pattern);
        if (match && match[1]) {
          artist = match[1].trim();
          break;
        }
      }
    }

    // Try to get artwork from meta tags
    const ogImageMatch = html.match(
      /<meta\s+property="og:image"\s+content="([^"]+)"/i,
    );
    if (ogImageMatch) {
      artworkUrl = ogImageMatch[1];
    }

    return {
      title: title || undefined,
      artist: artist || undefined,
      artworkUrl: artworkUrl || undefined,
    };
  } catch (error) {
    console.error("Apple Music direct scraping failed", error);
    return null;
  }
}

async function fetchAmazonMusicMetadata(
  url: string,
): Promise<MusicMetadata | null> {
  // Try multiple oEmbed services
  const oembedServices = [
    `https://noembed.com/embed?url=${encodeURIComponent(url)}`,
    `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`,
    `https://www.facebook.com/plugins/post/oembed.json/?url=${encodeURIComponent(url)}`,
  ];

  for (const endpoint of oembedServices) {
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        if (!data?.error && (data?.title || data?.author_name)) {
          return {
            title: data?.title ?? undefined,
            artist: data?.author_name ?? undefined,
            artworkUrl: data?.thumbnail_url ?? undefined,
          };
        }
      }
    } catch {
      // oEmbed service failed, continue to next
    }
  }

  // Fallback: scrape Amazon Music page directly with enhanced headers
  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        DNT: "1",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Cache-Control": "max-age=0",
      },
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();

    // Extract title from page title
    let title: string | undefined;
    let artist: string | undefined;
    let artworkUrl: string | undefined;

    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) {
      const titleText = titleMatch[1];
      // Remove Amazon Music branding
      title = titleText
        .replace(/\|\s*Amazon\s*Music.*$/i, "")
        .replace(/\s*-\s*Amazon\s*Music.*$/i, "")
        .trim();

      // Try to extract artist from title patterns
      const artistPatterns = [
        /—\s*([^|—]+)\s*—\s*Amazon\s*Music/i, // "— Artist — Amazon Music"
        /by\s+([^|—]+)\s*—\s*Amazon\s*Music/i, // "by Artist — Amazon Music"
        /from\s+([^|—]+)\s*—\s*Amazon\s*Music/i, // "from Artist — Amazon Music"
        /([^|—]+)\s*—\s*Amazon\s*Music/i, // "Artist — Amazon Music"
        /^(.+?)\s*-\s*(.+?)(?:\s*\|.*)?$/i, // "Track - Artist" or "Artist - Track"
        /^(.+?)\s+by\s+(.+?)(?:\s*\|.*)?$/i, // "Track by Artist"
      ];

      for (const pattern of artistPatterns) {
        const match = titleText.match(pattern);
        if (match && match[1] && match[2]) {
          const part1 = match[1].trim();
          const part2 = match[2].trim();

          // Determine which part is likely the artist vs track title
          if (
            part2.match(/\b(track|song|single|ep|album)\b/i) ||
            part1.length > part2.length
          ) {
            artist = part1;
            title = part2;
          } else {
            title = part1;
            artist = part2;
          }
          break;
        } else if (match && match[1]) {
          artist = match[1].trim();
          title = titleText
            .replace(pattern, "")
            .replace(/\|\s*Amazon\s*Music.*$/i, "")
            .trim();
          break;
        }
      }
    }

    // Try to get artist from meta tags if not found in title
    if (!artist) {
      const metaArtistMatch = html.match(
        /<meta\s+name="music:musician"\s+content="([^"]+)"/i,
      );
      if (metaArtistMatch && metaArtistMatch[1]) {
        artist = metaArtistMatch[1].trim();
      }
    }

    // Try to get artist from structured data
    if (!artist) {
      const structuredDataMatch = html.match(
        /"artist":\s*{\s*"@type":\s*"Person",\s*"name":\s*"([^"]+)"/i,
      );
      if (structuredDataMatch && structuredDataMatch[1]) {
        artist = structuredDataMatch[1].trim();
      }
    }

    // Try to get artwork from meta tags
    const ogImageMatch = html.match(
      /<meta\s+property="og:image"\s+content="([^"]+)"/i,
    );
    if (ogImageMatch) {
      artworkUrl = ogImageMatch[1];
    }

    // Only return metadata if we have actual content, not generic fallbacks
    if (
      title &&
      artist &&
      title !== "Amazon Music" &&
      artist !== "Unknown Artist"
    ) {
      return {
        title: title,
        artist: artist,
        artworkUrl: artworkUrl || undefined,
      };
    }

    // Return null instead of generic titles when we can't extract real metadata
    return null;
  } catch {
    return null;
  }
}

async function fetchTidalMetadata(url: string): Promise<MusicMetadata | null> {
  // Try noembed first
  try {
    const endpoint = `https://noembed.com/embed?url=${encodeURIComponent(url)}`;
    const response = await fetch(endpoint, { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      if (!data?.error) {
        const title = data?.title
          ? data.title
              .replace(/&amp;/g, "&")
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
          : undefined;
        const artist = data?.author_name
          ? data.author_name
              .replace(/&amp;/g, "&")
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
          : undefined;
        return {
          title,
          artist,
          artworkUrl: data?.thumbnail_url ?? undefined,
        };
      }
    }
  } catch (error) {
    console.error("noembed failed for Tidal, trying direct scraping", error);
  }

  // Fallback: scrape Tidal page directly
  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!response.ok) return null;
    const html = await response.text();

    // Extract title from page title
    let title: string | undefined;
    let artist: string | undefined;
    let artworkUrl: string | undefined;

    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) {
      const titleText = titleMatch[1];
      console.log("Tidal raw title:", titleText);

      // Remove Tidal branding and extract artist
      title = titleText
        .replace(/\|\s*TIDAL.*$/i, "")
        .replace(/\s*-\s*TIDAL.*$/i, "")
        .replace(/\s*on\s*TIDAL.*$/i, "")
        .trim();

      console.log("Tidal cleaned title:", title);

      // Try to extract artist from title patterns
      const artistPatterns = [
        /by\s+([^|—]+)\s*on\s*TIDAL/i, // "by Artist on TIDAL"
        /by\s+([^|—]+)\s*—\s*TIDAL/i, // "by Artist — TIDAL"
        /by\s+([^|—]+)\s*\|/i, // "by Artist |"
        /by\s+([^|—]+)$/i, // "by Artist" at end
        /—\s*([^|—]+)\s*—\s*TIDAL/i, // "— Artist — TIDAL"
        /—\s*([^|—]+)\s*on\s*TIDAL/i, // "— Artist on TIDAL"
      ];

      for (const pattern of artistPatterns) {
        const match = titleText.match(pattern);
        if (match && match[1]) {
          artist = match[1].trim();
          // Decode HTML entities
          artist = artist
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");
          console.log("Tidal artist found:", artist);
          // Clean up the title by removing the artist part
          title = titleText
            .replace(pattern, "")
            .replace(/\|\s*TIDAL.*$/i, "")
            .replace(/\s*-\s*TIDAL.*$/i, "")
            .replace(/\s*on\s*TIDAL.*$/i, "")
            .trim();
          // Also decode HTML entities in title
          title = title
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");
          break;
        }
      }
    }

    // Try to get artist from meta tags if not found in title
    if (!artist) {
      const metaArtistMatch = html.match(
        /<meta\s+name="music:musician"\s+content="([^"]+)"/i,
      );
      if (metaArtistMatch && metaArtistMatch[1]) {
        artist = metaArtistMatch[1].trim();
        // Decode HTML entities
        artist = artist
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");
        console.log("Tidal artist from meta tag:", artist);
      }
    }

    // Try to get artist from structured data
    if (!artist) {
      const structuredDataMatch = html.match(
        /"artist":\s*{\s*"@type":\s*"Person",\s*"name":\s*"([^"]+)"/i,
      );
      if (structuredDataMatch && structuredDataMatch[1]) {
        artist = structuredDataMatch[1].trim();
        // Decode HTML entities
        artist = artist
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");
        console.log("Tidal artist from structured data:", artist);
      }
    }

    // Try to get artwork from meta tags
    const ogImageMatch = html.match(
      /<meta\s+property="og:image"\s+content="([^"]+)"/i,
    );
    if (ogImageMatch) {
      artworkUrl = ogImageMatch[1];
    }

    const result = {
      title: title || undefined,
      artist: artist || undefined,
      artworkUrl: artworkUrl || undefined,
    };
    console.log("Tidal metadata result:", result);
    return result;
  } catch (error) {
    console.error("Tidal direct scraping failed", error);
    return null;
  }
}

async function fetchYouTubeMusicMetadata(
  url: string,
): Promise<MusicMetadata | null> {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!response.ok) return null;
    const html = await response.text();

    let title: string | undefined;
    let artist: string | undefined;
    let artworkUrl: string | undefined;

    // Extract title from page title
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) {
      const titleText = titleMatch[1];
      // Remove YouTube Music branding
      title = titleText
        .replace(/\|\s*YouTube\s*Music.*$/i, "")
        .replace(/\s*-\s*YouTube\s*Music.*$/i, "")
        .trim();
    }

    // Try alternative title extraction patterns
    if (!title || title === "YouTube Music") {
      // Pattern 1: Look for JSON-LD structured data
      const jsonLdMatch = html.match(/"name":\s*"([^"]+)"/i);
      if (jsonLdMatch && jsonLdMatch[1] && jsonLdMatch[1] !== "YouTube Music") {
        title = jsonLdMatch[1].trim();
      }
    }

    if (!title || title === "YouTube Music") {
      // Pattern 2: Look for og:title meta tag
      const ogTitleMatch = html.match(
        /<meta\s+property="og:title"\s+content="([^"]+)"/i,
      );
      if (
        ogTitleMatch &&
        ogTitleMatch[1] &&
        ogTitleMatch[1] !== "YouTube Music"
      ) {
        title = ogTitleMatch[1].trim();
      }
    }

    if (!title || title === "YouTube Music") {
      // Pattern 3: Look for h1 tag
      const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
      if (h1Match && h1Match[1] && h1Match[1] !== "YouTube Music") {
        title = h1Match[1].trim();
      }
    }

    // Try to extract artist from various sources
    // Pattern 1: Look for artist in meta tags
    const metaArtistMatch = html.match(
      /<meta\s+name="music:musician"\s+content="([^"]+)"/i,
    );
    if (metaArtistMatch && metaArtistMatch[1]) {
      artist = metaArtistMatch[1].trim();
    }

    // Pattern 2: Look for artist in structured data
    if (!artist) {
      const structuredDataMatch = html.match(
        /"artist":\s*{\s*"@type":\s*"Person",\s*"name":\s*"([^"]+)"/i,
      );
      if (structuredDataMatch && structuredDataMatch[1]) {
        artist = structuredDataMatch[1].trim();
      }
    }

    // Pattern 3: Look for artist in JSON-LD data
    if (!artist) {
      const jsonLdArtistMatch = html.match(
        /"byArtist":\s*{\s*"@type":\s*"Person",\s*"name":\s*"([^"]+)"/i,
      );
      if (jsonLdArtistMatch && jsonLdArtistMatch[1]) {
        artist = jsonLdArtistMatch[1].trim();
      }
    }

    // Pattern 4: Look for artist in title (e.g., "Song Name - Artist Name")
    if (!artist && title && title !== "YouTube Music") {
      const dashIndex = title.lastIndexOf(" - ");
      if (dashIndex !== -1) {
        const potentialArtist = title.slice(dashIndex + 3).trim();
        if (potentialArtist && potentialArtist.length > 0) {
          artist = potentialArtist;
          title = title.slice(0, dashIndex).trim();
        }
      }
    }

    // Pattern 5: Look for artist in channel name or uploader
    if (!artist) {
      const channelMatch = html.match(/"uploader":\s*"([^"]+)"/i);
      if (channelMatch && channelMatch[1]) {
        artist = channelMatch[1].trim();
      }
    }

    // Try to get artwork from meta tags
    const ogImageMatch = html.match(
      /<meta\s+property="og:image"\s+content="([^"]+)"/i,
    );
    if (ogImageMatch) {
      artworkUrl = ogImageMatch[1];
    }

    // If we didn't get good metadata from HTML scraping, try YouTube oEmbed API as fallback
    if ((!title || title === "YouTube Music") && !artist) {
      const videoIdMatch = url.match(/[?&]v=([^&]+)/);
      if (videoIdMatch && videoIdMatch[1]) {
        const videoId = videoIdMatch[1];

        try {
          // Try to get metadata from YouTube oEmbed API (no API key needed for basic info)
          const apiUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

          const apiResponse = await fetch(apiUrl, { cache: "no-store" });
          if (apiResponse.ok) {
            const apiData = await apiResponse.json();

            if (apiData.title && apiData.title !== "YouTube Music") {
              title = apiData.title;
            }

            if (apiData.author_name) {
              artist = apiData.author_name;
            }

            if (apiData.thumbnail_url) {
              artworkUrl = apiData.thumbnail_url;
            }
          }
        } catch (apiError) {
          console.error("YouTube oEmbed API fallback failed:", apiError);
        }
      }
    }

    return {
      title: title || undefined,
      artist: artist || undefined,
      artworkUrl: artworkUrl || undefined,
    };
  } catch (error) {
    console.error("YouTube Music metadata fetching failed", error);
    return null;
  }
}

async function fetchGenericMetadata(
  url: string,
): Promise<MusicMetadata | null> {
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

  if (url.includes("music.youtube.com")) {
    return await fetchYouTubeMusicMetadata(url);
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
      return NextResponse.json({ error: "Missing url." }, { status: 400 });
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
