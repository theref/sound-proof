
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WalletAuthState {
  isConnected: boolean;
  address: string;
  signer: ethers.providers.JsonRpcSigner | null;
  isLoading: boolean;
  walletType: string | null;
  siweMessage: string | null;
}

export const useWalletAuth = () => {
  const [state, setState] = useState<WalletAuthState>({
    isConnected: false,
    address: '',
    signer: null,
    isLoading: false,
    walletType: null,
    siweMessage: null,
  });
  const { toast } = useToast();

  const detectWalletType = () => {
    if (window.ethereum?.isMetaMask) return 'MetaMask';
    if (window.ethereum?.isCoinbaseWallet) return 'Coinbase Wallet';
    if (window.ethereum?.isRabby) return 'Rabby';
    if (window.ethereum?.isBraveWallet) return 'Brave Wallet';
    if (window.ethereum) return 'Ethereum Wallet';
    return null;
  };

  const generateSiweMessage = (address: string) => {
    const domain = window.location.host;
    const origin = window.location.origin;
    const statement = "Sign in to TACo Music Platform";
    const nonce = Math.random().toString(36).substring(2, 15);
    const issuedAt = new Date().toISOString();
    
    return `${domain} wants you to sign in with your Ethereum account:
${address}

${statement}

URI: ${origin}
Version: 1
Chain ID: 80002
Nonce: ${nonce}
Issued At: ${issuedAt}`;
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast({
        title: "No wallet detected",
        description: "Please install an Ethereum wallet (MetaMask, Coinbase Wallet, etc.) to continue.",
        variant: "destructive",
      });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = accounts[0];
      const walletType = detectWalletType();

      // Generate SIWE message for future use
      const siweMessage = generateSiweMessage(address);
      
      // Sign the SIWE message once during connection
      console.log("Signing SIWE message for future TACo operations...");
      await signer.signMessage(siweMessage);
      console.log("✅ SIWE message signed and stored");

      // Create or get user in Supabase
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', address)
        .maybeSingle();

      if (!existingUser) {
        const { error } = await supabase
          .from('users')
          .insert({ id: address });

        if (error) {
          console.error('Error creating user:', error);
          throw error;
        }
      }

      setState({
        isConnected: true,
        address,
        signer,
        isLoading: false,
        walletType,
        siweMessage,
      });

      toast({
        title: "Wallet connected",
        description: `Successfully connected to your ${walletType || 'wallet'}.`,
      });

    } catch (error) {
      console.error('Wallet connection failed:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: "Connection failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const disconnectWallet = () => {
    setState({
      isConnected: false,
      address: '',
      signer: null,
      isLoading: false,
      walletType: null,
      siweMessage: null,
    });
  };

  return {
    ...state,
    connectWallet,
    disconnectWallet,
  };
};
