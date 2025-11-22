import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
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
    queryClient.clear();
    window.location.href = "/api/logout";
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <button 
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 hover-elevate rounded-lg p-1 -ml-1 py-3"
          data-testid="link-home"
        >
          <img src={logoUrl} alt="Evalia" className="h-[46px]" />
        </button>
        
        <div className="flex items-center gap-2 sm:gap-3">
          {typedUser && (
            <span className="hidden md:inline text-sm text-muted-foreground" data-testid="text-username">
              {typedUser.email || `${typedUser.firstName || ''} ${typedUser.lastName || ''}`.trim() || 'User'}
            </span>
          )}
          {typedUser && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/account")}
                data-testid="button-account"
                className="px-2 sm:px-3"
              >
                <span className="hidden sm:inline">Account</span>
                <span className="sm:hidden">⚙️</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                data-testid="button-logout"
                className="px-2 sm:px-3"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline ml-2">Logout</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
