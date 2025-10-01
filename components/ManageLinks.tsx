"use client";

import { api } from "@/convex/_generated/api";
import {
  Preloaded,
  useMutation,
  usePreloadedQuery,
  useQuery,
} from "convex/react";
import { useMemo, useState } from "react";

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "./ui/button";
import Link from "next/link";
import { FolderPlusIcon, Plus } from "lucide-react";
import SortableItem from "./SortableItem";
import { Doc, Id } from "@/convex/_generated/dataModel";
import FolderCreationModal from "./FolderCreationModal";
import { useRouter } from "next/navigation";

interface ManageLinksProps {
  preloadedLinks: Preloaded<typeof api.lib.links.getLinksByUserId>;
  preloadedFolders: Preloaded<typeof api.lib.folders.getFoldersByUserId>;
}

const ManageLinks = ({
  preloadedLinks,
  preloadedFolders,
}: ManageLinksProps) => {
  const links = usePreloadedQuery(preloadedLinks);
  const folders = usePreloadedQuery(preloadedFolders);
  const updateLinkOrder = useMutation(api.lib.links.updateLinkOrder);

  const [items, setItems] = useState(links.map((link) => link._id));

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id as Id<"links">);
        const newIndex = items.indexOf(over?.id as Id<"links">);
        const newItems = arrayMove(items, oldIndex, newIndex);

        updateLinkOrder({ linkIds: newItems });

        return newItems;
      });
    }
  }

  const linkMap = useMemo(() => {
    return Object.fromEntries(links.map((link) => [link._id, link]));
  }, [links]);

  const folderNameMap = useMemo(() => {
    return Object.fromEntries(folders.map((folder) => [folder._id, folder.name]));
  }, [folders]);

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((id) => {
              const link = linkMap[id];
              if (!link) return null;
              return (
                <SortableItem
                  key={id}
                  id={id}
                  link={link}
                  folderNameMap={folderNameMap as Record<Id<"folders">, string>}
                  folders={folders as Doc<"folders">[]}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      <div className="flex flex-col md:flex-row gap-2 mt-4 md:justify-between">
        <Button
          variant={"outline"}
          className="w-full dark:bg-accent dark:hover:bg-secondary-foreground bg-accent hover:bg-secondary-foreground text-white rounded-full transition-all duration-200"
          asChild
        >
          <Link
            href={"/dashboard/new-link"}
            className="flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Link
          </Link>
        </Button>
      </div>
    </>
  );
};
export default ManageLinks;
