"use client";

import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { trackLinkClick } from "@/lib/analytics";
import { usePreloadedQuery, Preloaded, useQuery } from "convex/react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import MusicCard from "./MusicCard";
import HighlightCard from "./HighlightCard";
import { ChevronLeft, Folder } from "lucide-react"; // Import ChevronLeft icon and Folder icon
import { useState } from "react"; // Import useState
import {
  SUPPORTED_MUSIC_PLATFORMS,
  extractSpotifyPlaylistId,
  generateSpotifyEmbedUrl,
  isSpotifyPlaylist,
  extractTidalPlaylistId,
  generateTidalEmbedUrl,
  isTidalPlaylist,
  extractDeezerPlaylistId,
  generateDeezerEmbedUrl,
  isDeezerPlaylist,
  extractAppleMusicPlaylistId,
  generateAppleMusicEmbedUrl,
  isAppleMusicPlaylist,
} from "@/lib/utils"; // Import SUPPORTED_MUSIC_PLATFORMS and streaming utilities
import Image from "next/image";
import { MediaPreview } from "@/lib/utils";
import { createElement, ComponentType } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SiYoutube } from "react-icons/si";

const sanitizeMediaPreview = (
  value: Doc<"links">["mediaPreview"] | undefined,
): MediaPreview | null => {
  if (!value) return null;
  if (value.platform === "youtube") {
    return value as MediaPreview;
  }
  return null;
};

interface LinksProps {
  preloadedLinks: Preloaded<typeof api.lib.links.getLinksBySlug>;
  preloadedFolders: Preloaded<typeof api.lib.folders.getFoldersByUserId>;
}

const Links = ({ preloadedLinks, preloadedFolders }: LinksProps) => {
  const preloadedLinksData = usePreloadedQuery(preloadedLinks);
  const folders = usePreloadedQuery(preloadedFolders);
  const params = useParams();
  const username = params.username as string;
  const [activeFolderId, setActiveFolderId] = useState<Id<"folders"> | null>(
    null,
  ); // State to manage active folder

  const handleLinkClick = async (link: Doc<"links">) => {
    await trackLinkClick({
      profileUsername: username,
      linkId: link._id,
      linkTitle: link.title,
      linkUrl: link.url,
    });
  };

  const handleMediaPreviewClick = async (
    link: Doc<"links">,
    preview: MediaPreview,
  ) => {
    await trackLinkClick({
      profileUsername: username,
      linkId: link._id,
      linkTitle: preview.title ?? link.title,
      linkUrl: preview.url,
    });
  };

  const liveLinks = useQuery(api.lib.links.getLinksBySlug, { slug: username });
  const filteredLiveLinks = (liveLinks ?? preloadedLinksData).filter(
    (link) => !link.scheduledAt || link.scheduledAt <= Date.now(),
  );
  const links = filteredLiveLinks;

  if (links.length === 0 && folders.length === 0 && !activeFolderId) {
    return (
      <div className="text-center py-20">
        <div className="text-slate-300 mb-6">
          <ArrowUpRight className="w-16 h-16 mx-auto" />
        </div>
        <p className="text-slate-400 text-xl font-medium">
          No links or folders yet
        </p>
        <p className="text-slate-300 text-sm mt-2 font-medium">
          Links and folders will appear here soon
        </p>
      </div>
    );
  }

  const folderMap = new Map(folders.map((folder) => [folder._id, folder]));
  const currentFolder = activeFolderId ? folderMap.get(activeFolderId) : null;

  const filteredLinks = activeFolderId
    ? links.filter((link) => link.folderId === activeFolderId)
    : links.filter((link) => !link.folderId); // Links not in a folder

  return (
    <div className="space-y-4">
      {activeFolderId && (
        <button
          onClick={() => setActiveFolderId(null)}
          className="cursor-pointer flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors duration-200 mb-4"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to all links
        </button>
      )}

      {currentFolder && (
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          {currentFolder.name}
        </h2>
      )}

      {/* Main Content (Folders and Un-foldered Links) */}
      <AnimatePresence mode="wait">
        {!activeFolderId && (
          <motion.div
            key="main-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="space-y-4"
          >
            {/* Only show folders and un-foldered links in the main view */}
            <>
              {folders.map((folder) => (
                <motion.button
                  key={folder._id}
                  onClick={() => setActiveFolderId(folder._id)}
                  className="cursor-pointer flex items-center justify-between w-full p-4 bg-white/70 border border-slate-200/50 rounded-2xl"
                  whileHover={{
                    scale: 1.02,
                    y: -2,
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderColor: "rgba(148, 163, 184, 0.3)",
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <div className="flex items-center gap-3">
                    <Folder className="w-5 h-5 text-slate-600" />
                    <h3 className="text-lg font-bold text-slate-900">
                      {folder.name}
                    </h3>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-slate-500 transition-transform duration-200" />
                </motion.button>
              ))}

              {links
                .filter((link) => !link.folderId)
                .map((link) => {
                  const mediaPreview = sanitizeMediaPreview(link.mediaPreview);
                  if (link.highlight) {
                    return <HighlightCard key={link._id} link={link} />;
                  }
                  if (mediaPreview) {
                    return (
                      <Link
                        key={link._id}
                        href={mediaPreview.url}
                        target="_blank"
                        className="group block w-full cursor-pointer"
                        onClick={() =>
                          handleMediaPreviewClick(link, mediaPreview)
                        }
                      >
                        <motion.div
                          className="relative bg-white/70 border border-slate-200/50 rounded-2xl overflow-hidden"
                          whileHover={{
                            scale: 1.02,
                            y: -2,
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            borderColor: "rgba(148, 163, 184, 0.3)",
                            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                          }}
                          whileTap={{ scale: 0.98 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 25,
                          }}
                        >
                          <div className="relative w-full pb-[56.25%]">
                            <Image
                              src={mediaPreview.thumbnailUrl}
                              alt={mediaPreview.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="relative p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-slate-800 transition-colors duration-200 mb-1">
                                  {mediaPreview.title}
                                </h3>
                                <div className="flex items-center text-xs text-slate-400 group-hover:text-slate-500 transition-colors duration-200">
                                  <span className="mr-1">
                                    <SiYoutube className="w-3 h-3" />
                                  </span>
                                  YouTube
                                </div>
                              </div>
                              <div className="ml-4 text-slate-400 group-hover:text-slate-600 transition-all duration-200 group-hover:translate-x-0.5">
                                <ArrowUpRight className="w-5 h-5" />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    );
                  }
                  if (link.playlistPreview) {
                    // Check for Spotify playlist and render as iframe
                    if (
                      link.playlistPreview.platform === "Spotify" &&
                      isSpotifyPlaylist(link.url)
                    ) {
                      const playlistId = extractSpotifyPlaylistId(link.url);
                      if (playlistId) {
                        const embedUrl = generateSpotifyEmbedUrl(playlistId);
                        return (
                          <motion.div
                            key={link._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="rounded-2xl border border-border bg-card overflow-hidden"
                          >
                            <iframe
                              data-testid="embed-iframe"
                              style={{ borderRadius: "12px" }}
                              src={embedUrl}
                              width="100%"
                              height="352"
                              frameBorder="0"
                              allowFullScreen
                              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                              loading="lazy"
                              className="w-full"
                            />
                          </motion.div>
                        );
                      }
                    }

                    // Check for Tidal playlist and render as iframe
                    if (
                      link.playlistPreview.platform === "Tidal" &&
                      isTidalPlaylist(link.url)
                    ) {
                      const playlistId = extractTidalPlaylistId(link.url);
                      if (playlistId) {
                        const embedUrl = generateTidalEmbedUrl(playlistId);
                        return (
                          <motion.div
                            key={link._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="rounded-2xl border border-border bg-card overflow-hidden"
                          >
                            <iframe
                              data-testid="embed-iframe"
                              style={{
                                borderRadius: "12px",
                                colorScheme: "light dark",
                              }}
                              src={embedUrl}
                              width="100%"
                              height="275"
                              frameBorder="0"
                              allow="encrypted-media; fullscreen; clipboard-write https://embed.tidal.com; web-share"
                              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                              title="TIDAL Embed Player"
                              loading="lazy"
                              className="w-full"
                            />
                          </motion.div>
                        );
                      }
                    }

                    // Check for Deezer playlist and render as iframe
                    if (
                      link.playlistPreview.platform === "Deezer" &&
                      isDeezerPlaylist(link.url)
                    ) {
                      // Try to extract from URL first, fallback to playlistPreview data
                      let playlistId = extractDeezerPlaylistId(link.url);
                      if (!playlistId && link.playlistPreview.playlistId) {
                        playlistId = link.playlistPreview.playlistId;
                      }
                      if (playlistId) {
                        const embedUrl = generateDeezerEmbedUrl(playlistId);
                        return (
                          <motion.div
                            key={link._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="rounded-2xl border border-border bg-card overflow-hidden"
                          >
                            <iframe
                              title="deezer-widget"
                              src={embedUrl}
                              width="100%"
                              height="300"
                              frameBorder="0"
                              allow="encrypted-media; clipboard-write"
                              loading="lazy"
                              className="w-full"
                              style={{ borderRadius: "12px" }}
                            />
                          </motion.div>
                        );
                      }
                    }

                    // Check for Apple Music playlist and render as iframe
                    if (
                      link.playlistPreview.platform === "Apple Music" &&
                      isAppleMusicPlaylist(link.url)
                    ) {
                      const playlistId = extractAppleMusicPlaylistId(link.url);
                      if (playlistId) {
                        const embedUrl = generateAppleMusicEmbedUrl(playlistId);
                        return (
                          <motion.div
                            key={link._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="rounded-2xl border border-border bg-white overflow-hidden"
                          >
                            <iframe
                              allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
                              height="450"
                              style={{
                                width: "100%",
                                overflow: "hidden",
                              }}
                              sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
                              src={embedUrl}
                              loading="lazy"
                              className="w-full"
                            />
                          </motion.div>
                        );
                      }
                    }

                    // Check for services without embed support (YouTube Music, Amazon Music)
                    const noEmbedServices = ["YouTube Music", "Amazon Music"];
                    if (
                      noEmbedServices.includes(link.playlistPreview.platform)
                    ) {
                      // Convert playlist preview to music link format for display as Music Card
                      const musicLinkData = {
                        ...link,
                        musicLinks: [
                          {
                            platform: link.playlistPreview.platform,
                            url: link.url,
                            type: "playlist",
                            musicTrackTitle: link.playlistPreview.title,
                            musicArtistName:
                              link.playlistPreview.ownerName || "Unknown Owner",
                            musicAlbumArtUrl: link.playlistPreview.thumbnailUrl,
                          },
                        ],
                        musicTrackTitle: link.playlistPreview.title,
                        musicArtistName:
                          link.playlistPreview.ownerName || "Unknown Owner",
                        musicAlbumArtUrl: link.playlistPreview.thumbnailUrl,
                        playlistPreview: link.playlistPreview, // Include playlist preview data for track count
                      };
                      return <MusicCard key={link._id} link={musicLinkData} />;
                    }

                    // Default playlist rendering for non-Spotify playlists
                    return (
                      <motion.div
                        key={link._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="rounded-2xl border border-border bg-card p-4 hover:bg-accent/5 transition-colors"
                      >
                        <Link
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() =>
                            trackLinkClick({
                              profileUsername: username,
                              linkId: link._id,
                              linkTitle:
                                link.playlistPreview?.title || "Playlist",
                              linkUrl: link.url,
                            })
                          }
                          className="flex items-center gap-4"
                        >
                          <div className="relative w-16 h-16 overflow-hidden rounded-xl bg-slate-100 flex-shrink-0">
                            {link.playlistPreview.thumbnailUrl ? (
                              <Image
                                src={link.playlistPreview.thumbnailUrl}
                                alt={link.playlistPreview.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-2xl">🎵</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {link.playlistPreview.title}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {link.playlistPreview.ownerName ||
                                "Unknown Owner"}{" "}
                              • {link.playlistPreview.trackCount || 0} songs
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {link.playlistPreview.platform}
                            </p>
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        </Link>
                      </motion.div>
                    );
                  } else if (link.musicLinks && link.musicLinks.length > 0) {
                    return <MusicCard key={link._id} link={link} />;
                  } else {
                    return (
                      <Link
                        key={link._id}
                        href={link.url}
                        target="_blank"
                        className="group block w-full cursor-pointer"
                        onClick={() => handleLinkClick(link)}
                      >
                        <motion.div
                          className="relative bg-white/70 border border-slate-200/50 rounded-2xl overflow-hidden"
                          whileHover={{
                            scale: 1.02,
                            y: -2,
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            borderColor: "rgba(148, 163, 184, 0.3)",
                            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                          }}
                          whileTap={{ scale: 0.98 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 25,
                          }}
                        >
                          {/* Hover Gradient */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-purple-50/0 to-blue-50/0 rounded-2xl"
                            whileHover={{
                              background:
                                "linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1), rgba(59, 130, 246, 0.1))",
                            }}
                            transition={{ duration: 0.3 }}
                          />

                          <div className="relative p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-slate-800 transition-colors duration-200 mb-1">
                                  {link.title}
                                </h3>
                                <p className="text-xs italic text-slate-400 group-hover:text-slate-500 transition-colors duration-200 truncate font-normal">
                                  {link.url.replace(/^https?:\/\//, "")}
                                </p>
                              </div>
                              <div className="ml-4 text-slate-400 group-hover:text-slate-600 transition-all duration-200 group-hover:translate-x-0.5">
                                <ArrowUpRight className="w-5 h-5" />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </Link>
                    );
                  }
                })}
            </>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Folder Content (Links within active folder) */}
      <AnimatePresence mode="wait">
        {activeFolderId && (
          <motion.div
            key="folder-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="space-y-4"
          >
            <div className="space-y-4">
              {filteredLinks.map((link) => {
                const mediaPreview = sanitizeMediaPreview(link.mediaPreview);
                if (link.highlight) {
                  return <HighlightCard key={link._id} link={link} />;
                }
                if (mediaPreview) {
                  return (
                    <Link
                      key={link._id}
                      href={mediaPreview.url}
                      target="_blank"
                      className="group block w-full cursor-pointer"
                      onClick={() =>
                        handleMediaPreviewClick(link, mediaPreview)
                      }
                    >
                      <motion.div
                        className="relative bg-white/70 border border-slate-200/50 rounded-2xl overflow-hidden"
                        whileHover={{
                          scale: 1.02,
                          y: -2,
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                          borderColor: "rgba(148, 163, 184, 0.3)",
                          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                        }}
                        whileTap={{ scale: 0.98 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 25,
                        }}
                      >
                        <div className="relative w-full pb-[56.25%]">
                          <Image
                            src={mediaPreview.thumbnailUrl}
                            alt={mediaPreview.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="relative p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-slate-900 group-hover:text-slate-800 transition-colors duration-200 mb-1">
                                {mediaPreview.title}
                              </h3>
                              <div className="flex items-center text-xs text-slate-400 group-hover:text-slate-500 transition-colors duration-200">
                                {SUPPORTED_MUSIC_PLATFORMS.find(
                                  (p) => p.name === "YouTube",
                                )?.icon && (
                                  <span className="mr-1">
                                    {createElement(
                                      (SUPPORTED_MUSIC_PLATFORMS.find(
                                        (p) => p.name === "YouTube",
                                      )?.icon as
                                        | ComponentType<{ className?: string }>
                                        | undefined) ?? (() => null),
                                      { className: "w-3 h-3" },
                                    )}
                                  </span>
                                )}
                                YouTube
                              </div>
                            </div>
                            <div className="ml-4 text-slate-400 group-hover:text-slate-600 transition-all duration-200 group-hover:translate-x-0.5">
                              <ArrowUpRight className="w-5 h-5" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  );
                }
                if (link.playlistPreview) {
                  return (
                    <motion.div
                      key={link._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="rounded-2xl border border-border bg-card p-4 hover:bg-accent/5 transition-colors"
                    >
                      <Link
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          trackLinkClick({
                            profileUsername: username,
                            linkId: link._id,
                            linkTitle:
                              link.playlistPreview?.title || "Playlist",
                            linkUrl: link.url,
                          })
                        }
                        className="flex items-center gap-4"
                      >
                        <div className="relative w-16 h-16 overflow-hidden rounded-xl bg-slate-100 flex-shrink-0">
                          {link.playlistPreview.thumbnailUrl ? (
                            <Image
                              src={link.playlistPreview.thumbnailUrl}
                              alt={link.playlistPreview.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-2xl">🎵</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {link.playlistPreview.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {link.playlistPreview.ownerName || "Unknown Owner"}{" "}
                            • {link.playlistPreview.trackCount || 0} songs
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {link.playlistPreview.platform}
                          </p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </Link>
                    </motion.div>
                  );
                } else if (link.musicLinks && link.musicLinks.length > 0) {
                  return <MusicCard key={link._id} link={link} />;
                } else {
                  return (
                    <Link
                      key={link._id}
                      href={link.url}
                      target="_blank"
                      className="group block w-full cursor-pointer"
                      onClick={() => handleLinkClick(link)}
                    >
                      <motion.div
                        className="relative bg-white/70 border border-slate-200/50 rounded-2xl overflow-hidden"
                        whileHover={{
                          scale: 1.02,
                          y: -2,
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                          borderColor: "rgba(148, 163, 184, 0.3)",
                          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                        }}
                        whileTap={{ scale: 0.98 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 25,
                        }}
                      >
                        {/* Hover Gradient */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-purple-50/0 to-blue-50/0 rounded-2xl"
                          whileHover={{
                            background:
                              "linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1), rgba(59, 130, 246, 0.1))",
                          }}
                          transition={{ duration: 0.3 }}
                        />

                        <div className="relative p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-slate-900 group-hover:text-slate-800 transition-colors duration-200 mb-1">
                                {link.title}
                              </h3>
                              <p className="text-xs italic text-slate-400 group-hover:text-slate-500 transition-colors duration-200 truncate font-normal">
                                {link.url.replace(/^https?:\/\//, "")}
                              </p>
                            </div>
                            <div className="ml-4 text-slate-400 group-hover:text-slate-600 transition-all duration-200 group-hover:translate-x-0.5">
                              <ArrowUpRight className="w-5 h-5" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  );
                }
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default Links;
