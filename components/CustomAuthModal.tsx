"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CreateAccount } from "./forms/CreateAccount";

interface CustomAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomAuthModal({ open, onOpenChange }: CustomAuthModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-md w-full bg-transparent border-none rounded-2xl text-white p-6 shadow-xl"
      >
        <DialogTitle></DialogTitle>
        <CreateAccount />
      </DialogContent>
    </Dialog>
  );
}
