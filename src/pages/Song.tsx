
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, User, Clock, ArrowLeft, Shield, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePlayback } from "@/contexts/PlaybackContext";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { AddressDisplay } from "@/components/AddressDisplay";

interface Track {
  id: string;
  title: string;
  uploader: string;
  cid: string;
  access_rule: any;
  created_at: string;
}

const Song = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentTrack, isPlaying, playTrack, pauseTrack, resumeTrack, isLoading: playerLoading } = usePlayback();
  const { signer, siweMessage } = useWalletAuth();
  const [track, setTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrack = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('tracks')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching track:', error);
          toast({
            title: "Track not found",
            description: "The requested track could not be found.",
            variant: "destructive",
          });
          return;
        }

        setTrack(data);
      } catch (error) {
        console.error('Error fetching track:', error);
        toast({
          title: "Error",
          description: "Failed to load track information.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrack();
  }, [id, toast]);

  const handlePlayPause = async () => {
    if (!track) return;

    const isCurrentTrack = currentTrack?.id === track.id;

    if (isCurrentTrack && isPlaying) {
      pauseTrack();
    } else if (isCurrentTrack && !isPlaying) {
      resumeTrack();
    } else {
      // Play new track
      const trackData = {
        id: track.id,
        title: track.title,
        artist: track.uploader.slice(0, 8) + '...' + track.uploader.slice(-6),
        duration: "Unknown",
        uploadedAt: new Date(track.created_at).toLocaleDateString(),
        accessCondition: track.access_rule?.type || 'Unknown',
        isEncrypted: track.access_rule?.type !== "public",
        canPlay: true,
        cid: track.cid,
      };
      
      await playTrack(trackData, track.cid, signer, siweMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="taco-body text-black">Loading track...</div>
        </div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="taco-headline text-black mb-4">Track Not Found</div>
          <div className="taco-body text-taco-dark-grey mb-6">
            The track you're looking for doesn't exist or has been removed.
          </div>
          <Button 
            onClick={() => navigate('/')}
            className="taco-button"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const isCurrentTrack = currentTrack?.id === track.id;
  const isTrackPlaying = isCurrentTrack && isPlaying;
  const isEncrypted = track.access_rule?.type && track.access_rule.type !== 'public';

  return (
    <div className="min-h-screen bg-white text-black pb-24">
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6 taco-ui-text text-taco-dark-grey hover:text-black hover:bg-taco-light-grey"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="w-64 h-64 mx-auto mb-8 bg-taco-light-grey border-2 border-black rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
                <div className="taco-ui-text text-taco-dark-grey">Audio Track</div>
              </div>
            </div>
            
            <h1 className="taco-headline text-black mb-4">
              {track.title}
            </h1>
            
            <AddressDisplay 
              address={track.uploader}
              className="taco-body text-taco-dark-grey mb-8"
              clickable={true}
            />

            {/* Play Button */}
            <Button
              onClick={handlePlayPause}
              disabled={playerLoading}
              size="lg"
              className="w-20 h-20 rounded-full taco-button-accent text-2xl"
            >
              {playerLoading ? (
                <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : isTrackPlaying ? (
                <Pause className="w-10 h-10" />
              ) : (
                <Play className="w-10 h-10 ml-1" />
              )}
            </Button>
          </div>

          {/* Track Details */}
          <Card className="border-2 border-black bg-white mb-8">
            <CardHeader className="border-b-2 border-black">
              <CardTitle className="taco-subheading text-black">Track Information</CardTitle>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-taco-dark-grey" />
                    <div>
                      <div className="taco-ui-text text-taco-dark-grey text-sm">Uploader</div>
                      <AddressDisplay 
                        address={track.uploader}
                        className="taco-ui-text text-black font-bold"
                        clickable={true}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-taco-dark-grey" />
                    <div>
                      <div className="taco-ui-text text-taco-dark-grey text-sm">Uploaded</div>
                      <div className="taco-ui-text text-black font-bold">
                        {new Date(track.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-2 border-black rounded-lg p-4 bg-taco-light-grey">
                  <h3 className="taco-ui-text text-black font-bold mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Access Control
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-2">
                    {isEncrypted && <Lock className="w-4 h-4 text-black" />}
                    <Badge 
                      variant="secondary" 
                      className={`${isEncrypted ? 'bg-taco-neon text-black border-black' : 'bg-white text-black border-black'} border-2`}
                    >
                      {track.access_rule?.type || 'Public'}
                    </Badge>
                  </div>
                  
                  {isEncrypted && (
                    <div className="taco-ui-text text-taco-dark-grey text-sm">
                      This track is encrypted and requires specific conditions to access.
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CID Information */}
          <Card className="border-2 border-black bg-white">
            <CardHeader className="border-b-2 border-black">
              <CardTitle className="taco-subheading text-black">Technical Details</CardTitle>
            </CardHeader>
            
            <CardContent className="p-6">
              <div>
                <div className="taco-ui-text text-taco-dark-grey text-sm mb-1">IPFS Content ID</div>
                <div className="taco-ui-text text-black font-mono text-sm break-all bg-taco-light-grey p-3 border border-taco-dark-grey rounded">
                  {track.cid}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Song;
