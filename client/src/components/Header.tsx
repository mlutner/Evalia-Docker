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
    <header className="sticky top-0 z-50 w-full bg-[#FFFFFF] dark:bg-[#0D1B2A] border-b border-[#E7EBF0] dark:border-[#1F3B58] backdrop-blur supports-[backdrop-filter]:bg-[#FFFFFF]/60 dark:supports-[backdrop-filter]:bg-[#0D1B2A]/60">
      <div className="flex h-14 items-center justify-end pr-6 gap-3">
        <div className="flex items-center gap-3">
          {typedUser && (
            <span className="hidden md:inline text-sm text-[#6B7785] font-medium" data-testid="text-username">
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
                className="text-[#6B7785] hover:text-[#1C2B36] hover:bg-[#1F8EFA]/8 px-3"
              >
                <span className="hidden sm:inline text-sm font-medium">Account</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                data-testid="button-logout"
                className="text-[#6B7785] hover:text-[#1C2B36] hover:bg-[#1F8EFA]/8 px-3"
              >
                <LogOut className="w-5 h-5 flex-shrink-0 text-[#0D1B2A]" strokeWidth={2} />
                <span className="hidden sm:inline ml-2 text-sm font-medium">Logout</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
