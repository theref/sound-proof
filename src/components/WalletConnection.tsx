
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Shield } from "lucide-react";
import { useState } from "react";

interface WalletConnectionProps {
  onConnect: () => Promise<void>;
}

export const WalletConnection = ({ onConnect }: WalletConnectionProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await onConnect();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-2 border-taco-black bg-white">
      <CardHeader className="text-center border-b-2 border-taco-black">
        <div className="w-16 h-16 bg-taco-black rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="taco-subheading text-taco-black mb-2">
          Connect Your Wallet
        </CardTitle>
        <p className="taco-ui-text text-taco-dark-grey">
          Connect your Ethereum wallet to access encrypted music
        </p>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center gap-3 p-4 border-2 border-taco-black bg-taco-light-grey">
          <Shield className="w-6 h-6 text-taco-black flex-shrink-0" />
          <div>
            <p className="taco-ui-text font-bold text-taco-black">Secure & Private</p>
            <p className="taco-ui-text text-taco-dark-grey text-sm">Your wallet signature verifies ownership</p>
          </div>
        </div>
        
        <Button 
          onClick={handleConnect}
          disabled={isLoading}
          className="w-full taco-button py-4 text-lg"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-3" />
              <span className="taco-ui-text">CONNECTING...</span>
            </>
          ) : (
            <>
              <Wallet className="w-5 h-5 mr-3" />
              <span className="taco-ui-text">CONNECT METAMASK</span>
            </>
          )}
        </Button>
        
        <p className="taco-ui-text text-taco-dark-grey text-center text-sm">
          Don't have MetaMask?{" "}
          <a 
            href="https://metamask.io" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-taco-black font-bold hover:text-taco-neon transition-colors underline"
          >
            Download here
          </a>
        </p>
      </CardContent>
    </Card>
  );
};
