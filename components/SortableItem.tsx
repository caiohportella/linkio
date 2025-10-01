"use client";

import { Doc, Id } from "@/convex/_generated/dataModel";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  BarChart3,
  GripVertical,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  TvMinimalPlayIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import dynamic from "next/dynamic";
import Image from "next/image";
import { MediaPreview, MusicLinkItem } from "@/lib/utils";
import { useRouter } from "next/navigation";

const MusicLinksModal = dynamic(() => import("./MusicLinksModal"), {
  ssr: false,
});
const MediaPreviewModal = dynamic(() => import("./MediaPreviewModal"), {
  ssr: false,
});

const sanitizeMediaPreview = (
  value: Doc<"links">["mediaPreview"] | undefined,
): MediaPreview | null => {
  if (!value) return null;
  if (value.platform === "youtube") {
    return value as MediaPreview;
  }
  return null;
};

interface SortableItemProps {
  id: Id<"links">;
  link: Doc<"links">;
  folderNameMap?: Record<Id<"folders">, string>; // Made optional
  folders?: Doc<"folders">[]; // Made optional
}

const SortableItem = ({
  id,
  link,
  folderNameMap,
  folders,
}: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, startUpdating] = useTransition();
  const [editTitle, setEditTitle] = useState(link.title);
  const [editUrl, setEditUrl] = useState(link.url);
  const [editFolderId, setEditFolderId] = useState<Id<"folders"> | undefined>(link.folderId); // New state for folderId
  const [musicLinks, setMusicLinks] = useState<MusicLinkItem[]>(link.musicLinks ?? []);
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  const [editingMusicLink, setEditingMusicLink] = useState<MusicLinkItem | null>(null);
  const [mediaPreview, setMediaPreview] = useState<MediaPreview | null>(
    sanitizeMediaPreview(link.mediaPreview),
  );
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  const updateLink = useMutation(api.lib.links.updateLink);
  const deleteLink = useMutation(api.lib.links.deleteLink);
  const updateLinkFolder = useMutation(api.lib.links.updateLinkFolder); // New mutation

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    if (!isEditing) {
      setMusicLinks(link.musicLinks ?? []);
      setEditTitle(link.title);
      setEditUrl(link.url);
      setEditFolderId(link.folderId);
      setMediaPreview(sanitizeMediaPreview(link.mediaPreview));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [link.musicLinks, link.title, link.url, link.folderId]);

  const handleCancel = () => {
    setEditTitle(link.title);
    setEditUrl(link.url);
    setEditFolderId(link.folderId);
    setMusicLinks(link.musicLinks ?? []);
    setEditingMusicLink(null);
    setMediaPreview(sanitizeMediaPreview(link.mediaPreview));
    setIsEditing(false);
  };

  const handleSetMusicLinks = (newLinks: MusicLinkItem[]) => {
    setMusicLinks(newLinks);
    if (newLinks.length > 0) {
      setEditUrl(newLinks[0].url);
    }
  };

  const handleRemoveMusicLink = (platformName: string) => {
    const updatedLinks = musicLinks.filter((musicLink) => musicLink.platform !== platformName);
    setMusicLinks(updatedLinks);
    toast.success(`${platformName} music link removed!`);
  };

  const handleSetEditingMusicLink = (value: MusicLinkItem | null) => {
    setEditingMusicLink(value);
  };

  const handleSetMediaPreview = (preview: MediaPreview | null) => {
    setMediaPreview(preview);
    if (preview?.url) {
      setEditUrl(preview.url);
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
            linkId: id,
            folderId: editFolderId === "" ? undefined : editFolderId,
          });
        }

        await updateLink({
          linkId: id,
          title: editTitle.trim(),
          url: processedUrl,
          musicLinks,
          musicTrackTitle: musicLinks?.[0]?.musicTrackTitle,
          musicArtistName: musicLinks?.[0]?.musicArtistName,
          musicAlbumArtUrl: musicLinks?.[0]?.musicAlbumArtUrl,
          mediaPreview: mediaPreview || undefined,
        });

        setIsEditing(false);
        setEditingMusicLink(null);
        setMediaPreview(mediaPreview ?? null);
        router.refresh();
        toast.success("Link updated successfully!");
      } catch (err) {
        console.error("Failed to update link: ", err);
        toast.error("Failed to update link.");
      }
    });
  };

  if (!link) return null;

  const folderName = link.folderId ? folderNameMap?.[link.folderId] : "";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 border border-border rounded-2xl bg-input shadow-sm hover:shadow-md transition-shadow"
    >
      {isEditing ? (
        <div className="space-y-4">
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
              className="w-full rounded-2xl border border-border p-2 text-foreground shadow-sm focus:border-primary focus:outline-none"
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
            <input
              id="url"
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              className="w-full rounded-2xl border border-border p-2 text-foreground shadow-sm focus:border-primary focus:outline-none"
              placeholder="Enter URL"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Music Links</span>
            </div>
            {musicLinks.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Add music streaming sources for this link.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {musicLinks.map((musicLink) => (
                  <div
                    key={`${musicLink.platform}-${musicLink.type}`}
                    className="flex items-center justify-between rounded-2xl border border-border bg-card p-3"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        handleSetEditingMusicLink(musicLink);
                        setIsMusicModalOpen(true);
                      }}
                      className="flex-1 justify-start cursor-pointer px-0 py-0 h-auto rounded-2xl"
                    >
                      <span className="font-medium text-foreground">
                        {musicLink.musicTrackTitle || `${musicLink.platform} (${musicLink.type})`}
                      </span>
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
                ))}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    handleSetEditingMusicLink(null);
                    setIsMusicModalOpen(true);
                  }}
                  className="cursor-pointer rounded-2xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Source
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Media Preview</span>
            </div>
            {mediaPreview ? (
              <div className="rounded-2xl border border-border p-4 flex items-center gap-4">
                <div className="relative w-24 h-16 overflow-hidden rounded-xl">
                  <Image
                    src={mediaPreview.thumbnailUrl}
                    alt={mediaPreview.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{mediaPreview.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{mediaPreview.url}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10 rounded-full"
                  onClick={() => handleSetMediaPreview(null)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsMediaModalOpen(true)}
                className="cursor-pointer rounded-2xl flex items-center gap-2"
              >
                <TvMinimalPlayIcon className="w-4 h-4" />
                Add Media Preview
              </Button>
            )}
          </div>

          {/* Folder Selection */}
          <div className="space-y-2">
            <label
              className="block text-sm font-medium text-foreground"
              htmlFor="folder"
            >
              Folder
            </label>
            <Select
              onValueChange={(value: Id<"folders"> | "no-folder") => setEditFolderId(value === "no-folder" ? undefined : value as Id<"folders">)}
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
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
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
      ) : (
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            aria-describedby={`link=${id}`}
            className="cursor-move hover:bg-muted rounded flex-shrink-0"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-3">
            <h3 className="font-semibold text-lg text-foreground truncate cursor-default">
              {link.title}
            </h3>
            <p className="text-muted-foreground text-sm truncate cursor-default">
              {folderName && <span className="mr-2">Folder: {folderName}</span>}
              {link.musicTrackTitle && <span className="mr-2">{link.musicArtistName ? `${link.musicArtistName} • ` : ""}{link.musicTrackTitle}</span>}
              {link.url}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Analytics Button */}
            <Button variant={"outline"} size="icon" className="cursor-pointer h-8 w-8" asChild>
              <Link href={`/dashboard/link/${id}`}>
                <BarChart3 className="w-3.5 h-3.5 text-primary" />
              </Link>
            </Button>

            {/* Edit Button */}
            <Button
              variant={"outline"}
              size={"icon"}
              className="cursor-pointer h-8 w-8"
              onClick={() => {
                setIsEditing(true);
              }}
            >
              <Pencil className="w-3.5 h-3.5 text-foreground" />
            </Button>

            {/* Delete Button */}
            <Button
              variant={"outline"}
              size={"icon"}
              className="cursor-pointer h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();

                const isConfirmed = confirm(
                  `Are you sure you want to delete ${link.title}?\n\nThis action cannot be undone.`,
                );

                if (isConfirmed) {
                  deleteLink({ linkId: id });
                }
              }}
            >
              <Trash2 className="w-3.5 h-3.5 text-destructive" />
            </Button>
          </div>
        </div>
      )}
      {isEditing && (
        <>
          <MusicLinksModal
            isOpen={isMusicModalOpen}
            onOpenChange={(open) => {
              setIsMusicModalOpen(open);
              if (!open) {
                setEditingMusicLink(null);
              }
            }}
            musicLinks={musicLinks}
            setMusicLinks={handleSetMusicLinks}
            initialLink={editingMusicLink}
            onClearInitialLink={() => setEditingMusicLink(null)}
            handleRemoveMusicLink={handleRemoveMusicLink}
            showExistingLinksOnOpen={musicLinks.length > 0 && !editingMusicLink}
          />
          <MediaPreviewModal
            isOpen={isMediaModalOpen}
            onOpenChange={setIsMediaModalOpen}
            onConfirm={handleSetMediaPreview}
            initialValue={mediaPreview || undefined}
          />
        </>
      )}
    </div>
  );
};
export default SortableItem;
