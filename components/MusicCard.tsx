"use client";

import { Doc } from "@/convex/_generated/dataModel";
import { SUPPORTED_MUSIC_PLATFORMS } from "@/lib/utils";
import Image from "next/image";
import { ComponentType, createElement, useState } from "react";
import { ArrowUpRight, PlayCircle } from "lucide-react";
import Link from "next/link";
import { trackLinkClick } from "@/lib/analytics";
import { useParams } from "next/navigation";

interface MusicCardProps {
  link: Doc<"links">;
}

const MusicCard: React.FC<MusicCardProps> = ({ link }) => {
  const [isExpanded, setIsExpanded] = useState(false);
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

  const handleMusicLinkClick = async (musicLink: { platform: string; url: string; type: string }) => {
    await trackLinkClick({
      profileUsername: username,
      linkId: link._id,
      linkTitle: `${link.title} - ${musicLink.platform}`,
      linkUrl: musicLink.url,
    });
  };

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
        <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
          <Image
            src={albumArtUrl}
            alt={trackTitle}
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>
        <div className="ml-4 flex-1 min-w-0">
          <h3 className="text-lg font-bold text-slate-900 mb-1 truncate">{trackTitle}</h3>
          <p className="text-sm italic text-slate-500 truncate">{artistName}</p>
          {firstMusicLink && (
            <div className="flex items-center text-xs text-slate-400 mt-1">
              {SUPPORTED_MUSIC_PLATFORMS.find((p) => p.name === firstMusicLink.platform)?.icon && (
                <span className="mr-1">
                  {createElement(
                    (SUPPORTED_MUSIC_PLATFORMS.find((p) => p.name === firstMusicLink.platform)?.icon as ComponentType<{ className?: string }> | undefined) ??
                      (() => null),
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
              <PlayCircle className="w-6 h-6 rotate-90" />
            ) : (
              <PlayCircle className="w-6 h-6" />
            )
          ) : (
            <ArrowUpRight className="w-6 h-6" />
          )}
        </div>
      </div>

      {/* Expanded Content - Only show when there are multiple music links */}
      {isExpanded && hasMultipleMusicLinks && link.musicLinks && link.musicLinks.length > 0 && (
        <div className="px-4 pb-4 space-y-2">
          <p className="text-sm font-semibold text-slate-700 mb-2">Listen on:</p>
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
                      {createElement((Icon as ComponentType<{ className?: string }> | undefined) ?? (() => null), {
                        className: "w-5 h-5",
                      })}
                    </span>
                  )}
                  <span className="font-medium text-slate-800">{musicLink.platform}</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-slate-700 transition-colors duration-200" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MusicCard;
