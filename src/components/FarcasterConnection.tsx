import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Shield, Zap } from "lucide-react";
import { useState } from "react";

interface FarcasterConnectionProps {
  onConnect: () => Promise<void>;
}

export const FarcasterConnection = ({ onConnect }: FarcasterConnectionProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await onConnect();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border border-border bg-card">
      <CardHeader className="text-center border-b border-border">
        <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-accent-foreground" />
        </div>
        <CardTitle className="font-mono font-bold text-card-foreground mb-2 text-xl">
          Sign In with Farcaster
        </CardTitle>
        <p className="font-mono text-muted-foreground">
          Connect with your Farcaster identity to discover music through your social network
        </p>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 border border-border bg-secondary">
            <User className="w-5 h-5 text-accent flex-shrink-0" />
            <div>
              <p className="font-mono font-bold text-secondary-foreground text-sm">Social Discovery</p>
              <p className="font-mono text-muted-foreground text-xs">Find music through your Farcaster network</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 border border-border bg-secondary">
            <Shield className="w-5 h-5 text-accent flex-shrink-0" />
            <div>
              <p className="font-mono font-bold text-secondary-foreground text-sm">Secure & Private</p>
              <p className="font-mono text-muted-foreground text-xs">Your Farcaster identity verifies ownership</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 border border-border bg-secondary">
            <Zap className="w-5 h-5 text-accent flex-shrink-0" />
            <div>
              <p className="font-mono font-bold text-secondary-foreground text-sm">Native Integration</p>
              <p className="font-mono text-muted-foreground text-xs">Share playlists as Farcaster casts</p>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={handleConnect}
          disabled={isLoading}
          className="w-full font-mono font-bold py-4 text-lg bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-3" />
              CONNECTING...
            </>
          ) : (
            <>
              <User className="w-5 h-5 mr-3" />
              SIGN IN WITH FARCASTER
            </>
          )}
        </Button>
        
        <p className="font-mono text-muted-foreground text-center text-sm">
          New to Farcaster?{" "}
          <a 
            href="https://warpcast.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-accent font-bold hover:text-accent/80 transition-colors underline"
          >
            Join here
          </a>
        </p>
      </CardContent>
    </Card>
  );
};