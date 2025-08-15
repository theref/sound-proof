import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrackCard } from "@/components/TrackCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AccessRule } from "@/types/access-rules";

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  uploadedAt: string;
  accessCondition: string;
  isEncrypted: boolean;
  canPlay: boolean;
  cid: string;
  access_rule: AccessRule;
  accessRule?: any;
}

export const MusicFeed = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    try {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tracks:', error);
        throw error;
      }

      const formattedTracks: Track[] = data.map(track => {
        const accessRule = track.access_rule as unknown as AccessRule;
        const isEncrypted = accessRule.type !== "public";
        
        return {
          id: track.id,
          title: track.title,
          artist: track.uploader,
          duration: "3:24",
          uploadedAt: new Date(track.created_at).toISOString(),
          accessCondition: formatAccessCondition(accessRule),
          isEncrypted: isEncrypted,
          canPlay: true, // We'll handle access validation during playback
          cid: track.cid,
          access_rule: accessRule,
          accessRule: accessRule,
        };
      });

      setTracks(formattedTracks);
    } catch (error) {
      console.error('Failed to fetch tracks:', error);
      toast({
        title: "Failed to load tracks",
        description: "Unable to fetch the music feed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatAccessCondition = (accessRule: AccessRule): string => {
    if (accessRule.type === "public") return "Public";
    if (accessRule.type === "erc20") return `erc20 > ${accessRule.minBalance}`;
    if (accessRule.type === "nft") return "nft holder";
    return "Unknown";
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="taco-headline mb-4">
            Global Music Feed
          </h1>
          <p className="taco-body text-taco-dark-grey">
            Discover encrypted tracks from artists around the world
          </p>
        </div>
        
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-taco-black rounded-full animate-spin border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="taco-headline mb-4">
          Global Music Feed
        </h1>
        <p className="taco-body text-taco-dark-grey">
          Discover encrypted tracks from artists around the world
        </p>
      </div>
      
      <div className="grid gap-6">
        {tracks.map((track) => (
          <TrackCard key={track.id} track={track} />
        ))}
      </div>
      
      {tracks.length === 0 && (
        <Card className="border-2 border-taco-black bg-taco-light-grey">
          <CardContent className="text-center py-16">
            <p className="taco-body">
              No tracks uploaded yet. Be the first to share your music!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
