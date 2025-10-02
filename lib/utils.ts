import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  SiInstagram,
  SiTiktok,
  SiYoutube,
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
} from "react-icons/si";
import { RiTwitterXFill, RiThreadsFill } from "react-icons/ri";
import { FaDeezer, FaAmazon, FaApple } from "react-icons/fa";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(timestamp: number, options?: Intl.DateTimeFormatOptions) {
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
        placeholder: "e.g., 1440843428?i=1440843433",
        urlPattern:
          /^https?:\/\/music\.apple\.com\/[a-z]{2}\/song\/[^/]+\/\d+\?i=\d+/,
        baseUrl: "https://music.apple.com/br/song/",
      },
      {
        type: "album",
        label: "Album Link",
        placeholder: "e.g., 1440843428",
        urlPattern:
          /^https?:\/\/music\.apple\.com\/[a-z]{2}\/album\/[^/]+\/\d+/,
        baseUrl: "https://music.apple.com/br/album/",
      },
      {
        type: "playlist",
        label: "Playlist Link",
        placeholder: "e.g., pl.u-Ldbq5Zru2d9",
        urlPattern:
          /^https?:\/\/music\.apple\.com\/[a-z]{2}\/playlist\/[^/]+\/pl\.u-[a-zA-Z0-9]+/,
        baseUrl: "https://music.apple.com/br/playlist/",
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
        placeholder: "e.g., 123456789",
        urlPattern: /^https?:\/\/(www\.)?deezer\.com\/track\/\d+/,
        baseUrl: "https://www.deezer.com/track/",
      },
      {
        type: "album",
        label: "Album Link",
        placeholder: "e.g., 987654321",
        urlPattern: /^https?:\/\/(www\.)?deezer\.com\/album\/\d+/,
        baseUrl: "https://www.deezer.com/album/",
      },
      {
        type: "playlist",
        label: "Playlist Link",
        placeholder: "e.g., 543219876",
        urlPattern: /^https?:\/\/(www\.)?deezer\.com\/playlist\/\d+/,
        baseUrl: "https://www.deezer.com/playlist/",
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
        urlPattern: /^https?:\/\/(www\.)?tidal\.com\/album\/[A-Za-z0-9]+(?:\/.*)?/,
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
        placeholder: "e.g., B08Z2Y2G3X",
        urlPattern:
          /^https?:\/\/(music\.amazon\.com|www\.amazon\.[a-z]{2,3})\/albums\/[a-zA-Z0-9]+\/B0[a-zA-Z0-9]+(?:\?|$)/,
        baseUrl: "https://music.amazon.com/albums/",
      },
      {
        type: "album",
        label: "Album Link",
        placeholder: "e.g., B08Z2Y2G3X",
        urlPattern:
          /^https?:\/\/(music\.amazon\.com|www\.amazon\.[a-z]{2,3})\/albums\/B0[a-zA-Z0-9]+(?:\?|$)/,
        baseUrl: "https://music.amazon.com/albums/",
      },
      {
        type: "playlist",
        label: "Playlist Link",
        placeholder: "e.g., 37i9dQZF1DXcBWIGoYBM5M",
        urlPattern:
          /^https?:\/\/(music\.amazon\.com|www\.amazon\.[a-z]{2,3})\/playlists\/[a-zA-Z0-9]+(?:\?|$)/,
        baseUrl: "https://music.amazon.com/playlists/",
      },
    ],
  },
  {
    name: "YouTube",
    icon: SiYoutube,
    brandColor: "#FF0000",
    linkTypes: [
      {
        type: "video",
        label: "Video Link",
        placeholder: "e.g., dQw4w9WgXcQ",
        urlPattern: /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]+/,
        baseUrl: "https://www.youtube.com/watch?v=",
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
