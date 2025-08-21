import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get user by Farcaster FID
export const getByFid = query({
  args: { fid: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_fid", (q) => q.eq("fid", args.fid))
      .first();
  },
});

// Create or update user (idempotent)
export const createOrUpdate = mutation({
  args: {
    fid: v.number(),
    walletAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_fid", (q) => q.eq("fid", args.fid))
      .first();
    
    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        walletAddress: args.walletAddress,
        lastActive: Date.now(),
        updatedAt: Date.now(),
      });
      return existingUser._id;
    } else {
      // Create new user
      return await ctx.db.insert("users", {
        fid: args.fid,
        walletAddress: args.walletAddress,
        schemaVersion: 1,
        createdAt: Date.now(),
        lastActive: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

// Update user's last active timestamp
export const updateLastActive = mutation({
  args: { fid: v.number() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_fid", (q) => q.eq("fid", args.fid))
      .first();
    
    if (user) {
      await ctx.db.patch(user._id, {
        lastActive: Date.now(),
        updatedAt: Date.now(),
      });
    }
    
    return user?._id;
  },
});

// Get user by wallet address (for future use)
export const getByWallet = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress))
      .first();
  },
});

// List all users (for admin/debug purposes)
export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .order("desc")
      .take(args.limit || 50);
  },
});