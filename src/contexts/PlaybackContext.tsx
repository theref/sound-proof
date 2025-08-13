
import { createContext, useState, ReactNode, useContext } from "react";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { getFileFromLighthouse } from "@/services/lighthouseService";
import { trackStorage, type StoredTrack } from '@/utils/localStorage';
import { toast } from "sonner";
import { conditions, decrypt, domains, initialize, ThresholdMessageKit } from '@nucypher/taco';
import { EIP4361AuthProvider, USER_ADDRESS_PARAM_DEFAULT } from '@nucypher/taco-auth';
import { ethers } from 'ethers';
import { useFarcasterAuth } from '@/hooks/useFarcasterAuth';

// Use StoredTrack from localStorage utils
interface Track extends Omit<StoredTrack, 'duration'> {
  duration: string; // Keep as string for display compatibility
  accessCondition: string; // Legacy field for compatibility
  canPlay: boolean; // Runtime property
}

interface PlaybackContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isLoading: boolean;
  playTrack: (track: Track, cid?: string) => void;
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
  const { user, verifiedAddress, signer } = useFarcasterAuth();

  const playTrack = async (track: Track, cid?: string) => {
    console.log("Playing track:", track.title);
    setCurrentTrack(track);
    
    const trackCid = cid || track.cid;
    if (trackCid) {
      try {
        console.log("Fetching audio file for CID:", trackCid);
        
        // Check if this is an encrypted track from the track data
        const isEncrypted = track.isEncrypted;
        
        // Increment play count
        trackStorage.incrementPlayCount(track.id);

        if (isEncrypted) {
          console.log("Encrypted track detected, attempting TACo decryption...");
          
          // Check if user has Farcaster verified address and signer
          if (!user || !verifiedAddress || !signer) {
            toast.error("Farcaster authentication required", {
              description: "Please sign in with Farcaster to decrypt this track"
            });
            return;
          }

          try {
            console.log('🎵 Starting track decryption process...');
            
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

            // Use the Farcaster-authenticated signer directly
            // The signer is already available from Farcaster auth
            console.log('✅ Using Farcaster authenticated signer for TACo decryption');
            console.log('Verified address from Farcaster:', verifiedAddress);
            console.log('✅ Wallet connected and switched to Amoy testnet');

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
            
            // Add auth provider using Farcaster-authenticated signer
            // We need to create a Web3Provider from the existing signer for TACo compatibility
            const signerProvider = signer.provider;
            const authProvider = new EIP4361AuthProvider(signerProvider as ethers.providers.Web3Provider, signer);
            conditionContext.addAuthProvider(USER_ADDRESS_PARAM_DEFAULT, authProvider);
            console.log('✅ Auth provider added to condition context using Farcaster signer');

            toast.info("Decrypting track...", {
              description: "Please wait while we decrypt your track"
            });

            // Decrypt the data using TACo
            console.log("🔓 Starting decryption...");
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
