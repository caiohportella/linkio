"use client";

import { Doc } from "@/convex/_generated/dataModel";
import { SUPPORTED_MUSIC_PLATFORMS } from "@/lib/utils";
import Image from "next/image";
import {
  ComponentType,
  createElement,
  useState,
  useRef,
  useEffect,
} from "react";
import { ArrowUpRight, Play, Pause } from "lucide-react";
import Link from "next/link";
import { trackLinkClick } from "@/lib/analytics";
import { useParams } from "next/navigation";

interface MusicCardProps {
  link: Doc<"links">;
}

const MusicCard: React.FC<MusicCardProps> = ({ link }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const params = useParams();
  const username = params.username as string;

  const hasMultipleMusicLinks = link.musicLinks && link.musicLinks.length > 1;

  const handleCardClick = () => {
    if (hasMultipleMusicLinks) {
      setIsExpanded(!isExpanded);
    } else {
      // If only one music link, directly navigate to it
      const firstMusicLink = link.musicLinks?.[0];
      if (firstMusicLink) {
        handleMusicLinkClick(firstMusicLink);
      }
    }
  };

  const handleMusicLinkClick = async (musicLink: {
    platform: string;
    url: string;
    type: string;
  }) => {
    await trackLinkClick({
      profileUsername: username,
      linkId: link._id,
      linkTitle: `${link.title} - ${musicLink.platform}`,
      linkUrl: musicLink.url,
    });
  };

  // Extract Spotify track ID from URL
  const getSpotifyTrackId = (url: string): string | null => {
    const match = url.match(/spotify\.com\/track\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  };

  // Fetch Spotify preview URL
  const fetchSpotifyPreview = async (
    trackId: string,
  ): Promise<string | null> => {
    try {
      const response = await fetch(`/api/spotify/preview?trackId=${trackId}`);
      if (response.ok) {
        const data = await response.json();
        return data.previewUrl;
      }
    } catch (error) {
      console.error("Failed to fetch Spotify preview:", error);
    }
    return null;
  };

  // Handle play/pause functionality
  const handlePlayPause = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card expansion when clicking play button

    if (isPlaying) {
      // Pause
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      // Play
      if (!previewUrl) {
        // Find Spotify link and get preview URL
        const spotifyLink = link.musicLinks?.find(
          (ml) => ml.platform === "Spotify",
        );
        if (spotifyLink) {
          const trackId = getSpotifyTrackId(spotifyLink.url);
          if (trackId) {
            const preview = await fetchSpotifyPreview(trackId);
            if (preview) {
              setPreviewUrl(preview);
              if (audioRef.current) {
                audioRef.current.src = preview;
                audioRef.current.play();
                setIsPlaying(true);
              }
            }
          }
        }
      } else {
        // Resume existing preview
        if (audioRef.current) {
          audioRef.current.play();
          setIsPlaying(true);
        }
      }
    }
  };

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlaying(false);
    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("play", handlePlay);
    };
  }, [previewUrl]);

  const firstMusicLink = link.musicLinks?.[0];
  const albumArtUrl = link.musicAlbumArtUrl || "/logo.png"; // Fallback to a default logo
  const trackTitle = link.musicTrackTitle || link.title;
  const artistName = link.musicArtistName || "Unknown Artist";

  return (
    <div
      className={`relative bg-white/70 border border-slate-200/50 rounded-2xl overflow-hidden transition-all duration-300 shadow-lg ${
        isExpanded
          ? "min-h-[300px]"
          : hasMultipleMusicLinks
            ? "hover:shadow-slate-900/5 hover:-translate-y-0.5"
            : "hover:shadow-slate-900/5 hover:-translate-y-0.5"
      }`}
    >
      {/* Collapsed/Header Section */}
      <div
        className={`relative flex items-center p-4 cursor-pointer ${
          isExpanded
            ? "pb-2"
            : hasMultipleMusicLinks
              ? "group hover:bg-white/90 hover:border-slate-300/50"
              : "group hover:bg-white/90 hover:border-slate-300/50 hover:shadow-lg hover:shadow-slate-900/5 hover:-translate-y-0.5"
        }`}
        onClick={handleCardClick}
      >
        <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0 group">
          <Image
            src={albumArtUrl}
            alt={trackTitle}
            fill
            sizes="80px"
            className="object-cover"
          />
          {/* Play/Pause Button Overlay */}
          {link.musicLinks?.some((ml) => ml.platform === "Spotify") && (
            <button
              onClick={handlePlayPause}
              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white ml-1" />
              )}
            </button>
          )}
        </div>
        <div className="ml-4 flex-1 min-w-0">
          <h3 className="text-lg font-bold text-slate-900 mb-1 truncate">
            {trackTitle}
          </h3>
          <p className="text-sm italic text-slate-500 truncate">{artistName}</p>
          {firstMusicLink && (
            <div className="flex items-center text-xs text-slate-400 mt-1">
              {SUPPORTED_MUSIC_PLATFORMS.find(
                (p) => p.name === firstMusicLink.platform,
              )?.icon && (
                <span className="mr-1">
                  {createElement(
                    (SUPPORTED_MUSIC_PLATFORMS.find(
                      (p) => p.name === firstMusicLink.platform,
                    )?.icon as
                      | ComponentType<{ className?: string }>
                      | undefined) ?? (() => null),
                    { className: "w-3 h-3" },
                  )}
                </span>
              )}
              {firstMusicLink.platform}
              {hasMultipleMusicLinks && (
                <span className="ml-2 px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-full text-xs font-medium">
                  +{link.musicLinks!.length - 1} more
                </span>
              )}
            </div>
          )}
        </div>
        <div className="ml-4 text-slate-400 group-hover:text-slate-600 transition-all duration-200">
          {hasMultipleMusicLinks ? (
            isExpanded ? (
              <ArrowUpRight className="w-6 h-6 rotate-90" />
            ) : (
              <ArrowUpRight className="w-6 h-6" />
            )
          ) : (
            <ArrowUpRight className="w-6 h-6" />
          )}
        </div>
      </div>

      {/* Expanded Content - Only show when there are multiple music links */}
      {isExpanded &&
        hasMultipleMusicLinks &&
        link.musicLinks &&
        link.musicLinks.length > 0 && (
          <div className="px-4 pb-4 space-y-2">
            <p className="text-sm font-semibold text-slate-700 mb-2">
              Listen on:
            </p>
            {link.musicLinks.map((musicLink, index) => {
              const platform = SUPPORTED_MUSIC_PLATFORMS.find(
                (p) => p.name === musicLink.platform,
              );
              const Icon = platform?.icon;
              const brandColor = platform?.brandColor || "#000000";

              return (
                <Link
                  key={index}
                  href={musicLink.url}
                  target="_blank"
                  onClick={() => handleMusicLinkClick(musicLink)}
                  className="rounded-2xl group flex items-center justify-between p-3 bg-white/80 hover:bg-white/95 border border-slate-200/70 hover:border-slate-300 transition-all duration-200"
                >
                  <div className="flex items-center">
                    {Icon && (
                      <span className="mr-3" style={{ color: brandColor }}>
                        {createElement(
                          (Icon as
                            | ComponentType<{ className?: string }>
                            | undefined) ?? (() => null),
                          {
                            className: "w-5 h-5",
                          },
                        )}
                      </span>
                    )}
                    <span className="font-medium text-slate-800">
                      {musicLink.platform}
                    </span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-slate-700 transition-colors duration-200" />
                </Link>
              );
            })}
          </div>
        )}

      {/* Hidden Audio Element */}
      <audio ref={audioRef} preload="none" />
    </div>
  );
};

export default MusicCard;
