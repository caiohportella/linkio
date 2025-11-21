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
import { Loader2, Save, Sparkles } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

interface HighlightData {
  url: string;
  text: string;
  imageUrl: string;
}

interface HighlightModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: HighlightData | null) => void;
  initialValue?: HighlightData;
}

const HighlightModal = ({
  isOpen,
  onOpenChange,
  onConfirm,
  initialValue,
}: HighlightModalProps) => {
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUrl(initialValue?.url ?? "");
      setText(initialValue?.text ?? "");
      setImageUrl(initialValue?.imageUrl ?? "");
      setError(null);
    }
  }, [isOpen, initialValue]);

  const handleUrlBlur = async () => {
    if (!url.trim()) return;
    if (imageUrl && url === initialValue?.url) return; // Don't refetch if URL hasn't changed and we have an image

    setIsLoadingPreview(true);
    setError(null);

    try {
      const response = await fetch("/api/og/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(
          data?.error ?? "Failed to load preview. Please check the URL.",
        );
        setIsLoadingPreview(false);
        return;
      }

      const data = await response.json();
      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
      } else {
        setError("No image found for this URL.");
      }
    } catch (err) {
      console.error("Failed to fetch OG preview", err);
      setError("Unexpected error fetching preview.");
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleSave = () => {
    if (!url.trim() || !text.trim() || !imageUrl) {
      setError("Please fill in all fields and ensure an image is loaded.");
      return;
    }

    onConfirm({
      url,
      text,
      imageUrl,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Create Highlight
          </DialogTitle>
          <DialogDescription>
            Highlight a special link with a cover image and custom text.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">
              Destination URL
            </label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={handleUrlBlur}
              placeholder="https://example.com/my-new-release"
              className="rounded-2xl"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Highlight Text
            </label>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Listen to my new single!"
              className="rounded-2xl"
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {text.length}/50
            </p>
          </div>

          {/* Preview Area */}
          <div className="mt-4">
            <label className="text-sm font-medium mb-2 block">Preview</label>
            <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-slate-200">
              {isLoadingPreview ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
              ) : imageUrl ? (
                <>
                  <Image
                    src={imageUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center px-6">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-full font-medium text-center shadow-lg w-full max-w-[80%]"
                    >
                      {text || "Your text here"}
                    </motion.div>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                  <Sparkles className="w-12 h-12 mb-2 opacity-50" />
                  <p className="text-sm">
                    Enter a URL to generate a preview
                  </p>
                </div>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer rounded-2xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!imageUrl || !text.trim() || isLoadingPreview}
            className="cursor-pointer rounded-2xl"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Highlight
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HighlightModal;
