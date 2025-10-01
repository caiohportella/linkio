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

interface FolderCreationModalProps {
  children?: React.ReactNode;
}

const FolderCreationModal = ({ children }: FolderCreationModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleFolderCreated = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <Button
            variant={"outline"}
            className="w-full dark:bg-accent dark:hover:bg-secondary-foreground bg-accent hover:bg-secondary-foreground text-white rounded-full transition-all duration-200 mt-4"
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            Add Folder
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card text-foreground rounded-2xl">
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
        </DialogHeader>
        <CreateFolderForm onFolderCreated={handleFolderCreated} />
      </DialogContent>
    </Dialog>
  );
};

export default FolderCreationModal;
