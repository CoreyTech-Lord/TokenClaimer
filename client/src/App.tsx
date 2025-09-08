import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Tasks from "@/pages/tasks";
import Referrals from "@/pages/referrals";
import Leaderboard from "@/pages/leaderboard";
import Wallet from "@/pages/wallet";
import Navigation from "@/components/ui/navigation";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-purple-900 to-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/tasks" component={Tasks} />
          <Route path="/referrals" component={Referrals} />
          <Route path="/leaderboard" component={Leaderboard} />
          <Route path="/wallet" component={Wallet} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-purple-900 to-background text-foreground">
        <Router />
        {isAuthenticated && <Navigation />}
      </div>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
