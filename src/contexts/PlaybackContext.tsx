
import { createContext, useState, ReactNode, useContext } from "react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { getFileFromLighthouse } from "@/services/lighthouseService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { conditions, decrypt, domains, initialize, ThresholdMessageKit } from '@nucypher/taco';
import { EIP4361AuthProvider, USER_ADDRESS_PARAM_DEFAULT } from '@nucypher/taco-auth';
import { ethers } from 'ethers';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  uploadedAt: string;
  accessCondition: string;
  isEncrypted: boolean;
  canPlay: boolean;
  cid?: string;
  accessRule?: any;
}

interface PlaybackContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isLoading: boolean;
  playTrack: (track: Track, cid?: string, walletSigner?: ethers.providers.JsonRpcSigner, siweMessage?: string) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
}

const PlaybackContext = createContext<PlaybackContextType>({
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isLoading: false,
  playTrack: () => {},
  pauseTrack: () => {},
  resumeTrack: () => {},
  seekTo: () => {},
  setVolume: () => {},
});

interface PlaybackProviderProps {
  children: ReactNode;
}

export const PlaybackProvider = ({ children }: PlaybackProviderProps) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const audioPlayer = useAudioPlayer();

  const playTrack = async (track: Track, cid?: string, walletSigner?: ethers.providers.JsonRpcSigner, siweMessage?: string) => {
    console.log("Playing track:", track.title);
    setCurrentTrack(track);
    
    const trackCid = cid || track.cid;
    if (trackCid) {
      try {
        console.log("Fetching audio file for CID:", trackCid);
        
        // Check if this is an encrypted track by looking at access_rule
        const { data: trackData } = await supabase
          .from('tracks')
          .select('access_rule')
          .eq('id', track.id)
          .single();

        // Safe type checking for access_rule
        const accessRule = trackData?.access_rule;
        const isEncrypted = accessRule && 
          typeof accessRule === 'object' && 
          accessRule !== null && 
          'type' in accessRule && 
          accessRule.type !== 'public';

        if (isEncrypted) {
          console.log("Encrypted track detected, attempting TACo decryption...");
          
          // Check if we have the required wallet auth data
          if (!walletSigner || !siweMessage) {
            toast.error("Wallet authentication required", {
              description: "Please reconnect your wallet to decrypt this track"
            });
            return;
          }

          try {
            console.log('🎵 Starting track decryption process with stored SIWE...');
            
            // Initialize TACo
            await initialize();
            console.log('✅ TACo initialized successfully');
            
            // Create Amoy provider for TACo operations
            const amoyProvider = new ethers.providers.JsonRpcProvider(
              'https://rpc-amoy.polygon.technology',
              {
                name: 'amoy', 
                chainId: 80002,
              }
            );

            // Get the connected wallet provider and ensure we're on Amoy
            const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
            
            // Switch to Amoy network
            try {
              await web3Provider.send("wallet_switchEthereumChain", [
                { chainId: "0x13882" } // 80002 in hex for Amoy
              ]);
            } catch (switchError: any) {
              // If the chain is not added, add it
              if (switchError.code === 4902) {
                await web3Provider.send("wallet_addEthereumChain", [{
                  chainId: "0x13882",
                  chainName: "Polygon Amoy Testnet",
                  nativeCurrency: {
                    name: "MATIC",
                    symbol: "MATIC",
                    decimals: 18
                  },
                  rpcUrls: ["https://rpc-amoy.polygon.technology"],
                  blockExplorerUrls: ["https://amoy.polygonscan.com/"]
                }]);
              } else {
                throw switchError;
              }
            }

            console.log('✅ Using stored wallet signer and SIWE message');

            console.log("Fetching encrypted file from Lighthouse...");
            
            // Fetch the encrypted file as binary data
            const response = await fetch(getFileFromLighthouse(trackCid));
            if (!response.ok) {
              throw new Error(`Failed to fetch encrypted file: ${response.statusText}`);
            }
            
            const encryptedData = await response.arrayBuffer();
            console.log("✅ Encrypted data fetched, size:", encryptedData.byteLength, "bytes");
            
            // Convert to ThresholdMessageKit
            const messageKit = ThresholdMessageKit.fromBytes(new Uint8Array(encryptedData));
            console.log("✅ MessageKit created from encrypted data");

            // Create condition context from message kit
            const conditionContext = conditions.context.ConditionContext.fromMessageKit(messageKit);
            console.log('✅ Condition context created');
            
            // Add auth provider using the stored signer and SIWE message
            const authProvider = new EIP4361AuthProvider(web3Provider, walletSigner);
            conditionContext.addAuthProvider(USER_ADDRESS_PARAM_DEFAULT, authProvider);
            console.log('✅ Auth provider added to condition context using stored credentials');

            toast.info("Decrypting track...", {
              description: "Using your stored wallet signature"
            });

            // Decrypt the data using TACo
            console.log("🔓 Starting decryption with stored SIWE...");
            const decryptedData = await decrypt(
              amoyProvider,
              domains.DEVNET,
              messageKit,
              conditionContext
            );
            console.log("✅ Decryption successful, decrypted size:", decryptedData.byteLength, "bytes");

            // Create a blob URL from the decrypted audio data
            const audioBlob = new Blob([decryptedData], { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(audioBlob);
            console.log("✅ Blob URL created for decrypted audio");

            await audioPlayer.loadTrack(audioUrl);
            
            // Start playing after a short delay to ensure the track is loaded
            setTimeout(() => {
              audioPlayer.play();
            }, 500);

            toast.success("Track decrypted successfully!", {
              description: "Now playing your encrypted track"
            });

          } catch (decryptError) {
            console.error("❌ TACo decryption failed:", decryptError);
            console.error('Full error object:', decryptError);
            console.error('Error details:', {
              name: decryptError.name,
              message: decryptError.message,
              stack: decryptError.stack,
              cause: decryptError.cause
            });
            
            // Provide detailed error information
            const errorMessage = decryptError.message || 'Unknown decryption error';
            
            toast.error("Failed to decrypt track", {
              description: errorMessage
            });
            return;
          }
        } else {
          // For unencrypted tracks, play normally
          const audioUrl = getFileFromLighthouse(trackCid);
          console.log("Audio URL obtained:", audioUrl);
          
          await audioPlayer.loadTrack(audioUrl);
          
          // Start playing after a short delay to ensure the track is loaded
          setTimeout(() => {
            audioPlayer.play();
          }, 500);
        }
      } catch (error) {
        console.error("Failed to load track:", error);
        toast.error("Failed to load track", {
          description: "Please try again later"
        });
      }
    }
  };

  const pauseTrack = () => {
    console.log("Pausing playback");
    audioPlayer.pause();
  };

  const resumeTrack = () => {
    console.log("Resuming playback");
    audioPlayer.play();
  };

  return (
    <PlaybackContext.Provider value={{
      currentTrack,
      isPlaying: audioPlayer.isPlaying,
      currentTime: audioPlayer.currentTime,
      duration: audioPlayer.duration,
      volume: audioPlayer.volume,
      isLoading: audioPlayer.isLoading,
      playTrack,
      pauseTrack,
      resumeTrack,
      seekTo: audioPlayer.seekTo,
      setVolume: audioPlayer.setVolume,
    }}>
      {children}
    </PlaybackContext.Provider>
  );
};

export const usePlayback = () => {
  const context = useContext(PlaybackContext);
  if (!context) {
    throw new Error('usePlayback must be used within a PlaybackProvider');
  }
  return context;
};
