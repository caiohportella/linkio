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
import { Id } from "@/convex/_generated/dataModel";
import FolderCreationModal from "./FolderCreationModal";
import { useRouter } from "next/navigation";

interface ManageLinksProps {
  preloadedLinks: Preloaded<typeof api.lib.links.getLinksByUserId>;
}

const ManageLinks = ({
  preloadedLinks,
}: ManageLinksProps) => {
  const links = usePreloadedQuery(preloadedLinks);
  const updateLinkOrder = useMutation(api.lib.links.updateLinkOrder);

  const [items, setItems] = useState(links.map((link) => link._id)); // Re-introduce items state for all links

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;

    if (active.id !== over?.id) {
      setItems((items) => { // Use setItems for all links
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
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      <div className="flex flex-col md:flex-row gap-2 mt-4 md:justify-between">
        <Button
          variant={"outline"}
          className="w-full md:w-10/12 dark:bg-accent dark:hover:bg-secondary-foreground bg-accent hover:bg-secondary-foreground text-white rounded-full transition-all duration-200"
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

        <FolderCreationModal>
          <Button
            variant={"outline"}
            className="cursor-pointer md:w-2/12 w-full dark:bg-accent dark:hover:bg-secondary-foreground bg-accent hover:bg-secondary-foreground text-white rounded-full transition-all duration-200"
          >
            <FolderPlusIcon className="w-4 h-4 animate-pulse" />
            <span className="block md:hidden">Add Folder</span>
          </Button>
        </FolderCreationModal>
      </div>
    </>
  );
};
export default ManageLinks;
