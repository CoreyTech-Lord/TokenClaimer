import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Coins, Users, Trophy, Wallet } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="pt-12 pb-8 px-6 text-center">
        <h1 data-testid="app-title" className="text-4xl font-bold gradient-text mb-4">MyToken</h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Start mining crypto rewards daily. Join thousands of miners earning MTK tokens.
        </p>
      </header>

      {/* Hero Section */}
      <section className="px-6 mb-12 flex-1">
        <div className="max-w-md mx-auto space-y-8">
          {/* Main CTA */}
          <Card className="glass-card border-white/20">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6 mining-glow">
                <Coins className="w-10 h-10 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Start Mining Today</h2>
              <p className="text-muted-foreground mb-6">
                Claim 50 MTK tokens every 24 hours. Build your streak and maximize your earnings.
              </p>
              <Button 
                onClick={handleLogin}
                data-testid="button-login"
                className="w-full py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold text-lg rounded-2xl hover:opacity-90 transform hover:scale-105 transition-all duration-300 mining-glow"
              >
                Start Mining Now
              </Button>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="glass-card border-white/20">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Referral System</h3>
                <p className="text-sm text-muted-foreground">Earn 10% from referrals</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/20">
              <CardContent className="p-6 text-center">
                <Trophy className="w-8 h-8 text-accent mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Complete Tasks</h3>
                <p className="text-sm text-muted-foreground">Bonus rewards available</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/20">
              <CardContent className="p-6 text-center">
                <Wallet className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Base Network</h3>
                <p className="text-sm text-muted-foreground">Connect your wallet</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/20">
              <CardContent className="p-6 text-center">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-sm">24h</span>
                </div>
                <h3 className="font-semibold mb-2">Daily Rewards</h3>
                <p className="text-sm text-muted-foreground">Consistent earnings</p>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <Card className="glass-card border-white/20">
            <CardContent className="p-6">
              <h3 className="font-semibold text-center mb-4">Platform Stats</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold gradient-text">1,247</p>
                  <p className="text-xs text-muted-foreground">Active Miners</p>
                </div>
                <div>
                  <p className="text-2xl font-bold gradient-text">₿50K</p>
                  <p className="text-xs text-muted-foreground">Total Mined</p>
                </div>
                <div>
                  <p className="text-2xl font-bold gradient-text">99.9%</p>
                  <p className="text-xs text-muted-foreground">Uptime</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 pb-12 text-center">
        <p className="text-muted-foreground text-sm">
          Secure • Decentralized • Profitable
        </p>
      </footer>
    </div>
  );
}
