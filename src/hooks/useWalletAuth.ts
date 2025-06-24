
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WalletAuthState {
  isConnected: boolean;
  address: string;
  signer: ethers.providers.JsonRpcSigner | null;
  isLoading: boolean;
}

export const useWalletAuth = () => {
  const [state, setState] = useState<WalletAuthState>({
    isConnected: false,
    address: '',
    signer: null,
    isLoading: false,
  });
  const { toast } = useToast();

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask not found",
        description: "Please install MetaMask to continue.",
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

      // Verify ownership by signing a message
      const message = `Sign this message to verify wallet ownership: ${Date.now()}`;
      await signer.signMessage(message);

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
      });

      toast({
        title: "Wallet connected",
        description: "Successfully connected to your wallet.",
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
    });
  };

  return {
    ...state,
    connectWallet,
    disconnectWallet,
  };
};
