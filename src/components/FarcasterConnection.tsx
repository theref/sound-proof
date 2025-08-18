import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Shield, Zap, Smartphone } from "lucide-react";
import { useState } from "react";
import { useFarcasterAuth } from "@/hooks/useFarcasterAuth";

interface FarcasterConnectionProps {
  onConnect: () => Promise<void>;
}

export const FarcasterConnection = ({ onConnect }: FarcasterConnectionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { isMiniapp, miniappUser, authMethod } = useFarcasterAuth();

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await onConnect();
    } finally {
      setIsLoading(false);
    }
  };

  // Show different content for miniapp vs standalone
  const isInMiniapp = isMiniapp && miniappUser;
  const title = isInMiniapp ? "Welcome to SoundProof" : "Sign In with Farcaster";
  const description = isInMiniapp 
    ? "You're already signed in through Farcaster. Start discovering music!" 
    : "Connect with your Farcaster identity to discover music through your social network";
  const icon = isInMiniapp ? Smartphone : User;
  const IconComponent = icon;

  return (
    <Card className="w-full max-w-md border-2 border-taco-black bg-white">
      <CardHeader className="text-center border-b-2 border-taco-black">
        <div className="w-16 h-16 bg-gradient-to-br from-brand-orange-500 to-brand-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <IconComponent className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="taco-subheading text-taco-black mb-2">
          {title}
        </CardTitle>
        <p className="taco-ui-text text-taco-dark-grey">
          {description}
        </p>
        {isInMiniapp && miniappUser && (
          <p className="taco-ui-text text-brand-orange-600 font-semibold">
            @{miniappUser.username || `FID:${miniappUser.fid}`}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 border-2 border-taco-black bg-taco-light-grey">
            <User className="w-5 h-5 text-taco-black flex-shrink-0" />
            <div>
              <p className="taco-ui-text font-bold text-taco-black text-sm">Social Discovery</p>
              <p className="taco-ui-text text-taco-dark-grey text-xs">Find music through your Farcaster network</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 border-2 border-taco-black bg-taco-light-grey">
            <Shield className="w-5 h-5 text-taco-black flex-shrink-0" />
            <div>
              <p className="taco-ui-text font-bold text-taco-black text-sm">Secure & Private</p>
              <p className="taco-ui-text text-taco-dark-grey text-xs">Your Farcaster identity verifies ownership</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 border-2 border-taco-black bg-taco-light-grey">
            <Zap className="w-5 h-5 text-taco-black flex-shrink-0" />
            <div>
              <p className="taco-ui-text font-bold text-taco-black text-sm">Native Integration</p>
              <p className="taco-ui-text text-taco-dark-grey text-xs">Share playlists as Farcaster casts</p>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={handleConnect}
          disabled={isLoading || isInMiniapp}
          className="w-full taco-button py-4 text-lg bg-gradient-to-r from-brand-orange-500 to-brand-orange-600 hover:from-brand-orange-700 hover:to-brand-orange-800 border-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-3" />
              <span className="taco-ui-text text-white">connecting...</span>
            </>
          ) : isInMiniapp ? (
            <>
              <Smartphone className="w-5 h-5 mr-3" />
              <span className="taco-ui-text text-white">ready to explore</span>
            </>
          ) : (
            <>
              <User className="w-5 h-5 mr-3" />
              <span className="taco-ui-text text-white">sign in with farcaster</span>
            </>
          )}
        </Button>
        
        {!isInMiniapp && (
          <p className="taco-ui-text text-taco-dark-grey text-center text-sm">
            New to Farcaster?{" "}
            <a 
              href="https://warpcast.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-brand-orange-500 font-bold hover:text-brand-orange-600 transition-colors underline"
            >
              Join here
            </a>
          </p>
        )}
        
        {isInMiniapp && (
          <p className="taco-ui-text text-taco-dark-grey text-center text-sm">
            Running as Farcaster miniapp - automatic authentication enabled
          </p>
        )}
      </CardContent>
    </Card>
  );
};