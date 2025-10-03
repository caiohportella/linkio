import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  SiInstagram,
  SiTiktok,
  SiYoutube,
  SiYoutubemusic,
  SiLinkedin,
  SiGithub,
  SiWhatsapp,
  SiSpotify,
  SiLetterboxd,
  SiGoodreads,
  SiTidal,
  SiTvtime,
  SiReddit,
  SiSteam,
  SiDuolingo,
  SiVsco,
  SiTelegram,
} from "react-icons/si";
import { RiTwitterXFill, RiThreadsFill } from "react-icons/ri";
import { FaDeezer, FaAmazon, FaApple } from "react-icons/fa";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Streaming platform embed utilities
export function extractSpotifyPlaylistId(url: string): string | null {
  const match = url.match(/spotify\.com\/playlist\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

export function generateSpotifyEmbedUrl(playlistId: string): string {
  return `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator`;
}

export function isSpotifyPlaylist(url: string): boolean {
  return /spotify\.com\/playlist\//.test(url);
}

// Tidal embed utilities
export function extractTidalPlaylistId(url: string): string | null {
  const match = url.match(/tidal\.com\/playlist\/([a-zA-Z0-9-]+)/);
  return match ? match[1] : null;
}

export function generateTidalEmbedUrl(playlistId: string): string {
  return `https://embed.tidal.com/playlists/${playlistId}`;
}

export function isTidalPlaylist(url: string): boolean {
  return /tidal\.com\/playlist\//.test(url);
}

// Deezer embed utilities
export function extractDeezerPlaylistId(url: string): string | null {
  // Try multiple Deezer URL patterns
  const patterns = [
    /deezer\.com\/[a-z]+\/playlist\/(\d+)/, // deezer.com/en/playlist/123456
    /deezer\.com\/playlist\/(\d+)/, // deezer.com/playlist/123456
    /deezer\.com\/[a-z]+\/playlist\/(\d+)\?/, // with query params
    /deezer\.com\/playlist\/(\d+)\?/, // with query params
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function generateDeezerEmbedUrl(playlistId: string): string {
  return `https://widget.deezer.com/widget/dark/playlist/${playlistId}`;
}

export function isDeezerPlaylist(url: string): boolean {
  return /deezer\.com.*playlist\//.test(url) || /link\.deezer\.com/.test(url);
}

// Apple Music embed utilities
export function extractAppleMusicPlaylistId(url: string): string | null {
  const match = url.match(
    /music\.apple\.com\/[a-z]{2}\/playlist\/[^/]+\/([a-zA-Z0-9.-]+)/,
  );
  return match ? match[1] : null;
}

export function generateAppleMusicEmbedUrl(
  playlistId: string,
  region: string = "us",
): string {
  return `https://embed.music.apple.com/${region}/playlist/${playlistId}`;
}

export function isAppleMusicPlaylist(url: string): boolean {
  return /music\.apple\.com\/[a-z]+\/playlist\//.test(url);
}

// Apple Music link utilities
export function extractAppleMusicTrackId(url: string): string | null {
  const match = url.match(
    /music\.apple\.com\/[a-z]{2}\/song\/[^/]+\/(\d+)(?:\?i=(\d+))?/,
  );
  return match ? match[2] || match[1] : null;
}

export function extractAppleMusicAlbumId(url: string): string | null {
  const match = url.match(/music\.apple\.com\/[a-z]{2}\/album\/[^/]+\/(\d+)/);
  return match ? match[1] : null;
}

export function extractAppleMusicRegion(url: string): string | null {
  const match = url.match(/music\.apple\.com\/([a-z]{2})\//);
  return match ? match[1] : null;
}

export function shortenAppleMusicUrl(url: string): string {
  const region = extractAppleMusicRegion(url) || "us";

  // Extract track ID and create shortened URL
  const trackId = extractAppleMusicTrackId(url);
  if (trackId) {
    return `https://music.apple.com/${region}/song/${trackId}`;
  }

  // Extract album ID and create shortened URL
  const albumId = extractAppleMusicAlbumId(url);
  if (albumId) {
    return `https://music.apple.com/${region}/album/${albumId}`;
  }

  // Extract playlist ID and create shortened URL
  const playlistId = extractAppleMusicPlaylistId(url);
  if (playlistId) {
    return `https://music.apple.com/${region}/playlist/${playlistId}`;
  }

  return url; // Return original if no pattern matches
}

// YouTube Music embed utilities
export function extractYouTubeMusicPlaylistId(url: string): string | null {
  const match = url.match(
    /music\.youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+)/,
  );
  return match ? match[1] : null;
}

export function generateYouTubeMusicEmbedUrl(playlistId: string): string {
  return `https://www.youtube.com/embed/videoseries?list=${playlistId}`;
}

export function isYouTubeMusicPlaylist(url: string): boolean {
  return /music\.youtube\.com\/playlist\//.test(url);
}

export function formatDateTime(
  timestamp: number,
  options?: Intl.DateTimeFormatOptions,
) {
  const date = new Date(timestamp);
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    ...options,
  });
}

export function getBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  const isProduction = process.env.NODE_ENV == "production";

  if (isProduction) {
    // Always prioritize the custom domain if set
    if (process.env.NEXT_PUBLIC_APP_URL) {
      return process.env.NEXT_PUBLIC_APP_URL;
    }

    // Fallback to Vercel's production URL (your custom domain)
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
      return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    }

    // Last resort: use the deployment URL (not recommended for production)
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }

    throw new Error(
      "No production URL configured. Please set NEXT_PUBLIC_APP_URL environment variable.",
    );
  }

  return "http://localhost:3000";
}

export const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";

  return new Date(dateString).toLocaleDateString("pt-BR", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatReferrer = (referrer: string | null) => {
  if (!referrer || referrer == "direct") return "Direct";

  try {
    const url = new URL(referrer);

    return url.hostname.replace("www.", "");
  } catch {
    return referrer;
  }
};

export const formatUrl = (url: string) => {
  try {
    const urlObj = new URL(url);

    return urlObj.hostname.replace("www.", "");
  } catch {
    return url;
  }
};

export const SUPPORTED_SOCIALS = [
  {
    name: "Instagram",
    icon: SiInstagram,
    baseUrl: "https://www.instagram.com/",
    brandColor: "#E4405F",
  },
  {
    name: "TikTok",
    icon: SiTiktok,
    baseUrl: "https://www.tiktok.com/@",
    brandColor: "#000000",
  },
  {
    name: "YouTube",
    icon: SiYoutube,
    baseUrl: "https://www.youtube.com/@",
    brandColor: "#FF0000",
  },
  {
    name: "LinkedIn",
    icon: SiLinkedin,
    baseUrl: "https://www.linkedin.com/in/",
    brandColor: "#0A66C2",
  },
  {
    name: "GitHub",
    icon: SiGithub,
    baseUrl: "https://www.github.com/",
    brandColor: "#181717",
  },
  {
    name: "WhatsApp",
    icon: SiWhatsapp,
    baseUrl: "https://wa.me/",
    brandColor: "#25D366",
  },
  {
    name: "X",
    icon: RiTwitterXFill,
    baseUrl: "https://x.com/",
    brandColor: "#000000",
  },
  {
    name: "Spotify",
    icon: SiSpotify,
    baseUrl: "spotify:user:",
    brandColor: "#1ED760",
  },
  {
    name: "Letterboxd",
    icon: SiLetterboxd,
    baseUrl: "https://letterboxd.com/",
    brandColor: "#FF8000",
  },
  {
    name: "Goodreads",
    icon: SiGoodreads,
    baseUrl: "https://www.goodreads.com/user/show/",
    brandColor: "#633A18",
  },
  {
    name: "Threads",
    icon: RiThreadsFill,
    baseUrl: "https://www.threads.com/@",
    brandColor: "#000000",
  },
  {
    name: "TV Time",
    icon: SiTvtime,
    baseUrl: "https://tvtime.com/r/",
    brandColor: "#373737",
  },
  {
    name: "Reddit",
    icon: SiReddit,
    baseUrl: "https://www.reddit.com/user/",
    brandColor: "#FF4500",
  },
  {
    name: "Telegram",
    icon: SiTelegram,
    baseUrl: "https://t.me/",
    brandColor: "#0088CC",
  },
  {
    name: "Steam",
    icon: SiSteam,
    baseUrl: "https://steamcommunity.com/id/",
    brandColor: "#171A21",
  },
  {
    name: "Duolingo",
    icon: SiDuolingo,
    baseUrl: "https://www.duolingo.com/profile/",
    brandColor: "#58CC02",
  },
  {
    name: "VSCO",
    icon: SiVsco,
    baseUrl: "https://vsco.co/",
    brandColor: "#000000",
  },
];

export const SUPPORTED_MUSIC_PLATFORMS = [
  {
    name: "Spotify",
    icon: SiSpotify,
    brandColor: "#1ED760",
    linkTypes: [
      {
        type: "track",
        label: "Track Link",
        placeholder: "e.g., 3Fuqn0M6R7z8hBvB22K1jR",
        urlPattern:
          /^https?:\/\/open\.spotify\.com\/track\/[a-zA-Z0-9]+(?=\?|$)/,
        baseUrl: "https://open.spotify.com/track/",
      },
      {
        type: "album",
        label: "Album Link",
        placeholder: "e.g., 4aawyAB9vmqN3uQ7FjRGTy",
        urlPattern:
          /^https?:\/\/open\.spotify\.com\/album\/[a-zA-Z0-9]+(?=\?|$)/,
        baseUrl: "https://open.spotify.com/album/",
      },
      {
        type: "playlist",
        label: "Playlist Link",
        placeholder: "e.g., 37i9dQZF1DXcBWIGoYBM5M",
        urlPattern:
          /^https?:\/\/open\.spotify\.com\/playlist\/[a-zA-Z0-9]+(?=\?|$)/,
        baseUrl: "https://open.spotify.com/playlist/",
      },
    ],
  },
  {
    name: "Apple Music",
    icon: FaApple,
    brandColor: "#FC3C44",
    linkTypes: [
      {
        type: "track",
        label: "Track Link",
        placeholder:
          "e.g., https://music.apple.com/us/song/the-fate-of-ophelia/1838810951",
        urlPattern:
          /^https?:\/\/music\.apple\.com\/[a-z]{2}\/song\/(?:[^/]+\/)?\d+(?:\?i=\d+)?/,
        baseUrl: "https://music.apple.com/us/song/",
      },
      {
        type: "album",
        label: "Album Link",
        placeholder:
          "e.g., https://music.apple.com/br/album/electric-dusk/1699908490",
        urlPattern:
          /^https?:\/\/music\.apple\.com\/[a-z]{2}\/album\/[^/]+\/\d+/,
        baseUrl: "https://music.apple.com/us/album/",
      },
      {
        type: "playlist",
        label: "Playlist Link",
        placeholder:
          "e.g., https://music.apple.com/us/playlist/new-music-daily/pl.2b0e6e332fdf4b7a91164da3162127b5",
        urlPattern:
          /^https?:\/\/music\.apple\.com\/[a-z]{2}\/playlist\/[^/]+\/pl\.[a-zA-Z0-9.-]+/,
        baseUrl: "https://music.apple.com/us/playlist/",
      },
    ],
  },
  {
    name: "Deezer",
    icon: FaDeezer,
    brandColor: "#A53DFF",
    linkTypes: [
      {
        type: "track",
        label: "Track Link",
        placeholder: "e.g., link.deezer.com/s/...",
        urlPattern: /^https?:\/\/link\.deezer\.com\/s\/[A-Za-z0-9]+/,
        baseUrl: "https://link.deezer.com/s/",
      },
      {
        type: "album",
        label: "Album Link",
        placeholder: "e.g., link.deezer.com/s/...",
        urlPattern: /^https?:\/\/link\.deezer\.com\/s\/[A-Za-z0-9]+/,
        baseUrl: "https://link.deezer.com/s/",
      },
      {
        type: "playlist",
        label: "Playlist Link",
        placeholder: "e.g., link.deezer.com/s/...",
        urlPattern: /^https?:\/\/link\.deezer\.com\/s\/[A-Za-z0-9]+/,
        baseUrl: "https://link.deezer.com/s/",
      },
    ],
  },
  {
    name: "Tidal",
    icon: SiTidal,
    brandColor: "#000000",
    linkTypes: [
      {
        type: "track",
        label: "Track Link",
        placeholder: "e.g., 123456789",
        urlPattern: /^https?:\/\/(www\.)?tidal\.com\/track\/[A-Za-z0-9]+/,
        baseUrl: "https://tidal.com/track/",
      },
      {
        type: "album",
        label: "Album Link",
        placeholder: "e.g., 987654321",
        urlPattern:
          /^https?:\/\/(www\.)?tidal\.com\/album\/[A-Za-z0-9]+(?:\/.*)?/,
        baseUrl: "https://tidal.com/album/",
      },
      {
        type: "playlist",
        label: "Playlist Link",
        placeholder: "e.g., 543219876",
        urlPattern: /^https?:\/\/(www\.)?tidal\.com\/playlist\/[A-Za-z0-9]+/,
        baseUrl: "https://tidal.com/playlist/",
      },
    ],
  },
  {
    name: "Amazon Music",
    icon: FaAmazon,
    brandColor: "#7EDDE6",
    linkTypes: [
      {
        type: "track",
        label: "Track Link",
        placeholder: "e.g., B0D4MHK5GR?trackAsin=B0D4MG65CV",
        urlPattern:
          /^https?:\/\/(?:music\.amazon\.com|www\.amazon)\.[a-z]{2,3}\/albums\/B0[a-zA-Z0-9]+\?.*trackAsin=B0[a-zA-Z0-9]+/,
        baseUrl: "https://music.amazon.com.br/albums/",
      },
      {
        type: "album",
        label: "Album Link",
        placeholder: "e.g., B0D4MHK5GR",
        urlPattern:
          /^https?:\/\/(?:music\.amazon\.com|www\.amazon)\.[a-z]{2,3}\/albums\/B0[a-zA-Z0-9]+(?:\?|$)/,
        baseUrl: "https://music.amazon.com.br/albums/",
      },
      {
        type: "playlist",
        label: "Playlist Link",
        placeholder: "e.g., B0FNH75VSB",
        urlPattern:
          /^https?:\/\/(?:music\.amazon\.com|www\.amazon)\.[a-z]{2,3}\/playlists\/B0[a-zA-Z0-9]+(?:\?|$)/,
        baseUrl: "https://music.amazon.com.br/playlists/",
      },
    ],
  },
  {
    name: "YouTube Music",
    icon: SiYoutubemusic,
    brandColor: "#FF0000",
    linkTypes: [
      {
        type: "track",
        label: "Track Link",
        placeholder: "e.g., LTnm6vv3Hp0",
        urlPattern: /^https?:\/\/music\.youtube\.com\/watch\?v=[a-zA-Z0-9_-]+/,
        baseUrl: "https://music.youtube.com/watch?v=",
      },
      {
        type: "playlist",
        label: "Playlist/Album Link",
        placeholder: "e.g., OLAK5uy_kqc29SUksz2bfmMuKVtIzn_-LuTd6aCpE",
        urlPattern:
          /^https?:\/\/music\.youtube\.com\/playlist\?list=[a-zA-Z0-9_-]+/,
        baseUrl: "https://music.youtube.com/playlist?list=",
      },
    ],
  },
];

export function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function buildAppleMusicUrl(
  region: string,
  type: string,
  path: string,
): string {
  return `https://music.apple.com/${region}/${type}/${path}`;
}

export function extractAmazonMusicRegion(url: string): string | null {
  // Handle music.amazon.com (US) and music.amazon.com.xx (other regions)
  const match = url.match(
    /^https?:\/\/(?:music\.amazon\.com(?:\.([a-z]{2,3}))?|www\.amazon\.([a-z]{2,3}))/,
  );
  return match ? match[1] || match[2] || "us" : null;
}

export function buildAmazonMusicUrl(
  region: string,
  type: string,
  id: string,
): string {
  const domain =
    region === "us" ? "music.amazon.com" : `music.amazon.com.${region}`;
  return `https://${domain}/${type}s/${id}`;
}

export type MusicLinkItem = {
  platform: string;
  url: string;
  type: string;
  musicTrackTitle?: string;
  musicArtistName?: string;
  musicAlbumArtUrl?: string;
};

export type MediaPreview = {
  platform: "youtube";
  url: string;
  videoId: string;
  title: string;
  thumbnailUrl: string;
};
