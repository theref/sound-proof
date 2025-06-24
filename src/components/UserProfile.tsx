import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrackCard } from "@/components/TrackCard";
import { User, Music, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AccessRule } from "@/types/access-rules";
import { AddressDisplay } from "@/components/AddressDisplay";

interface UserProfileProps {
  userAddress: string;
}

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
}

interface UserData {
  id: string;
  display_name: string | null;
  created_at: string;
}

export const UserProfile = ({ userAddress }: UserProfileProps) => {
  const [userTracks, setUserTracks] = useState<Track[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserData();
    fetchUserTracks();
  }, [userAddress]);

  const fetchUserData = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userAddress)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user data:', error);
        throw error;
      }

      setUserData(data);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const fetchUserTracks = async () => {
    try {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('uploader', userAddress)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user tracks:', error);
        throw error;
      }

      const formattedTracks: Track[] = data.map(track => {
        const accessRule = track.access_rule as unknown as AccessRule;
        return {
          id: track.id,
          title: track.title,
          artist: track.uploader.slice(0, 6) + '...' + track.uploader.slice(-4),
          duration: "Unknown",
          uploadedAt: new Date(track.created_at).toLocaleDateString(),
          accessCondition: formatAccessCondition(accessRule),
          isEncrypted: accessRule.type !== "public",
          canPlay: true, // User can always play their own tracks
          cid: track.cid,
        };
      });

      setUserTracks(formattedTracks);
    } catch (error) {
      console.error('Failed to fetch user tracks:', error);
      toast({
        title: "Failed to load tracks",
        description: "Unable to fetch your tracks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatAccessCondition = (accessRule: AccessRule): string => {
    if (accessRule.type === "public") return "Public";
    if (accessRule.type === "erc20") return `ERC20 > ${accessRule.minBalance}`;
    if (accessRule.type === "nft") return "NFT Holder";
    return "Unknown";
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-2 border-taco-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <Card className="border-2 border-taco-black bg-white">
        <CardHeader className="border-b-2 border-taco-black">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-taco-black rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="taco-headline text-taco-black mb-2">
                <AddressDisplay 
                  address={userAddress}
                  className="taco-headline text-taco-black"
                />
              </CardTitle>
              <div className="flex items-center gap-6 taco-ui-text text-taco-dark-grey">
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  <span>{userTracks.length} TRACKS</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>VERIFIED WALLET</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <div>
        <h2 className="taco-subheading text-taco-black mb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-taco-black rounded-full flex items-center justify-center">
            <Music className="w-5 h-5 text-white" />
          </div>
          MY UPLOADS
        </h2>
        
        <div className="grid gap-4">
          {userTracks.map((track) => (
            <TrackCard key={track.id} track={track} />
          ))}
        </div>
        
        {userTracks.length === 0 && (
          <Card className="border-2 border-taco-black bg-white">
            <CardContent className="text-center py-16">
              <div className="w-16 h-16 bg-taco-light-grey rounded-full flex items-center justify-center mx-auto mb-6">
                <Music className="w-8 h-8 text-taco-dark-grey" />
              </div>
              <h3 className="taco-subheading text-taco-black mb-3">NO TRACKS UPLOADED YET</h3>
              <p className="taco-ui-text text-taco-dark-grey">
                UPLOAD YOUR FIRST ENCRYPTED TRACK TO GET STARTED
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
