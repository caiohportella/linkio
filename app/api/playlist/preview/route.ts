import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    console.log("Playlist API called with URL:", url);

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Determine platform and extract metadata
    let playlistData = null;

    if (url.includes("spotify.com")) {
      console.log("Detected Spotify playlist, fetching metadata...");
      playlistData = await fetchSpotifyPlaylistMetadata(url);
    } else if (url.includes("music.apple.com")) {
      console.log("Detected Apple Music playlist, fetching metadata...");
      playlistData = await fetchAppleMusicPlaylistMetadata(url);
    } else if (url.includes("music.youtube.com")) {
      console.log("Detected YouTube Music playlist, fetching metadata...");
      playlistData = await fetchYouTubeMusicPlaylistMetadata(url);
    } else if (url.includes("tidal.com")) {
      console.log("Detected Tidal playlist, fetching metadata...");
      playlistData = await fetchTidalPlaylistMetadata(url);
    } else if (url.includes("music.amazon.com")) {
      console.log("Detected Amazon Music playlist, fetching metadata...");
      playlistData = await fetchAmazonMusicPlaylistMetadata(url);
    } else if (url.includes("deezer.com")) {
      console.log("Detected Deezer playlist, fetching metadata...");
      playlistData = await fetchDeezerPlaylistMetadata(url);
    }

    console.log("Playlist data result:", playlistData);

    if (!playlistData) {
      return NextResponse.json(
        { error: "Unsupported playlist platform" },
        { status: 400 },
      );
    }

    return NextResponse.json(playlistData);
  } catch (error) {
    console.error("Playlist preview error:", error);
    return NextResponse.json(
      { error: "Failed to fetch playlist metadata" },
      { status: 500 },
    );
  }
}

async function fetchSpotifyPlaylistMetadata(url: string) {
  try {
    console.log("Fetching Spotify playlist metadata for URL:", url);

    // Extract playlist ID from URL
    const playlistIdMatch = url.match(/playlist\/([a-zA-Z0-9]+)/);
    if (!playlistIdMatch) {
      throw new Error("Invalid Spotify playlist URL");
    }

    const playlistId = playlistIdMatch[1];
    console.log("Extracted playlist ID:", playlistId);

    // Check if environment variables are set
    if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
      console.error("Spotify environment variables not set");
      throw new Error("Spotify API credentials not configured");
    }

    console.log("Getting Spotify access token...");
    // Get Spotify access token
    const tokenResponse = await fetch(
      "https://accounts.spotify.com/api/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
          ).toString("base64")}`,
        },
        body: "grant_type=client_credentials",
      },
    );

    if (!tokenResponse.ok) {
      throw new Error("Failed to get Spotify access token");
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get playlist details
    const playlistResponse = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!playlistResponse.ok) {
      throw new Error("Failed to get playlist details");
    }

    const playlistData = await playlistResponse.json();

    return {
      platform: "Spotify",
      url: url,
      playlistId: playlistId,
      title: playlistData.name,
      description: playlistData.description,
      thumbnailUrl: playlistData.images?.[0]?.url,
      trackCount: playlistData.tracks?.total || 0,
      ownerName: playlistData.owner?.display_name,
      tracks:
        playlistData.tracks?.items?.slice(0, 10).map(
          (item: {
            track?: {
              name?: string;
              artists?: { name?: string }[];
              duration_ms?: number;
              preview_url?: string;
            };
          }) => ({
            name: item.track?.name,
            artist: item.track?.artists?.[0]?.name,
            duration: item.track?.duration_ms
              ? formatDuration(item.track.duration_ms)
              : undefined,
            previewUrl: item.track?.preview_url,
          }),
        ) || [],
    };
  } catch (error) {
    console.error("Spotify playlist metadata error:", error);
    return null;
  }
}

async function fetchAppleMusicPlaylistMetadata(url: string) {
  try {
    // For Apple Music, we'll use a simple scraping approach
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Apple Music page");
    }

    const html = await response.text();

    // Extract title from page title or meta tags
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch
      ? titleMatch[1].replace(/[^\w\s-]/g, "").trim()
      : "Apple Music Playlist";

    // Extract artwork from meta tags
    const artworkMatch = html.match(
      /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
    );
    const artworkUrl = artworkMatch ? artworkMatch[1] : undefined;

    // Try to extract track count from various patterns
    let trackCount = 0;

    // Look for track count in meta description or other patterns
    const trackCountMatch = html.match(/(\d+)\s*(?:songs?|tracks?|tunes?)/i);
    if (trackCountMatch) {
      trackCount = parseInt(trackCountMatch[1]);
    }

    // Look for track count in JSON-LD structured data
    const jsonLdMatch = html.match(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i,
    );
    if (jsonLdMatch) {
      try {
        const jsonData = JSON.parse(jsonLdMatch[1]);
        if (
          jsonData.numTracks ||
          jsonData.trackCount ||
          jsonData.numberOfItems
        ) {
          trackCount =
            jsonData.numTracks || jsonData.trackCount || jsonData.numberOfItems;
        }
      } catch {
        // Ignore JSON parsing errors
      }
    }

    return {
      platform: "Apple Music",
      url: url,
      playlistId: url.split("/").pop() || "",
      title: title,
      description: "",
      thumbnailUrl: artworkUrl,
      trackCount: trackCount,
      ownerName: "Apple Music",
      tracks: [],
    };
  } catch (error) {
    console.error("Apple Music playlist metadata error:", error);
    return null;
  }
}

async function fetchYouTubeMusicPlaylistMetadata(url: string) {
  try {
    // First try oEmbed API
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const oembedResponse = await fetch(oembedUrl);

    let title = "YouTube Music Playlist";
    let thumbnailUrl = undefined;
    let ownerName = "YouTube Music";

    if (oembedResponse.ok) {
      const oembedData = await oembedResponse.json();
      title = oembedData.title || title;
      thumbnailUrl = oembedData.thumbnail_url;
      ownerName = oembedData.author_name || ownerName;
    }

    // Try to scrape the page for more detailed information
    let trackCount = 0;
    try {
      const pageResponse = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      if (pageResponse.ok) {
        const html = await pageResponse.text();

        // Look for track count in various patterns
        const trackCountMatch = html.match(
          /(\d+)\s*(?:songs?|tracks?|videos?)/i,
        );
        if (trackCountMatch) {
          trackCount = parseInt(trackCountMatch[1]);
        }

        // Look for track count in JSON-LD or other structured data
        const jsonLdMatch = html.match(
          /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i,
        );
        if (jsonLdMatch) {
          try {
            const jsonData = JSON.parse(jsonLdMatch[1]);
            if (
              jsonData.numTracks ||
              jsonData.trackCount ||
              jsonData.numberOfItems
            ) {
              trackCount =
                jsonData.numTracks ||
                jsonData.trackCount ||
                jsonData.numberOfItems;
            }
          } catch {
            // Ignore JSON parsing errors
          }
        }

        // Try to extract owner name from page content if not found in oEmbed
        if (!ownerName || ownerName === "YouTube Music") {
          // Look for channel/owner name in various patterns
          const ownerMatch =
            html.match(
              /"ownerText":\s*{\s*"runs":\s*\[\s*{\s*"text":\s*"([^"]+)"/i,
            ) ||
            html.match(/"channelName":\s*"([^"]+)"/i) ||
            html.match(/"author":\s*"([^"]+)"/i) ||
            html.match(
              /<meta[^>]*name=["']author["'][^>]*content=["']([^"']+)["']/i,
            );

          if (ownerMatch) {
            ownerName = ownerMatch[1];
          }
        }
      }
    } catch {
      // If scraping fails, continue with oEmbed data
    }

    return {
      platform: "YouTube Music",
      url: url,
      playlistId: url.split("list=")[1]?.split("&")[0] || "",
      title: title,
      description: "",
      thumbnailUrl: thumbnailUrl,
      trackCount: trackCount,
      ownerName: ownerName,
      tracks: [],
    };
  } catch (error) {
    console.error("YouTube Music playlist metadata error:", error);
    return null;
  }
}

async function fetchTidalPlaylistMetadata(url: string) {
  try {
    // For Tidal, we'll use a simple scraping approach
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Tidal page");
    }

    const html = await response.text();

    // Extract title from page title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch
      ? titleMatch[1].replace(/[^\w\s-]/g, "").trim()
      : "Tidal Playlist";

    // Extract artwork from meta tags
    const artworkMatch = html.match(
      /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
    );
    const artworkUrl = artworkMatch ? artworkMatch[1] : undefined;

    // Try to extract track count from various patterns
    let trackCount = 0;

    // Look for track count in meta description or other patterns
    const trackCountMatch = html.match(/(\d+)\s*(?:songs?|tracks?|tunes?)/i);
    if (trackCountMatch) {
      trackCount = parseInt(trackCountMatch[1]);
    }

    // Look for track count in JSON-LD structured data
    const jsonLdMatch = html.match(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i,
    );
    if (jsonLdMatch) {
      try {
        const jsonData = JSON.parse(jsonLdMatch[1]);
        if (
          jsonData.numTracks ||
          jsonData.trackCount ||
          jsonData.numberOfItems
        ) {
          trackCount =
            jsonData.numTracks || jsonData.trackCount || jsonData.numberOfItems;
        }
      } catch {
        // Ignore JSON parsing errors
      }
    }

    return {
      platform: "Tidal",
      url: url,
      playlistId: url.split("/").pop() || "",
      title: title,
      description: "",
      thumbnailUrl: artworkUrl,
      trackCount: trackCount,
      ownerName: "Tidal",
      tracks: [],
    };
  } catch (error) {
    console.error("Tidal playlist metadata error:", error);
    return null;
  }
}

async function fetchAmazonMusicPlaylistMetadata(url: string) {
  try {
    // For Amazon Music, we'll use a simple scraping approach
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Amazon Music page");
    }

    const html = await response.text();

    // Extract title from page title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch
      ? titleMatch[1].replace(/[^\w\s-]/g, "").trim()
      : "Amazon Music Playlist";

    // Extract artwork from meta tags
    const artworkMatch = html.match(
      /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
    );
    const artworkUrl = artworkMatch ? artworkMatch[1] : undefined;

    // Try to extract track count from various patterns
    let trackCount = 0;

    // Look for track count in meta description or other patterns
    const trackCountMatch = html.match(/(\d+)\s*(?:songs?|tracks?|tunes?)/i);
    if (trackCountMatch) {
      trackCount = parseInt(trackCountMatch[1]);
    }

    // Look for track count in JSON-LD structured data
    const jsonLdMatch = html.match(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i,
    );
    if (jsonLdMatch) {
      try {
        const jsonData = JSON.parse(jsonLdMatch[1]);
        if (
          jsonData.numTracks ||
          jsonData.trackCount ||
          jsonData.numberOfItems
        ) {
          trackCount =
            jsonData.numTracks || jsonData.trackCount || jsonData.numberOfItems;
        }
      } catch {
        // Ignore JSON parsing errors
      }
    }

    return {
      platform: "Amazon Music",
      url: url,
      playlistId: url.split("/").pop()?.split("?")[0] || "",
      title: title,
      description: "",
      thumbnailUrl: artworkUrl,
      trackCount: trackCount,
      ownerName: "Amazon Music",
      tracks: [],
    };
  } catch (error) {
    console.error("Amazon Music playlist metadata error:", error);
    return null;
  }
}

async function fetchDeezerPlaylistMetadata(url: string) {
  try {
    // For Deezer, we'll use a simple scraping approach
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Deezer page");
    }

    const html = await response.text();

    // Extract title from page title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch
      ? titleMatch[1].replace(/[^\w\s-]/g, "").trim()
      : "Deezer Playlist";

    // Extract artwork from meta tags
    const artworkMatch = html.match(
      /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
    );
    const artworkUrl = artworkMatch ? artworkMatch[1] : undefined;

    // Try to extract track count from various patterns
    let trackCount = 0;

    // Look for track count in meta description or other patterns
    const trackCountMatch = html.match(/(\d+)\s*(?:songs?|tracks?|tunes?)/i);
    if (trackCountMatch) {
      trackCount = parseInt(trackCountMatch[1]);
    }

    // Look for track count in JSON-LD structured data
    const jsonLdMatch = html.match(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i,
    );
    if (jsonLdMatch) {
      try {
        const jsonData = JSON.parse(jsonLdMatch[1]);
        if (
          jsonData.numTracks ||
          jsonData.trackCount ||
          jsonData.numberOfItems
        ) {
          trackCount =
            jsonData.numTracks || jsonData.trackCount || jsonData.numberOfItems;
        }
      } catch {
        // Ignore JSON parsing errors
      }
    }

    return {
      platform: "Deezer",
      url: url,
      playlistId: url.split("/").pop() || "",
      title: title,
      description: "",
      thumbnailUrl: artworkUrl,
      trackCount: trackCount,
      ownerName: "Deezer",
      tracks: [],
    };
  } catch (error) {
    console.error("Deezer playlist metadata error:", error);
    return null;
  }
}

function formatDuration(ms: number): string {
  if (!ms) return "0:00";
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}
