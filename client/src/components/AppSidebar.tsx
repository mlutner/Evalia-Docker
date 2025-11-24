import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, LayoutDashboard, BarChart3, Users, BookOpen, FileText, Zap, Settings, ChevronLeft, ChevronRight, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import type { User as UserType } from "@shared/schema";
import evaliaLogo from "@assets/Heading (300 x 50 px) (1000 x 250 px) (3)_1763943705026.png";

interface AppSidebarProps {
  onNavigate?: () => void;
}

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const typedUser = user as UserType | null | undefined;

  const handleNavigation = (href: string) => {
    setLocation(href);
    onNavigate?.();
  };

  const handleLogout = () => {
    queryClient.clear();
    window.location.href = "/api/logout";
  };

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", tooltip: "Overview and key metrics" },
    { id: "surveys", label: "Surveys", icon: BarChart3, href: "/surveys", tooltip: "Create, manage, and analyze surveys" },
    { id: "respondents", label: "Respondent Groups", icon: Users, href: "/respondents", tooltip: "Manage respondent lists and segments" },
    { id: "templates", label: "Templates", icon: FileText, href: "/templates", tooltip: "Pre-built survey templates" },
    { id: "ai-assist", label: "AI Assist", icon: Zap, href: "/ai-assist", tooltip: "Generate surveys with AI" },
    { id: "scoring", label: "Scoring Models", icon: BookOpen, href: "/scoring", tooltip: "Set up scoring rules for questions" },
    { id: "settings", label: "Settings", icon: Settings, href: "/settings", tooltip: "Account and workspace settings" },
  ];

  const isActive = (href: string) => location === href;

  return (
    <aside className={`flex flex-col h-full transition-all duration-300 ${
      sidebarExpanded ? "w-56" : "w-20"
    }`} style={{ backgroundColor: 'var(--color-dark-navy)', borderRightColor: 'var(--color-border)', borderRightWidth: '1px' }}>
      {/* Header with Logo */}
      <div className="p-6 flex items-center justify-between">
        {sidebarExpanded && (
          <img src={evaliaLogo} alt="Evalia" className="h-8 object-contain" />
        )}
        <button
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
          style={{ color: 'var(--color-primary)' }}
          className="hover:bg-[var(--color-primary)]/10 p-1 rounded-[12px] transition-colors"
          data-testid="button-toggle-sidebar"
          title={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarExpanded ? <ChevronLeft className="w-6 h-6" strokeWidth={2} /> : <ChevronRight className="w-6 h-6" strokeWidth={2} />}
        </button>
      </div>
      {/* New Survey Button */}
      <div className="px-4 py-6">
        <Button
          onClick={() => handleNavigation("/builder")}
          className="w-full font-semibold transition-colors hover:bg-[#37C0A3] active:bg-[#1F6F78] border-0 outline-none"
          style={{ backgroundColor: '#2F8FA5', color: '#FFFFFF' }}
          size={sidebarExpanded ? "default" : "icon"}
          data-testid="button-new-survey-sidebar"
        >
          <Plus className="w-5 h-5" strokeWidth={2} />
          {sidebarExpanded && <span className="ml-2">New Survey</span>}
        </Button>
      </div>
      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.href)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-[12px] text-sm font-medium transition-colors group ${
                sidebarExpanded ? "" : "justify-center px-0"
              }`}
              style={{
                color: '#6A7789',
              }}
              data-testid={`nav-${item.id}`}
              title={item.tooltip || item.label}
            >
              <Icon className="w-6 h-6 flex-shrink-0" style={{ color: active ? '#2F8FA5' : '#6A7789' }} strokeWidth={2} />
              {sidebarExpanded && (
                <div className="flex flex-col flex-1">
                  <span style={{ color: active ? '#2F8FA5' : '#6A7789' }}>{item.label}</span>
                </div>
              )}
            </button>
          );
        })}
      </nav>
      {/* Footer: Account & Logout - Sticky */}
      {typedUser && (
        <div className="sticky bottom-0 z-10 px-3 py-4 space-y-2 border-t border-[rgba(255,255,255,0.1)] mt-auto" style={{ backgroundColor: 'var(--color-dark-navy)' }}>
          <Button
            onClick={() => handleNavigation("/account")}
            variant="ghost"
            className="w-full justify-start text-sm h-10"
            data-testid="button-account-sidebar"
          >
            <User className="w-5 h-5 mr-2" style={{ color: '#6A7789' }} />
            {sidebarExpanded && <span style={{ color: '#6A7789' }}>Account</span>}
          </Button>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-sm h-10"
            data-testid="button-logout-sidebar"
          >
            <LogOut className="w-5 h-5 mr-2" style={{ color: '#6A7789' }} />
            {sidebarExpanded && <span style={{ color: '#6A7789' }}>Logout</span>}
          </Button>
        </div>
      )}
    </aside>
  );
}
