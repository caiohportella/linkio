"use client";

import { useState, useMemo, useEffect } from "react";
import {
  useMutation,
  usePreloadedQuery,
  Preloaded,
} from "convex/react"; // Import Preloaded and usePreloadedQuery
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel"; // Import Doc for links
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";
import { ChevronLeft, Folder, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ManageFoldersProps {
  preloadedFolders: Preloaded<typeof api.lib.folders.getFoldersByUserId>;
  preloadedLinks: Preloaded<typeof api.lib.links.getLinksByUserId>;
}

export const ManageFolders = ({ preloadedFolders, preloadedLinks }: ManageFoldersProps) => {
  const folders = usePreloadedQuery(preloadedFolders); 
  const links = usePreloadedQuery(preloadedLinks); 
  
  // States for folder navigation and animation
  const [activeFolderId, setActiveFolderId] = useState<Id<"folders"> | null>(null);
  const [showMainContent, setShowMainContent] = useState(true);
  const [showFolderContent, setShowFolderContent] = useState(false);

  // State for reordering links within an active folder
  const [folderLinkItems, setFolderLinkItems] = useState<Id<"links">[]>([]);

  // Effect to manage animations and folderLinkItems when activeFolderId or links change
  useEffect(() => {
    if (activeFolderId) {
      setShowMainContent(false); // Start fading out main content
      const timer = setTimeout(() => setShowFolderContent(true), 300); // Fade in folder content after main content fades out
      setFolderLinkItems(links.filter(link => link.folderId === activeFolderId).map(link => link._id));
      return () => clearTimeout(timer);
    } else {
      setShowFolderContent(false); // Start fading out folder content
      const timer = setTimeout(() => setShowMainContent(true), 300); // Fade in main content after folder content fades out
      return () => clearTimeout(timer);
    }
  }, [activeFolderId, links]);

  const updateLinkOrder = useMutation(api.lib.links.updateLinkOrder); // Use existing updateLinkOrder for links

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // handleDragEnd for link reordering within a folder
  const handleDragEnd = async (event: DragEndEvent) => { // Renamed from handleLinkDragEnd
    const { active, over } = event;

    if (active.id !== over?.id) {
      setFolderLinkItems((items) => {
        const oldIndex = items.indexOf(active.id as Id<"links">);
        const newIndex = items.indexOf(over?.id as Id<"links">);
        const newItems = arrayMove(items, oldIndex, newIndex);

        updateLinkOrder({ linkIds: newItems });

        return newItems;
      });
    }
  };

  const folderMap = useMemo(() => {
    return Object.fromEntries(folders.map((folder) => [folder._id, folder]));
  }, [folders]);

  const linkMap = useMemo(() => {
    return Object.fromEntries(links.map((link) => [link._id, link]));
  }, [links]);

  const folderNameMap = useMemo(() => {
    return Object.fromEntries(
      folders.map((folder) => [folder._id, folder.name]),
    );
  }, [folders]);

  return (
    <>
      {activeFolderId && (
        <button
          onClick={() => setActiveFolderId(null)}
          className="cursor-pointer flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors duration-200 mb-4"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to all folders
        </button>
      )}

      {activeFolderId && (
        <h2 className="text-2xl font-bold text-text mb-4">
          {folderNameMap[activeFolderId]}
        </h2>
      )}

      {/* Main Content (Folders and Un-foldered Links) */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          showMainContent ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="space-y-4">
          {/* Render Folders as clickable buttons */}
          {!activeFolderId && folders.map((folder) => (
            <button
              key={folder._id}
              onClick={() => setActiveFolderId(folder._id)}
              className="cursor-pointer flex items-center justify-between w-full p-4 bg-input border-input hover:border-slate-300/50 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/5 hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <Folder className="w-5 h-5 text-slate-600" />
                <h3 className="text-lg font-bold text-text">
                  {folder.name}
                </h3>
              </div>
              <ArrowUpRight
                className="w-5 h-5 text-text transition-transform duration-200"
              />
            </button>
          ))}


        </div>
      </div>

      {/* Folder Content (Links within active folder) */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          showFolderContent ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        {activeFolderId && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd} // This is for link reordering inside a folder
          >
            <SortableContext
              items={folderLinkItems} // Link reordering items
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {folderLinkItems.map((id) => {
                  const link = linkMap[id];
                  if (!link) return null;
                  return (
                    <SortableItem
                      key={id}
                      id={id}
                      link={link}
                      folderNameMap={folderNameMap}
                      folders={folders}
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </>
  );
};
