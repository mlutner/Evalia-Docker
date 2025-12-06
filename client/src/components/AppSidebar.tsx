import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, CaretLeft, CaretRight, SignOut, UserCircle, Bug } from "phosphor-react";
import { SquaresFour, ChartBar, Users, Book, TextT, Lightning, Gear, Wrench } from "phosphor-react";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";
import type { User as UserType } from "@shared/schema";
import evaliaLogo from "@assets/Heading (300 x 50 px) (1000 x 250 px) (3)_1763943705026.png";
import { APP_VERSION } from "@shared/version";
import { CreateSurveyModal } from "./builder-v2/CreateSurveyModal";

interface AppSidebarProps {
  onNavigate?: () => void;
}

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const typedUser = user as UserType | null | undefined;

  const handleNavigation = (href: string) => {
    setLocation(href);
    onNavigate?.();
  };

  const handleNewSurvey = () => {
    setShowCreateModal(true);
  };

  const handleLogout = () => {
    queryClient.clear();
    window.location.href = "/api/logout";
  };

  const sidebarItems = [
    { id: "home", label: "Home", icon: SquaresFour, href: "/dashboard", tooltip: "Surveys overview and metrics" },
    { id: "analytics", label: "Analytics", icon: ChartBar, href: "/analytics", tooltip: "View survey analytics and insights" },
    { id: "templates", label: "Templates", icon: TextT, href: "/templates", tooltip: "Pre-built survey templates" },
    { id: "ai-assist", label: "AI Assist", icon: Lightning, href: "/ai-assist", tooltip: "Generate surveys with AI" },
    { id: "settings", label: "Settings", icon: Gear, href: "/settings", tooltip: "Account and workspace settings" },
  ];

  // Check if current location matches sidebar item (handle dashboard/surveys both mapping to home)
  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return location === "/dashboard" || location === "/surveys";
    }
    return location === href;
  };

  return (
    <aside className={`flex flex-col h-screen transition-all duration-300 ${
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
          {sidebarExpanded ? <CaretLeft className="w-6 h-6" weight="bold" /> : <CaretRight className="w-6 h-6" weight="bold" />}
        </button>
      </div>
      {/* New Survey Button */}
      <div className="px-4 py-6">
        <Button
          onClick={handleNewSurvey}
          className="w-full font-semibold transition-colors hover:bg-[#37C0A3] active:bg-[#1F6F78] border-0 outline-none"
          style={{ backgroundColor: '#2F8FA5', color: '#FFFFFF' }}
          size={sidebarExpanded ? "default" : "icon"}
          data-testid="button-new-survey-sidebar"
        >
          <Plus className="w-5 h-5" weight="bold" />
          {sidebarExpanded && <span className="ml-2">New Survey</span>}
        </Button>
      </div>

      {/* Create Survey Modal */}
      <CreateSurveyModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
      />
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
              data-testid={`nav-${item.id}`}
              style={{
                color: '#6A7789',
              }}
              title={item.tooltip || item.label}
            >
              <Icon size={24} weight="bold" style={{ color: active ? '#2F8FA5' : '#6A7789' }} className="flex-shrink-0" />
              {sidebarExpanded && (
                <div className="flex flex-col flex-1">
                  <span style={{ color: active ? '#2F8FA5' : '#6A7789' }}>{item.label}</span>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Dev Tools - Available in dev mode OR when VITE_ENABLE_DEV_TOOLS is set */}
      {(import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true') && (
        <div className="px-3 py-2 border-t border-[rgba(255,255,255,0.1)]">
          {sidebarExpanded && (
            <div className="text-xs text-[#4A5568] uppercase tracking-wider px-4 py-2">
              Dev Tools
            </div>
          )}
          <button
            onClick={() => handleNavigation("/dev/inspector")}
            className={`w-full flex items-center gap-4 px-4 py-2 rounded-[12px] text-sm font-medium transition-colors ${
              sidebarExpanded ? "" : "justify-center px-0"
            }`}
            style={{ color: '#6A7789' }}
            title="Survey Inspector"
          >
            <Wrench size={20} weight="bold" style={{ color: location === '/dev/inspector' ? '#f59e0b' : '#6A7789' }} />
            {sidebarExpanded && (
              <span style={{ color: location === '/dev/inspector' ? '#f59e0b' : '#6A7789' }}>Inspector</span>
            )}
          </button>
          <button
            onClick={() => handleNavigation("/dev/analytics-inspector")}
            className={`w-full flex items-center gap-4 px-4 py-2 rounded-[12px] text-sm font-medium transition-colors ${
              sidebarExpanded ? "" : "justify-center px-0"
            }`}
            style={{ color: '#6A7789' }}
            title="Analytics Inspector"
          >
            <Bug size={20} weight="bold" style={{ color: location === '/dev/analytics-inspector' ? '#f59e0b' : '#6A7789' }} />
            {sidebarExpanded && (
              <span style={{ color: location === '/dev/analytics-inspector' ? '#f59e0b' : '#6A7789' }}>Analytics Debug</span>
            )}
          </button>
          <button
            onClick={() => handleNavigation("/dev/scoring-debug")}
            className={`w-full flex items-center gap-4 px-4 py-2 rounded-[12px] text-sm font-medium transition-colors ${
              sidebarExpanded ? "" : "justify-center px-0"
            }`}
            style={{ color: '#6A7789' }}
            title="Scoring Debug"
          >
            <Wrench size={20} weight="bold" style={{ color: location.startsWith('/dev/scoring-debug') ? '#f59e0b' : '#6A7789' }} />
            {sidebarExpanded && (
              <span style={{ color: location.startsWith('/dev/scoring-debug') ? '#f59e0b' : '#6A7789' }}>Scoring Debug</span>
            )}
          </button>
        </div>
      )}

      {/* Footer: Account & Logout - Sticky */}
      {typedUser && (
        <div className="sticky bottom-0 z-10 px-3 py-4 space-y-2 border-t border-[rgba(255,255,255,0.1)] mt-auto" style={{ backgroundColor: 'var(--color-dark-navy)' }}>
          <Button
            onClick={() => handleNavigation("/account")}
            variant="ghost"
            className="w-full justify-start text-sm h-10"
            data-testid="button-account-sidebar"
          >
            <UserCircle size={20} weight="bold" style={{ color: '#6A7789' }} className="mr-2" />
            {sidebarExpanded && <span style={{ color: '#6A7789' }}>Account</span>}
          </Button>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-sm h-10"
            data-testid="button-logout-sidebar"
          >
            <SignOut size={20} weight="bold" style={{ color: '#6A7789' }} className="mr-2" />
            {sidebarExpanded && <span style={{ color: '#6A7789' }}>Logout</span>}
          </Button>
          {/* Version Display */}
          <div 
            className="text-xs pt-2 text-center text-[#ffffff]"
            style={{ color: '#4A5568', opacity: 0.6 }}
            data-testid="text-app-version"
          >
            {sidebarExpanded ? `v${APP_VERSION}` : `v${APP_VERSION.split('.')[0]}`}
          </div>
        </div>
      )}
    </aside>
  );
}
