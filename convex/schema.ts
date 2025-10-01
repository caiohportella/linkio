import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  usernames: defineTable({
    userId: v.string(),
    username: v.string(),
  })
    .index("by_user_id", ["userId"])
    .index("by_username", ["username"]),

  links: defineTable({
    userId: v.string(),
    title: v.string(),
    url: v.string(),
    order: v.number(),
    musicLinks: v.optional(
      v.array(
        v.object({
          platform: v.string(),
          url: v.string(),
          type: v.string(), // New field to store the type of music link (e.g., 'track', 'album', 'playlist')
          musicTrackTitle: v.optional(v.string()),
          musicArtistName: v.optional(v.string()),
          musicAlbumArtUrl: v.optional(v.string()),
        }),
      ),
    ),
    musicTrackTitle: v.optional(v.string()), // New field for music track title
    musicArtistName: v.optional(v.string()), // New field for music artist name
    musicAlbumArtUrl: v.optional(v.string()), // New field for music album art URL
    mediaPreview: v.optional(
      v.object({
        platform: v.literal("youtube"),
        url: v.string(),
        videoId: v.string(),
        title: v.string(),
        thumbnailUrl: v.string(),
      }),
    ),
    scheduledAt: v.optional(v.number()),
    folderId: v.optional(v.id("folders")), // New field to associate links with folders
  })
    .index("by_user", ["userId"])
    .index("by_user_and_order", ["userId", "order"])
    .index("by_folderId", ["folderId"]),

  userCustomizations: defineTable({
    userId: v.string(),
    profilePictureStorageId: v.optional(v.id("_storage")),
    description: v.optional(v.string()),
    accentColor: v.optional(v.string()),
    socialLinks: v.optional(
      v.array(
        v.object({
          platform: v.string(),
          url: v.string(),
        }),
      ),
    ),
  }).index("by_user_id", ["userId"]),

  folders: defineTable({
    userId: v.string(),
    name: v.string(),
    position: v.number(), // For ordering folders
  }).index("by_userId", ["userId"]),
});
