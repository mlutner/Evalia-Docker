import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus, LayoutDashboard, BarChart3, Users, BookOpen, FileText, Zap, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import evaliaLogo from "@assets/Heading (300 x 50 px) (1000 x 250 px) (3)_1763943705026.png";

export function AppSidebar() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [location, setLocation] = useLocation();

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { id: "surveys", label: "Surveys", icon: BarChart3, href: "/surveys" },
    { id: "respondents", label: "Respondents", icon: Users, href: "/respondents" },
    { id: "scoring", label: "Scoring Models", icon: BookOpen, href: "/scoring" },
    { id: "templates", label: "Templates", icon: FileText, href: "/templates" },
    { id: "ai-assist", label: "AI Assist", icon: Zap, href: "/ai-assist" },
    { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
  ];

  const isActive = (href: string) => location === href;

  return (
    <aside className={`flex flex-col transition-all duration-300 ${
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
          className="hover:bg-[var(--color-primary)]/10 p-1 rounded transition-colors"
          data-testid="button-toggle-sidebar"
          title={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarExpanded ? <ChevronLeft className="w-6 h-6" strokeWidth={2} /> : <ChevronRight className="w-6 h-6" strokeWidth={2} />}
        </button>
      </div>
      {/* New Survey Button */}
      <div className="px-4 py-6">
        <Button
          onClick={() => setLocation("/builder")}
          className="w-full font-semibold"
          style={{ backgroundColor: 'var(--color-accent-lime)', color: 'var(--color-dark-navy)' }}
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
              onClick={() => setLocation(item.href)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-md text-sm font-medium transition-all relative border-l-3 ${
                active ? "border-l-3" : "border-l-3 border-l-transparent"
              } ${sidebarExpanded ? "" : "justify-center px-0"}`}
              style={{
                color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                backgroundColor: active ? 'rgba(58, 141, 255, 0.08)' : 'transparent',
                borderLeftColor: active ? 'var(--color-primary)' : 'transparent',
              }}
              data-testid={`nav-${item.id}`}
              title={!sidebarExpanded ? item.label : ""}
            >
              <Icon className="w-6 h-6 flex-shrink-0" style={{ color: active ? 'var(--color-primary)' : 'var(--color-text-primary)' }} strokeWidth={2} />
              {sidebarExpanded && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
