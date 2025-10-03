import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";

// Define a new type that includes the derived profilePictureUrl
export type CustomizationsWithUrl = Doc<"userCustomizations"> & {
  profilePictureUrl?: string;
};

export const getCustomizationsBySlug = query({
  args: { slug: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("userCustomizations"),
      _creationTime: v.number(),
      userId: v.string(),
      profilePictureStorageId: v.optional(v.id("_storage")),
      profilePictureUrl: v.optional(v.string()),
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
    }),
  ),
  handler: async ({ db, storage }, args) => {
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

    const customizations = await db
      .query("userCustomizations")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    if (!customizations) return null;

    let profilePictureUrl: string | undefined;

    if (customizations.profilePictureStorageId) {
      try {
        const url = await storage.getUrl(
          customizations.profilePictureStorageId,
        );
        profilePictureUrl = url || undefined;
      } catch (error) {
        console.error("Error getting profile picture URL:", error);
        profilePictureUrl = undefined;
      }
    }

    return { ...customizations, profilePictureUrl };
  },
});

export const getUserCustomizations = query({
  args: { userId: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("userCustomizations"),
      _creationTime: v.number(),
      userId: v.string(),
      profilePictureStorageId: v.optional(v.id("_storage")),
      profilePictureUrl: v.optional(v.string()),
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
    }),
  ),
  handler: async ({ db, storage }, args) => {
    const customizations = await db
      .query("userCustomizations")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .unique();

    if (!customizations) return null;

    let profilePictureUrl: string | undefined;

    if (customizations.profilePictureStorageId) {
      try {
        const url = await storage.getUrl(
          customizations.profilePictureStorageId,
        );
        profilePictureUrl = url || undefined;
      } catch (error) {
        console.error("Error getting profile picture URL:", error);
        profilePictureUrl = undefined;
      }
    }

    return { ...customizations, profilePictureUrl };
  },
});

export const updateCustomizations = mutation({
  args: {
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
  },
  returns: v.id("userCustomizations"),
  handler: async ({ db, auth, storage }, args) => {
    const identity = await auth.getUserIdentity();

    if (!identity) throw new Error("Not authenticated");

    const existing = await db
      .query("userCustomizations")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (existing) {
      if (args.profilePictureStorageId && existing.profilePictureStorageId) {
        await storage.delete(existing.profilePictureStorageId);
      }

      await db.patch(existing._id, {
        ...(args.profilePictureStorageId !== undefined && {
          profilePictureStorageId: args.profilePictureStorageId,
        }),
        ...(args.description !== undefined && {
          description: args.description,
        }),
        ...(args.accentColor !== undefined && {
          accentColor: args.accentColor,
        }),
        ...(args.socialLinks !== undefined && {
          socialLinks: args.socialLinks ?? [],
        }),
      });

      return existing._id;
    } else {
      return await db.insert("userCustomizations", {
        userId: identity.subject,
        ...(args.profilePictureStorageId !== undefined && {
          profilePictureStorageId: args.profilePictureStorageId,
        }),
        ...(args.description !== undefined && {
          description: args.description,
        }),
        ...(args.accentColor !== undefined && {
          accentColor: args.accentColor,
        }),
        ...(args.socialLinks !== undefined && {
          socialLinks: args.socialLinks,
        }),
      });
    }
  },
});

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async ({ storage, auth }) => {
    const identity = await auth.getUserIdentity();

    if (!identity) throw new Error("Not authenticated");

    return await storage.generateUploadUrl();
  },
});

export const removeProfilePicture = mutation({
  args: {},
  returns: v.null(),
  handler: async ({ db, auth, storage }) => {
    const identity = await auth.getUserIdentity();

    if (!identity) throw new Error("Not authenticated");

    const existing = await db
      .query("userCustomizations")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (existing && existing.profilePictureStorageId) {
      await storage.delete(existing.profilePictureStorageId);

      await db.patch(existing._id, {
        profilePictureStorageId: undefined,
      });
    }

    return null;
  },
});
