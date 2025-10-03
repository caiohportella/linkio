"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  SUPPORTED_MUSIC_PLATFORMS,
  extractAppleMusicRegion,
  buildAppleMusicUrl,
  extractAmazonMusicRegion,
  buildAmazonMusicUrl,
  shortenAppleMusicUrl,
} from "@/lib/utils";
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
  onPlaylistAdded?: (playlist: {
    platform: string;
    url: string;
    playlistId: string;
    title: string;
    description?: string;
    thumbnailUrl?: string;
    trackCount?: number;
    ownerName?: string;
    tracks?: {
      name: string;
      artist: string;
      duration?: string;
      previewUrl?: string;
    }[];
  }) => void; // New prop for playlist data
}

type View =
  | "platformSelection"
  | "linkTypeSelection"
  | "inputForm"
  | "existingLinks";

const MusicLinksModal: React.FC<MusicLinksModalProps> = ({
  isOpen,
  onOpenChange,
  musicLinks,
  setMusicLinks,
  initialLink,
  onClearInitialLink,
  handleRemoveMusicLink,
  showExistingLinksOnOpen = false,
  onPlaylistAdded,
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
              const extractedId = initialLink.url.replace(linkType.baseUrl, "");
              setMusicInput(extractedId);
              // For Deezer, the stored data might have fields swapped
              if (initialLink.platform === "Deezer") {
                setMusicTrackTitle(initialLink.musicArtistName || ""); // Deezer stores track title in artist field
                setMusicArtistName(initialLink.musicTrackTitle || ""); // Deezer stores artist in track title field
              } else {
                setMusicTrackTitle(initialLink.musicTrackTitle || ""); // Populate metadata
                setMusicArtistName(initialLink.musicArtistName || "");
              }
              setMusicAlbumArtUrl(initialLink.musicAlbumArtUrl || "");
              setCurrentView("inputForm");
              return;
            }
          }
          setMusicInput(initialLink.url);
          // For Deezer, the stored data might have fields swapped
          if (initialLink.platform === "Deezer") {
            setMusicTrackTitle(initialLink.musicArtistName || ""); // Deezer stores track title in artist field
            setMusicArtistName(initialLink.musicTrackTitle || ""); // Deezer stores artist in track title field
          } else {
            setMusicTrackTitle(initialLink.musicTrackTitle || ""); // Populate metadata
            setMusicArtistName(initialLink.musicArtistName || "");
          }
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
        // For Deezer, the stored data might have fields swapped
        if (existingLink.platform === "Deezer") {
          setMusicTrackTitle(existingLink.musicArtistName || ""); // Deezer stores track title in artist field
          setMusicArtistName(existingLink.musicTrackTitle || ""); // Deezer stores artist in track title field
        } else {
          setMusicTrackTitle(existingLink.musicTrackTitle || ""); // Populate metadata
          setMusicArtistName(existingLink.musicArtistName || "");
        }
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

    let potentialFullUrl: string;
    let finalUrl: string;

    if (musicInput.startsWith("http")) {
      // If it's a full URL, use it as is
      potentialFullUrl = musicInput;
      finalUrl = musicInput;
    } else {
      // If it's just an ID, construct the URL using the baseUrl
      potentialFullUrl = selectedLinkType.baseUrl + musicInput.trim();
      finalUrl = potentialFullUrl;
    }

    // Special handling for Apple Music URLs to preserve region
    if (
      selectedPlatform.name === "Apple Music" &&
      musicInput.startsWith("http")
    ) {
      const extractedRegion = extractAppleMusicRegion(musicInput);
      if (extractedRegion) {
        // Extract the path after the region (e.g., "song/negationist/1629982909")
        const pathMatch = musicInput.match(
          /^https?:\/\/music\.apple\.com\/[a-z]{2}\/(.+)$/,
        );
        if (pathMatch) {
          const path = pathMatch[1];
          finalUrl = buildAppleMusicUrl(
            extractedRegion,
            selectedLinkType.type,
            path,
          );
        }
      }
    }

    // Special handling for Deezer URLs (only link.deezer.com format supported)
    if (selectedPlatform.name === "Deezer" && musicInput.startsWith("http")) {
      // For link.deezer.com URLs, use them as-is
      finalUrl = musicInput;
      potentialFullUrl = musicInput;
    }

    // Special handling for Amazon Music URLs to preserve region
    if (
      selectedPlatform.name === "Amazon Music" &&
      musicInput.startsWith("http")
    ) {
      const extractedRegion = extractAmazonMusicRegion(musicInput);
      if (extractedRegion) {
        // Extract the ID from the URL
        let id = "";
        if (selectedLinkType.type === "track") {
          // For tracks: extract album ID from /albums/B0... part
          const albumMatch = musicInput.match(/\/albums\/(B0[a-zA-Z0-9]+)/);
          if (albumMatch) {
            id = albumMatch[1];
            // For tracks, we need to preserve the full query string
            const queryMatch = musicInput.match(/\?(.+)$/);
            if (queryMatch) {
              id += "?" + queryMatch[1];
            }
          }
        } else {
          // For albums and playlists: extract the ID
          const idMatch = musicInput.match(
            `/${selectedLinkType.type}s/(B0[a-zA-Z0-9]+)`,
          );
          if (idMatch) {
            id = idMatch[1];
            // Preserve query parameters if they exist
            const queryMatch = musicInput.match(/\?(.+)$/);
            if (queryMatch) {
              id += "?" + queryMatch[1];
            }
          }
        }
        if (id) {
          finalUrl = buildAmazonMusicUrl(
            extractedRegion,
            selectedLinkType.type,
            id,
          );
        }
      }
    }

    // Special handling for Apple Music URLs to shorten them
    if (
      selectedPlatform.name === "Apple Music" &&
      musicInput.startsWith("http")
    ) {
      finalUrl = shortenAppleMusicUrl(musicInput);
      potentialFullUrl = finalUrl; // Update potentialFullUrl for validation
    }

    console.log("musicInput:", musicInput);
    console.log("selectedLinkType.baseUrl:", selectedLinkType.baseUrl);
    console.log("potentialFullUrl:", potentialFullUrl);
    console.log("finalUrl:", finalUrl);
    console.log(
      "isValidURL:",
      selectedLinkType.urlPattern.test(potentialFullUrl),
    );

    if (!selectedLinkType.urlPattern.test(potentialFullUrl)) {
      toast.error("Please enter a valid URL or ID for the selected link type.");
      return;
    }

    setIsSaving(true);

    try {
      // Check if this is a playlist link type
      if (selectedLinkType.type === "playlist") {
        console.log("Detected playlist link type, calling playlist API...");
        console.log("Final URL:", finalUrl);

        // Use playlist API for playlist links
        const response = await fetch("/api/playlist/preview", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: finalUrl }),
        });

        console.log("Playlist API response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Playlist API error:", errorText);
          throw new Error(
            `Failed to fetch playlist metadata: ${response.status}`,
          );
        }

        const playlistData = await response.json();
        console.log("Received playlist data:", playlistData);

        // Pass the playlist data back to the parent component
        if (onPlaylistAdded) {
          console.log("Calling onPlaylistAdded with data:", playlistData);
          onPlaylistAdded(playlistData);
        }

        // Close the modal and reset state
        onOpenChange(false);
        setSelectedPlatform(null);
        setSelectedLinkType(null);
        setMusicInput("");
        setMusicTrackTitle("");
        setMusicArtistName("");
        setMusicAlbumArtUrl("");
        setCurrentView("platformSelection");

        toast.success("Playlist link created successfully!");
        return;
      }

      // Regular music link handling for tracks and albums
      let autoMetadata = {
        title: musicTrackTitle || undefined,
        artist: musicArtistName || undefined,
        artworkUrl: musicAlbumArtUrl || undefined,
      };

      if (
        !musicTrackTitle.trim() ||
        !musicArtistName.trim() ||
        !musicAlbumArtUrl.trim()
      ) {
        console.log("Fetching metadata for URL:", finalUrl);
        console.log("Platform:", selectedPlatform.name);
        const fetched = await fetchMetadataForUrl(finalUrl);
        console.log("Fetched metadata:", fetched);
        if (fetched) {
          autoMetadata = {
            title: musicTrackTitle.trim() || fetched.title,
            artist: musicArtistName.trim() || fetched.artist,
            artworkUrl: musicAlbumArtUrl.trim() || fetched.artworkUrl,
          };
          if (!musicTrackTitle.trim() && fetched.title) {
            setMusicTrackTitle(fetched.title);
          }
          if (!musicArtistName.trim() && fetched.artist) {
            setMusicArtistName(fetched.artist);
          }
          if (!musicAlbumArtUrl.trim() && fetched.artworkUrl) {
            setMusicAlbumArtUrl(fetched.artworkUrl);
          }
        }
        console.log("Final autoMetadata:", autoMetadata);
      }

      const newLink = {
        platform: selectedPlatform.name,
        url: finalUrl,
        type: selectedLinkType.type,
        // For Deezer, swap the fields to match the expected storage format
        musicTrackTitle:
          selectedPlatform.name === "Deezer"
            ? autoMetadata.artist
            : autoMetadata.title,
        musicArtistName:
          selectedPlatform.name === "Deezer"
            ? autoMetadata.title
            : autoMetadata.artist,
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
          musicLinks.map((link, idx) =>
            idx === existingLinkIndex ? newLink : link,
          ),
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
          // For Deezer, the stored data might have fields swapped
          if (linkToEdit.platform === "Deezer") {
            setMusicTrackTitle(linkToEdit.musicArtistName || ""); // Deezer stores track title in artist field
            setMusicArtistName(linkToEdit.musicTrackTitle || ""); // Deezer stores artist in track title field
          } else {
            setMusicTrackTitle(linkToEdit.musicTrackTitle || ""); // Populate metadata
            setMusicArtistName(linkToEdit.musicArtistName || "");
          }
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
      // For Deezer, the stored data might have fields swapped
      if (linkToEdit.platform === "Deezer") {
        setMusicTrackTitle(linkToEdit.musicArtistName || ""); // Deezer stores track title in artist field
        setMusicArtistName(linkToEdit.musicTrackTitle || ""); // Deezer stores artist in track title field
      } else {
        setMusicTrackTitle(linkToEdit.musicTrackTitle || ""); // Populate metadata
        setMusicArtistName(linkToEdit.musicArtistName || "");
      }
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
            <p className="text-lg font-semibold text-foreground">
              Your Music Links
            </p>
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
                    <div
                      key={index}
                      className="relative group flex items-center justify-between p-3 bg-card rounded-2xl border border-border"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleEditExistingLink(link)}
                        className="flex-1 justify-start cursor-pointer px-0 py-0 h-auto rounded-2xl"
                      >
                        {Icon && (
                          <span
                            className="mr-2"
                            style={{ color: platform?.brandColor || "#000000" }}
                          >
                            {React.createElement(Icon, {
                              className: "w-5 h-5",
                            })}
                          </span>
                        )}
                        <span className="font-medium text-foreground">
                          {link.musicTrackTitle ||
                            `${link.platform} (${link.type})`}
                        </span>
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
              {(() => {
                const availablePlatforms = SUPPORTED_MUSIC_PLATFORMS.filter(
                  (music) =>
                    !musicLinks.some((link) => link.platform === music.name),
                );
                return availablePlatforms.length > 0 ? (
                  <Button
                    onClick={() => setCurrentView("platformSelection")}
                    className="cursor-pointer rounded-2xl"
                  >
                    <Plus className="w-4 h-4 mr-2 animate-pulse" />
                    Add New Link
                  </Button>
                ) : null;
              })()}
            </div>
          </div>
        ) : currentView === "platformSelection" ? (
          <div className="py-4">
            {(() => {
              const availablePlatforms = SUPPORTED_MUSIC_PLATFORMS.filter(
                (music) => {
                  // If we're editing an existing link, show the current platform
                  if (initialLink && initialLink.platform === music.name) {
                    return true;
                  }
                  // Otherwise, only show platforms that haven't been added yet
                  return !musicLinks.some(
                    (link) => link.platform === music.name,
                  );
                },
              );

              if (availablePlatforms.length === 0) {
                return (
                  <div className="text-center py-8">
                    <p className="text-lg font-semibold text-foreground mb-2">
                      All music platforms have been added!
                    </p>
                    <p className="text-muted-foreground mb-4">
                      You can edit or remove existing links to add different
                      platforms.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentView("existingLinks")}
                      className="cursor-pointer rounded-2xl"
                    >
                      View Existing Links
                    </Button>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-2 gap-4">
                  {availablePlatforms.map((music) => {
                    const isAlreadyAdded = musicLinks.some(
                      (link) => link.platform === music.name,
                    );
                    const isCurrentlyEditing =
                      initialLink?.platform === music.name;
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
                        <Icon
                          className="w-5 h-5"
                          style={{ color: buttonTextColor }}
                        />
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
              );
            })()}
          </div>
        ) : currentView === "linkTypeSelection" ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 mb-4">
              {selectedPlatform?.icon && (
                <span className="flex items-center justify-center">
                  {React.createElement(selectedPlatform.icon, {
                    className: "w-5 h-5",
                  })}
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
                  {React.createElement(selectedPlatform.icon, {
                    className: "w-5 h-5",
                  })}
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
                    ? selectedPlatform?.name === "Apple Music" &&
                      musicInput.startsWith("http")
                      ? shortenAppleMusicUrl(musicInput)
                      : selectedLinkType.baseUrl + musicInput
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
