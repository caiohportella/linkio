"use client";

import { Doc, Id } from "@/convex/_generated/dataModel";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Loader2,
  Pencil,
  Save,
  Trash2,
} from "lucide-react";
import { Button } from "./ui/button";
import { useState, useTransition } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

const SortableFolderItem = ({
  id,
  folder,
}: {
  id: Id<"folders">;
  folder: Doc<"folders">;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, startUpdating] = useTransition();
  const [editName, setEditName] = useState(folder.name);

  const updateFolder = useMutation(api.lib.folders.updateFolder);
  const deleteFolder = useMutation(api.lib.folders.deleteFolder);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleCancel = () => {
    setEditName(folder.name);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editName.trim()) return;

    startUpdating(async () => {
      try {
        await updateFolder({
          folderId: id,
          name: editName.trim(),
        });

        setIsEditing(false);
        toast.success("Folder updated successfully!");
      } catch (err) {
        console.error("Failed to update folder: ", err);
        toast.error("Failed to update folder.");
      }
    });
  };

  if (!folder) return null;

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
              htmlFor="name"
            >
              Name
            </label>
            <input
              id="name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full rounded-2xl border border-border p-2 text-foreground shadow-sm focus:border-primary focus:outline-none"
              placeholder="Enter folder name"
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
            aria-describedby={`folder=${id}`}
            className="cursor-move hover:bg-muted rounded flex-shrink-0"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-3">
            <h3 className="font-semibold text-lg text-foreground truncate cursor-default">
              {folder.name}
            </h3>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
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
                  `Are you sure you want to delete ${folder.name}?\n\nThis action cannot be undone.`,
                );

                if (isConfirmed) {
                  deleteFolder({ folderId: id });
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
export default SortableFolderItem;
