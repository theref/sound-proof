import { Button } from "@/components/ui/button";
import { Music, Upload, User, LogOut } from "lucide-react";
import { TacoLogo } from "./TacoLogo";
import { AddressDisplay } from "@/components/AddressDisplay";

interface NavigationProps {
  activeView: "feed" | "upload" | "profile";
  onViewChange: (view: "feed" | "upload" | "profile") => void;
  userAddress: string;
  onDisconnect: () => void;
}

export const Navigation = ({
  activeView,
  onViewChange,
  userAddress,
  onDisconnect
}: NavigationProps) => {
  return (
    <nav className="border-b-2 border-black bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs text-taco-dark-grey font-mono">built by</span>
            <TacoLogo size="lg" />
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant={activeView === "feed" ? "default" : "ghost"} size="sm" onClick={() => onViewChange("feed")} className={`taco-ui-text ${activeView === "feed" ? "taco-button-accent" : "hover:bg-brand-orange-50"}`}>
              <Music className="w-4 h-4 mr-2" />
              Feed
            </Button>
            <Button variant={activeView === "upload" ? "default" : "ghost"} size="sm" onClick={() => onViewChange("upload")} className={`taco-ui-text ${activeView === "upload" ? "taco-button-accent" : "hover:bg-brand-orange-50"}`}>
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
            <Button variant={activeView === "profile" ? "default" : "ghost"} size="sm" onClick={() => onViewChange("profile")} className={`taco-ui-text ${activeView === "profile" ? "taco-button-accent" : "hover:bg-brand-orange-50"}`}>
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <AddressDisplay 
              address={userAddress} 
              className="taco-ui-text text-gray-600 hover:text-black transition-colors"
              clickable={true}
            />
            <Button variant="ghost" size="sm" onClick={onDisconnect} className="text-gray-600 hover:text-brand-orange-600 hover:bg-brand-orange-50">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
