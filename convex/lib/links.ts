import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

export const getLinksBySlug = query({
  args: { slug: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("links"),
      _creationTime: v.number(),
      userId: v.string(),
      title: v.string(),
      url: v.string(),
      order: v.number(),
      musicLinks: v.optional(
        v.array(
          v.object({
            platform: v.string(),
            url: v.string(),
            type: v.string(), // Add type to musicLinks object
            musicTrackTitle: v.optional(v.string()),
            musicArtistName: v.optional(v.string()),
            musicAlbumArtUrl: v.optional(v.string()),
          }),
        ),
      ),
      musicTrackTitle: v.optional(v.string()), // Add to return type
      musicArtistName: v.optional(v.string()), // Add to return type
      musicAlbumArtUrl: v.optional(v.string()), // Add to return type
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
      folderId: v.optional(v.id("folders")), // Add to return type
    }),
  ),
  handler: async ({ db }, args) => {
    const usernameRecord = await db
      .query("usernames")
      .withIndex("by_username", (q) => q.eq("username", args.slug))
      .unique();

    let userId: string;

    if (usernameRecord) {
      userId = usernameRecord.userId;
    } else {
      userId = args.slug;
    }

    return await db
      .query("links")
      .withIndex("by_user_and_order", (q) => q.eq("userId", userId))
      .order("asc")
      .collect();
  },
});

export const getLinksByUserId = query({
  args: { userId: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("links"),
      _creationTime: v.number(),
      userId: v.string(),
      title: v.string(),
      url: v.string(),
      order: v.number(),
      musicLinks: v.optional(
        v.array(
          v.object({
            platform: v.string(),
            url: v.string(),
            type: v.string(), // Add type to musicLinks object
            musicTrackTitle: v.optional(v.string()),
            musicArtistName: v.optional(v.string()),
            musicAlbumArtUrl: v.optional(v.string()),
          }),
        ),
      ),
      musicTrackTitle: v.optional(v.string()), // Add to return type
      musicArtistName: v.optional(v.string()), // Add to return type
      musicAlbumArtUrl: v.optional(v.string()), // Add to return type
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
      folderId: v.optional(v.id("folders")), // Add to return type
    }),
  ),
  handler: async ({ db }, args) => {
    return await db
      .query("links")
      .withIndex("by_user_and_order", (q) => q.eq("userId", args.userId))
      .order("asc")
      .collect();
  },
});

export const updateLinkOrder = mutation({
  args: { linkIds: v.array(v.id("links")) },
  returns: v.null(),
  handler: async ({ db, auth }, { linkIds }) => {
    const identity = await auth.getUserIdentity();

    if (!identity) throw new Error("Not authorized");

    const links = await Promise.all(linkIds.map((linkId) => db.get(linkId)));

    const validLinks = links
      .map((link, index) => ({ link, originalIndex: index }))
      .filter(({ link }) => link && link.userId === identity.subject)
      .map(({ link, originalIndex }) => ({
        link: link as NonNullable<typeof link>,
        originalIndex,
      }));

    await Promise.all(
      validLinks.map(({ link, originalIndex }) =>
        db.patch(link._id, { order: originalIndex }),
      ),
    );

    return null;
  },
});

export const updateLink = mutation({
  args: {
    linkId: v.id("links"),
    title: v.string(),
    url: v.string(),
    imageUrl: v.optional(v.string()),
    musicLinks: v.optional(
      v.array(
        v.object({
          platform: v.string(),
          url: v.string(),
          type: v.string(),
          musicTrackTitle: v.optional(v.string()),
          musicArtistName: v.optional(v.string()),
          musicAlbumArtUrl: v.optional(v.string()),
        }),
      ),
    ),
    musicTrackTitle: v.optional(v.string()),
    musicArtistName: v.optional(v.string()),
    musicAlbumArtUrl: v.optional(v.string()),
    mediaPreview: v.optional(
      v.object({
        platform: v.literal("youtube"),
        url: v.string(),
        videoId: v.string(),
        title: v.string(),
        thumbnailUrl: v.string(),
      }),
    ),
    clearSchedule: v.optional(v.boolean()),
    scheduledAt: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async ({ db, auth }, args) => {
    const identity = await auth.getUserIdentity();

    if (!identity) throw new Error("Not authenticated");

    const link = await db.get(args.linkId);

    if (!link || link.userId !== identity.subject)
      throw new Error("Unauthorized");

    const updatePayload: Partial<typeof link> = {
      title: args.title,
      url: args.url,
    };

    if (args.musicLinks !== undefined) {
      updatePayload.musicLinks = args.musicLinks;
    }

    if (args.musicTrackTitle !== undefined) {
      updatePayload.musicTrackTitle = args.musicTrackTitle || undefined;
    }

    if (args.musicArtistName !== undefined) {
      updatePayload.musicArtistName = args.musicArtistName || undefined;
    }

    if (args.musicAlbumArtUrl !== undefined) {
      updatePayload.musicAlbumArtUrl = args.musicAlbumArtUrl || undefined;
    }

    if (args.mediaPreview !== undefined) {
      updatePayload.mediaPreview = args.mediaPreview || undefined;
    }

    if (args.scheduledAt !== undefined) {
      updatePayload.scheduledAt = args.scheduledAt ?? undefined;
    }

    if (args.clearSchedule) {
      updatePayload.scheduledAt = undefined;
    }

    await db.patch(args.linkId, updatePayload);

    return null;
  },
});

export const deleteLink = mutation({
  args: {
    linkId: v.id("links"),
  },
  returns: v.null(),
  handler: async ({ db, auth }, args) => {
    const identity = await auth.getUserIdentity();

    if (!identity) throw new Error("Not authenticated");

    const link = await db.get(args.linkId);

    if (!link || link.userId !== identity.subject)
      throw new Error("Unauthorized");

    await db.delete(args.linkId);

    return null;
  },
});

export const getLinkCountById = query({
  args: { userId: v.string() },
  returns: v.number(),
  handler: async ({ db }, args) => {
    const links = await db
      .query("links")
      .withIndex("by_user_and_order", (q) => q.eq("userId", args.userId))
      .collect();

    return links.length;
  },
});

export const updateLinkFolder = mutation({
  args: {
    linkId: v.id("links"),
    folderId: v.optional(v.id("folders")),
  },
  returns: v.null(),
  handler: async ({ db, auth }, args) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const link = await db.get(args.linkId);
    if (!link || link.userId !== identity.subject)
      throw new Error("Unauthorized");

    await db.patch(args.linkId, { folderId: args.folderId || undefined });
    return null;
  },
});

export const getLinksByFolderId = query({
  args: { folderId: v.id("folders") },
  returns: v.array(
    v.object({
      _id: v.id("links"),
      _creationTime: v.number(),
      userId: v.string(),
      title: v.string(),
      url: v.string(),
      order: v.number(),
      musicLinks: v.optional(
        v.array(
          v.object({
            platform: v.string(),
            url: v.string(),
            type: v.string(),
            musicTrackTitle: v.optional(v.string()),
            musicArtistName: v.optional(v.string()),
            musicAlbumArtUrl: v.optional(v.string()),
          }),
        ),
      ),
      musicTrackTitle: v.optional(v.string()),
      musicArtistName: v.optional(v.string()),
      musicAlbumArtUrl: v.optional(v.string()),
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
      folderId: v.optional(v.id("folders")),
    }),
  ),
  handler: async ({ db, auth }, args) => {
    const identity = await auth.getUserIdentity();
    if (!identity) return [];

    return await db
      .query("links")
      .withIndex("by_folderId", (q) => q.eq("folderId", args.folderId))
      .order("asc")
      .collect();
  },
});

export const createLink = mutation({
  args: {
    title: v.string(),
    url: v.string(),
    musicLinks: v.optional(
      v.array(
        v.object({
          platform: v.string(),
          url: v.string(),
          type: v.string(), // Add type to musicLinks object
          musicTrackTitle: v.optional(v.string()),
          musicArtistName: v.optional(v.string()),
          musicAlbumArtUrl: v.optional(v.string()),
        }),
      ),
    ),
    musicTrackTitle: v.optional(v.string()), // New optional argument
    musicArtistName: v.optional(v.string()), // New optional argument
    musicAlbumArtUrl: v.optional(v.string()), // New optional argument
    mediaPreview: v.optional(
      v.object({
        platform: v.literal("youtube"),
        url: v.string(),
        videoId: v.string(),
        title: v.string(),
        thumbnailUrl: v.string(),
      }),
    ),
    playlistPreview: v.optional(
      v.object({
        platform: v.string(),
        url: v.string(),
        playlistId: v.string(),
        title: v.string(),
        description: v.optional(v.string()),
        thumbnailUrl: v.optional(v.string()),
        trackCount: v.optional(v.number()),
        ownerName: v.optional(v.string()),
        tracks: v.optional(
          v.array(
            v.object({
              name: v.string(),
              artist: v.string(),
              duration: v.optional(v.string()),
              previewUrl: v.optional(v.string()),
            }),
          ),
        ),
      }),
    ),
    scheduledAt: v.optional(v.number()),
    folderId: v.optional(v.id("folders")), // New optional argument
  },
  returns: v.id("links"),
  handler: async ({ db, auth }, args) => {
    const identity = await auth.getUserIdentity();

    if (!identity) throw new Error("Not authenticated");

    return await db.insert("links", {
      userId: identity.subject,
      title: args.title,
      url: args.url,
      order: Date.now(),
      musicLinks: args.musicLinks || [],
      musicTrackTitle: args.musicTrackTitle || undefined, // Store musicTrackTitle
      musicArtistName: args.musicArtistName || undefined, // Store musicArtistName
      musicAlbumArtUrl: args.musicAlbumArtUrl || undefined, // Store musicAlbumArtUrl
      mediaPreview: args.mediaPreview || undefined,
      playlistPreview: args.playlistPreview || undefined,
      scheduledAt: args.scheduledAt ?? undefined,
      folderId: args.folderId || undefined, // Store folderId
    });
  },
});
