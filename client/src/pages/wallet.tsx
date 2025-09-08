import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet as WalletIcon, ExternalLink, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Wallet() {
  const [walletAddress, setWalletAddress] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const connectWalletMutation = useMutation({
    mutationFn: async (address: string) => {
      const response = await apiRequest("POST", "/api/wallet/connect", {
        walletAddress: address,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Wallet Connected!",
        description: "Your Base Network wallet has been connected successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setWalletAddress("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to connect wallet. Please check the address format.",
        variant: "destructive",
      });
    },
  });

  const handleConnectWallet = () => {
    if (!walletAddress.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid wallet address.",
        variant: "destructive",
      });
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Ethereum address format (0x...).",
        variant: "destructive",
      });
      return;
    }

    connectWalletMutation.mutate(walletAddress);
  };

  const formatBalance = (balance: string) => {
    return parseFloat(balance).toLocaleString();
  };

  const getWithdrawableBalance = () => {
    if (!user?.balance) return "0";
    const balance = parseFloat(user.balance);
    return Math.max(0, balance - 1000).toString(); // Minimum 1000 MTK required
  };

  const canWithdraw = () => {
    const withdrawable = parseFloat(getWithdrawableBalance());
    return withdrawable >= 1000 && user?.walletAddress;
  };

  return (
    <div className="pb-20 pt-12 px-6">
      <div className="text-center py-4 mb-6">
        <h2 data-testid="page-title" className="text-2xl font-bold gradient-text mb-2">Connect Wallet</h2>
        <p className="text-muted-foreground">Connect your Base Network wallet address</p>
      </div>

      <div className="space-y-6">
        {/* Wallet Connection Status */}
        <Card className="glass-card border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Wallet Status</h3>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${user?.walletAddress ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span data-testid="text-connection-status" className="text-sm text-muted-foreground">
                  {user?.walletAddress ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
            
            {user?.walletAddress ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Connected Address</Label>
                  <div className="bg-muted rounded-lg p-3">
                    <span data-testid="text-connected-address" className="font-mono text-sm break-all">
                      {user.walletAddress}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-green-500">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm">Wallet successfully connected to Base Network</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="wallet-address" className="text-sm font-medium mb-2 block">
                    Base Network Address
                  </Label>
                  <Input
                    id="wallet-address"
                    type="text"
                    placeholder="0x..."
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    data-testid="input-wallet-address"
                    className="bg-input border-border focus:border-primary"
                  />
                </div>
                
                <Button
                  onClick={handleConnectWallet}
                  disabled={connectWalletMutation.isPending}
                  data-testid="button-connect-wallet"
                  className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
                >
                  {connectWalletMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Connecting...
                    </div>
                  ) : (
                    <>
                      <WalletIcon className="w-4 h-4 mr-2" />
                      Connect Wallet
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Network Info */}
        <Card className="glass-card border-white/20">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Base Network Info</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network</span>
                <span data-testid="text-network" className="font-medium">Base Mainnet</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Chain ID</span>
                <span data-testid="text-chain-id" className="font-medium">8453</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">RPC URL</span>
                <span className="font-medium text-sm truncate max-w-40">https://mainnet.base.org</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Currency</span>
                <span data-testid="text-currency" className="font-medium">ETH</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4"
              onClick={() => window.open('https://base.org/', '_blank')}
              data-testid="button-learn-more"
            >
              Learn More About Base <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Withdrawal Options */}
        <Card className="glass-card border-white/20">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Withdrawal</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Available Balance</p>
                  <p className="text-sm text-muted-foreground">Ready to withdraw</p>
                </div>
                <div className="text-right">
                  <p data-testid="text-withdrawable-balance" className="text-xl font-bold gradient-text">
                    {formatBalance(getWithdrawableBalance())} MTK
                  </p>
                  <p className="text-xs text-muted-foreground">Min: 1,000 MTK</p>
                </div>
              </div>
              
              {!canWithdraw() && (
                <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-500 mb-1">Withdrawal Requirements</p>
                    <ul className="text-muted-foreground space-y-1">
                      {!user?.walletAddress && <li>• Connect your Base Network wallet</li>}
                      <li>• Minimum balance: 1,000 MTK</li>
                      <li>• Current available: {formatBalance(getWithdrawableBalance())} MTK</li>
                    </ul>
                  </div>
                </div>
              )}
              
              <Button
                disabled={!canWithdraw()}
                data-testid="button-withdraw"
                className={`w-full font-semibold ${
                  canWithdraw()
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:opacity-90'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                {canWithdraw() ? 'Withdraw to Wallet' : 'Withdrawal Unavailable'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
