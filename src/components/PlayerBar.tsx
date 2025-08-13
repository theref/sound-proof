
import { usePlayback } from "@/contexts/PlaybackContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

export const PlayerBar = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isLoading,
    pauseTrack,
    resumeTrack,
    seekTo,
    setVolume,
  } = usePlayback();

  if (!currentTrack) return null;

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (value: number[]) => {
    seekTo(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pauseTrack();
    } else {
      resumeTrack();
    }
  };

  return (
    <Card className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-black backdrop-blur-lg rounded-none border-x-0 border-b-0">
      <div className="flex items-center gap-4 p-4">
        {/* Track Info */}
        <div className="flex-shrink-0 min-w-0 w-64">
          <h4 className="text-black font-bold truncate taco-body">{currentTrack.title}</h4>
          <p className="taco-ui-text text-taco-dark-grey truncate">
            {currentTrack.artist}
          </p>
        </div>

        {/* Playback Controls */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <Button
            onClick={togglePlayPause}
            disabled={isLoading}
            size="sm"
            className="w-12 h-12 rounded-full taco-button-accent"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </Button>

          {/* Progress Bar */}
          <div className="flex items-center gap-2 w-full max-w-lg">
            <span className="taco-ui-text text-gray-600 min-w-[40px]">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="flex-1"
            />
            <span className="taco-ui-text text-gray-600 min-w-[40px]">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2 w-32">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setVolume(volume > 0 ? 0 : 1)}
            className="hover:bg-gray-100"
          >
            {volume === 0 ? (
              <VolumeX className="w-4 h-4 text-gray-600" />
            ) : (
              <Volume2 className="w-4 h-4 text-gray-600" />
            )}
          </Button>
          <Slider
            value={[volume * 100]}
            max={100}
            step={1}
            onValueChange={handleVolumeChange}
            className="flex-1"
          />
        </div>
      </div>
    </Card>
  );
};
