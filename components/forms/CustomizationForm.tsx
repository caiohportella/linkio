"use client";

import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import {
  ImageIcon,
  Loader2,
  Palette,
  PencilIcon,
  PaintBucketIcon,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
  Link,
} from "lucide-react";
import React, {
  useEffect,
  useRef,
  useState,
  useTransition,
  startTransition,
} from "react";
import { Label } from "../ui/label";
import Image from "next/image";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { SUPPORTED_SOCIALS } from "@/lib/utils";
import SocialLinksModal from "@/components/SocialLinksModal";

const CustomizationForm = () => {
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateCustomizations = useMutation(
    api.lib.userCustomizations.updateCustomizations,
  );
  const generateUploadUrl = useMutation(
    api.lib.userCustomizations.generateUploadUrl,
  );
  const removeProfilePicture = useMutation(
    api.lib.userCustomizations.removeProfilePicture,
  );
  const existingCustomizations = useQuery(
    api.lib.userCustomizations.getUserCustomizations,
    user ? { userId: user.id } : "skip",
  );

  const [formData, setFormData] = useState({
    description: "",
    accentColor: "#082f08",
  });

  const [socialLinks, setSocialLinks] = useState<
    { platform: string; url: string }[]
  >([]);

  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [editingSocialLink, setEditingSocialLink] = useState<{
    platform: string;
    url: string;
  } | null>(null);

  const [isLoading, startLoading] = useTransition();
  const [isUploading, startUploading] = useTransition();

  useEffect(() => {
    if (existingCustomizations) {
      setFormData({
        description: existingCustomizations.description || "",
        accentColor: existingCustomizations.accentColor || "#082f08",
      });
      setSocialLinks(existingCustomizations.socialLinks || []);
    }
  }, [existingCustomizations]);

  const handleAddSocial = () => {
    setIsSocialModalOpen(true);
  };

  const handleRemoveSocial = (platformName: string) => {
    setSocialLinks((prev) =>
      prev.filter((link) => link.platform !== platformName),
    );
    toast.success(`${platformName} link removed!`);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) return;

    startLoading(async () => {
      try {
        await updateCustomizations({
          description: formData.description || undefined,
          accentColor: formData.accentColor || undefined,
          socialLinks: socialLinks.length > 0 ? socialLinks : [],
        });

        toast.success("Customizations saved successfully!");
      } catch (err) {
        console.error("Failed to save customizations: ", err);
        toast.error("Failed to save customizations");
      }
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e?.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
    }

    startUploading(async () => {
      try {
        const uploadUrl = await generateUploadUrl();
        const uploadResult = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!uploadResult.ok) {
          throw new Error("Upload failed");
        }

        const { storageId } = await uploadResult.json();

        await updateCustomizations({
          profilePictureStorageId: storageId,
          description: formData.description || undefined,
          accentColor: formData.accentColor || undefined,
        });

        toast.success("Profile picture uploaded successfully!");
      } catch (err) {
        console.error("Failed to upload image: ", err);
        toast.error("Failed to upload image");
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    });
  };

  const handleRemoveImage = async () => {
    startTransition(async () => {
      try {
        await removeProfilePicture();
        toast.success("Profile picture removed successfully!");
      } catch (err) {
        console.error("Failed to remove image: ", err);
        toast.error("Failed to remove image");
      }
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-background to-muted rounded-lg">
            <Palette className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Customize Your Page
            </h2>
            <p className="text-muted-foreground text-sm">
              Personalize your public link page with custom profile picture,
              description and accent color.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture Upload */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-foreground" />
            Profile Picture
          </Label>

          {/* Current Image Display */}
          {existingCustomizations?.profilePictureUrl && (
            <div className="flex items-center gap-4 p-4 bg-muted/20 rounded-2xl">
              <div className="w-16 h-16 rounded-lg overflow-hidden">
                <Image
                  src={existingCustomizations.profilePictureUrl}
                  alt="Current profile picture"
                  width={64}
                  height={64}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground font-medium">
                  Current profile picture
                </p>
                <p className="text-xs text-muted-foreground">
                  Click &ldquo;Remove&ldquo; to delete this image
                </p>
              </div>
              <Button
                type="button"
                variant={"outline"}
                size={"sm"}
                onClick={handleRemoveImage}
                disabled={isLoading}
                className="cursor-pointer rounded-full text-destructive hover:text-destructive/80 hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* File Upload */}
          <div className="flex items-center gap-4">
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
            <Button
              type="button"
              variant={"outline"}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="cursor-pointer flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload New Image
                </>
              )}
            </Button>
            <p className="text-sm text-muted-foreground">
              Max 5MB. Supports JPG, PNG, GIF, WebP
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <PencilIcon className="w-4 h-4 text-foreground" />
            Description
          </Label>
          <Textarea
            id="description"
            placeholder="Tell visitors about yourself..."
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className="w-full min-h-[100px] px-3 py-2 text-foreground border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
            maxLength={200}
          />
          <p className="text-sm text-muted-foreground">
            {formData.description.length}/200 characters
          </p>
        </div>

        {/* Accent Color Picker */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <PaintBucketIcon className="w-4 h-4 text-foreground" />
            Accent Color
          </Label>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Input
                id="accentColor"
                type="color"
                value={formData.accentColor}
                onChange={(e) =>
                  handleInputChange("accentColor", e.target.value)
                }
                className="w-12 h-12 rounded-lg cursor-pointer border-none p-0"
              />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Choose your brand color
                </p>
                <p className="text-xs" style={{ color: formData.accentColor }}>
                  {formData.accentColor}
                </p>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            This color will be used as an accent in your page header
          </p>
        </div>

        {/* Social Links */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <Link className="w-4 h-4 text-foreground" />
            Social Links
          </Label>

          {socialLinks.length === 0 ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setEditingSocialLink(null);
                handleAddSocial();
              }}
            >
              + Add Social Link
            </Button>
          ) : (
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((link, index) => {
                const selectedPlatform = SUPPORTED_SOCIALS.find(
                  (s) => s.name === link.platform,
                );
                const Icon = selectedPlatform?.icon;

                return (
                  <div key={index} className="relative group">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="cursor-pointer w-12 h-12 rounded-2xl flex items-center justify-center p-0 bg-white/70 hover:bg-white/90 transition-all duration-200 shadow-md"
                      onClick={() => {
                        setEditingSocialLink(link);
                        handleAddSocial();
                      }}
                    >
                      {Icon && <Icon className="w-6 h-6 text-foreground" />}
                      <div className="absolute inset-0 flex items-center justify-center bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-2xl">
                        <PencilIcon className="w-5 h-5 text-foreground/70" />
                      </div>
                    </Button>
                  </div>
                );
              })}

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setEditingSocialLink(null);
                  handleAddSocial();
                }}
                className="cursor-pointer mt-2 rounded-2xl"
              >
                <Plus className="w-4 h-4 animate-pulse" />
              </Button>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <Button
            type="submit"
            disabled={isLoading || isUploading}
            className="text-primary-foreground bg-primary hover:bg-primary/90 rounded-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save
              </>
            )}
          </Button>
        </div>
      </form>

      <SocialLinksModal
        isOpen={isSocialModalOpen}
        onOpenChange={(open) => {
          setIsSocialModalOpen(open);
          if (!open) setEditingSocialLink(null); // Reset when modal closes
        }}
        socialLinks={socialLinks}
        setSocialLinks={setSocialLinks}
        initialLink={editingSocialLink}
        onClearInitialLink={() => setEditingSocialLink(null)} // Clear editing link on back
        handleRemoveSocial={handleRemoveSocial}
      />
    </div>
  );
};
export default CustomizationForm;
