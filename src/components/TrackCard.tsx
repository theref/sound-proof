
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Clock, Shield } from "lucide-react";
import { usePlayback } from "@/contexts/PlaybackContext";
import { AddressDisplay } from "@/components/AddressDisplay";
import { useNavigate } from "react-router-dom";

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  uploadedAt: string;
  accessCondition: string;
  isEncrypted: boolean;
  canPlay: boolean;
  cid?: string;
}

interface TrackCardProps {
  track: Track;
}

export const TrackCard = ({ track }: TrackCardProps) => {
  const { currentTrack, isPlaying, playTrack, pauseTrack, resumeTrack, isLoading: playerLoading } = usePlayback();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const isCurrentTrack = currentTrack?.id === track.id;
  const isTrackPlaying = isCurrentTrack && isPlaying;

  const handlePlayPause = async () => {
    if (!track.canPlay) return;

    setIsLoading(true);
    try {
      if (isCurrentTrack && isPlaying) {
        pauseTrack();
      } else if (isCurrentTrack && !isPlaying) {
        resumeTrack();
      } else {
        await playTrack(track, track.cid);
      }
    } catch (error) {
      console.error("Failed to play track:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTitleClick = () => {
    navigate(`/song/${track.id}`);
  };

  return (
    <Card className="border-2 border-taco-black bg-white hover:bg-taco-light-grey transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Button
              onClick={handlePlayPause}
              disabled={!track.canPlay || isLoading || playerLoading}
              size="sm"
              className={`w-12 h-12 rounded-full ${track.canPlay ? "taco-button-accent" : "bg-gray-300 cursor-not-allowed"}`}
            >
              {isLoading || playerLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : isTrackPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </Button>

            <div className="flex-1 min-w-0">
              <h3 
                className="taco-subheading text-taco-black mb-1 truncate cursor-pointer hover:underline" 
                onClick={handleTitleClick}
              >
                {track.title}
              </h3>
              <div className="flex items-center gap-4 taco-ui-text text-taco-dark-grey">
                <AddressDisplay 
                  address={track.artist} 
                  className="hover:text-taco-black transition-colors"
                  clickable={true}
                />
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{track.duration}</span>
                </div>
                <span>{track.uploadedAt}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge 
              variant="secondary" 
              className="taco-ui-text bg-taco-light-grey text-taco-black border border-taco-black"
            >
              {track.accessCondition}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
