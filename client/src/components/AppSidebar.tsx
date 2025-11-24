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
    <aside className={`bg-evalia-navy border-r border-slate-700 flex flex-col transition-all duration-300 ${
      sidebarExpanded ? "w-56" : "w-20"
    }`}>
      {/* Header with Logo */}
      <div className="p-4 pt-6 flex items-center justify-between bg-[#0e1729]">
        {sidebarExpanded && (
          <img src={evaliaLogo} alt="Evalia" className="h-8 object-contain" />
        )}
        <button
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
          className="text-white hover:bg-white/10 p-1 rounded transition-colors"
          data-testid="button-toggle-sidebar"
        >
          {sidebarExpanded ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>
      {/* New Survey Button */}
      <div className="px-3 py-8 bg-[#0e1729]">
        <Button
          onClick={() => setLocation("/builder")}
          className="w-full bg-evalia-lime hover:bg-evalia-lime/90 text-slate-900 border-0 font-semibold"
          size={sidebarExpanded ? "default" : "icon"}
          data-testid="button-new-survey-sidebar"
        >
          <Plus className="w-4 h-4" />
          {sidebarExpanded && <span className="ml-2">New Survey</span>}
        </Button>
      </div>
      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto bg-[#0e1729]">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <button
              key={item.id}
              onClick={() => setLocation(item.href)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-all ${
                active
                  ? "text-white"
                  : "text-slate-500 hover:text-slate-400"
              } ${sidebarExpanded ? "" : "justify-center"}`}
              data-testid={`nav-${item.id}`}
              title={!sidebarExpanded ? item.label : ""}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {sidebarExpanded && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
