import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

// Current schema version - increment when schema changes
const CURRENT_SCHEMA_VERSION = 1;

// Track schema version in database
export const getCurrentSchemaVersion = internalQuery({
  handler: async (ctx) => {
    const version = await ctx.db
      .query("schema_versions")
      .order("desc")
      .first();
    
    return version?.version || 0;
  },
});

// Initialize schema version tracking
export const initializeSchemaVersion = internalMutation({
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("schema_versions")
      .first();
    
    if (!existing) {
      await ctx.db.insert("schema_versions", {
        version: CURRENT_SCHEMA_VERSION,
        migratedAt: Date.now(),
        description: "Initial schema setup for localStorage migration",
      });
    }
    
    return CURRENT_SCHEMA_VERSION;
  },
});

// Run any pending migrations
export const runMigrations = internalMutation({
  handler: async (ctx) => {
    const currentVersion = await getCurrentSchemaVersion(ctx);
    
    if (currentVersion < CURRENT_SCHEMA_VERSION) {
      console.log(`Running migrations from version ${currentVersion} to ${CURRENT_SCHEMA_VERSION}`);
      
      // Future migrations will go here
      // Example:
      // if (currentVersion < 2) {
      //   await migrateToVersion2(ctx);
      // }
      
      // Update schema version
      await ctx.db.insert("schema_versions", {
        version: CURRENT_SCHEMA_VERSION,
        migratedAt: Date.now(),
        description: `Migrated to version ${CURRENT_SCHEMA_VERSION}`,
      });
    }
    
    return CURRENT_SCHEMA_VERSION;
  },
});

// Utility to migrate localStorage track data to Convex
export const migrateTrackFromLocalStorage = internalMutation({
  args: {
    // Match localStorage StoredTrack interface exactly
    id: v.string(),                     // Will become Convex _id
    title: v.string(),
    artist: v.string(),
    uploader: v.string(),               // FID as string - convert to number
    uploaderUsername: v.string(),
    cid: v.string(),
    accessRule: v.object({
      type: v.union(v.literal("public"), v.literal("erc20"), v.literal("erc721")),
      contractAddress: v.optional(v.string()),
      minBalance: v.optional(v.string()),
    }),
    duration: v.optional(v.number()),
    genre: v.optional(v.string()),
    description: v.optional(v.string()),
    coverImageCid: v.optional(v.string()),
    isEncrypted: v.boolean(),
    uploadedAt: v.string(),             // ISO string - convert to timestamp
    playCount: v.number(),
  },
  handler: async (ctx, args) => {
    const uploaderFid = parseInt(args.uploader, 10);
    const uploadedAtTimestamp = new Date(args.uploadedAt).getTime();
    
    // Check if track already exists (idempotent)
    const existing = await ctx.db
      .query("tracks")
      .withIndex("by_uploader", (q) => q.eq("uploaderFid", uploaderFid))
      .filter((q) => q.eq(q.field("cid"), args.cid))
      .first();
    
    if (existing) {
      console.log(`Track ${args.title} already migrated, skipping`);
      return existing._id;
    }
    
    // Ensure user exists
    const user = await ctx.db
      .query("users")
      .withIndex("by_fid", (q) => q.eq("fid", uploaderFid))
      .first();
    
    if (!user) {
      // Create minimal user record
      await ctx.db.insert("users", {
        fid: uploaderFid,
        schemaVersion: CURRENT_SCHEMA_VERSION,
        createdAt: Date.now(),
        lastActive: Date.now(),
        updatedAt: Date.now(),
      });
    }
    
    // Insert track
    const trackId = await ctx.db.insert("tracks", {
      title: args.title,
      artist: args.artist,
      uploaderFid,
      uploaderUsername: args.uploaderUsername,
      cid: args.cid,
      coverImageCid: args.coverImageCid,
      accessRule: args.accessRule,
      duration: args.duration,
      genre: args.genre,
      description: args.description,
      isEncrypted: args.isEncrypted,
      playCount: args.playCount,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      uploadedAt: uploadedAtTimestamp,
      updatedAt: Date.now(),
    });
    
    console.log(`Migrated track: ${args.title} by ${args.artist}`);
    return trackId;
  },
});

// Utility to check if data needs migration
export const checkMigrationStatus = internalQuery({
  args: {
    fid: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_fid", (q) => q.eq("fid", args.fid))
      .first();
    
    const userTracks = await ctx.db
      .query("tracks")
      .withIndex("by_uploader", (q) => q.eq("uploaderFid", args.fid))
      .collect();
    
    return {
      userExists: !!user,
      trackCount: userTracks.length,
      needsMigration: !user || user.schemaVersion !== CURRENT_SCHEMA_VERSION,
      currentSchemaVersion: await getCurrentSchemaVersion(ctx),
    };
  },
});