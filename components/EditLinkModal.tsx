"use client";

import { useState, useTransition, useEffect, createElement, ComponentType } from "react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Music,
  Save,
  Trash2,
  Clock,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { MediaPreview, MusicLinkItem, formatDateTime, SUPPORTED_MUSIC_PLATFORMS } from "@/lib/utils";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const ScheduleLinkModal = dynamic(() => import("./ScheduleLinkModal"), {
  ssr: false,
});

const MusicLinksModal = dynamic(() => import("./MusicLinksModal"), {
  ssr: false,
});

interface EditLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  link: Doc<"links">;
  folders?: Doc<"folders">[];
}

// Helper to sanitize media preview (now supports more types if needed, but keeping basic check)
const sanitizeMediaPreview = (
  value: Doc<"links">["mediaPreview"] | undefined,
): MediaPreview | null => {
  if (!value) return null;
  if (value.platform === "youtube") {
    return value as MediaPreview;
  }
  return null;
};

export default function EditLinkModal({
  isOpen,
  onClose,
  link,
  folders,
}: EditLinkModalProps) {
  const router = useRouter();
  const [isUpdating, startUpdating] = useTransition();
  
  const [editTitle, setEditTitle] = useState(link.title);
  const [editUrl, setEditUrl] = useState(link.url);
  const [editFolderId, setEditFolderId] = useState<Id<"folders"> | undefined>(
    link.folderId,
  );
  
  // Folder creation state
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const [musicLinks, setMusicLinks] = useState<MusicLinkItem[]>(
    link.musicLinks ?? [],
  );
  
  // Preview states
  const [mediaPreview, setMediaPreview] = useState<MediaPreview | null>(
    sanitizeMediaPreview(link.mediaPreview),
  );
  const [playlistPreview, setPlaylistPreview] = useState(link.playlistPreview);
  const [highlight, setHighlight] = useState(link.highlight);

  const [scheduledAt, setScheduledAt] = useState<number | null>(
    link.scheduledAt ?? null,
  );
  const [scheduleCleared, setScheduleCleared] = useState(false);

  // Modal states
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  const [editingMusicLink, setEditingMusicLink] = useState<MusicLinkItem | null>(null);
  const [isUpdatingPreview, setIsUpdatingPreview] = useState(false);

  const updateLink = useMutation(api.lib.links.updateLink);
  const updateLinkFolder = useMutation(api.lib.links.updateLinkFolder);
  const createFolder = useMutation(api.lib.folders.createFolder);

  const isScheduleActive = !!scheduledAt || isScheduleModalOpen;

  // Reset state when modal opens or link changes
  useEffect(() => {
    if (isOpen) {
      setEditTitle(link.title);
      setEditUrl(link.url);
      setEditFolderId(link.folderId);
      setMusicLinks(link.musicLinks ?? []);
      setMediaPreview(sanitizeMediaPreview(link.mediaPreview));
      setPlaylistPreview(link.playlistPreview);
      setHighlight(link.highlight);
      setScheduledAt(link.scheduledAt ?? null);
      setScheduleCleared(false);
      setIsCreatingFolder(false);
      setNewFolderName("");
      setIsUpdatingPreview(false);
    }
  }, [isOpen, link]);

  const handleRemoveMusicLink = (platformName: string) => {
    const updatedLinks = musicLinks.filter(
      (musicLink) => musicLink.platform !== platformName,
    );
    setMusicLinks(updatedLinks);
    toast.success(`${platformName} music link removed!`);
  };

  const handleSetMusicLinks = (newLinks: MusicLinkItem[]) => {
    setMusicLinks(newLinks);
    // Update the primary URL to the first music link's URL
    const primaryUrl = newLinks[0]?.url ?? link.url;
    setEditUrl(primaryUrl);
  };

  const handleClearMediaPreview = () => {
    setMediaPreview(null);
    if (!musicLinks.length && !playlistPreview && !highlight) {
      setEditUrl(link.url);
    }
  };

  const handleClearPlaylistPreview = () => {
    setPlaylistPreview(undefined);
  };

  const handleClearHighlight = () => {
    setHighlight(undefined);
  };

  const handleSetScheduledAt = (value: number | null) => {
    setScheduledAt(value);
    setScheduleCleared(value === null);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const newFolderId = await createFolder({ name: newFolderName.trim() });
      setEditFolderId(newFolderId);
      setIsCreatingFolder(false);
      setNewFolderName("");
      toast.success("Folder created!");
      router.refresh();
    } catch (error) {
      console.error("Failed to create folder:", error);
      toast.error("Failed to create folder");
    }
  };

  const handleUrlBlur = async () => {
    const trimmedUrl = editUrl.trim();
    if (!trimmedUrl || trimmedUrl === link.url) return;

    // Only update if we have an active preview type
    if (!highlight && !mediaPreview && !playlistPreview) return;

    setIsUpdatingPreview(true);
    try {
      // 1. Handle Highlight Update
      if (highlight) {
        const response = await fetch("/api/og/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: trimmedUrl }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.imageUrl) {
            setHighlight({
              ...highlight,
              url: trimmedUrl,
              imageUrl: data.imageUrl,
            });
            toast.success("Highlight preview updated");
          }
        } else {
           toast.error("Failed to update highlight preview");
        }
      }

      // 2. Handle Media Preview (YouTube) Update
      else if (mediaPreview) {
         const response = await fetch("/api/media/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: trimmedUrl }),
        });

        if (response.ok) {
          const data = await response.json();
          setMediaPreview(data);
          toast.success("Media preview updated");
        } else {
          toast.error("Failed to update media preview");
        }
      }

      // 3. Handle Playlist Preview Update
      else if (playlistPreview) {
         const response = await fetch("/api/playlist/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: trimmedUrl }),
        });

        if (response.ok) {
          const data = await response.json();
          setPlaylistPreview(data);
          toast.success("Playlist preview updated");
        } else {
          toast.error("Failed to update playlist preview");
        }
      }

    } catch (error) {
      console.error("Error updating preview:", error);
      toast.error("Error updating preview");
    } finally {
      setIsUpdatingPreview(false);
    }
  };

  const handleSave = async () => {
    if (!editTitle.trim() || !editUrl.trim()) return;

    startUpdating(async () => {
      try {
        let processedUrl = editUrl;

        if (
          !processedUrl.startsWith("https://") &&
          !processedUrl.startsWith("http://")
        ) {
          processedUrl = `https://${processedUrl}`;
        }

        if (editFolderId !== link.folderId) {
          await updateLinkFolder({
            linkId: link._id,
            folderId: editFolderId === "" ? undefined : editFolderId,
          });
        }

        await updateLink({
          linkId: link._id,
          title: editTitle.trim(),
          url: processedUrl,
          musicLinks,
          musicTrackTitle: musicLinks?.[0]?.musicTrackTitle,
          musicArtistName: musicLinks?.[0]?.musicArtistName,
          musicAlbumArtUrl: musicLinks?.[0]?.musicAlbumArtUrl,
          mediaPreview: mediaPreview || undefined,

          highlight: highlight || undefined,
          scheduledAt:
            scheduleCleared || scheduledAt === null
              ? undefined
              : (scheduledAt ?? undefined),
          clearSchedule: scheduleCleared ? true : undefined,
        });

        router.refresh();
        toast.success("Link updated successfully!");
        onClose();
      } catch (err) {
        console.error("Failed to update link: ", err);
        toast.error("Failed to update link.");
      }
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-lg rounded-2xl bg-card max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Link</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label
                className="block text-sm font-medium text-foreground"
                htmlFor="title"
              >
                Title
              </label>
              <input
                id="title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full rounded-2xl border border-border p-2 text-foreground shadow-sm focus:border-primary focus:outline-none bg-background"
                placeholder="Enter title"
              />
            </div>

            <div className="space-y-2">
              <label
                className="block text-sm font-medium text-foreground"
                htmlFor="url"
              >
                URL
              </label>
              <div className="relative">
                <input
                  id="url"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  onBlur={handleUrlBlur}
                  className="w-full rounded-2xl border border-border p-2 text-foreground shadow-sm focus:border-primary focus:outline-none bg-background pr-10"
                  placeholder="Enter URL"
                />
                {isUpdatingPreview && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>

            {/* Folder Selection */}
            <div className="space-y-2">
              <label
                className="block text-sm font-medium text-foreground"
                htmlFor="folder"
              >
                Folder
              </label>
              {isCreatingFolder ? (
                 <div className="flex gap-2">
                   <input
                     value={newFolderName}
                     onChange={(e) => setNewFolderName(e.target.value)}
                     className="flex-1 rounded-2xl border border-border p-2 text-foreground shadow-sm focus:border-primary focus:outline-none bg-background"
                     placeholder="Folder name"
                     autoFocus
                     onKeyDown={(e) => {
                       if (e.key === 'Enter') {
                         e.preventDefault();
                         handleCreateFolder();
                       }
                     }}
                   />
                   <Button 
                     type="button" 
                     size="icon" 
                     variant="ghost" 
                     onClick={() => setIsCreatingFolder(false)}
                     className="rounded-full"
                   >
                     <X className="w-4 h-4" />
                   </Button>
                   <Button 
                     type="button" 
                     size="icon" 
                     onClick={handleCreateFolder}
                     className="rounded-full"
                   >
                     <Plus className="w-4 h-4" />
                   </Button>
                 </div>
              ) : (
                <Select
                  onValueChange={(value) => {
                    if (value === "create-new-folder") {
                      setIsCreatingFolder(true);
                    } else {
                      setEditFolderId(
                        value === "no-folder" ? undefined : (value as Id<"folders">),
                      );
                    }
                  }}
                  value={editFolderId || "no-folder"}
                >
                  <SelectTrigger className="w-full rounded-2xl border border-border p-2 text-foreground shadow-sm focus:border-primary focus:outline-none">
                    <SelectValue placeholder="Select a folder (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-folder">No Folder</SelectItem>
                    {folders?.map((folder) => (
                      <SelectItem key={folder._id} value={folder._id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="create-new-folder" className="text-primary font-medium">
                      + Create new folder
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Music Links - Only show if there are music links */}
            {musicLinks.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    Music Links
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {musicLinks.map((musicLink) => {
                    const platform = SUPPORTED_MUSIC_PLATFORMS.find(
                      (p) => p.name === musicLink.platform
                    );
                    const Icon = platform?.icon;
                    const brandColor = platform?.brandColor || "currentColor";

                    return (
                      <div
                        key={`${musicLink.platform}-${musicLink.type}`}
                        className="flex items-center justify-between rounded-2xl border border-border bg-card p-3"
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            setEditingMusicLink(musicLink);
                            setIsMusicModalOpen(true);
                          }}
                          className="flex-1 justify-start cursor-pointer px-0 py-0 h-auto rounded-2xl"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0 text-left">
                            {Icon && (
                              <div 
                                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-muted/30"
                                style={{ color: brandColor }}
                              >
                                {createElement(
                                  (Icon as ComponentType<{ className?: string }>),
                                  { className: "w-5 h-5" }
                                )}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">
                                {musicLink.musicTrackTitle ||
                                  `${musicLink.platform} (${musicLink.type})`}
                              </p>
                              {musicLink.musicArtistName && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {musicLink.musicArtistName}
                                </p>
                              )}
                            </div>
                          </div>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMusicLink(musicLink.platform)}
                          className="text-destructive hover:bg-destructive/10 rounded-full w-8 h-8"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>

                {/* Add More Sources Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingMusicLink(null);
                    setIsMusicModalOpen(true);
                  }}
                  className="w-full cursor-pointer rounded-2xl border-dashed border-2 border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50 transition-all duration-200"
                >
                  <Music className="w-4 h-4 mr-2" />
                  Add More Sources
                </Button>
              </div>
            )}

            {/* Media / Preview Section */}
            {(mediaPreview || playlistPreview || highlight) && (
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    Preview
                  </span>
                </div>
                
                {/* Media Preview (YouTube) */}
                {mediaPreview && (
                  <div className="rounded-2xl border border-border p-4 flex items-center gap-4 mb-2">
                    <div className="relative w-24 h-16 overflow-hidden rounded-xl">
                      <Image
                        src={mediaPreview.thumbnailUrl}
                        alt={mediaPreview.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {mediaPreview.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        Video Preview
                      </p>
                    </div>
                    </div>
                )}

                {/* Playlist Preview */}
                {playlistPreview && (
                  <div className="rounded-2xl border border-border p-4 flex items-center gap-4 mb-2">
                    {playlistPreview.thumbnailUrl ? (
                      <div className="relative w-24 h-16 overflow-hidden rounded-xl">
                        <Image
                          src={playlistPreview.thumbnailUrl}
                          alt={playlistPreview.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-16 bg-muted rounded-xl flex items-center justify-center">
                        <Music className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {playlistPreview.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        Playlist Preview
                      </p>
                    </div>
                    </div>
                )}

                {/* Highlight */}
                {highlight && (
                  <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 group">
                    <Image
                      src={highlight.imageUrl}
                      alt="Highlight"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center px-6">
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="w-full max-w-[80%]"
                      >
                        <input
                          value={highlight.text}
                          onChange={(e) =>
                            setHighlight({ ...highlight, text: e.target.value })
                          }
                          className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-full font-medium text-center shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder:text-white/50"
                          placeholder="Highlight text"
                        />
                      </motion.div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3 pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  Schedule
                </span>
              </div>
              {scheduledAt ? (
                <div className="rounded-2xl border border-border p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Scheduled
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(scheduledAt)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="rounded-2xl"
                        onClick={() => setIsScheduleModalOpen(true)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10 rounded-full"
                        onClick={() => handleSetScheduledAt(null)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    The link will be visible on your public page at the scheduled
                    time.
                  </p>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsScheduleModalOpen(true)}
                  className={`rounded-2xl flex items-center gap-2 transition-colors ${
                    isScheduleActive
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-accent/20 hover:bg-accent/30 text-foreground"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  Add Schedule
                </Button>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="rounded-2xl text-muted-foreground"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="default"
                onClick={handleSave}
                disabled={isUpdating}
                className="rounded-2xl"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ScheduleLinkModal
        isOpen={isScheduleModalOpen}
        onOpenChange={setIsScheduleModalOpen}
        initialValue={scheduledAt ?? undefined}
        onConfirm={handleSetScheduledAt}
      />

      <MusicLinksModal
        isOpen={isMusicModalOpen}
        onOpenChange={setIsMusicModalOpen}
        musicLinks={musicLinks}
        setMusicLinks={handleSetMusicLinks}
        initialLink={editingMusicLink}
        onClearInitialLink={() => setEditingMusicLink(null)}
        handleRemoveMusicLink={handleRemoveMusicLink}
        showExistingLinksOnOpen={musicLinks.length > 0}
      />
    </>
  );
}
