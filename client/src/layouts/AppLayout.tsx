import { ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import Header from "@/components/Header";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background dark:bg-slate-950 flex">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        {children}
      </div>
    </div>
  );
}
