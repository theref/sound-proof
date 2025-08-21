import { ConvexReactClient } from "convex/react";

// Convex client setup
// In development, we'll use a placeholder URL until we get the actual deployment URL
const CONVEX_URL = import.meta.env.VITE_CONVEX_URL || "https://placeholder.convex.cloud";

if (!import.meta.env.VITE_CONVEX_URL && import.meta.env.NODE_ENV !== "development") {
  throw new Error("Missing VITE_CONVEX_URL environment variable");
}

export const convex = new ConvexReactClient(CONVEX_URL);

// Helper to check if Convex is properly configured
export const isConvexConfigured = (): boolean => {
  return !!import.meta.env.VITE_CONVEX_URL && 
         !import.meta.env.VITE_CONVEX_URL.includes("placeholder");
};

// Migration helper to move localStorage data to Convex
export const migrateLocalStorageToConvex = async () => {
  if (!isConvexConfigured()) {
    console.warn("Convex not configured, skipping migration");
    return false;
  }

  try {
    // Import localStorage utilities
    const { trackStorage } = await import("@/utils/localStorage");
    
    // Get localStorage tracks
    const localTracks = trackStorage.getUserTracks();
    const feedTracks = trackStorage.getFeedTracks();
    
    console.log(`Found ${localTracks.length} user tracks and ${feedTracks.length} feed tracks in localStorage`);
    
    // TODO: Implement actual migration when Convex is deployed
    // For now, just log what would be migrated
    
    return true;
  } catch (error) {
    console.error("Migration failed:", error);
    return false;
  }
};