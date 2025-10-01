"use client";

import { Doc, Id } from "@/convex/_generated/dataModel";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  BarChart3,
  GripVertical,
  Loader2,
  Pencil,
  Save,
  Trash2,
  Clock,
} from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import { MediaPreview, MusicLinkItem, formatDateTime } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import dynamic from "next/dynamic";

const sanitizeMediaPreview = (
  value: Doc<"links">["mediaPreview"] | undefined,
): MediaPreview | null => {
  if (!value) return null;
  if (value.platform === "youtube") {
    return value as MediaPreview;
  }
  return null;
};

const ScheduleLinkModal = dynamic(() => import("./ScheduleLinkModal"), {
  ssr: false,
});

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
  const [mediaPreview, setMediaPreview] = useState<MediaPreview | null>(
    sanitizeMediaPreview(link.mediaPreview),
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [scheduledAt, setScheduledAt] = useState<number | null>(link.scheduledAt ?? null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleCleared, setScheduleCleared] = useState(false);
  const isScheduleActive = !!scheduledAt || isScheduleModalOpen;
  const isScheduleInFuture = link.scheduledAt ? link.scheduledAt > Date.now() : false;

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
      setScheduledAt(link.scheduledAt ?? null);
      setScheduleCleared(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [link.musicLinks, link.title, link.url, link.folderId]);

  const handleCancel = () => {
    setEditTitle(link.title);
    setEditUrl(link.url);
    setEditFolderId(link.folderId);
    setMusicLinks(link.musicLinks ?? []);
    setMediaPreview(sanitizeMediaPreview(link.mediaPreview));
    setScheduledAt(link.scheduledAt ?? null);
    setScheduleCleared(false);
    setIsEditing(false);
  };

  const handleSetMusicLinks = (newLinks: MusicLinkItem[]) => {
    setMusicLinks(newLinks);
    toast.success("Music links updated!");
  };

  const handleRemoveMusicLink = (platformName: string) => {
    const updatedLinks = musicLinks.filter((musicLink) => musicLink.platform !== platformName);
    setMusicLinks(updatedLinks);
    toast.success(`${platformName} music link removed!`);
  };

  const handleClearMediaPreview = () => {
    setMediaPreview(null);
    if (!musicLinks.length) {
      setEditUrl(link.url);
    }
  };

  const handleSetScheduledAt = (value: number | null) => {
    setScheduledAt(value);
    setScheduleCleared(value === null);
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
          scheduledAt: scheduleCleared || scheduledAt === null ? undefined : scheduledAt ?? undefined,
          clearSchedule: scheduleCleared ? true : undefined,
        });

        setIsEditing(false);
        setMediaPreview(mediaPreview ?? null);
        setScheduledAt(scheduledAt ?? null);
        setScheduleCleared(false);
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
            {mediaPreview ? (
              <input id="url" type="hidden" value={mediaPreview.url} />
            ) : (
              <input
                id="url"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                className="w-full rounded-2xl border border-border p-2 text-foreground shadow-sm focus:border-primary focus:outline-none"
                placeholder="Enter URL"
              />
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Music Links</span>
            </div>
            {musicLinks.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No music sources currently linked.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {musicLinks.map((musicLink) => (
                  <div
                    key={`${musicLink.platform}-${musicLink.type}`}
                    className="flex items-center justify-between rounded-2xl border border-border bg-card p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {musicLink.musicTrackTitle || `${musicLink.platform} (${musicLink.type})`}
                      </p>
                      {musicLink.musicArtistName && (
                        <p className="text-xs text-muted-foreground truncate">
                          {musicLink.musicArtistName}
                        </p>
                      )}
                    </div>
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
                  onClick={handleClearMediaPreview}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No media preview available for this link.
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Schedule</span>
            </div>
            {scheduledAt ? (
              <div className="rounded-2xl border border-border p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Scheduled</p>
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
                  The link will be visible on your public page at the scheduled time.
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
            {isScheduleInFuture && link.scheduledAt && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Scheduled for {formatDateTime(link.scheduledAt)}
              </p>
            )}
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
                setIsDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="w-3.5 h-3.5 text-destructive" />
            </Button>
          </div>
        </div>
      )}
      <ScheduleLinkModal
        isOpen={isScheduleModalOpen}
        onOpenChange={setIsScheduleModalOpen}
        initialValue={scheduledAt ?? undefined}
        onConfirm={handleSetScheduledAt}
      />
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => setIsDeleteDialogOpen(open)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete link?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The link "{link.title}" will be
              permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer rounded-2xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer rounded-2xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                deleteLink({ linkId: id });
                setIsDeleteDialogOpen(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
export default SortableItem;
