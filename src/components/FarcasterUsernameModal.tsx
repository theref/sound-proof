import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, AlertCircle } from "lucide-react";

interface FarcasterUsernameModalProps {
  isOpen: boolean;
  onSubmit: (username: string) => void;
  onCancel: () => void;
  walletAddress: string;
}

export const FarcasterUsernameModal = ({ 
  isOpen, 
  onSubmit, 
  onCancel, 
  walletAddress 
}: FarcasterUsernameModalProps) => {
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(username.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md border-2 border-taco-black bg-white">
        <CardHeader className="text-center border-b-2 border-taco-black">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="taco-subheading text-taco-black">
            Link Your Farcaster Account
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-blue-800 font-semibold mb-1">Quick Verification</p>
                  <p className="text-blue-700">
                    We'll verify that wallet <code className="bg-blue-100 px-1 rounded text-xs">{walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}</code> is 
                    connected to your Farcaster profile.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-taco-black mb-2">
                Farcaster Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-taco-dark-grey">
                  @
                </span>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your-username"
                  className="pl-8 border-2 border-taco-black"
                  autoFocus
                  disabled={isSubmitting}
                />
              </div>
              <p className="text-xs text-taco-dark-grey mt-1">
                Enter without the @ symbol (e.g., "dwr.eth" not "@dwr.eth")
              </p>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800">
                <strong>Need to verify your wallet?</strong><br />
                Go to <code>warpcast.com/~/settings/verified-addresses</code> to add this wallet to your profile.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                onClick={onCancel}
                variant="outline"
                className="flex-1 border-2 border-taco-black"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!username.trim() || isSubmitting}
                className="flex-1 taco-button bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-none"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4 mr-2" />
                    Verify & Connect
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};