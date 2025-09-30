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
} from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

const SortableItem = ({
  id,
  link,
}: {
  id: Id<"links">;
  link: Doc<"links">;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, startUpdating] = useTransition();
  const [editTitle, setEditTitle] = useState(link.title);
  const [editUrl, setEditUrl] = useState(link.url);

  const updateLink = useMutation(api.lib.links.updateLink);
  const deleteLink = useMutation(api.lib.links.deleteLink);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleCancel = () => {
    setEditTitle(link.title);
    setEditUrl(link.url);
    setIsEditing(false);
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

        await updateLink({
          linkId: id,
          title: editTitle.trim(),
          url: processedUrl,
        });

        setIsEditing(false);
        toast.success("Link updated successfully!");
      } catch (err) {
        console.error("Failed to update link: ", err);
        toast.error("Failed to update link.");
      }
    });
  };

  if (!link) return null;

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
            <p className="text-muted-foreground text-sm truncate cursor-default">{link.url}</p>
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
    </div>
  );
};
export default SortableItem;
