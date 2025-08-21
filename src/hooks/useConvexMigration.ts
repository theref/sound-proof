import { useState, useCallback } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { trackStorage, type StoredTrack } from '@/utils/localStorage';
import { useFarcasterAuth } from './useFarcasterAuth';
import { toast } from 'sonner';

export interface MigrationStatus {
  isLoading: boolean;
  isCompleted: boolean;
  error: string | null;
  progress: {
    current: number;
    total: number;
  };
}

/**
 * Hook to migrate localStorage tracks to Convex
 * Only migrates user's own tracks (USER_TRACKS), not feed tracks
 */
export const useConvexMigration = () => {
  const { user } = useFarcasterAuth();
  const migrateTrack = useMutation(api.migrations.migrateTrackFromLocalStorage);
  
  const [status, setStatus] = useState<MigrationStatus>({
    isLoading: false,
    isCompleted: false,
    error: null,
    progress: { current: 0, total: 0 },
  });

  const resetStatus = useCallback(() => {
    setStatus({
      isLoading: false,
      isCompleted: false,
      error: null,
      progress: { current: 0, total: 0 },
    });
  }, []);

  const migrateFromLocalStorage = useCallback(async () => {
    if (!user) {
      toast.error("Please sign in to migrate your tracks");
      return;
    }

    // Get tracks from localStorage
    const userTracks = trackStorage.getUserTracks();
    
    if (userTracks.length === 0) {
      toast.info("No tracks found in localStorage to migrate");
      return;
    }

    console.log(`🔄 Starting migration of ${userTracks.length} tracks from localStorage to Convex...`);
    
    setStatus({
      isLoading: true,
      isCompleted: false,
      error: null,
      progress: { current: 0, total: userTracks.length },
    });

    try {
      let successCount = 0;
      let skipCount = 0;
      let errorCount = 0;

      for (let i = 0; i < userTracks.length; i++) {
        const track = userTracks[i];
        
        setStatus(prev => ({
          ...prev,
          progress: { current: i + 1, total: userTracks.length },
        }));

        try {
          // Migrate track to Convex
          const convexTrackId = await migrateTrack({
            id: track.id,
            title: track.title,
            artist: track.artist,
            uploader: track.uploader, // FID as string
            uploaderUsername: track.uploaderUsername,
            cid: track.cid,
            accessRule: track.accessRule,
            duration: track.duration,
            genre: track.genre,
            description: track.description,
            coverImageCid: track.coverImageCid,
            isEncrypted: track.isEncrypted,
            uploadedAt: track.uploadedAt,
            playCount: track.playCount,
          });

          if (convexTrackId) {
            successCount++;
            console.log(`✅ Migrated track: "${track.title}" -> ${convexTrackId}`);
          } else {
            skipCount++;
            console.log(`⏭️ Skipped track: "${track.title}" (already exists)`);
          }
        } catch (error) {
          errorCount++;
          console.error(`❌ Failed to migrate track: "${track.title}"`, error);
        }
      }

      setStatus({
        isLoading: false,
        isCompleted: true,
        error: null,
        progress: { current: userTracks.length, total: userTracks.length },
      });

      // Show summary
      const messages = [];
      if (successCount > 0) messages.push(`${successCount} tracks migrated`);
      if (skipCount > 0) messages.push(`${skipCount} already existed`);
      if (errorCount > 0) messages.push(`${errorCount} failed`);

      toast.success(`Migration completed: ${messages.join(', ')}`);
      console.log(`🎉 Migration completed: ${messages.join(', ')}`);

      // Optionally clear localStorage after successful migration
      // trackStorage.saveUserTracks([]);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Migration failed:', error);
      
      setStatus({
        isLoading: false,
        isCompleted: false,
        error: errorMessage,
        progress: { current: 0, total: userTracks.length },
      });

      toast.error(`Migration failed: ${errorMessage}`);
    }
  }, [user, migrateTrack]);

  const clearLocalStorageTracks = useCallback(() => {
    if (!window.confirm("Are you sure you want to clear all tracks from localStorage? This cannot be undone.")) {
      return;
    }

    trackStorage.saveUserTracks([]);
    trackStorage.saveFeedTracks([]);
    toast.success("localStorage tracks cleared");
    console.log("🗑️ localStorage tracks cleared");
  }, []);

  const getLocalStorageInfo = useCallback(() => {
    const userTracks = trackStorage.getUserTracks();
    const feedTracks = trackStorage.getFeedTracks();
    
    return {
      userTracksCount: userTracks.length,
      feedTracksCount: feedTracks.length,
      totalTracks: userTracks.length + feedTracks.length,
      userTracks,
      feedTracks,
    };
  }, []);

  return {
    status,
    migrateFromLocalStorage,
    clearLocalStorageTracks,
    getLocalStorageInfo,
    resetStatus,
  };
};