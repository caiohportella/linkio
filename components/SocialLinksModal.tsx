"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { SUPPORTED_SOCIALS } from "@/lib/utils";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface SocialLinksModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  socialLinks: { platform: string; url: string }[];
  setSocialLinks: React.Dispatch<
    React.SetStateAction<{ platform: string; url: string }[]>
  >;
  initialLink?: { platform: string; url: string } | null;
  onClearInitialLink?: () => void; // New prop for clearing initialLink
  handleRemoveSocial: (platformName: string) => void; // Added prop
}

const SocialLinksModal: React.FC<SocialLinksModalProps> = ({
  isOpen,
  onOpenChange,
  socialLinks,
  setSocialLinks,
  initialLink,
  onClearInitialLink,
  handleRemoveSocial, // Destructure new prop
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<{
    name: string;
    icon: React.ElementType;
    baseUrl: string;
  } | null>(null);
  const [socialInput, setSocialInput] = useState("");

  useEffect(() => {
    if (initialLink) {
      const platform = SUPPORTED_SOCIALS.find(
        (s) => s.name === initialLink.platform,
      );
      if (platform) {
        setSelectedPlatform(platform);
        setSocialInput(initialLink.url.replace(platform.baseUrl, ""));
      }
    } else {
      setSelectedPlatform(null);
      setSocialInput("");
    }
  }, [initialLink]);

  const handleSelectPlatform = (platform: {
    name: string;
    icon: React.ElementType;
    baseUrl: string;
  }) => {
    setSelectedPlatform(platform);
    const existingLink = socialLinks.find(
      (link) => link.platform === platform.name,
    );
    if (existingLink) {
      setSocialInput(existingLink.url.replace(platform.baseUrl, ""));
    } else {
      setSocialInput("");
    }
  };

  const handleSaveSocialLink = () => {
    if (selectedPlatform && socialInput.trim()) {
      const newLinkUrl = selectedPlatform.baseUrl + socialInput.trim();
      const existingLinkIndex = socialLinks.findIndex(
        (link) => link.platform === selectedPlatform.name,
      );
      const newLink = { platform: selectedPlatform.name, url: newLinkUrl };

      if (existingLinkIndex !== -1) {
        setSocialLinks((prev) =>
          prev.map((link, idx) => (idx === existingLinkIndex ? newLink : link)),
        );
      } else {
        setSocialLinks((prev) => [...prev, newLink]);
      }
      toast.success(
        `${selectedPlatform.name} link ${existingLinkIndex !== -1 ? "updated" : "added"}!`, // Explicitly check if it's updated or added
      );
      onOpenChange(false);
      setSelectedPlatform(null);
      setSocialInput("");
    } else {
      toast.error("Please select a platform and enter your username.");
    }
  };

  const handleDeleteLink = () => {
    if (initialLink) {
      handleRemoveSocial(initialLink.platform);
      onOpenChange(false);
      setSelectedPlatform(null);
      setSocialInput("");
    }
  };

  const handleBack = () => {
    setSelectedPlatform(null);
    if (onClearInitialLink) {
      onClearInitialLink(); // Clear initialLink in parent when going back
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>
            {initialLink
              ? `Edit ${initialLink.platform} Link`
              : "Add Social Link"}
          </DialogTitle>
        </DialogHeader>
        {!selectedPlatform ? (
          <div className="grid grid-cols-2 gap-4 py-4">
            {SUPPORTED_SOCIALS.filter(
              (social) =>
                !socialLinks.some((link) => link.platform === social.name) ||
                (initialLink && initialLink.platform === social.name),
            ).map((social) => {
              const isAlreadyAdded = socialLinks.some(
                (link) => link.platform === social.name,
              );
              const isCurrentlyEditing = initialLink?.platform === social.name;
              const Icon = social.icon;
              const brandColor = social.brandColor || "#000000";

              // Determine button and text styles
              let buttonBgColor = "transparent";
              let buttonTextColor = brandColor;
              let buttonBorderColor = brandColor;

              if (isAlreadyAdded || isCurrentlyEditing) {
                buttonBgColor = brandColor; // Solid brand color if already added or currently editing
                buttonTextColor = "white";
                buttonBorderColor = brandColor;
              } else {
                // Not added (hollow)
                buttonBgColor = brandColor;
                buttonTextColor = "white"; // Original text color
                buttonBorderColor = brandColor; // Original border color
              }

              return (
                <Button
                  key={social.name}
                  variant="outline"
                  onClick={() => handleSelectPlatform(social)}
                  className={`cursor-pointer flex items-center gap-2 rounded-2xl p-4 transition-all duration-200 ${
                    isAlreadyAdded || isCurrentlyEditing
                      ? "hover:brightness-110"
                      : ""
                  }`}
                  style={{
                    backgroundColor: buttonBgColor,
                    color: buttonTextColor,
                    borderColor: buttonBorderColor,
                    borderWidth: "2px",
                  }}
                  onMouseEnter={(e) => {
                    if (!isAlreadyAdded && !isCurrentlyEditing) {
                      e.currentTarget.style.boxShadow = `0 0 10px ${brandColor}`; // Glow effect
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isAlreadyAdded && !isCurrentlyEditing) {
                      e.currentTarget.style.boxShadow = "none";
                    }
                  }}
                >
                  <Icon
                    className={`w-5 h-5`}
                    style={{ color: buttonTextColor }}
                  />
                  <span
                    className="font-medium"
                    style={{ color: buttonTextColor }}
                  >
                    {social.name}
                  </span>
                </Button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2">
              <selectedPlatform.icon className="w-5 h-5" />
              <span className="text-lg font-semibold">
                {selectedPlatform.name}
              </span>
            </div>
            <Input
              placeholder={
                selectedPlatform.name === "WhatsApp" ? "number" : "username"
              }
              value={socialInput}
              onChange={(e) => setSocialInput(e.target.value)}
              className="rounded-2xl flex-1"
            />
            {selectedPlatform.baseUrl && (
              <p className="text-xs text-muted-foreground break-all mt-2">
                Preview:{" "}
                <span className="underline">
                  {socialInput
                    ? selectedPlatform.baseUrl + socialInput
                    : selectedPlatform.baseUrl}
                </span>
              </p>
            )}
            <div className="flex justify-between mt-4">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="cursor-pointer rounded-2xl"
              >
                Back
              </Button>
              <div className="flex gap-2">
                {initialLink && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDeleteLink}
                    className="cursor-pointer rounded-2xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  onClick={handleSaveSocialLink}
                  className="cursor-pointer rounded-2xl"
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SocialLinksModal;
