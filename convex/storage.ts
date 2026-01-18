import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate a URL for uploading a file
export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  return await ctx.storage.generateUploadUrl();
});

// Get a URL for a stored file
export const getUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
