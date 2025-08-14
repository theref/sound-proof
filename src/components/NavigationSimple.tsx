import { Button } from "@/components/ui/button";
import { Music, Upload, User, LogOut, ExternalLink } from "lucide-react";
import { useFarcasterAuth } from "@/hooks/useFarcasterAuth";
import { ThemeToggle } from "@/components/ThemeToggle";

interface NavigationSimpleProps {
  activeView: "feed" | "upload" | "profile";
  onViewChange: (view: "feed" | "upload" | "profile") => void;
  userAddress: string; // FID as string (for compatibility)
  onDisconnect: () => void;
}

export const NavigationSimple = ({
  activeView,
  onViewChange,
  onDisconnect
}: NavigationSimpleProps) => {
  const { user, isConnected } = useFarcasterAuth();

  return (
    <nav className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <Music className="w-5 h-5 text-accent-foreground" />
            </div>
            <h1 className="font-mono font-bold text-foreground text-lg">SoundProof</h1>
          </div>
          
          {/* Navigation */}
          {isConnected && user && (
            <div className="flex items-center gap-2">
              <Button 
                variant={activeView === "feed" ? "default" : "ghost"} 
                size="sm" 
                onClick={() => onViewChange("feed")}
                className="font-mono"
              >
                <Music className="w-4 h-4 mr-2" />
                Feed
              </Button>
              
              <Button 
                variant={activeView === "upload" ? "default" : "ghost"} 
                size="sm" 
                onClick={() => onViewChange("upload")}
                className="font-mono"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
              
              <Button 
                variant={activeView === "profile" ? "default" : "ghost"} 
                size="sm" 
                onClick={() => onViewChange("profile")}
                className="font-mono"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </div>
          )}

          {/* User Info & Actions */}
          {isConnected && user ? (
            <div className="flex items-center gap-3">
              {/* User Profile */}
              <div className="flex items-center gap-2">
                {user.pfp.url && (
                  <img
                    src={user.pfp.url}
                    alt={user.displayName}
                    className="w-8 h-8 rounded-full border border-border"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                )}
                <div className="text-sm font-mono">
                  <div className="font-bold text-foreground">{user.displayName}</div>
                  <div className="text-muted-foreground">@{user.username}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`https://warpcast.com/${user.username}`, '_blank')}
                  className="font-mono"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDisconnect}
                  className="font-mono text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <span className="text-sm font-mono text-muted-foreground">Not signed in</span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};