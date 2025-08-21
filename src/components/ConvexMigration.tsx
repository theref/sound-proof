import { useState, useEffect } from 'react';
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { trackStorage, userStorage } from '@/utils/localStorage';
import { useFarcasterAuth } from '@/hooks/useFarcasterAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

export const ConvexMigration = () => {
  const { user } = useFarcasterAuth();
  const [migrationState, setMigrationState] = useState<'idle' | 'checking' | 'migrating' | 'completed' | 'error'>('idle');
  const [migrationProgress, setMigrationProgress] = useState(0);
  const [localTrackCount, setLocalTrackCount] = useState(0);
  const [migratedCount, setMigratedCount] = useState(0);
  
  const createTrack = useMutation(api.tracks.create);
  const createOrUpdateUser = useMutation(api.users.createOrUpdate);
  
  // Check localStorage data on mount
  useEffect(() => {
    const checkLocalData = () => {
      const userTracks = trackStorage.getUserTracks();
      const feedTracks = trackStorage.getFeedTracks();
      
      // Only count user's own tracks for migration
      const userOnlyTracks = userTracks.filter(track => 
        user ? track.uploader === user.fid.toString() : false
      );
      
      setLocalTrackCount(userOnlyTracks.length);
    };
    
    if (user) {
      checkLocalData();
    }
  }, [user]);
  
  const startMigration = async () => {
    if (!user) {
      toast.error("Please sign in first");
      return;
    }
    
    setMigrationState('checking');
    
    try {
      // Ensure user exists in Convex
      await createOrUpdateUser({
        fid: user.fid,
        walletAddress: user.verifiedAddresses?.[0] || undefined,
      });
      
      setMigrationState('migrating');
      
      // Get user tracks from localStorage
      const userTracks = trackStorage.getUserTracks();
      const userOnlyTracks = userTracks.filter(track => 
        track.uploader === user.fid.toString()
      );
      
      console.log(`Starting migration of ${userOnlyTracks.length} tracks for user ${user.fid}`);
      
      // Migrate tracks one by one
      for (let i = 0; i < userOnlyTracks.length; i++) {
        const track = userOnlyTracks[i];
        
        try {
          await createTrack({
            title: track.title,
            artist: track.artist,
            uploaderFid: user.fid,
            uploaderUsername: user.username || `@${user.fid}`,
            cid: track.cid,
            metadataCid: track.metadataCid,
            coverImageCid: track.coverImageCid,
            accessRule: {
              type: track.accessRule.type as "public" | "erc20" | "erc721",
              contractAddress: track.accessRule.contractAddress,
              minBalance: track.accessRule.minBalance,
            },
            duration: track.duration,
            genre: track.genre,
            description: track.description,
            isEncrypted: track.isEncrypted,
          });
          
          setMigratedCount(i + 1);
          setMigrationProgress(((i + 1) / userOnlyTracks.length) * 100);
          
          console.log(`Migrated track ${i + 1}/${userOnlyTracks.length}: ${track.title}`);
          
        } catch (error) {
          console.error(`Failed to migrate track "${track.title}":`, error);
          // Continue with next track
        }
      }
      
      setMigrationState('completed');
      toast.success(`Successfully migrated ${migratedCount} tracks to Convex!`);
      
    } catch (error) {
      console.error('Migration failed:', error);
      setMigrationState('error');
      toast.error('Migration failed. Please try again.');
    }
  };
  
  const clearLocalStorage = () => {
    if (migrationState === 'completed') {
      // Only clear user tracks, keep settings
      trackStorage.saveUserTracks([]);
      toast.success("Local storage cleared. Your tracks are now stored in Convex!");
    }
  };
  
  if (!user) {
    return null; // Don't show migration UI if not signed in
  }
  
  if (localTrackCount === 0) {
    return null; // No tracks to migrate
  }
  
  return (
    <Card className="mb-6 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-orange-900">🚀 Convex Migration Available</CardTitle>
        <CardDescription className="text-orange-700">
          We found {localTrackCount} tracks in your browser storage that can be migrated to our new multi-device system.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {migrationState === 'idle' && (
          <div className="space-y-3">
            <p className="text-sm text-orange-600">
              After migration, your tracks will be available across all your devices and browsers.
            </p>
            <Button 
              onClick={startMigration}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Migrate {localTrackCount} Tracks to Convex
            </Button>
          </div>
        )}
        
        {migrationState === 'checking' && (
          <div className="text-center">
            <p className="text-sm text-orange-600">Checking migration status...</p>
          </div>
        )}
        
        {migrationState === 'migrating' && (
          <div className="space-y-3">
            <p className="text-sm text-orange-600">
              Migrating tracks... {migratedCount}/{localTrackCount}
            </p>
            <Progress value={migrationProgress} className="w-full" />
          </div>
        )}
        
        {migrationState === 'completed' && (
          <div className="space-y-3">
            <p className="text-sm text-green-600">
              ✅ Successfully migrated {migratedCount} tracks!
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={clearLocalStorage}
                variant="outline"
                size="sm"
              >
                Clear Browser Storage
              </Button>
              <Button 
                onClick={() => window.location.reload()}
                size="sm"
                className="bg-orange-600 hover:bg-orange-700"
              >
                Refresh Page
              </Button>
            </div>
          </div>
        )}
        
        {migrationState === 'error' && (
          <div className="space-y-3">
            <p className="text-sm text-red-600">
              ❌ Migration failed. Your data is still safe in browser storage.
            </p>
            <Button 
              onClick={startMigration}
              variant="outline"
              size="sm"
            >
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};