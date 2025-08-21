import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new track (replacement for localStorage addUserTrack)
export const create = mutation({
  args: {
    title: v.string(),
    artist: v.string(),
    uploaderFid: v.number(),
    uploaderUsername: v.string(),
    cid: v.string(),
    coverImageCid: v.optional(v.string()),
    accessRule: v.object({
      type: v.union(v.literal("public"), v.literal("erc20"), v.literal("erc721")),
      contractAddress: v.optional(v.string()),
      minBalance: v.optional(v.string()),
    }),
    duration: v.optional(v.number()),
    genre: v.optional(v.string()),
    description: v.optional(v.string()),
    isEncrypted: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Ensure user exists (create if not)
    const user = await ctx.db
      .query("users")
      .withIndex("by_fid", (q) => q.eq("fid", args.uploaderFid))
      .first();
    
    if (!user) {
      // Create minimal user record
      await ctx.db.insert("users", {
        fid: args.uploaderFid,
        schemaVersion: 1,
        createdAt: Date.now(),
        lastActive: Date.now(),
        updatedAt: Date.now(),
      });
    }
    
    // Create track
    const trackId = await ctx.db.insert("tracks", {
      title: args.title,
      artist: args.artist,
      uploaderFid: args.uploaderFid,
      uploaderUsername: args.uploaderUsername,
      cid: args.cid,
      coverImageCid: args.coverImageCid,
      accessRule: args.accessRule,
      duration: args.duration,
      genre: args.genre,
      description: args.description,
      isEncrypted: args.isEncrypted,
      playCount: 0,
      schemaVersion: 1,
      uploadedAt: Date.now(),
      updatedAt: Date.now(),
    });
    
    // Update user's last active
    if (user) {
      await ctx.db.patch(user._id, {
        lastActive: Date.now(),
        updatedAt: Date.now(),
      });
    }
    
    return trackId;
  },
});

// Get tracks by uploader FID (replacement for localStorage getUserTracks)
export const getByUploader = query({
  args: { uploaderFid: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tracks")
      .withIndex("by_uploader", (q) => q.eq("uploaderFid", args.uploaderFid))
      .order("desc")
      .collect();
  },
});

// Get recent tracks for feed (replacement for localStorage getFeedTracks)
export const getRecent = query({
  args: { 
    limit: v.optional(v.number()),
    excludeUploaderFid: v.optional(v.number()), // Hide user's own tracks
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    
    let tracks = await ctx.db
      .query("tracks")
      .withIndex("by_recent")
      .order("desc")
      .take(limit * 2); // Get more than needed in case we need to filter
    
    // Filter out user's own tracks if specified
    if (args.excludeUploaderFid) {
      tracks = tracks.filter(track => track.uploaderFid !== args.excludeUploaderFid);
    }
    
    // Return only the requested number
    return tracks.slice(0, limit);
  },
});

// Get track by ID
export const getById = query({
  args: { trackId: v.id("tracks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.trackId);
  },
});

// Update play count (replacement for localStorage incrementPlayCount)
export const incrementPlayCount = mutation({
  args: { 
    trackId: v.id("tracks"),
    listenerFid: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const track = await ctx.db.get(args.trackId);
    if (!track) {
      throw new Error("Track not found");
    }
    
    // Increment play count
    await ctx.db.patch(args.trackId, {
      playCount: track.playCount + 1,
      updatedAt: Date.now(),
    });
    
    // TODO: Future enhancement - track individual plays in playEvents table
    // For now, just increment the counter like localStorage did
    
    return track.playCount + 1;
  },
});

// Get tracks by genre (for future filtering)
export const getByGenre = query({
  args: { 
    genre: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tracks")
      .withIndex("by_genre", (q) => q.eq("genre", args.genre))
      .order("desc")
      .take(args.limit || 20);
  },
});

// Get popular tracks (sorted by play count)
export const getPopular = query({
  args: { 
    limit: v.optional(v.number()),
    excludeUploaderFid: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    
    let tracks = await ctx.db
      .query("tracks")
      .withIndex("by_plays")
      .order("desc")
      .take(limit * 2);
    
    // Filter out user's own tracks if specified
    if (args.excludeUploaderFid) {
      tracks = tracks.filter(track => track.uploaderFid !== args.excludeUploaderFid);
    }
    
    return tracks.slice(0, limit);
  },
});

// Search tracks by title or artist (basic text search)
export const search = query({
  args: { 
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const searchTerm = args.searchTerm.toLowerCase();
    const limit = args.limit || 20;
    
    // Get all tracks and filter client-side (simple approach)
    // TODO: Future enhancement - use Convex full-text search
    const allTracks = await ctx.db
      .query("tracks")
      .order("desc")
      .take(1000); // Reasonable limit for search
    
    const matchingTracks = allTracks.filter(track => 
      track.title.toLowerCase().includes(searchTerm) ||
      track.artist.toLowerCase().includes(searchTerm) ||
      track.description?.toLowerCase().includes(searchTerm) ||
      track.genre?.toLowerCase().includes(searchTerm)
    );
    
    return matchingTracks.slice(0, limit);
  },
});

// Delete track (for future use)
export const deleteTrack = mutation({
  args: { 
    trackId: v.id("tracks"),
    uploaderFid: v.number(), // Verify ownership
  },
  handler: async (ctx, args) => {
    const track = await ctx.db.get(args.trackId);
    
    if (!track) {
      throw new Error("Track not found");
    }
    
    if (track.uploaderFid !== args.uploaderFid) {
      throw new Error("Not authorized to delete this track");
    }
    
    await ctx.db.delete(args.trackId);
    return true;
  },
});

// Update track metadata
export const updateTrack = mutation({
  args: {
    trackId: v.id("tracks"),
    uploaderFid: v.number(), // Verify ownership
    title: v.optional(v.string()),
    artist: v.optional(v.string()),
    genre: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const track = await ctx.db.get(args.trackId);
    
    if (!track) {
      throw new Error("Track not found");
    }
    
    if (track.uploaderFid !== args.uploaderFid) {
      throw new Error("Not authorized to update this track");
    }
    
    const updates: any = {
      updatedAt: Date.now(),
    };
    
    if (args.title) updates.title = args.title;
    if (args.artist) updates.artist = args.artist;
    if (args.genre) updates.genre = args.genre;
    if (args.description) updates.description = args.description;
    
    await ctx.db.patch(args.trackId, updates);
    return args.trackId;
  },
});