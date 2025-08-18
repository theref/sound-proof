import { useState, useEffect } from 'react';

interface FarcasterMiniappSDK {
  actions: {
    ready: () => void;
    close: () => void;
  };
  context: {
    user?: {
      fid: number;
      username: string;
      displayName: string;
      pfpUrl: string;
    };
    location: 'feed' | 'notifications' | 'profile' | 'search' | 'composer';
  };
}

declare global {
  interface Window {
    farcasterMiniappSDK?: FarcasterMiniappSDK;
  }
}

interface UseFarcasterMiniappState {
  isLoaded: boolean;
  isReady: boolean;
  context: FarcasterMiniappSDK['context'] | null;
  user: FarcasterMiniappSDK['context']['user'] | null;
  location: FarcasterMiniappSDK['context']['location'] | null;
}

export const useFarcasterMiniapp = () => {
  const [state, setState] = useState<UseFarcasterMiniappState>({
    isLoaded: false,
    isReady: false,
    context: null,
    user: null,
    location: null,
  });

  useEffect(() => {
    const checkSDK = () => {
      if (window.farcasterMiniappSDK) {
        const context = window.farcasterMiniappSDK.context;
        console.log('🔍 Farcaster SDK context:', context);
        console.log('🔍 SDK user:', context.user);
        setState({
          isLoaded: true,
          isReady: false,
          context,
          user: context.user || null,
          location: context.location,
        });
        return true;
      }
      return false;
    };

    // Check immediately
    if (checkSDK()) {
      return;
    }

    // If not available, set up interval to check
    const interval = setInterval(() => {
      if (checkSDK()) {
        clearInterval(interval);
      }
    }, 100);

    // Cleanup after 10 seconds if SDK never loads
    const timeout = setTimeout(() => {
      clearInterval(interval);
      console.warn('Farcaster Miniapp SDK did not load within 10 seconds');
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const ready = () => {
    if (window.farcasterMiniappSDK) {
      window.farcasterMiniappSDK.actions.ready();
      setState(prev => ({ ...prev, isReady: true }));
      console.log('✅ Farcaster Miniapp SDK ready');
    } else {
      console.warn('Farcaster Miniapp SDK not available');
    }
  };

  const close = () => {
    if (window.farcasterMiniappSDK) {
      window.farcasterMiniappSDK.actions.close();
      console.log('🔐 Farcaster Miniapp closed');
    } else {
      console.warn('Farcaster Miniapp SDK not available');
    }
  };

  const isMiniapp = !!window.farcasterMiniappSDK;

  // In development, the SDK might not provide real user context
  // Let's add some debugging info
  console.log('🔍 Farcaster miniapp hook state:', {
    isLoaded: state.isLoaded,
    isMiniapp,
    hasUser: !!state.user,
    userFid: state.user?.fid,
    env: import.meta.env.DEV ? 'development' : 'production'
  });

  return {
    ...state,
    isMiniapp,
    ready,
    close,
  };
};