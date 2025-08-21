import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FarcasterConnection } from "@/components/FarcasterConnection";
import { MusicFeedSimple } from "@/components/MusicFeedSimple";
import { UserProfileSimple } from "@/components/UserProfileSimple";
import { UploadTrackSimple } from "@/components/UploadTrackSimple";
import { TestingSuite } from "@/components/TestingSuite";
import { FarcasterTest } from "@/components/FarcasterTest";
import { FarcasterUsernameModal } from "@/components/FarcasterUsernameModal";
import { ConvexTest } from "@/components/ConvexTest";
import { NavigationSimple } from "@/components/NavigationSimple";
import { PlayerBar } from "@/components/PlayerBar";
import { PlaybackProvider } from "@/contexts/PlaybackContext";
import { useFarcasterAuth } from "@/hooks/useFarcasterAuth";
import { getFarcasterClient } from "@/integrations/farcaster/client";
import { Shield, User, Zap, Music } from "lucide-react";
const Index = () => {
  console.log('🏠 Index page rendering...')
  const [activeView, setActiveView] = useState<"feed" | "upload" | "profile" | "test" | "farcaster-test">("feed");
  
  // Development mode detection - only show debug tools in development
  const isDev = import.meta.env.DEV;
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const showDevTools = (isDev || isLocalhost) && window.location.search.includes('debug=true');
  
  console.log('🔧 Debug mode:', { isDev, debugParam: window.location.search.includes('debug=true'), showDevTools });
  const {
    isConnected,
    user,
    signInWithFarcaster,
    signOut,
    isLoading,
    showUsernameModal,
    handleUsernameSubmit,
    handleUsernameCancel,
    pendingWalletAddress
  } = useFarcasterAuth();
  const handleFarcasterConnect = async () => {
    await signInWithFarcaster();
  };
  // Add state for debug view
  const [debugView, setDebugView] = useState<"none" | "test" | "farcaster-test">("none");

  if (!isConnected) {
    // Show debug components if requested
    if (showDevTools && debugView === "test") {
      return <div className="min-h-screen bg-white p-4">
        <div className="mb-4">
          <Button 
            onClick={() => setDebugView("none")} 
            className="mb-4 bg-brand-orange-600 hover:bg-brand-orange-700"
          >
            ← Back to Landing
          </Button>
        </div>
        <TestingSuite />
      </div>;
    }

    if (showDevTools && debugView === "farcaster-test") {
      return <div className="min-h-screen bg-white p-4">
        <div className="mb-4">
          <Button 
            onClick={() => setDebugView("none")} 
            className="mb-4 bg-brand-orange-600 hover:bg-brand-orange-700"
          >
            ← Back to Landing
          </Button>
        </div>
        <FarcasterTest />
      </div>;
    }

    return <div className="min-h-screen bg-white grid-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto space-y-16">
            {/* Hero Section */}
            <div className="text-center space-y-6">
              <h1 className="taco-banner text-taco-black">sound proof</h1>
              <p className="taco-body text-taco-dark-grey max-w-2xl mx-auto">
                Discover tomorrow's artists today. Pay once, own forever. 
                Music discovery powered by your Farcaster social network.
              </p>
            </div>

            {/* Farcaster Connection */}
            <div className="flex justify-center">
              <FarcasterConnection onConnect={handleFarcasterConnect} />
            </div>

            {/* About SoundProof */}
            <Card className="border-2 border-taco-black bg-white">
              <CardHeader className="border-b-2 border-taco-black">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-orange-500 to-brand-orange-600 rounded-full flex items-center justify-center">
                    <Music className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="taco-subheading text-taco-black">
                    Social Music Discovery
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="taco-ui-text text-taco-black">
                  <strong>SoundProof</strong> leverages your Farcaster social network to help you discover 
                  incredible music from tomorrow's artists. Pay once, own forever.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3 p-4 border border-taco-black bg-taco-light-grey">
                    <User className="w-5 h-5 text-taco-black mt-1 flex-shrink-0" />
                    <div>
                      <p className="taco-ui-text font-bold text-taco-black">Friend Discovery</p>
                      <p className="taco-ui-text text-taco-dark-grey text-sm">Find music through your Farcaster social graph and friends' activity</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 border border-taco-black bg-taco-light-grey">
                    <Zap className="w-5 h-5 text-taco-black mt-1 flex-shrink-0" />
                    <div>
                      <p className="taco-ui-text font-bold text-taco-black">3¢ TrackPass</p>
                      <p className="taco-ui-text text-taco-dark-grey text-sm">Pay once with bonding curve pricing, own the track forever</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 border border-taco-black bg-taco-light-grey">
                    <Shield className="w-5 h-5 text-taco-black mt-1 flex-shrink-0" />
                    <div>
                      <p className="taco-ui-text font-bold text-taco-black">90% to Artists</p>
                      <p className="taco-ui-text text-taco-dark-grey text-sm">Direct support to emerging musicians with transparent revenue split</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About Platform */}
            <Card className="border-2 border-taco-black bg-white">
              <CardHeader className="border-b-2 border-taco-black">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-orange-500 to-brand-orange-600 rounded-full flex items-center justify-center">
                    <Music className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="taco-subheading text-taco-black">
                    Powered by Farcaster + TACo
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="taco-ui-text text-taco-black">
                  <strong>SoundProof</strong> combines Farcaster's social protocol with TACo encryption 
                  to create the first truly social music discovery platform.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <p className="taco-ui-text font-bold text-taco-black">Social Features:</p>
                    <ul className="space-y-2">
                      <li className="taco-ui-text text-taco-dark-grey flex items-center gap-2">
                        <div className="w-2 h-2 bg-brand-orange-500 rounded-full"></div>
                        Friend-based discovery
                      </li>
                      <li className="taco-ui-text text-taco-dark-grey flex items-center gap-2">
                        <div className="w-2 h-2 bg-brand-orange-500 rounded-full"></div>
                        Playlist sharing as casts
                      </li>
                      <li className="taco-ui-text text-taco-dark-grey flex items-center gap-2">
                        <div className="w-2 h-2 bg-brand-orange-500 rounded-full"></div>
                        Native tipping support
                      </li>
                      <li className="taco-ui-text text-taco-dark-grey flex items-center gap-2">
                        <div className="w-2 h-2 bg-brand-orange-500 rounded-full"></div>
                        Music community channels
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <p className="taco-ui-text font-bold text-taco-black">Perfect for:</p>
                    <ul className="space-y-2">
                      <li className="taco-ui-text text-taco-dark-grey flex items-center gap-2">
                        <div className="w-2 h-2 bg-brand-orange-600 rounded-full"></div>
                        Bedroom producers
                      </li>
                      <li className="taco-ui-text text-taco-dark-grey flex items-center gap-2">
                        <div className="w-2 h-2 bg-brand-orange-600 rounded-full"></div>
                        Music crate-diggers
                      </li>
                      <li className="taco-ui-text text-taco-dark-grey flex items-center gap-2">
                        <div className="w-2 h-2 bg-brand-orange-600 rounded-full"></div>
                        Playlist curators
                      </li>
                      <li className="taco-ui-text text-taco-dark-grey flex items-center gap-2">
                        <div className="w-2 h-2 bg-brand-orange-600 rounded-full"></div>
                        Underground music fans
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <div className="text-center">
              <p className="taco-body text-taco-dark-grey mb-6">
                Ready to discover tomorrow's artists today?
              </p>
              <Button onClick={handleFarcasterConnect} className="taco-button px-8 py-4 text-lg bg-gradient-to-r from-brand-orange-500 to-brand-orange-600 hover:from-brand-orange-700 hover:to-brand-orange-800 border-none">
                <span className="taco-ui-text text-white">get started</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Development Tools - Available on Landing Page */}
        {showDevTools && (
          <div className="fixed bottom-4 right-4 bg-yellow-100 border-2 border-yellow-400 p-3 rounded shadow-lg z-50">
            <p className="text-sm font-bold text-yellow-800 mb-2">🛠️ Dev Tools</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setDebugView("test")}
                className="px-3 py-2 bg-brand-orange-500 text-white text-xs rounded hover:bg-brand-orange-600"
              >
                Testing Suite
              </button>
              <button
                onClick={() => setDebugView("farcaster-test")}
                className="px-3 py-2 bg-brand-orange-600 text-white text-xs rounded hover:bg-brand-orange-700"
              >
                Farcaster Test
              </button>
              <button
                onClick={() => {
                  console.log('🧪 Running API test via getFarcasterClient()...');
                  try {
                    const client = getFarcasterClient();
                    client.getUserByFid(3).then(user => {
                      console.log('✅ Neynar API test successful:', user?.username || 'Connected');
                      alert('api test results:\n✅ Neynar: Connected\n✅ Lighthouse: Configured\n\nSee browser console for details');
                    }).catch(e => {
                      console.error('❌ Neynar API test failed:', e);
                      alert('api test results:\n❌ Neynar: Failed\n✅ Lighthouse: Configured\n\nCheck console for errors');
                    });
                  } catch (e) {
                    console.error('❌ API client error:', e);
                    alert('api test error:\n' + e.message);
                  }
                }}
                className="px-3 py-2 bg-brand-orange-500 text-white text-xs rounded hover:bg-brand-orange-600"
              >
                api test
              </button>
            </div>
          </div>
        )}

        {/* Username Modal */}
        <FarcasterUsernameModal
          isOpen={showUsernameModal}
          onSubmit={handleUsernameSubmit}
          onCancel={handleUsernameCancel}
          walletAddress={pendingWalletAddress || ''}
        />
      </div>;
  }
  return <PlaybackProvider>
      <div className="min-h-screen bg-white grid-background text-black pb-24">
        <NavigationSimple activeView={activeView} onViewChange={setActiveView} userAddress={user?.fid.toString() || ''} onDisconnect={signOut} />
        
        <main className="container mx-auto px-4 py-8">
          {/* Show Convex status in development */}
          {showDevTools && <ConvexTest />}
          
          {activeView === "feed" && <MusicFeedSimple />}
          {activeView === "upload" && <UploadTrackSimple userAddress={user?.fid.toString() || ''} />}
          {activeView === "profile" && <UserProfileSimple userAddress={user?.fid.toString() || ''} />}
          {showDevTools && activeView === "test" && <TestingSuite />}
          {showDevTools && activeView === "farcaster-test" && <FarcasterTest />}
        </main>
        
        {/* Development Tools */}
        {showDevTools && (
          <div className="fixed bottom-4 right-4 bg-yellow-100 border-2 border-yellow-400 p-3 rounded shadow-lg">
            <p className="text-sm font-bold text-yellow-800 mb-2">🛠️ Dev Tools</p>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveView("test")}
                className="px-2 py-1 bg-brand-orange-500 text-white text-xs rounded hover:bg-brand-orange-600"
              >
                Testing Suite
              </button>
              <button
                onClick={() => setActiveView("farcaster-test")}
                className="px-2 py-1 bg-brand-orange-600 text-white text-xs rounded hover:bg-brand-orange-700"
              >
                Farcaster Test
              </button>
              <button
                onClick={() => setActiveView("feed")}
                className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
              >
                Back to App
              </button>
            </div>
          </div>
        )}
        
        <PlayerBar />
      </div>
    </PlaybackProvider>;
};
export default Index;