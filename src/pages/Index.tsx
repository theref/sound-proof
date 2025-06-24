import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WalletConnection } from "@/components/WalletConnection";
import { MusicFeed } from "@/components/MusicFeed";
import { UserProfile } from "@/components/UserProfile";
import { UploadTrack } from "@/components/UploadTrack";
import { Navigation } from "@/components/Navigation";
import { PlayerBar } from "@/components/PlayerBar";
import { PlaybackProvider } from "@/contexts/PlaybackContext";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { Shield, Lock, Globe, Music } from "lucide-react";
const Index = () => {
  const [activeView, setActiveView] = useState<"feed" | "upload" | "profile">("feed");
  const {
    isConnected,
    address,
    connectWallet,
    disconnectWallet,
    isLoading
  } = useWalletAuth();
  const handleWalletConnect = async () => {
    await connectWallet();
  };
  if (!isConnected) {
    return <div className="min-h-screen bg-white grid-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto space-y-16">
            {/* Hero Section */}
            <div className="text-center space-y-6">
              <h1 className="taco-banner text-taco-black">Sound proof</h1>
              <p className="taco-body text-taco-dark-grey max-w-2xl mx-auto">
                Decentralized music sharing with threshold access control encryption. 
                Own your music, control access, preserve privacy.
              </p>
            </div>

            {/* Wallet Connection */}
            <div className="flex justify-center">
              <WalletConnection onConnect={handleWalletConnect} />
            </div>

            {/* About TACo */}
            <Card className="border-2 border-taco-black bg-white">
              <CardHeader className="border-b-2 border-taco-black">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-taco-black rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="taco-subheading text-taco-black">
                    About TACo
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="taco-ui-text text-taco-black">
                  <strong>Threshold Access Control (TACo)</strong> is a decentralized encryption protocol 
                  that enables conditional access to encrypted data without revealing the content to intermediaries.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3 p-4 border border-taco-black bg-taco-light-grey">
                    <Lock className="w-5 h-5 text-taco-black mt-1 flex-shrink-0" />
                    <div>
                      <p className="taco-ui-text font-bold text-taco-black">Conditional Encryption</p>
                      <p className="taco-ui-text text-taco-dark-grey text-sm">Set access rules based on token ownership, time, or custom conditions</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 border border-taco-black bg-taco-light-grey">
                    <Globe className="w-5 h-5 text-taco-black mt-1 flex-shrink-0" />
                    <div>
                      <p className="taco-ui-text font-bold text-taco-black">Decentralized</p>
                      <p className="taco-ui-text text-taco-dark-grey text-sm">No single point of failure or central authority controlling access</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 border border-taco-black bg-taco-light-grey">
                    <Shield className="w-5 h-5 text-taco-black mt-1 flex-shrink-0" />
                    <div>
                      <p className="taco-ui-text font-bold text-taco-black">Privacy-First</p>
                      <p className="taco-ui-text text-taco-dark-grey text-sm">Content remains encrypted until access conditions are met</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About Lighthouse */}
            <Card className="border-2 border-taco-black bg-white">
              <CardHeader className="border-b-2 border-taco-black">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-taco-black rounded-full flex items-center justify-center">
                    <Music className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="taco-subheading text-taco-black">
                    Powered by Lighthouse
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="taco-ui-text text-taco-black">
                  <strong>Lighthouse Storage</strong> provides decentralized file storage on IPFS 
                  with built-in encryption and access control capabilities.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <p className="taco-ui-text font-bold text-taco-black">Key Features:</p>
                    <ul className="space-y-2">
                      <li className="taco-ui-text text-taco-dark-grey flex items-center gap-2">
                        <div className="w-2 h-2 bg-taco-black rounded-full"></div>
                        Perpetual storage on IPFS
                      </li>
                      <li className="taco-ui-text text-taco-dark-grey flex items-center gap-2">
                        <div className="w-2 h-2 bg-taco-black rounded-full"></div>
                        End-to-end encryption
                      </li>
                      <li className="taco-ui-text text-taco-dark-grey flex items-center gap-2">
                        <div className="w-2 h-2 bg-taco-black rounded-full"></div>
                        Token-gated access control
                      </li>
                      <li className="taco-ui-text text-taco-dark-grey flex items-center gap-2">
                        <div className="w-2 h-2 bg-taco-black rounded-full"></div>
                        Immutable content addressing
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <p className="taco-ui-text font-bold text-taco-black">Perfect for:</p>
                    <ul className="space-y-2">
                      <li className="taco-ui-text text-taco-dark-grey flex items-center gap-2">
                        <div className="w-2 h-2 bg-taco-black rounded-full"></div>
                        Independent artists
                      </li>
                      <li className="taco-ui-text text-taco-dark-grey flex items-center gap-2">
                        <div className="w-2 h-2 bg-taco-black rounded-full"></div>
                        Exclusive content drops
                      </li>
                      <li className="taco-ui-text text-taco-dark-grey flex items-center gap-2">
                        <div className="w-2 h-2 bg-taco-black rounded-full"></div>
                        Community-driven releases
                      </li>
                      <li className="taco-ui-text text-taco-dark-grey flex items-center gap-2">
                        <div className="w-2 h-2 bg-taco-black rounded-full"></div>
                        Censorship-resistant distribution
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <div className="text-center">
              <p className="taco-body text-taco-dark-grey mb-6">
                Ready to experience decentralized music?
              </p>
              <Button onClick={handleWalletConnect} className="taco-button px-8 py-4 text-lg">
                <span className="taco-ui-text">GET STARTED</span>
              </Button>
            </div>
          </div>
        </div>
      </div>;
  }
  return <PlaybackProvider>
      <div className="min-h-screen bg-white grid-background text-black pb-24">
        <Navigation activeView={activeView} onViewChange={setActiveView} userAddress={address} onDisconnect={disconnectWallet} />
        
        <main className="container mx-auto px-4 py-8">
          {activeView === "feed" && <MusicFeed />}
          {activeView === "upload" && <UploadTrack userAddress={address} />}
          {activeView === "profile" && <UserProfile userAddress={address} />}
        </main>
        
        <PlayerBar />
      </div>
    </PlaybackProvider>;
};
export default Index;