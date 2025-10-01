"use client";

import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { trackLinkClick } from "@/lib/analytics";
import { usePreloadedQuery, Preloaded, useQuery } from "convex/react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import MusicCard from "./MusicCard";
import { ChevronLeft, Folder } from "lucide-react"; // Import ChevronLeft icon and Folder icon
import { useState, useEffect } from "react"; // Import useState and useEffect
import { cn } from "@/lib/utils"; // Import cn for conditional classes
import Image from "next/image";
import { MediaPreview } from "@/lib/utils";

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
  const [showMainContent, setShowMainContent] = useState(true); // State for animation of main content
  const [showFolderContent, setShowFolderContent] = useState(false); // State for animation of folder content

  useEffect(() => {
    if (activeFolderId) {
      setShowMainContent(false); // Start fading out main content
      const timer = setTimeout(() => setShowFolderContent(true), 300); // Fade in folder content after main content fades out
      return () => clearTimeout(timer);
    } else {
      setShowFolderContent(false); // Start fading out folder content
      const timer = setTimeout(() => setShowMainContent(true), 300); // Fade in main content after folder content fades out
      return () => clearTimeout(timer);
    }
  }, [activeFolderId, preloadedLinksData]);

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
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          showMainContent ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="space-y-4">
          {/* Only show folders and un-foldered links in the main view */}
          {!activeFolderId && (
            <>
              {folders.map((folder) => (
                <button
                  key={folder._id}
                  onClick={() => setActiveFolderId(folder._id)}
                  className="cursor-pointer flex items-center justify-between w-full p-4 bg-white/70 hover:bg-white/90 border border-slate-200/50 hover:border-slate-300/50 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/5 hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-3">
                    <Folder className="w-5 h-5 text-slate-600" />
                    <h3 className="text-lg font-bold text-slate-900">
                      {folder.name}
                    </h3>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-slate-500 transition-transform duration-200" />
                </button>
              ))}

              {links
                .filter((link) => !link.folderId)
                .map((link) => {
                  const mediaPreview = sanitizeMediaPreview(link.mediaPreview);
                  if (mediaPreview) {
                    return (
                      <Link
                        key={link._id}
                        href={mediaPreview.url}
                        target="_blank"
                        className="group block w-full cursor-pointer"
                        onClick={() => handleMediaPreviewClick(link, mediaPreview)}
                      >
                        <div className="relative bg-white/70 hover:bg-white/90 border border-slate-200/50 hover:border-slate-300/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/5 hover:-translate-y-0.5">
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
                                <p className="text-xs italic text-slate-400 group-hover:text-slate-500 transition-colors duration-200 truncate font-normal">
                                  {mediaPreview.url.replace(/^https?:\/\//, "")}
                                </p>
                              </div>
                              <div className="ml-4 text-slate-400 group-hover:text-slate-600 transition-all duration-200 group-hover:translate-x-0.5">
                                <ArrowUpRight className="w-5 h-5" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  }
                  if (link.musicLinks && link.musicLinks.length > 0) {
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
                        <div className="relative bg-white/70 hover:bg-white/90 border border-slate-200/50 hover:border-slate-300/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/5 hover:-translate-y-0.5">
                          {/* Hover Gradient */}
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-purple-50/0 to-blue-50/0 group-hover:from-blue-50/30 group-hover:via-purple-50/20 group-hover:to-blue-50/30 rounded-2xl transition-all duration-300"></div>

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
                        </div>
                      </Link>
                    );
                  }
                })}
            </>
          )}
        </div>
      </div>

      {/* Folder Content (Links within active folder) */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          showFolderContent ? "opacity-100" : "opacity-0",
        )}
      >
        {activeFolderId && (
          <div className="space-y-4">
            <div className="space-y-4">
              {filteredLinks.map((link) => {
                const mediaPreview = sanitizeMediaPreview(link.mediaPreview);
                if (mediaPreview) {
                  return (
                    <Link
                      key={link._id}
                      href={mediaPreview.url}
                      target="_blank"
                      className="group block w-full cursor-pointer"
                      onClick={() => handleMediaPreviewClick(link, mediaPreview)}
                    >
                      <div className="relative bg-white/70 hover:bg-white/90 border border-slate-200/50 hover:border-slate-300/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/5 hover:-translate-y-0.5">
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
                              <p className="text-xs italic text-slate-400 group-hover:text-slate-500 transition-colors duration-200 truncate font-normal">
                                {mediaPreview.url.replace(/^https?:\/\//, "")}
                              </p>
                            </div>
                            <div className="ml-4 text-slate-400 group-hover:text-slate-600 transition-all duration-200 group-hover:translate-x-0.5">
                              <ArrowUpRight className="w-5 h-5" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                }
        if (link.musicLinks && link.musicLinks.length > 0) {
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
              <div className="relative bg-white/70 hover:bg-white/90 border border-slate-200/50 hover:border-slate-300/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/5 hover:-translate-y-0.5">
                {/* Hover Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-purple-50/0 to-blue-50/0 group-hover:from-blue-50/30 group-hover:via-purple-50/20 group-hover:to-blue-50/30 rounded-2xl transition-all duration-300"></div>

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
              </div>
            </Link>
          );
        }
      })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Links;
