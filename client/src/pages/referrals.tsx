import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Share2, Users, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ReferralStats {
  count: number;
  totalEarned: string;
  recentReferrals: Array<{
    id: string;
    username: string;
    email: string;
    createdAt: string;
  }>;
}

export default function Referrals() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: stats, isLoading } = useQuery<ReferralStats>({
    queryKey: ["/api/referrals/stats"],
  });

  const referralLink = user?.referralCode 
    ? `${window.location.origin}/ref/${user.referralCode}`
    : '';

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const shareToSocial = (platform: string) => {
    const text = `Join me on MyToken and start mining crypto! Use my referral code: ${user?.referralCode}`;
    const url = referralLink;
    
    let shareUrl = '';
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="pb-20 pt-12 px-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading referral data...</p>
        </div>
      </div>
    );
  }

  const formatBalance = (balance: string) => {
    return parseFloat(balance).toLocaleString();
  };

  return (
    <div className="pb-20 pt-12 px-6">
      <div className="text-center py-4 mb-6">
        <h2 data-testid="page-title" className="text-2xl font-bold gradient-text mb-2">Referral Program</h2>
        <p className="text-muted-foreground">Earn 10% of your referrals' mining rewards</p>
      </div>

      <div className="space-y-6">
        {/* Referral Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="glass-card border-white/20">
            <CardContent className="p-4 text-center">
              <p className="text-muted-foreground text-sm mb-1">Total Referrals</p>
              <p data-testid="text-referral-count" className="text-2xl font-bold gradient-text">
                {stats?.count || 0}
              </p>
            </CardContent>
          </Card>
          <Card className="glass-card border-white/20">
            <CardContent className="p-4 text-center">
              <p className="text-muted-foreground text-sm mb-1">Earned from Refs</p>
              <p data-testid="text-referral-earned" className="text-2xl font-bold gradient-text">
                {stats?.totalEarned ? formatBalance(stats.totalEarned) : 0} MTK
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Referral Code */}
        <Card className="glass-card border-white/20">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Your Referral Code</h3>
            <div className="bg-muted rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <span data-testid="text-referral-code" className="font-mono text-lg">
                  {user?.referralCode || 'Loading...'}
                </span>
                <Button
                  onClick={() => copyToClipboard(user?.referralCode || '', 'Referral code')}
                  data-testid="button-copy-code"
                  size="sm"
                  className="bg-primary text-primary-foreground hover:opacity-90"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Share this code with friends to earn rewards!</p>
          </CardContent>
        </Card>

        {/* Referral Link */}
        <Card className="glass-card border-white/20">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Referral Link</h3>
            <div className="bg-muted rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2">
                <span data-testid="text-referral-link" className="text-sm flex-1 truncate">
                  {referralLink}
                </span>
                <Button
                  onClick={() => copyToClipboard(referralLink, 'Referral link')}
                  data-testid="button-copy-link"
                  size="sm"
                  className="bg-primary text-primary-foreground hover:opacity-90"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => shareToSocial('whatsapp')}
                data-testid="button-share-whatsapp"
                className="flex-1 bg-green-600 text-white hover:opacity-90"
                size="sm"
              >
                <i className="fab fa-whatsapp mr-2" />
                WhatsApp
              </Button>
              <Button
                onClick={() => shareToSocial('twitter')}
                data-testid="button-share-twitter"
                className="flex-1 bg-blue-500 text-white hover:opacity-90"
                size="sm"
              >
                <i className="fab fa-twitter mr-2" />
                Twitter
              </Button>
              <Button
                onClick={() => shareToSocial('telegram')}
                data-testid="button-share-telegram"
                className="flex-1 bg-blue-600 text-white hover:opacity-90"
                size="sm"
              >
                <i className="fab fa-telegram mr-2" />
                Telegram
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Referrals */}
        <Card className="glass-card border-white/20">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Recent Referrals</h3>
            <div className="space-y-3">
              {stats?.recentReferrals?.length ? (
                stats.recentReferrals.map((referral) => (
                  <div key={referral.id} className="flex items-center justify-between" data-testid={`referral-item-${referral.id}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                        <span className="text-primary-foreground text-sm font-semibold">
                          {(referral.username || referral.email)?.[0]?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <div>
                        <p data-testid={`text-referral-name-${referral.id}`} className="font-medium">
                          {referral.username || referral.email?.split('@')[0] || 'Anonymous'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Joined {new Date(referral.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary">Active</p>
                      <p className="text-xs text-muted-foreground">Member</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">No Referrals Yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Share your referral code to start earning from referrals!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
