import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Search, Music, User, Clock, Hash } from "lucide-react";
import { trackStorage, type StoredTrack } from '@/utils/localStorage';
import { searchMetadata } from '@/services/ipfsMetadata';
import { usePlayback } from '@/contexts/PlaybackContext';
import { useFarcasterAuth } from '@/hooks/useFarcasterAuth';
import { formatCastTimestamp } from '@/integrations/farcaster/utils';

export const MusicFeedSimple = () => {
  const { user } = useFarcasterAuth();
  const { currentTrack, isPlaying, playTrack, pauseTrack } = usePlayback();
  const [tracks, setTracks] = useState<StoredTrack[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<StoredTrack[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("");

  // Load tracks from local storage
  useEffect(() => {
    const loadTracks = () => {
      const allTracks = trackStorage.getAllTracks();
      setTracks(allTracks);
      setFilteredTracks(allTracks);
    };

    loadTracks();

    // Refresh every 30 seconds to pick up new tracks
    const interval = setInterval(loadTracks, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter tracks based on search and genre
  useEffect(() => {
    let filtered = tracks;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = searchMetadata(filtered, searchQuery);
    }

    // Apply genre filter
    if (selectedGenre) {
      filtered = filtered.filter(track => 
        track.genre?.toLowerCase() === selectedGenre.toLowerCase()
      );
    }

    setFilteredTracks(filtered);
  }, [tracks, searchQuery, selectedGenre]);

  // Get unique genres from all tracks
  const availableGenres = Array.from(
    new Set(tracks.map(track => track.genre).filter(Boolean))
  ).sort();

  const handleTrackPlay = (track: StoredTrack) => {
    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        pauseTrack();
      } else {
        playTrack(track as any); // Type conversion for compatibility
      }
    } else {
      playTrack(track as any);
    }
  };

  const formatDuration = (seconds: number = 0): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto border-2 border-taco-black">
          <CardContent className="p-8 text-center">
            <Music className="w-16 h-16 text-taco-dark-grey mx-auto mb-4" />
            <h2 className="taco-subheading text-taco-black mb-2">Welcome to SoundProof</h2>
            <p className="taco-ui-text text-taco-dark-grey">
              Sign in with Farcaster to discover and share amazing music.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="taco-banner text-taco-black mb-2">Music Feed</h1>
        <p className="taco-body text-taco-dark-grey">
          Discover tracks from the SoundProof community
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-taco-dark-grey" />
            <Input
              placeholder="Search tracks, artists, or genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-2 border-taco-black"
            />
          </div>
          <Button
            variant={selectedGenre ? "default" : "outline"}
            onClick={() => setSelectedGenre("")}
            className="border-2 border-taco-black"
          >
            All Genres
          </Button>
        </div>

        {/* Genre Filter Badges */}
        {availableGenres.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {availableGenres.map((genre) => (
              <Badge
                key={genre}
                variant={selectedGenre === genre ? "default" : "outline"}
                className={`cursor-pointer border-2 ${
                  selectedGenre === genre 
                    ? 'border-brand-orange-500 bg-brand-orange-500' 
                    : 'border-taco-black'
                }`}
                onClick={() => setSelectedGenre(selectedGenre === genre ? "" : genre)}
              >
                {genre}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Tracks List */}
      <div className="space-y-4">
        {filteredTracks.length === 0 ? (
          <Card className="border-2 border-taco-black">
            <CardContent className="p-8 text-center">
              <Music className="w-12 h-12 text-taco-dark-grey mx-auto mb-4" />
              <h3 className="taco-subheading text-taco-black mb-2">
                {tracks.length === 0 ? "No tracks yet" : "No tracks found"}
              </h3>
              <p className="taco-ui-text text-taco-dark-grey">
                {tracks.length === 0 
                  ? "Upload your first track to get started!"
                  : "Try adjusting your search or filters."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTracks.map((track) => (
            <Card 
              key={track.id} 
              className={`border-2 transition-all hover:shadow-md ${
                currentTrack?.id === track.id 
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
                      currentTrack?.id === track.id && isPlaying
                        ? 'bg-brand-orange-500 hover:bg-brand-orange-600' 
                        : 'bg-taco-black hover:bg-taco-dark-grey'
                    }`}
                  >
                    {currentTrack?.id === track.id && isPlaying ? (
                      <Pause className="w-5 h-5 text-white" />
                    ) : (
                      <Play className="w-5 h-5 text-white" />
                    )}
                  </Button>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="taco-ui-text font-bold text-taco-black truncate">
                          {track.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <User className="w-4 h-4 text-taco-dark-grey flex-shrink-0" />
                          <p className="taco-ui-text text-taco-dark-grey truncate">
                            {track.artist} (@{track.uploaderUsername})
                          </p>
                        </div>
                        
                        {/* Metadata */}
                        <div className="flex items-center gap-4 mt-2 text-sm text-taco-dark-grey">
                          {track.duration && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatDuration(track.duration)}</span>
                            </div>
                          )}
                          {track.playCount > 0 && (
                            <div className="flex items-center gap-1">
                              <Hash className="w-3 h-3" />
                              <span>{track.playCount} plays</span>
                            </div>
                          )}
                          <span>{formatCastTimestamp(track.uploadedAt)}</span>
                        </div>

                        {/* Description */}
                        {track.description && (
                          <p className="taco-ui-text text-taco-dark-grey text-sm mt-2 line-clamp-2">
                            {track.description}
                          </p>
                        )}

                        {/* Tags */}
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
                          {track.accessRule.type === 'public' && (
                            <Badge variant="outline" className="text-xs border-taco-black">
                              🌍 Public
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Cover Image */}
                      {track.coverImageCid && (
                        <div className="w-16 h-16 bg-taco-light-grey border-2 border-taco-black flex-shrink-0 ml-4">
                          <img
                            src={`https://gateway.lighthouse.storage/ipfs/${track.coverImageCid}`}
                            alt={`${track.title} cover`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Stats Footer */}
      {tracks.length > 0 && (
        <div className="mt-8 text-center">
          <p className="taco-ui-text text-taco-dark-grey">
            Showing {filteredTracks.length} of {tracks.length} tracks
          </p>
        </div>
      )}
    </div>
  );
};