import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Coins, TrendingUp, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface MiningStatus {
  canClaim: boolean;
  timeRemaining: string;
  progress: number;
  reward: string;
}

export default function Home() {
  const [isMining, setIsMining] = useState(false);
  const [miningProgress, setMiningProgress] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: miningStatus, isLoading: miningLoading } = useQuery<MiningStatus>({
    queryKey: ["/api/mining/status"],
    refetchInterval: 1000,
  });

  const claimMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/mining/claim");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: `Claimed ${miningStatus?.reward} MTK tokens`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/mining/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
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
        description: "Failed to claim reward. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Mining animation effect
  useEffect(() => {
    if (isMining) {
      const interval = setInterval(() => {
        setMiningProgress(prev => {
          if (prev >= 100) {
            setIsMining(false);
            return 0;
          }
          return prev + 2;
        });
      }, 50);
      
      return () => clearInterval(interval);
    }
  }, [isMining]);

  const handleClaim = () => {
    if (miningStatus?.canClaim && !claimMutation.isPending) {
      setIsMining(true);
      setTimeout(() => {
        claimMutation.mutate();
        setIsMining(false);
        setMiningProgress(0);
      }, 2500);
    }
  };

  const formatBalance = (balance: string) => {
    return parseFloat(balance).toLocaleString();
  };

  if (miningLoading) {
    return (
      <div className="pb-20 pt-12 px-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading mining status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <header className="pt-12 pb-6 px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 data-testid="app-title" className="text-2xl font-bold gradient-text">MyToken</h1>
            <p className="text-muted-foreground text-sm">Mining Platform</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="glass-card px-3 py-2 rounded-lg">
              <span data-testid="text-username" className="text-sm font-medium">
                @{user?.username || user?.email?.split('@')[0] || 'user'}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.location.href = "/api/logout"}
              data-testid="button-logout"
              className="glass-card hover:bg-white/20"
            >
              <TrendingUp className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="px-6 space-y-6">
        {/* Balance Card */}
        <Card className="glass-card border-white/20">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm mb-2">Total Balance</p>
              <div className="flex items-center justify-center gap-2">
                <span data-testid="text-balance" className="text-4xl font-bold">
                  {user?.balance ? formatBalance(user.balance) : '0'}
                </span>
                <span className="text-xl font-semibold gradient-text">MTK</span>
              </div>
              <p className="text-muted-foreground text-xs mt-1">
                ≈ ${user?.balance ? (parseFloat(user.balance) * 0.1).toFixed(2) : '0.00'} USD
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Mining Progress */}
        <Card className="glass-card border-white/20">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Mining Progress</h3>
              <span data-testid="text-progress" className="text-sm text-muted-foreground">
                {Math.round(miningStatus?.progress || 0)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 mb-4">
              <div 
                className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-1000 mining-glow"
                style={{ width: `${miningStatus?.progress || 0}%` }}
              ></div>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {miningStatus?.canClaim ? (
                  <span data-testid="text-ready">Ready to claim!</span>
                ) : (
                  <span data-testid="text-countdown">Next reward in: {miningStatus?.timeRemaining}</span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Claim Button */}
        <Button
          onClick={handleClaim}
          disabled={!miningStatus?.canClaim || isMining || claimMutation.isPending}
          data-testid="button-claim"
          className={`w-full py-4 font-bold text-lg rounded-2xl transition-all duration-300 ${
            miningStatus?.canClaim && !isMining && !claimMutation.isPending
              ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transform hover:scale-105 mining-glow'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          {isMining || claimMutation.isPending ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Mining...
            </div>
          ) : miningStatus?.canClaim ? (
            <>
              <Coins className="w-5 h-5 mr-2" />
              Claim {miningStatus.reward} MTK
            </>
          ) : (
            'Wait for next reward'
          )}
        </Button>

        {/* Mining Animation */}
        {isMining && (
          <Card className="glass-card border-white/20">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <h3 className="font-semibold mb-2">Mining in Progress</h3>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-100"
                    style={{ width: `${miningProgress}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="glass-card border-white/20">
            <CardContent className="p-4 text-center">
              <p className="text-muted-foreground text-sm mb-1">Daily Reward</p>
              <p className="text-xl font-bold">
                {miningStatus?.reward || '50'} <span className="gradient-text">MTK</span>
              </p>
            </CardContent>
          </Card>
          <Card className="glass-card border-white/20">
            <CardContent className="p-4 text-center">
              <p className="text-muted-foreground text-sm mb-1">Streak</p>
              <p className="text-xl font-bold">
                {user?.streak || 0} <span className="text-primary">days</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
