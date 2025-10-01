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
import { SUPPORTED_MUSIC_PLATFORMS } from "@/lib/utils";
import { toast } from "sonner";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { MusicLinkItem } from "@/lib/utils";

interface MusicLinksModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  musicLinks: MusicLinkItem[];
  setMusicLinks: (newLinks: MusicLinkItem[]) => void; // Updated prop type
  initialLink?: MusicLinkItem | null;
  onClearInitialLink?: () => void; // New prop for clearing initialLink
  handleRemoveMusicLink: (platformName: string) => void; // Added prop
  showExistingLinksOnOpen?: boolean; // New prop
}

type View = "platformSelection" | "linkTypeSelection" | "inputForm" | "existingLinks";

const MusicLinksModal: React.FC<MusicLinksModalProps> = ({
  isOpen,
  onOpenChange,
  musicLinks,
  setMusicLinks,
  initialLink,
  onClearInitialLink,
  handleRemoveMusicLink,
  showExistingLinksOnOpen = false,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<{
    name: string;
    icon: React.ElementType;
    brandColor: string;
    linkTypes: {
      type: string;
      label: string;
      placeholder: string;
      urlPattern: RegExp;
      baseUrl: string;
    }[];
  } | null>(null);
  const [selectedLinkType, setSelectedLinkType] = useState<{
    type: string;
    label: string;
    placeholder: string;
    urlPattern: RegExp;
    baseUrl: string;
  } | null>(null);
  const [musicInput, setMusicInput] = useState("");
  const [musicTrackTitle, setMusicTrackTitle] = useState(""); // New state
  const [musicArtistName, setMusicArtistName] = useState(""); // New state
  const [musicAlbumArtUrl, setMusicAlbumArtUrl] = useState(""); // New state
  const [currentView, setCurrentView] = useState<View>("platformSelection"); // New state
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialLink) {
        const platform = SUPPORTED_MUSIC_PLATFORMS.find(
          (s) => s.name === initialLink.platform,
        );
        if (platform) {
          setSelectedPlatform(platform);
          for (const linkType of platform.linkTypes) {
            if (linkType.urlPattern.test(initialLink.url)) {
              setSelectedLinkType(linkType);
              const extractedId = initialLink.url.replace(
                linkType.baseUrl,
                "",
              );
              setMusicInput(extractedId);
              setMusicTrackTitle(initialLink.musicTrackTitle || ""); // Populate metadata
              setMusicArtistName(initialLink.musicArtistName || "");
              setMusicAlbumArtUrl(initialLink.musicAlbumArtUrl || "");
              setCurrentView("inputForm");
              return;
            }
          }
          setMusicInput(initialLink.url);
          setMusicTrackTitle(initialLink.musicTrackTitle || ""); // Populate metadata
          setMusicArtistName(initialLink.musicArtistName || "");
          setMusicAlbumArtUrl(initialLink.musicAlbumArtUrl || "");
          setCurrentView("inputForm");
        }
      } else if (showExistingLinksOnOpen && musicLinks.length > 0) {
        setCurrentView("existingLinks");
      } else {
        setCurrentView("platformSelection");
        setSelectedPlatform(null);
        setSelectedLinkType(null);
        setMusicInput("");
        setMusicTrackTitle(""); // Reset metadata fields
        setMusicArtistName("");
        setMusicAlbumArtUrl("");
      }
    } else {
      setSelectedPlatform(null);
      setSelectedLinkType(null);
      setMusicInput("");
      setMusicTrackTitle(""); // Reset metadata fields
      setMusicArtistName("");
      setMusicAlbumArtUrl("");
      setCurrentView("platformSelection"); // Reset view when modal closes
    }
  }, [isOpen, initialLink, showExistingLinksOnOpen, musicLinks.length]);

  const handleSelectPlatform = (platform: {
    name: string;
    icon: React.ElementType;
    brandColor: string;
    linkTypes: {
      type: string;
      label: string;
      placeholder: string;
      urlPattern: RegExp;
      baseUrl: string;
    }[];
  }) => {
    setSelectedPlatform(platform);
    setSelectedLinkType(null);
    setMusicInput("");
    setMusicTrackTitle(""); // Reset metadata fields
    setMusicArtistName("");
    setMusicAlbumArtUrl("");
    setCurrentView("linkTypeSelection");
  };

  const handleSelectLinkType = (linkType: {
    type: string;
    label: string;
    placeholder: string;
    urlPattern: RegExp;
    baseUrl: string;
  }) => {
    setSelectedLinkType(linkType);
    if (selectedPlatform) {
      const existingLink = musicLinks.find(
        (link) =>
          link.platform === selectedPlatform.name &&
          link.type === linkType.type,
      );
      if (existingLink) {
        const extractedId = existingLink.url.replace(linkType.baseUrl, "");
        setMusicInput(extractedId);
        setMusicTrackTitle(existingLink.musicTrackTitle || ""); // Populate metadata
        setMusicArtistName(existingLink.musicArtistName || "");
        setMusicAlbumArtUrl(existingLink.musicAlbumArtUrl || "");
      } else {
        setMusicInput("");
        setMusicTrackTitle(""); // Reset metadata fields
        setMusicArtistName("");
        setMusicAlbumArtUrl("");
      }
    }
    setCurrentView("inputForm");
  };

  const fetchMetadataForUrl = async (url: string) => {
    try {
      const response = await fetch("/api/music/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as {
        title?: string | null;
        artist?: string | null;
        artworkUrl?: string | null;
      };

      return {
        title: data.title ?? undefined,
        artist: data.artist ?? undefined,
        artworkUrl: data.artworkUrl ?? undefined,
      };
    } catch (error) {
      console.error("Failed to fetch music metadata", error);
      return null;
    }
  };

  const handleSaveMusicLink = async () => {
    if (!selectedPlatform) {
      toast.error("Please select a music platform.");
      return;
    }
    if (!selectedLinkType) {
      toast.error("Please select a link type.");
      return;
    }
    if (!musicInput.trim()) {
      toast.error("Please enter your track/album/playlist ID or full URL.");
      return;
    }

    const potentialFullUrl = musicInput.startsWith("http")
      ? musicInput
      : selectedLinkType.baseUrl + musicInput.trim();

    console.log("musicInput:", musicInput);
    console.log("selectedLinkType.baseUrl:", selectedLinkType.baseUrl);
    console.log("potentialFullUrl:", potentialFullUrl);
    console.log("isValidURL:", selectedLinkType.urlPattern.test(potentialFullUrl));

    if (!selectedLinkType.urlPattern.test(potentialFullUrl)) {
      toast.error("Please enter a valid URL or ID for the selected link type.");
      return;
    }

    let finalUrl = potentialFullUrl;
    if (!musicInput.startsWith("http")) {
      finalUrl = selectedLinkType.baseUrl + musicInput.trim();
    }

    setIsSaving(true);

    try {
      let autoMetadata = {
        title: musicTrackTitle || undefined,
        artist: musicArtistName || undefined,
        artworkUrl: musicAlbumArtUrl || undefined,
      };

      if (!musicTrackTitle || !musicArtistName || !musicAlbumArtUrl) {
        const fetched = await fetchMetadataForUrl(finalUrl);
        if (fetched) {
          autoMetadata = {
            title: musicTrackTitle || fetched.title,
            artist: musicArtistName || fetched.artist,
            artworkUrl: musicAlbumArtUrl || fetched.artworkUrl,
          };
          if (!musicTrackTitle && fetched.title) {
            setMusicTrackTitle(fetched.title);
          }
          if (!musicArtistName && fetched.artist) {
            setMusicArtistName(fetched.artist);
          }
          if (!musicAlbumArtUrl && fetched.artworkUrl) {
            setMusicAlbumArtUrl(fetched.artworkUrl);
          }
        }
      }

      const newLink = {
        platform: selectedPlatform.name,
        url: finalUrl,
        type: selectedLinkType.type,
        musicTrackTitle: autoMetadata.title,
        musicArtistName: autoMetadata.artist,
        musicAlbumArtUrl: autoMetadata.artworkUrl,
      };
      const existingLinkIndex = musicLinks.findIndex(
        (link) =>
          link.platform === selectedPlatform.name &&
          link.type === selectedLinkType.type &&
          link.url === initialLink?.url,
      );

      if (existingLinkIndex !== -1) {
        setMusicLinks(
          musicLinks.map((link, idx) => (idx === existingLinkIndex ? newLink : link)),
        );
      } else {
        setMusicLinks([...musicLinks, newLink]);
      }
      toast.success(
        `${selectedPlatform.name} ${selectedLinkType.label} ${existingLinkIndex !== -1 ? "updated" : "added"}!`,
      );
      onOpenChange(false);
      setSelectedPlatform(null);
      setSelectedLinkType(null);
      setMusicInput("");
      setMusicTrackTitle(""); // Reset metadata fields
      setMusicArtistName("");
      setMusicAlbumArtUrl("");
      setCurrentView("platformSelection"); // Reset view
    } catch (error) {
      console.error("Failed to save music link", error);
      toast.error("Failed to save music link. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLink = () => {
    if (initialLink) {
      handleRemoveMusicLink(initialLink.platform);
      onOpenChange(false);
      setSelectedPlatform(null);
      setSelectedLinkType(null);
      setMusicInput("");
      setMusicTrackTitle(""); // Reset metadata fields
      setMusicArtistName("");
      setMusicAlbumArtUrl("");
      setCurrentView("platformSelection"); // Reset view
    }
  };

  const handleInputBlur = () => {
    if (selectedLinkType && musicInput.trim()) {
      if (selectedLinkType.urlPattern.test(musicInput)) {
        const strippedInput = musicInput.replace(selectedLinkType.baseUrl, "");
        setMusicInput(strippedInput);
      }
    }
  };

  const handleEditExistingLink = (linkToEdit: MusicLinkItem) => {
    // This function will be called from the "existingLinks" view
    // It should set the initialLink and switch the view to inputForm for editing
    const platform = SUPPORTED_MUSIC_PLATFORMS.find(
      (s) => s.name === linkToEdit.platform,
    );
    if (platform) {
      setSelectedPlatform(platform);
      for (const linkType of platform.linkTypes) {
        if (linkType.urlPattern.test(linkToEdit.url)) {
          setSelectedLinkType(linkType);
          const extractedId = linkToEdit.url.replace(linkType.baseUrl, "");
          setMusicInput(extractedId);
          setMusicTrackTitle(linkToEdit.musicTrackTitle || ""); // Populate metadata
          setMusicArtistName(linkToEdit.musicArtistName || "");
          setMusicAlbumArtUrl(linkToEdit.musicAlbumArtUrl || "");
          setCurrentView("inputForm");
          if (onClearInitialLink) {
            onClearInitialLink(); // Ensure initialLink is cleared in parent to avoid re-editing issues
          }
          return;
        }
      }
      // Fallback if specific link type not found for existing link
      setMusicInput(linkToEdit.url);
      setMusicTrackTitle(linkToEdit.musicTrackTitle || ""); // Populate metadata
      setMusicArtistName(linkToEdit.musicArtistName || "");
      setMusicAlbumArtUrl(linkToEdit.musicAlbumArtUrl || "");
      setCurrentView("inputForm");
    }
  };

  const handleBack = () => {
    if (currentView === "inputForm") {
      setCurrentView("linkTypeSelection");
      setMusicInput("");
      setMusicTrackTitle(""); // Reset metadata fields
      setMusicArtistName("");
      setMusicAlbumArtUrl("");
    } else if (currentView === "linkTypeSelection") {
      if (showExistingLinksOnOpen && musicLinks.length > 0 && !initialLink) {
        setCurrentView("existingLinks"); // Go back to existing links if that was the entry point
      } else {
        setCurrentView("platformSelection");
      }
      setSelectedLinkType(null);
      setMusicInput("");
      setMusicTrackTitle(""); // Reset metadata fields
      setMusicArtistName("");
      setMusicAlbumArtUrl("");
    } else if (currentView === "platformSelection") {
      if (showExistingLinksOnOpen && musicLinks.length > 0 && !initialLink) {
        setCurrentView("existingLinks"); // If we came from existing links, go back there
      }
      onOpenChange(false);
      setSelectedPlatform(null);
      setSelectedLinkType(null);
      setMusicInput("");
      setMusicTrackTitle(""); // Reset metadata fields
      setMusicArtistName("");
      setMusicAlbumArtUrl("");
    } else if (currentView === "existingLinks") {
      onOpenChange(false);
      if (onClearInitialLink) {
        onClearInitialLink();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>
            {initialLink
              ? `Edit ${initialLink.platform} Link`
              : "Add Music Link"}
          </DialogTitle>
        </DialogHeader>

        {currentView === "existingLinks" ? (
          <div className="space-y-4 py-4">
            <p className="text-lg font-semibold text-foreground">Your Music Links</p>
            {musicLinks.length === 0 ? (
              <p className="text-muted-foreground">No music links added yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {musicLinks.map((link, index) => {
                  const platform = SUPPORTED_MUSIC_PLATFORMS.find(
                    (p) => p.name === link.platform,
                  );
                  const Icon = platform?.icon;
                  return (
                    <div key={index} className="relative group flex items-center justify-between p-3 bg-card rounded-2xl border border-border">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleEditExistingLink(link)}
                        className="flex-1 justify-start cursor-pointer px-0 py-0 h-auto rounded-2xl"
                      >
                        {Icon && <span className="mr-2" style={{ color: platform?.brandColor || "#000000" }}>{React.createElement(Icon, { className: "w-5 h-5" })}</span>}
                        <span className="font-medium text-foreground">{link.musicTrackTitle || `${link.platform} (${link.type})`}</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMusicLink(link.platform)}
                        className="text-destructive hover:bg-destructive/10 rounded-full w-8 h-8"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex justify-between mt-4">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="cursor-pointer rounded-2xl"
              >
                Back
              </Button>
              <Button
                onClick={() => setCurrentView("platformSelection")}
                className="cursor-pointer rounded-2xl"
              >
                <Plus className="w-4 h-4 mr-2 animate-pulse" />
                Add New Link
              </Button>
            </div>
          </div>
        ) : currentView === "platformSelection" ? (
          <div className="grid grid-cols-2 gap-4 py-4">
            {SUPPORTED_MUSIC_PLATFORMS.filter(
              (music) =>
                !musicLinks.some((link) => link.platform === music.name && (!initialLink || initialLink.platform !== music.name)) ||
                (initialLink && initialLink.platform === music.name),
            ).map((music) => {
              const isAlreadyAdded = musicLinks.some(
                (link) => link.platform === music.name,
              );
              const isCurrentlyEditing = initialLink?.platform === music.name;
              const Icon = music.icon;
              const brandColor = music.brandColor || "#000000";

              const buttonBgColor = brandColor;
              const buttonTextColor = "white";
              const buttonBorderColor = brandColor;

              return (
                <Button
                  key={music.name}
                  variant="outline"
                  onClick={() => handleSelectPlatform(music)}
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
                  <Icon className="w-5 h-5" style={{ color: buttonTextColor }} />
                  <span
                    className="font-medium"
                    style={{ color: buttonTextColor }}
                  >
                    {music.name}
                  </span>
                </Button>
              );
            })}
          </div>
        ) : currentView === "linkTypeSelection" ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 mb-4">
              {selectedPlatform?.icon && (
                <span className="flex items-center justify-center">
                  {React.createElement(selectedPlatform.icon, { className: "w-5 h-5" })}
                </span>
              )}
              <span className="text-lg font-semibold">
                {selectedPlatform?.name} - Select Link Type
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {selectedPlatform?.linkTypes.map((linkType) => (
                <Button
                  key={linkType.type}
                  variant="outline"
                  onClick={() => handleSelectLinkType(linkType)}
                  className="cursor-pointer flex items-center gap-2 rounded-2xl p-4 transition-all duration-200 hover:brightness-110"
                  style={{
                    backgroundColor: selectedPlatform?.brandColor,
                    color: "white",
                    borderColor: selectedPlatform?.brandColor,
                    borderWidth: "2px",
                  }}
                >
                  {linkType.label}
                </Button>
              ))}
            </div>
            <div className="flex justify-start mt-4">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="cursor-pointer rounded-2xl"
              >
                Back
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2">
              {selectedPlatform?.icon && (
                <span className="flex items-center justify-center">
                  {React.createElement(selectedPlatform.icon, { className: "w-5 h-5" })}
                </span>
              )}
              <span className="text-lg font-semibold">
                {selectedPlatform?.name} - {selectedLinkType?.label}
              </span>
            </div>
            <Input
              placeholder={selectedLinkType?.placeholder || "Enter link"}
              value={musicInput}
              onChange={(e) => setMusicInput(e.target.value)}
              onBlur={handleInputBlur}
              className="rounded-2xl flex-1 mb-4"
            />

            {/* New Input Fields for Music Metadata */}
            <Input
              placeholder="Track Title (Optional)"
              value={musicTrackTitle}
              onChange={(e) => setMusicTrackTitle(e.target.value)}
              className="rounded-2xl flex-1 mb-4"
            />
            <Input
              placeholder="Artist Name (Optional)"
              value={musicArtistName}
              onChange={(e) => setMusicArtistName(e.target.value)}
              className="rounded-2xl flex-1 mb-4"
            />
            <Input
              placeholder="Album Art URL (Optional)"
              value={musicAlbumArtUrl}
              onChange={(e) => setMusicAlbumArtUrl(e.target.value)}
              className="rounded-2xl flex-1 mb-4"
            />

            {selectedLinkType?.baseUrl && (
              <p className="text-xs text-muted-foreground break-all mt-2">
                Preview:{" "}
                <span className="underline">
                  {musicInput
                    ? selectedLinkType.baseUrl + musicInput
                    : "Enter ID for preview"}
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
                  onClick={handleSaveMusicLink}
                  className="cursor-pointer rounded-2xl"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MusicLinksModal;
