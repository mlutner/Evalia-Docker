import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@shared/schema";
import logoUrl from "@assets/Heading (300 x 50 px) (1000 x 250 px) (2)_1762359727994.png";

interface HeaderProps {
  showActions?: boolean;
}

export default function Header({ showActions = true }: HeaderProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const typedUser = user as User | null | undefined;

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <button 
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 hover-elevate rounded-lg p-1 -ml-1"
          data-testid="link-home"
        >
          <img src={logoUrl} alt="Evalia" className="h-8" />
        </button>
        
        <div className="flex items-center gap-3">
          {typedUser && (
            <span className="text-sm text-muted-foreground" data-testid="text-username">
              {typedUser.email || `${typedUser.firstName || ''} ${typedUser.lastName || ''}`.trim() || 'User'}
            </span>
          )}
          {showActions && (
            <Button onClick={() => setLocation("/builder")} data-testid="button-create-survey">
              Create Survey
            </Button>
          )}
          {typedUser && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
