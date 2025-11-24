import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";
import logoUrl from "@assets/Heading (300 x 50 px) (1000 x 250 px) (2)_1762359727994.png";

interface HeaderProps {
  showActions?: boolean;
  onMenuClick?: () => void;
  sidebarOpen?: boolean;
}

export default function Header({ showActions = true, onMenuClick, sidebarOpen = false }: HeaderProps) {
  return (
    <header className="h-16 border-b flex items-center px-4 lg:px-6" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-neutral-surface)' }}>
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 hover:bg-accent rounded-md transition-colors"
        data-testid="button-menu-mobile"
        title="Toggle menu"
      >
        <Menu className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
      </button>
      <div className="flex-1" />
    </header>
  );
}
