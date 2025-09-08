import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Medal, Award, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface LeaderboardUser {
  id: string;
  username: string;
  email: string;
  balance: string;
  streak: number;
  rank: number;
}

export default function Leaderboard() {
  const { user } = useAuth();

  const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery<LeaderboardUser[]>({
    queryKey: ["/api/leaderboard"],
  });

  const { data: userRankData, isLoading: rankLoading } = useQuery<{ rank: number }>({
    queryKey: ["/api/leaderboard/rank"],
  });

  const formatBalance = (balance: string) => {
    return parseFloat(balance).toLocaleString();
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-500" />;
      default:
        return (
          <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
            <span className="text-xs font-bold">{rank}</span>
          </div>
        );
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-yellow-600';
      case 2:
        return 'from-gray-400 to-gray-600';
      case 3:
        return 'from-orange-400 to-orange-600';
      default:
        return 'from-muted to-muted';
    }
  };

  if (leaderboardLoading || rankLoading) {
    return (
      <div className="pb-20 pt-12 px-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 pt-12 px-6">
      <div className="text-center py-4 mb-6">
        <h2 data-testid="page-title" className="text-2xl font-bold gradient-text mb-2">Leaderboard</h2>
        <p className="text-muted-foreground">Top miners this month</p>
      </div>

      <div className="space-y-6">
        {/* User Rank */}
        <Card className="glass-card border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                  <span data-testid="text-user-rank" className="text-primary-foreground font-bold text-lg">
                    #{userRankData?.rank || 0}
                  </span>
                </div>
                <div>
                  <p className="font-semibold">Your Rank</p>
                  <p data-testid="text-user-balance" className="text-sm text-muted-foreground">
                    {user?.balance ? formatBalance(user.balance) : '0'} MTK
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-primary font-semibold">
                  {userRankData?.rank ? `${userRankData.rank}${getOrdinalSuffix(userRankData.rank)}` : 'Unranked'}
                </p>
                <p className="text-xs text-muted-foreground">of {leaderboard.length} miners</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Miners */}
        <Card className="glass-card border-white/20">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Top Miners</h3>
            <div className="space-y-4">
              {leaderboard.slice(0, 10).map((miner) => (
                <div key={miner.id} className="flex items-center justify-between" data-testid={`leaderboard-item-${miner.rank}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 bg-gradient-to-r ${getRankBadgeColor(miner.rank)} rounded-full flex items-center justify-center`}>
                      {miner.rank <= 3 ? (
                        getRankIcon(miner.rank)
                      ) : (
                        <span className="text-white font-bold text-sm">{miner.rank}</span>
                      )}
                    </div>
                    <div>
                      <p data-testid={`text-miner-name-${miner.rank}`} className="font-medium">
                        {miner.username || miner.email?.split('@')[0] || 'Anonymous'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Streak: {miner.streak || 0} days
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p data-testid={`text-miner-balance-${miner.rank}`} className="font-semibold">
                      {formatBalance(miner.balance)} MTK
                    </p>
                    <p className="text-xs text-muted-foreground">Total earned</p>
                  </div>
                </div>
              ))}

              {leaderboard.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">No Miners Yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Be the first to start mining and claim the top spot!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard Categories */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="glass-card border-white/20">
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-1">Best Streak</p>
              <p data-testid="text-best-streak" className="font-bold">
                {Math.max(...leaderboard.map(u => u.streak || 0), 0)} days
              </p>
            </CardContent>
          </Card>
          <Card className="glass-card border-white/20">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-accent mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-1">Total Miners</p>
              <p data-testid="text-total-miners" className="font-bold">{leaderboard.length}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) {
    return 'st';
  }
  if (j === 2 && k !== 12) {
    return 'nd';
  }
  if (j === 3 && k !== 13) {
    return 'rd';
  }
  return 'th';
}
