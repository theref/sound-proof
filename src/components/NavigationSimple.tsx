import { Button } from "@/components/ui/button";
import { Music, Upload, User, LogOut, ExternalLink } from "lucide-react";
import { useFarcasterAuth } from "@/hooks/useFarcasterAuth";

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
    <nav className="border-b-2 border-taco-black bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-orange-500 to-brand-orange-600 rounded-full flex items-center justify-center">
              <Music className="w-5 h-5 text-white" />
            </div>
            <h1 className="taco-subheading text-taco-black">SoundProof</h1>
          </div>
          
          {/* Navigation */}
          {isConnected && user && (
            <div className="flex items-center gap-2">
              <Button 
                variant={activeView === "feed" ? "default" : "ghost"} 
                size="sm" 
                onClick={() => onViewChange("feed")}
                className={`taco-ui-text ${
                  activeView === "feed" 
                    ? "bg-brand-orange-500 text-white hover:bg-brand-orange-600" 
                    : "hover:bg-brand-orange-50 hover:text-brand-orange-600"
                }`}
              >
                <Music className="w-4 h-4 mr-2" />
                Feed
              </Button>
              
              <Button 
                variant={activeView === "upload" ? "default" : "ghost"} 
                size="sm" 
                onClick={() => onViewChange("upload")}
                className={`taco-ui-text ${
                  activeView === "upload" 
                    ? "bg-brand-orange-500 text-white hover:bg-brand-orange-600" 
                    : "hover:bg-brand-orange-50 hover:text-brand-orange-600"
                }`}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
              
              <Button 
                variant={activeView === "profile" ? "default" : "ghost"} 
                size="sm" 
                onClick={() => onViewChange("profile")}
                className={`taco-ui-text ${
                  activeView === "profile" 
                    ? "bg-brand-orange-500 text-white hover:bg-brand-orange-600" 
                    : "hover:bg-brand-orange-50 hover:text-brand-orange-600"
                }`}
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
                    className="w-8 h-8 rounded-full border-2 border-taco-black"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                )}
                <div className="text-sm">
                  <div className="font-bold text-taco-black">{user.displayName}</div>
                  <div className="text-taco-dark-grey">@{user.username}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`https://warpcast.com/${user.username}`, '_blank')}
                  className="border-2 border-taco-black hover:bg-brand-orange-50 hover:border-brand-orange-500"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDisconnect}
                  className="border-2 border-taco-black text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-taco-dark-grey">Not signed in</span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};