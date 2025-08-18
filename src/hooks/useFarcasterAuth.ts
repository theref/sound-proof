import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { getFarcasterClient } from '@/integrations/farcaster/client';
import { useToast } from '@/hooks/use-toast';
import { userStorage, type StoredUser } from '@/utils/localStorage';
import { cloudStorage } from '@/services/cloudStorage';
import { useFarcasterMiniapp } from '@/hooks/useFarcasterMiniapp';
import type { FarcasterUser } from '@/integrations/farcaster/types';

interface FarcasterAuthState {
  isConnected: boolean;
  user: FarcasterUser | null;
  verifiedAddress: string | null;
  signer: ethers.providers.JsonRpcSigner | null;
  isLoading: boolean;
}

export const useFarcasterAuth = () => {
  console.log('🔐 useFarcasterAuth hook initializing...')
  const [state, setState] = useState<FarcasterAuthState>({
    isConnected: false,
    user: null,
    verifiedAddress: null,
    signer: null,
    isLoading: false,
  });
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [pendingWalletData, setPendingWalletData] = useState<{
    walletAddress: string;
    signer: ethers.providers.JsonRpcSigner;
  } | null>(null);
  const { toast } = useToast();
  const { isMiniapp, user: miniappUser } = useFarcasterMiniapp();
  
  // Initialize Farcaster client with error handling
  const getFarcasterClientSafe = () => {
    try {
      console.log('🌐 Initializing Farcaster client...')
      const client = getFarcasterClient();
      console.log('✅ Farcaster client initialized')
      return client;
    } catch (error) {
      console.error('❌ Failed to initialize Farcaster client:', error);
      throw new Error('Farcaster client initialization failed. Please check your VITE_NEYNAR_API_KEY.');
    }
  };

  const signInWithMiniapp = useCallback(async () => {
    if (!isMiniapp || !miniappUser) {
      console.warn('Not in miniapp context or no miniapp user available');
      return;
    }

    console.log('🔍 Miniapp user context:', miniappUser);
    console.log('🔍 Miniapp user FID type:', typeof miniappUser.fid, 'value:', miniappUser.fid);

    if (!miniappUser.fid || typeof miniappUser.fid !== 'number') {
      throw new Error(`Invalid miniapp user FID: ${miniappUser.fid} (type: ${typeof miniappUser.fid})`);
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const farcasterClient = getFarcasterClientSafe();
      const farcasterUser = await farcasterClient.getUserByFid(miniappUser.fid);
      
      if (!farcasterUser) {
        throw new Error(`Farcaster user with FID ${miniappUser.fid} not found`);
      }

      console.log('✅ Authenticated via Farcaster miniapp:', farcasterUser.username);

      // Save user data (no wallet address needed for miniapp)
      const userData: StoredUser = {
        ...farcasterUser,
        walletAddress: null,
        lastLogin: new Date().toISOString(),
      };

      await cloudStorage.saveUser(userData);
      console.log('✅ User data saved');

      setState({
        isConnected: true,
        user: farcasterUser,
        verifiedAddress: null, // No wallet needed for miniapp
        signer: null,
        isLoading: false,
      });

      toast({
        title: "Welcome to SoundProof!",
        description: `Signed in as @${farcasterUser.username} via miniapp`,
      });

    } catch (error) {
      console.error('Miniapp auth failed:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: "Miniapp sign-in failed",
        description: error instanceof Error ? error.message : "Failed to authenticate via miniapp.",
        variant: "destructive",
      });
    }
  }, [isMiniapp, miniappUser, toast]);

  const signInWithFarcaster = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask not found",
        description: "MetaMask is required to connect with Farcaster for encryption features.",
        variant: "destructive",
      });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Step 1: Connect wallet to get signature
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const walletAddress = accounts[0];

      // Step 2: Create SIWF message
      const domain = window.location.host;
      const nonce = Math.random().toString(36).substring(2, 15);
      const issuedAt = new Date().toISOString();
      
      const message = `${domain} wants you to sign in with your Farcaster account:

URI: ${window.location.origin}
Version: 1
Chain ID: ${await signer.getChainId()}
Nonce: ${nonce}
Issued At: ${issuedAt}
Wallet Address: ${walletAddress}

I authorize this application to access my Farcaster identity.`;

      // Step 3: Sign message
      const signature = await signer.signMessage(message);

      // Step 4: Store wallet data and show username modal
      console.log('🔍 Storing wallet data and requesting username...');
      
      setPendingWalletData({ walletAddress, signer });
      setShowUsernameModal(true);
      setState(prev => ({ ...prev, isLoading: false }));

    } catch (error) {
      console.error('Farcaster auth failed:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: "Sign-in failed",
        description: error instanceof Error ? error.message : "Failed to sign in with Farcaster.",
        variant: "destructive",
      });
    }
  };

  const handleUsernameSubmit = async (username: string) => {
    if (!pendingWalletData) {
      throw new Error('No pending wallet data');
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Verify wallet ownership of the Farcaster account
      const farcasterClient = getFarcasterClientSafe();
      const farcasterUser = await farcasterClient.getUserByUsername(username);
      
      if (!farcasterUser) {
        throw new Error(`Farcaster user @${username} not found. Please check the username.`);
      }

      // Verify the wallet address is connected to this Farcaster account
      const verifiedAddresses = farcasterUser.verifications.map(addr => addr.toLowerCase());
      const walletLower = pendingWalletData.walletAddress.toLowerCase();
      
      if (!verifiedAddresses.includes(walletLower)) {
        console.log('Wallet address:', walletLower);
        console.log('Verified addresses:', verifiedAddresses);
        throw new Error(
          `Wallet ${pendingWalletData.walletAddress} is not verified with @${username}.\n\n` +
          'Please verify this wallet address on your Farcaster profile:\n' +
          'warpcast.com/~/settings/verified-addresses'
        );
      }
      
      console.log('✅ Verified Farcaster account:', farcasterUser.username);

      // Save user data to cloud storage (with localStorage fallback)
      const userData: StoredUser = {
        ...farcasterUser,
        walletAddress: pendingWalletData.walletAddress,
        lastLogin: new Date().toISOString(),
      };

      await cloudStorage.saveUser(userData);
      console.log('✅ User data saved');

      setState({
        isConnected: true,
        user: farcasterUser,
        verifiedAddress: pendingWalletData.walletAddress,
        signer: pendingWalletData.signer,
        isLoading: false,
      });

      setShowUsernameModal(false);
      setPendingWalletData(null);

      toast({
        title: "Welcome to SoundProof!",
        description: `Signed in as @${farcasterUser.username}`,
      });
      
      console.log('✅ Successfully authenticated with Farcaster:', {
        fid: farcasterUser.fid,
        username: farcasterUser.username,
        displayName: farcasterUser.displayName,
        verifiedAddress: pendingWalletData.walletAddress,
      });

    } catch (error) {
      console.error('Username verification failed:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: "Verification failed",
        description: error instanceof Error ? error.message : "Failed to verify Farcaster account.",
        variant: "destructive",
      });
      throw error; // Re-throw so modal can handle it
    }
  };

  const handleUsernameCancel = () => {
    setShowUsernameModal(false);
    setPendingWalletData(null);
    setState(prev => ({ ...prev, isLoading: false }));
  };

  const signOut = async () => {
    const currentUser = state.user;
    
    // Clear cloud storage if we have user data
    if (currentUser) {
      await cloudStorage.deleteUser(currentUser.fid.toString());
    } else {
      // Fallback to localStorage clear
      userStorage.remove();
    }
    
    setShowUsernameModal(false);
    setPendingWalletData(null);
    setState({
      isConnected: false,
      user: null,
      verifiedAddress: null,
      signer: null,
      isLoading: false,
    });
    toast({
      title: "Signed out",
      description: "You've been signed out of SoundProof.",
    });
  };

  // Check for existing session on mount and handle miniapp authentication
  useEffect(() => {
    const checkExistingSession = async () => {
      console.log('📂 Checking for existing session...')
      
      // If we're in a miniapp and have valid user context, try automatic auth
      if (isMiniapp && miniappUser && miniappUser.fid && typeof miniappUser.fid === 'number' && !state.isConnected) {
        console.log('🚀 Attempting automatic miniapp authentication...');
        try {
          await signInWithMiniapp();
        } catch (error) {
          console.error('❌ Miniapp authentication failed:', error);
          // Continue with normal flow if miniapp auth fails
        }
        return;
      }
      
      // Log context for debugging (both miniapp and non-miniapp scenarios)
      console.log('🔧 Auth context:', {
        isMiniapp,
        hasMiniappUser: !!miniappUser,
        miniappUserFid: miniappUser?.fid,
        miniappUserFidType: typeof miniappUser?.fid,
        isConnected: state.isConnected
      });
      
      // Try to get stored user from localStorage first (for FID)
      const localUser = userStorage.get();
      let storedUser = localUser;
      
      // If we have a local user, try to get fresher data from cloud
      if (localUser && localUser.fid) {
        try {
          const cloudUser = await cloudStorage.getUser(localUser.fid.toString());
          if (cloudUser) {
            storedUser = cloudUser;
            console.log('📥 Using cloud user data');
          }
        } catch (error) {
          console.log('📱 Falling back to local user data');
        }
      }
      
      if (storedUser) {
        console.log('✅ Found stored user:', storedUser)
        
        // Trust the stored user data - restore session immediately
        setState(prev => ({
          ...prev,
          isConnected: true,
          user: storedUser,
          verifiedAddress: storedUser.walletAddress || null,
        }));
        console.log('✅ Session restored from local storage');

        // Optional: Verify user still exists on Farcaster in background (don't block auth)
        try {
          const farcasterClient = getFarcasterClientSafe();
          const farcasterUser = await farcasterClient.getUserByFid(storedUser.fid);
          if (farcasterUser) {
            // Update with fresh data if available
            setState(prev => ({
              ...prev,
              user: farcasterUser,
            }));
            console.log('✅ Session verified with fresh Farcaster data');
          } else {
            console.warn('⚠️ Stored user no longer exists on Farcaster, but keeping session');
          }
        } catch (error) {
          console.warn('⚠️ Failed to verify session with Farcaster, but keeping stored session:', error);
          // Don't clear the session - network issues shouldn't log users out
        }
      } else {
        console.log('📂 No stored user found')
      }
    };

    checkExistingSession();
  }, [isMiniapp, miniappUser, state.isConnected, signInWithMiniapp]);

  // Note: Don't automatically clear storage when isConnected is false
  // This would interfere with session restoration on page load

  return {
    ...state,
    signInWithFarcaster,
    signInWithMiniapp,
    signOut,
    // Username modal state
    showUsernameModal,
    handleUsernameSubmit,
    handleUsernameCancel,
    pendingWalletAddress: pendingWalletData?.walletAddress,
    // Miniapp state
    isMiniapp,
    miniappUser,
    // Helper to determine if wallet features should be available
    hasWalletFeatures: !isMiniapp || !!state.verifiedAddress,
    // Helper to determine auth method being used
    authMethod: isMiniapp && state.isConnected && !state.verifiedAddress ? 'miniapp' : 'wallet'
  };
};