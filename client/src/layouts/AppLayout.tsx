import { ReactNode, useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import Header from "@/components/Header";
import { theme } from "@/theme";
import { APP_VERSION } from "@shared/version";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ backgroundColor: theme.backgrounds.page }} className="min-h-screen flex flex-col lg:flex-row">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed lg:relative left-0 top-0 h-screen lg:h-auto z-40 transform lg:transform-none transition-transform duration-300 overflow-hidden ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        <AppSidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col w-full lg:w-auto">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
        <div className="flex-1 relative">
          {children}
        </div>
        {/* Version footer */}
        <div className="px-4 py-2 text-right">
          <span 
            className="text-xs opacity-40 hover:opacity-70 transition-opacity cursor-default"
            style={{ color: theme.text.secondary }}
            data-testid="text-app-version"
          >
            v{APP_VERSION}
          </span>
        </div>
      </div>
    </div>
  );
}
