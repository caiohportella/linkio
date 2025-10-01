"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FolderPlus } from "lucide-react";
import CreateFolderForm from "./forms/CreateFolderForm";
import { Id } from "@/convex/_generated/dataModel";

interface FolderCreationModalProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  folderId?: Id<"folders">;
  initialName?: string;
  title?: string;
}

const FolderCreationModal = ({
  children,
  open,
  onOpenChange,
  folderId,
  initialName,
  title = "Create New Folder",
}: FolderCreationModalProps) => {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = open !== undefined && onOpenChange !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  const handleFolderCreated = () => {
    setOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <Button
            variant={"outline"}
            className="cursor-pointer w-full dark:bg-accent dark:hover:bg-secondary-foreground bg-accent hover:bg-secondary-foreground text-white rounded-full transition-all duration-200 mt-4"
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            Add Folder
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card text-foreground rounded-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <CreateFolderForm
          onFolderCreated={handleFolderCreated}
          folderId={folderId}
          initialName={initialName}
        />
      </DialogContent>
    </Dialog>
  );
};

export default FolderCreationModal;
