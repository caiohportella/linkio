"use client";

import z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { useState, useTransition } from "react";
import { Button } from "../ui/button";
import { Loader2, Plus, Music, Trash2, TvMinimalPlayIcon, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import MusicLinksModal from "@/components/MusicLinksModal";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import dynamic from "next/dynamic";
import { createElement } from "react";
import Image from "next/image";
import { MediaPreview, formatDateTime } from "@/lib/utils";
import { SUPPORTED_MUSIC_PLATFORMS, MusicLinkItem } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useAuth } from "@clerk/nextjs";
import { Id } from "@/convex/_generated/dataModel";

const MediaPreviewModal = dynamic(() => import("../MediaPreviewModal"), {
  ssr: false,
});

const ScheduleLinkModal = dynamic(() => import("../ScheduleLinkModal"), {
  ssr: false,
});

const formSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(100, "Title must be less than 100 characters"),
    url: z.string().url("Please enter a valid URL").optional(),
    imageUrl: z
      .string()
      .url("Please enter a valid image URL")
      .optional()
      .or(z.literal("")),
    musicLinks: z
      .array(
        z.object({
          platform: z.string(),
          url: z.string(),
          type: z.string(),
          musicTrackTitle: z.string().optional(),
          musicArtistName: z.string().optional(),
          musicAlbumArtUrl: z.string().optional(),
        }) as z.ZodType<MusicLinkItem>,
      )
      .optional(),
    editingMusicLink: z.object({
      platform: z.string(),
      url: z.string(),
      type: z.string(),
      musicTrackTitle: z.string().optional(),
      musicArtistName: z.string().optional(),
      musicAlbumArtUrl: z.string().optional(),
    }).nullable().optional() as z.ZodType<MusicLinkItem | null | undefined>,
    folderId: z.optional(z.string()), // New field for folder ID
    mediaPreview: z
      .object({
        platform: z.literal("youtube"),
        url: z.string().url("Please enter a valid YouTube URL"),
        videoId: z.string(),
        title: z.string(),
        thumbnailUrl: z.string().url(),
      })
      .nullable()
      .optional(),
    scheduledAt: z.number().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.url && (!data.musicLinks || data.musicLinks.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Either a URL or at least one music link is required.",
        path: ["url"],
      });
    }
  });

const sanitizeMediaPreview = (value: MediaPreview | null | undefined): MediaPreview | null => {
  if (!value) return null;
  if (value.platform === "youtube") {
    return value;
  }
  return null;
};

const CreateLinkForm = () => {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, startSubmitting] = useTransition();
  const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleCleared, setScheduleCleared] = useState(false);
  
  const router = useRouter();
  const createLink = useMutation(api.lib.links.createLink);
  const { userId } = useAuth(); // Get current user ID
  const folders = useQuery(api.lib.folders.getFoldersByUserId, {
    userId: userId || "",
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      url: "",
      imageUrl: "",
      musicLinks: [], // Initialize musicLinks in form
      editingMusicLink: null, // Initialize editingMusicLink in form
      mediaPreview: null,
      scheduledAt: null,
    },
  });

  const musicLinks = form.watch("musicLinks") || []; // Watch musicLinks from form state with default
  const editingMusicLink = form.watch("editingMusicLink"); // Watch editingMusicLink from form state
  const mediaPreview = sanitizeMediaPreview(form.watch("mediaPreview"));
  const scheduledAt = form.watch("scheduledAt");
  const isScheduleActive = !!scheduledAt || isScheduleModalOpen;

  const handleSetMusicLinks = (newLinks: MusicLinkItem[]) => {
    form.setValue("musicLinks", newLinks, {
      shouldDirty: true,
      shouldValidate: true,
    });

    const primaryUrl = newLinks[0]?.url ?? "";
    form.setValue("url", primaryUrl, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleSetEditingMusicLink = (link: MusicLinkItem | null) => {
    form.setValue("editingMusicLink", link, { shouldDirty: true });
  };

  const handleRemoveMusicLink = (platformName: string) => {
    const updatedLinks = musicLinks.filter((link) => link.platform !== platformName);
    handleSetMusicLinks(updatedLinks);
    toast.success(`${platformName} music link removed!`);
  };

  const handleSetMediaPreview = (
    preview: MediaPreview | null,
  ) => {
    form.setValue("mediaPreview", preview, {
      shouldDirty: true,
      shouldValidate: true,
    });

    const primaryUrl = preview?.url ?? mediaPreview?.url ?? "";
    form.setValue("url", primaryUrl, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleSetScheduledAt = (value: number | null) => {
    form.setValue("scheduledAt", value, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setScheduleCleared(value === null);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null);

    startSubmitting(async () => {
      try {
        await createLink({
          title: values.title,
          url: values.url || "", // Provide a default empty string if url is undefined
          musicLinks: values.musicLinks,
          musicTrackTitle: values.musicLinks?.[0]?.musicTrackTitle, // Pass metadata of the first music link
          musicArtistName: values.musicLinks?.[0]?.musicArtistName,
          musicAlbumArtUrl: values.musicLinks?.[0]?.musicAlbumArtUrl,
          mediaPreview: values.mediaPreview || undefined,
          folderId: values.folderId as Id<"folders"> | undefined,
          scheduledAt: scheduleCleared || values.scheduledAt === null ? undefined : values.scheduledAt ?? undefined,
        });
        router.push("/dashboard");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create link");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Link Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="My link"
                  {...field}
                  className="text-muted-foreground rounded-2xl"
                />
              </FormControl>
              <FormDescription>
                This will be displayed as the button text for your link.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="folderId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Folder (optional)</FormLabel>
              <Select
                onValueChange={(value: Id<"folders"> | "no-folder") => field.onChange(value === "no-folder" ? undefined : value)}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="cursor-pointer text-muted-foreground rounded-2xl">
                    <SelectValue placeholder="Select a folder" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="no-folder">No Folder</SelectItem>
                  {folders?.map((folder) => (
                    <SelectItem key={folder._id} value={folder._id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Organize your links by assigning them to folders.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <div className="space-y-3">
                {/* Desktop: Horizontal layout, Mobile: Vertical layout */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <FormLabel className="text-foreground">URL</FormLabel>
                  
                  {/* Link Type Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="secondary"
                      onClick={() => !mediaPreview && setIsMusicModalOpen(true)}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        mediaPreview
                          ? "bg-muted text-muted-foreground cursor-not-allowed"
                          : "cursor-pointer bg-accent/20 hover:bg-accent/30"
                      }`}
                    >
                      <Music className="w-4 h-4" />
                      <span>Music Link</span>
                    </Badge>
                    <Badge
                      variant="secondary"
                      onClick={() => musicLinks.length === 0 && setIsMediaModalOpen(true)}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        musicLinks.length > 0
                          ? "bg-muted text-muted-foreground cursor-not-allowed"
                          : "cursor-pointer bg-accent/20 hover:bg-accent/30"
                      }`}
                    >
                      <TvMinimalPlayIcon className="w-4 h-4" />
                      <span>Video Preview</span>
                    </Badge>
                    <Badge
                      variant="secondary"
                      onClick={() => setIsScheduleModalOpen(true)}
                      className={`cursor-pointer flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        isScheduleActive
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-accent/20 hover:bg-accent/30"
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      <span>Schedule</span>
                    </Badge>
                  </div>
                </div>
              </div>

              {mediaPreview ? (
                <input type="hidden" {...field} value={mediaPreview.url} />
              ) : musicLinks.length === 0 ? (
                <>
                  <FormControl>
                    <Input
                      placeholder="https://example.com"
                      {...field}
                      className="text-muted-foreground rounded-full"
                    />
                  </FormControl>
                  <FormDescription>
                    The destination URL where users will be redirected.
                  </FormDescription>
                  <FormMessage />
                </>
              ) : null}

              {!mediaPreview && musicLinks.length > 0 && (
                <div className="space-y-3 mt-2">
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
                            onClick={() => {
                              handleSetEditingMusicLink(link);
                              setIsMusicModalOpen(true);
                            }}
                            className="flex-1 justify-start cursor-pointer px-0 py-0 h-auto rounded-2xl"
                          >
                            {Icon && <span className="mr-2" style={{ color: platform?.brandColor || "#000000" }}>{createElement(Icon, { className: "w-5 h-5" })}</span>}
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
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        handleSetEditingMusicLink(null);
                        setIsMusicModalOpen(true);
                      }}
                      className="cursor-pointer rounded-2xl"
                    >
                      <Plus className="w-4 h-4 mr-2 animate-pulse" />
                      Add Another Music Link
                    </Button>
                  </div>
                </div>
              )}
            </FormItem>
          )}
        />

        {mediaPreview && (
          <div className="rounded-2xl border border-border p-4 flex items-center gap-4">
            <div className="relative w-24 h-16 overflow-hidden rounded-xl">
              <Image
                src={mediaPreview.thumbnailUrl}
                alt={mediaPreview.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{mediaPreview.title}</p>
              <p className="text-xs text-muted-foreground truncate">{mediaPreview.url}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="cursor-pointer text-destructive hover:bg-destructive/10 rounded-full"
              onClick={() => handleSetMediaPreview(null)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}

        {scheduledAt && (
          <div className="rounded-2xl border border-border p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Scheduled</p>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(scheduledAt)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="rounded-2xl cursor-pointer"
                  onClick={() => setIsScheduleModalOpen(true)}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="cursor-pointer text-destructive hover:bg-destructive/10 rounded-full"
                  onClick={() => handleSetScheduledAt(null)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              The link will be visible on your public page at the scheduled time.
            </p>
          </div>
        )}

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <div className="flex justify-end">
          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-2xl cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 animate-pulse" />
                Create Link
              </>
            )}
          </Button>
        </div>
      </form>
      <MusicLinksModal
        isOpen={isMusicModalOpen}
        onOpenChange={(open) => {
          setIsMusicModalOpen(open);
          if (!open) handleSetEditingMusicLink(null); // Reset when modal closes
        }}
        musicLinks={musicLinks}
        setMusicLinks={handleSetMusicLinks}
        initialLink={editingMusicLink}
        onClearInitialLink={() => handleSetEditingMusicLink(null)} // Clear editing link on back
        handleRemoveMusicLink={handleRemoveMusicLink}
        showExistingLinksOnOpen={musicLinks.length > 0 && !editingMusicLink} // Pass the new prop
      />
      <MediaPreviewModal
        isOpen={isMediaModalOpen}
        onOpenChange={setIsMediaModalOpen}
        onConfirm={handleSetMediaPreview}
        initialValue={mediaPreview || undefined}
      />
      <ScheduleLinkModal
        isOpen={isScheduleModalOpen}
        onOpenChange={setIsScheduleModalOpen}
        initialValue={scheduledAt ?? undefined}
        onConfirm={handleSetScheduledAt}
      />
    </Form>
  );
};
export default CreateLinkForm;
