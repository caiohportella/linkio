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
  SiTvtime,
  SiReddit,
  SiSteam,
  SiStackoverflow,
  SiDuolingo,
} from "react-icons/si";
import { RiTwitterXFill, RiThreadsFill } from "react-icons/ri";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  const isProduction = process.env.NODE_ENV == "production";

  if (isProduction) {
    if (process.env.NEXT_PUBLIC_APP_URL) {
      return process.env.NEXT_PUBLIC_APP_URL;
    }

    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }

    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
      return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
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
    brandColor: "#3777FF",
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
];

export function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
