import { ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import Header from "@/components/Header";
import { theme } from "@/theme";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div style={{ backgroundColor: theme.backgrounds.page }} className="min-h-screen flex">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        {children}
      </div>
    </div>
  );
}
