import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Download, 
  Database, 
  Trash2, 
  AlertCircle, 
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useConvexMigration } from '@/hooks/useConvexMigration';
import { useFarcasterAuth } from '@/hooks/useFarcasterAuth';
import { toast } from 'sonner';

export const MigrationPanel = () => {
  const { user } = useFarcasterAuth();
  const {
    status,
    migrateFromLocalStorage,
    clearLocalStorageTracks,
    getLocalStorageInfo,
    resetStatus,
  } = useConvexMigration();

  const localStorageInfo = getLocalStorageInfo();

  // Reset status when component mounts
  useEffect(() => {
    resetStatus();
  }, [resetStatus]);

  if (!user) {
    return (
      <Card className="border-2 border-taco-black">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-taco-dark-grey mx-auto mb-4" />
          <h3 className="taco-subheading text-taco-black mb-2">Sign In Required</h3>
          <p className="taco-ui-text text-taco-dark-grey">
            Please sign in to migrate your tracks from localStorage to the cloud.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* localStorage Info */}
      <Card className="border-2 border-taco-black">
        <CardHeader className="border-b-2 border-taco-black">
          <CardTitle className="taco-subheading text-taco-black flex items-center gap-2">
            <Database className="w-5 h-5" />
            localStorage Status
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 border-2 border-taco-black bg-taco-light-grey">
              <div className="text-2xl font-bold text-taco-black">
                {localStorageInfo.userTracksCount}
              </div>
              <div className="text-sm text-taco-dark-grey">Your Tracks</div>
            </div>
            <div className="text-center p-4 border-2 border-taco-black bg-taco-light-grey">
              <div className="text-2xl font-bold text-taco-black">
                {localStorageInfo.feedTracksCount}
              </div>
              <div className="text-sm text-taco-dark-grey">Feed Tracks</div>
            </div>
            <div className="text-center p-4 border-2 border-taco-black bg-taco-light-grey">
              <div className="text-2xl font-bold text-taco-black">
                {localStorageInfo.totalTracks}
              </div>
              <div className="text-sm text-taco-dark-grey">Total</div>
            </div>
          </div>

          <div className="p-4 border-2 border-taco-black bg-yellow-50">
            <h4 className="taco-ui-text font-bold text-taco-black mb-2">Migration Info</h4>
            <div className="space-y-1 text-sm text-taco-dark-grey">
              <p>• Only YOUR uploaded tracks will be migrated</p>
              <p>• Feed tracks (discovered from others) stay in localStorage</p>
              <p>• Migration is safe and doesn't delete localStorage data</p>
              <p>• After migration, your tracks sync across all devices</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Migration Actions */}
      <Card className="border-2 border-taco-black">
        <CardHeader className="border-b-2 border-taco-black">
          <CardTitle className="taco-subheading text-taco-black flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Migration Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          
          {/* Migration Status */}
          {status.isLoading && (
            <div className="p-4 border-2 border-brand-orange-500 bg-brand-orange-50">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="taco-ui-text font-bold text-taco-black">
                  Migrating tracks...
                </span>
                <Badge variant="outline" className="text-xs">
                  {status.progress.current} / {status.progress.total}
                </Badge>
              </div>
              <Progress 
                value={(status.progress.current / status.progress.total) * 100} 
                className="w-full"
              />
            </div>
          )}

          {status.isCompleted && (
            <div className="p-4 border-2 border-green-500 bg-green-50">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="taco-ui-text font-bold text-taco-black">
                  Migration completed successfully!
                </span>
              </div>
            </div>
          )}

          {status.error && (
            <div className="p-4 border-2 border-red-500 bg-red-50">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="taco-ui-text font-bold text-taco-black">
                  Migration failed: {status.error}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={migrateFromLocalStorage}
              disabled={status.isLoading || localStorageInfo.userTracksCount === 0}
              className="taco-button bg-gradient-to-r from-brand-orange-500 to-brand-orange-600 hover:from-brand-orange-700 hover:to-brand-orange-800"
            >
              {status.isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Migrating...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Migrate Tracks to Cloud
                </>
              )}
            </Button>

            <Button
              onClick={clearLocalStorageTracks}
              disabled={status.isLoading}
              variant="outline"
              className="border-2 border-taco-black"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear localStorage
            </Button>
          </div>

          {localStorageInfo.userTracksCount === 0 && (
            <p className="taco-ui-text text-taco-dark-grey text-sm">
              No tracks found in localStorage to migrate.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Help */}
      <Card className="border-2 border-taco-black">
        <CardHeader className="border-b-2 border-taco-black">
          <CardTitle className="taco-subheading text-taco-black">
            Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-2 text-sm text-taco-dark-grey">
            <p><strong>Why migrate?</strong> Moving your tracks to the cloud ensures they're backed up and accessible from any device.</p>
            <p><strong>Is it safe?</strong> Yes! Migration doesn't delete your localStorage data, so you have both copies.</p>
            <p><strong>What gets migrated?</strong> Only tracks you uploaded. Feed tracks (from other users) stay local.</p>
            <p><strong>Problems?</strong> Try refreshing the page and signing in again.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};