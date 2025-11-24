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
    <header className="sticky top-0 z-50 w-full backdrop-blur supports-[backdrop-filter]:bg-[var(--color-surface)]/60" style={{ backgroundColor: 'var(--color-surface)', borderBottomColor: 'var(--color-border)', borderBottomWidth: '1px' }}>
      <div className="flex h-14 items-center justify-end pr-6 gap-3">
        {typedUser && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/account")}
              data-testid="button-account"
              className="px-3"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <span className="hidden sm:inline text-sm font-medium">Account</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              data-testid="button-logout"
              className="px-3"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-dark-navy)' }} strokeWidth={2} />
              <span className="hidden sm:inline ml-2 text-sm font-medium">Logout</span>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
