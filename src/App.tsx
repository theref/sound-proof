
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PlaybackProvider } from "@/contexts/PlaybackContext";
import { PlayerBar } from "@/components/PlayerBar";
import { useFarcasterMiniapp } from "@/hooks/useFarcasterMiniapp";
import { useEffect } from "react";
import Index from "./pages/Index";
import Song from "./pages/Song";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  console.log('🎵 App component rendering...')
  const { isLoaded, isMiniapp, ready } = useFarcasterMiniapp();
  
  // Call ready when the app has loaded and we're in a miniapp context
  useEffect(() => {
    if (isLoaded && isMiniapp) {
      // Give the React app a moment to fully render
      const timer = setTimeout(() => {
        ready();
        console.log('✅ Farcaster miniapp ready called');
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isLoaded, isMiniapp, ready]);

  console.log('🔍 Miniapp status:', { isLoaded, isMiniapp });
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PlaybackProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/song/:id" element={<Song />} />
              <Route path="/profile/:address" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </PlaybackProvider>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
