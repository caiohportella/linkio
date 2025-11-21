"use client";

import { Doc, Id } from "@/convex/_generated/dataModel";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  BarChart3,
  GripVertical,
  Pencil,
  Trash2,
  Clock,
  Folder,
  Music,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatDateTime } from "@/lib/utils";
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
import EditLinkModal from "./EditLinkModal";

interface SortableItemProps {
  id: Id<"links">;
  link: Doc<"links">;
  folderNameMap?: Record<Id<"folders">, string>; // Made optional
  folders?: Doc<"folders">[]; // Made optional
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

const SortableItem = ({
  id,
  link,
  folderNameMap,
  folders,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
}: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const isScheduleInFuture = link.scheduledAt
    ? link.scheduledAt > Date.now()
    : false;

  // Animation state for reordering
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<
    "up" | "down" | null
  >(null);

  const deleteLink = useMutation(api.lib.links.deleteLink);

  // Animation handlers
  const handleAnimatedMoveUp = () => {
    if (onMoveUp && canMoveUp) {
      setAnimationDirection("up");
      setIsAnimating(true);
      onMoveUp();
      setTimeout(() => {
        setIsAnimating(false);
        setAnimationDirection(null);
      }, 300);
    }
  };

  const handleAnimatedMoveDown = () => {
    if (onMoveDown && canMoveDown) {
      setAnimationDirection("down");
      setIsAnimating(true);
      onMoveDown();
      setTimeout(() => {
        setIsAnimating(false);
        setAnimationDirection(null);
      }, 300);
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (!link) return null;

  const folderName = link.folderId ? folderNameMap?.[link.folderId] : "";

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {/* Mobile reorder buttons - positioned outside the card */}
      <div className="sm:hidden absolute -left-8 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-10">
        <button
          onClick={handleAnimatedMoveUp}
          disabled={!canMoveUp || isAnimating}
          className="h-6 w-6 p-0 transition-all duration-200 cursor-pointer hover:bg-muted/50 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <ChevronUp
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
              isAnimating && animationDirection === "up" ? "scale-110" : ""
            }`}
          />
        </button>
        <button
          onClick={handleAnimatedMoveDown}
          disabled={!canMoveDown || isAnimating}
          className="h-6 w-6 p-0 transition-all duration-200 cursor-pointer hover:bg-muted/50 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
              isAnimating && animationDirection === "down" ? "scale-110" : ""
            }`}
          />
        </button>
      </div>

      <div
        className={`bg-card border border-border rounded-2xl p-4 shadow-sm transition-all duration-300 ease-out ${
          isDragging
            ? "scale-102 shadow-xl border-primary ring-4 ring-primary/30 rotate-1"
            : isAnimating
              ? animationDirection === "up"
                ? "animate-slide-up"
                : "animate-slide-down"
              : ""
        }`}
      >
        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            aria-describedby={`link=${id}`}
            className="cursor-move rounded flex-shrink-0 p-1 -m-1 hover:bg-muted transition-colors duration-200"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors duration-200" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-3">
            <h3 className="font-semibold text-lg text-foreground truncate cursor-default">
              {link.title}
            </h3>
            <div className="space-y-1">
              {folderName && (
                <p className="text-muted-foreground text-sm flex items-center gap-2">
                  <Folder className="w-3 h-3" />
                  {folderName}
                </p>
              )}
              {link.musicTrackTitle && (
                <p className="text-muted-foreground text-sm flex items-center gap-2">
                  <Music className="w-3 h-3" />
                  {link.musicArtistName ? `${link.musicArtistName} • ` : ""}
                  {link.musicTrackTitle}
                </p>
              )}
              <p className="text-muted-foreground text-sm truncate">
                {link.url}
              </p>
            </div>
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
            <Button
              variant={"outline"}
              size="icon"
              className="cursor-pointer h-8 w-8"
              asChild
            >
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
                setIsEditModalOpen(true);
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

        {/* Mobile Layout */}
        <div className="sm:hidden space-y-3 pl-10">
          {/* Header with title */}
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base text-foreground leading-tight">
                {link.title}
              </h3>
            </div>
          </div>

          {/* Content details */}
          <div className="space-y-1">
            {folderName && (
              <p className="text-muted-foreground text-sm flex items-center gap-2">
                <Folder className="w-3 h-3" />
                {folderName}
              </p>
            )}
            {link.musicTrackTitle && (
              <p className="text-muted-foreground text-sm flex items-center gap-2">
                <Music className="w-3 h-3" />
                {link.musicArtistName ? `${link.musicArtistName} • ` : ""}
                {link.musicTrackTitle}
              </p>
            )}
            <p className="text-muted-foreground text-sm truncate">
              {link.url}
            </p>

            {isScheduleInFuture && link.scheduledAt && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Scheduled for {formatDateTime(link.scheduledAt)}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            {/* Analytics Button */}
            <Button
              variant={"outline"}
              size="sm"
              className="cursor-pointer"
              asChild
            >
              <Link
                href={`/dashboard/link/${id}`}
                className="flex items-center gap-1"
              >
                <BarChart3 className="w-3.5 h-3.5 text-primary" />
              </Link>
            </Button>

            {/* Edit Button */}
            <Button
              variant={"outline"}
              size="sm"
              className="cursor-pointer"
              onClick={() => {
                setIsEditModalOpen(true);
              }}
            >
              <Pencil className="w-3.5 h-3.5 text-foreground" />
            </Button>

            {/* Delete Button */}
            <Button
              variant={"outline"}
              size="sm"
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="w-3.5 h-3.5 text-destructive" />
            </Button>
          </div>
        </div>
      </div>

      <EditLinkModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        link={link}
        folders={folders}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => setIsDeleteDialogOpen(open)}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete link?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The link &quot;{link.title}&quot;
              will be permanently removed.
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
