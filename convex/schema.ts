import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Schema version for future migrations
  schema_versions: defineTable({
    version: v.number(),
    migratedAt: v.number(),
    description: v.string(),
  }),

  // Users - minimal for localStorage migration
  users: defineTable({
    fid: v.number(),                    // Farcaster FID (primary identifier)
    walletAddress: v.optional(v.string()), // Connected wallet
    
    // Schema version tracking for user data migrations
    schemaVersion: v.optional(v.number()),
    
    // Basic metadata
    createdAt: v.number(),
    lastActive: v.number(),
    updatedAt: v.number(),
  })
    .index("by_fid", ["fid"])
    .index("by_wallet", ["walletAddress"]),

  // Tracks - maps directly to localStorage StoredTrack interface
  tracks: defineTable({
    // Basic track info (matches localStorage)
    title: v.string(),
    artist: v.string(),
    uploaderFid: v.number(),           // Maps to localStorage track.uploader (as number)
    uploaderUsername: v.string(),       // Maps to localStorage track.uploaderUsername
    
    // File references (NOT the files themselves) 
    cid: v.string(),                   // Audio file IPFS hash (Lighthouse)
    coverImageCid: v.optional(v.string()), // Cover image IPFS hash
    // metadataCid removed - metadata stored directly in Convex
    
    // Access control (maps to localStorage accessRule)
    accessRule: v.object({
      type: v.union(
        v.literal("public"), 
        v.literal("erc20"), 
        v.literal("erc721")
      ),
      contractAddress: v.optional(v.string()),
      minBalance: v.optional(v.string()),
    }),
    
    // Audio metadata
    duration: v.optional(v.number()),   // Maps to localStorage track.duration
    genre: v.optional(v.string()),      // Maps to localStorage track.genre
    description: v.optional(v.string()), // Maps to localStorage track.description
    
    // Encryption status
    isEncrypted: v.boolean(),           // Maps to localStorage track.isEncrypted
    
    // Analytics (starts simple, can be materialized later)
    playCount: v.number(),              // Maps to localStorage track.playCount
    
    // Schema version for track data migrations
    schemaVersion: v.optional(v.number()),
    
    // Timestamps
    uploadedAt: v.number(),             // Maps to localStorage track.uploadedAt (as timestamp)
    updatedAt: v.number(),
  })
    .index("by_uploader", ["uploaderFid"])
    .index("by_recent", ["uploadedAt"])
    .index("by_genre", ["genre"])
    .index("by_plays", ["playCount"]),

  // Future-proofing: Play events for analytics (not used initially)
  playEvents: defineTable({
    trackId: v.id("tracks"),
    listenerFid: v.optional(v.number()), // If logged in
    playDate: v.string(),               // YYYY-MM-DD for aggregation
    playCount: v.number(),              // Plays this day by this user
    totalDuration: v.number(),          // Total seconds played
    lastPlayed: v.number(),             // Most recent play timestamp
    
    schemaVersion: v.optional(v.number()),
  })
    .index("by_track_date", ["trackId", "playDate"])
    .index("by_listener", ["listenerFid"])
    .index("by_date", ["playDate"]),

}, {
  // Convex schema versioning (for automatic migrations)
  schemaValidation: true,
});