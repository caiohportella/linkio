"use client";

import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import {
  ImageIcon,
  Loader2,
  Palette,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import React, {
  startTransition,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { Label } from "../ui/label";
import Image from "next/image";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { SUPPORTED_SOCIALS } from "@/lib/utils";

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
    setSocialLinks((prev) => [...prev, { platform: "", url: "" }]);
  };

  const handleRemoveSocial = (index: number) => {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateSocial = (
    index: number,
    field: "platform" | "url",
    value: string,
  ) => {
    const updated = [...socialLinks];

    if (field === "platform") {
      const base =
        SUPPORTED_SOCIALS.find((s) => s.name === value)?.baseUrl || "";
      updated[index].platform = value;
      updated[index].url = base; // sobrescreve o campo `url`
    } else {
      updated[index].url = value;
    }

    setSocialLinks(updated);
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
          <div className="p-2 bg-gradient-to-br from-black to-gray-500 rounded-lg">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white/80">
              Customize Your Page
            </h2>
            <p className="text-white/50 text-sm">
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
            <ImageIcon className="w-4 h-4" />
            Profile Picture
          </Label>

          {/* Current Image Display */}
          {existingCustomizations?.profilePictureUrl && (
            <div className="flex items-center gap-4 p-4 bg-[#f9fafb] rounded-2xl">
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
                <p className="text-sm text-gray-700 font-medium">
                  Current profile picture
                </p>
                <p className="text-xs text-gray-500">
                  Click &ldquo;Remove&ldquo; to delete this image
                </p>
              </div>
              <Button
                type="button"
                variant={"outline"}
                size={"sm"}
                onClick={handleRemoveImage}
                disabled={isLoading}
                className="rounded-full text-red-500 hover:text-red-700 hover:bg-red-50"
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
              className="flex items-center gap-2"
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
            <p className="text-sm text-white/75">
              Max 5MB. Supports JPG, PNG, GIF, WebP
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Tell visitors about yourself..."
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className="w-full min-h-[100px] px-3 py-2 text-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical"
            maxLength={200}
          />
          <p className="text-sm text-white/75">
            {formData.description.length}/200 characters
          </p>
        </div>

        {/* Accent Color Picker */}
        <div className="space-y-3">
          <Label htmlFor="accentColor">Accent Color</Label>
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
                <p className="text-sm font-medium text-white/75">
                  Choose your brand color
                </p>
                <p className="text-xs" style={{ color: formData.accentColor }}>
                  {formData.accentColor}
                </p>
              </div>
            </div>
          </div>
          <p className="text-sm text-white/55">
            This color will be used as an accent in your page header
          </p>
        </div>

        {/* Social Links */}
        <div className="space-y-2">
          <Label className="pb-4">Social Links</Label>

          {socialLinks.length === 0 ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddSocial}
            >
              + Add Social Link
            </Button>
          ) : (
            <div className="rounded-3xl bg-white/10 p-4 space-y-4">
              {socialLinks.map((link, index) => {
                const selectedPlatform = SUPPORTED_SOCIALS.find(
                  (s) => s.name === link.platform,
                );
                const baseUrl = selectedPlatform?.baseUrl || "";

                return (
                  <div
                    key={index}
                    className="space-y-1 rounded-2xl p-4 bg-white/10 backdrop-blur-sm border border-white/10"
                  >
                    <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
                      {/* Select Platform */}
                      <Select
                        value={link.platform}
                        onValueChange={(value) =>
                          handleUpdateSocial(index, "platform", value)
                        }
                      >
                        <SelectTrigger className="w-full sm:w-40 rounded-2xl">
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent>
                          {SUPPORTED_SOCIALS.map((social) => (
                            <SelectItem key={social.name} value={social.name}>
                              {social.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Username input */}
                      {link.platform && (
                        <div className="flex w-full items-center">
                          <Input
                            className="rounded-2xl"
                            placeholder={
                              link.platform === "WhatsApp"
                                ? "number"
                                : "username"
                            }
                            value={link.url.replace(baseUrl, "")}
                            onChange={(e) =>
                              handleUpdateSocial(
                                index,
                                "url",
                                baseUrl + e.target.value,
                              )
                            }
                          />
                        </div>
                      )}

                      {/* Remove Button */}
                      <Button
                        type="button"
                        size="icon"
                        variant="link"
                        onClick={() => handleRemoveSocial(index)}
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Preview */}
                    {link.url && (
                      <p className="text-xs text-white/60 break-all mt-4">
                        <span className="underline">{link.url}</span>
                      </p>
                    )}
                  </div>
                );
              })}

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddSocial}
                className="mt-2 rounded-2xl"
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
            className="text-white bg-[#009c00] hover:bg-[#00ff64] rounded-full"
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
    </div>
  );
};
export default CustomizationForm;
