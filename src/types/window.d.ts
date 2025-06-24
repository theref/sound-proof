
interface Window {
  ethereum?: {
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on: (event: string, callback: (...args: any[]) => void) => void;
    removeListener: (event: string, callback: (...args: any[]) => void) => void;
    // Wallet-specific properties for detection
    isMetaMask?: boolean;
    isCoinbaseWallet?: boolean;
    isRabby?: boolean;
    isBraveWallet?: boolean;
    isTrustWallet?: boolean;
  };
}
