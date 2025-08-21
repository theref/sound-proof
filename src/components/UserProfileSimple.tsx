import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Music, 
  Play, 
  Pause, 
  Download, 
  Share2, 
  Clock,
  Hash,
  ExternalLink,
  Copy
} from "lucide-react";
import { usePlayback } from '@/contexts/PlaybackContext';
import { useFarcasterAuth } from '@/hooks/useFarcasterAuth';
import { useUserTracks } from '@/hooks/useConvexTracks';
import { formatCastTimestamp } from '@/integrations/farcaster/utils';
import { toast } from "sonner";

interface UserProfileSimpleProps {
  userAddress: string; // FID as string
}

export const UserProfileSimple = ({ userAddress }: UserProfileSimpleProps) => {
  const { user } = useFarcasterAuth();
  const { currentTrack, isPlaying, playTrack, pauseTrack } = usePlayback();
  
  // Load user's tracks from Convex with real-time updates
  const userTracks = useUserTracks(user?.fid || null);
  
  // Calculate stats from tracks
  const stats = useMemo(() => {
    if (!userTracks) return { totalTracks: 0, totalPlays: 0, totalDuration: 0 };
    
    const totalPlays = userTracks.reduce((sum, track) => sum + track.playCount, 0);
    const totalDuration = userTracks.reduce((sum, track) => sum + (track.duration || 0), 0);
    
    return {
      totalTracks: userTracks.length,
      totalPlays,
      totalDuration,
    };
  }, [userTracks]);

  const handleTrackPlay = (track: any) => {
    if (currentTrack?._id === track._id) {
      if (isPlaying) {
        pauseTrack();
      } else {
        playTrack(track);
      }
    } else {
      playTrack(track);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTotalDuration = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const copyTrackLink = (track: any) => {
    const url = `${window.location.origin}/#track=${track._id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  const shareToFarcaster = (track: any) => {
    const url = `${window.location.origin}/#track=${track._id}`;
    const text = `🎵 Check out "${track.title}" by ${track.artist} on SoundProof!\n\n${url}`;
    
    // Open Warpcast composer
    const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`;
    window.open(warpcastUrl, '_blank');
  };

  const exportData = () => {
    if (!userTracks) {
      toast.error("No data to export");
      return;
    }
    
    const data = {
      user: {
        fid: user?.fid,
        username: user?.username,
        displayName: user?.displayName,
      },
      tracks: userTracks,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `soundproof-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Backup downloaded successfully");
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto border-2 border-taco-black">
          <CardContent className="p-8 text-center">
            <User className="w-16 h-16 text-taco-dark-grey mx-auto mb-4" />
            <h2 className="taco-subheading text-taco-black mb-2">Profile</h2>
            <p className="taco-ui-text text-taco-dark-grey">
              Please sign in with Farcaster to view your profile.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <Card className="border-2 border-taco-black bg-white mb-8">
        <CardHeader className="border-b-2 border-taco-black">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 bg-gradient-to-br from-brand-orange-500 to-brand-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
              {user.pfp.url ? (
                <img
                  src={user.pfp.url}
                  alt={user.displayName}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <User className="w-10 h-10 text-white" />
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="taco-subheading text-taco-black truncate">
                  {user.displayName}
                </h1>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`https://warpcast.com/${user.username}`, '_blank')}
                  className="border-2 border-taco-black"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  @{user.username}
                </Button>
              </div>
              
              {user.profile.bio.text && (
                <p className="taco-ui-text text-taco-dark-grey mb-3">
                  {user.profile.bio.text}
                </p>
              )}

              {/* Social Stats */}
              <div className="flex gap-4 text-sm">
                <span className="taco-ui-text text-taco-dark-grey">
                  <strong>{user.followerCount}</strong> followers
                </span>
                <span className="taco-ui-text text-taco-dark-grey">
                  <strong>{user.followingCount}</strong> following
                </span>
                <span className="taco-ui-text text-taco-dark-grey">
                  fid: <strong>{user.fid}</strong>
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Stats */}
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 border-2 border-taco-black bg-taco-light-grey">
              <div className="text-2xl font-bold text-taco-black">{stats.totalTracks}</div>
              <div className="text-sm text-taco-dark-grey">Tracks</div>
            </div>
            <div className="text-center p-4 border-2 border-taco-black bg-taco-light-grey">
              <div className="text-2xl font-bold text-taco-black">{stats.totalPlays}</div>
              <div className="text-sm text-taco-dark-grey">Total Plays</div>
            </div>
            <div className="text-center p-4 border-2 border-taco-black bg-taco-light-grey">
              <div className="text-2xl font-bold text-taco-black">
                {formatTotalDuration(stats.totalDuration)}
              </div>
              <div className="text-sm text-taco-dark-grey">Total Duration</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs defaultValue="tracks" className="w-full">
        <TabsList className="grid w-full grid-cols-2 border-2 border-taco-black">
          <TabsTrigger value="tracks" className="border-r-2 border-taco-black">
            Your Tracks
          </TabsTrigger>
          <TabsTrigger value="settings">
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Tracks Tab */}
        <TabsContent value="tracks" className="mt-6">
          <div className="space-y-4">
            {!userTracks ? (
              <Card className="border-2 border-taco-black">
                <CardContent className="p-8 text-center">
                  <Music className="w-12 h-12 text-taco-dark-grey mx-auto mb-4" />
                  <h3 className="taco-subheading text-taco-black mb-2">Loading tracks...</h3>
                </CardContent>
              </Card>
            ) : userTracks.length === 0 ? (
              <Card className="border-2 border-taco-black">
                <CardContent className="p-8 text-center">
                  <Music className="w-12 h-12 text-taco-dark-grey mx-auto mb-4" />
                  <h3 className="taco-subheading text-taco-black mb-2">No tracks yet</h3>
                  <p className="taco-ui-text text-taco-dark-grey">
                    Upload your first track to get started!
                  </p>
                </CardContent>
              </Card>
            ) : (
              userTracks.map((track) => (
                <Card 
                  key={track._id}
                  className={`border-2 transition-all ${
                    currentTrack?._id === track._id 
                      ? 'border-brand-orange-500 bg-brand-orange-50' 
                      : 'border-taco-black bg-white'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Play Button */}
                      <Button
                        size="sm"
                        onClick={() => handleTrackPlay(track)}
                        className={`w-12 h-12 rounded-full ${
                          currentTrack?._id === track._id && isPlaying
                            ? 'bg-brand-orange-500 hover:bg-brand-orange-600' 
                            : 'bg-taco-black hover:bg-taco-dark-grey'
                        }`}
                      >
                        {currentTrack?._id === track._id && isPlaying ? (
                          <Pause className="w-5 h-5 text-white" />
                        ) : (
                          <Play className="w-5 h-5 text-white" />
                        )}
                      </Button>

                      {/* Track Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="taco-ui-text font-bold text-taco-black truncate">
                          {track.title}
                        </h3>
                        
                        <div className="flex items-center gap-4 mt-1 text-sm text-taco-dark-grey">
                          {track.duration && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatDuration(track.duration)}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Hash className="w-3 h-3" />
                            <span>{track.playCount} plays</span>
                          </div>
                          <span>{formatCastTimestamp(new Date(track.uploadedAt).toISOString())}</span>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          {track.genre && (
                            <Badge variant="outline" className="text-xs border-taco-black">
                              {track.genre}
                            </Badge>
                          )}
                          {track.isEncrypted && (
                            <Badge variant="outline" className="text-xs border-taco-black">
                              🔒 Encrypted
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyTrackLink(track)}
                          className="border-2 border-taco-black"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => shareToFarcaster(track)}
                          className="border-2 border-taco-black"
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-6">
          <Card className="border-2 border-taco-black">
            <CardHeader className="border-b-2 border-taco-black">
              <CardTitle className="taco-subheading text-taco-black">
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 border-2 border-taco-black bg-taco-light-grey">
                <div>
                  <h4 className="taco-ui-text font-bold text-taco-black">Export Data</h4>
                  <p className="taco-ui-text text-taco-dark-grey text-sm">
                    Download a backup of your tracks and profile data
                  </p>
                </div>
                <Button
                  onClick={exportData}
                  className="taco-button"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>

              <div className="p-4 border-2 border-taco-black bg-yellow-50">
                <h4 className="taco-ui-text font-bold text-taco-black mb-2">Storage Info</h4>
                <div className="space-y-1 text-sm text-taco-dark-grey">
                  <p>• Profile data: Synced across all your devices</p>
                  <p>• Audio files: Stored on IPFS (permanent)</p>
                  <p>• Track metadata: Stored in our database (permanent)</p>
                  <p>• Your tracks are backed up and accessible anywhere</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};