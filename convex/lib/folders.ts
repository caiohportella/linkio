import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { Id } from "../_generated/dataModel";

export const createFolder = mutation({
  args: {
    name: v.string(),
  },
  handler: async ({ db, auth }, args) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existingFolders = await db
      .query("folders")
      .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
      .collect();

    const position = existingFolders.length;

    const newFolderId = await db.insert("folders", {
      userId: identity.subject,
      name: args.name,
      position: position, // Use the count of existing folders for initial position
    });
    console.log("Created folder with ID:", newFolderId);
    return newFolderId;
  },
});

export const getFoldersByUserId = query({
  args: {
    userId: v.string(),
  },
  handler: async ({ db, auth }, args) => {
    const identity = await auth.getUserIdentity();
    if (!identity) return [];

    const folders = await db
      .query("folders")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("asc")
      .collect();
    console.log("Fetched folders for user", args.userId, ":", folders);
    return folders;
  },
});

export const updateFolderPosition = mutation({
  args: {
    folderId: v.id("folders"),
    position: v.number(),
  },
  handler: async ({ db, auth }, args) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const { folderId, position } = args;

    await db.patch(folderId, { position });
    console.log(`Updated folder ${folderId} position to ${position}`);
  },
});

export const updateFolder = mutation({
  args: {
    folderId: v.id("folders"),
    name: v.string(),
  },
  handler: async ({ db, auth }, args) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const { folderId, name } = args;

    await db.patch(folderId, { name });
    console.log(`Updated folder ${folderId} name to ${name}`);
  },
});

export const deleteFolder = mutation({
  args: {
    folderId: v.id("folders"),
  },
  handler: async ({ db, auth }, args) => {
    const identity = await auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const { folderId } = args;

    await db.delete(folderId);
    console.log(`Deleted folder ${folderId}`);
  },
});
