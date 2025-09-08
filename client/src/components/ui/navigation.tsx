import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Pickaxe, CheckSquare, Users, Trophy, Wallet } from "lucide-react";

const navItems = [
  { path: "/", icon: Pickaxe, label: "Mine", id: "mining" },
  { path: "/tasks", icon: CheckSquare, label: "Tasks", id: "tasks" },
  { path: "/referrals", icon: Users, label: "Referrals", id: "referrals" },
  { path: "/leaderboard", icon: Trophy, label: "Ranks", id: "leaderboard" },
  { path: "/wallet", icon: Wallet, label: "Wallet", id: "wallet" },
];

export default function Navigation() {
  const [location, setLocation] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-card border-t border-border z-40">
      <div className="flex items-center justify-around py-3 px-2">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={() => setLocation(item.path)}
              data-testid={`nav-${item.id}`}
              className={`flex flex-col items-center gap-1 px-3 py-2 h-auto transition-colors ${
                isActive 
                  ? 'text-primary hover:text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
