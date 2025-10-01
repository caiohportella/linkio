"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { MediaPreview } from "@/lib/utils";

interface MediaPreviewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (preview: MediaPreview | null) => void;
  initialValue?: MediaPreview;
}

const MediaPreviewModal = ({
  isOpen,
  onOpenChange,
  onConfirm,
  initialValue,
}: MediaPreviewModalProps) => {
  const [inputValue, setInputValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setInputValue(initialValue?.url ?? "");
      setError(null);
    }
  }, [isOpen, initialValue]);

  const handleSave = async () => {
    if (!inputValue.trim()) {
      setError("Please enter a YouTube URL.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/media/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: inputValue.trim() }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data?.error ?? "Failed to load preview. Please try another URL.");
        return;
      }

      const data = (await response.json()) as MediaPreview;
      onConfirm(data);
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to fetch media preview", err);
      setError("Unexpected error fetching preview.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Media Preview</DialogTitle>
          <DialogDescription>
            Paste a YouTube link to generate a thumbnail preview for this media item.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="rounded-2xl"
          />

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-2xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-2xl"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Preview"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MediaPreviewModal;

