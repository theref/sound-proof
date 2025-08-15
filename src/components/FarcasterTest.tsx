import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getFarcasterClient } from "@/integrations/farcaster/client";
import { toast } from "sonner";
import { User, Search, Loader2 } from "lucide-react";
import type { FarcasterUser } from "@/integrations/farcaster/types";

export const FarcasterTest = () => {
  const [username, setUsername] = useState("");
  const [userData, setUserData] = useState<FarcasterUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testFarcasterLookup = async () => {
    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }

    setIsLoading(true);
    try {
      const farcasterClient = getFarcasterClient();
      const user = await farcasterClient.getUserByUsername(username.trim());
      
      if (user) {
        setUserData(user);
        toast.success(`Found user @${user.username}!`);
      } else {
        toast.error("User not found");
        setUserData(null);
      }
    } catch (error) {
      console.error("Farcaster lookup error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to lookup user");
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto border-2 border-taco-black">
        <CardHeader className="border-b-2 border-taco-black">
          <CardTitle className="taco-subheading text-taco-black flex items-center gap-2">
            <User className="w-6 h-6" />
            Farcaster API Test
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          <div className="flex gap-2">
            <Input
              placeholder="Enter Farcaster username (without @)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border-2 border-taco-black"
              onKeyDown={(e) => e.key === 'Enter' && testFarcasterLookup()}
            />
            <Button
              onClick={testFarcasterLookup}
              disabled={isLoading}
              className="taco-button bg-brand-orange-500 hover:bg-brand-orange-600"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>

          {userData && (
            <div className="space-y-4 p-4 border-2 border-taco-black bg-taco-light-grey">
              <div className="flex items-center gap-4">
                {userData.pfp.url && (
                  <img
                    src={userData.pfp.url}
                    alt={userData.displayName}
                    className="w-16 h-16 rounded-full border-2 border-taco-black"
                  />
                )}
                <div>
                  <h3 className="taco-subheading text-taco-black">
                    {userData.displayName}
                  </h3>
                  <p className="taco-ui-text text-taco-dark-grey">
                    @{userData.username} • fid: {userData.fid}
                  </p>
                </div>
              </div>

              {userData.profile.bio.text && (
                <p className="taco-ui-text text-taco-black">
                  {userData.profile.bio.text}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-2 bg-white border border-taco-black">
                  <div className="font-bold text-taco-black">{userData.followerCount}</div>
                  <div className="text-taco-dark-grey">Followers</div>
                </div>
                <div className="text-center p-2 bg-white border border-taco-black">
                  <div className="font-bold text-taco-black">{userData.followingCount}</div>
                  <div className="text-taco-dark-grey">Following</div>
                </div>
              </div>

              {userData.verifications.length > 0 && (
                <div>
                  <h4 className="taco-ui-text font-bold text-taco-black mb-2">
                    Verified Addresses:
                  </h4>
                  <div className="space-y-1">
                    {userData.verifications.map((addr, index) => (
                      <code key={index} className="block text-xs text-taco-dark-grey bg-white p-2 border border-taco-black font-mono">
                        {addr}
                      </code>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="text-sm text-taco-dark-grey bg-yellow-50 p-4 border-2 border-yellow-300">
            <p className="font-bold mb-2">💡 Test Instructions:</p>
            <ol className="space-y-1 list-decimal list-inside">
              <li>Enter a Farcaster username (e.g., "dwr", "vitalik", "jamiis")</li>
              <li>Click search to test the Farcaster API</li>
              <li>Verify the user data loads correctly</li>
              <li>Check browser console for any errors</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};